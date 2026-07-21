# RIYP Solo Launch Rehearsal

**Last updated:** July 19, 2026
**Tester:** Matt Shaw
**Status:** Required before controlled paid beta

Run this against a production-like preview in a clean browser profile. Use Stripe test mode. Capture one screenshot or short note for every section, including failures and confusing moments.

## Before You Start

- Record the release identifier and preview URL.
- Confirm the extension, analytics, error replay, guest save, public share, and paid eval flags are off.
- Confirm the ordered migration set has replayed cleanly and the preview database is current through migration 016.
- Confirm the shared hosted rate limiter is configured.
- Open a desktop browser and a mobile viewport.

## 1. Public Promise

- Homepage explains the product and reaches the workspace cleanly.
- Pricing shows the free complete report and the $29 Job Search Pass only.
- Extension and Jobs are absent from public and product navigation.
- Privacy, security, methodology, terms, support, and status pages load.
- Status describes launch configuration and does not imply live uptime monitoring.

Pass when the public promise matches the experience that follows.

## 2. Anonymous First Report

- Open the workspace in a new private window.
- Upload a supported resume, then repeat using pasted text.
- Confirm unsupported files, oversized files, and very short resumes get specific guidance.
- Add and remove job context.
- Generate the report and review every section on desktop and mobile.
- Confirm the anonymous run is not attached to an account.
- Confirm retry and recovery behavior by forcing one safe error in preview.

Pass when the journey is obvious without assistance and the report is genuinely useful.

## 3. Account and History

- Create a new account from the product and return to the intended destination.
- Generate and save a signed-in report.
- Refresh, sign out, and sign back in.
- Confirm the saved report reopens from history.
- Confirm storage copy matches what was actually persisted.

Pass when account state is predictable and no report appears under the wrong identity.

## 4. Job Search Pass Purchase

- Reach the paywall through normal use.
- Confirm the modal shows one $29 Job Search Pass with five reports, 30-day expiration, and no renewal.
- Complete Stripe test checkout.
- Confirm access unlocks once, even if the webhook is replayed three times.
- Retry the webhook after a simulated transient failure.
- Confirm billing restore and the customer portal work.
- Refund the test purchase and confirm access is revoked without later restore or webhook replay resurrecting it.

Pass when billing is idempotent, recoverable, and understandable.

## 5. Export and Deletion

- Export the account data and inspect the contents.
- Delete the same account.
- Confirm reports, billing linkage, generation reservations, and other user-owned records are removed or anonymized as promised.
- Confirm an opaque reversal or deletion guard can remain without retaining the deleted user's product identity.
- Confirm a later sign-in does not resurrect deleted product data.

Pass when the trust promise survives a real destructive workflow.

## 6. Accessibility and Visual Quality

- Complete the core journey using keyboard only.
- Confirm visible focus, useful labels, sensible heading order, and no keyboard traps.
- Test at 390 px, 768 px, 1280 px, and 1440 px widths.
- Test increased text size and reduced motion.
- Look for clipped copy, layout jumps, weak contrast, awkward wrapping, and unclear disabled controls.
- Compare homepage, workspace, report, pricing, auth, paywall, settings, and legal surfaces as one visual system.

Pass when no screen feels like a secondary or unfinished product.

## 7. Operational Recovery

- Disable billing and confirm the public product fails safely.
- Confirm private extension routes are unavailable while the extension flag is off.
- Confirm `/api/health`, `/api/ready`, and `/api/status` return honest results.
- Follow the incident runbook for one simulated report-generation failure.
- Re-enable only the settings required for the release candidate.

Pass when Matt can contain a problem without editing code under pressure.

## Final Record

Record:

- Release identifier
- Preview URL
- Test date and browser/device coverage
- Zero-spend launch-gate result
- Live quality-proof result, once separately authorized
- Known issues accepted for beta
- Final verdict: `GO` or `NO-GO`

Any failed section means `NO-GO` until it is fixed and rerun.

## July 20 Release-Candidate Record

- Release identifier: `2d5699d14ad39186b6fb03caaaa4239fd2a67b33`
- Preview deployment: `dpl_9WrckTMG1zWViGJE3QEbxxBe7soz`
- Preview URL: `https://rip-nextjs-frontend-mwz9n2w3y-matts-projects-59b2b24d.vercel.app`
- Browser: Chrome desktop review completed on the immediately preceding visual candidate. The release-candidate diff contains only hosted prompt/eval readiness code and no UI files.
- Hosted build: ready, with Sentry release artifacts tied to the exact commit.
- Hosted public status: HTTP 200, `ok: true`, all three public service groups configured, and no incidents.
- Hosted health: HTTP 200, `ok: true`.
- Protected readiness: an anonymous request returns a generic HTTP 404 and exposes no internal launch detail.
- Live quality proof: `eval_1784502145848`, pinned `gpt-5-nano-2025-08-07`, 8 PASS, 0 WARN, 0 FAIL, $0.009 token-calculated cost. Hosted readiness now binds this evidence to the exact model and SHA-256 hashes of both deployed resume prompts.
- Automated verification: lint, typecheck, optimized build, security suite, backend contracts, release-integrity tests, migration manifest, clean migration replay, extension build, and dry-run fixture validation passed.
- Local gate note: the root shell correctly reports `NO-GO` when preview-only app URL and shared Redis credentials are absent. The hosted preview reports those launch configurations as present.

### Remaining rehearsal work

- Create and use a disposable account through sign-in, saved history, sign-out, and return.
- Complete the Stripe test purchase, webhook replay/retry, receipt, restore, portal, refund, and revocation cycle.
- Export and permanently delete that same account, then verify no data resurrection.
- Run remote CI after the branch is authorized for push.
- Record Matt's final `GO` and explicitly authorize production promotion.

Current verdict: `NO-GO` for production. The code and visual product are release-candidate ready; the remaining blockers are the real signed-in, billing, destructive-data, remote-CI, and final-authorization rehearsals above. Production billing remains disabled.
