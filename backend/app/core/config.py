"""App settings — loaded from backend/.env locally or ENV_FILE (Secret Manager mount)."""
import os
from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

_ENV_FILE = os.environ.get("ENV_FILE", str(Path(__file__).resolve().parents[2] / ".env"))


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=_ENV_FILE, env_file_encoding="utf-8", extra="ignore")

    gemini_api_key: str
    gemini_model: str = "gemini-3.5-flash"
    maps_api_key: str
    database_url: str = "postgresql+asyncpg://localhost/rumper"
    # Allowed browser origin(s) for CORS + the CSRF Origin check. Comma-separated to allow
    # more than one (e.g. prod + a local dev server): "https://rumper.web.app,http://localhost:3000".
    frontend_origin: str = "http://localhost:3000"

    @property
    def frontend_origins(self) -> list[str]:
        return [o.strip() for o in self.frontend_origin.split(",") if o.strip()]

    # auth + quota (docs/13) — HS256 needs ≥32 bytes (RFC 7518); override in prod
    app_secret: str = "dev-secret-change-me-padded-to-32-bytes!"
    google_oauth_client_id: str = ""
    google_oauth_client_secret: str = ""
    default_token_limit: int = 50_000

    # LangSmith tracing (ADR-011)
    langsmith_tracing: bool = False
    langsmith_api_key: str | None = None
    langsmith_project: str = "rumper"

    # budgets (docs/11 §4)
    researcher_timeout_seconds: float = 75.0
    graph_timeout_seconds: float = 480.0
    max_refine_iterations: int = 1
    llm_temperature: float = 0.2
    composer_temperature: float = 0.4


def async_db_url(url: str) -> str:
    """Canonical postgres URL → SQLAlchemy asyncpg URL.

    Neon/libpq-style params (`sslmode`, `channel_binding`) are libpq-only; asyncpg
    wants `ssl=require` and chokes on the others.
    """
    import re

    u = url
    if u.startswith("postgresql://"):
        u = "postgresql+asyncpg://" + u[len("postgresql://"):]
    u = u.replace("+psycopg2", "+asyncpg").replace("+psycopg", "+asyncpg")
    u = re.sub(r"[?&]channel_binding=[^&]*", "", u)
    u = u.replace("sslmode=require", "ssl=require")
    u = u.replace("?&", "?").rstrip("?&")
    return u


def sync_db_url(url: str) -> str:
    """Canonical postgres URL → psycopg2 URL for Alembic (libpq params pass through)."""
    u = url.replace("+asyncpg", "")
    if u.startswith("postgresql://"):
        u = "postgresql+psycopg2://" + u[len("postgresql://"):]
    return u


@lru_cache
def get_settings() -> Settings:
    s = Settings()
    # langsmith reads os.environ, not pydantic settings — bridge the .env values
    if s.langsmith_tracing and s.langsmith_api_key:
        os.environ.setdefault("LANGSMITH_TRACING", "true")
        os.environ.setdefault("LANGSMITH_API_KEY", s.langsmith_api_key)
        os.environ.setdefault("LANGSMITH_PROJECT", s.langsmith_project)
    return s
