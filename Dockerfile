# ---- stage 1: frontend (Vite SPA → static bundle) ----
FROM node:22-slim AS fe
WORKDIR /fe
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
# public identifiers (referrer/API-restricted keys), baked at build time
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_GOOGLE_MAPS_KEY
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID \
    VITE_GOOGLE_MAPS_KEY=$VITE_GOOGLE_MAPS_KEY
RUN npm run build -- --outDir dist --emptyOutDir

# ---- stage 2: backend (FastAPI + agent) serving the SPA (ADR-009) ----
FROM python:3.12-slim
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/
WORKDIR /app
ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy
COPY backend/pyproject.toml backend/uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project
COPY backend/ ./
COPY --from=fe /fe/dist ./static
ENV PATH="/app/.venv/bin:$PATH" PYTHONUNBUFFERED=1
CMD exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}
