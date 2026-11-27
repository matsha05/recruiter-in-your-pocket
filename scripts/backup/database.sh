#!/bin/bash
# Nightly PostgreSQL backup and independent freshness check, run by launchd.
set -euo pipefail
umask 077
export PATH="/opt/homebrew/opt/postgresql@17/bin:/opt/homebrew/bin:/usr/local/opt/postgresql@17/bin:/usr/local/bin:/usr/bin:/bin"
config=${RIYP_BACKUP_CONFIG:-"$HOME/Library/Application Support/RIYP Backup"}
export RESTIC_REPOSITORY_FILE="$config/repository"
export RESTIC_PASSWORD_FILE="$config/recovery-password"
export PGSERVICEFILE="$config/pg_service.conf" PGPASSFILE="$config/pgpass" PGSERVICE=riyp_backup
export AWS_SHARED_CREDENTIALS_FILE="$config/aws-credentials" AWS_PROFILE=riyp-backup
export RESTIC_CACHE_DIR="$config/cache"
# Keep stdout/stderr limited to the stage and time, including on connection failures.
stage=configuration
failed() {
    echo "$(date -u '+%FT%TZ') RIYP backup failed during $stage" >&2
    logger -t riyp-backup "RIYP database backup needs attention ($stage)"
    if [[ "${RIYP_BACKUP_NOTIFY:-1}" == 1 ]]; then
        osascript -e 'display notification "Check the database backup log." with title "RIYP backup needs attention"' >/dev/null 2>&1 || true
    fi
}
trap failed ERR
filters=(--host riyp-production --tag riyp-db --path /riyp.dump)
case "${1:-}" in
    backup)
        stage=backup
        # pg_dump uses a single consistent transaction. A failed dump never becomes a snapshot.
        restic backup --host riyp-production --tag riyp-db --stdin-filename riyp.dump --stdin-from-command -- \
            pg_dump --format=custom --schema=public --schema=auth --schema=storage --no-password >/dev/null 2>&1
        stage=retention
        restic forget "${filters[@]}" --keep-daily 7 --prune >/dev/null 2>&1
        ;;
    check)
        stage=freshness
        # Query the repository itself. A local timestamp alone cannot prove the off-site upload.
        restic snapshots "${filters[@]}" --latest 1 --json 2>/dev/null | python3 -c '
import datetime, json, sys
rows = json.load(sys.stdin)
if not rows: sys.exit(1)
snapshot = datetime.datetime.fromisoformat(rows[-1]["time"].replace("Z", "+00:00"))
age = datetime.datetime.now(datetime.timezone.utc) - snapshot
sys.exit(0 if datetime.timedelta(0) <= age <= datetime.timedelta(hours=30) else 1)
' 2>/dev/null
        ;;
    *) echo "Usage: database.sh backup|check" >&2; exit 2 ;;
esac
echo "$(date -u '+%FT%TZ') RIYP backup $1 succeeded"
