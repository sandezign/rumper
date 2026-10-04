"""Minimum-standard HTTP hardening for FE↔BE communication (docs/13 §6).

Three layers, all framework-level so handlers stay clean:
1. Security response headers on everything we serve (API + SPA).
2. Origin allow-list on unsafe /api requests — CSRF defense-in-depth on top of
   SameSite=Lax cookies (browsers always attach Origin to cross-site unsafe requests).
3. In-memory per-IP rate limiting for the auth endpoints (per-instance; good enough
   to blunt credential-stuffing/refresh abuse on the prototype).
"""
import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from app.core.config import get_settings

_UNSAFE_METHODS = {"POST", "PUT", "PATCH", "DELETE"}


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        resp = await call_next(request)
        h = resp.headers
        h.setdefault("X-Content-Type-Options", "nosniff")
        h.setdefault("X-Frame-Options", "DENY")
        h.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
        h.setdefault("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
        if _forwarded_proto(request) == "https":
            h.setdefault("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
        if request.url.path.startswith("/api/"):
            # API responses must never be cached by intermediaries (SSE handlers
            # already set no-cache themselves; setdefault keeps theirs).
            h.setdefault("Cache-Control", "no-store")
        return resp


def _forwarded_proto(request: Request) -> str:
    return request.headers.get("x-forwarded-proto") or request.url.scheme


def _request_origin(request: Request) -> str:
    return f"{_forwarded_proto(request)}://{request.headers.get('host', '')}"


class OriginCheckMiddleware(BaseHTTPMiddleware):
    """Reject unsafe /api requests whose Origin is neither the configured frontend
    origin nor our own origin (prod serves the SPA same-origin, ADR-009). Requests
    without an Origin header (curl, server-to-server, same-origin GET) pass — this
    is browser-CSRF defense, not authentication."""

    async def dispatch(self, request, call_next):
        if request.method in _UNSAFE_METHODS and request.url.path.startswith("/api/"):
            origin = request.headers.get("origin")
            allowed = (*get_settings().frontend_origins, _request_origin(request))
            if origin and origin not in allowed:
                return JSONResponse({"detail": "Origin tidak diizinkan."}, status_code=403)
        return await call_next(request)


# ---------- naive per-IP sliding-window rate limiter ----------

_buckets: dict[str, deque] = defaultdict(deque)


def _client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for", "")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.client.host if request.client else "?"


def rate_limit(name: str, limit: int, window_seconds: int):
    """FastAPI dependency factory: at most `limit` calls per IP per window."""

    async def dep(request: Request) -> None:
        key = f"{name}:{_client_ip(request)}"
        now = time.monotonic()
        q = _buckets[key]
        while q and q[0] <= now - window_seconds:
            q.popleft()
        if len(q) >= limit:
            raise HTTPException(status_code=429,
                                detail="Terlalu banyak percobaan. Coba lagi sebentar lagi.")
        q.append(now)

    return dep
