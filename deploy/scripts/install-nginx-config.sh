#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MODE="${1:-http}"

if [[ "$EUID" -ne 0 ]]; then
  echo "Run this script with sudo."
  exit 1
fi

if [[ "$MODE" != "http" && "$MODE" != "https" ]]; then
  echo "Usage: sudo $0 [http|https]"
  exit 1
fi

mkdir -p /etc/nginx/snippets /var/www/certbot
cp "$ROOT_DIR/deploy/nginx/rivers-proxy.conf" /etc/nginx/snippets/rivers-proxy.conf
cp "$ROOT_DIR/deploy/nginx/anrivers.com.${MODE}.conf" /etc/nginx/sites-available/anrivers.com
ln -sfn /etc/nginx/sites-available/anrivers.com /etc/nginx/sites-enabled/anrivers.com
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl reload nginx

echo "Installed the $MODE Nginx configuration for anrivers.com."
