import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from app.core.config import get_settings
from app.core.security import OriginCheckMiddleware, SecurityHeadersMiddleware
from app.core.usage import seed_model_prices
from app.db.checkpointer import close_checkpointer, init_checkpointer
from app.db.session import get_engine
from app.routers import hazard, areas, auth, chat, checks, intakes, entitlements
from app.schemas.api import HealthResponse

logging.basicConfig(level=logging.INFO)
# httpx logs the full request URL at INFO. Google's Maps endpoints carry the API key in the
# query string, so that wrote the key in clear text into Cloud Logging on every call — 63
# lines in two days, readable by anyone with project viewer. Warnings and errors still come
# through; only the per-request success line is dropped.
logging.getLogger("httpx").setLevel(logging.WARNING)


@asynccontextmanager
async def lifespan(_: FastAPI):
    await init_checkpointer()
    await seed_model_prices()
    yield
    await close_checkpointer()


app = FastAPI(title="Rumper API", version="0.2.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_settings().frontend_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# added after CORS so they wrap it; SecurityHeaders added last = outermost, so its
# headers also land on OriginCheck 403s (docs/13 §6)
app.add_middleware(OriginCheckMiddleware)
app.add_middleware(SecurityHeadersMiddleware)

app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(intakes.router)
app.include_router(checks.router)
app.include_router(areas.router)
app.include_router(hazard.router)
app.include_router(entitlements.router)


@app.get("/api/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    db_ok = True
    try:
        async with get_engine().connect() as conn:
            await conn.execute(text("select 1"))
    except Exception:
        db_ok = False
    return HealthResponse(db=db_ok)


# Static SPA (ADR-009): in prod the Vite bundle is built into backend/static.
_STATIC = Path(__file__).resolve().parents[1] / "static"
if (_STATIC / "index.html").exists():
    # Vite emits content-hashed asset filenames, so the bytes behind a given /assets/ URL
    # can never change: cache them for a year and let the hash do the invalidating.
    class _ImmutableAssets(StaticFiles):
        async def get_response(self, path: str, scope):  # type: ignore[override]
            r = await super().get_response(path, scope)
            r.headers["Cache-Control"] = "public, max-age=31536000, immutable"
            return r

    app.mount("/assets", _ImmutableAssets(directory=_STATIC / "assets"), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def spa(full_path: str) -> FileResponse:
        candidate = _STATIC / full_path
        if full_path and candidate.is_file():
            return FileResponse(candidate)
        # index.html names the hashed bundles, so it is the one file that MUST be revalidated
        # on every load. FileResponse sends no Cache-Control of its own, which leaves browsers
        # free to apply heuristic caching (roughly 10% of the time since Last-Modified) — a
        # stale index.html then keeps pointing at the previous build's assets and a deploy
        # looks like it "did not update the frontend". The ETag keeps revalidation cheap (304).
        return FileResponse(
            _STATIC / "index.html",
            headers={"Cache-Control": "no-cache, must-revalidate"},
        )
