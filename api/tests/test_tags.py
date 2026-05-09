"""Ported from tests/test_tags.tavern.yaml."""


def test_tags_list(client):
    r = client.get("/v3/tags/")
    assert r.status_code == 200
    assert r.mimetype == "application/json"


def test_tags_json_download(client):
    r = client.get("/v3/tags.json")
    assert r.status_code == 200
    assert r.mimetype == "text/json"
    assert r.headers["Content-Disposition"] == "attachment; filename=tags.json"


def test_tags_list_with_thesis_ids(client):
    r = client.get("/v3/tags/?include_theses_ids=1")
    assert r.status_code == 200
    assert r.mimetype == "application/json"


def test_specific_tag(client):
    r = client.get("/v3/tags/schule")
    assert r.status_code == 200
    assert r.mimetype == "application/json"


def test_unknown_tag_404(client):
    r = client.get("/v3/tags/_schule")
    assert r.status_code == 404
