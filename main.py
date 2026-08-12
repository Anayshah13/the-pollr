"""Backward-compatible entrypoint. Prefer: uvicorn app.main:app --app-dir api """

from app.main import app

__all__ = ["app"]
