#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Metawahl Flask-SQLAlchemy models."""

def dt_string(dt):
    """Return iso string representation of a datetime including tz."""
    return dt.strftime("%Y-%m-%d %H:%M:%S Z")

from .election import Election
from .party import Party
from .position import Position
from .quiz_answer import QuizAnswer
from .result import Result
from .tag import Tag, tags
from .thesis import Thesis
