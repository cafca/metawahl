#!/usr/bin/env python3
"""
Backup non-public and user-generated data to JSON

"""
import json
import os
import sys

sys.path.append("./app/")

from main import create_app
from models import ThesisReport, Reaction
from services.logger import logger
from services import db
from config import API_FULL_NAME

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


def gen_reactions():
    """Backup reactions and their votes."""
    logger.info("Backing up reactions...")

    return db.session \
        .query(Reaction) \
        .order_by(Reaction.date) \
        .all()


if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        backup_data(gen_thesis_reports(), "thesis_reports.json")
        backup_data(gen_reactions(), "reactions.json")

        logger.info("Done")
