#!/usr/bin/env python

from collections import defaultdict

from flask import Blueprint, request
from middleware.cache import cache_filler, is_cache_filler
from middleware.json_response import json_response
from models import Election
from services import cache, db
from services.logger import logger
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError

election_bp = Blueprint("election", __name__)


@election_bp.route("/elections/<int:wom_id>")
@cache_filler()
@cache.cached()
def election_view(wom_id: int):
    """Election data and a list of its theses."""
    if not is_cache_filler():
        logger.info(f"Cache miss for {request.path}")

    election = db.session.get(Election, wom_id)

    if election is None:
        return json_response({"error": "Election not found"}, status=404)

    rv = {
        "data": election.to_dict(),
        "theses": [thesis.to_dict() for thesis in election.theses],
    }

    return json_response(rv)


@election_bp.route("/elections/")
@cache_filler()
@cache.cached()
def elections():
    """A list of all elections."""
    if not is_cache_filler():
        logger.info(f"Cache miss for {request.path}")

    try:
        all_elections = db.session.execute(select(Election)).scalars().all()
    except SQLAlchemyError as e:
        logger.error(e)
        return json_response({"error": "Server Error"})

    thesis_data = request.args.get("thesis_data", False)

    rv = {"data": defaultdict(list)}
    for election in all_elections:
        rv["data"][election.territory].append(
            election.to_dict(thesis_data=thesis_data)
        )

    return json_response(rv)
