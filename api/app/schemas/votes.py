from pydantic import BaseModel, Field, field_validator


class SessionOut(BaseModel):
    session_id: str


class CommitteeOut(BaseModel):
    id: str
    slug: str
    name: str
    short_name: str
    category: str
    tagline: str
    established: int | None = None
    instagram_url: str | None = None


class SwipeVoteIn(BaseModel):
    winner_id: str
    loser_id: str

    @field_validator("winner_id", "loser_id")
    @classmethod
    def non_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("committee id required")
        return v.strip()


class SwipeVoteOut(BaseModel):
    ok: bool
    winner_id: str
    loser_id: str


class TierPlacementIn(BaseModel):
    committee_id: str
    tier: str

    @field_validator("tier")
    @classmethod
    def valid_tier(cls, v: str) -> str:
        t = v.strip().upper()
        if t not in {"S", "A", "B", "C", "F"}:
            raise ValueError("tier must be S, A, B, C, or F")
        return t


class TierVoteIn(BaseModel):
    placements: list[TierPlacementIn] = Field(min_length=5)


class TierVoteOut(BaseModel):
    ok: bool
    submission_id: str
    placed: int


class RankVoteIn(BaseModel):
    scope: str = "all"
    ordered_ids: list[str] = Field(min_length=1)

    @field_validator("scope")
    @classmethod
    def valid_scope(cls, v: str) -> str:
        allowed = {
            "all",
            "Student Chapters",
            "Tech Committees",
            "Clubs",
            "SAE Teams",
            "IETE Teams",
        }
        if v not in allowed:
            raise ValueError("invalid rank scope")
        return v


class RankVoteOut(BaseModel):
    ok: bool
    submission_id: str
    scope: str
    ranked: int


class ModeScores(BaseModel):
    swipe: float | None = None
    tier: float | None = None
    rank: float | None = None
    swipe_n: int = 0
    tier_n: int = 0
    rank_n: int = 0


class LeaderboardRow(BaseModel):
    rank: int
    id: str
    slug: str
    name: str
    short_name: str
    category: str
    tagline: str
    pollr_score: float | None
    modes: ModeScores
    sample_size: int
    mode_coverage: int
    win_rate: float | None = None
    controversy: float | None = None
    tier_distribution: dict[str, float] = Field(default_factory=dict)
    delta: float | None = None
    trend: list[float] = Field(default_factory=list)


class LeaderboardOut(BaseModel):
    scope: str
    methodology: str
    total_committees: int
    total_pairwise_votes: int
    total_tier_ballots: int
    total_rank_ballots: int
    rows: list[LeaderboardRow]


class HeadToHeadOut(BaseModel):
    a: str
    b: str
    a_wins: int
    b_wins: int
    total: int
    a_share: float | None
    sufficient: bool


class InsightsOut(BaseModel):
    most_controversial: LeaderboardRow | None
    category_leaders: dict[str, LeaderboardRow | None]
    methodology: str
