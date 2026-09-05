# RIYP Solo Launch Rehearsal

**Last updated:** August 10, 2026
**Tester:** Matt Shaw
**Status:** Reusable runbook with historical production records

Run this against a production-like preview in a clean browser profile. Use Stripe test mode. Capture one screenshot or short note for every section, including failures and confusing moments.

## Before You Start

- Record the release identifier and preview URL.
- Confirm the extension, analytics, error replay, guest save, public share, and paid eval flags are off.
- Confirm the complete ordered migration set has replayed cleanly and the active Supabase project matches the repository manifest.
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

- Disable new purchases with `RIYP_DISABLE_NEW_PURCHASES` and confirm Checkout fails safely while receipts, restore, portal, and refund handling remain available.
- Disable generation with `RIYP_DISABLE_GENERATION` and confirm provider calls stop before access is consumed.
- Confirm private extension routes are unavailable while the extension flag is off.
- Confirm `/api/health`, `/api/ready`, and `/api/status` return honest results.
- Repoint a disposable preview alias to the prior known-good preview and back; do not touch production aliases or domains.
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
- Remaining limitations, with any unresolved customer-journey defects blocking release
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

## July 28 Luna Promotion Record

Historical record. The current September 4 Terra candidate and its evidence are described in `docs/promptops/shipping-gate.md`.

- User authorization: production promotion explicitly authorized in the active launch task.
- Launch model: `gpt-5.6-luna`, low reasoning, 24K completion ceiling.
- Live quality proof: `eval_1785271781375`, 23 golden fixtures, 22 PASS, 1 WARN, 0 FAIL, 95.7% pass rate, $0.287278 token-calculated cost.
- Candidate binding: resume prompt SHA-256 `dcfecbf6ad919950f69d6a12d8e0db3a46d3268a836c22771cbd5b425312a950`; resume-ideas prompt SHA-256 `6d90925e63aae15476712f92af5ffbdf4e684feec413711e14d6dba7201b6fc7`.
- Production deployment: authorized with this main-branch release; target alias `https://www.recruiterinyourpocket.com`.

Current verdict: `NO-GO` for broad promotion. The code and visual product were release-candidate ready at the time of this record; the remaining blockers were the real signed-in, billing, destructive-data, remote-CI, and final-authorization rehearsals above. Production billing was later enabled, so its current state must be verified directly rather than inferred from this historical record.

## July 29 Feedback-Hardening Record

- Candidate: local `codex/launch-hardening` worktree; bind the final commit and preview deployment after the complete gate passes.
- Homepage: concrete first-read explanation, free/sample actions, founder identity and profile, explicit AI role, employer non-endorsement, and compensation-calculator entry point are implemented.
- Sample report: unsupported metrics were replaced with candidate-supplied placeholders. The sample is server-seeded so the upload state cannot flash first, and placeholder rewrites cannot be copied until verified facts replace every bracket.
- Mobile: pricing actions are above the fold with an honest disabled state when billing is closed; the sample report navigation wraps into two rows.
- Score: the product now says `Clarity summary` and explicitly states that it is not a prediction of interviews or offers.
- Cost control: every production report-generation chat attempt has a non-overridable 8,000 completion-token ceiling, and provider retries are clamped to at most one.
- Deletion: RIYP's cached `billing_receipts` are explicitly removed before the final auth-user deletion. Stripe remains the authoritative retained financial record.
- SEO: the homepage has a canonical URL and current structured data, the sitemap excludes the noindex workspace and includes the compensation calculator, synthetic `lastModified` values were removed, stale research aliases are permanent redirects, and public example rewrites no longer invent metrics.
- Support rehearsal: a uniquely tagged message was sent to `support@recruiterinyourpocket.com`, but no inbound copy arrived. Authoritative DNS has no root-domain MX record, so the support address is not currently capable of receiving mail.
- Live status: `/api/status` correctly remains `limited` and identifies operational safeguards as incomplete.

### Remaining blockers

- Choose the support destination, configure inbound MX and forwarding, then complete outside-send → receive → reply → receive-reply and secondary-alert rehearsals.
- Run the full billing lifecycle only in an isolated Stripe test-mode + disposable Supabase/Redis preview. The local Stripe key is live-mode and must not be used for this rehearsal.
- Rehearse a real free report and destructive account lifecycle against that same disposable preview.
- Deploy the exact candidate, submit the homepage and status page in Search Console, request recrawls or removals as needed, and verify the exact-domain result after Google reindexes it.
- Pass remote CI on the exact commit and bind the resulting preview/deployment evidence before any broad promotion.

Current verdict: `NO-GO` for broad promotion until the remaining blockers above are proven on the release-bound preview.

## July 30 Launch-Hardening Operational Record

