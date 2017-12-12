#!/usr/bin/env python3
"""
Metawahl API

"""
import os
import sys
import logging

from collections import defaultdict
from flask import Flask, jsonify, request, send_file
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from logger import setup_logger
from pprint import pformat

logfile = os.getenv("METAWAHL_API_LOGFILE", "../metawahl-api.log")
logger = setup_logger(logfile=logfile, level=logging.DEBUG)

API_ROOT = "/api/v1"

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

        return jsonify(rv)

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

        return jsonify(rv)

    @app.route(API_ROOT + "/categories/", methods=["GET"])
    def categories():
        """Return list of all categories."""
        from models import Category

        categories = Category.query.all()
        rv = {
            "data": [category.to_dict() for category in categories]
        }

        return jsonify(rv)

    @app.route(API_ROOT + "/categories/<string:category>", methods=["GET", "POST"])
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

        return jsonify(rv)

    @app.route(API_ROOT + "/tags/", methods=["GET"])
    def tags():
        """Return list of all categories."""
        from models import Tag

        tags = db.session.query(Tag).all()
        rv = {
            "data": [tag.to_dict() for tag in tags]
        }

        return jsonify(rv)

    @app.route(API_ROOT + "/tags/<string:tag_title>", methods=["GET"])
    def tag(tag_title: str):
        """Return metadata for all theses in a category."""
        from models import Tag
        log_request_info("Tag", request)

        tag = db.session.query(Tag) \
            .filter(Tag.slug == tag_title) \
            .first()

        rv = {
            "data": tag.to_dict(),
            "theses": [thesis.to_dict() for thesis in tag.theses]
        }

        return jsonify(rv)

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

        return jsonify(rv)

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
                    title=tag_data["title"],
                    wikidata_id=tag_data["wikidata_id"],
                    url=tag_data["url"],
                    description=tag_data.get("description", None),
                )
                tag.make_slug()
                logger.info("New tag {}".format(tag))
            logger.info("Appending {} to {}".format(tag, thesis))
            thesis.tags.append(tag)

        if len(data.get("remove", [])) > 0:
            logger.info("Removing tags {}".format(", ".join(data.get("remove"))))
            thesis.tags = [tag for tag in thesis.tags
                if tag.title not in data.get("remove")]

        db.session.add(thesis)
        db.session.commit()
        return jsonify({"data": thesis.to_dict()})
    return app


if __name__ == "__main__":
    port = int(os.environ.get("METAWAHL_PORT", 8000))
    app = create_app()
    app.run(host="0.0.0.0", port=port)
