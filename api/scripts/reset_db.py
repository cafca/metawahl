#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""This module resets the database by dropping all tables and recreating."""

import sys

from sqlalchemy.schema import DropTable
from sqlalchemy.ext.compiler import compiles

sys.path.append("./app/")

from main import create_app
from services import db
from services.logger import logger

# Add `CASCADE` to drop table statement
# https://stackoverflow.com/a/38679457
@compiles(DropTable, "postgresql")
def _compile_drop_table(element, compiler, **kwargs):
    return compiler.visit_drop_table(element) + " CASCADE"

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
