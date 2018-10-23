#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Logging middleware."""

import time
from flask import g, request
from datetime import datetime
from pprint import pformat

from services.logger import logger


def log_request_info(name, request):
    # logger.info("{} API".format(name))
    jsond = request.get_json()
    if jsond:
        logger.debug("Data: {}".format(pformat(jsond)))


def before_request():
    # Measure request timing
    # https://gist.github.com/lost-theory/4521102
    g.request_start_time = time.time()
    g.request_time = lambda: "%.5fs" % (time.time() - g.request_start_time)


def after_request(response):
    # This IF avoids the duplication of registry in the log,
    # since that 500 is already logged via @app.errorhandler.
    if response.status_code != 500:
        ts = datetime.utcnow().strftime("[%Y-%b-%d %H:%M]")
        logger.debug(
            "%s %s %s %s %s",
            request.remote_addr,
            request.method,
            request.scheme,
            request.full_path,
            response.status,
        )
    return response
