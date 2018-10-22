#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Middleware to cache whole requests."""

import logger

from flask import request
from functools import wraps

from services import cache


def is_cache_filler():
    return request.args.get("force_cache_miss") is not None


def cache_filler():
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if is_cache_filler():
                logger.debug("Forcing cache miss for {}".format(request.path))
                cache.delete("view/{}".format(request.path))
            return f(*args, **kwargs)

        return decorated_function

    return decorator
