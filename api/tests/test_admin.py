"""Admin endpoint coverage — new in the pytest rewrite.

Covers POST /v3/thesis/<id>/tags/ (ThesisTagsView) and
DELETE /v3/tags/<slug> (tag_delete). The Tavern suite only
exercised 401/404 branches of the tags POST and had no coverage
at all for the DELETE route.
"""

from models import Tag
from services import db as _db
from sqlalchemy import select


def _tag_payload(**overrides):
    data = {
        "wikidata_id": "Q999",
        "title": "Kitas",
        "url": "https://example.org/kitas",
    }
    data.update(overrides)
    return data


# ---------------------------------------------------------------------------
# POST /v3/thesis/<id>/tags/
# ---------------------------------------------------------------------------


def test_thesis_tags_post_missing_admin_key(client):
    r = client.post(
        "/v3/thesis/WOM-001-01/tags/",
        json={"add": [_tag_payload()]},
    )
    assert r.status_code == 200
    body = r.get_json()
    assert body["error"] == "Invalid admin key"


def test_thesis_tags_post_wrong_admin_key(client):
    r = client.post(
        "/v3/thesis/WOM-001-01/tags/",
        json={"admin_key": "nope", "add": [_tag_payload()]},
    )
    assert r.status_code == 200
    assert r.get_json()["error"] == "Invalid admin key"


def test_thesis_tags_post_unknown_thesis(client, admin_key):
    r = client.post(
        "/v3/thesis/WOM-001-99/tags/",
        json={"admin_key": admin_key, "add": [_tag_payload()]},
    )
    assert r.status_code == 404


def test_thesis_tags_post_add_creates_new_tag(client, admin_key, app):
    r = client.post(
        "/v3/thesis/WOM-001-01/tags/",
        json={"admin_key": admin_key, "add": [_tag_payload()]},
    )
    assert r.status_code == 200
    body = r.get_json()
    assert body["error"] is None
    tag_slugs = [t["slug"] for t in body["data"]["tags"]]
    assert "kitas" in tag_slugs

    with app.app_context():
        tag = _db.session.execute(
            select(Tag).where(Tag.slug == "kitas")
        ).scalar_one_or_none()
        assert tag is not None
        assert tag.wikidata_id == "Q999"


def test_thesis_tags_post_add_reuses_existing_by_wikidata_id(
    client, admin_key, app
):
    # Seeded tag Schule has wikidata_id Q123. Posting with that wikidata_id
    # but a different title must not create a duplicate Tag row.
    r = client.post(
        "/v3/thesis/WOM-001-02/tags/",
        json={
            "admin_key": admin_key,
            "add": [
                _tag_payload(
                    wikidata_id="Q123",
                    title="Different Title",
                    url="https://example.org/different",
                )
            ],
        },
    )
    assert r.status_code == 200
    assert r.get_json()["error"] is None

    with app.app_context():
        tags = _db.session.execute(
            select(Tag).where(Tag.wikidata_id == "Q123")
        ).scalars().all()
        assert len(tags) == 1
        assert tags[0].title == "Schule"  # existing title preserved


def test_thesis_tags_post_remove_drops_tag_from_thesis_only(
    client, admin_key, app
):
    r = client.post(
        "/v3/thesis/WOM-001-01/tags/",
        json={"admin_key": admin_key, "remove": ["Schule"]},
    )
    assert r.status_code == 200
    body = r.get_json()
    assert body["error"] is None
    assert all(t["title"] != "Schule" for t in body["data"]["tags"])

    # The Tag row itself is not deleted.
    with app.app_context():
        tag = _db.session.execute(
            select(Tag).where(Tag.title == "Schule")
        ).scalar_one_or_none()
        assert tag is not None


# ---------------------------------------------------------------------------
# DELETE /v3/tags/<slug>
# ---------------------------------------------------------------------------


def test_tag_delete_wrong_admin_key(client):
    r = client.delete("/v3/tags/schule", json={"admin_key": "nope"})
    assert r.status_code == 401
    assert r.get_json()["error"] == "Invalid admin password"


def test_tag_delete_unknown_slug(client, admin_key):
    r = client.delete(
        "/v3/tags/does-not-exist",
        json={"admin_key": admin_key},
    )
    assert r.status_code == 404


def test_tag_delete_happy_path(client, admin_key, app):
    r = client.delete("/v3/tags/schule", json={"admin_key": admin_key})
    assert r.status_code == 200

    with app.app_context():
        tag = _db.session.execute(
            select(Tag).where(Tag.slug == "schule")
        ).scalar_one_or_none()
        assert tag is None

    # Subsequent GET now 404s.
    r2 = client.get("/v3/tags/schule")
    assert r2.status_code == 404
