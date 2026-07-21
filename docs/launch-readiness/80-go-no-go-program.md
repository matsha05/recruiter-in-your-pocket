# RIYP Controlled Paid Beta Launch Program

**Last updated:** July 20, 2026
**Status:** Active source of truth
**Owner and sole product tester:** Matt Shaw

This program supersedes older launch plans that required the Chrome extension, recurring or lifetime pricing, a fixed date, or paid model evaluations before the product was otherwise ready.

## Launch Decision

RIYP will launch first as a controlled, web-only paid beta.

The promise is simple: upload or paste a resume, optionally add a job, and get the first-read brief a strong recruiter would want you to see.

### In scope

- Resume upload and paste
- Optional job context
- Recruiter brief and sample report
- First report included
- One non-renewing $29 Job Search Pass with five additional reports over 30 days
- Authentication and report history
- PDF export
- Billing restore and customer portal
- Account export and deletion
- Privacy, security, methodology, support, and configuration status pages

### Held back

- Chrome extension and saved-jobs navigation
- Lifetime plan
- Public report sharing
- Guest report persistence
- Error replay
- Broad launch campaigns, Product Hunt, or paid acquisition
- Additional live model evals beyond the approved July 19 quality run

The held-back surfaces must remain disabled, absent from navigation and search discovery, and safe if reached directly.

## Product Standard

The launch experience should feel like a distinctive recruiter product, not a consultancy, content publication, or generic AI dashboard. The Lifted Line system should bring character through its dark shell, paper-like work surfaces, recruiter markup, and precise lime/cyan signal colors without obscuring the product's next action.

Every launch-critical screen must meet these standards:

1. The next action is obvious within five seconds.
2. The product explains data handling where trust is needed, without repeating itself.
3. Empty, loading, success, error, paywall, and recovery states are complete.
4. Mobile is designed as a primary experience, not a compressed desktop layout.
5. Marketing claims match the actual runtime and billing behavior.
6. Private or unfinished surfaces do not compete for attention.
7. Motion communicates state and never hides content.
8. Keyboard navigation, focus treatment, contrast, and reduced-motion behavior pass automated and manual review.

## Release Gates

### Gate 1: Zero-spend release candidate

No external model calls are allowed.

- Lint, typecheck, build, security tests, contract tests, and browser smoke tests pass.
- Eval dry-run is labeled as fixture validation and never represented as model-quality evidence.
- Live eval commands refuse to run without `RIYP_ALLOW_PAID_EVALS=true`.
- Production flags fail closed.
- Shared hosted rate limiting is configured.
- Stripe webhook handling is idempotent and covered by replay tests.
- No resume text, job description, email address, LinkedIn URL, or raw report is written to application logs.
- Production security headers are present.

### Gate 2: Preview rehearsal

Run the checklist in `95-launch-rehearsal.md` against a production-like preview.

- The ordered database migration set is verified through migration 016 and applied to the preview database.
- Job Search Pass checkout uses Stripe test mode.
- Webhook delivery, retry, restore, portal, and entitlement behavior work.
- Anonymous and signed-in storage behavior matches public copy.
- Account export and deletion work on the same test account.
- Desktop and mobile visual review has no launch-blocking defects.

### Gate 3: Final live quality proof

Matt authorized the stored-fixture quality work on July 19. After prompt and model hardening, the final pinned `gpt-5-nano-2025-08-07` run completed with 8 PASS, 0 WARN, and 0 FAIL at a token-calculated API cost of $0.009. This gate is satisfied for the current prompt and model pair; any prompt or launch-model change reopens it.

- Set `RIYP_ALLOW_PAID_EVALS=true` only for an explicitly approved run.
- Run the smoke and golden eval suites against the launch model and prompt.
- Manually inspect at least one thin resume, one strong resume, and one job-targeted resume.
- Reject the launch if results are generic, unsupported, unstable, or materially worse than the sample report.
- Disable paid eval authorization immediately after evidence is captured.

### Gate 4: Controlled beta release

- All earlier gates pass.
- `/api/ready` reports no launch blockers in the hosted environment.
- The public site and deployed application come from the same reviewed release candidate.
- Rollback controls have been tested.
- Matt records a final `GO` decision with the tested release identifier.

## Commercial Plan

Start with a small founder-led cohort rather than a public splash.

- Invite 10 to 25 people who are actively applying or revising a resume.
- Make the first complete report included and keep one $29 Job Search Pass: five additional reports, one payment, 30-day expiration.
- Describe the product as a recruiter first-read brief, not an AI resume grader.
- Personally follow up after the first report with three questions: what felt immediately useful, what felt untrustworthy, and what almost stopped you.
- Track activation, report completion, paywall reach, purchase, return use, and support demand. Keep analytics off until the privacy implementation is deliberately approved.
- Expand only after the first cohort can complete the core journey without live help and the product produces consistently useful reports.

## Go/No-Go Rule

The beta is `GO` only when:

1. The zero-spend release gate passes.
2. The complete preview rehearsal passes.
3. The explicitly authorized live quality proof passes.
4. The hosted readiness endpoint reports no blockers.
5. No public claim describes a disabled or unverified capability as live.

Any missing item is a `NO-GO`, not a judgment call.

## Rollback Controls

| Surface | Safe state |
|:--|:--|
| Billing unlock | `NEXT_PUBLIC_ENABLE_BILLING_UNLOCK=false` |
| Extension sync | `NEXT_PUBLIC_ENABLE_EXTENSION_SYNC=false` |
| Analytics | `NEXT_PUBLIC_ENABLE_ANALYTICS=false` |
| Error replay | `NEXT_PUBLIC_ENABLE_ERROR_REPLAY=false` |
| Guest save | `NEXT_PUBLIC_ENABLE_GUEST_REPORT_SAVE=false` |
| Public share | `NEXT_PUBLIC_ENABLE_PUBLIC_SHARE_LINKS=false` |
| Paid evals | `RIYP_ALLOW_PAID_EVALS=false` |

## Operating Commands

Run from the repository root:

```bash
npm run launch:env-report
npm run launch:gate
npm run launch:rehearsal
```

`npm run launch:gate:strict` remains the final live-quality gate. It must fail while paid evaluations are not explicitly authorized. That failure is an intentional spend control, not a release-candidate defect.

## Current Blockers

- Add migrations 015 and 016 to the ordered runner, prove a clean replay, and confirm the preview database is current through migration 016.
- Reconcile and rehearse a fresh preview deployment from the exact release candidate.
- Configure and validate the canonical Stripe product id in hosted environments.
- Keep production billing disabled until the final preview rehearsal passes.
