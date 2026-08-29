# RIYP Incident Runbook

**Last Updated:** July 30, 2026
**Status:** Active

## Severity Model

| Severity | Definition | Example |
|:---------|:-----------|:--------|
| SEV-1 | Trust, billing, or auth incident with user impact and no safe workaround | Users are charged but unlocks fail, or extension auth leaks across origins |
| SEV-2 | Launch-critical feature degraded but partially recoverable | Saved-job sync fails, billing portal errors, or report saves intermittently fail |
| SEV-3 | Contained issue with workaround | Public status page stale, analytics disabled, or a non-critical page broken |

## Owners

| Surface | Primary | Backup |
|:--------|:--------|:-------|
| Launch command | Matt | GitHub Issues backup alert |
| Auth and identity | Matt | GitHub Issues backup alert |
| Billing and unlocks | Matt | Stripe Dashboard plus GitHub Issues backup alert |
| Extension sync | Matt | status page + support |
| AI quality | Matt | PromptOps shipping gate |
| Trust and security | Matt | support@recruiterinyourpocket.com |

## Alert Routing

- Primary: Sentry emails production error and fatal alerts to `mattrshaw2011@gmail.com`.
- Backup: `.github/workflows/sentry-github-backup.yml` runs every 30 minutes and can be dispatched manually. It files a scrubbed GitHub issue for each unresolved production error or fatal Sentry issue and deduplicates by Sentry short ID.
- If the primary email does not arrive, run the backup workflow manually with a 120-minute lookback and inspect its latest GitHub Actions run before treating the incident as contained.
- If the backup workflow fails, use the Sentry issue stream as the source of truth, check the scoped `RIYP_SENTRY_READ_TOKEN` GitHub secret, and restore the workflow without copying event payloads or private user data into GitHub.
- Delivery rehearsal: Sentry event `3883c3a8-3c03-4760-9267-672aac0f665d` produced the primary email and [GitHub issue #5](https://github.com/matsha05/recruiter-in-your-pocket/issues/5) on July 30, 2026.

## Immediate Actions

### Auth incident

1. Confirm impact on `/api/ready` and `/launch`
2. Disable extension sync if the issue crosses the extension boundary
3. Validate auth callback path and sign-in flow from a clean browser session

### Billing incident

1. Set `RIYP_DISABLE_NEW_PURCHASES=true` and redeploy to stop new Checkout Sessions while preserving receipts, restore, portal, and refund handling.
2. Confirm webhook verification, event-lease state, and Stripe delivery history before changing existing access.
3. If fulfillment itself is unsafe, set `NEXT_PUBLIC_ENABLE_BILLING_UNLOCK=false` only as the broader second-stage containment control.
4. Restore access manually only after the event log and entitlement block ledger are understood.

### Extension incident

1. Set `NEXT_PUBLIC_ENABLE_EXTENSION_SYNC=false`
2. Confirm exact allowed extension origin list
3. Re-test popup auth and saved-job persistence locally before re-enabling

### AI quality incident

1. Set `RIYP_DISABLE_GENERATION=true` and redeploy; this must stop provider calls before access is consumed.
2. Freeze prompt changes.
3. Run `npm run eval:golden -- --baseline ../tests/fixtures/baselines/v2_baseline.json` only with an explicit cost budget.
4. Revert the candidate or keep generation paused if any FAIL fixtures appear.

## Deployment Rollback

1. Record the failing deployment ID, the last known-good deployment ID, and the incident start time.
2. Stop the affected action with the narrow kill switch first when that contains user harm.
3. For a production rollback, Matt must explicitly authorize `vercel rollback <last-known-good-deployment-id> --yes`.
4. Verify `/api/health`, `/api/status`, auth return, and the affected workflow after rollback.
5. Do not re-promote the newer candidate. Fix it on a new immutable preview and repeat the relevant rehearsal.

Preview rehearsal uses a disposable preview alias: point the alias to candidate B, verify it, point it back to candidate A, and verify the exact deployment ID changed. It must never touch the production domain.

## Public Communication Standard

- Update `/status` if the issue affects live users
- Send security reports to the verified inbound address, `support@recruiterinyourpocket.com`
- Keep user messaging factual, brief, and recovery-oriented

## Recovery Criteria

Do not resolve the incident until:

1. The relevant launch flag is either safely disabled or safely re-enabled
2. The matching gate in `/api/ready` has returned to pass/warn without blockers
3. The affected rehearsal step or launch command has been re-run successfully
