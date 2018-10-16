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
from flask_restplus import Api, Namespace
from pprint import pformat

import controllers
from middleware.api import api
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

    api.init_app(app)

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

    ns = Namespace('Public v2', path=API_ROOT)
    ns.add_resource(controllers.BaseView, '/base')
    ns.add_resource(controllers.Occasions, '/occasions/')
    ns.add_resource(controllers.OccasionView, '/occasions/<int:wom_id>')
    ns.add_resource(controllers.TagsView, '/tags/')
    ns.add_resource(controllers.TagView, '/tags/<string:tag_title>')
    ns.add_resource(controllers.ThesisView, '/thesis/<string:thesis_id>"')
    ns.add_resource(controllers.ReactView, '/react/<string:endpoint>')
    api.add_namespace(ns)

    ns_priv = Namespace('Private v2', path=API_ROOT,
                        description='For site administration')
    ns_priv.add_resource(controllers.ThesisTagsView,
                         '/thesis/<string:thesis_id>/tags/')
    api.add_namespace(ns_priv)

    # downloads = Namespace('Downloads', description='Downloadable JSON files')
    # downloads.add_resource(controllers.Occasions, '/tags.json', )
    # api.add_namespace(downloads)

    extra = Namespace("Sitemap", path='/')
    extra.add_resource(controllers.SitemapView, '/sitemap.xml')
    api.add_namespace(extra)

    return app


if __name__ == "__main__":
    port = int(os.environ.get("METAWAHL_PORT", 9000))
    app = create_app()
    app.run(host="0.0.0.0", port=port)
