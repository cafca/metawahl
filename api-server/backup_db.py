#!/usr/bin/env python3
"""
Bootstrap database from JSON

"""
import json
import os

from models import ThesisReport
from main import logger, create_app, db, API_FULL_NAME

DATADIR = os.path.join("..", "userdata")

META = {
    "api": API_FULL_NAME,
    "license": "Please see https://github.com/ciex/metawahl/master/LICENSE for \
licensing information"
}

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        logger.info("Backing up thesis reports...")

        thesis_reports = db.session\
            .query(ThesisReport)\
            .order_by(ThesisReport.date)\
            .all()

        rv = {
            "data": [r.to_dict() for r in thesis_reports],
            "meta": META
        }
        with open(os.path.join(DATADIR, "thesis_reports.json"), "w") as f:
            json.dump(rv, f, indent=2)

        logger.info("Done")
