#!/usr/bin/env python

from flask import Blueprint, current_app, request
from middleware.cache import cache_filler, is_cache_filler
from middleware.json_response import json_response
from models import Tag, Thesis
from services import cache, db
from services.logger import logger
from sqlalchemy import func, select

tags_bp = Blueprint("tags", __name__)


def _tags_list(filename=None):
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


@tags_bp.route("/tags/")
@cache_filler()
@cache.cached()
def tags_view():
    """List all tags."""
    return _tags_list()


@tags_bp.route("/tags.json")
@cache_filler()
@cache.cached()
def tags_download():
    return _tags_list(filename="tags.json")


@tags_bp.route("/tags/<string:slug>")
@cache_filler()
@cache.cached()
def tag_view(slug: str):
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


@tags_bp.route("/tags/<string:slug>", methods=["DELETE"])
def tag_delete(slug: str):
    admin_key = (request.get_json(silent=True) or {}).get("admin_key", "")
    if admin_key != current_app.config.get("ADMIN_KEY"):
        logger.warning("Invalid admin password")
        return json_response({"error": "Invalid admin password"}, status=401)

    tag = db.session.execute(
        select(Tag).where(Tag.slug == slug)
    ).scalar_one_or_none()

    if tag is None:
        return json_response({"error": "Tag not found"}, status=404)

    logger.warning(f"Removing {tag}")

    rv = {
        "data": tag.to_dict(include_related_tags="full"),
        "theses": [thesis.to_dict() for thesis in tag.theses],
        "elections": {
            thesis.election_id: thesis.election.to_dict() for thesis in tag.theses
        },
    }

    db.session.delete(tag)
    db.session.commit()

    return json_response(rv)
