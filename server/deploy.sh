#!/usr/bin/env bash
#
# server/deploy.sh — first-boot / re-deploy script for an IP-only host.
#
# What it does:
#   1. Sanity-check docker + docker compose are installed.
#   2. Bootstrap server/.env from .env.example on first run.
#   3. Source .env and validate the must-be-set vars.
#   4. Render the nginx config (no TLS, IP-only).
#   5. Pull the BACKEND_IMAGE + FRONTEND_IMAGE tags pinned in .env.
#   6. docker compose up -d, then probe / and /actuator/health.
#
# Re-runs are idempotent: bump tags in .env (or via the deploy workflow)
# and re-run this script to roll the box.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

require() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Error: $1 is not installed." >&2
    exit 1
  fi
}

require docker
if ! docker compose version >/dev/null 2>&1; then
  echo "Error: docker compose plugin is not available." >&2
  exit 1
fi

if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "Created server/.env from .env.example."
  echo "Fill in the CHANGE_ME values, then rerun ./deploy.sh"
  exit 1
fi

set -a
# shellcheck disable=SC1091
source .env
set +a

missing=()
for var in BACKEND_IMAGE FRONTEND_IMAGE \
           SPRING_DATASOURCE_URL SPRING_DATASOURCE_USERNAME SPRING_DATASOURCE_PASSWORD \
           VOYARA_JWT_SECRET VOYARA_CORS_ORIGINS; do
  if [ -z "${!var:-}" ] || [[ "${!var}" == *CHANGE_ME* ]]; then
    missing+=("$var")
  fi
done
if [ ${#missing[@]} -gt 0 ]; then
  echo "Error: these env vars are unset or still placeholder (CHANGE_ME): ${missing[*]}" >&2
  echo "Edit server/.env, then rerun ./deploy.sh" >&2
  exit 1
fi

mkdir -p nginx
cp nginx/nginx.conf.template nginx/current.conf

echo "Pulling images: ${BACKEND_IMAGE}, ${FRONTEND_IMAGE}"
docker compose pull backend frontend

echo "Starting stack..."
docker compose up -d --force-recreate backend frontend nginx

echo "Waiting for nginx :80 to respond..."
for _ in $(seq 1 60); do
  if curl -sf -o /dev/null "http://127.0.0.1/"; then break; fi
  sleep 1
done
if ! curl -sf -o /dev/null "http://127.0.0.1/"; then
  echo "Error: nginx is not responding on http://127.0.0.1:80" >&2
  echo "Try: docker compose logs nginx" >&2
  exit 1
fi

echo "Waiting for backend /actuator/health..."
for _ in $(seq 1 60); do
  if curl -sf -o /dev/null "http://127.0.0.1/actuator/health"; then break; fi
  sleep 1
done
if ! curl -sf -o /dev/null "http://127.0.0.1/actuator/health"; then
  echo "Warning: /actuator/health did not become reachable through nginx within 60s." >&2
  echo "Try: docker compose logs backend" >&2
fi

echo
echo "Deployment complete."
echo "Frontend:  http://<this-host>/"
echo "API:       http://<this-host>/api/"
echo "Health:    http://<this-host>/actuator/health"
echo
echo "Status: docker compose ps"
echo "Logs:   docker compose logs -f nginx backend frontend"
