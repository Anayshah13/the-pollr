from __future__ import annotations

from collections import defaultdict

from sqlalchemy import Select, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config import get_settings
from app.models import (
    Committee,
    PairwiseVote,
    RankPosition,
    RankSubmission,
    ScoreSnapshot,
    TierPlacement,
    TierSubmission,
)
from app.schemas.votes import LeaderboardOut, LeaderboardRow, ModeScores
from app.services.scoring import (
    CommitteeScores,
    rank_points,
    swipe_points,
    tier_points,
)


async def load_committees(db: AsyncSession, category: str | None = None) -> list[Committee]:
    stmt: Select = select(Committee).order_by(Committee.name)
    if category and category != "all":
        stmt = stmt.where(Committee.category == category)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def compute_scores(
    db: AsyncSession,
    *,
    scope: str = "all",
    prior: int | None = None,
) -> dict[str, CommitteeScores]:
    settings = get_settings()
    prior = prior if prior is not None else settings.confidence_prior

    committees = await load_committees(db, None if scope == "all" else scope)
    scores: dict[str, CommitteeScores] = {c.id: CommitteeScores(committee_id=c.id) for c in committees}
    if not scores:
        return scores

    # Swipe: all pairwise involving committees in scope
    pw = await db.execute(select(PairwiseVote))
    for vote in pw.scalars().all():
        if vote.winner_id in scores:
            scores[vote.winner_id].swipe.add(swipe_points(True))
            scores[vote.winner_id].swipe_wins += 1
        if vote.loser_id in scores:
            scores[vote.loser_id].swipe.add(swipe_points(False))
            scores[vote.loser_id].swipe_losses += 1

    # Tier: all placements for committees in scope
    tp = await db.execute(select(TierPlacement))
    for placement in tp.scalars().all():
        if placement.committee_id not in scores:
            continue
        scores[placement.committee_id].tier.add(tier_points(placement.tier))
        scores[placement.committee_id].tier_counts[placement.tier] = (
            scores[placement.committee_id].tier_counts.get(placement.tier, 0) + 1
        )

    # Rank: overall uses only scope='all'; category uses category-scoped + all-scope rows for those committees
    rank_stmt = (
        select(RankSubmission)
        .options(selectinload(RankSubmission.positions))
    )
    if scope == "all":
        rank_stmt = rank_stmt.where(RankSubmission.scope == "all")
    else:
        rank_stmt = rank_stmt.where(RankSubmission.scope.in_([scope, "all"]))

    rs = await db.execute(rank_stmt)
    for submission in rs.scalars().unique().all():
        # For category boards, only count all-scope positions that belong to this category
        positions = sorted(submission.positions, key=lambda p: p.position)
        if submission.scope == "all" and scope != "all":
            positions = [p for p in positions if p.committee_id in scores]
            # Re-normalize positions among filtered set for fair category scoring
            if not positions:
                continue
            n = len(positions)
            for i, pos in enumerate(sorted(positions, key=lambda p: p.position), start=1):
                scores[pos.committee_id].rank.add(rank_points(i, n))
            continue

        n = len(positions)
        if n == 0:
            continue
        for pos in positions:
            if pos.committee_id not in scores:
                continue
            scores[pos.committee_id].rank.add(rank_points(pos.position, n))

    return scores


async def _snapshot_map(
    db: AsyncSession, scope: str, committee_ids: list[str]
) -> tuple[dict[str, float], dict[str, list[float]]]:
    """Latest previous pollr_score and up to 12 weekly-ish trend points."""
    if not committee_ids:
        return {}, {}

    result = await db.execute(
        select(ScoreSnapshot)
        .where(ScoreSnapshot.scope == scope, ScoreSnapshot.committee_id.in_(committee_ids))
        .order_by(ScoreSnapshot.captured_at.desc())
    )
    rows = list(result.scalars().all())
    latest: dict[str, float] = {}
    trends: dict[str, list[float]] = defaultdict(list)
    for row in rows:
        if row.committee_id not in latest:
            latest[row.committee_id] = row.pollr_score
        if len(trends[row.committee_id]) < 12:
            trends[row.committee_id].append(row.pollr_score)
    # reverse to chronological
    for cid in trends:
        trends[cid] = list(reversed(trends[cid]))
    return latest, trends


