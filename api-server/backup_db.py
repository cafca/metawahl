#!/usr/bin/env python3
"""
Backup non-public and user-generated data to JSON

"""
import json
import os

from models import ThesisReport, Objection
from main import logger, create_app, db, API_FULL_NAME

DATADIR = os.path.join("..", "userdata")

META = {
    "api": API_FULL_NAME,
    "license": "Please see https://github.com/ciex/metawahl/master/LICENSE for \
licensing information"
}

def backup_data(data, fname):
    """JSON-encode and write to file with metadata."""
    rv = {
        "data": data.to_dict() if hasattr(data, "to_dict") \
            else [obj.to_dict() for obj in data],
        "meta": META
    }
    with open(os.path.join(DATADIR, fname), "w") as f:
        json.dump(rv, f, indent=2)


def gen_thesis_reports():
    """Backup thesis reports."""
    logger.info("Backing up thesis reports...")

    return db.session \
        .query(ThesisReport) \
        .order_by(ThesisReport.date) \
        .all()


def gen_objections():
    """Backup objections and their votes."""
    logger.info("Backing up objections...")

    return db.session \
        .query(Objection) \
        .order_by(Objection.date) \
        .all()


if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        backup_data(gen_thesis_reports(), "thesis_reports.json")
        backup_data(gen_objections(), "objections.json")

        logger.info("Done")
