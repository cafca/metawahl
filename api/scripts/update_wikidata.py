#!/usr/bin/env python3
"""
Fetch updated content from Wikidata and Wikipedia

"""
import logging
import sys
import time
from datetime import datetime, timedelta

from wikidata.client import Client

sys.path.append("./app/")

from config import WIKIDATA_UPDATE_LOG
from main import create_app
from models import Tag
from services import db
from services.logger import setup_logger
from sqlalchemy import select

NON_DESCRIPTIONS = [
    'Wikimedia-Begriffsklärungsseite',
    'Wikimedia-Liste'
]

RATE = 1  # seconds wait time

logger = setup_logger(logfile=WIKIDATA_UPDATE_LOG, level=logging.DEBUG)


def update_tags(fast=False):
    logger.info("Updating all Wikidata content...")

    client = Client()
    tags = db.session.execute(select(Tag)).scalars().all()
    num_tags = len(tags)
    last_request = None

    logger.info(f"Loaded {num_tags} tags")

    for i, tag in enumerate(tags):
        if i % 10 == 0:
            logger.info(
                f"Now at tag #{i + 1} --- {100.0 * i / num_tags:.1f}%")
        wd = client.get(tag.wikidata_id, load=True)
        ident = tag.title[:16].ljust(16)

        # Update title
        title = wd.attributes.get('labels', {}).get(
            'de', {}).get('value', None)
        if (title != tag.title):
            logger.warning(f"{ident} Title changed -> '{title}'")
            logger.warning("Title cannot be changed while it is a PK in db")
            # tag.title = title

        # Update description
        description = wd.description.texts.get('de', None)
        if description is None:
            description = wd.description.texts.get('en', None)
            if description is not None:
                logger.debug(f"{ident} Fallback to English description: {description}")

        # Capitalize first word in description
        if description is not None:
            description = description[0].title() + description[1:]

        if description in NON_DESCRIPTIONS:
            logger.warning(f"{ident} Ignoring non-description '{description}'")
            description = None

        if (description != tag.description):
            logger.info(f"{ident}  Description '{tag.description}' -> '{description}'")
            tag.description = description

        # Update linked Wikipedia page
        sitelinks = wd.attributes.get('sitelinks', None)
        wp_title = None
        if sitelinks is not None and not sitelinks == []:
            wp_info = sitelinks.get('dewiki', None)
            if isinstance(wp_info, list):
                logger.info("{} Multiple WP entries: \n{}".format(
                    ident, "\n  - ".join(wp_info)))
                wp_info = wp_info[0]

            if wp_info is not None:
                wp_title = wp_info.get('title', None)
            else:
                logger.debug(f"{ident}  No entry in German wikipedia")

        if tag.wikipedia_title != wp_title:
            logger.info(f"{ident}  Wikipedia: '{tag.wikipedia_title}' -> '{wp_title}'")
            tag.wikipedia_title = wp_title

        db.session.add(tag)

        if last_request is not None:
            td = timedelta(seconds=RATE) - (datetime.now() - last_request)
            wait_time = td.seconds + td.microseconds / 1E6
            if wait_time <= 1:
                time.sleep(wait_time)
        last_request = datetime.now()

    logger.info("Committing changes to disk...")
    db.session.commit()


if __name__ == '__main__':
    app = create_app()
    fast = "--fast" in sys.argv

    with app.app_context():
        update_tags(fast=fast)
        logger.info("Done")
