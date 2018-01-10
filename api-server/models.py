#!/usr/bin/env python3
"""
Metawahl Flask-SQLAlchemy models

"""
import json

from main import db, logger
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func
from slugify import slugify


categories = db.Table('categories',
    db.Column('category.name', db.String(64), db.ForeignKey('category.name'),
        primary_key=True),
    db.Column('thesis_id', db.String(10), db.ForeignKey('thesis.id'),
        primary_key=True)
)


class Category(db.Model):
    """Represent one of the 27 categories."""
    name = db.Column(db.String(64), primary_key=True)
    slug = db.Column(db.String(64), unique=True)

    def __repr__(self):
        return "<Category {}>".format(self.name)

    def __init__(self, name):
        self.name = name
        self.make_slug()

    def make_slug(self):
        self.slug = slugify(self.name)

    def to_dict(self, thesis_data=False):
        rv = {
            "name": self.name,
            "slug": self.slug
        }

        if thesis_data:
            rv["theses"] = [thesis.to_dict() for thesis in self.theses]
            rv["occasions"] = {thesis.occasion_id: thesis.occasion.to_dict()
                for thesis in self.theses}
        else:
            rv["theses"] = [thesis.id for thesis in self.theses]
        return rv

    @classmethod
    def uncategorized(cls, thesis_data=False):
        rv = {
            "name": "(Noch in keinem Themenbereich)",
            "slug": "_uncategorized"
        }

        theses = db.session.query(Thesis) \
            .filter(Thesis.categories == None) \
            .order_by(Thesis.id)

        if thesis_data:
            rv["theses"] = [thesis.to_dict() for thesis in theses]
            rv["occasions"] = {thesis.occasion_id: thesis.occasion.to_dict()
                for thesis in theses}
        else:
            rv["theses"] = [thesis.id for thesis in theses]

        return rv


class Occasion(db.Model):
    """Represent an occasion for which WOM data exists."""
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.DateTime)
    territory = db.Column(db.String(32), nullable=False)
    title = db.Column(db.String(128), nullable=False)
    wikidata_id = db.Column(db.String(16))
    source = db.Column(db.Text)

    def __repr__(self):
        return "<Occasion {}: {}>".format(self.id, self.title)

    def to_dict(self, thesis_data=False):
        rv = {
            "id": self.id,
            "date": self.date.isoformat(),
            "territory": self.territory,
            "title": self.title,
            "wikidata_id": self.wikidata_id,
            "source": self.source
        }

        if thesis_data:
            rv["theses"] = dict()
            for thesis in self.theses:
                rv["theses"][thesis.id] = thesis.text
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

    def __repr__(self):
        return "<Tag #{}>".format(self.title)

    def make_slug(self):
        self.slug = slugify(self.title)

    def to_dict(self, thesis_count=None, include_theses_ids=False):
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

        if self.aliases is not None and len(self.aliases) > 0:
            rv["aliases"] = self.aliases.split(';')

        if self.labels is not None and len(self.labels) > 0:
            rv["labels"] = self.labels.split(';')

        if thesis_count is not None:
            rv["thesis_count"] = thesis_count

        if include_theses_ids:
            rv["theses"] = [thesis.id for thesis in self.theses]

        return rv


class Thesis(db.Model):
    """Represent a single thesis within an occasions thesis set."""
    id = db.Column(db.String(10), primary_key=True)
    title = db.Column(db.Text)
    text = db.Column(db.Text, nullable=False)

    occasion_id = db.Column(db.Integer, db.ForeignKey('occasion.id'),
        nullable=False)
    occasion = db.relationship('Occasion',
        backref=db.backref('theses', lazy=True))

    tags = db.relationship('Tag', secondary=tags, lazy=False,
       backref=db.backref('theses'))

    categories = db.relationship('Category', secondary=categories, lazy=False,
       backref=db.backref('theses'))

    def __repr__(self):
        return "<Thesis {}>".format(self.id)

    def to_dict(self, include_tags=True):
        rv = {
            "id": self.id,
            "title": self.title,
            "categories": [category.slug for category in self.categories],
            "positions": [position.to_dict() for position in self.positions],
            "tags": [tag.to_dict() for tag in self.tags],
            "occasion_id": self.occasion_id
        }

        if self.text is not None:
            rv["text"] = self.text

        return rv


if __name__ == '__main__':
    from main import create_app
    app = create_app()

    if input("Reset database? [y/N]") == "y":
        with app.app_context():
            logger.info("Drop and recreate...")
            db.drop_all(app=app)
            db.create_all(app=app)
    logger.info("OK")
