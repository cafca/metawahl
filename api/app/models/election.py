#!/usr/bin/env python
# -*- coding: utf-8 -*-

from services import db
from . import dt_string

class Election(db.Model):
    """Represent an election for which WOM data exists."""

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
        return "<Election {}: {}{}>".format(self.id, self.title, prelim)

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
            "wikipedia_title": self.wikipedia_title,
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
            rv[r.party_repr] = {"votes": r.votes, "pct": r.pct}

            if r.party_repr != r.party_name:
                rv[r.party_repr]["linked_position"] = r.party_name

            if r.wom is False:
                rv[r.party_repr]["missing"] = True
        return rv
