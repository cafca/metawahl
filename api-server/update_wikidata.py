#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fetch updated content from Wikidata and Wikipedia

"""
import json
import os
import wikipedia
import time

from models import Tag
from main import logger, create_app, db
from wikidata.client import Client

NON_DESCRIPTIONS = [
    'Wikimedia-Begriffsklärungsseite',
    'Wikimedia-Liste'
]

def update_tags(fast=False):
    logger.info("Updating all Wikidata content...")

    client = Client()
    tags = db.session.query(Tag).all()

    for tag in tags:
        wd = client.get(tag.wikidata_id, load=True)
        ident = tag.title[:16].ljust(16)

        # Update title
        title = wd.attributes.get('labels', {}).get('de', {}).get('value', None)
        if (title != tag.title):
            logger.warning("{} Title changed -> '{}'".format(ident, title))
            logger.warning("Title cannot be changed while it is a PK in db")
            # tag.title = title

        # Update description
        description = wd.description.texts.get('de', None)
        if description is None:
            description = wd.description.texts.get('en', None)
            if description is not None:
                logger.debug("{} Fallback to English description: {}".format(
                    ident, description))

        # Capitalize first word in description
        if description is not None:
            description = description[0].title() + description[1:]

        if description in NON_DESCRIPTIONS :
            logger.warning("{} Ignoring non-description '{}'".format(
                ident, description))
            description = None

        if (description != tag.description):
            logger.info("{}  Description '{}' -> '{}'".format(
                ident, tag.description, description))
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
                logger.debug("{}  No entry in German wikipedia".format(ident))

        if tag.wikipedia_title != wp_title:
            logger.info("{}  Wikipedia: '{}' -> '{}'".format(
                ident, tag.wikipedia_title, wp_title))
            tag.wikipedia_title = wp_title

        db.session.add(tag)

        if fast is not True:
            time.sleep(1)

    logger.info("Committing changes to disk...")
    db.session.commit()


if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        update_tags()

    fast = "--fast" in sys.argv

    with app.app_context():
        # update_tags(fast=fast)
        update_wikipedia_descriptions(fast=fast)
        logger.info("Done")
