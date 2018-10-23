#!/usr/bin/env python3
"""
Backup non-public and user-generated data to JSON
"""
import json
import os
import sys

sys.path.append("./app/")

from models import QuizAnswer
from main import create_app, API_FULL_NAME
from middleware.logger import logger
from services import db

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


def gen_quiz_answers():
    """Backup thesis reports."""
    logger.info("Backing up thesis reports...")

    return db.session \
        .query(QuizAnswer) \
        .order_by(QuizAnswer.date) \
        .all()


if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        backup_data(gen_quiz_answers(), "quiz_answers.json")

        logger.info("Done")
