#!/usr/bin/env python
# -*- coding: utf-8 -*-

from flask import request
from sqlalchemy import func

from middleware.cache import cache_filler, is_cache_filler
from middleware.json_response import json_response
from models import Tag, Thesis
from services import cache, db
from services.logger import logger


@cache_filler()
@cache.cached()
def tags(filename=None):
    """Return list of all tags."""

    if not is_cache_filler():
        logger.info("Cache miss for {}".format(request.path))

    if request.args.get("include_theses_ids", False) or filename != None:
        results = db.session.query(Tag) \
            .join(Tag.theses) \
            .group_by(Tag.title) \
            .order_by(Tag.title) \
            .all()

        rv = {
            "data": [tag.to_dict(include_theses_ids=True)
                     for tag in results]
        }

    else:
        results = db.session.query(Tag, func.count(Thesis.id)) \
            .join(Tag.theses) \
            .group_by(Tag.title) \
            .all()

        rv = {
            "data": [item[0].to_dict(thesis_count=item[1])
                     for item in results]
        }

    return json_response(rv, filename=filename)


@cache_filler()
@cache.cached()
def tag(tag_title: str):
    """Return data for all theses in a tag."""
    if not is_cache_filler():
        logger.info("Cache miss for {}".format(request.path))

    tag = db.session.query(Tag) \
        .filter(Tag.slug == tag_title) \
        .first()

    if tag is None:
        return json_response({"error": "Tag not found"}, status=404)

    if request.method == "DELETE":
        admin_key = request.get_json().get('admin_key', '')
        if admin_key == app.config.get('ADMIN_KEY'):
            logger.warning("Removing {}".format(tag))
            db.session.delete(tag)
            db.session.commit()
        else:
            logger.warning("Invalid admin password")

    rv = {
        "data": tag.to_dict(include_related_tags=True),
        "theses": [thesis.to_dict() for thesis in tag.theses],
        "occasions": {thesis.occasion_id: thesis.occasion.to_dict()
                      for thesis in tag.theses}
    }

    return json_response(rv)
