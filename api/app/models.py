from datetime import datetime
from uuid import uuid4

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class Committee(Base):
    __tablename__ = "committees"

    id: Mapped[str] = mapped_column(Text, primary_key=True)
    slug: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    short_name: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(Text, nullable=False)
    tagline: Mapped[str] = mapped_column(Text, nullable=False, default="")
    established: Mapped[int | None] = mapped_column(Integer)
    instagram_url: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class VoterSession(Base):
    __tablename__ = "voter_sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    last_seen_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    ip_hash: Mapped[str | None] = mapped_column(Text)
    user_agent_hash: Mapped[str | None] = mapped_column(Text)


class PairwiseVote(Base):
    __tablename__ = "pairwise_votes"
    __table_args__ = (
        UniqueConstraint("session_id", "pair_low", "pair_high", name="pairwise_unique_pair"),
        CheckConstraint("winner_id <> loser_id", name="pairwise_distinct"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[str] = mapped_column(String(36), ForeignKey("voter_sessions.id", ondelete="CASCADE"))
    winner_id: Mapped[str] = mapped_column(Text, ForeignKey("committees.id"))
    loser_id: Mapped[str] = mapped_column(Text, ForeignKey("committees.id"))
    pair_low: Mapped[str] = mapped_column(Text, nullable=False)
    pair_high: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class TierSubmission(Base):
    __tablename__ = "tier_submissions"
    __table_args__ = (UniqueConstraint("session_id", name="tier_one_per_session"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    session_id: Mapped[str] = mapped_column(String(36), ForeignKey("voter_sessions.id", ondelete="CASCADE"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    placements: Mapped[list["TierPlacement"]] = relationship(back_populates="submission", cascade="all, delete-orphan")


class TierPlacement(Base):
    __tablename__ = "tier_placements"
    __table_args__ = (UniqueConstraint("submission_id", "committee_id", name="tier_placement_unique"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    submission_id: Mapped[str] = mapped_column(String(36), ForeignKey("tier_submissions.id", ondelete="CASCADE"))
    committee_id: Mapped[str] = mapped_column(Text, ForeignKey("committees.id"))
    tier: Mapped[str] = mapped_column(Text, nullable=False)

    submission: Mapped[TierSubmission] = relationship(back_populates="placements")


class RankSubmission(Base):
    __tablename__ = "rank_submissions"
    __table_args__ = (UniqueConstraint("session_id", "scope", name="rank_one_per_session_scope"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    session_id: Mapped[str] = mapped_column(String(36), ForeignKey("voter_sessions.id", ondelete="CASCADE"))
    scope: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    positions: Mapped[list["RankPosition"]] = relationship(back_populates="submission", cascade="all, delete-orphan")


class RankPosition(Base):
    __tablename__ = "rank_positions"
    __table_args__ = (
        UniqueConstraint("submission_id", "committee_id", name="rank_position_unique"),
        UniqueConstraint("submission_id", "position", name="rank_position_order"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    submission_id: Mapped[str] = mapped_column(String(36), ForeignKey("rank_submissions.id", ondelete="CASCADE"))
    committee_id: Mapped[str] = mapped_column(Text, ForeignKey("committees.id"))
    position: Mapped[int] = mapped_column(Integer, nullable=False)

    submission: Mapped[RankSubmission] = relationship(back_populates="positions")


class ScoreSnapshot(Base):
    __tablename__ = "score_snapshots"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    captured_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    scope: Mapped[str] = mapped_column(Text, nullable=False, default="all")
    committee_id: Mapped[str] = mapped_column(Text, ForeignKey("committees.id"))
    pollr_score: Mapped[float] = mapped_column(nullable=False)
    swipe_score: Mapped[float | None]
    tier_score: Mapped[float | None]
    rank_score: Mapped[float | None]
    sample_size: Mapped[int] = mapped_column(Integer, default=0)
