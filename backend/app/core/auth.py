"""Google ID-token verification + first-party access/refresh tokens (docs/13 §1).

Google login is identity proof only. Sessions are OUR tokens, so we never depend on
Google OAuth state (or its expiring picture URLs) after sign-in:
- access token: 1-day HS256 JWT;
- refresh token: 7-day opaque single-use secret, stored as a sha256 hash, rotated on
  every refresh; presenting an already-rotated token is treated as theft and revokes
  all of the user's refresh tokens.
Both ride in the single `__session` cookie (Firebase Hosting strips all others).
The Google avatar is mirrored into `users.picture_base64` (≤1 MB) at login.
"""
import base64
import hashlib
import re
import secrets
import time
import uuid
from datetime import datetime, timedelta, timezone

import httpx
import jwt
from fastapi import Cookie, Depends, HTTPException
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.db.session import get_db
from app.models import RefreshToken, User

# Firebase Hosting rewrites to Cloud Run strip EVERY cookie except one named
# `__session` — both tokens ride in it as "<access>|<refresh>" (docs/13 §1).
SESSION_COOKIE = "__session"
ACCESS_TTL_SECONDS = 1 * 86400
REFRESH_TTL_SECONDS = 7 * 86400


def pack_session(access: str, refresh: str) -> str:
    return f"{access}|{refresh}"


def unpack_session(value: str | None) -> tuple[str | None, str | None]:
    if not value or "|" not in value:
        return None, None
    access, _, refresh = value.partition("|")
    return access or None, refresh or None

MAX_PICTURE_BYTES = 1_048_576  # 1 MB decoded image


# ---------- Google identity proof ----------

async def verify_google_credential(credential: str) -> dict:
    """Verify a GIS ID token via Google's tokeninfo endpoint."""
    async with httpx.AsyncClient(timeout=10) as http:
        r = await http.get("https://oauth2.googleapis.com/tokeninfo",
                           params={"id_token": credential})
    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="Login Google tidak valid.")
    info = r.json()
    if info.get("aud") != get_settings().google_oauth_client_id:
        raise HTTPException(status_code=401, detail="Login Google tidak valid (aud).")
    return info  # sub, email, name, picture


async def verify_google_access_token(access_token: str) -> dict:
    """Verify a GIS OAuth2 access token (custom-button flow): confirm it was minted for our
    client (tokeninfo aud/azp), then fetch the profile via userinfo."""
    client_id = get_settings().google_oauth_client_id
    async with httpx.AsyncClient(timeout=10) as http:
        ti = await http.get("https://oauth2.googleapis.com/tokeninfo",
                            params={"access_token": access_token})
        if ti.status_code != 200:
            raise HTTPException(status_code=401, detail="Login Google tidak valid.")
        tinfo = ti.json()
        if client_id not in (tinfo.get("aud"), tinfo.get("azp")):
            raise HTTPException(status_code=401, detail="Login Google tidak valid (aud).")
        ui = await http.get("https://www.googleapis.com/oauth2/v3/userinfo",
                           headers={"Authorization": f"Bearer {access_token}"})
    if ui.status_code != 200:
        raise HTTPException(status_code=401, detail="Login Google tidak valid (profil).")
    return ui.json()  # sub, email, name, picture


# ---------- access token (stateless JWT, 1 day) ----------

def make_access_token(user_id: uuid.UUID) -> str:
    now = int(time.time())
    payload = {"uid": str(user_id), "typ": "access", "iat": now,
               "exp": now + ACCESS_TTL_SECONDS}
    return jwt.encode(payload, get_settings().app_secret, algorithm="HS256")


def _decode_access(token: str) -> uuid.UUID | None:
    try:
        payload = jwt.decode(token, get_settings().app_secret, algorithms=["HS256"])
        if payload.get("typ") != "access":
            return None
        return uuid.UUID(payload["uid"])
    except Exception:  # noqa: BLE001 — any bad token = unauthenticated
        return None


# ---------- refresh token (opaque, hashed at rest, rotated, 7 days) ----------

def _hash_token(raw: str) -> str:
    return hashlib.sha256(raw.encode()).hexdigest()


def new_refresh_token(db: AsyncSession, user_id: uuid.UUID) -> str:
    """Create a refresh-token row (caller commits) and return the raw secret."""
    raw = secrets.token_urlsafe(48)
    db.add(RefreshToken(
        user_id=user_id, token_hash=_hash_token(raw),
        expires_at=datetime.now(timezone.utc) + timedelta(seconds=REFRESH_TTL_SECONDS),
    ))
    return raw


