#!/usr/bin/env python
# -*- coding: utf-8 -*-

import datetime
from sqlalchemy import UniqueConstraint
from services import db
from . import dt_string


class QuizAnswer(db.Model):
    """Represents an answer given by a user in a quiz."""

    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(36), nullable=False)
    date = db.Column(db.DateTime, nullable=False, default=datetime.datetime.utcnow)
    answer = db.Column(db.Integer, nullable=False)

    thesis_id = db.Column(db.String(10), db.ForeignKey("thesis.id"), nullable=False)
    thesis = db.relationship("Thesis", backref=db.backref("quiz_answers", lazy=True))

    __table_args__ = (UniqueConstraint("uuid", "thesis_id", name="u_quizanswer"),)

    def __repr__(self):
        return "<QuizAnswer {} / {}>".format(self.thesis_id, self.answer)

    def to_dict(self):
        rv = {
            "date": dt_string(self.date),
            "answer": self.answer,
            "thesis": self.thesis_id,
            "uuid": self.uuid,
        }
        return rv
