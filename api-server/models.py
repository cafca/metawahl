#!/usr/bin/env python3
"""
Metawahl Flask-SQLAlchemy models

"""
import json
import datetime
import sys

from main import db, logger
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func, desc, UniqueConstraint
from slugify import slugify
from collections import defaultdict


# Try and use these only for logging and debugging. Exact language for
# reactions is defined in frontend code
REACTION_NAMES = {
    0: "Glücklich",
    1: "Erleichtert",
    2: "Na und",
    3: "Beunruhigt",
    4: "Verärgert"
}

def dt_string(dt):
    """Return iso string representation of a datetime including tz."""
    return dt.strftime("%Y-%m-%d %H:%M:%S Z")


class ThesisReport(db.Model):
    """Represent a report of a thesis for some error."""
    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(36), nullable=False)
    date = db.Column(db.DateTime,
        nullable=False, default=datetime.datetime.utcnow)
    text = db.Column(db.Text, nullable=False)

    thesis_id = db.Column(db.String(10),
        db.ForeignKey('thesis.id'), nullable=False)
    thesis = db.relationship('Thesis',
        backref=db.backref('reports', lazy=True))

    def __repr__(self):
        return "<Report {}>".format(self.thesis_id)

    def to_dict(self):
        return {
            "text": self.text,
            "thesis": self.thesis_id,
            "uuid": self.uuid,
            "date": dt_string(self.date)
        }


class Reaction(db.Model):
    """Represent a reaction."""
    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(36), nullable=False)
    date = db.Column(db.DateTime,
        nullable=False, default=datetime.datetime.utcnow)
    kind = db.Column(db.Integer, nullable=False)

    thesis_id = db.Column(db.String(10),
        db.ForeignKey('thesis.id'), nullable=False)
    thesis = db.relationship('Thesis',
        backref=db.backref('reactions', lazy=True))

    __table_args__ = (
        UniqueConstraint('uuid', 'thesis_id', name='u_rctn'),
    )

    def __repr__(self):
        return "<Reaction {} / {}>".format(self.thesis_id, REACTION_NAMES[self.kind])

    def to_dict(self):
        rv = {
            "date": dt_string(self.date),
            "kind": self.kind,
            "thesis": self.thesis_id,
            "uuid": self.uuid
        }
        return rv


class Occasion(db.Model):
    """Represent an occasion for which WOM data exists."""
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.DateTime)
    territory = db.Column(db.String(32), nullable=False)
    title = db.Column(db.String(128), nullable=False)
    wikidata_id = db.Column(db.String(16))
    wikipedia_title = db.Column(db.Text)
    source = db.Column(db.Text)
    preliminary = db.Column(db.Boolean, default=False)

    def __repr__(self):
        prelim = " (preliminary)" if self.preliminary else ""
        return "<Occasion {}: {}{}>".format(self.id, self.title, prelim)

    def to_dict(self, thesis_data=False):
        rv = {
            "id": self.id,
            "date": dt_string(self.date),
            "results": self.result_dict(),
            "source": self.source,
            "results_sources": list(set([r.source for r in self.results])),
            "territory": self.territory,
            "title": self.title,
            "wikidata_id": self.wikidata_id,
            "wikipedia_title": self.wikipedia_title
        }

        if self.preliminary:
            rv["preliminary"] = True

        if thesis_data:
            rv["theses"] = dict()
            for thesis in self.theses:
                rv["theses"][thesis.id] = thesis.text

        return rv

    def result_dict(self):
        rv = dict()
        for r in self.results:
            rv[r.party_repr] = {
                "votes": r.votes,
                "pct": r.pct
            }

            if r.party_repr != r.party_name:
                rv[r.party_repr]["linked_position"] = r.party_name

            if r.wom is False:
                rv[r.party_repr]["missing"] = True
        return rv


class Party(db.Model):
    """Represent a party electable in one of the occasions."""
    name = db.Column(db.String(32), primary_key=True)
    long_name = db.Column(db.Text)

    def __repr__(self):
        return "<Party {}>".format(self.name)

    def to_dict(self):
        return {
            "name": self.name,
            "long_name": self.long_name
        }


