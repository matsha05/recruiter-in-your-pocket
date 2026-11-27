# RIYP database recovery

The Mac runs a backup at 02:15 local time while the owner is logged in. macOS coalesces a missed calendar run when it wakes. The hourly check reads the newest off-site snapshot and sends a Mac notification if the repository is inaccessible, empty, or more than 30 hours behind. A powered-off Mac cannot send that notification. Check both logs after an extended absence.

## Configure once

Use PostgreSQL 17 client tools and restic. Create a private Cloudflare R2 Standard bucket dedicated to RIYP and a token scoped to this bucket. Keep public access disabled. The following owner-only files live in `~/Library/Application Support/RIYP Backup`. Set the directory to mode 700 and the files to 600. File contents and customer records stay outside Git.

| File | Contents |
| --- | --- |
| `repository` | The R2 S3 repository URL, e.g. `s3:https://ACCOUNT.r2.cloudflarestorage.com/riyp-db-backups` |
| `aws-credentials` | An AWS-format profile named `riyp-backup` with the bucket token's access key and secret |
| `recovery-password` | A unique randomly generated restic password. Keep a recoverable copy in the owner's password manager, independent of this Mac. |
| `pg_service.conf` | A libpq service named `riyp_backup` with the approved Supabase session-pooler host, port, database, read-capable user and TLS verification settings |
| `pgpass` | The libpq password entry for that service |

Initialize the empty R2 repository once with `restic init`, using the same repository, profile and password file as `database.sh`. Run `database.sh backup` and `database.sh check`. Then run `python3 install-macos.py` to install the jobs. Look in the configuration directory for `backup.log` and `check.log`. Each log records the time and stage. Restic encrypts each database dump before sending it to R2 and retains the latest snapshot from each of the seven most recent backup days.

## Restore rehearsal

1. Select a dated snapshot using the same credentials and `restic snapshots --host riyp-production --tag riyp-db --path /riyp.dump`. Run `restic check --read-data`.
2. Prepare an access-restricted, isolated PostgreSQL 17 target with the Supabase roles and extensions the archive needs. The archive creates its three schemas. On a newly created empty target, remove its empty default public schema before restoring, or exclude that single schema-creation entry from the restore list. The archive contains the public, auth, and storage schemas with their data. The database backup covers storage metadata only. Check separately for stored files when that feature is used.
3. Restore the snapshot to the prepared target with `set -o pipefail` and `restic dump SNAPSHOT /riyp.dump | pg_restore --exit-on-error --single-transaction --dbname=ISOLATED_TARGET`. On a blank local test cluster with synthetic data, owner and grants can be omitted. A production recovery rehearsal must also verify ownership, grants and row-level security.
4. Confirm the designated test account can read its known saved report and answer, and sees its expected remaining credits and expiry. Log the snapshot date, test outcomes and elapsed time only. Release the isolated restore target under the owner's data retention policy.
