#!/usr/bin/env python
# -*- coding: utf-8 -*-

from collections import defaultdict
from operator import itemgetter
from sqlalchemy import func, desc
from services import db

from .quiz_answer import QuizAnswer
from .tag import tags


class Thesis(db.Model):
    """Represent a single thesis within an elections thesis set."""

    id = db.Column(db.String(10), primary_key=True)
    title = db.Column(db.Text)
    text = db.Column(db.Text, nullable=False)

    election_id = db.Column(db.Integer, db.ForeignKey("election.id"), nullable=False)
    election = db.relationship(
        "Election", backref=db.backref("theses", lazy=True)
    )

    tags = db.relationship(
        "Tag",
        secondary=tags,
        lazy=False,
        backref=db.backref("theses", order_by=desc(tags.c.thesis_id)),
    )

    def __repr__(self):
        return "<Thesis {}>".format(self.id)

    def to_dict(self, include_tags=True):
        rv = {
            "id": self.id,
            "title": self.title,
            "positions": [position.to_dict() for position in self.positions],
            "tags": [tag.to_dict() for tag in self.tags],
            "election_id": self.election_id,
        }

        if self.text is not None:
            rv["text"] = self.text

        return rv

    def related(self):
        """Return theses with similar tags"""

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
            rv.extend(
                [
                    Thesis.query.get(tid).to_dict()
                    for tid in sorted(collect[score], reverse=True)
                ]
            )
            if len(rv) > 10:
                break
        return rv

    def quiz_tally(self):
        rv = None

        base = (
            db.session.query(Thesis.id, func.count(QuizAnswer.id))
            .join(Thesis.quiz_answers)
            .filter(Thesis.id == self.id)
            .group_by(Thesis.id)
        )

        y = base.filter(QuizAnswer.answer == 1).all()
        n = base.filter(QuizAnswer.answer == -1).all()

        return (y[0][1] if len(y) > 0 else 0, n[0][1] if len(n) > 0 else 0)
