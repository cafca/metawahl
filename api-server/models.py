#!/usr/bin/env python3
"""
Metawahl Flask-SQLAlchemy models

"""
import json

from main import db, logger
from flask_sqlalchemy import SQLAlchemy


categories = db.Table('categories',
    db.Column('category.name', db.String(64), db.ForeignKey('category.name'),
        primary_key=True),
    db.Column('thesis_id', db.String(10), db.ForeignKey('thesis.id'),
        primary_key=True)
)


class Category(db.Model):
    """Represent one of the 27 categories."""
    name = db.Column(db.String(64), primary_key=True)

    def __repr__(self):
        return "<Category {}>".format(self.name)

    def to_dict(self, thesis_data=False, tag_data=False):
        rv = {
            "name": self.name,
        }

        if thesis_data:
            rv["theses"] = [
                thesis.to_dict(tag_data=tag_data) for thesis in self.theses
            ]
        else:
            rv["theses"] = [thesis.id for thesis in self.theses]
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

    def to_dict(self):
        rv = {
            "id": self.id,
            "date": self.date.isoformat(),
            "title": self.title,
            "wikidata_id": self.wikidata_id,
            "source": self.source,
            "theses": dict()
        }

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
        backref=db.backref('positions', lazy=True))

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
    title = db.Column(db.String(128), primary_key=True)
    wikidata_id = db.Column(db.String(16))
    description = db.Column(db.Text)
    url = db.Column(db.Text)

    def __repr__(self):
        return "<Tag #{}>".format(self.title)

    def to_dict(self):
        rv = {
            "title": self.title,
            "wikidata_id": self.wikidata_id,
            "url": self.url
        }

        if self.description is not None:
            rv["description"] = self.description

        return rv


class Thesis(db.Model):
    """Represent a single thesis within an occasions thesis set."""
    id = db.Column(db.String(10), primary_key=True)
    title = db.Column(db.Text)
    text = db.Column(db.Text, nullable=False)

    occasion_id = db.Column(db.Integer, db.ForeignKey('occasion.id'),
        nullable=False)
    occasion = db.relationship('Occasion',
        backref=db.backref('theses', lazy=False))

    tags = db.relationship('Tag', secondary=tags, lazy=False,
       backref=db.backref('theses'))

    categories = db.relationship('Category', secondary=categories, lazy=False,
       backref=db.backref('theses'))

    def __repr__(self):
        return "<Thesis {}>".format(self.id)

    def to_dict(self, tag_data=False):
        rv = {
            "id": self.id,
            "title": self.title,
            "categories": [category.name for category in self.categories],
            "positions": [position.to_dict() for position in self.positions]
        }

        if self.text is not None:
            rv["text"] = self.text

        if tag_data:
            rv["tags"] = [tag.to_dict() for tag in self.tags]
        else:
            rv["tags"] = [tag.title for tag in self.tags]

        return rv


if __name__ == '__main__':
    from main import create_app

    if input("Reset database? [y/N]") == "y":
        app = create_app()

        with app.app_context():
            logger.info("Drop and recreate...")
            db.drop_all(app=app)
            db.create_all(app=app)

            logger.info("Adding back categories...")
            for name in app.config.get("CATEGORY_NAMES"):
                db.session.add(Category(name=name))
            db.session.commit()
    logger.info("OK")