async def rotate_refresh_token(db: AsyncSession, raw: str) -> tuple[User, str] | None:
    """Single-use rotation. Returns (user, new_raw) or None when invalid.

    Reuse detection: a token that was already rotated (revoked_at set) means the
    cookie leaked — revoke every active refresh token of that user.
    """
    now = datetime.now(timezone.utc)
    row = (await db.execute(
        select(RefreshToken).where(RefreshToken.token_hash == _hash_token(raw))
    )).scalar_one_or_none()
    if row is None:
        return None
    if row.revoked_at is not None:
        await db.execute(
            update(RefreshToken)
            .where(RefreshToken.user_id == row.user_id, RefreshToken.revoked_at.is_(None))
            .values(revoked_at=now)
        )
        await db.commit()
        return None
    if row.expires_at <= now:
        return None
    user = (await db.execute(select(User).where(User.id == row.user_id))).scalar_one_or_none()
    if user is None:
        return None
    row.revoked_at = now
    new_raw = new_refresh_token(db, user.id)
    await db.commit()
    return user, new_raw


async def revoke_refresh_token(db: AsyncSession, raw: str) -> None:
    await db.execute(
        update(RefreshToken)
        .where(RefreshToken.token_hash == _hash_token(raw), RefreshToken.revoked_at.is_(None))
        .values(revoked_at=datetime.now(timezone.utc))
    )
    await db.commit()


# ---------- request dependencies ----------

async def optional_user(
    session: str | None = Cookie(default=None, alias=SESSION_COOKIE),
    db: AsyncSession = Depends(get_db),
) -> User | None:
    access_token, _ = unpack_session(session)
    if not access_token:
        return None
    uid = _decode_access(access_token)
    if uid is None:
        return None
    return (await db.execute(select(User).where(User.id == uid))).scalar_one_or_none()


async def current_user(user: User | None = Depends(optional_user)) -> User:
    if user is None:
        raise HTTPException(status_code=401, detail="Silakan masuk terlebih dahulu.")
    return user


async def check_quota(db: AsyncSession, user: User) -> int:
    """Daily quota (docs/13 §4): token_limit per WIB calendar day. Returns today's usage."""
    from app.core.usage import next_reset_iso, tokens_used_today

    used = await tokens_used_today(db, user.id)
    if used >= user.token_limit:
        raise HTTPException(status_code=402, detail={
            "code": "quota_exceeded",
            "tokens_used_today": used,
            "token_limit": user.token_limit,
            "resets_at": next_reset_iso(),
            "message": "Kuota token harian Anda habis. Kuota direset setiap tengah malam WIB.",
        })
    return used


# ---------- profile picture (stored base64, ≤1 MB) ----------

def _sniff_image(data: bytes) -> str | None:
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        return "image/png"
    if data[:3] == b"\xff\xd8\xff":
        return "image/jpeg"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "image/webp"
    return None


def validate_picture_data_uri(value: str) -> str:
    """Validate a user-supplied `data:image/...;base64,...` and return it normalized.

    Mime is decided by magic-byte sniffing (the declared mime is not trusted);
    decoded size is capped at MAX_PICTURE_BYTES.
    """
    m = re.fullmatch(r"data:image/(?:png|jpeg|jpg|webp);base64,([A-Za-z0-9+/=]+)", value)
    if m is None:
        raise HTTPException(status_code=422, detail="Data gambar tidak valid — kirim data URI base64 (PNG/JPEG/WebP).")
    try:
        data = base64.b64decode(m.group(1), validate=True)
    except Exception:  # noqa: BLE001
        raise HTTPException(status_code=422, detail="Data gambar tidak valid — base64 rusak.")
    if len(data) > MAX_PICTURE_BYTES:
        raise HTTPException(status_code=413, detail="Ukuran gambar maksimal 1 MB.")
    mime = _sniff_image(data)
    if mime is None:
        raise HTTPException(status_code=422, detail="Format gambar tidak didukung. Gunakan PNG, JPEG, atau WebP.")
    return f"data:{mime};base64,{base64.b64encode(data).decode()}"


async def fetch_picture_base64(url: str) -> str | None:
    """Mirror an avatar URL (Google profile photo) into a data URI.

    Google picture URLs expire / rate-limit, so we copy the bytes once at login.
    Best-effort: any failure returns None and must never break the login.
    """
    try:
        async with httpx.AsyncClient(timeout=10, follow_redirects=True) as http:
            r = await http.get(url)
        if r.status_code != 200 or not r.content or len(r.content) > MAX_PICTURE_BYTES:
            return None
        mime = _sniff_image(r.content)
        if mime is None:
            return None
        return f"data:{mime};base64,{base64.b64encode(r.content).decode()}"
    except Exception:  # noqa: BLE001
        return None
