from fastapi import Cookie, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.db import get_db
from app.models import VoterSession
from app.services.votes import get_or_create_session


async def current_session(
    request: Request,
    db: AsyncSession = Depends(get_db),
    pollr_sid: str | None = Cookie(default=None, alias="pollr_sid"),
) -> VoterSession:
    settings = get_settings()
    # Support header override for non-browser clients / tests
    header_sid = request.headers.get("X-Pollr-Session")
    sid = pollr_sid or header_sid
    ip = request.client.host if request.client else None
    ua = request.headers.get("user-agent")
    session = await get_or_create_session(db, sid, ip=ip, user_agent=ua)
    # stash for cookie setter in routes
    request.state.pollr_session_id = session.id
    request.state.pollr_cookie_name = settings.cookie_name
    return session