class Position(db.Model):
    """Represent a party's position towards a thesis."""
    id = db.Column(db.Integer, primary_key=True)
    value = db.Column(db.Integer, nullable=False)
    text = db.Column(db.Text)

    party_name = db.Column(db.String(32), db.ForeignKey('party.name'),
        nullable=False)
    party = db.relationship('Party', backref=db.backref('positions',
        lazy=True))

    thesis_id = db.Column(db.String(10),
        db.ForeignKey('thesis.id'), nullable=False)
    thesis = db.relationship('Thesis',
        backref=db.backref('positions', lazy=False))

    def __repr__(self):
        return "<Position {}/{}: {}>".format(
            self.thesis_id, self.party_name, self.value)

    def to_dict(self):
        rv = {
            "value": self.value,
            "party": self.party_name,
        }

        if self.text is not None:
            rv["text"] = self.text

        return rv


class Result(db.Model):
    """Represent an official result from an election for a party."""
    id = db.Column(db.Integer, primary_key=True)
    votes = db.Column(db.Integer)
    pct = db.Column(db.Float, nullable=False)
    is_seated = db.Column(db.Boolean, default=False)
    is_mandated = db.Column(db.Boolean, default=False)
    source = db.Column(db.String(256), nullable=True)

    # Is there a position for this result in the corresponding wom?
    wom = db.Column(db.Boolean, default=True)

    # How the name of the party was written for this election
    party_repr = db.Column(db.String(256), nullable=False)
    party_name = db.Column(db.String(32), db.ForeignKey('party.name'),
        nullable=False)
    party = db.relationship('Party', backref=db.backref('results',
        lazy=True))

    occasion_id = db.Column(db.Integer, db.ForeignKey('occasion.id'),
        nullable=False)
    occasion = db.relationship('Occasion',
        backref=db.backref('results', lazy=False))


tags = db.Table('tags',
    db.Column('tag_title',
        db.String(128), db.ForeignKey('tag.title'), primary_key=True),
    db.Column('thesis_id',
        db.String(10), db.ForeignKey('thesis.id'), primary_key=True)
)


class Tag(db.Model):
    """Represent a tag linked to a Wikidata ID."""
    aliases = db.Column(db.Text)
    description = db.Column(db.Text)
    labels = db.Column(db.Text)
    title = db.Column(db.String(128), primary_key=True)
    slug = db.Column(db.String(128), unique=True, nullable=False)
    url = db.Column(db.Text)
    wikidata_id = db.Column(db.String(16))
    wikipedia_title = db.Column(db.String(256))
    wikipedia_summary = db.Column(db.Text)
    image = db.Column(db.String(255))

    def __repr__(self):
        return "<Tag #{}>".format(self.title)

    def make_slug(self):
        self.slug = slugify(self.title)

    def to_dict(self, thesis_count=None, include_theses_ids=False,
            include_related_tags=False, query_root_status=False,
            include_wikipedia_summary=False):
        rv = {
            "title": self.title,
            "slug": self.slug,
            "wikidata_id": self.wikidata_id,
            "url": self.url
        }

        if self.description is not None:
            rv["description"] = self.description

        if self.wikipedia_title is not None:
            rv["wikipedia_title"] = self.wikipedia_title

        if self.wikipedia_summary is not None and include_wikipedia_summary is True:
            rv["wikipedia_summary"] = self.wikipedia_summary

        if self.aliases is not None and len(self.aliases) > 0:
            rv["aliases"] = self.aliases.split(';')

        if self.labels is not None and len(self.labels) > 0:
            rv["labels"] = self.labels.split(';')

        if self.image is not None:
            rv["image"] = self.image

        if thesis_count is not None:
            rv["thesis_count"] = thesis_count

        if include_theses_ids:
            rv["theses"] = [thesis.id for thesis in self.theses]

        if include_related_tags:
            rv["related_tags"] = self.related_tags()

        if query_root_status:
            rv["root"] = self.is_root

        return rv

    def related_tags(self):
        """Return a dictionary of related tags.

        The return value distinguishes between parent tags, which are present
        on more than 80% of this tag's theses and themselves have at least as
        many theses as this tag does - and 'linked' tags, which are just tags
        that are present on this tag's theses.

        The number of returned tags in the 'linked' category is limited to ~15.
        """

        tag_counts = defaultdict(int)
        tags = dict()

        for thesis in self.theses:
            for tag in thesis.tags:
                if tag != self:
                    tag_counts[tag.title] += 1
                    tags[tag.title] = tag

        num_related_tags = 15
        try:
            # Determine the amount of tags where n=num_related_tags theses have
            # more related tags
            cutoff = sorted(tag_counts.values())[::-1][:num_related_tags + 1][-1]
        except IndexError:
            return {}
        else:
            rv = {
                'parents': {},
                'linked': {}
            }

            self_theses_count = len(self.theses)

            for tag in tag_counts.keys():
                if tag_counts[tag] >= cutoff:
                    if tag_counts[tag] >= (0.8 * self_theses_count) and \
                            len(tags[tag].theses) >= self_theses_count:
                        relation = 'parents'
                    else:
                        relation = 'linked'

                    rv[relation][tag] = {
                        "count": tag_counts[tag],
                        "tag": tags[tag].to_dict()
                    }

            return rv

    @property
    def is_root(self):
        """Return true if this tag has no parent tagas in its related tags."""
        rl = self.related_tags()
        return len(rl["parents"]) == 0


