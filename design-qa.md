# Lifted Line 2.0 - Final Design QA

Date: 2026-07-20

Result: **PASS**

## Scope

- Approved seven-state reference set: landing desktop, landing mobile, workspace default, workspace error, workspace analysis, report, and pricing
- Research hub at 390, 1024, and 1440 pixels
- Every canonical Research article at 390, 1024, and 1440 pixels
- Every Research figure and diagram through the shared figure primitives and route-level visual audit
- Connected public shells: Resources, guides, auth, trust, legal, header, footer, and primary CTA treatment

## Reference match

- Space Grotesk Variable carries display, verdict, price, and action hierarchy.
- Instrument Sans Variable carries navigation, body, controls, labels, and technical metadata.
- The public system is consistently ink, chalk, citron, deep cyan, bright-cyan rules, and pale-cyan teaching surfaces.
- Headers, wordmark, controls, borders, radii, action treatment, and footer now follow the approved reference images across public surfaces.
- Research no longer relies on the retired serif, iris, teal-first, legacy palette utilities, or scoped compatibility mappings.
- Research figures use one shared report-like grammar: claim, readable encoding, caption, source context, and takeaway or limit.

## Issues found and resolved

- Removed a findings-tab effect that scrolled the Research hub past its opening on first load.
- Replaced the last Research diagram legacy-palette utilities with semantic Lifted Line tokens.
- Corrected a low-contrast secondary page number in the resume-length figure.
- Replaced cyan-filled Research CTAs with the approved ink action and citron directional cue.
- Tightened Research display weights so the hub and article hierarchy match the reference character.
- Updated the Research UI and article contracts so documentation no longer describes the retired serif-and-iris system.

## Severity review

- P0: none
- P1: none
- P2: none

## Verification

- `npm run qa:design-system` - passed
- `npm run lint` - passed
- `npm run build` - passed; 87 routes generated
- Playwright public launch, baseline accessibility, and Research system suite - 27 passed
- Destructive and recovery journey suite - 11 passed
- Research browser-error audit across the hub and every canonical article - passed
- Research-specific responsive contract - hub and every canonical article passed at 390, 1024, and 1440 pixels
- Research-specific accessibility - hub and every canonical article passed with no serious or critical Axe violations
- Legacy Research redirects - all canonical destinations passed
- `npm run test:pdf-export` - passed
- `npm run test:billing-pricing` - passed

## Visual evidence

- Reference-to-Research comparison: `output/design-qa/2026-07-20-research-system/approved-compare-reference-to-research.png`
- Reference-to-article comparison: `output/design-qa/2026-07-20-research-system/approved-compare-reference-to-article.png`
- Research figure system contact sheet: `output/design-qa/2026-07-20-research-system/figure-system-contact-sheet.png`
- Core seven-state comparisons: `output/design-qa/2026-07-20-final/approved-compare-*.png`

## Non-blocking maintenance note

- The build reports that `caniuse-lite` is seven months old. It does not affect this visual or functional result, but the browser database should be refreshed in a dependency-maintenance change.
