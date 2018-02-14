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
from flask import Flask, jsonify, request, send_file, g, make_response, abort
from flask_caching import Cache
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func
from sqlalchemy.exc import SQLAlchemyError
from flask_cors import CORS
from logger import setup_logger
from pprint import pformat

logfile = os.getenv("METAWAHL_API_LOGFILE", "../metawahl-api.log")
logger = setup_logger(logfile=logfile, level=logging.DEBUG)
setup_logger(name="werkzeug", color=False)

API_NAME = "Metawahl API"
API_VERSION = "v1"
API_FULL_NAME = "{name} {version}".format(name=API_NAME, version=API_VERSION)
API_ROOT = "/api/{}".format(API_VERSION)

db = SQLAlchemy()


def log_request_info(name, request):
    # logger.info("{} API".format(name))
    jsond = request.get_json()
    if jsond:
        logger.info("Data: {}".format(pformat(jsond)))


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

    cache = Cache(config=app.config)
    cache.init_app(app)

    CORS(app)

    @app.before_request
    def before_request():
        # Measure request timing
        # https://gist.github.com/lost-theory/4521102
        g.request_start_time = time.time()
        g.request_time = lambda: "%.5fs" % (time.time() - g.request_start_time)

    @app.route(API_ROOT + "/base", methods=["GET"])
    @cache.cached(timeout=50)
    def baseData():
        """Return base data set required by the web client."""
        from models import Category, Occasion, Tag, Thesis

        rv = {
            "data": dict()
        }

        # Occasions

        try:
            occasions = db.session.query(Occasion).all()
        except SQLAlchemyError as e:
            logger.error(e)
            return json_response({"error": "Server Error"})

        rv["data"]["occasions"] = defaultdict(list)
        for occasion in occasions:
            rv["data"]["occasions"][occasion.territory].append(
                occasion.to_dict(thesis_data=False))

        # Tags

        tagItems = db.session.query(Tag, func.count(Thesis.id)) \
            .join(Tag.theses) \
            .group_by(Tag.title) \
            .all()

        rv["data"]["tags"] = [item[0].to_dict(thesis_count=item[1])
                for item in tagItems]

        # Categories

        categories = db.session.query(Category) \
            .order_by(Category.slug) \
            .all()

        rv["data"]["categories"] = [category.to_dict()
            for category in categories]

        uncategorized = Category.uncategorized()
        if len(uncategorized["theses"]) > 0:
            rv["data"]["categories"].append(uncategorized)

        return json_response(rv)

    @app.route(API_ROOT + "/occasions/", methods=["GET"])
    def occasions():
        """Return a list of all occasions."""
        from models import Occasion

        try:
            occasions = Occasion.query.all()
        except SQLAlchemyError as e:
            logger.error(e)
            return json_response({"error": "Server Error"})

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

        if occasion is None:
            abort(404)

        rv = {
            "data": occasion.to_dict(),
            "theses": [thesis.to_dict()
                for thesis in occasion.theses]
        }

        return json_response(rv)

    @app.route(API_ROOT + "/categories.json",
        defaults={'filename': "categories.json", 'thesis_ids': True})
    @app.route(API_ROOT + "/categories/", methods=["GET"])
    @cache.cached(timeout=50)
    def categories(filename=None, thesis_ids=False):
        """Return list of all categories."""
        from models import Category

        categories = Category.query.order_by(Category.slug).all()
        rv = {
            "data": [category.to_dict(thesis_ids=thesis_ids)
                for category in categories]
        }

        if filename is None:
            uncategorized = Category.uncategorized()
            if len(uncategorized["theses"]) > 0:
                rv["data"].append(uncategorized)

        return json_response(rv, filename=filename)

    @app.route(API_ROOT + "/react/<string:kind>", methods=["POST"])
    def react(kind: str):
        """Save a user submitted reaction.

        Kind may be one of:
        - "thesis-report": to report a thesis for wrong data
        - "objection": to hand in an objection
        - "objection-vote": to vote on an existing objection. Requires
            objection_id key in payload.
        """
        from models import Thesis, ThesisReport, Objection, ObjectionVote
        rv = {}
        error = False

        data = request.get_json()

        if kind == "thesis-report":
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

        elif kind == "objection":
            thesis_id = data.get('thesis_id')
            uuid = data.get('uuid')
            url = data.get('url')
            rating = data.get('rating')

            error = uuid is None \
                or thesis_id is None \
                or url is None \
                or len(url) == 0 \
                or not rating in [-1, 0, 1]

            if error is False:
                thesis = db.session.query(Thesis).get(thesis_id)

                if thesis is None:
                    logger.warning("No thesis instance was found for this request")
                    error = True

                # check this url doesn't exist already
                def isDuplicateLink(objection):
                    return objection.url == url

                if len(list(filter(isDuplicateLink, thesis.objections))) > 0:
                    error = True
                    rv["error"] = "Diesen Link gibt es hier leider schon."

            if error is False:
                objection = Objection(
                    uuid=uuid,
                    url=url,
                    thesis=thesis,
                    rating=rating
                )
                vote = objection.vote(data.get('uuid'), True)

                try:
                    db.session.add(objection)
                    db.session.add(vote)
                    db.session.commit()
                except SQLAlchemyError as e:
                    logger.error(e)
                    error = True
                else:
                    logger.debug("Received {}: {}".format(objection, objection.url))
                    db.session.expire(objection)
                    rv["data"] = objection.to_dict()

        elif kind == 'objection-vote':
            objection_id = data.get('objection_id')
            value = data.get('value', True)
            uuid = data.get('uuid')
            vote = None
            rv = {}

            if objection_id is None or uuid is None:
                logger.warning("Objection vote with objection id {} \
                    and uuid {} is missing data.".format(objection_id, uuid))
                error = True
            else:
                objection = db.session.query(Objection).get(objection_id)

                if objection is None:
                    logger.warning("Vote for missing objection {}".format(
                        objection_id))
                    error = True
                elif value is True:
                    vote = ObjectionVote(value=True,
                        uuid=uuid, objection=objection)
                    db.session.add(vote)
                    db.session.add(objection)
                elif value is False:
                    vote = db.session.query(ObjectionVote) \
                        .filter_by(uuid=uuid) \
                        .filter_by(objection=objection) \
                        .first()

                    if vote is not None:
                        db.session.delete(vote)
                        db.session.add(objection)
                    else:
                        logger.warning("Received request to delete missing" +
                            " vote by '{}' for {}".format(uuid, objection))
                        error = True

            if error is False:
                try:
                    db.session.commit()
                except SQLAlchemyError as e:
                    logger.error(e)
                    error = True
                else:
                    if value is True:
                        logger.debug("Received {}".format(vote))
                        db.session.expire(vote)
                        rv["data"] = vote.to_dict()
                    else:
                        logger.debug("Removed vote")
                        rv["data"] = None
        else:
            logger.error("Unknown reaction kind: {}".format(kind))
            error = True

        if error is True:
            if rv.get("error", None) is None:
                rv["error"] = "There was a server error."

        return json_response(rv)

    @app.route(API_ROOT + "/categories/<string:category>",
        methods=["GET", "POST"])
    def category(category: str):
        """Return metadata for all theses in a category."""
        from models import Category, Thesis

        error = None

        if category == "_uncategorized":
            rv = {"data": Category.uncategorized(thesis_data=True)}
        else:
            category = db.session.query(Category) \
                .filter(Category.slug == category) \
                .first()

            if category is None:
                abort(404)

            if request.method == "POST":
                data = request.get_json()

                if data is not None and (data.get('admin_key', '') == app.config.get('ADMIN_KEY')):
                    for thesis_id in data.get("add", []):
                        logger.info("Adding {} to {}".format(
                            category, thesis_id))
                        thesis = db.session.query(Thesis).get(thesis_id)
                        category.theses.append(thesis)

                    for thesis_id in data.get("remove", []):
                        logger.info("Removing {} from {}".format(
                            category, thesis_id))
                        thesis = db.session.query(Thesis).get(thesis_id)
                        category.theses = [thesis for thesis in category.theses
                            if thesis.id != thesis_id]

                    db.session.add(category)
                    db.session.commit()
                else:
                    logger.warning("Invalid admin password")
                    error = "Invalid admin password"

            rv = {
                "data": category.to_dict(
                    thesis_data=True, include_related_tags=True),
                "error": error
            }

        return json_response(rv)

    @app.route(API_ROOT + "/tags.json",
        methods=["GET"], defaults={'filename': 'tags.json'})
    @app.route(API_ROOT + "/tags/", methods=["GET"])
    @cache.cached(timeout=50)
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

        if tag is None:
            abort(404)

        if request.method == "DELETE":
            admin_key = request.get_json().get('admin_key', '')
            if admin_key == app.config.get('ADMIN_KEY'):
                logger.warning("Removing {}".format(tag))
                db.session.delete(tag)
                db.session.commit()
            else:
                logger.warning("Invalid admin password")

        rv = {
            "data": tag.to_dict(include_related_tags=True),
            "theses": [thesis.to_dict() for thesis in tag.theses],
            "occasions": {thesis.occasion_id: thesis.occasion.to_dict()
                for thesis in tag.theses}
        }

        return json_response(rv)

    @app.route(
        API_ROOT + "/thesis/<string:thesis_id>", methods=["GET"])
    def thesis(thesis_id: str):
        """Return metadata for a specific thesis."""
        from models import Thesis
        log_request_info("Thesis", request)

        thesis = Thesis.query.get(thesis_id)

        if thesis is None:
            abort(404)

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
        error = None

        if thesis is None:
            abort(404)

        if data is None or data.get('admin_key', '') != app.config.get('ADMIN_KEY'):
            logger.warning("Invalid admin key")
            error = "Invalid admin key"
        else:
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
                        image=tag_data.get('image', None)
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
        return json_response({"data": thesis.to_dict(), "error": error})
    return app


if __name__ == "__main__":
    port = int(os.environ.get("METAWAHL_PORT", 9000))
    app = create_app()
    app.run(host="0.0.0.0", port=port)
