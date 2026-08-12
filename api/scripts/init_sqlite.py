"""Initialize a local SQLite database with schema + committee seed for API smoke tests."""

from __future__ import annotations

import asyncio
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

from app.db import Base
from app.models import Committee  # noqa: F401 — register metadata
from app.scripts_data import COMMITTEE_ROWS


async def main(db_path: Path) -> None:
    db_path.parent.mkdir(parents=True, exist_ok=True)
    if db_path.exists():
        db_path.unlink()
    url = f"sqlite+aiosqlite:///{db_path.as_posix()}"
    engine = create_async_engine(url)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        for row in COMMITTEE_ROWS:
            await conn.execute(
                text(
                    """
                    INSERT INTO committees
                    (id, slug, name, short_name, category, tagline, established, instagram_url)
                    VALUES
                    (:id, :slug, :name, :short_name, :category, :tagline, :established, :instagram_url)
                    """
                ),
                row,
            )
    await engine.dispose()
    print(f"Initialized {db_path} with {len(COMMITTEE_ROWS)} committees")


if __name__ == "__main__":
    target = ROOT / "pollr.local.db"
    asyncio.run(main(target))
