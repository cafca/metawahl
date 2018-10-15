#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Error handler middleware."""

import traceback
from datetime import datetime
from flask import request

from services.logger import logger
from middleware.json_response import json_response


def exceptions(e):
    ts = datetime.utcnow().strftime('[%Y-%b-%d %H:%M]')
    tb = traceback.format_exc()
    logger.error('%s %s %s %s %s 5xx INTERNAL SERVER ERROR\n%s',
                 ts,
                 request.remote_addr,
                 request.method,
                 request.scheme,
                 request.full_path,
                 tb)

    return json_response(
        {"error": "AAAHH! Serverfehler. Rute ist gezückt, Computer wird bestraft."},
        status=500
    )


def page_not_found(e):
    return json_response({"error": "Ressource not found"}, status=404)
