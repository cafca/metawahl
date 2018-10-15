#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""This module resets the database by dropping all tables and recreating."""

import sys

sys.path.append("./app/")

from main import create_app
from services import db
from services.logger import logger

if __name__ == '__main__':
    app = create_app()
    arg_force = "--force" in sys.argv

    logger.warning("All userdata backed up?")

    if arg_force or input("Reset database? [y/N]") == "y":
        with app.app_context():
            logger.info("Drop and recreate...")
            db.drop_all(app=app)
            db.create_all(app=app)
    else:
        logger.info("Nothing was changed")
    logger.info("OK")
