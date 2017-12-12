#!/usr/bin/env python3
"""
Bootstrap database from JSON

"""
import json
import os
import dateutil.parser

from collections import defaultdict
from datetime import datetime
from models import Occasion, Thesis, Position, Party, Tag
from main import logger, create_app, db

DATADIR = os.path.join("..", "qual-o-mat-data")

OCCASION_IDS = {
    "2003/bayern": 0,
    "2004/europa": 1,
    "2004/sachsen": 2,
    "2004/saarland": 3,
    "2005/nordrheinwestfalen": 4,
    "2005/schleswigholstein": 5,
    "2005/deutschland": 6,
    "2006/sachsenanhalt": 7,
    "2006/rheinlandpfalz": 8,
    "2006/berlin": 9,
    "2006/badenwuerttemberg": 10,
    "2008/niedersachsen": 11,
    "2007/bremen": 12,
    "2008/hamburg": 13,
    "2011/hamburg": 14,
    "2010/nordrheinwestfalen": 15,
    "2009/europa": 16,
    "2009/deutschland": 17,
    "2011/bremen": 18,
    "2011/rheinlandpfalz": 19,
    "2012/saarland": 20,
    "2011/berlin": 21,
    "2012/schleswigholstein": 22,
    "2012/nordrheinwestfalen": 23,
    "2013/niedersachsen": 24,
    "2011/badenwuerttemberg": 25,
    "2013/bayern": 26,
    "2014/thueringen": 27,
    "2014/sachsen": 28,
    "2013/deutschland": 29,
    "2014/europa": 30,
    "2014/brandenburg": 31,
    "2015/hamburg": 32,
    "2002/deutschland": 33,
    "2016/sachsenanhalt": 34,
    "2016/badenwuerttemberg": 35,
    "2015/bremen": 36,
    "2017/schleswigholstein": 37,
    "2016/berlin": 38,
    "2016/rheinlandpfalz": 39,
    "2017/saarland": 40,
    "2017/nordrheinwestfalen": 41,
    "2017/deutschland": 42
}

party_instances = defaultdict(Party)
tag_instances = defaultdict(Tag)


def load_data_file(fp, index=False):
    """Load JSON encoded data from disk with option to index."""
    rv = None
    try:
        with open(fp) as f:
            rv = json.load(f)
    except FileNotFoundError:
        logger.error("File {} is missing".format(fp))
    else:
        if index:
            # Instead of returning a list, assign each item in rv to
            # a dict, indexed by its 'id' value, and return that
            rv_indexed = dict()
            for entry in rv:
                rv_indexed[entry["id"]] = entry
            rv = rv_indexed
    return rv


def load_occasions():
    """Load data from qual-o-mat-data and return model instances."""
    with open(os.path.join(DATADIR, "list.json")) as f:
        occasion_list = json.load(f)

    for occasion_dir in sorted(occasion_list):
        # occasion_dir is like "2017/deutschland"
        year, territory = occasion_dir.split("/")

        def path_for(fn): return os.path.join(DATADIR, year, territory, fn)

        logger.info("Loading occasion {}".format(occasion_dir))

        dataset = {
            "comments": load_data_file(path_for("comment.json"), index=True),
            "opinions": load_data_file(path_for("opinion.json")),
            "overview": load_data_file(path_for("overview.json")),
            "parties": load_data_file(path_for("party.json"), index=True),
            "theses": load_data_file(path_for("statement.json"), index=True)
        }

        # Sort opinions by the thesis they belong to
        opinions_sorted = defaultdict(list)
        for op in dataset["opinions"]:
            opinions_sorted[op["statement"]].append(op)
        dataset["opinions"] = opinions_sorted

        occasion = Occasion(
            id=OCCASION_IDS[occasion_dir],
            title=dataset["overview"]["title"],
            date=dateutil.parser.parse(dataset["overview"]["date"]),
            source=dataset["overview"]["data_source"],
            territory=territory
        )

        occasion.theses = load_theses(occasion_dir, **dataset)
        yield occasion


def load_theses(occasion_dir, comments=None, opinions=None, overview=None,
                parties=None, theses=None):
    """Load theses from a given ressource file."""
    rv = []
    for thesis_num in theses:
        thesis_id = "WOM-{occasion:03d}-{thesis:02d}".format(
            occasion=OCCASION_IDS[occasion_dir],
            thesis=thesis_num
        )

        thesis = Thesis(
            id=thesis_id,
            title=theses[thesis_num]["label"],
            text=theses[thesis_num]["text"]
        )

        if thesis.title == thesis.text:
            thesis.title = None

        positions = [load_position(position_data, comments, parties)
                     for position_data in opinions[thesis_num]]

        for pos in positions:
            thesis.positions.append(pos)

        rv.append(thesis)
    return rv


def load_position(position_data, comments, parties):
    """Return a new position instance for position_data."""
    party_data = parties[position_data["party"]]
    party = party_instances[party_data["name"]]
    party.name = party_data["name"]
    party.long_name = party_data["longname"]

    assert position_data["answer"] in [0, 1, 2]

    position = Position(
        value=(position_data["answer"] - 1),
        party=party
    )

    if position_data["comment"] is not None:
        position.text = comments[position_data["comment"]]["text"]
    return position


def load_tags():
    """One off."""
    with open("categories.json") as f:
        tag_data = json.load(f)
    logger.info("{} tags".format(len(tag_data)))
    for tag_title in tag_data:
        tag = tag_instances[tag_title]
        tag.title = tag_title
        tag.make_slug()
        thesis_ids = []
        for tid in tag_data[tag_title]:
            womtype, occasion, thesis_num = tid.split("-")
            thesis_id = "WOM-{occasion:03d}-{thesis:02d}".format(
                occasion=int(occasion),
                thesis=int(thesis_num)
            )
            thesis = Thesis.query.get(thesis_id)
            thesis.tags.append(tag)
        yield tag


if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        for obj in load_occasions():
            db.session.add(obj)
            logger.info("Added {}".format(obj))

        for tag in load_tags():
            db.session.add(tag)
            logger.info("Added {}".format(tag))

        logger.info("Committing session to disk...")
        db.session.commit()
        logger.info("OK")
