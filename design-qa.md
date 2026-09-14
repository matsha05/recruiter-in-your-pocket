# Alpine web identity QA

2026-09-05. Local implementation; no commit, push, or deployment. This is a visual and interaction validation record, not a production-release or live-account audit.

## Approved reference and decision

The exact user-selected source is `web/public/assets/alpine/alpine-selected-reference.png` (1536 × 1024), copied from the supplied image. The hero preserves its real granite, alpine forest, water, handwriting, ground, original copy, and all six company marks including Apple. The complete image is visible immediately. There is no slider or required interaction.

After the completed 6 Pro consultation in Visual Improvement Ideas, Matt approved its recommendations. **Instrument Sans + Source Serif 4** now supersedes the earlier Satoshi/Georgia experiment. The original raster typeface remains unidentified; this is the adopted practical pairing, not a claim to have recovered the source font metadata.

At 1536px the live hero uses an approximately 86px/78px regular heading, 23px/32px deck, and dark pill action. The exact three-line headline, image position, logo row, and report introduction were compared with the reference. The same font families, warm palette, and action hierarchy continue through the web product.

## Shared implementation

- Canvas `#f6f3ef`, sheet `#fbfaf8`, inset `#f0efeb`, ink `#12191b`, muted text `#5f6667`, aqua `#00738f`, aqua surface `#e6f3f2`.
- Semantic HSL channels and linked aliases preserve existing utility compatibility. Citron remains a compatibility token, not the primary action color.
- Marketing, workspace, report, editorial, labels, and controls use shared typography recipes; `cn` recognizes their font-size groups and preserves them beside color classes.
- Warm shared navigation and stacked wordmark; 48px app primary actions, 10px fields, 12px insets, 16/24px sheet corners, visible focus and distinct state surfaces.
- The actual report and sample use the same renderer. Existing report facts, priorities, strengths, diagnosis, editing, saving, and access behavior were preserved.
- Canonical brand/design/font/research documentation and SystemLab now describe and demonstrate this system.

## Browser evidence

Artifacts live in `output/alpine-product-system-20260905/`.

| Family | Inspected views | Evidence |
| --- | --- | --- |
| Landing | 1536 desktop and 390 mobile | `landing-after.png`, `landing-mobile-after.png` |
| Upload | 1536 desktop and 390 mobile | `workspace-after.png`, `workspace-mobile-after.png` |
| Actual sample report | 1536 desktop and 390 mobile | `sample-report-after.png`, `sample-report-mobile-after.png` |
| Pricing | Desktop | `pricing-after.png` |
| Authentication | Mobile, focused email state | `auth-mobile-after.png` |
| Research hub/article | 1440 and 390 | `research-*-after.png` |
| Resources | 1440 and 390 | `resources-*-after.png` |
| Account shell | Signed-out 1440 and 390 | `settings-account-*-after.png` |

Source/data audits account for 17 research articles, one hub, 11 redirects, 20 shared figures, supporting marketing/legal pages, guide/calculator surfaces, auth/settings, jobs, and report history. This shared-family coverage is not a screenshot of every authenticated state.

## Integration findings

- Fixed the shared class merger treating custom type sizes as text colors and silently discarding them. Regression checks cover real heading/color combinations and deliberate size overrides.
- Fixed opaque aqua selection surfaces where translucent overlays reduced small-text contrast below 4.5:1.
- Preserved flush dialog consumers by avoiding a responsive padding default that defeated their `p-0` override.
- Added appropriate fixed-header clearance to resources, guides, and calculator breadcrumbs.
- Fixed 320px report navigation spacing so the finding, source, and missing-detail field fit the reading area; type stays 24/30 for report headings and 16/25 for evidence.

## Motion

The Three.js water layer animates only source-traced water regions. Stone, forest, framing, typography, and shadows remain fixed. The upper waterfall flows continuously down/right; the pool has bounded ripples; display-scale compensation keeps the effect perceptible in the narrow app preview. Pause/resume, a still fallback, reduced-motion default, explicit opt-in, offscreen suspension, and graphics-context recovery are retained.

Earlier motion evidence is in `output/alpine-product-system-20260905/motion/`. It measured the visible upper cascade at 519 × 784 and separately verified fixed adjacent rock pixels. A flat-image shader remains a 2D approximation, not a rotatable 3D stone.

## Outputs

`output/competitive-visuals-20260905/output-identity/README.md` contains the detailed output record.

- Real PDF sample: 3 A4 pages; long-text fixture: 4 pages. Every page was rendered and inspected, including a grayscale sample. Both font families are embedded; text is selectable; 23 report fields were checked against extracted text.
- Sign-in email inspected at 600px and 375px with dependable fallback fonts. Existing subject, code, HTML/text wording, and delivery flow remain intact. Nothing was sent.
- Open Graph 1200 × 630, Apple icon, and 32/192/512 icons were rendered and inspected. The static Open Graph fallback matches.
- PDF/export/access/save contracts, auth-email contracts, research-figure contracts, compensation calculations, and report content/fidelity tests passed.

## Validation status

- TypeScript and scoped ESLint pass.
- Semantic typography regression check passes.
- Design guardrails pass within the unchanged debt budget: 380 arbitrary utility occurrences against 615; no external font imports, retired font references, hardcoded hex violations, or banned copy terms.
- Production build passes: compilation, TypeScript, all 88 generated pages, tracing, and postbuild checks. See `output/alpine-product-system-20260905/build.log`.
- 49 browser checks pass against the production build: 42 homepage/report/accessibility/motion checks and seven research checks covering every canonical article at mobile/tablet/desktop, redirects, accessibility, and browser errors. See `production-browser-tests.log` and `research-browser-tests.log` in the evidence directory.
- The final production run includes the corrected 320px report reading area, two contrast findings, focused/error input assertions, and the production-only internal-route check. Earlier development-only failures are resolved in this run.
- Three jobs pagination/recovery fixture checks, five sign-in retry fixtures, and four homepage copy/SEO checks also pass.
- Final `git diff --check` passes. These are local visual, interaction, and contract checks; the release limitations below remain explicit.

The review preview at `http://127.0.0.1:3028/` is serving this verified production build with `next start`. Subsequent source edits require a rebuild or switching the preview back to the development server.

## Explicit limits

No production deployment, live account mutation, payment, real resume generation, or email delivery was performed. Authenticated account/billing/support states were reviewed in source; the screenshots above show public or signed-out states. Actual 200% desktop zoom and delivered email-client rendering are not claimed.

The separate browser extension and its generated marketing mockups retain their previous visual system. Those images are independently drawn illustrations rather than exact captures of the extension; recoloring them alone would misrepresent the implemented UI. The extension is an explicit follow-up, with details in the output evidence.

Dark-mode compatibility tokens were kept coherent, but the current app provider forces light mode. This pass does not claim an enabled, verified dark theme.
