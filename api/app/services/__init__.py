#!/usr/bin/env python

from flask_caching import Cache
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """SQLAlchemy 2.0 typed declarative base for all Metawahl models."""


db = SQLAlchemy(model_class=Base)
cache = Cache()
