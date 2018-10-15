#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Middleware for providing JSON encoded responses."""

import config
from flask import g, jsonify


def json_response(data, filename=None, status=200):
    data["meta"] = {
        "api": config.API_FULL_NAME,
        "render_time": g.request_time(),
        "license": "Please see https://github.com/ciex/metawahl/master/LICENSE \
for licensing information"
    }

    rv = jsonify(data)
    rv.cache_control.max_age = 300
    rv.status_code = status

    if filename is not None:
        rv.headers['Content-Type'] = 'text/json'
        rv.headers['Content-Disposition'] = \
            'attachment; filename={}'.format(filename)

    return rv
