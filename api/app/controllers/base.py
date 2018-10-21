#!/usr/bin/env python
# -*- coding: utf-8 -*-

from collections import defaultdict
from flask import request
from flask_restful import Resource
from sqlalchemy import func

from models import Election, Tag, Thesis
from middleware.cache import cache_filler, is_cache_filler
from middleware.json_response import json_response
from services import db, cache
from services.logger import logger


class BaseView(Resource):
    decorators = [cache_filler(), cache.cached()]

    def get(self):
        """Return base data set required by the web client."""

        if not is_cache_filler():
            logger.info("Cache miss for {}".format(request.path))

        rv = {"data": dict()}

        # Elections

        try:
            elections = db.session.query(Election).all()
        except SQLAlchemyError as e:
            logger.error(e)
            return json_response({"error": "Server Error"})

        rv["data"]["elections"] = defaultdict(list)
        for election in elections:
            rv["data"]["elections"][election.territory].append(
                election.to_dict(thesis_data=False)
            )

        # Tags

        tagItems = (
            db.session.query(Tag, func.count(Thesis.id))
            .join(Tag.theses)
            .group_by(Tag.title)
            .all()
        )

        rv["data"]["tags"] = [
            item[0].to_dict(
                thesis_count=item[1],
                query_root_status=True,
                include_related_tags="simple",
            )
            for item in tagItems
        ]

        return json_response(rv)