async def build_leaderboard(db: AsyncSession, scope: str = "all") -> LeaderboardOut:
    committees = await load_committees(db, None if scope == "all" else scope)
    scores = await compute_scores(db, scope=scope)
    prev, trends = await _snapshot_map(db, scope, [c.id for c in committees])

    catalog = {c.id: c for c in committees}
    rows: list[LeaderboardRow] = []
    for cid, sc in scores.items():
        c = catalog[cid]
        pollr = sc.pollr_score()
        delta = None
        if pollr is not None and cid in prev:
            delta = round(pollr - prev[cid], 1)
        trend = trends.get(cid, [])
        # Only expose trend when we have enough real snapshots
        if len(trend) < 2:
            trend = []
        rows.append(
            LeaderboardRow(
                rank=0,
                id=c.id,
                slug=c.slug,
                name=c.name,
                short_name=c.short_name,
                category=c.category,
                tagline=c.tagline,
                pollr_score=round(pollr, 1) if pollr is not None else None,
                modes=ModeScores(
                    swipe=round(sc.swipe_score(), 1) if sc.swipe_score() is not None else None,
                    tier=round(sc.tier_score(), 1) if sc.tier_score() is not None else None,
                    rank=round(sc.rank_score(), 1) if sc.rank_score() is not None else None,
                    swipe_n=sc.swipe.count,
                    tier_n=sc.tier.count,
                    rank_n=sc.rank.count,
                ),
                sample_size=sc.sample_size(),
                mode_coverage=sc.mode_coverage(),
                win_rate=round(sc.win_rate(), 1) if sc.win_rate() is not None else None,
                controversy=sc.controversy(),
                tier_distribution=sc.tier_distribution(),
                delta=delta,
                trend=trend,
            )
        )

    rows.sort(
        key=lambda r: (
            r.pollr_score is None,
            -(r.pollr_score or 0.0),
            -r.sample_size,
            r.name,
        )
    )
    for i, row in enumerate(rows, start=1):
        row.rank = i

    pw_count = await db.scalar(select(func.count()).select_from(PairwiseVote)) or 0
    tier_count = await db.scalar(select(func.count()).select_from(TierSubmission)) or 0
    if scope == "all":
        rank_count = await db.scalar(
            select(func.count()).select_from(RankSubmission).where(RankSubmission.scope == "all")
        ) or 0
    else:
        rank_count = await db.scalar(
            select(func.count())
            .select_from(RankSubmission)
            .where(RankSubmission.scope.in_([scope, "all"]))
        ) or 0

    return LeaderboardOut(
        scope=scope,
        methodology=(
            "Pollr Score = equal mean of available confidence-adjusted mode scores. "
            "Swipe: +50/-25 mapped to [-100,100]. Tier: S/A/B/C/F = +100/+50/0/-50/-100. "
            "Rank: linear +100…-100 by position. Each mode shrunk by n/(n+10)."
        ),
        total_committees=len(rows),
        total_pairwise_votes=int(pw_count),
        total_tier_ballots=int(tier_count),
        total_rank_ballots=int(rank_count),
        rows=rows,
    )


async def head_to_head(db: AsyncSession, a: str, b: str) -> tuple[int, int, int]:
    """Return (a_wins, b_wins, total) from direct pairwise votes only."""
    a_wins = await db.scalar(
        select(func.count())
        .select_from(PairwiseVote)
        .where(PairwiseVote.winner_id == a, PairwiseVote.loser_id == b)
    ) or 0
    b_wins = await db.scalar(
        select(func.count())
        .select_from(PairwiseVote)
        .where(PairwiseVote.winner_id == b, PairwiseVote.loser_id == a)
    ) or 0
    return int(a_wins), int(b_wins), int(a_wins) + int(b_wins)


async def capture_snapshots(db: AsyncSession, scope: str = "all") -> int:
    board = await build_leaderboard(db, scope)
    n = 0
    for row in board.rows:
        if row.pollr_score is None:
            continue
        db.add(
            ScoreSnapshot(
                scope=scope,
                committee_id=row.id,
                pollr_score=row.pollr_score,
                swipe_score=row.modes.swipe,
                tier_score=row.modes.tier,
                rank_score=row.modes.rank,
                sample_size=row.sample_size,
            )
        )
        n += 1
    await db.commit()
    return n
