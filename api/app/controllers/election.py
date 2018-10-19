#!/usr/bin/env python
# -*- coding: utf-8 -*-

from collections import defaultdict
from flask import request
from flask_restplus import Resource

from models import Election
from middleware import api
from middleware.cache import cache_filler, is_cache_filler
from middleware.json_response import json_response
from services import db, cache
from services.logger import logger


class ElectionView(Resource):
    decorators = [cache_filler(), cache.cached()]

    @api.doc(params={"wom_id": "Election ID like `43`"})
    def get(self, wom_id: int):
        """Return metadata for an election and all theses therein."""
        if not is_cache_filler():
            logger.info("Cache miss for {}".format(request.path))

        election = Election.query.get(wom_id)

        if election is None:
            return json_response({"error": "Election not found"}, status=404)

        rv = {
            "data": election.to_dict(),
            "theses": [thesis.to_dict() for thesis in election.theses],
        }

        return json_response(rv)


class Elections(Resource):
    decorators = [cache_filler(), cache.cached()]

    def get(self):
        """Return a list of all elections."""

        if not is_cache_filler():
            logger.info("Cache miss for {}".format(request.path))

        try:
            elections = Election.query.all()
        except SQLAlchemyError as e:
            logger.error(e)
            return json_response({"error": "Server Error"})

        thesis_data = request.args.get("thesis_data", False)

        rv = {"data": defaultdict(list)}
        for election in elections:
            rv["data"][election.territory].append(
                election.to_dict(thesis_data=thesis_data)
            )

        return json_response(rv)
