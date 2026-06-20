#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/compose.production.yml"
ENV_FILE="${ENV_FILE:-$ROOT_DIR/.env.production}"
BACKUP_FILE="${1:-}"

if [[ -z "$BACKUP_FILE" || ! -f "$BACKUP_FILE" ]]; then
  echo "Usage: CONFIRM_RESTORE=anrivers.com $0 /path/to/backup.sql.gz"
  exit 1
fi

if [[ "${CONFIRM_RESTORE:-}" != "anrivers.com" ]]; then
  echo "Restore replaces the current production database."
  echo "Run again with CONFIRM_RESTORE=anrivers.com after checking the backup."
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE."
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

gunzip --stdout "$BACKUP_FILE" \
  | RIVERS_ENV_FILE="$ENV_FILE" docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T postgres \
      psql --set ON_ERROR_STOP=on --username "$POSTGRES_USER" "$POSTGRES_DB"

echo "Database restored from: $BACKUP_FILE"
