#!/usr/bin/env python

from typing import TYPE_CHECKING

from services import db
from sqlalchemy import Boolean, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from .election import Election
    from .party import Party


class Result(db.Model):
    """Represent an official result from an election for a party."""

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    votes: Mapped[int | None] = mapped_column(Integer)
    pct: Mapped[float] = mapped_column(Float, nullable=False)
    is_seated: Mapped[bool | None] = mapped_column(Boolean, default=False)
    is_mandated: Mapped[bool | None] = mapped_column(Boolean, default=False)
    source_url: Mapped[str] = mapped_column(String(256), nullable=False)
    source_name: Mapped[str | None] = mapped_column(String(256))

    # Is there a position for this result in the corresponding wom?
    wom: Mapped[bool | None] = mapped_column(Boolean, default=True)

    # How the name of the party was written for this election
    party_repr: Mapped[str] = mapped_column(String(256), nullable=False)
    party_name: Mapped[str] = mapped_column(
        String(32), ForeignKey("party.name"), nullable=False
    )
    party: Mapped["Party"] = relationship(back_populates="results")

    election_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("election.id"), nullable=False
    )
    election: Mapped["Election"] = relationship(back_populates="results")
