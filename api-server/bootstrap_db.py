#!/usr/bin/env python3
"""
Bootstrap database from JSON

"""
import json
import os
import dateutil.parser

from collections import defaultdict
from datetime import datetime
from models import Occasion, Thesis, Position, Party, Tag, Result, \
    ThesisReport, Reaction
from main import logger, create_app, db

API_VERSION = "Metawahl API v1"
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

INVALID_POSITION_TEXTS = [
    '"Die SPD Bayern verweist für ausführlichere Begründungen auf ihr Regierungsprogramm unter www.bayernspd.de"',
    'Die Begründung der Partei zu ihrem Abstimmverhalten wird nachgereicht, da noch nicht alle Begründungen vorliegen.',
    'Zu dieser These hat die Partei keine Begründung vorgelegt.',
    'Es liegt keine Begründung zur Position dieser Partei vor.'
]

party_instances = defaultdict(Party)
tag_instances = defaultdict(Tag)


def load_data_file(fp, index=False):
    """Load JSON encoded data from disk with option to index."""
    rv = None
    try:
        with open(fp) as f:
            rv = json.load(f)
    except FileNotFoundError:
        logger.warning("File {} is missing".format(fp))
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

        def path_for(fn):
            return os.path.join(DATADIR, year, territory, fn)

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

        if dataset["overview"]["info"] is not None:
            splitPos = dataset["overview"]["info"].rfind("/") + 1
            wikipedia_title = dataset["overview"]["info"][splitPos:].replace("_", " ")

        dt = dateutil.parser.parse(dataset["overview"]["date"])

        occasion = Occasion(
            id=OCCASION_IDS[occasion_dir],
            title="{} {}".format(dataset["overview"]["title"], dt.year),
            date=dt,
            source=dataset["overview"]["data_source"],
            territory=territory,
            wikipedia_title=wikipedia_title
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

    # Im Datensatz werden Antworten mit einem Schlüssel in answer.json
    # kodiert. Da Metawahl davon ausgeht, dass Antworten immer zustimmend,
    # ablehnend oder neutral sind, wird der Schlüssel hier hart kodiert,

    assert position_data["answer"] in [0, 1, 2]
    value = {
        0: 1,
        1: -1,
        2: 0
    }[position_data["answer"]]

    position = Position(value=value, party=party)

    comment_id = position_data["comment"]
    if comment_id and comments[comment_id]["text"] not in INVALID_POSITION_TEXTS:
        position.text = comments[comment_id]["text"]

    return position


def load_tags():
    """Load tags from exported tags.json."""
    try:
        with open("../userdata/tags.json") as f:
            tag_export = json.load(f)
    except FileNotFoundError:
        logger.warning("File ../userdata/tags.json not found - tags were not" +
            "imported")
        return

    assert tag_export["meta"]["api"] == API_VERSION
    logger.info("Adding {} tags...".format(len(tag_export["data"])))

    for tag_data in tag_export["data"]:
        tag = Tag(
            title=tag_data["title"],
            slug=tag_data["slug"],
            url=tag_data["url"],
            wikidata_id=tag_data["wikidata_id"]
        )

        tag.description = tag_data.get("description", None)
        tag.wikipedia_title = tag_data.get("wikipedia_title", None)
        tag.labels = ";".join(tag_data.get("labels", []))
        tag.aliases = ";".join(tag_data.get("aliases", []))
        tag.image = tag_data.get("image", None)

        if tag.description is not None and len(tag.description) > 1:
            # Always start with upper case
            tag.description = tag.description[0].upper() + tag.description[1:]

            # Remove non-descriptions
            if tag.description.startswith("Wikimedia-"):
                tag.description = None

        for thesis_id in tag_data["theses"]:
            tag.theses.append(Thesis.query.get(thesis_id))

        yield tag


def load_reports():
    """Load user submitted reports from json file."""
    try:
        with open("../userdata/thesis_reports.json") as f:
            reports_export = json.load(f)
    except FileNotFoundError:
        logger.warning("File ../userdata/thesis_reports.json not found - " +
            "reports were not imported")
        return

    assert reports_export["meta"]["api"] == API_VERSION
    logger.info("Adding {} reports...".format(len(reports_export["data"])))

    for report_data in reports_export["data"]:
        date = dateutil.parser.parse(report_data.get('date'))
        report = ThesisReport(
            uuid=report_data.get('uuid'),
            date=date,
            text=report_data.get('text'),
            thesis=Thesis.query.get(report_data.get('thesis'))
        )

        yield report


def load_reactions():
    """Load user submitted reactions from json file."""
    try:
        with open("../userdata/reactions.json") as f:
            reaction_export = json.load(f)
    except FileNotFoundError:
        logger.warning("File ../userdata/reactions.json not found - " +
            "reactions were not imported")
        return

    assert reaction_export["meta"]["api"] == API_VERSION
    logger.info("Adding {} reactions...".format(len(reaction_export["data"])))

    for reaction_data in reaction_export["data"]:
        date = dateutil.parser.parse(reaction_data.get('date'))
        try:
            reaction = Reaction(
                uuid=reaction_data.get('uuid'),
                date=date,
                kind=reaction_data.get('kind'),
                thesis=Thesis.query.get(reaction_data.get('thesis'))
            )
        except (KeyError, TypeError) as e:
            logger.error("Error importing reaction: {}".format(e))

        yield reaction


def load_wahlergebnisse():
    """Load Wahlergebnisse from wahlergebnisse submodule."""

    try:
        with open("../wahlergebnisse/wahlergebnisse.extended.json") as f:
            wahlergebnisse = json.load(f)
    except FileNotFoundError:
        logger.warning("wahlergebnisse/wahlergebnisse.json not found. Is " +
            "the submodule initialised?")
        quit()

    return wahlergebnisse


def make_substitutions():
    """Create a dict of substitutions for parties that have a slightly
    different name in vote results and wahl o mat."""

    wahlergebnisse = load_wahlergebnisse()

    with open("substitutions.json") as f:
        substitutions = json.load(f)

    substitutions = defaultdict(list, substitutions)

    we = dict()
    for w in wahlergebnisse:
        d = dateutil.parser.parse(w["date"]).date()
        we[d] = w

    occasions = db.session.query(Occasion).order_by(Occasion.title).all()
    for i, occ in enumerate(occasions):
        print(occ.title)
        print("{} of {}".format(i + 1, len(occasions)))
        d = occ.date.date()
        parties = dict()
        for t in occ.theses:
            for pos in t.positions:
                parties[pos.party.name] = pos

        for p in parties.keys():
            found = False

            for p1 in ([p] + substitutions[p]):
                if p1.upper() in map(str.upper, we[d]["results"].keys()):
                    found = True

            if found is False:
                print("\n".join("{}: {}".format(i, n) for i, n in enumerate(we[d]["results"].keys())))

                choice = int(input("Welche Partei ist {}?\n{}\n\n".format(p, parties[p].text)))

                if choice != -1:
                    substitutions[p].append(list(we[d]["results"].keys())[choice])

        with open("substitutions.json", "w") as f:
            json.dump(substitutions, f, indent=2, ensure_ascii=False)


def load_results():
    """Match election records to the existing occasion datasets."""
    logger.info("Matching election results...")

    with open("../wahlergebnisse/wahlergebnisse.extended.json") as f:
        result_data = json.load(f)
    with open("./substitutions.json") as f:
        substitutions = json.load(f)

    for occ in db.session.query(Occasion).all():
        dt = occ.date.date()
        occ_results = [o for o in result_data
            if o["territory"].lower().startswith(occ.territory.lower()[:2])
                and dateutil.parser.parse(o["date"]).date() == dt]

        matched_results = set()

        if len(occ_results) == 0:
            logger.error("Didn't find results for {}".format(occ))
        else:
            res = occ_results[0]
            parties = set([p.party for p in occ.theses[0].positions])
            for p in parties:
                options = [p.name.lower(), ] + list(map(str.lower, substitutions[p.name]))
                matches = [(name, result) for name, result in res["results"].items() if name.lower() in options]

                if len(matches) > 0:
                    for match in matches:
                        if match[0].lower() != p.name.lower():
                            logger.warning("Assigned WOM text from {} to election result of {} in {}".format(
                                p, match[0], res["title"]
                            ))
                        matched_results.add(match[0])
                        yield Result(
                            occasion=occ,
                            party=p,
                            party_repr=match[0],
                            votes=match[1]["votes"],
                            pct=match[1]["pct"],
                            source=res["url"]
                        )
                else:
                    logger.error("No vote count for {} in {}".format(p, occ))

            # Add results missing in Wahl-o-Mat
            for p_name, match in res["results"].items():
                if p_name in list(matched_results):
                    continue

                # Try and assign a unified party instance to this election
                # result to merge parties that have changed their name over
                # time

                party = None
                if p_name in party_instances.keys():
                    party = party_instances[p_name]
                else:
                    for (name, subs) in substitutions.items():
                        if p_name in subs:
                            if name in party_instances.keys():
                                party = party_instances[name]
                                logger.info(
                                    "Linked party {} to election result of '{}' in {}".format(
                                        party, p_name, res["title"])
                                )
                            break

                if party is None:
                    party = Party(
                        name=p_name
                    )
                    party_instances[p_name] = party

                yield Result(
                    occasion=occ,
                    party_repr=p_name,
                    party=party,
                    votes=match["votes"],
                    pct=match["pct"],
                    source=res["url"],
                    wom=False
                )


if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        for obj in load_occasions():
            db.session.add(obj)
            logger.info("Added {}".format(obj))

        for result in load_results():
            db.session.add(result)

        for tag in load_tags():
            db.session.add(tag)

        for report in load_reports():
            db.session.add(report)

        for reaction in load_reactions():
            db.session.add(reaction)

        logger.info("Committing session to disk...")
        db.session.commit()
        logger.info("Done")
        logger.warning("Clear and refill caches!")
