#!/usr/bin/env python
# -*- coding: utf-8 -*-

from services import db


class Party(db.Model):
    """Represent a party electable in one of the elections."""

    name = db.Column(db.String(32), primary_key=True)
    long_name = db.Column(db.Text)

    def __repr__(self):
        return "<Party {}>".format(self.name)

    def to_dict(self):
        return {"name": self.name, "long_name": self.long_name}
