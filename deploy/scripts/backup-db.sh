#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/compose.production.yml"
ENV_FILE="${ENV_FILE:-$ROOT_DIR/.env.production}"
BACKUP_DIR="${BACKUP_DIR:-$ROOT_DIR/backups}"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE."
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

mkdir -p "$BACKUP_DIR"
BACKUP_FILE="$BACKUP_DIR/rivers-${TIMESTAMP}.sql.gz"

RIVERS_ENV_FILE="$ENV_FILE" docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T postgres \
  pg_dump \
    --clean \
    --if-exists \
    --no-owner \
    --no-privileges \
    --username "$POSTGRES_USER" \
    "$POSTGRES_DB" \
  | gzip -9 > "$BACKUP_FILE"

chmod 600 "$BACKUP_FILE"
echo "Database backup created: $BACKUP_FILE"
