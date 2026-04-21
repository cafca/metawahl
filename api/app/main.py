#!/usr/bin/env python3

"""
Metawahl API

"""
import logging
import os
from logging.handlers import RotatingFileHandler

import config
import controllers
from flask import (
    Flask,
)
from flask_cors import CORS
from middleware import api
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

    # Register logger
    app.before_request(before_request)
    app.after_request(after_request)

    app.errorhandler(Exception)(exceptions)
    app.errorhandler(404)(page_not_found)

    api.add_resource(controllers.BaseView, f"/{API_VERSION}/base")
    api.add_resource(controllers.Elections, f"/{API_VERSION}/elections/")
    api.add_resource(controllers.ElectionView, f"/{API_VERSION}/elections/<int:wom_id>")
    api.add_resource(controllers.TagsView, f"/{API_VERSION}/tags/")
    api.add_resource(controllers.TagsDownload, f"/{API_VERSION}/tags.json")
    api.add_resource(controllers.TagView, f"/{API_VERSION}/tags/<string:slug>")
    api.add_resource(controllers.ThesisView, f"/{API_VERSION}/thesis/<string:thesis_id>")
    api.add_resource(controllers.ThesisTagsView, f"/{API_VERSION}/thesis/<string:thesis_id>/tags/")
    api.add_resource(
        controllers.Quiz,
        f"/{API_VERSION}/quiz/<int:election_num>",
        f"/{API_VERSION}/quiz/<int:election_num>/<int:thesis_num>",
    )

    api.add_resource(controllers.SitemapView, f"/{API_VERSION}/sitemap.xml")

    # MUST be after route declaration
    api.init_app(app)

    return app


if __name__ == "__main__":
    port = int(os.environ.get("METAWAHL_PORT", 9000))
    app = create_app()
    app.run(host="0.0.0.0", port=port)
