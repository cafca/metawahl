#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Controller for handling user reactions."""

from flask import request
from sqlalchemy.exc import SQLAlchemyError

from models import Thesis, ThesisReport, Reaction, REACTION_NAMES
from middleware.json_response import json_response
from services import db, cache
from services.logger import logger
from config import API_ROOT


def react(endpoint: str):
    """Save a user submitted reaction.

    Kind may be one of:
    - "thesis-report": to report a thesis for wrong data
    - "reaction": to rate emotional feedback
    """
    rv = {}
    error = False

    data = request.get_json() or {}

    if endpoint == "thesis-report":
        report = ThesisReport(
            uuid=data.get('uuid'),
            text=data.get('text'),
            thesis_id=data.get('thesis_id')
        )

        try:
            db.session.add(report)
            db.session.commit()
        except SQLAlchemyError as e:
            logger.error(e)
            error = True
        else:
            logger.warning("Received {}: {}".format(report, report.text))
            db.session.expire(report)
            rv["data"] = report.to_dict()

    elif endpoint == "reaction":
        thesis_id = data.get('thesis_id')
        uuid = data.get('uuid')
        kind = int(data.get('kind', -1))
        reaction = None

        error = uuid is None \
            or thesis_id is None \
            or not kind in REACTION_NAMES.keys()

        if error is True:
            logger.error("JSON body missing parameters. Got: {}".format(data))

        if error is False:
            reaction = db.session.query(Reaction) \
                .filter(Reaction.uuid == uuid) \
                .filter(Reaction.thesis_id == thesis_id).first()

            if reaction is not None:
                logger.info('Changing reaction from {} to {}'.format(
                    REACTION_NAMES[reaction.kind], REACTION_NAMES[kind]))
                reaction.kind = kind
            else:
                thesis = db.session.query(Thesis).get(thesis_id)

                if thesis is None:
                    logger.warning(
                        "No thesis instance was found for this request")
                    error = True

                if error is False:
                    reaction = Reaction(
                        uuid=uuid,
                        thesis=thesis,
                        kind=kind
                    )

            if error is False:
                try:
                    db.session.add(reaction)
                    db.session.commit()
                except SQLAlchemyError as e:
                    logger.error(e)
                    error = True
                else:
                    logger.info("Stored {}".format(reaction))

                    # Delete cached user ratings endpoint
                    cache.delete(
                        'views/{}/reactions/{}'.format(API_ROOT, uuid))

                    rv['data'] = reaction.thesis.reactions_dict()
    else:
        logger.error("Unknown reaction endpoint: {}".format(endpoint))
        error = True

    if error is True:
        if rv.get("error", None) is None:
            rv["error"] = "There was a server error."

    return json_response(rv)
