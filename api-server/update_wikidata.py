#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fetch updated content from Wikidata and Wikipedia

"""
import json
import sys
import os
import wikipedia
import time
import logging

from datetime import datetime, timedelta

from models import Tag
from main import create_app, db
from logger import setup_logger
from wikidata.client import Client

NON_DESCRIPTIONS = [
    'Wikimedia-Begriffsklärungsseite',
    'Wikimedia-Liste'
]

RATE = 1  # seconds wait time

logger = setup_logger(logfile="../wikidata_update.log", level=logging.DEBUG)


def update_tags(fast=False):
    logger.info("Updating all Wikidata content...")

    client = Client()
    tags = db.session.query(Tag).all()
    num_tags = len(tags)
    last_request = None

    logger.info("Loaded {} tags".format(num_tags))

    for i, tag in enumerate(tags):
        if i % 10 == 0:
            logger.info(
                "Now at tag #{0} --- {1:.1f}%".format((i + 1), (100.0 * i / num_tags)))
        wd = client.get(tag.wikidata_id, load=True)
        ident = tag.title[:16].ljust(16)

        # Update title
        title = wd.attributes.get('labels', {}).get(
            'de', {}).get('value', None)
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

        if description in NON_DESCRIPTIONS:
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

        if last_request is not None:
            td = timedelta(seconds=RATE) - (datetime.now() - last_request)
            wait_time = td.seconds + td.microseconds / 1E6
            if wait_time <= 1:
                time.sleep(wait_time)
        last_request = datetime.now()

    logger.info("Committing changes to disk...")
    db.session.commit()


def update_wikipedia_descriptions(fast=False):
    logger.info("Updating Wikipedia summaries...")
    tags = db.session.query(Tag).all()

    wikipedia.set_lang('de')

    last_request = None

    num_tags = len(tags)
    logger.info("Loaded {} tags".format(num_tags))

    for i, tag in enumerate(tags):
        ident = tag.title[:16].ljust(16)
        if tag.wikipedia_title != None:
            try:
                p = wikipedia.page(tag.wikipedia_title)
            except wikipedia.exceptions.DisambiguationError:
                logger.debug("{} Skipped disambiguation page".format(ident))
            else:
                ps = p.summary
                if p.summary is not None:
                    tag.wikipedia_summary = p.summary
                    logger.info("{0:.1f}% {1} {2}w\t{3}".format(
                        (100.0 * i / num_tags),
                        ident,
                        len(tag.wikipedia_summary.split()),
                        tag.wikipedia_summary[:58])
                    )

                db.session.add(tag)
                db.session.commit()  # fail early if something is wrong

        if last_request is not None and fast is False:
            td = timedelta(seconds=RATE) - (datetime.now() - last_request)
            wait_time = td.seconds + td.microseconds / 1E6
            if wait_time <= 1:
                time.sleep(wait_time)
        last_request = datetime.now()


if __name__ == '__main__':
    app = create_app()

    fast = "--fast" in sys.argv

    with app.app_context():
        # update_tags(fast=fast)
        update_wikipedia_descriptions(fast=fast)
        logger.info("Done")
