#!/usr/bin/env python3
"""
Metawahl API

"""
import os
import sys
import logging

from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from logger import setup_logger
from crawler.parser import MietspiegelParser
from pprint import pformat

from requests.exceptions import ConnectionError

logfile = os.getenv("METAWAHL_API_LOGFILE", "../metawahl-api.log")
logger = setup_logger(logfile=logfile, level=logging.DEBUG)

db = SQLAlchemy()


def create_app(config=None):
    app = Flask(__name__)
    app.config.update(config or {})
    app.config.from_envvar("METAWAHL_CONFIG")

    db.init_app(app)

    CORS(app)

    @app.route("/api/v1/street", methods=["GET"])
    def find_street():
        """Search for streets in the db, fall back to crawling."""
        from model import Street
        rv = {}

        logger.info("Street API\nData: {}".format(pformat(request.args)))

        street_name = request.args.get("name")
        if street_name is None or len(street_name) < 4:
            rv["errors"] = ["Street query too short"]
        else:
            # get results
            street_data = Street.find(street_name)

            if len(street_data) > 0:
                logger.info("Returning {} results".format(len(street_data)))
                rv["data"] = street_data
            else:
                # Fallback to querying the actual Mietspiegel site
                logger.info("Fallback to remote Mietspiegel")
                ps = MietspiegelParser()
                try:
                    rv["data"] = ps.find_street(street_name)
                except ConnectionError as e:
                    logger.error("Error connecting to Mietspiegel server\n\n{}".format(e))
                    rv["errors"] = ["Mietlimbo kann leider momentan nicht auf den Online-Mietspiegel der Berliner Senatsverwaltung zugreifen. "]

        return jsonify(rv)


if __name__ == "__main__":
    port = int(os.environ.get("METAWAHL_PORT", 8000))
    app = create_app()
    app.run(host="0.0.0.0", port=port)
