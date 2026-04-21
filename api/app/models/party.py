#!/usr/bin/env python

from typing import TYPE_CHECKING

from services import db
from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from .position import Position
    from .result import Result


class Party(db.Model):
    """Represent a party electable in one of the elections."""

    name: Mapped[str] = mapped_column(String(32), primary_key=True)
    long_name: Mapped[str | None] = mapped_column(Text)

    positions: Mapped[list["Position"]] = relationship(back_populates="party")
    results: Mapped[list["Result"]] = relationship(back_populates="party")

    def __repr__(self):
        return f"<Party {self.name}>"

    def to_dict(self):
        return {"name": self.name, "long_name": self.long_name}
