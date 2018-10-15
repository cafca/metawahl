#!/usr/bin/env python
# -*- coding: utf-8 -*-

from flask import request
from middleware.cache import cache_filler, is_cache_filler
from middleware.json_response import json_response
from middleware.logger import log_request_info
from models import Tag, Thesis
from services import cache, db
from services.logger import logger


@cache_filler(cache)
@cache.cached()
def thesis(thesis_id: str):
    """Return metadata for a specific thesis."""

    if not is_cache_filler():
        logger.info("Cache miss for {}".format(request.path))

    thesis = Thesis.query.get(thesis_id)

    if thesis is None:
        return json_response({"error": "Thesis not found"}, status=404)

    rv = {
        "data": thesis.to_dict(),
        "related": thesis.related()
    }

    return json_response(rv)


def thesis_tags(thesis_id: str):
    log_request_info("Thesis tags update", request)

    thesis = db.session.query(Thesis).get(thesis_id)
    data = request.get_json()
    error = None

    if thesis is None:
        return json_response({"error": "Thesis not found"}, status=404)

    if data is None or data.get('admin_key', '') != app.config.get('ADMIN_KEY'):
        logger.warning("Invalid admin key")
        error = "Invalid admin key"
    else:
        for tag_data in data.get("add", []):
            tag = db.session.query(Tag) \
                .filter(Tag.wikidata_id == tag_data["wikidata_id"]) \
                .first()
            if tag is None:
                tag = Tag(
                    description=tag_data.get("description", None),
                    title=tag_data["title"],
                    url=tag_data["url"],
                    wikidata_id=tag_data["wikidata_id"],
                    image=tag_data.get('image', None)
                )

                tag.make_slug()
                logger.info("New tag {}".format(tag))

            tag.wikipedia_title = tag_data.get("wikipedia_title", None)
            tag.labels = ";".join(tag_data.get("labels", []))
            tag.aliases = ";".join(tag_data.get("aliases", []))

            logger.info("Appending {} to {}".format(tag, thesis))
            thesis.tags.append(tag)

        if len(data.get("remove", [])) > 0:
            logger.info("Removing tags {}".format(
                ", ".join(data.get("remove"))))
            thesis.tags = [tag for tag in thesis.tags
                           if tag.title not in data.get("remove")]

        db.session.add(thesis)
        db.session.commit()

    if error is not None:
        return json_response({"error": error})
    else:
        return json_response({"data": thesis.to_dict(), "error": error})
