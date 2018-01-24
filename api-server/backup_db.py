#!/usr/bin/env python3
"""
Bootstrap database from JSON

"""
import json
import os

from models import ThesisReport
from main import logger, create_app, db

DATADIR = os.path.join("..", "userdata")

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        logger.info("Backing up thesis reports...")

        thesis_reports = db.session.query(ThesisReport).all()
        with open(os.path.join(DATADIR, "thesis_reports.json"), "w") as f:
            json.dump([r.to_dict() for r in thesis_reports], f, indent=2)

        logger.info("Done")
