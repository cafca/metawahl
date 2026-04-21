#!/usr/bin/env python
"""Generate plaintext sitemap."""

from config import SITE_ROOT
from flask import Response
from flask_restful import Resource
from models import Election, Tag
from services import db
from sqlalchemy import select


class SitemapView(Resource):
    def get(self):
        def generate():
            from main import create_app

            app = create_app()
            with app.app_context():
                yield SITE_ROOT + "\n"

                # Elections
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

                # Topics
                yield f"{SITE_ROOT}/themen/\n"
                yield f"{SITE_ROOT}/themenliste/\n"
                for tag in db.session.execute(
                    select(Tag).order_by(Tag.slug)
                ).scalars().all():
                    yield f"{SITE_ROOT}/themen/{tag.slug}/\n"

                # Other
                yield f"{SITE_ROOT}/legal/\n"
                yield "{}/daten/\n"

        return Response(generate(), mimetype="text/plain")
