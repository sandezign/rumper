#!/usr/bin/env bash
# Figma MCP launcher for Claude Code (wired up in .mcp.json).
#
# The Figma personal access token is a secret (CLAUDE.md rule 5), so it is NOT in .mcp.json.
# It is read from the gitignored repo-root .env, which keeps the committed config shareable
# while the credential stays on the machine.
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

# Prefer an already-exported value; otherwise read just this one key out of .env (rather
# than sourcing the file, so nothing else in it can execute).
if [ -z "${FIGMA_API_KEY:-}" ] && [ -f .env ]; then
  FIGMA_API_KEY=$(grep -E '^[[:space:]]*FIGMA_API_KEY=' .env | tail -1 | cut -d= -f2- | tr -d '"'"'"' \r')
fi

if [ -z "${FIGMA_API_KEY:-}" ]; then
  echo "figma-mcp: FIGMA_API_KEY not set. Add it to $(pwd)/.env — see .env.example." >&2
  exit 1
fi

# Telemetry off (this repo's rules keep tooling quiet), and pin the image download dir so
# `download_figma_images` writes next to the vendored design system instead of the cwd the
# MCP client happens to launch us in.
export FRAMELINK_TELEMETRY=off
IMAGE_DIR="$(pwd)/frontend/docs/design/figma-exports"
mkdir -p "$IMAGE_DIR"

exec npx -y figma-developer-mcp \
  --figma-api-key="$FIGMA_API_KEY" \
  --image-dir="$IMAGE_DIR" \
  --stdio
