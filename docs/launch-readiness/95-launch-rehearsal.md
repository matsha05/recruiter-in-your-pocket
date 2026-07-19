# RIYP Solo Launch Rehearsal

**Last updated:** July 19, 2026
**Tester:** Matt Shaw
**Status:** Required before controlled paid beta

Run this against a production-like preview in a clean browser profile. Use Stripe test mode. Capture one screenshot or short note for every section, including failures and confusing moments.

## Before You Start

- Record the release identifier and preview URL.
- Confirm the extension, analytics, error replay, guest save, public share, and paid eval flags are off.
- Confirm the ordered migration set has replayed cleanly and the preview database is current through migration 014.
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
- Cancel in Stripe test mode and confirm the product reflects the expected access window.

Pass when billing is idempotent, recoverable, and understandable.

## 5. Export and Deletion

- Export the account data and inspect the contents.
- Delete the same account.
- Confirm reports, billing linkage, and other user-owned records are removed or anonymized as promised.
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
