#!/usr/bin/env python

from flask import Blueprint, request
from middleware.json_response import json_response
from middleware.logger import log_request_info, logger
from models import Election, QuizAnswer, Thesis
from services import cache, db
from sqlalchemy.exc import IntegrityError

quiz_bp = Blueprint("quiz", __name__)


@quiz_bp.route("/quiz/<int:election_num>", methods=["GET"])
@quiz_bp.route("/quiz/<int:election_num>/<int:thesis_num>", methods=["GET"])
@cache.cached(timeout=(5 * 60))
def quiz_get(election_num, thesis_num=None):
    """Return a tally of how many users guessed yes/no for each thesis."""
    rv = {}
    error = None

    election = db.session.get(Election, election_num)
    if election is None:
        return json_response({"error": "Election not found"}, status=404)

    for thesis in election.theses:
        tnum = int(thesis.id[-2:])
        rv[tnum] = thesis.quiz_tally()

    return json_response({"error": error, "data": rv})


@quiz_bp.route("/quiz/<int:election_num>", methods=["POST"])
@quiz_bp.route("/quiz/<int:election_num>/<int:thesis_num>", methods=["POST"])
def quiz_post(election_num, thesis_num=None):
    """Record an answer given by a user in a quiz."""
    if thesis_num is None:
        return json_response(
            {"error": "Missing path parameter for thesis number"}, status=422
        )

    log_request_info("Quiz answer post", request)
    rv = None
    error = None
    status = 200

    thesis_id = f"WOM-{election_num:03d}-{thesis_num:02d}"

    data = request.get_json(silent=True)
    if data is not None:
        uuid = data.get("uuid", None)
        answer = data.get("answer", None)

    if data is None or uuid is None or answer is None:
        logger.warning(f"Request missing data: {data}")
        error = "The request is missing data"
        status = 422
    else:
        thesis = db.session.get(Thesis, thesis_id)

        if thesis is None:
            error = "Thesis not found"
            status = 404
        else:
            qa = QuizAnswer(uuid=uuid, answer=answer, thesis=thesis)

            try:
                db.session.add(qa)
                db.session.commit()
            except IntegrityError:
                error = "Ignored duplicate quiz answer"
                logger.info("Ignored duplicate quiz answer")
            else:
                logger.info(f"Added {qa}")

    if error is None:
        rv = qa.to_dict()

    return json_response({"error": error, "data": rv}, status=status)
