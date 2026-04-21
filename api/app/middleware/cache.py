#!/usr/bin/env python
"""Middleware to cache whole requests."""

import logging
from functools import wraps

from flask import request
from services import cache


def is_cache_filler():
    return request.args.get("force_cache_miss") is not None


def cache_filler():
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if is_cache_filler():
                logging.debug(f"Forcing cache miss for {request.path}")
                cache.delete(f"view/{request.path}")
            return f(*args, **kwargs)

        return decorated_function

    return decorator
