import math

import pytest

from app.services.scoring import (
    CommitteeScores,
    canonical_pair,
    confidence_adjust,
    map_swipe_raw_to_score,
    rank_points,
    swipe_points,
    tier_points,
)


def test_swipe_points():
    assert swipe_points(True) == 50
    assert swipe_points(False) == -25


def test_swipe_mapping_bounds():
    assert map_swipe_raw_to_score(-25) == -100
    assert map_swipe_raw_to_score(50) == 100
    assert map_swipe_raw_to_score(12.5) == 0


def test_tier_points():
    assert tier_points("S") == 100
    assert tier_points("A") == 50
    assert tier_points("B") == 0
    assert tier_points("C") == -50
    assert tier_points("F") == -100
    with pytest.raises(ValueError):
        tier_points("D")


def test_rank_points_bounds():
    assert rank_points(1, 5) == 100
    assert rank_points(5, 5) == -100
    assert rank_points(3, 5) == 0
    assert rank_points(1, 1) == 0


def test_confidence_shrink():
    assert confidence_adjust(100, 0) == 0
    assert confidence_adjust(100, 10) == 50
    assert math.isclose(confidence_adjust(80, 30), 80 * 30 / 40)


def test_pollr_equal_mean_of_available_modes():
    sc = CommitteeScores("acm")
    # one win
    sc.swipe.add(50)
    sc.swipe_wins = 1
    # one S tier
    sc.tier.add(100)
    sc.tier_counts["S"] = 1
    # no rank
    pollr = sc.pollr_score(prior=10)
    swipe_adj = map_swipe_raw_to_score(50) * (1 / 11)
    tier_adj = 100 * (1 / 11)
    assert pollr is not None
    assert math.isclose(pollr, (swipe_adj + tier_adj) / 2)


def test_canonical_pair():
    assert canonical_pair("b", "a") == ("a", "b")
    assert canonical_pair("a", "b") == ("a", "b")


def test_controversy_uniform_high():
    sc = CommitteeScores("x")
    for t in ("S", "A", "B", "C", "F"):
        sc.tier_counts[t] = 2
    c = sc.controversy()
    assert c is not None
    assert c > 95


def test_controversy_unanimous_low():
    sc = CommitteeScores("x")
    sc.tier_counts["S"] = 10
    c = sc.controversy()
    assert c == 0.0
