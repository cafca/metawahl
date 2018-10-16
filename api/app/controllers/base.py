#!/usr/bin/env python
# -*- coding: utf-8 -*-

from collections import defaultdict
from flask import request
from flask_restplus import Resource
from sqlalchemy import func

from models import Occasion, Tag, Thesis
from middleware.cache import cache_filler, is_cache_filler
from middleware.json_response import json_response
from services import db, cache
from services.logger import logger


class BaseData(Resource):
    decorators = [cache_filler(), cache.cached()]

    def get(self):
        """Return base data set required by the web client."""

        if not is_cache_filler():
            logger.info("Cache miss for {}".format(request.path))

        rv = {
            "data": dict()
        }

        # Occasions

        try:
            occasions = db.session.query(Occasion).all()
        except SQLAlchemyError as e:
            logger.error(e)
            return json_response({"error": "Server Error"})

        rv["data"]["occasions"] = defaultdict(list)
        for occasion in occasions:
            rv["data"]["occasions"][occasion.territory].append(
                occasion.to_dict(thesis_data=False))

        # Tags

        tagItems = db.session.query(Tag, func.count(Thesis.id)) \
            .join(Tag.theses) \
            .group_by(Tag.title) \
            .all()

        rv["data"]["tags"] = [
            item[0].to_dict(thesis_count=item[1],
                            query_root_status=True, include_related_tags=True)
            for item in tagItems]

        return json_response(rv)
