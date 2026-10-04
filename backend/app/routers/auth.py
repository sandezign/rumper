from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import _forwarded_proto
from app.core.auth import (
    REFRESH_TTL_SECONDS,
    SESSION_COOKIE,
    current_user,
    pack_session,
    unpack_session,
    fetch_picture_base64,
    make_access_token,
    new_refresh_token,
    revoke_refresh_token,
    rotate_refresh_token,
    validate_picture_data_uri,
    verify_google_access_token,
    verify_google_credential,
)
from app.core.config import get_settings
from app.core.security import rate_limit
from app.core.usage import tokens_used_today
from app.db.session import get_db
from app.models import User
from app.schemas.chat import GoogleLogin, UpdatePicture

router = APIRouter(prefix="/api/auth", tags=["auth"])

_SESSION_EXPIRED = "Sesi berakhir. Silakan masuk lagi."


def _user_json(u: User, used_today: int = 0) -> dict:
    from app.core.usage import next_reset_iso

    return {
        "id": str(u.id), "email": u.email, "name": u.name,
        "picture": u.picture_base64 or u.picture,  # our mirror first; URL fallback
        "tokens_used_today": used_today, "token_limit": u.token_limit,
        "quota_resets_at": next_reset_iso(),
    }


def _set_auth_cookies(request: Request, response: Response, access: str, refresh: str) -> None:
    # Secure iff this request actually arrived over https — correct for a local http
    # backend (mode A), prod, and a dev server proxied to a remote API alike. (The
    # comma-separated frontend_origin can't be used for this — it may list both.)
    secure = _forwarded_proto(request) == "https"
    response.set_cookie(SESSION_COOKIE, pack_session(access, refresh), httponly=True,
                        samesite="lax", secure=secure, max_age=REFRESH_TTL_SECONDS)


@router.post("/google", dependencies=[Depends(rate_limit("auth_google", 10, 60))])
async def google_login(payload: GoogleLogin, request: Request, response: Response,
                       db: AsyncSession = Depends(get_db)) -> dict:
    if payload.access_token:
        info = await verify_google_access_token(payload.access_token)
    elif payload.credential:
        info = await verify_google_credential(payload.credential)
    else:
        raise HTTPException(status_code=400, detail="Kredensial Google tidak ada.")
    user = (await db.execute(select(User).where(User.google_sub == info["sub"]))).scalar_one_or_none()
    if user is None:
        user = User(
            google_sub=info["sub"], email=info.get("email", ""),
            name=info.get("name", ""), picture=info.get("picture"),
            token_limit=get_settings().default_token_limit,
        )
        db.add(user)
        await db.flush()
    else:
        # refresh identity fields on every login
        user.email = info.get("email") or user.email
        user.name = info.get("name") or user.name
        user.picture = info.get("picture") or user.picture
    # mirror the Google avatar into our DB — their URLs expire (docs/13 §1)
    if info.get("picture"):
        mirrored = await fetch_picture_base64(info["picture"])
        if mirrored:
            user.picture_base64 = mirrored
    refresh_raw = new_refresh_token(db, user.id)
    await db.commit()
    _set_auth_cookies(request, response, make_access_token(user.id), refresh_raw)
    return _user_json(user, await tokens_used_today(db, user.id))


@router.post("/refresh", dependencies=[Depends(rate_limit("auth_refresh", 30, 60))])
async def refresh(request: Request, response: Response,
                  session: str | None = Cookie(default=None, alias=SESSION_COOKIE),
                  db: AsyncSession = Depends(get_db)) -> dict:
    """Rotate the refresh token and issue a fresh 1-day access token."""
    _, refresh_token = unpack_session(session)
    if not refresh_token:
        raise HTTPException(status_code=401, detail=_SESSION_EXPIRED)
    rotated = await rotate_refresh_token(db, refresh_token)
    if rotated is None:
        raise HTTPException(status_code=401, detail=_SESSION_EXPIRED)
    user, new_raw = rotated
    _set_auth_cookies(request, response, make_access_token(user.id), new_raw)
    return _user_json(user, await tokens_used_today(db, user.id))


@router.get("/me")
async def me(user: User = Depends(current_user), db: AsyncSession = Depends(get_db)) -> dict:
    return _user_json(user, await tokens_used_today(db, user.id))


@router.put("/me/picture")
async def update_picture(payload: UpdatePicture, user: User = Depends(current_user),
                         db: AsyncSession = Depends(get_db)) -> dict:
    user.picture_base64 = validate_picture_data_uri(payload.picture_base64)
    await db.commit()
    return _user_json(user, await tokens_used_today(db, user.id))


@router.post("/logout")
async def logout(response: Response,
                 session: str | None = Cookie(default=None, alias=SESSION_COOKIE),
                 db: AsyncSession = Depends(get_db)) -> dict:
    _, refresh_token = unpack_session(session)
    if refresh_token:
        await revoke_refresh_token(db, refresh_token)
    response.delete_cookie(SESSION_COOKIE)
    return {"ok": True}
