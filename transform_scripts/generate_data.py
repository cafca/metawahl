import json
import os
import logging

INPUT_DIR = "/Users/vaul/Projects/wahl-o-meter/export"
OUTPUT_DIR = "/Users/vaul/Projects/tam-o-lhaw/public/data"

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def load_categorized():
    logger.info("Reading data")
    with open(os.path.join(INPUT_DIR, "categorized.json")) as f:
        return json.load(f)


def write_categories(data):
    rv = json.dumps(data, indent=2)
    logger.info("Saving {0:.2f}kb results".format(len(rv) / 1024.0))
    with open(os.path.join(OUTPUT_DIR, "categories.json"), "w") as f:
        f.write(rv)


def gen_category_list(data):
    logger.info("Generating {} transforms".format(len(data.keys())))
    rv = {}
    for category in data.keys():
        rv[category] = [d["id"] for d in data[category]]
    return rv


if __name__ == "__main__":
    data = load_categorized()
    categories = gen_category_list(data)
    write_categories(categories)
