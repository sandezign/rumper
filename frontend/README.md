# Rumper — Frontend

Vite + React 19 + TypeScript SPA: the chat workspace, guided intake, and the Mini Check
result view. Styled with Tailwind v4 + shadcn-style primitives. Talks to the backend over
**same-origin `/api`** (cookies carry the session). In production the backend serves this
build; in dev the Vite server proxies `/api` to a backend you choose.

> Implementation docs: [`docs/01-routing-and-workspace.md`](docs/01-routing-and-workspace.md),
> [`docs/02-api-client.md`](docs/02-api-client.md), [`docs/03-components.md`](docs/03-components.md).
> Repo-wide setup: [`../README.md`](../README.md).

## Prerequisites

- Node.js **≥ 20**
- A reachable backend API (local on `:8000`, or the deployed one)

## Install

```bash
npm install
```

## Environment

Build-time vars (`VITE_*`) — copy `.env.example` to `.env.local` and fill what you need:

| Var | Used for | Needed when |
|---|---|---|
| `VITE_API_PROXY` | dev-server `/api` proxy target (default `http://localhost:8000`) | running the FE against a remote API |
| `VITE_GOOGLE_MAPS_KEY` | Google Maps JS in the result map panel | the map should render |
| `VITE_GOOGLE_CLIENT_ID` | Google Identity sign-in button | logging in |

## Run

### Against a local backend (default — full-stack dev)

```bash
npm run dev          # http://localhost:3000, proxies /api → http://localhost:8000
```

Pair this with the backend running on `:8000` (see [`../README.md`](../README.md) mode A).

### Frontend only, against the prod API

```bash
VITE_API_PROXY=https://rumper.web.app npm run dev
# or persist: echo 'VITE_API_PROXY=https://rumper.web.app' >> .env.local
```

No local backend, Postgres, or server keys required. The dev server proxies `/api` to the
deployed origin.

> **Login works here, no backend redeploy needed.** The dev proxy rewrites the request
> `Origin` to the target (so the backend's CSRF check passes) and strips the session
> cookie's `Secure`/`Domain` (so the browser stores it over `http://localhost`) — both
> dev-only, prod untouched. The only requirement is that the Google OAuth client lists
> `http://localhost:3000` as an Authorized JavaScript origin. Requests still show as
> `http://localhost:3000/api/...` in DevTools — that's the proxy working, not a bug. You're
> on **real prod data**, so use a test account. Pure layout work needs none of this.

## Build & preview

```bash
npm run build        # tsc -b && vite build → outputs to ../backend/static (served in prod)
npm run preview      # serve the production build locally
```

## Dev-only routes

- **`/dev/research-loading`** — preview the first-run `ResearchLoading` screen with a
  **mocked** step flow (timeouts, no API). Use it to design/tune the loader in isolation;
  "Restart" replays the sequence. Gated by `import.meta.env.DEV`, so it's absent from
  production builds.

## Project structure

```
src/
  components/   workspace shell, AssistantRail, ResearchLoading, MapPanel, analysis/…
  pages/        Intake (/form), Check (/cek/:id), DevResearchLoading (dev only)
  lib/          api.ts (typed client + SSE), wizard.ts (guided-intake state)
  main.tsx      router (see docs/01)
```
