# RIYP Vendor and Privacy Review

**Last Updated:** July 11, 2026
**Status:** Required for launch

This is the launch-facing vendor truth table. If a processor is used in production, it must appear here and match the public privacy/security copy.

| Vendor | Role | Data Classes | Launch Decision | Notes |
|:-------|:-----|:-------------|:----------------|:------|
| OpenAI | Resume analysis and AI generation | Resume text, job descriptions, prompts, model outputs | Approved with caution | Do not persist raw anonymous inputs beyond request handling. Keep model-training claims aligned with actual vendor settings. |
| Supabase | Auth and primary data storage | Account identity, reports, saved jobs, billing linkage metadata | Approved | Account export and deletion must remain launch-gated and tested. |
| Stripe | Billing and entitlements | Customer IDs, invoices, receipt metadata, Stripe-managed payment records | Approved | Webhook verification is mandatory. |
| Sentry | Error monitoring | Scrubbed error metadata, route context, sanitized breadcrumbs | Approved with strict scrubbing | Default PII disabled. Browser replay remains off unless explicitly approved. |
| Mixpanel | Product analytics | Session-level event and funnel metadata | Approved behind kill switch | Must respect launch flag and Do Not Track handling. |
| Vercel | Hosting and runtime | Platform diagnostics and deployment metadata | Approved | Platform logs must continue to avoid raw resume or JD payloads. |
| Upstash | Shared rate limiting, request idempotency, and short-lived checkout caching | Hashed request and IP identifiers, idempotency keys, short-lived checkout session metadata | Approved with short retention | Keep keys pseudonymous, enforce short TTLs, and never cache raw resume or JD text. |
| Inngest | Background account exports and optional asynchronous PDF generation | Job identifiers, account identity, account-export payloads, and report content when asynchronous PDF generation is used | Approved with payload review | Keep event and run-history retention explicit. Prefer internal identifiers over full payloads whenever possible. |

## Launch Review Questions

Every launch should answer these explicitly:

1. Does the public privacy/security copy match the actual data flow?
2. Can any vendor receive raw resume or JD text unintentionally?
3. Can the vendor be disabled quickly if trust posture changes?
4. Are deletion and export behaviors still accurate for every stored data type?

## Required Follow-Through

- Re-run this review when a new vendor is added.
- Re-run this review before enabling browser replay or any new analytics sink.
- Treat any mismatch between this file and public copy as a launch blocker.
