#!/usr/bin/env python

from datetime import datetime
from typing import TYPE_CHECKING

from services import db
from sqlalchemy import Boolean, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from . import dt_string

if TYPE_CHECKING:
    from .result import Result
    from .thesis import Thesis


class Election(db.Model):
    """Represent an election for which WOM data exists."""

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    date: Mapped[datetime | None] = mapped_column(DateTime)
    territory: Mapped[str] = mapped_column(String(32), nullable=False)
    title: Mapped[str] = mapped_column(String(128), nullable=False)
    wikidata_id: Mapped[str | None] = mapped_column(String(16))
    wikipedia_title: Mapped[str | None] = mapped_column(Text)
    source: Mapped[str | None] = mapped_column(Text)
    preliminary: Mapped[bool | None] = mapped_column(Boolean, default=False)

    theses: Mapped[list["Thesis"]] = relationship(back_populates="election")
    results: Mapped[list["Result"]] = relationship(back_populates="election", lazy="joined")

    def __repr__(self):
        prelim = " (preliminary)" if self.preliminary else ""
        return f"<Election {self.id}: {self.title}{prelim}>"

    def to_dict(self, thesis_data=False):
        rv = {
            "id": self.id,
            "date": dt_string(self.date),
            "results": self.result_dict(),
            "source": self.source,
            "results_source": {"url": self.results[0].source_url},
            "territory": self.territory,
            "title": self.title,
            "wikidata_id": self.wikidata_id,
            "wikipedia_title": self.wikipedia_title,
        }

        if self.results[0].source_name is not None:
            rv["results_source"]["name"] = self.results[0].source_name

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
