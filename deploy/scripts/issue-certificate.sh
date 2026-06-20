#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
EMAIL="${1:-}"

if [[ -z "$EMAIL" ]]; then
  echo "Usage: sudo $0 your-email@example.com"
  exit 1
fi

if [[ "$EUID" -ne 0 ]]; then
  echo "Run this script with sudo."
  exit 1
fi

certbot certonly \
  --webroot \
  --webroot-path /var/www/certbot \
  --domain anrivers.com \
  --domain www.anrivers.com \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email

"$ROOT_DIR/deploy/scripts/install-nginx-config.sh" https
systemctl enable --now certbot.timer

echo "HTTPS is enabled for https://anrivers.com."
