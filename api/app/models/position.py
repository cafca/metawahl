#!/usr/bin/env python
# -*- coding: utf-8 -*-

from services import db

class Position(db.Model):
    """Represent a party's position towards a thesis."""

    id = db.Column(db.Integer, primary_key=True)
    value = db.Column(db.Integer, nullable=False)
    text = db.Column(db.Text)

    party_name = db.Column(db.String(32), db.ForeignKey("party.name"), nullable=False)
    party = db.relationship("Party", backref=db.backref("positions", lazy=True))

    thesis_id = db.Column(db.String(10), db.ForeignKey("thesis.id"), nullable=False)
    thesis = db.relationship("Thesis", backref=db.backref("positions", lazy=False))

    def __repr__(self):
        return "<Position {}/{}: {}>".format(
            self.thesis_id, self.party_name, self.value
        )

    def to_dict(self):
        rv = {"value": self.value, "party": self.party_name}

        if self.text is not None:
            rv["text"] = self.text

        return rv
