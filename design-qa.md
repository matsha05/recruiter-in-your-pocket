# Design QA: Lifted Line

## Source and implementation

The approved visual source and local browser captures were reviewed during the
implementation pass. Those machine-local artifacts are intentionally not stored
in the repository; this file records the durable findings and states that were
verified.

## Viewport and state

- Desktop comparison: 1481 × 1054 captured pixels, signed out, initial homepage state
- Mobile: 390 × 844, signed out, initial homepage state
- Report: sample Program Manager report at `/workspace?sample=1`
- Research: initial `/research` state

## Comparison history

### Iteration 1

- Implemented the warm-white, graphite, iris, pale-sky, apricot, and butter system.
- Installed and loaded Newsreader Variable; retained Instrument Sans for interface text.
- Built the interactive before-and-after Lifted Line demonstration and cross-surface evidence grammar.

### Iteration 2

- The first implementation made the hero too tall: the headline wrapped to five lines and pushed the product and Research proof below the fold.
- Reduced headline width and scale, tightened hero and demo spacing, and rebalanced the desktop grid.

### Iteration 3

- Compared the approved source and revised implementation in one side-by-side image.
- Confirmed that the implementation preserves the source’s hierarchy, palette, typography, interactive transformation, and visible proof surfaces.
- Confirmed Research and the sample report use the same type, iris action language, evidence rules, and warm neutral field.

## Focused evidence

The full-view comparison includes the hero and first proof row, so a separate crop would not add diagnostic value. The homepage hero, Lifted Line interaction, report preview, and Research preview are all visible together.

## Interactions tested

- Original/stronger-version tabs switch content and selected state.
- Primary homepage call to action routes to the product.
- Research and shared navigation routes render.
- Sample report loads with realistic content.
- Mobile homepage has no horizontal overflow.

## Console

- Checked key homepage, Research, and report states for browser errors and warnings.

## Findings

- P0: 0
- P1: 0
- P2: 0
- Intentional difference: the implementation uses a more legible split hero at the final viewport and keeps all claims supportable; it does not add fabricated timing or social proof.

## Final result

passed
