#!/usr/bin/env python3

"""
Metawahl API

"""
import logging
import os
from logging.handlers import RotatingFileHandler

import config
import controllers
from flask import Flask
from flask_cors import CORS
from middleware.error import exceptions, page_not_found
from middleware.logger import after_request, before_request, logger
from services import cache, db

API_NAME = config.API_NAME
API_FULL_NAME = config.API_FULL_NAME
API_VERSION = config.API_VERSION
API_ROOT = config.API_ROOT
SITE_ROOT = config.SITE_ROOT


def create_app(config=None):
    app = Flask(__name__)
    app.config.update(config or {})

    try:
        app.config.from_envvar("METAWAHL_CONFIG")
    except RuntimeError as e:
        logger.error(e)
        quit()

    db.init_app(app)
    cache.init_app(app, config=app.config)

    CORS(app, resources={rf"{API_ROOT}/*": {"origins": "*"}})

    handler = RotatingFileHandler(
        app.config.get("METAWAHL_API_LOGFILE", None) or "../flask_api.log",
        backupCount=3,
    )
    app.logger.addHandler(handler)
    app.logger.setLevel(logging.INFO)

    app.before_request(before_request)
    app.after_request(after_request)

    app.errorhandler(Exception)(exceptions)
    app.errorhandler(404)(page_not_found)

    prefix = f"/{API_VERSION}"
    app.register_blueprint(controllers.base_bp, url_prefix=prefix)
    app.register_blueprint(controllers.election_bp, url_prefix=prefix)
    app.register_blueprint(controllers.tags_bp, url_prefix=prefix)
    app.register_blueprint(controllers.thesis_bp, url_prefix=prefix)
    app.register_blueprint(controllers.quiz_bp, url_prefix=prefix)
    app.register_blueprint(controllers.sitemap_bp, url_prefix=prefix)

    return app


if __name__ == "__main__":
    port = int(os.environ.get("METAWAHL_PORT", 9000))
    app = create_app()
    app.run(host="0.0.0.0", port=port)
