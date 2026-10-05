#!/usr/bin/env bash
# Daily Postgres backup. Install as a cron job for the postgres user:
#   15 3 * * * /srv/mbs/deploy/scripts/backup-db.sh
# Set S3_BUCKET (for example s3://my-mbs-backups) to also copy each dump off the machine.
set -euo pipefail

# cron runs with a minimal PATH; the AWS CLI installer uses /usr/local/bin.
export PATH="/usr/local/bin:/usr/bin:/bin:/snap/bin"

DB_NAME="${DB_NAME:-mbs}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/mbs}"
KEEP_DAYS="${KEEP_DAYS:-14}"

mkdir -p "$BACKUP_DIR"
file="$BACKUP_DIR/$DB_NAME-$(date +%Y%m%d-%H%M%S).dump"

pg_dump --format=custom --file="$file" "$DB_NAME"

if [[ -n "${S3_BUCKET:-}" ]]; then
    aws s3 cp "$file" "$S3_BUCKET/"
fi

find "$BACKUP_DIR" -name "$DB_NAME-*.dump" -mtime +"$KEEP_DAYS" -delete
