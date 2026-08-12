from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

_API_DIR = Path(__file__).resolve().parents[1]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(_API_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/postgres"
    cors_origins: str = "http://localhost:3000"
    cookie_secure: bool = False
    cookie_name: str = "pollr_sid"
    ip_hash_salt: str = "pollr-dev-salt"
    confidence_prior: int = 10
    swipe_rate_limit_per_hour: int = 200
    max_tier_submissions_hint: int = 1

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
