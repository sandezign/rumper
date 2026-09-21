.PHONY: install dev migrate revision db-reset ingest-geo ingest-boundaries build-fe reset-usage reset-user-data secret-push lint fmt help

PROJECT ?= rumper-499015
REGION  ?= asia-southeast2

help:
	@echo "make install     - install deps (uv sync)"
	@echo "make dev         - run the API on :8000 with reload (serves frontend build too)"
	@echo "make migrate     - alembic upgrade head"
	@echo "make revision m=\"msg\" - autogenerate a new migration"
	@echo "make db-reset    - drop+create local 'rumper' DB, run migrations (geo data needs re-ingest!)"
	@echo "make ingest-geo [ARGS=\"toll_gate sutet_tower\"] - ingest OSM warehouse datasets (docs/10)"
	@echo "make ingest-boundaries - ingest kelurahan polygons + flood index (weekly, docs/19)"
	@echo "make build-fe    - build the frontend into backend/static"
	@echo "make reset-user-data [FORCE=1] - wipe conversations/intakes/reports so curation can re-run"
	@echo "make reset-usage [EMAIL=you@example.com] - clear today's usage events (dev quota reset)"
	@echo "make secret-push - push the WHOLE .env as ONE Secret Manager secret (rumper-env)"
	@echo "make lint / make fmt"

install:
	uv sync

dev:
	uv run uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

migrate:
	uv run alembic upgrade head

revision:
	uv run alembic revision --autogenerate -m "$(m)"

db-reset:
	-psql -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='rumper' AND pid<>pg_backend_pid();" >/dev/null 2>&1
	dropdb --if-exists rumper && createdb rumper && uv run alembic upgrade head
	@echo "DB reset. Re-run 'make ingest-geo' to refill the geo warehouse."

ingest-geo:
	uv run python -m app.jobs.ingest_geo $(ARGS)

ingest-boundaries:
	uv run python -m app.jobs.ingest_boundaries

build-fe:
	cd ../frontend && npm run build

reset-usage:
	psql -d rumper -c "DELETE FROM usage_events WHERE created_at >= (now() AT TIME ZONE 'Asia/Jakarta')::date AT TIME ZONE 'Asia/Jakarta' $(if $(EMAIL),AND user_id=(SELECT id FROM users WHERE email='$(EMAIL)'),);"

reset-user-data:
	uv run python -m app.jobs.reset_user_data

secret-push:
	@test -f .env || (echo ".env not found" && exit 1)
	gcloud secrets create rumper-env --project=$(PROJECT) --data-file=.env 2>/dev/null \
	  || gcloud secrets versions add rumper-env --project=$(PROJECT) --data-file=.env
	@echo "pushed .env -> secret 'rumper-env' (mount in Cloud Run; set ENV_FILE to its path)"

lint:
	uvx ruff check .

fmt:
	uvx ruff format .

schedule-ingest:   ## update the monthly ingestion cron (CRON="0 0 1 * *", WIB)
	gcloud scheduler jobs update http rumper-ingest-monthly --location=asia-southeast2 \
	  --schedule="$(or $(CRON),0 0 1 * *)" --time-zone="Asia/Jakarta" --project=$(PROJECT)

run-ingest-now:   ## execute the prod ingestion job immediately
	gcloud run jobs execute rumper-ingest --region=asia-southeast2 --project=$(PROJECT)

reset-user-data:  ## Wipe journey data (conversations/intakes/reports) so curation can re-run
	@$(VENV)/bin/python scripts/reset_user_data.py
