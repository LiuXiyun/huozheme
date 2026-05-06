#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/huozheme}"
BRANCH="${BRANCH:-main}"

cd "$APP_DIR"

git fetch origin "$BRANCH"
git reset --hard "origin/$BRANCH"

npm ci --omit=dev
npm run check

if command -v pm2 >/dev/null 2>&1; then
  pm2 reload ecosystem.config.cjs --env production || pm2 start ecosystem.config.cjs --env production
  pm2 save
else
  echo "pm2 is not installed. Install it with: npm install -g pm2" >&2
  exit 1
fi
