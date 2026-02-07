# Font Operations V1.0

Last updated: 2026-02-07
Owner: Design + Frontend
Scope: Runtime typography integrity for Sentient/Satoshi stack

## 1. Operational Hardening Checklist

1. **Self-hosting complete**
   - All production font binaries are local WOFF2 files under:
     - `/Users/matsha05/Desktop/dev/recruiter-in-your-pocket/web/public/fonts/sentient`
     - `/Users/matsha05/Desktop/dev/recruiter-in-your-pocket/web/public/fonts/satoshi`
   - No runtime dependency on Google Fonts or Fontshare CSS.

2. **Provenance + license tracking complete**
   - Manifest file with source metadata and SHA-256 checksums:
     - `/Users/matsha05/Desktop/dev/recruiter-in-your-pocket/web/public/fonts/manifest.json`
   - Source registry (Fontshare API records):
     - Satoshi: `id=20e9fcdc-1e41-4559-a43d-1ede0adc8896`, `license_type=itf_ffl`
     - Sentient: `id=297238ab-7a3e-44e0-af29-056f778c2728`, `license_type=itf_ffl`

3. **Automated enforcement complete**
   - `npm run qa:design-system` validates:
     - required local font files exist
     - `app/layout.tsx` uses `next/font/local` for Sentient/Satoshi
     - no external font imports in production scope
     - manifest checksum integrity

## 2. Runtime Wiring

Canonical runtime entrypoint:
- `/Users/matsha05/Desktop/dev/recruiter-in-your-pocket/web/app/layout.tsx`

Required variables:
- `--font-sentient`
- `--font-satoshi`

Token mapping:
- `--font-display: var(--font-sentient), ui-serif, Georgia, serif`
- `--font-body: var(--font-satoshi), ui-sans-serif, system-ui`
- `--font-mono: var(--font-satoshi), ui-monospace, SFMono-Regular, Menlo, monospace`

## 3. Verification Commands

Run from `/Users/matsha05/Desktop/dev/recruiter-in-your-pocket/web`:

```bash
npm run qa:design-system
npm run lint
npm run build
```

Runtime sanity (optional):
- Check landing response headers include local preloaded font assets:
  - `/_next/static/media/satoshi_*.woff2`
  - `/_next/static/media/sentient_*.woff2`

## 4. Change Control

If any font file is replaced:
1. Update the file in `public/fonts/...`.
2. Recompute SHA-256 and update `public/fonts/manifest.json`.
3. Re-run `npm run qa:design-system`.
4. Update `docs/design-system.md` and this file in the same PR.

No merge if checksum manifest and binaries drift.
