"""Shared pytest fixtures for the Metawahl API test suite."""

from datetime import datetime

import pytest
from main import create_app
from models import Election, Party, Position, Result, Tag, Thesis
from services import cache as _cache
from services import db as _db


@pytest.fixture(scope="session")
def app():
    """Flask app configured from test.conf.py (METAWAHL_CONFIG env var)."""
    flask_app = create_app()
    flask_app.config["TESTING"] = True
    with flask_app.app_context():
        _db.create_all()
    yield flask_app
    with flask_app.app_context():
        _db.drop_all()


@pytest.fixture
def db(app):
    """Per-test DB session: wipes + seeds sample data, tears down after."""
    with app.app_context():
        _db.drop_all()
        _db.create_all()
        _cache.clear()
        _seed(_db)
        yield _db
        _db.session.remove()


@pytest.fixture
def client(app, db):
    """Flask test client with the per-test DB fixture active."""
    with app.test_client() as c:
        yield c


@pytest.fixture
def admin_key(app):
    return app.config["ADMIN_KEY"]


def _seed(db):
    """Minimal sample data: 1 election with 2 theses, 1 tag, 1 party, positions."""
    party = Party(name="TEST", long_name="Test Partei")
    db.session.add(party)

    election = Election(
        id=1,
        title="Test Wahl",
        territory="berlin",
        date=datetime(2024, 1, 1),
        wikidata_id="Q1",
        source="https://example.org/wom",
    )
    db.session.add(election)

    result = Result(
        election=election,
        party=party,
        party_repr="TEST",
        party_name="TEST",
        pct=50.0,
        votes=1000,
        source_url="https://example.org/ergebnis",
        source_name="Test",
        wom=True,
    )
    db.session.add(result)

    tag = Tag(
        title="Schule",
        slug="schule",
        wikidata_id="Q123",
        url="https://example.org/schule",
    )
    db.session.add(tag)

    for n in (1, 2):
        thesis = Thesis(
            id=f"WOM-001-{n:02d}",
            title=f"Thesis {n}",
            text=f"Text of thesis {n}",
            election=election,
        )
        db.session.add(thesis)
        db.session.add(
            Position(thesis=thesis, party=party, value=1, text="ja")
        )
        # Seed Schule only on the first thesis; the second stays tag-less so
        # mutation tests can add tags without colliding with seed data.
        if n == 1:
            tag.theses.append(thesis)

    db.session.commit()
