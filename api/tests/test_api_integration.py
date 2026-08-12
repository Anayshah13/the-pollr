"""Integration tests — require DATABASE_URL pointing at a seeded Pollr database."""

import os
from uuid import uuid4

import pytest
from httpx import ASGITransport, AsyncClient

pytestmark = pytest.mark.asyncio

DATABASE_URL = os.getenv("DATABASE_URL", "")


@pytest.fixture
async def client():
    if not DATABASE_URL:
        pytest.skip("DATABASE_URL not set")
    from app.main import app

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


async def test_health_and_session(client: AsyncClient):
    r = await client.get("/health")
    assert r.status_code == 200

    r = await client.post("/api/v1/sessions")
    assert r.status_code == 200
    assert "session_id" in r.json()
    assert "pollr_sid" in r.cookies


async def test_swipe_and_leaderboard(client: AsyncClient):
    sid = str(uuid4())
    headers = {"X-Pollr-Session": sid}
    await client.post("/api/v1/sessions", headers=headers)

    r = await client.post(
        "/api/v1/votes/swipe",
        json={"winner_id": "ieee", "loser_id": "acm"},
        headers=headers,
    )
    assert r.status_code == 200, r.text

    r2 = await client.post(
        "/api/v1/votes/swipe",
        json={"winner_id": "acm", "loser_id": "ieee"},
        headers=headers,
    )
    assert r2.status_code == 409

    board = await client.get("/api/v1/analytics/leaderboard?scope=all")
    assert board.status_code == 200
    data = board.json()
    assert data["total_pairwise_votes"] >= 1
    ieee = next(row for row in data["rows"] if row["id"] == "ieee")
    acm = next(row for row in data["rows"] if row["id"] == "acm")
    assert ieee["modes"]["swipe_n"] >= 1
    assert acm["modes"]["swipe_n"] >= 1
    assert ieee["pollr_score"] is not None

    h2h = await client.get("/api/v1/analytics/head-to-head?a=ieee&b=acm")
    assert h2h.status_code == 200
    assert h2h.json()["total"] >= 1


async def test_rank_scope(client: AsyncClient):
    sid = str(uuid4())
    headers = {"X-Pollr-Session": sid}
    await client.post("/api/v1/sessions", headers=headers)
    clubs = [
        c["id"]
        for c in (await client.get("/api/v1/committees")).json()
        if c["category"] == "Clubs"
    ]
    assert len(clubs) >= 2
    r = await client.put(
        "/api/v1/votes/rank",
        json={"scope": "Clubs", "ordered_ids": clubs},
        headers=headers,
    )
    assert r.status_code == 200, r.text
