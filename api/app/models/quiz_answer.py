#!/usr/bin/env python

import datetime
from typing import TYPE_CHECKING

from services import db
from sqlalchemy import DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from . import dt_string

if TYPE_CHECKING:
    from .thesis import Thesis


class QuizAnswer(db.Model):
    """Represents an answer given by a user in a quiz."""

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    uuid: Mapped[str] = mapped_column(String(36), nullable=False)
    date: Mapped[datetime.datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.datetime.utcnow
    )
    answer: Mapped[int] = mapped_column(Integer, nullable=False)

    thesis_id: Mapped[str] = mapped_column(
        String(10), ForeignKey("thesis.id"), nullable=False
    )
    thesis: Mapped["Thesis"] = relationship(back_populates="quiz_answers")

    __table_args__ = (UniqueConstraint("uuid", "thesis_id", name="u_quizanswer"),)

    def __repr__(self):
        return f"<QuizAnswer {self.thesis_id} / {self.answer}>"

    def to_dict(self):
        rv = {
            "date": dt_string(self.date),
            "answer": self.answer,
            "thesis": self.thesis_id,
            "uuid": self.uuid,
        }
        return rv
