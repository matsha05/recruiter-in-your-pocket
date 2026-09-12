# Editorial instrument runtime

This is a fixed-camera photographic instrument with live projected controls. The approved artwork supplies the case, light, materials and camera; it is not a WebGL mesh. Pixel calibration is defined once in `reference-geometry.ts` against the 1536 × 1024 source image.

`createInstrument({ container, content, sourceImage, signal, fontFamily, onMode, onStage, onPowerChange, onReady })` returns a promise for an instance with `setState`, `setPowered`, `getSnapshot`, and `dispose`. The React owner controls the content state and owns all full-size accessible feedback. Callbacks report intent rather than maintaining a separate React state.

Pass the permanent React-rendered photograph as `sourceImage`. Leave that image visible at readiness; the runtime reuses its decoded pixels and adds only the live control layer. This prevents a second image request or a visual swap. Standalone callers may omit it to let the runtime own its photograph.

Pass a resolved font family with a fallback, not an unresolved CSS custom property, because canvas labels need the actual family name. Font downloads do not block creation: the keys and dial render immediately with the available face, then redraw once `document.fonts.ready` settles without resetting their state. A failed font download leaves the controls usable. The stylesheet also receives this family through `--ri-font-family`.

Always pass an AbortSignal and abort during effect cleanup. Aborting an in-flight image load rejects with `AbortError` without attaching the artwork or controls. Aborting after creation disposes the instance. Instance disposal is idempotent and cancels animation, observers, input listeners and shared styles. A wrapper should still discard and dispose a stale resolved instance if its effect was cancelled.

All injected styles are scoped to `.ri-art` and shared through reference counting. Multiple instances and React StrictMode mount/unmount cycles are supported. No global application state or testing API is installed.

The keys use a photograph-derived contour, move by five source pixels while held, and latch at three. The dial preserves stationary lighting while its engraved index and machining move between three detents. The brass side switch retains the selected state when power is restored. Reduced-motion preferences preserve these visible state changes while removing their travel animation.

The exact 4× cap textures and traced contours are precomputed in `key-materials.v1.webp` and `key-materials.json`. They load alongside the photograph, cutting repeated key construction from roughly 75–97 ms to 0.8–2 ms in the isolated local benchmark. A settled pressed-state screenshot comparison against the original algorithm changed zero pixels. Once the photograph is ready, the optional atlas has a 300 ms deadline before the original material tracing takes over; missing assets and custom geometry use that same fallback. A late atlas only warms the cache for future instances and never replaces the current controls or resets their state.

Regenerate with `node scripts/art/bake-instrument-keys.cjs` from the repository root, or add `--check` to verify exact pixels and contours without writing. The script runs the runtime's original tracing in an isolated browser and writes a lossless atlas; it does not contact an external service. Bump the versioned filename if the artwork or calibrated geometry changes, then repeat the visual comparison. The controls animate only during interaction and keep no idle render loop.
