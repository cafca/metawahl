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
from flask import Flask, jsonify, request, send_file, g, make_response, abort, Response
from flask_cors import CORS
from flask_restplus import Api
from pprint import pformat

import controllers
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

    api = Api(app)

    CORS(app)

    handler = RotatingFileHandler(
        app.config.get("METAWAHL_API_LOGFILE", None) or "../flask_api.log",
        backupCount=3)
    app.logger.addHandler(handler)
    app.logger.setLevel(logging.INFO)

    # Register logger
    app.before_request(before_request)
    app.after_request(after_request)

    app.errorhandler(Exception)(exceptions)
    app.errorhandler(404)(page_not_found)

    api.add_resource(controllers.BaseData, API_ROOT + '/base')

    app.route(API_ROOT + "/occasions/",
              methods=["GET"])(controllers.occasions)

    app.route(API_ROOT + "/occasions/<int:wom_id>",
              methods=["GET"])(controllers.occasion)

    app.route(API_ROOT + "/tags.json",
              methods=["GET"],
              defaults={'filename': 'tags.json'})(controllers.tags)

    app.route(API_ROOT + "/tags/",
              methods=["GET"])(controllers.tags)

    app.route(API_ROOT + "/tags/<string:tag_title>",
              methods=["GET", "DELETE"])(controllers.tag)

    app.route(API_ROOT + '/sitemap.xml',
              methods=["GET"])(controllers.sitemap)

    app.route(API_ROOT + "/thesis/<string:thesis_id>",
              methods=["GET"])(controllers.thesis)

    app.route(API_ROOT + "/thesis/<string:thesis_id>/tags/",
              methods=["POST"])(controllers.thesis_tags)

    app.route(API_ROOT + "/react/<string:endpoint>",
              methods=["POST"])(controllers.react)

    return app


if __name__ == "__main__":
    port = int(os.environ.get("METAWAHL_PORT", 9000))
    app = create_app()
    app.run(host="0.0.0.0", port=port)
