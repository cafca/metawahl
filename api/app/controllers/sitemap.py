#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Generate plaintext sitemap."""

from flask import Response
from flask_restful import Resource

from config import SITE_ROOT
from models import Election, Tag
from services import db, cache


class SitemapView(Resource):
    def get(self):
        def generate():
            from main import create_app

            app = create_app()
            with app.app_context():
                yield SITE_ROOT + "\n"

                # Elections
                yield "{}/wahlen/\n".format(SITE_ROOT)
                terr = None
                query = db.session.query(Election).order_by(Election.territory).all()
                for occ in query:
                    if occ.territory != terr:
                        yield "{}/wahlen/{}/\n".format(SITE_ROOT, occ.territory)
                    yield "{}/wahlen/{}/{}/\n".format(SITE_ROOT, occ.territory, occ.id)
                    terr = occ.territory
                    for thesis in occ.theses:
                        yield "{}/wahlen/{}/{}/{}/\n".format(
                            SITE_ROOT, occ.territory, occ.id, thesis.id[-2:]
                        )

                # Topics
                yield "{}/themen/\n".format(SITE_ROOT)
                yield "{}/themenliste/\n".format(SITE_ROOT)
                for tag in db.session.query(Tag).order_by(Tag.slug).all():
                    yield "{}/themen/{}/\n".format(SITE_ROOT, tag.slug)

                # Other
                yield "{}/legal/\n".format(SITE_ROOT)

        return Response(generate(), mimetype="text/plain")
