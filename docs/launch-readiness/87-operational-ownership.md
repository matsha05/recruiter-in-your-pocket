# Operational Ownership: Support, Tax, Analytics, and Alerts

**Last updated:** July 30, 2026
**Launch status:** Support and dual-path operational alert delivery verified

This document names the operating work that code cannot honestly complete by itself. Evidence flags are assertions about a finished rehearsal, never switches that make an unverified destination real.

## Support and Alert Delivery

| Responsibility | Primary | Backup | Launch evidence |
|:--|:--|:--|:--|
| Product, auth, privacy, and billing support | Matt | Forwarded operator inbox at `mattrshaw2011@gmail.com` | Passed July 30, 2026: an external sender reached the public support address, the signed inbound route forwarded it, an allowlisted operator replied, and the external sender received that reply. `RIYP_SUPPORT_INBOX_VERIFIED=true`. |
| SEV-1/SEV-2 operational alert | Sentry email to `mattrshaw2011@gmail.com` | GitHub Issues through `.github/workflows/sentry-github-backup.yml` | Passed July 30, 2026. Production rehearsal event `3883c3a8-3c03-4760-9267-672aac0f665d` (`JAVASCRIPT-NEXTJS-11`) reached Gmail at 15:55:46 UTC and created [GitHub issue #5](https://github.com/matsha05/recruiter-in-your-pocket/issues/5) at 15:59:58 UTC through successful workflow run `30559387132`. A direct Sentry test also reached Gmail as `JAVASCRIPT-NEXTJS-12` at 15:59:22 UTC. `RIYP_SECONDARY_ALERT_VERIFIED=true`. |

Sentry email is the immediate path. The public-repository GitHub Actions workflow polls unresolved production `error` and `fatal` issues every 30 minutes, creates a scrubbed issue without request, user, payload, or stack data, and deduplicates by Sentry short ID. A manual rerun against `JAVASCRIPT-NEXTJS-10` created no duplicate, proving idempotency. The evidence flag records this completed delivery test; it does not replace either alert path.

## Stripe Tax Ownership

Owner: Matt. A qualified tax professional remains the decision-maker for whether and when RIYP must register in a jurisdiction.

Before launch:

1. Confirm the Stripe Tax preset product tax code matches the Job Search Pass.
2. Confirm the business origin and any physical-presence jurisdiction outside Stripe's remote-seller threshold monitor.
3. In live-mode Stripe Tax settings, keep threshold email notifications enabled for the account owner.
4. Review Registrations and Thresholds. Do not add a collection registration before the business is actually registered with that authority.
5. Save a dated note of `Monitoring`, `Upcoming`, and `Exceeded` jurisdictions; escalate `Upcoming` or `Exceeded` before accepting another week of sales without a registration decision.

Cadence: every Monday during launch, then monthly only after a tax adviser approves the lower cadence. Review again immediately after entering a new sales channel, adding non-Stripe sales, changing the product tax code, or creating physical presence in a new jurisdiction.

Stripe's monitor is decision support, not a legal determination. It primarily tracks Stripe-processed live-mode sales, can lag new transactions, and does not monitor every physical-presence obligation. Refunds can also take time to update threshold status.

## Privacy-Approved Product Analytics

Launch default: `NEXT_PUBLIC_ENABLE_ANALYTICS=false`.

The implementation may be enabled later only when all of the following remain true:

- Mixpanel is the only product-event SDK loaded; automatic pageviews are off.
- Browser Do Not Track is honored before initialization and before every event.
- Event names and properties pass `analyticsPolicy.ts`; arbitrary events fail closed.
- Resume text, job descriptions, report/export/checkout identifiers, email-shaped values, URLs, and unbounded strings are never sent.
- Vercel Analytics is not rendered as a parallel unreviewed stream.
- `npm run test:analytics-privacy` and the full security suite pass.

Turn analytics off immediately if a new event needs content or identity data, a vendor configuration changes, or the privacy policy falls out of sync with behavior.

## Extension

The browser extension remains outside launch scope. Keep `NEXT_PUBLIC_ENABLE_EXTENSION_SYNC=false`, keep exact extension origins empty in the public candidate, and keep Extension and Jobs absent from public navigation. Reopening it requires a separate auth, origin, privacy, store-review, and lifecycle rehearsal.
