#!/usr/bin/env bash
# Deploy production stack on the VPS after pushing changes to git.
#
# Usage (from repo root or anywhere):
#   ./scripts/deploy.sh
#   npm run deploy
#
# Options:
#   --no-pull       Skip git pull (deploy current working tree only)
#   --prune         Remove unused Docker images after deploy
#   --help          Show this help
#
# Environment:
#   DEPLOY_HEALTH_URL       Default: http://127.0.0.1:8080/api/health
#   DEPLOY_HEALTH_RETRIES   Default: 30
#   DEPLOY_HEALTH_INTERVAL  Seconds between retries, default: 2

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

SKIP_PULL=false
PRUNE_IMAGES=false
HEALTH_URL="${DEPLOY_HEALTH_URL:-http://127.0.0.1:8080/api/health}"
HEALTH_RETRIES="${DEPLOY_HEALTH_RETRIES:-30}"
HEALTH_INTERVAL="${DEPLOY_HEALTH_INTERVAL:-2}"

usage() {
  sed -n '2,16p' "$0" | sed 's/^# \{0,1\}//'
}

log() {
  printf '[deploy] %s\n' "$*"
}

die() {
  printf '[deploy] ERROR: %s\n' "$*" >&2
  exit 1
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --no-pull)
      SKIP_PULL=true
      shift
      ;;
    --prune)
      PRUNE_IMAGES=true
      shift
      ;;
    --help | -h)
      usage
      exit 0
      ;;
    *)
      die "Unknown option: $1 (try --help)"
      ;;
  esac
done

command -v docker >/dev/null 2>&1 || die "docker not found"
docker compose version >/dev/null 2>&1 || die "docker compose plugin not found"
command -v curl >/dev/null 2>&1 || die "curl not found"

[[ -f .env ]] || die ".env missing — copy .env.example and configure it first"

if ! $SKIP_PULL; then
  if [[ -d .git ]]; then
    if ! git diff --quiet || ! git diff --cached --quiet; then
      die "Working tree has uncommitted changes — commit, stash, or use --no-pull"
    fi
    log "Pulling latest code (git pull --ff-only)..."
    git pull --ff-only
  else
    log "Not a git repository — skipping pull"
  fi
else
  log "Skipping git pull (--no-pull)"
fi

log "Building and restarting containers..."
docker compose up -d --build

log "Waiting for API health at ${HEALTH_URL} ..."
ready=false
for attempt in $(seq 1 "$HEALTH_RETRIES"); do
  if response="$(curl -sf "$HEALTH_URL" 2>/dev/null)"; then
    log "Health check OK: ${response}"
    ready=true
    break
  fi
  if [[ "$attempt" -eq "$HEALTH_RETRIES" ]]; then
    die "Health check failed after ${HEALTH_RETRIES} attempts"
  fi
  sleep "$HEALTH_INTERVAL"
done

if $PRUNE_IMAGES; then
  log "Pruning unused Docker images..."
  docker image prune -f >/dev/null
fi

log "Running containers:"
docker compose ps

if $ready; then
  log "Deploy completed successfully."
fi
