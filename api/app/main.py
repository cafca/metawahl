#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Metawahl API

"""
import os
import sys
import logging
import json
import requests
import traceback
import lxml.html

from datetime import datetime
from logging.handlers import RotatingFileHandler
from flask import (
    Flask,
    jsonify,
    request,
    send_file,
    g,
    make_response,
    abort,
    Response,
    url_for,
)
from flask_cors import CORS
from flask_restful import Api, Resource

import controllers
from middleware import api
from middleware.error import exceptions, page_not_found
from middleware.logger import logger, log_request_info, before_request, after_request
from middleware.json_response import json_response
from middleware.cache import is_cache_filler, cache_filler
from services import db, cache

import config

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

    CORS(app, resources={r"{}/*".format(API_ROOT): {"origins": "*"}})

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

    api.add_resource(controllers.BaseView, "/{}/base".format(API_VERSION))
    api.add_resource(controllers.Elections, "/{}/elections/".format(API_VERSION))
    api.add_resource(controllers.ElectionView, "/{}/elections/<int:wom_id>".format(API_VERSION))
    api.add_resource(controllers.TagsView, "/{}/tags/".format(API_VERSION))
    api.add_resource(controllers.TagsDownload, "/{}/tags.json".format(API_VERSION))
    api.add_resource(controllers.TagView, "/{}/tags/<string:slug>".format(API_VERSION))
    api.add_resource(controllers.ThesisView, "/{}/thesis/<string:thesis_id>".format(API_VERSION))
    api.add_resource(controllers.ThesisTagsView, "/{}/thesis/<string:thesis_id>/tags/".format(API_VERSION))
    api.add_resource(
        controllers.Quiz,
        "/{}/quiz/<int:election_num>".format(API_VERSION),
        "/{}/quiz/<int:election_num>/<int:thesis_num>".format(API_VERSION),
    )

    api.add_resource(controllers.SitemapView, "/{}/sitemap.xml".format(API_VERSION))

    # MUST be after route declaration
    api.init_app(app)

    return app


if __name__ == "__main__":
    port = int(os.environ.get("METAWAHL_PORT", 9000))
    app = create_app()
    app.run(host="0.0.0.0", port=port)
