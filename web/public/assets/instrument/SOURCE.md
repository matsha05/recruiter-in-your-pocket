# Editorial instrument artwork

Approved generated reference from the RIYP visual exploration, promoted without pixel changes from `output/pocket-instrument-20260909/assets/clean-plate.png` on September 11, 2026.

1536 × 1024 PNG. The fixed camera calibration in `components/landing/instrument/runtime/reference-geometry.ts` depends on these exact pixels. The browser draws the labels, paper feedback, moving key caps, dial mark and power state on top of this plate.

Delivery uses `clean-plate.v1.webp`, generated losslessly from that PNG by `scripts/art/optimize-instrument-images.cjs`. Decoded RGB bytes are verified equal. The same script crops the reference's exact 56px trust-mark strip into `../alpine/trust-marks.v1.webp`, preserving every logo while avoiding a full-page download.

Versioned delivery filenames have immutable browser caching; bump the version when changing their contents. Keep the PNG as the original reference.

`key-materials.v1.webp` is a 430 × 639 lossless atlas of the exact three 4× photographic cap textures. The original runtime sampling and contour algorithm produced these assets; `scripts/art/bake-instrument-keys.cjs --check` verifies identical pixels and contours without rewriting them. The live pressed-state comparison against the original browser-generated materials changed zero pixels.
