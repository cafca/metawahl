#!/usr/bin/env python3
"""
Metawahl Cache Filler

Request all API pages to fill cache

"""
import logging
import sys

import requests

sys.path.append("./app/")

from config import API_ROOT, CACHE_FILLER_LOG
from flask import current_app
from models import Election, Tag, Thesis
from services.logger import setup_logger

logger = setup_logger(logfile=CACHE_FILLER_LOG, level=logging.DEBUG)


def gen_urls():
    """Generate URLs for all cached API URLs."""

    urls = []

    def url(endpoint):
        host = "http://localhost:9000" if current_app.config.get('DEBUG', True) \
            else "https://api.metawahl.de"
        return f"{host}{API_ROOT}{endpoint}?force_cache_miss"

    # base

    urls.append(url('/base'))

    # elections

    urls.append(url('/elections'))

    elections = Election.query.all()
    for election in elections:
        urls.append(url('/elections/{}').format(election.id))

    # tags

    urls.append(url('/tags.json'))
    urls.append(url('/tags'))

    tags = Tag.query.all()
    for tag in tags:
        urls.append(url('/tags/{}').format(tag.slug))

    # theses

    theses = Thesis.query.all()
    for thesis in theses:
        urls.append(url(f'/thesis/{thesis.id}'))

    return urls


def make_requests(urls):
    """Fetch all URLs."""
    total = len(urls)
    for i, url in enumerate(urls):
        resp = requests.get(url)
        logger.info(f"{100.0 * i / total:.1f}% - [{resp.status_code}] {resp.elapsed.total_seconds():.2f}\t{int(len(resp.content) / 1024)}k\t{url}")


if __name__ == "__main__":
    from main import create_app
    app = create_app()

    with app.app_context():
        logger.info("Filling caches...")

        urls = gen_urls()
        logger.info(f"Collected {len(urls)} URLs")
        logger.info("Sample:\n{}".format("\n - ".join(urls[:5])))

        make_requests(urls)
