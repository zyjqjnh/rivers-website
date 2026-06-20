#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

cd "$ROOT_DIR"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "The server worktree has uncommitted changes. Update aborted."
  exit 1
fi

"$ROOT_DIR/deploy/scripts/backup-db.sh"
git pull --ff-only
"$ROOT_DIR/deploy/scripts/deploy.sh"
