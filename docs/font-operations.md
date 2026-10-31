# Shared Font Operations

Last updated: 2026-10-30
Owner: Design + Frontend
Scope: Highlighter typography across browser and separately rendered outputs

## Approved stack

- Headlines and interface: `Schibsted Grotesk`, normal and italic, variable weights 400-900. Headlines at 800, section titles at 700, body at 400, controls and labels at 600, data with tabular figures.
- Recruiter's voice: `Literata`, normal and italic, variable weights 200-900, for the Verdict, margin notes, and quoted resume lines.
- Local browser assets: `/fonts/schibsted-grotesk/SchibstedGrotesk-Variable.woff2`, `/fonts/schibsted-grotesk/SchibstedGrotesk-Italic-Variable.woff2`, `/fonts/literata/Literata-Variable.woff2`, and `/fonts/literata/Literata-Italic-Variable.woff2` (Latin subsets from Fontsource 5.3.0).
- Static `.woff` cuts (Schibsted Grotesk Regular, Semibold, ExtraBold; Literata Regular and Italic) live beside them for the share image and icons, whose renderer cannot read woff2.
- Both are SIL Open Font License; each folder keeps `OFL.txt`.
- Loading uses `@font-face` in `web/app/globals.css` with `font-display: swap`. No runtime font CDN dependency.
- Instrument Sans, Source Serif 4, Geist, Newsreader, and the earlier Satoshi/Georgia pairing are retired. Retained assets do not define runtime branding.

## Tokens and reading roles

- `--font-brand-sans`, `--font-display`, `--font-body`, and `--font-mono`: `"Schibsted Grotesk", "Helvetica Neue", Arial, sans-serif`
- `--font-editorial`: `"Literata", Georgia, "Times New Roman", serif`
- `--weight-display`: `800`
- `--weight-heading`: `700`
- `--weight-title`: `600`
- `--weight-body`: `400`
- `--weight-control`: `600`
- `--weight-label`: `600`

Report/app body is 16px/25px. Research prose is 18px/30px at about 66ch. Headlines are Schibsted Grotesk 800 with tight tracking; report headings are 700. The Verdict is Literata 400; margin notes are Literata italic. Nothing is set below 12px. Do not shrink working report evidence to match a marketing preview.

## Separate output pipelines

The same brand roles are the target, but browser CSS does not migrate these renderers:

- PDF: `web/lib/backend/pdf.ts` and `pdf-styles.ts`; inspect actual embedding, text selection, wrapping, tables, and page breaks.
- Open Graph: `web/app/opengraph-image.tsx`; inspect the actual raster and fallback handling.
- App and Apple icons: their ImageResponse routes; inspect small-size legibility.
- Authentication email: `web/lib/auth/otpEmail.ts`; verify supported fallback fonts and images-disabled rendering.

The September 5 local output pass rendered and inspected PDF, Open Graph, icons, and fallback-font email. See `output/competitive-visuals-20260905/output-identity/README.md` for fixtures, embedded-font checks, and limits. This does not establish delivered email-client or hosted production behavior. Future changes still require independent output checks; a browser CSS change alone is insufficient.

## Automated enforcement

`npm run qa:design-system` checks local font wiring and assets, shared family and weight tokens, canonical documentation, and absence of runtime font CDN imports. Palette, component, public-copy, accessibility, and security obligations remain active.

Launch and Research UI checks assert Schibsted Grotesk as the computed body and heading family. Family names alone do not prove the face loaded; check `document.fonts` as well.

## Verification

Run from `web/`:

```bash
npm run qa:design-system
npm run lint
npm run build
```

Inspect the approved homepage and a real long-form report at matched sizes, plus representative Research/workspace/account surfaces. Check actual face/weights, desktop/mobile wrapping, long headings/evidence, and font-driven layout shift. Verify generated outputs independently and record evidence in the migration status document.

## Change control

1. Confirm the replacement font's source and license.
2. Update local loading, tokens, canonical docs, and this runbook together.
3. Update guardrails and existing font assertions in the same change.
4. Verify browser surfaces before making a site-wide typography claim; verify every output pipeline separately.
