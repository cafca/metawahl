#!/usr/bin/env python

from typing import TYPE_CHECKING

from services import db
from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from .party import Party
    from .thesis import Thesis


class Position(db.Model):
    """Represent a party's position towards a thesis."""

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    value: Mapped[int] = mapped_column(Integer, nullable=False)
    text: Mapped[str | None] = mapped_column(Text)

    party_name: Mapped[str] = mapped_column(
        String(32), ForeignKey("party.name"), nullable=False
    )
    party: Mapped["Party"] = relationship(back_populates="positions")

    thesis_id: Mapped[str] = mapped_column(
        String(10), ForeignKey("thesis.id"), nullable=False
    )
    thesis: Mapped["Thesis"] = relationship(back_populates="positions")

    def __repr__(self):
        return f"<Position {self.thesis_id}/{self.party_name}: {self.value}>"

    def to_dict(self):
        rv = {"value": self.value, "party": self.party_name}

        if self.text is not None:
            rv["text"] = self.text

        return rv
