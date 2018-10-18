#!/usr/bin/env python
# -*- coding: utf-8 -*-

from flask import request
from flask_restplus import Resource
from sqlalchemy import func

from middleware.cache import cache_filler, is_cache_filler
from middleware.json_response import json_response
from models import Tag, Thesis
from services import cache, db
from services.logger import logger


class TagsView(Resource):
    decorators = [cache_filler(), cache.cached()]

    def get(self, filename=None):
        """List of all known tags."""

        if not is_cache_filler():
            logger.info("Cache miss for {}".format(request.path))

        if request.args.get("include_theses_ids", False) or filename != None:
            results = (
                db.session.query(Tag)
                .join(Tag.theses)
                .group_by(Tag.title)
                .order_by(Tag.title)
                .all()
            )

            rv = {"data": [tag.to_dict(include_theses_ids=True) for tag in results]}

        else:
            results = (
                db.session.query(Tag, func.count(Thesis.id))
                .join(Tag.theses)
                .group_by(Tag.title)
                .all()
            )

            rv = {"data": [item[0].to_dict(thesis_count=item[1]) for item in results]}

        return json_response(rv, filename=filename)


class TagView(Resource):
    decorators = [cache_filler(), cache.cached()]

    def get(self, slug: str):
        """Return data for all theses in a tag."""
        if not is_cache_filler():
            logger.info("Cache miss for {}".format(request.path))

        tag = db.session.query(Tag).filter(Tag.slug == slug.lower()).first()

        if tag is None:
            return json_response({"error": "Tag not found"}, status=404)

        rv = {
            "data": tag.to_dict(include_related_tags='full'),
            "theses": [thesis.to_dict() for thesis in tag.theses],
            "elections": {
                thesis.election_id: thesis.election.to_dict() for thesis in tag.theses
            },
        }

        return json_response(rv)

    def delete(self):
        admin_key = request.get_json().get("admin_key", "")
        if admin_key != app.config.get("ADMIN_KEY"):
            logger.warning("Invalid admin password")
            return json_response({"error": "Invalid admin password"}, status=401)

        tag = db.session.query(Tag).filter(Tag.slug == slug).first()

        if tag is None:
            return json_response({"error": "Tag not found"}, status=404)

        logger.warning("Removing {}".format(tag))
        db.session.delete(tag)
        db.session.commit()

        rv = {
            "data": tag.to_dict(include_related_tags='full'),
            "theses": [thesis.to_dict() for thesis in tag.theses],
            "elections": {
                thesis.election_id: thesis.election.to_dict() for thesis in tag.theses
            },
        }

        return json_response(rv)
