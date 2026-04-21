"""Ported from tests/test_elections.tavern.yaml."""


def test_elections_list(client):
    r = client.get("/v3/elections/")
    assert r.status_code == 200
    assert r.mimetype == "application/json"


def test_elections_list_with_thesis_data(client):
    r = client.get("/v3/elections/?thesis_data=1")
    assert r.status_code == 200
    assert r.mimetype == "application/json"


def test_specific_election(client):
    r = client.get("/v3/elections/1")
    assert r.status_code == 200
    assert r.mimetype == "application/json"


def test_unknown_election_404(client):
    r = client.get("/v3/elections/999")
    assert r.status_code == 404
