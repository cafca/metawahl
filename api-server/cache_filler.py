#!/usr/bin/env python3
"""
Metawahl Cache Filler

Request all API pages to fill cache

"""
import logging
import asyncio
import requests

from logger import setup_logger
from main import API_ROOT
from models import Occasion, Category, Tag

logger = setup_logger(logfile="/var/log/metawahl/cache_filler.log", level=logging.DEBUG)

def gen_urls():
    """Generate URLs for all cached API URLs."""

    urls = []

    def url(endpoint):
        host = "http://localhost:9000" if app.config.get('DEBUG', True) \
            else "https://api.metawahl.de"
        return "{}{}{}?force_cache_miss".format(host, API_ROOT, endpoint)

    # base

    urls.append(url('/base'))

    # occasions

    urls.append(url('/occasions'))

    occasions = Occasion.query.all()
    for occasion in occasions:
        urls.append(url('/occasions/{}').format(occasion.id))

    # categories

    urls.append(url('/categories.json'))
    urls.append(url('/categories/_uncategorized'))

    categories = Category.query.all()
    for category in categories:
        urls.append(url('/categories/{}').format(category.slug))

    # tags

    urls.append(url('/tags.json'))
    urls.append(url('/tags'))

    tags = Tag.query.all()
    for tag in tags:
        urls.append(url('/tags/{}').format(tag.slug))

    return urls

async def make_requests(urls):
    """Fetch all URLs."""

    loop = asyncio.get_event_loop()
    for url in urls:
        future = loop.run_in_executor(None, requests.get, url)
        resp = await future
        logger.info("[{}] {} {}".format(resp.status_code, resp.elapsed.total_seconds(), url))


if __name__ == "__main__":
    from main import create_app
    app = create_app()

    with app.app_context():
        logger.info("Filling caches...")

        urls = gen_urls()
        logger.info("Collected {} URLs".format(len(urls)))
        logger.info("Sample:\n{}".format("\n - ".join(urls[:5])))

        loop = asyncio.get_event_loop()
        loop.run_until_complete(make_requests(urls))
