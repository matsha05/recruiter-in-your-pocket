# RIYP Incident Runbook

**Last Updated:** March 7, 2026  
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
| Launch command | Matt | support@recruiterinyourpocket.com |
| Auth and identity | Matt | support@recruiterinyourpocket.com |
| Billing and unlocks | Matt | Stripe dashboard + support |
| Extension sync | Matt | status page + support |
| AI quality | Matt | PromptOps shipping gate |
| Trust and security | Matt | security@recruiterinyourpocket.com |

## Immediate Actions

### Auth incident

1. Confirm impact on `/api/ready` and `/launch`
2. Disable extension sync if the issue crosses the extension boundary
3. Validate auth callback path and sign-in flow from a clean browser session

### Billing incident

1. Set `NEXT_PUBLIC_ENABLE_BILLING_UNLOCK=false` if unlock correctness is in doubt
2. Confirm webhook verification and Stripe event delivery
3. Restore access manually only after the event log is understood

### Extension incident

1. Set `NEXT_PUBLIC_ENABLE_EXTENSION_SYNC=false`
2. Confirm exact allowed extension origin list
3. Re-test popup auth and saved-job persistence locally before re-enabling

### AI quality incident

1. Freeze prompt changes
2. Run `npm run eval:golden -- --baseline ../tests/fixtures/baselines/v2_baseline.json`
3. Revert or disable the change if any FAIL fixtures appear

## Public Communication Standard

- Update `/status` if the issue affects live users
- Send security reports to `security@recruiterinyourpocket.com`
- Keep user messaging factual, brief, and recovery-oriented

## Recovery Criteria

Do not resolve the incident until:

1. The relevant launch flag is either safely disabled or safely re-enabled
2. The matching gate in `/api/ready` has returned to pass/warn without blockers
3. The affected rehearsal step or launch command has been re-run successfully
