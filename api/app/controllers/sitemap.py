#!/usr/bin/env python
"""Generate plaintext sitemap."""

from config import SITE_ROOT
from flask import Blueprint, Response
from models import Election, Tag
from services import db
from sqlalchemy import select

sitemap_bp = Blueprint("sitemap", __name__)


@sitemap_bp.route("/sitemap.xml")
def sitemap_view():
    def generate():
        yield SITE_ROOT + "\n"

        yield f"{SITE_ROOT}/wahlen/\n"
        terr = None
        query = db.session.execute(
            select(Election).order_by(Election.territory)
        ).scalars().all()
        for occ in query:
            if occ.territory != terr:
                yield f"{SITE_ROOT}/wahlen/{occ.territory}/\n"
            yield f"{SITE_ROOT}/wahlen/{occ.territory}/{occ.id}/\n"
            terr = occ.territory
            for thesis in occ.theses:
                yield f"{SITE_ROOT}/wahlen/{occ.territory}/{occ.id}/{thesis.id[-2:]}/\n"

        yield f"{SITE_ROOT}/themen/\n"
        yield f"{SITE_ROOT}/themenliste/\n"
        for tag in db.session.execute(
            select(Tag).order_by(Tag.slug)
        ).scalars().all():
            yield f"{SITE_ROOT}/themen/{tag.slug}/\n"

        yield f"{SITE_ROOT}/legal/\n"
        yield "{}/daten/\n"

    # The generator runs inside the current request's app context, so
    # db.session remains valid without re-creating the app.
    return Response(list(generate()), mimetype="text/plain")
