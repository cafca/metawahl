#!/usr/bin/env python3
"""
Bootstrap database from JSON

"""
import json
import os
import sys
import dateutil.parser

from collections import defaultdict
from datetime import datetime

sys.path.append("./app/")

from models import Election, Thesis, Position, Party, Tag, Result, QuizAnswer
from main import create_app
from services import db
from services.logger import logger
from config import API_FULL_NAME

DATADIR = os.path.join("..", "qual-o-mat-data")

OCCASION_IDS = {
    "data/2003/bayern": 0,
    "data/2004/europa": 1,
    "data/2004/sachsen": 2,
    "data/2004/saarland": 3,
    "data/2005/nordrheinwestfalen": 4,
    "data/2005/schleswigholstein": 5,
    "data/2005/deutschland": 6,
    "data/2006/sachsenanhalt": 7,
    "data/2006/rheinlandpfalz": 8,
    "data/2006/berlin": 9,
    "data/2006/badenwuerttemberg": 10,
    "data/2008/niedersachsen": 11,
    "data/2007/bremen": 12,
    "data/2008/hamburg": 13,
    "data/2011/hamburg": 14,
    "data/2010/nordrheinwestfalen": 15,
    "data/2009/europa": 16,
    "data/2009/deutschland": 17,
    "data/2011/bremen": 18,
    "data/2011/rheinlandpfalz": 19,
    "data/2012/saarland": 20,
    "data/2011/berlin": 21,
    "data/2012/schleswigholstein": 22,
    "data/2012/nordrheinwestfalen": 23,
    "data/2013/niedersachsen": 24,
    "data/2011/badenwuerttemberg": 25,
    "data/2013/bayern": 26,
    "data/2014/thueringen": 27,
    "data/2014/sachsen": 28,
    "data/2013/deutschland": 29,
    "data/2014/europa": 30,
    "data/2014/brandenburg": 31,
    "data/2015/hamburg": 32,
    "data/2002/deutschland": 33,
    "data/2016/sachsenanhalt": 34,
    "data/2016/badenwuerttemberg": 35,
    "data/2015/bremen": 36,
    "data/2017/schleswigholstein": 37,
    "data/2016/berlin": 38,
    "data/2016/rheinlandpfalz": 39,
    "data/2017/saarland": 40,
    "data/2017/nordrheinwestfalen": 41,
    "data/2017/deutschland": 42,
    "data/2018/bayern": 43,
    "data/2018/hessen": 44,
    "data/2019/bremen": 45,
    "data/2019/europa": 46,
    "data/2019/brandenburg": 47,
    "data/2019/sachsen": 48,
    "data/2019/thueringen": 49,
    "data/2020/hamburg": 50
}

