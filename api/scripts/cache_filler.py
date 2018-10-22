#!/usr/bin/env python3
"""
Metawahl Cache Filler

Request all API pages to fill cache

"""
import logging
import requests
import sys

sys.path.append("./app/")

from config import CACHE_FILLER_LOG
from services.logger import setup_logger
from config import API_ROOT
from models import Election, Tag, Thesis

logger = setup_logger(logfile=CACHE_FILLER_LOG, level=logging.DEBUG)


def gen_urls():
    """Generate URLs for all cached API URLs."""

    urls = []

    def url(endpoint):
        host = "http://localhost:9000" if app.config.get('DEBUG', True) \
            else "https://api.metawahl.de"
        return "{}{}{}?force_cache_miss".format(host, API_ROOT, endpoint)

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
        urls.append(url('/thesis/{}'.format(thesis.id)))

    return urls


def make_requests(urls):
    """Fetch all URLs."""
    l = len(urls)
    for i, url in enumerate(urls):
        resp = requests.get(url)
        logger.info("{0:.1f}% - [{1}] {2:.2f}\t{3}k\t{4}".format(
            (100.0 * i / l),
            resp.status_code,
            resp.elapsed.total_seconds(),
            int(len(resp.content) / 1024),
            url))


if __name__ == "__main__":
    from main import create_app
    app = create_app()

    with app.app_context():
        logger.info("Filling caches...")

        urls = gen_urls()
        logger.info("Collected {} URLs".format(len(urls)))
        logger.info("Sample:\n{}".format("\n - ".join(urls[:5])))

        make_requests(urls)
