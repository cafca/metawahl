#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Metawahl API

"""
import os
import sys
import logging
import time
import json
import requests
import traceback
import lxml.html

from datetime import datetime
from logging.handlers import RotatingFileHandler
from collections import defaultdict
from flask import Flask, jsonify, request, send_file, g, make_response, abort, Response
from flask_caching import Cache
from flask_sqlalchemy import SQLAlchemy
from functools import wraps
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

SITE_ROOT = "https://metawahl.de"

db = SQLAlchemy()


def log_request_info(name, request):
    # logger.info("{} API".format(name))
    jsond = request.get_json()
    if jsond:
        logger.info("Data: {}".format(pformat(jsond)))


def json_response(data, filename=None, status=200):
    data["meta"] = {
        "api": API_FULL_NAME,
        "render_time": g.request_time(),
        "license": "Please see https://github.com/ciex/metawahl/master/LICENSE \
for licensing information"
    }

    rv = jsonify(data)
    rv.cache_control.max_age = 300
    rv.status_code = status

    if filename is not None:
        rv.headers['Content-Type'] = 'text/json'
        rv.headers['Content-Disposition'] = \
            'attachment; filename={}'.format(filename)

    return rv

def is_cache_filler():
    return request.args.get('force_cache_miss') is not None

def cache_filler(cache):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if is_cache_filler():
                logger.debug('Forcing cache miss for {}'.format(request.path))
                cache.delete("view/{}".format(request.path))
            return f(*args, **kwargs)
        return decorated_function
    return decorator


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

    handler = RotatingFileHandler(
        app.config.get("METAWAHL_API_LOGFILE", None) or "../flask_api.log",
        backupCount=3)
    app.logger.addHandler(handler)
    app.logger.setLevel(logging.DEBUG)

    @app.before_request
    def before_request():
        # Measure request timing
        # https://gist.github.com/lost-theory/4521102
        g.request_start_time = time.time()
        g.request_time = lambda: "%.5fs" % (time.time() - g.request_start_time)

    @app.after_request
    def after_request(response):
        # This IF avoids the duplication of registry in the log,
        # since that 500 is already logged via @app.errorhandler.
        if response.status_code != 500:
            ts = datetime.utcnow().strftime('[%Y-%b-%d %H:%M]')
            logger.debug('%s %s %s %s %s %s',
                        ts,
                        request.remote_addr,
                        request.method,
                        request.scheme,
                        request.full_path,
                        response.status)
        return response

    @app.errorhandler(Exception)
    def exceptions(e):
        ts = datetime.utcnow().strftime('[%Y-%b-%d %H:%M]')
        tb = traceback.format_exc()
        logger.error('%s %s %s %s %s 5xx INTERNAL SERVER ERROR\n%s',
                    ts,
                    request.remote_addr,
                    request.method,
                    request.scheme,
                    request.full_path,
                    tb)

        return json_response(
            {"error": "AAAHH! Serverfehler. Rute ist gezückt, Computer wird bestraft."},
            status=500
        )

    @app.errorhandler(404)
    def page_not_found(e):
        return json_response({"error": "Ressource not found"}, status=404)

    @app.route(API_ROOT + '/sitemap.xml', methods=["GET"])
    def sitemap():
        from models import Occasion, Tag

        def generate():
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

                # Topics
                yield '{}/themen/\n'.format(SITE_ROOT)
                yield '{}/themenliste/\n'.format(SITE_ROOT)
                for tag in db.session.query(Tag).order_by(Tag.slug).all():
                    yield '{}/themen/{}/\n'.format(SITE_ROOT, tag.slug)

                # Other
                yield '{}/legal/\n'.format(SITE_ROOT)

        return Response(generate(), mimetype='text/plain')

    @app.route(API_ROOT + "/base", methods=["GET"])
    @cache_filler(cache)
    @cache.cached()
    def baseData():
        """Return base data set required by the web client."""
        from models import Occasion, Tag, Thesis

        if not is_cache_filler():
            logger.info("Cache miss for {}".format(request.path))

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

        rv["data"]["tags"] = [
            item[0].to_dict(thesis_count=item[1], query_root_status=True, include_related_tags=True)
                for item in tagItems]

        return json_response(rv)

    @app.route(API_ROOT + "/occasions/", methods=["GET"])
    @cache_filler(cache)
    @cache.cached()
    def occasions():
        """Return a list of all occasions."""
        from models import Occasion

        if not is_cache_filler():
            logger.info("Cache miss for {}".format(request.path))

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
    @cache_filler(cache)
    @cache.cached()
    def occasion(wom_id: int):
        """Return metadata for an occasion and all theses therein."""
        from models import Occasion

        if not is_cache_filler():
            logger.info("Cache miss for {}".format(request.path))

        occasion = Occasion.query.get(wom_id)

        if occasion is None:
            return json_response({"error": "Occasion not found"}, status=404)

        rv = {
            "data": occasion.to_dict(),
            "theses": [thesis.to_dict()
                for thesis in occasion.theses]
        }

        return json_response(rv)


    @app.route(API_ROOT + "/react/<string:endpoint>", methods=["POST"])
    def react(endpoint: str):
        """Save a user submitted reaction.

        Kind may be one of:
        - "thesis-report": to report a thesis for wrong data
        - "reaction": to rate emotional feedback
        """
        from models import Thesis, ThesisReport, Reaction, REACTION_NAMES
        rv = {}
        error = False

        data = request.get_json()

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
                logger.error("Request missing parameters")

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
                        logger.warning("No thesis instance was found for this request")
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
                        cache.delete('views/{}/reactions/{}'.format(API_ROOT, uuid))

                        rv['data'] = reaction.thesis.reactions_dict()
        else:
            logger.error("Unknown reaction endpoint: {}".format(endpoint))
            error = True

        if error is True:
            if rv.get("error", None) is None:
                rv["error"] = "There was a server error."

        return json_response(rv)


    @app.route(API_ROOT + "/tags.json",
        methods=["GET"], defaults={'filename': 'tags.json'})
    @app.route(API_ROOT + "/tags/", methods=["GET"])
    @cache_filler(cache)
    @cache.cached()
    def tags(filename=None):
        """Return list of all tags."""
        from models import Tag, Thesis

        if not is_cache_filler():
            logger.info("Cache miss for {}".format(request.path))

        if request.args.get("include_theses_ids", False) or filename != None:
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
    @cache_filler(cache)
    @cache.cached()
    def tag(tag_title: str):
        """Return data for all theses in a tag."""
        from models import Tag

        if not is_cache_filler():
            logger.info("Cache miss for {}".format(request.path))

        tag = db.session.query(Tag) \
            .filter(Tag.slug == tag_title) \
            .first()

        if tag is None:
            return json_response({"error": "Tag not found"}, status=404)

        if request.method == "DELETE":
            admin_key = request.get_json().get('admin_key', '')
            if admin_key == app.config.get('ADMIN_KEY'):
                logger.warning("Removing {}".format(tag))
                db.session.delete(tag)
                db.session.commit()
            else:
                logger.warning("Invalid admin password")

        rv = {
            "data": tag.to_dict(
                include_related_tags=True, include_wikipedia_summary=True),
            "theses": [thesis.to_dict() for thesis in tag.theses],
            "occasions": {thesis.occasion_id: thesis.occasion.to_dict()
                for thesis in tag.theses}
        }

        return json_response(rv)

    @app.route(
        API_ROOT + "/thesis/<string:thesis_id>", methods=["GET"])
    @cache_filler(cache)
    @cache.cached()
    def thesis(thesis_id: str):
        """Return metadata for a specific thesis."""
        from models import Thesis

        if not is_cache_filler():
            logger.info("Cache miss for {}".format(request.path))

        thesis = Thesis.query.get(thesis_id)

        if thesis is None:
            return json_response({"error": "Thesis not found"}, status=404)

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
            return json_response({"error": "Thesis not found"}, status=404)

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