INVALID_POSITION_TEXTS = [
    '"Die SPD Bayern verweist für ausführlichere Begründungen auf ihr Regierungsprogramm unter www.bayernspd.de"',
    "Die Begründung der Partei zu ihrem Abstimmverhalten wird nachgereicht, da noch nicht alle Begründungen vorliegen.",
    "Zu dieser These hat die Partei keine Begründung vorgelegt.",
    "Es liegt keine Begründung zur Position dieser Partei vor.",
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


def load_elections():
    """Load data from qual-o-mat-data and return model instances."""
    with open(os.path.join(DATADIR, "list.json")) as f:
        election_list = json.load(f)

    for election_dir in sorted(election_list):
        # election_dir is like "data/2017/deutschland"
        _, year, territory = election_dir.split("/")

        def path_for(fn):
            return os.path.join(DATADIR, "data", year, territory, fn)

        dataset = {
            "comments": load_data_file(path_for("comment.json"), index=True),
            "opinions": load_data_file(path_for("opinion.json")),
            "overview": load_data_file(path_for("overview.json")),
            "parties": load_data_file(path_for("party.json"), index=True),
            "theses": load_data_file(path_for("statement.json"), index=True),
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

        election = Election(
            id=OCCASION_IDS[election_dir],
            title="{} {}".format(dataset["overview"]["title"], dt.year),
            date=dt,
            source=dataset["overview"]["data_source"],
            territory=territory,
            wikipedia_title=wikipedia_title,
        )

        election.theses = load_theses(election_dir, **dataset)
        yield election


def load_theses(
    election_dir, comments=None, opinions=None, overview=None, parties=None, theses=None
):
    """Load theses from a given ressource file."""
    rv = []
    for thesis_num in theses:
        thesis_id = "WOM-{election:03d}-{thesis:02d}".format(
            election=OCCASION_IDS[election_dir], thesis=thesis_num
        )

        thesis = Thesis(
            id=thesis_id,
            title=theses[thesis_num]["label"],
            text=theses[thesis_num]["text"],
        )

        if thesis.title == thesis.text:
            thesis.title = None

        positions = [
            load_position(position_data, comments, parties)
            for position_data in opinions[thesis_num]
        ]

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
    value = {0: 1, 1: -1, 2: 0}[position_data["answer"]]

    position = Position(value=value, party=party)

    comment_id = position_data["comment"]
    if comment_id and comments[comment_id]["text"] not in INVALID_POSITION_TEXTS:
        raw_text = comments[comment_id]["text"]
        raw_text = raw_text[1:-1] if raw_text.startswith('"') else raw_text
        position.text = raw_text

    return position


def load_quiz_answers():
    """Load quiz answers from quiz_answers.json"""
    try:
        with open("../userdata/quiz_answers.json") as f:
            qa_export = json.load(f)
    except FileNotFoundError:
        logger.warning(
            "File ../userdata/quiz_answers.json not found - quiz answers were not"
            + "imported"
        )
        return

    assert qa_export["meta"]["api"] == API_FULL_NAME

    logger.info("Adding {} quiz answers...".format(len(qa_export["data"])))

    for qa_data in qa_export["data"]:
        d = dateutil.parser.parse(qa_data["date"]).date()
        qa = QuizAnswer(
            thesis_id=qa_data["thesis"],
            uuid=qa_data["uuid"],
            date=d,
            answer=qa_data["answer"],
        )
        yield qa


def load_tags():
    """Load tags from exported tags.json."""
    try:
        with open("../userdata/tags.json") as f:
            tag_export = json.load(f)
    except FileNotFoundError:
        logger.warning("File ../userdata/tags.json not found - tags were not imported")
        return

    if tag_export["meta"]["api"] != API_FULL_NAME:
        raise ValueError("Tag export has Version '{}' but should be '{}'".format(tag_export["meta"]["api"], API_FULL_NAME))
    logger.info("Adding {} tags...".format(len(tag_export["data"])))

    for tag_data in tag_export["data"]:
        tag = Tag(
            title=tag_data["title"],
            slug=tag_data["slug"],
            url=tag_data["url"],
            wikidata_id=tag_data["wikidata_id"],
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


def load_wahlergebnisse():
    """Load Wahlergebnisse from wahlergebnisse submodule."""

    try:
        with open("../wahlergebnisse/wahlergebnisse.json") as f:
            wahlergebnisse = json.load(f)
    except FileNotFoundError:
        logger.warning(
            "wahlergebnisse/wahlergebnisse.json not found. Is "
            + "the submodule initialised?"
        )
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

    elections = db.session.query(Election).order_by(Election.title).all()
    for i, occ in enumerate(elections):
        print(occ.title)
        print("{} of {}".format(i + 1, len(elections)))
        d = occ.date.date()
        parties = dict()
        for t in occ.theses:
            for pos in t.positions:
                parties[pos.party.name] = pos

        for p in parties.keys():
            found = False

            for p1 in [p] + substitutions[p]:
                if p1.upper() in map(str.upper, we[d]["results"].keys()):
                    found = True

            if found is False:
                print(
                    "\n".join(
                        "{}: {}".format(i, n)
                        for i, n in enumerate(we[d]["results"].keys())
                    )
                )

                choice = int(
                    input("Welche Partei ist {}?\n{}\n\n".format(p, parties[p].text))
                )

                if choice != -1:
                    substitutions[p].append(list(we[d]["results"].keys())[choice])

        with open("../userdata/substitutions.json", "w") as f:
            json.dump(substitutions, f, indent=2, ensure_ascii=False)


def load_results():
    """Match election records to the existing election datasets."""
    logger.info("Matching election results...")

    with open("../wahlergebnisse/wahlergebnisse.json") as f:
        result_data = json.load(f)
    with open("../userdata/substitutions.json") as f:
        substitutions = defaultdict(list)
        substitutions.update(json.load(f))

    for occ in db.session.query(Election).all():
        dt = occ.date.date()
        occ_results = [
            o
            for o in result_data
            if o["territory"].lower().startswith(occ.territory.lower()[:2])
            and dateutil.parser.parse(o["date"]).date() == dt
        ]

        matched_results = set()

        if len(occ_results) == 0:
            logger.error("Didn't find results for {}. Removing from db..".format(occ))
            for th in occ.theses:
                for pos in th.positions:
                    db.session.delete(pos)
                db.session.delete(th)
            db.session.delete(occ)
        else:
            res = occ_results[0]

            if "preliminary" in res and res["preliminary"] == True:
                logger.warning("Marking {} as preliminary".format(occ))
                occ.preliminary = True
                yield occ

            parties = set([p.party for p in occ.theses[0].positions])
            for p in parties:
                options = [p.name.lower()] + list(map(str.lower, substitutions[p.name]))
                matches = [
                    (name, result)
                    for name, result in res["results"].items()
                    if name.lower() in options
                ]

                if len(matches) > 0:
                    for match in matches:
                        if match[0].lower() != p.name.lower():
                            logger.warning(
                                "Assigned WOM text from {} to election result of {} in {}".format(
                                    p, match[0], res["title"]
                                )
                            )
                        matched_results.add(match[0])
                        votes = match[1]["votes"] if "votes" in match[1] else None
                        yield Result(
                            election=occ,
                            party=p,
                            party_repr=match[0],
                            votes=votes,
                            pct=match[1]["pct"],
                            source_url=res["url"],
                            source_name="Tagesschau Wahlarchiv"
                        )
                else:
                    if occ.preliminary:
                        logger.info("{} missing vote count for  {}".format(occ, p))
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
                                        party, p_name, res["title"]
                                    )
                                )
                            break

                if party is None:
                    party = Party(name=p_name)
                    party_instances[p_name] = party

                yield Result(
                    election=occ,
                    party_repr=p_name,
                    party=party,
                    votes=match["votes"] if "votes" in match else None,
                    pct=match["pct"],
                    source_url=res["url"],
                    source_name="Tagesschau Wahlarchiv",
                    wom=False,
                )


if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        try:
            for obj in load_elections():
                db.session.add(obj)
                logger.info("Added {}".format(obj))

            for result in load_results():
                db.session.add(result)

            for tag in load_tags():
                db.session.add(tag)

            for quiz_answer in load_quiz_answers():
                db.session.add(quiz_answer)

            logger.info("Committing session to disk...")
            db.session.commit()
        except:
            db.session.rollback()
            raise
        finally:
            logger.info("Done")
            logger.warning("Clear and refill caches!")
