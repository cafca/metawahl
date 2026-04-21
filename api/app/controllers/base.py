#!/usr/bin/env python

from collections import defaultdict

from flask import request
from flask_restful import Resource
from middleware.cache import cache_filler, is_cache_filler
from middleware.json_response import json_response
from models import Election, Tag, Thesis
from services import cache, db
from services.logger import logger
from sqlalchemy import func, select
from sqlalchemy.exc import SQLAlchemyError


class BaseView(Resource):
    decorators = [cache_filler(), cache.cached()]

    def get(self):
        """Return base data set required by the web client."""

        if not is_cache_filler():
            logger.info(f"Cache miss for {request.path}")

        rv = {"data": dict()}

        # Elections

        try:
            elections = db.session.execute(select(Election)).scalars().all()
        except SQLAlchemyError as e:
            logger.error(e)
            return json_response({"error": "Server Error"})

        rv["data"]["elections"] = defaultdict(list)
        for election in elections:
            rv["data"]["elections"][election.territory].append(
                election.to_dict(thesis_data=False)
            )

        # Tags

        tagItems = db.session.execute(
            select(Tag, func.count(Thesis.id))
            .join(Tag.theses)
            .group_by(Tag.title)
        ).all()

        rv["data"]["tags"] = [
            item[0].to_dict(
                thesis_count=item[1],
                query_root_status=True,
                include_related_tags="simple",
            )
            for item in tagItems
        ]

        return json_response(rv)
