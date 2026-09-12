# Landing instrument refinement — September 12, 2026

Local candidate at `http://127.0.0.1:3028/`. Not deployed.

## Design decision

Keep the approved photographed instrument and its physical controls. Bring its presentation into the existing Alpine product system: Instrument Sans, charcoal feedback, muted source text, and restrained petrol labels. Calibrated lacquer, metal, shadows, and engravings remain photographic materials rather than new UI colors. Keyboard focus uses warm ivory for contrast on the dark shell.

The desktop artwork occupies 86% of its column, with independent tablet and phone sizing. Home demonstrates one supported before-and-after immediately. The physical keys and dial still provide all nine detailed views; the full-size reading disclosure follows those controls without duplicating them. If the artwork fails, native controls replace it and the empty artwork space collapses.

The surrounding trust marks, colorful assessment, primary action, and report structure remain. The report introduction now completes its thought, and the gap before the founder section is tighter.

## Reliability repairs

- Mobile menu section links retain destination focus instead of jumping back to the navigation trigger.
- A blocked theme-storage write cannot take down the page.
- Fonts and optional prepared key textures cannot indefinitely block physical controls; late texture delivery preserves the selected state.
- First-report balance refreshes follow account identity, cancel obsolete requests, reject stale responses, and settle stalled requests. Server entitlement rules are unchanged.
- The displayed support email opens an email draft.

## Verification

- Optimized Next.js build, TypeScript, full lint, design-system guardrails, and diff whitespace checks passed.
- 32 focused Chromium checks passed against the optimized local build: instrument states, mobile navigation, loading failures, phone layout, homepage contracts, and first-report balance lifecycle.
- Inspected the actual browser preview and desktop/phone screenshots. Compared the hero with the sample report and workspace. All nine screen states fit their display.
- Automated WCAG A/AA checks at 320, 390, 820, 1024, and 1440px reported no violations; no horizontal overflow or page errors. These checks supplement visual inspection, not user research.
- Blocking every browser-storage write still permitted hydration and instrument interaction with no page errors in the optimized build.
- Cold local measurement: controls ready in 392ms on desktop and 2,303ms under the simulated phone profile (80ms network latency, approximately 1.1MB/s downstream, 4× CPU slowdown). CLS was zero in both runs. One measurement per profile; these are local lab results, not hosted performance claims.
- The main artwork downloads once in the optimized build. The initial development test ran during edits and observed a duplicate request; the final optimized-build regression passed.

Full live report generation was not exercised here. This local production-mode server lacks the Redis configuration used for anonymous entitlement checks; the balance regression tests used controlled responses. No production configuration or deployment was changed.
