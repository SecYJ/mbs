#!/usr/bin/env bash
# Pull, build, migrate and restart. Run as the mbs user:
#   sudo -u mbs bash /srv/mbs/deploy/scripts/deploy.sh [--no-restart]
# Restarting needs sudo rights for: systemctl restart mbs-server mbs-client
set -euo pipefail

APP_DIR="${APP_DIR:-/srv/mbs}"
BRANCH="${BRANCH:-master}"
SERVER_ENV="${SERVER_ENV:-/etc/mbs/server.env}"

cd "$APP_DIR"

echo "==> Pulling $BRANCH"
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

echo "==> Installing dependencies"
pnpm install --frozen-lockfile

echo "==> Building client"
pnpm --filter @mbs/client build

echo "==> Running database migrations"
(
    set -a
    # shellcheck source=/dev/null
    . "$SERVER_ENV"
    set +a
    pnpm db:migrate
)

if [[ "${1:-}" == "--no-restart" ]]; then
    echo "==> Done (services not restarted)"
    exit 0
fi

echo "==> Restarting services"
sudo systemctl restart mbs-server mbs-client

echo "==> Checking health"
for _ in $(seq 1 20); do
    if curl -fsS http://127.0.0.1:3000/health >/dev/null; then
        echo "==> Deploy finished"
        exit 0
    fi
    sleep 1
done

echo "Express did not become healthy; see: journalctl -u mbs-server -n 100" >&2
exit 1
