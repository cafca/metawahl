"""Ported from tests/test_quiz_answers.tavern.yaml."""


def test_quiz_get(client):
    r = client.get("/v3/quiz/1")
    assert r.status_code == 200
    assert r.mimetype == "application/json"


def test_quiz_get_with_thesis_num(client):
    r = client.get("/v3/quiz/1/00")
    assert r.status_code == 200
    assert r.mimetype == "application/json"


def test_quiz_post_answer(client):
    r = client.post(
        "/v3/quiz/001/01",
        json={"uuid": "test-uuid", "answer": 1},
    )
    assert r.status_code == 200
    assert r.mimetype == "application/json"


def test_quiz_post_missing_thesis_num(client):
    r = client.post(
        "/v3/quiz/001",
        json={"uuid": "test-uuid", "answer": 1},
    )
    assert r.status_code == 422


def test_quiz_post_missing_data(client):
    r = client.post(
        "/v3/quiz/001/01",
        json={"answer": 1},
    )
    assert r.status_code == 422


def test_quiz_post_unknown_thesis(client):
    r = client.post(
        "/v3/quiz/001/99",
        json={"uuid": "test-uuid2", "answer": 1},
    )
    assert r.status_code == 404


def test_quiz_post_unknown_election(client):
    r = client.post(
        "/v3/quiz/099/99",
        json={"uuid": "test-uuid2", "answer": 1},
    )
    assert r.status_code == 404
