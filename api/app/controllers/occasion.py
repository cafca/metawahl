#!/usr/bin/env python
# -*- coding: utf-8 -*-

from collections import defaultdict
from flask import request
from flask_restplus import Resource

from models import Occasion
from middleware.cache import cache_filler, is_cache_filler
from middleware.json_response import json_response
from services import db, cache
from services.logger import logger


class OccasionView(Resource):
    decorators = [cache_filler(), cache.cached()]

    def get(self, wom_id: int):
        """Return metadata for an occasion and all theses therein."""
        if not is_cache_filler():
            logger.info("Cache miss for {}".format(request.path))

        occasion = Occasion.query.get(wom_id)

        if occasion is None:
            return json_response({"error": "Occasion not found"}, status=404)

        rv = {
            "data": occasion.to_dict(),
            "theses": [thesis.to_dict()
                       for thesis in occasion.theses]
        }

        return json_response(rv)


class Occasions(Resource):
    decorators = [cache_filler(), cache.cached()]

    def get(self):
        """Return a list of all occasions."""

        if not is_cache_filler():
            logger.info("Cache miss for {}".format(request.path))

        try:
            occasions = Occasion.query.all()
        except SQLAlchemyError as e:
            logger.error(e)
            return json_response({"error": "Server Error"})

        thesis_data = request.args.get("thesis_data", False)

        rv = {"data": defaultdict(list)}
        for occasion in occasions:
            rv["data"][occasion.territory].append(
                occasion.to_dict(thesis_data=thesis_data))

        return json_response(rv)
