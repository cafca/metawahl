#!/usr/bin/env python3
"""
Metawahl API

"""
import os
import sys
import logging
import time
import json

from collections import defaultdict
from flask import Flask, jsonify, request, send_file, g, make_response
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func
from flask_cors import CORS
from logger import setup_logger
from pprint import pformat

logfile = os.getenv("METAWAHL_API_LOGFILE", "../metawahl-api.log")
logger = setup_logger(logfile=logfile, level=logging.DEBUG)

API_NAME = "Metawahl API"
API_VERSION = "v1"
API_FULL_NAME = "{name} {version}".format(name=API_NAME, version=API_VERSION)
API_ROOT = "/api/{}".format(API_VERSION)

db = SQLAlchemy()


def log_request_info(name, request):
    logger.info("{} API".format(name))
    jsond = request.get_json()
    if jsond:
        logger.info("Data: {}".format(pformat(jsond)))


# Categories
#
# 0:  Arbeit und Beschäftigung
# 1:  Ausländerpolitik, Zuwanderung
# 2:  Außenpolitik und internationale Beziehungen
# 3:  Außenwirtschaft
# 4:  Bildung und Erziehung
# 5:  Bundestag
# 6:  Energie
# 7:  Entwicklungspolitik
# 8:  Europapolitik und Europäische Union
# 9:  Gesellschaftspolitik, soziale Gruppen
# 10: Gesundheit
# 11: Innere Sicherheit
# 12: Kultur
# 13: Landwirtschaft und Ernährung
# 14: Medien, Kommunikation und Informationstechnik
# 15: Neue Bundesländer
# 16: Öffentliche Finanzen, Steuern und Abgaben
# 17: Politisches Leben, Parteien
# 18: Raumordnung, Bau- und Wohnungswesen
# 19: Recht
# 20: Soziale Sicherung
# 21: Sport, Freizeit und Tourismus
# 22: Staat und Verwaltung
# 23: Umwelt
# 24: Verkehr
# 25: Verteidigung
# 26: Wirtschaft
# 27: Wissenschaft, Forschung und Technologie

def json_response(data, filename=None):
    data["meta"] = {
        "api": API_FULL_NAME,
        "render_time": g.request_time(),
        "license": "Please see https://github.com/ciex/metawahl/master/LICENSE \
for licensing information"
    }

    rv = jsonify(data)

    if filename is not None:
        rv.headers['Content-Type'] = 'text/json'
        rv.headers['Content-Disposition'] = \
            'attachment; filename={}'.format(filename)

    return rv


