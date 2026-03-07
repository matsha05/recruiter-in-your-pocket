# RIYP Go/No-Go Launch Program

**Last Updated:** March 7, 2026  
**Status:** Active source of truth

This document replaces any older static "GO" verdict in the repo. A launch decision is valid only when the current runtime readiness page, the launch gate command, and the rehearsal checklist all agree.

## Command Surface

Run these from the repo root:

```bash
npm run launch:gate
npm run launch:gate:strict
npm run launch:rehearsal
```

`launch:gate`
- Standard preflight.
- Runs lint, typecheck, security tests, web build, extension build, root contract tests, and eval dry-run.
- Writes `docs/launch-readiness/generated/go-no-go-latest.json`.

`launch:gate:strict`
- Required before any live launch decision.
- Includes live smoke and golden evals when `OPENAI_API_KEY` is present.
- Fails immediately if strict launch evals cannot run.

`launch:rehearsal`
- Generates the human rehearsal checklist used in the final launch meeting.

## Required Evidence

All of the following must be green before launch:

| Gate | Evidence | Source |
|:-----|:---------|:-------|
| Trust and security | `launch:gate:strict` passes, `/api/ready` reports no blockers, status/privacy/security pages are live | CLI + runtime |
| Auth and identity | Fresh account returns to workspace, anonymous review does not create durable ownership | rehearsal |
| Billing and unlocks | Test checkout, restore, receipts, and portal work | rehearsal |
| Extension | Sign-in opens the real auth path, captured jobs persist across reopen and second profile | rehearsal |
| PromptOps quality | Golden eval passes against baseline with zero FAIL fixtures | strict gate |
| Docs and incident readiness | Vendor review, runbook, rollback controls, and launch checklist are current | docs |

## Go/No-Go Rule

Launch is `GO` only when:

1. `npm run launch:gate:strict` exits `0`
2. `/api/ready` reports `goNoGo: true`
3. The final rehearsal completes with evidence captured for every step
4. No marketed feature is enabled behind a flag unless it is fully working and reviewed

Launch is automatically `NO-GO` if any of the following are true:

- Any critical launch-gate command fails
- `NEXT_PUBLIC_ENABLE_PUBLIC_SHARE_LINKS=true`
- `NEXT_PUBLIC_ENABLE_GUEST_REPORT_SAVE=true`
- `NEXT_PUBLIC_ENABLE_ERROR_REPLAY=true` without explicit privacy sign-off
- Billing is enabled without Stripe webhook verification configured
- Extension sync is enabled without exact extension origins configured

## Launch-Day Workflow

1. Run `npm run launch:gate:strict`
2. Open the internal launch page at `/launch`
3. Confirm `/api/ready` shows no blockers
4. Run the rehearsal checklist on a clean browser profile
5. Record the timestamp, operator, and verdict in the launch thread

## Rollback Standard

If any launch-critical surface regresses, prefer disabling the affected surface before rolling back the whole product:

| Surface | Control |
|:--------|:--------|
| Extension sync | `NEXT_PUBLIC_ENABLE_EXTENSION_SYNC=false` |
| Billing unlock | `NEXT_PUBLIC_ENABLE_BILLING_UNLOCK=false` |
| Analytics | `NEXT_PUBLIC_ENABLE_ANALYTICS=false` |
| Error replay | `NEXT_PUBLIC_ENABLE_ERROR_REPLAY=false` |
| Guest save | `NEXT_PUBLIC_ENABLE_GUEST_REPORT_SAVE=false` |
| Public share | `NEXT_PUBLIC_ENABLE_PUBLIC_SHARE_LINKS=false` |

## References

- `docs/launch-readiness/85-vendor-privacy-review.md`
- `docs/launch-readiness/90-incident-runbook.md`
- `docs/launch-readiness/95-launch-rehearsal.md`
- `docs/promptops/shipping-gate.md`
