"""Pure scoring helpers for Pollr Score.

Swipe is a pairwise contribution model (+50 winner / -25 loser), not classical ELO.
"""

from __future__ import annotations

from dataclasses import dataclass, field

TIER_POINTS = {"S": 100.0, "A": 50.0, "B": 0.0, "C": -50.0, "F": -100.0}
SWIPE_WIN = 50.0
SWIPE_LOSS = -25.0
CONFIDENCE_PRIOR = 10


def map_swipe_raw_to_score(raw_avg: float) -> float:
    """Map average points in [-25, 50] linearly onto [-100, 100]."""
    return ((raw_avg - SWIPE_LOSS) / (SWIPE_WIN - SWIPE_LOSS)) * 200.0 - 100.0


def swipe_points(won: bool) -> float:
    return SWIPE_WIN if won else SWIPE_LOSS


def tier_points(tier: str) -> float:
    if tier not in TIER_POINTS:
        raise ValueError(f"invalid tier: {tier}")
    return TIER_POINTS[tier]


def rank_points(position: int, n: int) -> float:
    """Position 1 => +100, last => -100. n must be >= 1."""
    if n < 1:
        raise ValueError("n must be >= 1")
    if position < 1 or position > n:
        raise ValueError("position out of range")
    if n == 1:
        return 0.0
    return 100.0 - 200.0 * (position - 1) / (n - 1)


def confidence_adjust(raw: float, n: int, prior: int = CONFIDENCE_PRIOR) -> float:
    if n <= 0:
        return 0.0
    return raw * (n / (n + prior))


@dataclass
class ModeAggregate:
    total: float = 0.0
    count: int = 0

    def add(self, value: float) -> None:
        self.total += value
        self.count += 1

    @property
    def mean(self) -> float | None:
        if self.count == 0:
            return None
        return self.total / self.count

    def adjusted(self, prior: int = CONFIDENCE_PRIOR) -> float | None:
        m = self.mean
        if m is None:
            return None
        return confidence_adjust(m, self.count, prior)


@dataclass
class CommitteeScores:
    committee_id: str
    swipe: ModeAggregate = field(default_factory=ModeAggregate)
    tier: ModeAggregate = field(default_factory=ModeAggregate)
    rank: ModeAggregate = field(default_factory=ModeAggregate)
    tier_counts: dict[str, int] = field(default_factory=lambda: {t: 0 for t in TIER_POINTS})
    swipe_wins: int = 0
    swipe_losses: int = 0

    def swipe_score(self, prior: int = CONFIDENCE_PRIOR) -> float | None:
        if self.swipe.count == 0:
            return None
        raw_mapped = map_swipe_raw_to_score(self.swipe.mean or 0.0)
        return confidence_adjust(raw_mapped, self.swipe.count, prior)

    def tier_score(self, prior: int = CONFIDENCE_PRIOR) -> float | None:
        return self.tier.adjusted(prior)

    def rank_score(self, prior: int = CONFIDENCE_PRIOR) -> float | None:
        return self.rank.adjusted(prior)

    def pollr_score(self, prior: int = CONFIDENCE_PRIOR) -> float | None:
        parts = [s for s in (self.swipe_score(prior), self.tier_score(prior), self.rank_score(prior)) if s is not None]
        if not parts:
            return None
        return sum(parts) / len(parts)

    def sample_size(self) -> int:
        return self.swipe.count + self.tier.count + self.rank.count

    def mode_coverage(self) -> int:
        return sum(1 for s in (self.swipe.count, self.tier.count, self.rank.count) if s > 0)

    def win_rate(self) -> float | None:
        total = self.swipe_wins + self.swipe_losses
        if total == 0:
            return None
        return 100.0 * self.swipe_wins / total

    def controversy(self) -> float | None:
        """0–100 from tier distribution entropy (needs placements)."""
        total = sum(self.tier_counts.values())
        if total < 2:
            return None
        import math

        entropy = 0.0
        for c in self.tier_counts.values():
            if c <= 0:
                continue
            p = c / total
            entropy -= p * math.log(p, 5)  # max entropy = 1 when uniform over 5 tiers
        return round(100.0 * entropy, 1)

    def tier_distribution(self) -> dict[str, float]:
        total = sum(self.tier_counts.values())
        if total == 0:
            return {t: 0.0 for t in TIER_POINTS}
        return {t: round(100.0 * c / total, 1) for t, c in self.tier_counts.items()}


def canonical_pair(a: str, b: str) -> tuple[str, str]:
    return (a, b) if a < b else (b, a)
