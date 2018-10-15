#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Generate plaintext sitemap."""

from flask import Response

from config import SITE_ROOT
from models import Occasion, Tag
from services import db, cache

@cache.cached()
def sitemap():
    def generate():
        from main import create_app

        app = create_app()
        with app.app_context():
            yield SITE_ROOT + '\n'

            # Occasions
            yield '{}/wahlen/\n'.format(SITE_ROOT)
            terr = None
            for occ in db.session.query(Occasion).order_by(Occasion.territory).all():
                if occ.territory != terr:
                    yield '{}/wahlen/{}/\n'.format(SITE_ROOT, occ.territory)
                yield '{}/wahlen/{}/{}/\n'.format(SITE_ROOT, occ.territory, occ.id)
                terr = occ.territory
                for thesis in occ.theses:
                    yield '{}/wahlen/{}/{}/{}/\n'.format(SITE_ROOT, occ.territory, occ.id, thesis.id[-2:])

            # Topics
            yield '{}/themen/\n'.format(SITE_ROOT)
            yield '{}/themenliste/\n'.format(SITE_ROOT)
            for tag in db.session.query(Tag).order_by(Tag.slug).all():
                yield '{}/themen/{}/\n'.format(SITE_ROOT, tag.slug)

            # Other
            yield '{}/legal/\n'.format(SITE_ROOT)

    return Response(generate(), mimetype='text/plain')
