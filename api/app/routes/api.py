from fastapi import APIRouter, Depends, Query, Request, Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.db import get_db
from app.deps import current_session
from app.models import Committee, VoterSession
from app.schemas.votes import (
    CommitteeOut,
    HeadToHeadOut,
    InsightsOut,
    LeaderboardOut,
    RankVoteIn,
    RankVoteOut,
    SessionOut,
    SwipeVoteIn,
    SwipeVoteOut,
    TierVoteIn,
    TierVoteOut,
)
from app.services.aggregation import build_leaderboard, capture_snapshots, head_to_head
from app.services.votes import record_swipe, upsert_rank, upsert_tier

router = APIRouter(prefix="/api/v1")


def _set_session_cookie(response: Response, session_id: str) -> None:
    settings = get_settings()
    response.set_cookie(
        key=settings.cookie_name,
        value=session_id,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
        max_age=60 * 60 * 24 * 365,
        path="/",
    )


@router.post("/sessions", response_model=SessionOut)
async def create_session(
    response: Response,
    session: VoterSession = Depends(current_session),
) -> SessionOut:
    _set_session_cookie(response, session.id)
    return SessionOut(session_id=session.id)


@router.get("/committees", response_model=list[CommitteeOut])
async def list_committees(db: AsyncSession = Depends(get_db)) -> list[CommitteeOut]:
    result = await db.execute(select(Committee).order_by(Committee.name))
    return [
        CommitteeOut(
            id=c.id,
            slug=c.slug,
            name=c.name,
            short_name=c.short_name,
            category=c.category,
            tagline=c.tagline,
            established=c.established,
            instagram_url=c.instagram_url,
        )
        for c in result.scalars().all()
    ]


@router.post("/votes/swipe", response_model=SwipeVoteOut)
async def vote_swipe(
    payload: SwipeVoteIn,
    response: Response,
    session: VoterSession = Depends(current_session),
    db: AsyncSession = Depends(get_db),
) -> SwipeVoteOut:
    vote = await record_swipe(db, session, payload)
    _set_session_cookie(response, session.id)
    return SwipeVoteOut(ok=True, winner_id=vote.winner_id, loser_id=vote.loser_id)


@router.put("/votes/tier", response_model=TierVoteOut)
async def vote_tier(
    payload: TierVoteIn,
    response: Response,
    session: VoterSession = Depends(current_session),
    db: AsyncSession = Depends(get_db),
) -> TierVoteOut:
    submission = await upsert_tier(db, session, payload)
    _set_session_cookie(response, session.id)
    return TierVoteOut(ok=True, submission_id=submission.id, placed=len(payload.placements))


@router.put("/votes/rank", response_model=RankVoteOut)
async def vote_rank(
    payload: RankVoteIn,
    response: Response,
    session: VoterSession = Depends(current_session),
    db: AsyncSession = Depends(get_db),
) -> RankVoteOut:
    submission = await upsert_rank(db, session, payload)
    _set_session_cookie(response, session.id)
    return RankVoteOut(
        ok=True,
        submission_id=submission.id,
        scope=submission.scope,
        ranked=len(payload.ordered_ids),
    )


@router.get("/analytics/leaderboard", response_model=LeaderboardOut)
async def leaderboard(
    scope: str = Query(default="all"),
    db: AsyncSession = Depends(get_db),
) -> LeaderboardOut:
    allowed = {
        "all",
        "Student Chapters",
        "Tech Committees",
        "Clubs",
        "SAE Teams",
        "IETE Teams",
    }
    if scope not in allowed:
        scope = "all"
    return await build_leaderboard(db, scope)


@router.get("/analytics/head-to-head", response_model=HeadToHeadOut)
async def h2h(
    a: str = Query(...),
    b: str = Query(...),
    db: AsyncSession = Depends(get_db),
) -> HeadToHeadOut:
    a_wins, b_wins, total = await head_to_head(db, a, b)
    share = round(100.0 * a_wins / total, 1) if total > 0 else None
    return HeadToHeadOut(
        a=a,
        b=b,
        a_wins=a_wins,
        b_wins=b_wins,
        total=total,
        a_share=share,
        sufficient=total >= 3,
    )


@router.get("/analytics/insights", response_model=InsightsOut)
async def insights(db: AsyncSession = Depends(get_db)) -> InsightsOut:
    board = await build_leaderboard(db, "all")
    controversial = None
    with_c = [r for r in board.rows if r.controversy is not None]
    if with_c:
        controversial = max(with_c, key=lambda r: (r.controversy or 0, r.sample_size))

    leaders: dict[str, object] = {}
    for cat in ["Student Chapters", "Tech Committees", "Clubs", "SAE Teams", "IETE Teams"]:
        cat_board = await build_leaderboard(db, cat)
        scored = [r for r in cat_board.rows if r.pollr_score is not None]
        leaders[cat] = scored[0] if scored else (cat_board.rows[0] if cat_board.rows else None)

    return InsightsOut(
        most_controversial=controversial,
        category_leaders=leaders,  # type: ignore[arg-type]
        methodology=board.methodology,
    )


@router.post("/analytics/snapshot")
async def snapshot(
    request: Request,
    scope: str = Query(default="all"),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Capture current scores for trend history. Intended for cron/admin use."""
    n = await capture_snapshots(db, scope)
    return {"ok": True, "captured": n, "scope": scope}