- Production release: `79a00fe33c194b0f28e751f8adf62bbda89b6800`; production deployment `dpl_99jC2dsnBogaFGPPMg88RUBgr5xn` was `READY`, and the local launch-hardening candidate had the same Git tree.
- CI: the exact production release passed the launch program, extension, and web workflows.
- Support: the public support address completed a real external receive, forward, authenticated operator reply, and external reply-receipt rehearsal. The forwarding destination is `mattrshaw2011@gmail.com`.
- Search Console: `https://www.recruiterinyourpocket.com/sitemap.xml` was accepted with status `Success` and 30 discovered pages. Live URL tests passed for the homepage, pricing, and sample report, and each was submitted to Google's priority crawl queue. Visible search-result replacement remains controlled by Google's asynchronous recrawl.
- Live Stripe preflight: the live account, one-time $29 product and price, canonical webhook endpoint, subscribed fulfillment events, payouts, and Stripe Tax configuration passed. No live charge was created for this rehearsal.
- Test purchase: a fresh Stripe test-mode product and one-time $29 price completed hosted Checkout with automatic tax, produced one paid invoice, and unlocked exactly one `30d` pass with five reports and a 30-day expiry.
- Idempotency: the real `checkout.session.completed` event was replayed three times. Every replay returned HTTP 200; the event remained `completed` with one processing attempt and the database retained exactly one pass.
- Buyer recovery: passwordless app authentication succeeded. The receipt API returned one paid $29 invoice with hosted receipt and PDF links, the Stripe customer portal loaded, and deleting only the disposable pass followed by `POST /api/billing/restore` returned `restored: 1`, `active_before: 0`, and `active_after: 1`.
- Refund safety: a full $29 test refund succeeded. The webhook created a `refund` entitlement block, set the pass to zero uses with a refund revocation, confirmation returned HTTP 409 with `status: reversed`, and restore returned zero active passes.
- No resurrection: a newly signed replay of the original completed checkout was recorded as `rejected` with `entitlement_blocked:refund`; no active pass reappeared.
- Containment: with `RIYP_DISABLE_NEW_PURCHASES=true`, Checkout returned HTTP 503 while receipts, restore, and the Stripe customer portal stayed available.
- Deletion and cleanup: the authenticated product deletion route removed the disposable auth identity, pass, and cached receipt, returned `Clear-Site-Data`, and left only the identity-free account-deletion tombstone. The Stripe test customer was deleted and the temporary test price and product were deactivated.
- Environment audit: `launch-env-report.cjs` now records both the narrow purchase kill switch and the secondary-alert evidence flag instead of omitting them.

### Operational alert completion

- Primary alert: Sentry workflow `Email new production errors and fatals` delivered the production rehearsal alert for event `3883c3a8-3c03-4760-9267-672aac0f665d` (`JAVASCRIPT-NEXTJS-11`) to `mattrshaw2011@gmail.com` at 15:55:46 UTC on July 30, 2026.
- Primary test: Sentry's direct test action reported `Notification fired!`; Gmail received `JAVASCRIPT-NEXTJS-12 - Test Issue` at 15:59:22 UTC.
- Independent backup: successful GitHub Actions run `30559387132` created [GitHub issue #5](https://github.com/matsha05/recruiter-in-your-pocket/issues/5) at 15:59:58 UTC from the same unresolved production issue.
- Backup idempotency: rerunning the backup against `JAVASCRIPT-NEXTJS-10` found the existing issue and created no duplicate.
- Scope and privacy: the backup uses a read-only Sentry token and writes only scrubbed production issue metadata to this public repository. Request data, user data, payloads, and stack traces are excluded.
- Production evidence: `RIYP_SECONDARY_ALERT_VERIFIED=true` was configured in Vercel Production after both receipts were confirmed.

Current verdict: `GO` for broad promotion once the release containing the GitHub backup workflow and this evidence record is deployed and `/api/status` reports `ok: true`, `summary.status: configured`, no incidents, and Operational safeguards configured. Google search-result replacement remains asynchronous after the accepted sitemap and priority recrawl requests; it is not a runtime launch blocker.

## August 8–10 Validator and Production Record

- Candidate: `ece17d1804a7099c7567a8fdb5c48ed9fbbc2718`.
- Quality proof: `eval_1786231390293_replay`, Luna low reasoning, 23 fixtures, 22 PASS, 1 WARN, 0 FAIL, saved-output replay through the repaired candidate validator.
- Source-run cost: $0.576062 across 45 API calls; no second generation spend was required for replay.
- Production deployment: `dpl_CLTHPxQ3YsbmFkr8jHHxnyqoacBH`, Ready, with the full candidate SHA bound as the Sentry release.
- Exact-commit CI, Vercel checks, canonical homepage, pricing, sample report, auth, robots, and `/api/status` passed after deployment.
- Formal Gauntlet: ended by Matt on August 10 and retired without a pass, seal, or quality claim.

Current verdict: `GO` for the controlled beta. Remaining follow-ups are branch-rule enforcement, external uptime monitoring, and observing a real production customer-created populated report history.
