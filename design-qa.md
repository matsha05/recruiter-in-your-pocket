# Lifted Line 2.0 - Final Reference Parity QA

Date closed: 2026-07-21

## Verdict

The redesign passes visual QA on the deployed preview. The design system, approved seven-frame reference set, major product journey, minor routes, responsive variants, and customer-facing failure states now read as one product.

This is a design and implementation approval. Production launch still requires the separate operational rehearsals listed in the launch gate, especially live auth, Stripe, account deletion/export, and the final production environment switch.

## Approved source of truth

The implementation was checked against:

1. `output/design-approval/2026-07-20-pass-2/01-landing-desktop.png`
2. `output/design-approval/2026-07-20-pass-2/02-landing-mobile.png`
3. `output/design-approval/2026-07-20-pass-2/03-workspace-default.png`
4. `output/design-approval/2026-07-20-pass-2/04-workspace-error.png`
5. `output/design-approval/2026-07-20-pass-2/05-workspace-analysis.png`
6. `output/design-approval/2026-07-20-pass-2/06-report.png`
7. `output/design-approval/2026-07-20-pass-2/07-pricing.png`

The approved written rules in `output/design-approval/2026-07-20-pass-2/approval-notes.md` govern any small rendering differences in the generated frames, including the 72px marketing header and 64px product header.

## Closed findings

### Marker gesture

- Replaced the rectangular CSS approximation with source-derived bold and shallow citron marker assets.
- Kept one marker gesture per screen and the shallow treatment on product/report surfaces.

### Reference composition

- Matched the landing composition, display scale, whitespace, report-card proportions, color roles, typography, and CTA hierarchy.
- Compared the approved landing and deployed preview together at 1505x1045.
- Final evidence: `output/design-qa/2026-07-21-reference-parity/final-preview-landing-comparison.png`.

### Major product surfaces

- Verified landing, workspace default, upload/error handling, analysis, sample report, pricing, research hub, research article, research diagram, resources, calculator, auth, dashboard, support, status, security, privacy, terms, purchase restore, purchase confirmation, and 404.
- Verified the deployed sample report at `/workspace?sample=1` on desktop and phone.

### Minor surfaces and route behavior

- Verified FAQ, trust, methodology, all settings tabs, reports sign-in routing, legacy guide redirects, both negotiation guides, calculator redirect, sign-in redirect, and disabled extension/jobs routes.
- Disabled extension and jobs routes return the branded 404 state with correct no-index Page Not Found metadata.
- Auth, dashboard, settings, restore, confirmation, empty, loading, error, disabled, and signed-out states use the same hierarchy and visual grammar.

### Responsive and constrained layouts

- Verified 1505x1045 desktop, 1146x600 constrained desktop, 853px tablet, 390x844 phone, and a 768x523 200-percent-equivalent viewport.
- No checked route has horizontal document overflow.
- The phone support email overflow found during preview QA was fixed and rechecked.
- No checked route has a broken image.

### Browser and build quality

- Final Vercel preview status: Ready.
- Clean Chrome sweep across the critical and minor routes produced zero console errors.
- Final preview build compiled, type-checked, generated all 88 static pages, and deployed successfully.
- Lint and `git diff --check` pass after the final responsive and metadata fixes.

## Evidence index

- Final preview: `https://rip-nextjs-frontend-j3wanh195-matts-projects-59b2b24d.vercel.app`
- Landing side-by-side: `output/design-qa/2026-07-21-reference-parity/final-preview-landing-comparison.png`
- Desktop surface sheet: `output/design-qa/2026-07-21-reference-parity/preview-all-surfaces-contact-sheet.png`
- Phone surface sheet: `output/design-qa/2026-07-21-reference-parity/preview-phone-contact-sheet.png`
- Local reference-parity captures: `output/design-qa/2026-07-21-reference-parity/`

Final result: **PASSED**
