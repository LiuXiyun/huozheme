#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/huozheme}"
REPO_URL="${REPO_URL:-https://github.com/LiuXiyun/huozheme.git}"
BRANCH="${BRANCH:-main}"

if [ "$(id -u)" -ne 0 ]; then
  echo "Please run as root on the ECS instance." >&2
  exit 1
fi

if command -v dnf >/dev/null 2>&1; then
  dnf install -y git nginx curl
elif command -v yum >/dev/null 2>&1; then
  yum install -y git nginx curl
else
  echo "This script expects dnf or yum." >&2
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
  if command -v dnf >/dev/null 2>&1; then
    dnf install -y nodejs
  else
    yum install -y nodejs
  fi
fi

npm install -g pm2

mkdir -p "$(dirname "$APP_DIR")"
if [ ! -d "$APP_DIR/.git" ]; then
  git clone --branch "$BRANCH" "$REPO_URL" "$APP_DIR"
fi

cd "$APP_DIR"
npm ci --omit=dev

if [ ! -f "$APP_DIR/.env" ]; then
  cp "$APP_DIR/.env.example" "$APP_DIR/.env"
  echo "Created $APP_DIR/.env. Fill production secrets before enabling AI/Redis."
fi

install -m 0644 "$APP_DIR/deploy/nginx/huozheme.conf" /etc/nginx/conf.d/huozheme.conf
nginx -t
systemctl enable --now nginx
systemctl reload nginx

pm2 start "$APP_DIR/ecosystem.config.cjs" --env production || pm2 reload "$APP_DIR/ecosystem.config.cjs" --env production
pm2 save
pm2 startup systemd -u root --hp /root || true

echo "Huozheme is running behind Nginx. Open http://SERVER_IP/ after the security group allows port 80."
