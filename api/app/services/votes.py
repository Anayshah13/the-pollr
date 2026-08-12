from __future__ import annotations

import hashlib
from datetime import datetime, timedelta, timezone
from uuid import uuid4

from fastapi import HTTPException, status
from sqlalchemy import delete, func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.models import (
    Committee,
    PairwiseVote,
    RankPosition,
    RankSubmission,
    TierPlacement,
    TierSubmission,
    VoterSession,
)
from app.schemas.votes import RankVoteIn, SwipeVoteIn, TierVoteIn
from app.services.scoring import canonical_pair


def hash_value(value: str | None, salt: str) -> str | None:
    if not value:
        return None
    return hashlib.sha256(f"{salt}:{value}".encode()).hexdigest()


async def get_or_create_session(
    db: AsyncSession,
    session_id: str | None,
    *,
    ip: str | None,
    user_agent: str | None,
) -> VoterSession:
    settings = get_settings()
    ip_hash = hash_value(ip, settings.ip_hash_salt)
    ua_hash = hash_value(user_agent, settings.ip_hash_salt)

    if session_id:
        result = await db.execute(select(VoterSession).where(VoterSession.id == session_id))
        existing = result.scalar_one_or_none()
        if existing:
            existing.last_seen_at = datetime.now(timezone.utc)
            existing.ip_hash = ip_hash or existing.ip_hash
            existing.user_agent_hash = ua_hash or existing.user_agent_hash
            await db.commit()
            await db.refresh(existing)
            return existing

    session = VoterSession(
        id=session_id or str(uuid4()),
        ip_hash=ip_hash,
        user_agent_hash=ua_hash,
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session


async def _assert_committees_exist(db: AsyncSession, ids: list[str]) -> None:
    unique = list(set(ids))
    result = await db.execute(select(Committee.id).where(Committee.id.in_(unique)))
    found = {row[0] for row in result.all()}
    missing = [i for i in unique if i not in found]
    if missing:
        raise HTTPException(status_code=400, detail=f"Unknown committees: {', '.join(missing)}")


async def record_swipe(db: AsyncSession, session: VoterSession, payload: SwipeVoteIn) -> PairwiseVote:
    settings = get_settings()
    if payload.winner_id == payload.loser_id:
        raise HTTPException(status_code=400, detail="winner and loser must differ")

    await _assert_committees_exist(db, [payload.winner_id, payload.loser_id])

    since = datetime.now(timezone.utc) - timedelta(hours=1)
    recent = await db.scalar(
        select(func.count())
        .select_from(PairwiseVote)
        .where(PairwiseVote.session_id == session.id, PairwiseVote.created_at >= since)
    ) or 0
    if recent >= settings.swipe_rate_limit_per_hour:
        raise HTTPException(status_code=429, detail="Swipe rate limit exceeded")

    low, high = canonical_pair(payload.winner_id, payload.loser_id)
    vote = PairwiseVote(
        session_id=session.id,
        winner_id=payload.winner_id,
        loser_id=payload.loser_id,
        pair_low=low,
        pair_high=high,
    )
    db.add(vote)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You already voted this pair",
        )
    await db.refresh(vote)
    return vote


async def upsert_tier(db: AsyncSession, session: VoterSession, payload: TierVoteIn) -> TierSubmission:
    ids = [p.committee_id for p in payload.placements]
    if len(ids) != len(set(ids)):
        raise HTTPException(status_code=400, detail="Duplicate committees in placements")

    await _assert_committees_exist(db, ids)

    min_placements = 5
    if len(ids) < min_placements:
        raise HTTPException(
            status_code=400,
            detail=f"Tier ballot needs at least {min_placements} placements (got {len(ids)})",
        )

    result = await db.execute(select(TierSubmission).where(TierSubmission.session_id == session.id))
    submission = result.scalar_one_or_none()
    now = datetime.now(timezone.utc)

    if submission:
        await db.execute(delete(TierPlacement).where(TierPlacement.submission_id == submission.id))
        submission.updated_at = now
    else:
        submission = TierSubmission(id=str(uuid4()), session_id=session.id)
        db.add(submission)
        await db.flush()

    for p in payload.placements:
        db.add(
            TierPlacement(
                submission_id=submission.id,
                committee_id=p.committee_id,
                tier=p.tier,
            )
        )

    await db.commit()
    await db.refresh(submission)
    return submission


async def upsert_rank(db: AsyncSession, session: VoterSession, payload: RankVoteIn) -> RankSubmission:
    ids = payload.ordered_ids
    if len(ids) != len(set(ids)):
        raise HTTPException(status_code=400, detail="Duplicate committees in ranking")

    await _assert_committees_exist(db, ids)

    if payload.scope == "all":
        expected = await db.scalar(select(func.count()).select_from(Committee)) or 0
    else:
        expected = await db.scalar(
            select(func.count()).select_from(Committee).where(Committee.category == payload.scope)
        ) or 0
        # ensure all ids belong to scope
        result = await db.execute(
            select(Committee.id).where(Committee.id.in_(ids), Committee.category == payload.scope)
        )
        in_scope = {r[0] for r in result.all()}
        if in_scope != set(ids):
            raise HTTPException(status_code=400, detail="All ranked committees must match scope")

    if len(ids) != int(expected):
        raise HTTPException(
            status_code=400,
            detail=f"Rank ballot must include all {expected} committees for scope '{payload.scope}'",
        )

    result = await db.execute(
        select(RankSubmission).where(
            RankSubmission.session_id == session.id,
            RankSubmission.scope == payload.scope,
        )
    )
    submission = result.scalar_one_or_none()
    now = datetime.now(timezone.utc)

    if submission:
        await db.execute(delete(RankPosition).where(RankPosition.submission_id == submission.id))
        submission.updated_at = now
    else:
        submission = RankSubmission(id=str(uuid4()), session_id=session.id, scope=payload.scope)
        db.add(submission)
        await db.flush()

    for idx, committee_id in enumerate(ids, start=1):
        db.add(
            RankPosition(
                submission_id=submission.id,
                committee_id=committee_id,
                position=idx,
            )
        )

    await db.commit()
    await db.refresh(submission)
    return submission
