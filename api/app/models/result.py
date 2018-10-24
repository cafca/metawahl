#!/usr/bin/env python
# -*- coding: utf-8 -*-

from services import db


class Result(db.Model):
    """Represent an official result from an election for a party."""

    id = db.Column(db.Integer, primary_key=True)
    votes = db.Column(db.Integer)
    pct = db.Column(db.Float, nullable=False)
    is_seated = db.Column(db.Boolean, default=False)
    is_mandated = db.Column(db.Boolean, default=False)
    source_url = db.Column(db.String(256), nullable=False)
    source_name = db.Column(db.String(256), nullable=True)

    # Is there a position for this result in the corresponding wom?
    wom = db.Column(db.Boolean, default=True)

    # How the name of the party was written for this election
    party_repr = db.Column(db.String(256), nullable=False)
    party_name = db.Column(db.String(32), db.ForeignKey("party.name"), nullable=False)
    party = db.relationship("Party", backref=db.backref("results", lazy=True))

    election_id = db.Column(db.Integer, db.ForeignKey("election.id"), nullable=False)
    election = db.relationship("Election", backref=db.backref("results", lazy=False))