def create_app(config=None):
    app = Flask(__name__)
    app.config.update(config or {})
    try:
        app.config.from_envvar("METAWAHL_CONFIG")
    except RuntimeError as e:
        logger.error(e)
        quit()

    db.init_app(app)

    CORS(app)

    @app.before_request
    def before_request():
        # Measure request timing
        # https://gist.github.com/lost-theory/4521102
        g.request_start_time = time.time()
        g.request_time = lambda: "%.5fs" % (time.time() - g.request_start_time)

    @app.route(API_ROOT + "/occasions/", methods=["GET"])
    def occasions():
        """Return a list of all occasions."""
        from models import Occasion

        occasions = Occasion.query.all()

        thesis_data = request.args.get("thesis_data", False)

        rv = {"data": defaultdict(list)}
        for occasion in occasions:
            rv["data"][occasion.territory].append(
                occasion.to_dict(thesis_data=thesis_data))

        return json_response(rv)

    @app.route(API_ROOT + "/occasions/<int:wom_id>", methods=["GET"])
    def occasion(wom_id: int):
        """Return metadata for an occasion and all theses therein."""
        from models import Occasion

        log_request_info("Occasion", request)

        occasion = Occasion.query.get(wom_id)

        rv = {
            "data": occasion.to_dict(),
            "theses": [thesis.to_dict()
                for thesis in occasion.theses]
        }

        return json_response(rv)

    @app.route(API_ROOT + "/categories.json",
        defaults={'filename': "categories.json"})
    @app.route(API_ROOT + "/categories/", methods=["GET"])
    def categories(filename=None):
        """Return list of all categories."""
        from models import Category

        categories = Category.query.order_by(Category.slug).all()
        rv = {
            "data": [category.to_dict()
                for category in categories]
        }

        return json_response(rv, filename=filename)

    @app.route(API_ROOT + "/categories/<string:category>",
        methods=["GET", "POST"])
    def category(category: str):
        """Return metadata for all theses in a category."""
        from models import Category, Thesis
        log_request_info("Category", request)

        category = db.session.query(Category) \
            .filter(Category.slug == category) \
            .first()

        if request.method == "POST":
            data = request.get_json()
            for thesis_id in data.get("add", []):
                logger.info("Adding {} to {}".format(category, thesis_id))
                thesis = db.session.query(Thesis).get(thesis_id)
                category.theses.append(thesis)

            for thesis_id in data.get("remove", []):
                logger.info("Removing {} from {}".format(category, thesis_id))
                thesis = db.session.query(Thesis).get(thesis_id)
                category.theses = [thesis for thesis in category.theses
                    if thesis.id != thesis_id]

            db.session.add(category)
            db.session.commit()

        rv = {
            "data": category.to_dict(thesis_data=True)
        }

        return json_response(rv)

    @app.route(API_ROOT + "/tags.json",
        methods=["GET"], defaults={'filename': 'tags.json'})
    @app.route(API_ROOT + "/tags/", methods=["GET"])
    def tags(filename=None):
        """Return list of all categories."""
        from models import Tag, Thesis

        if request.args.get("include_theses_ids", False):
            results = db.session.query(Tag) \
                .join(Tag.theses) \
                .group_by(Tag.title) \
                .order_by(Tag.title) \
                .all()

            rv = {
                "data": [tag.to_dict(include_theses_ids=True)
                    for tag in results]
            }

        else:
            results = db.session.query(Tag, func.count(Thesis.id)) \
                .join(Tag.theses) \
                .group_by(Tag.title) \
                .all()

            rv = {
                "data": [item[0].to_dict(thesis_count=item[1])
                    for item in results]
            }

        return json_response(rv, filename=filename)

    @app.route(API_ROOT + "/tags/<string:tag_title>",
        methods=["GET", "DELETE"])
    def tag(tag_title: str):
        """Return metadata for all theses in a category."""
        from models import Tag
        log_request_info("Tag", request)

        tag = db.session.query(Tag) \
            .filter(Tag.slug == tag_title) \
            .first()

        if request.method == "DELETE":
            logger.warning("Removing {}".format(tag))
            db.session.delete(tag)
            db.session.commit()

        rv = {
            "data": tag.to_dict(),
            "theses": [thesis.to_dict() for thesis in tag.theses]
        }

        return json_response(rv)

    @app.route(
        API_ROOT + "/thesis/<string:thesis_id>", methods=["GET"])
    def thesis(thesis_id: str):
        """Return metadata for a specific thesis."""
        from models import Thesis
        log_request_info("Thesis", request)

        thesis = Thesis.query.get(thesis_id)
        rv = {
            "data": thesis.to_dict()
        }

        return json_response(rv)

    @app.route(API_ROOT + "/thesis/<string:thesis_id>/tags/", methods=["POST"])
    def thesis_tags(thesis_id: str):
        from models import Thesis, Tag
        log_request_info("Thesis tags update", request)

        thesis = db.session.query(Thesis).get(thesis_id)
        data = request.get_json()

        for tag_data in data.get("add", []):
            tag = db.session.query(Tag) \
                .filter(Tag.wikidata_id == tag_data["wikidata_id"]) \
                .first()
            if tag is None:
                tag = Tag(
                    description=tag_data.get("description", None),
                    title=tag_data["title"],
                    url=tag_data["url"],
                    wikidata_id=tag_data["wikidata_id"],
                )

                tag.make_slug()
                logger.info("New tag {}".format(tag))

            tag.wikipedia_title = tag_data.get("wikipedia_title", None)
            tag.labels = ";".join(tag_data.get("labels", []))
            tag.aliases = ";".join(tag_data.get("aliases", []))

            logger.info("Appending {} to {}".format(tag, thesis))
            thesis.tags.append(tag)

        if len(data.get("remove", [])) > 0:
            logger.info("Removing tags {}".format(
                ", ".join(data.get("remove"))))
            thesis.tags = [tag for tag in thesis.tags
                if tag.title not in data.get("remove")]

        db.session.add(thesis)
        db.session.commit()
        return json_response({"data": thesis.to_dict()})
    return app


if __name__ == "__main__":
    port = int(os.environ.get("METAWAHL_PORT", 8000))
    app = create_app()
    app.run(host="0.0.0.0", port=port)
