#!/usr/bin/env python

from flask import current_app, request
from flask_restful import Resource
from middleware.cache import cache_filler, is_cache_filler
from middleware.json_response import json_response
from models import Tag, Thesis
from services import cache, db
from services.logger import logger
from sqlalchemy import func, select


class TagsView(Resource):
    decorators = [cache_filler(), cache.cached()]

    def get(self, filename=None):
        """List all tags."""

        if not is_cache_filler():
            logger.info(f"Cache miss for {request.path}")

        if request.args.get("include_theses_ids", False) or filename is not None:
            results = db.session.execute(
                select(Tag).join(Tag.theses).group_by(Tag.title).order_by(Tag.title)
            ).scalars().all()

            rv = {"data": [tag.to_dict(include_theses_ids=True) for tag in results]}

        else:
            results = db.session.execute(
                select(Tag, func.count(Thesis.id)).join(Tag.theses).group_by(Tag.title)
            ).all()

            rv = {"data": [item[0].to_dict(thesis_count=item[1]) for item in results]}

        return json_response(rv, filename=filename)

class TagsDownload(TagsView):
    def get(self):
        return TagsView.get(self, filename='tags.json')


class TagView(Resource):
    decorators = [cache_filler(), cache.cached()]

    def get(self, slug: str):
        """Tag metadata, list of all related theses and their elections."""
        if not is_cache_filler():
            logger.info(f"Cache miss for {request.path}")

        tag = db.session.execute(
            select(Tag).where(Tag.slug == slug.lower())
        ).scalar_one_or_none()

        if tag is None:
            return json_response({"error": "Tag not found"}, status=404)

        rv = {
            "data": tag.to_dict(include_related_tags="full"),
            "theses": [thesis.to_dict() for thesis in tag.theses],
            "elections": {
                thesis.election_id: thesis.election.to_dict() for thesis in tag.theses
            },
        }

        return json_response(rv)

    def delete(self, slug:str):
        admin_key = request.get_json().get("admin_key", "")
        if admin_key != current_app.config.get("ADMIN_KEY"):
            logger.warning("Invalid admin password")
            return json_response({"error": "Invalid admin password"}, status=401)

        tag = db.session.execute(
            select(Tag).where(Tag.slug == slug)
        ).scalar_one_or_none()

        if tag is None:
            return json_response({"error": "Tag not found"}, status=404)

        logger.warning(f"Removing {tag}")
        db.session.delete(tag)
        db.session.commit()

        rv = {
            "data": tag.to_dict(include_related_tags="full"),
            "theses": [thesis.to_dict() for thesis in tag.theses],
            "elections": {
                thesis.election_id: thesis.election.to_dict() for thesis in tag.theses
            },
        }

        return json_response(rv)
