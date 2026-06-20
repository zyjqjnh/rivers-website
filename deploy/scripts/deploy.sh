#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/compose.production.yml"
ENV_FILE="${ENV_FILE:-$ROOT_DIR/.env.production}"
SEED=false

if [[ "${1:-}" == "--seed" ]]; then
  SEED=true
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE. Copy .env.production.example and fill in production values."
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

for variable in POSTGRES_USER POSTGRES_PASSWORD POSTGRES_DB DATABASE_URL ADMIN_EMAIL ADMIN_PASSWORD AUTH_SECRET; do
  value="${!variable:-}"
  if [[ -z "$value" || "$value" == *"replace-with"* ]]; then
    echo "Set a production value for $variable in $ENV_FILE."
    exit 1
  fi
done

compose() {
  RIVERS_ENV_FILE="$ENV_FILE" docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" "$@"
}

echo "Building application and migration images..."
compose build app migrate

echo "Starting PostgreSQL..."
compose up -d postgres

echo "Applying database migrations..."
compose run --rm migrate

if [[ "$SEED" == true ]]; then
  echo "Creating the initial administrator and seed catalogue..."
  compose run --rm seed
fi

echo "Starting the application..."
compose up -d app

echo "Waiting for the application health check..."
for attempt in {1..30}; do
  if curl --fail --silent http://127.0.0.1:3000/api/health >/dev/null; then
    echo "Deployment is healthy at http://127.0.0.1:3000."
    compose ps
    exit 0
  fi
  sleep 2
done

echo "The application did not become healthy in time."
compose logs --tail=100 app postgres
exit 1