class Thesis(db.Model):
    """Represent a single thesis within an occasions thesis set."""
    id = db.Column(db.String(10), primary_key=True)
    title = db.Column(db.Text)
    text = db.Column(db.Text, nullable=False)

    occasion_id = db.Column(db.Integer, db.ForeignKey('occasion.id'),
        nullable=False)
    occasion = db.relationship('Occasion',
        backref=db.backref('theses', lazy=True))

    tags = db.relationship('Tag',
        secondary=tags,
        lazy=False,
        backref=db.backref('theses', order_by=desc(tags.c.thesis_id)))

    def __repr__(self):
        return "<Thesis {}>".format(self.id)

    def to_dict(self, include_tags=True):
        rv = {
            "id": self.id,
            "title": self.title,
            "positions": [position.to_dict() for position in self.positions],
            "tags": [tag.to_dict() for tag in self.tags],
            "occasion_id": self.occasion_id,
            "reactions": self.reactions_dict()
        }

        if self.text is not None:
            rv["text"] = self.text

        return rv

    def reactions_dict(self):
        """Make a tally of all reactions"""
        rv = defaultdict(int)
        for reaction in self.reactions:
            rv[reaction.kind] += 1
        return rv

    def related(self):
        """Return theses with similar tags"""
        from collections import defaultdict
        from operator import itemgetter

        # Collect all theses that share a tag with this one
        # and assign a score based on how big the tag is
        scores = []
        for tag in self.tags:
            score = 1.0 / len(tag.theses)
            if score > 0.03:
                for thesis in tag.theses:
                    if thesis.id != self.id:
                        scores.append((thesis.id, score))

        scores = sorted(scores, key=itemgetter(0))

        # Reduce the list of scores to yield a score per thesis
        acc = []
        prev = (None, 0)
        for score in scores:
            if score[0] == prev[0] or prev[0] is None:
                prev = (score[0], prev[1] + score[1])
            else:
                acc.append(prev)
                prev = score

        # Group results by score
        acc = sorted(acc, key=itemgetter(1), reverse=True)
        collect = defaultdict(list)
        for thesis_id, score in acc:
            collect[score].append(thesis_id)

        rv = list()
        for score in sorted(collect.keys(), reverse=True):
            rv.extend([Thesis.query.get(tid).to_dict() for tid in sorted(collect[score], reverse=True)])
            if len(rv) > 10:
                break
        return rv

if __name__ == '__main__':
    from main import create_app
    app = create_app()

    arg_force = "--force" in sys.argv

    logger.warning("All userdata backed up?")

    if arg_force or input("Reset database? [y/N]") == "y":
        with app.app_context():
            logger.info("Drop and recreate...")
            db.drop_all(app=app)
            db.create_all(app=app)
    logger.info("OK")
