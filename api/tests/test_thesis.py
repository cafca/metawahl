"""Ported from tests/test_thesis.tavern.yaml."""


def test_specific_thesis(client):
    r = client.get("/v3/thesis/WOM-001-01")
    assert r.status_code == 200
    assert r.mimetype == "application/json"


def test_unknown_thesis_404(client):
    r = client.get("/v3/thesis/WOM-001-99")
    assert r.status_code == 404


def test_thesis_tags_update_without_admin_key(client):
    r = client.post("/v3/thesis/WOM-001-01/tags/")
    assert r.status_code == 200
    assert r.get_json()["error"] == "Invalid admin key"


def test_thesis_tags_update_missing_thesis(client):
    r = client.post("/v3/thesis/WOM-001-99/tags/")
    assert r.status_code == 404
