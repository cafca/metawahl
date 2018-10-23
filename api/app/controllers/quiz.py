#!/usr/bin/env python
# -*- coding: utf-8 -*-

from flask import request
from flask_restful import Resource
from sqlalchemy.exc import IntegrityError

from middleware.json_response import json_response
from middleware.logger import logger, log_request_info
from models import QuizAnswer, Thesis, Election
from services import db, cache


class Quiz(Resource):
    method_decorators = {
        "get": [cache.cached(timeout=(5 * 60))]
    }

    def get(self, election_num):
        """Return a tally of how many users guessed yes/no for each thesis"""
        rv = {}
        error = None

        election = Election.query.get(election_num)
        if election is None:
            return json_response({"error": "Election not found"}, status=404)

        for thesis in election.theses:
            thesis_num = int(thesis.id[-2:])
            rv[thesis_num] = thesis.quiz_tally()

        return json_response({"error": error, "data": rv})

    def post(self, election_num, thesis_num):
        """Record an answer given by a user in a quiz."""
        log_request_info("Quiz answer post", request)
        rv = None
        error = None
        status = 200

        thesis_id = "WOM-{:03d}-{:02d}".format(election_num, thesis_num)

        data = request.get_json()
        if data is not None:
            uuid = data.get("uuid", None)
            answer = data.get("answer", None)

        if data is None or uuid is None or answer is None:
            logger.warning("Request missing data: {}".format(data))
            error = "The request is missing data"
            status = 422
        else:
            thesis = Thesis.query.get(thesis_id)

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
                    logger.info("Added {}".format(qa))

        if error is None:
            rv = qa.to_dict()

        return json_response({"error": error, "data": rv}, status=status)
