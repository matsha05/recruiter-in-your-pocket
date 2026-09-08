# Shared Font Operations

Last updated: 2026-09-05
Owner: Design + Frontend
Scope: Approved Alpine typography across browser and separately rendered outputs

## Approved stack

- Shared sans: `Instrument Sans`, normal style, weights 400-700.
- Short verdict: `Source Serif 4`, regular weight, for selected brief assessments.
- Data: Instrument Sans with tabular figures.
- Local browser assets: `/fonts/instrument-sans/InstrumentSans-Variable.woff2` and `/fonts/source-serif-4/SourceSerif4-Variable.woff2`.
- Source Serif 4's variable file supports 200-900; the verdict role uses 400.
- Both families are self-hosted; retain their source and applicable license information.
- Loading uses `@font-face` in `web/app/globals.css` with `font-display: swap`. No runtime font CDN dependency.
- The intermediate Satoshi/Georgia pairing is retired. Retained assets do not define runtime branding.

## Tokens and reading roles

- `--font-brand-sans`: `"Instrument Sans", "Helvetica Neue", Arial, sans-serif`
- `--font-display`, `--font-body`, and `--font-mono`: `var(--font-brand-sans)`
- `--font-editorial`: `"Source Serif 4", Georgia, "Times New Roman", serif`
- `--weight-display`: `700`
- `--weight-heading`: `650`
- `--weight-title`: `600`
- `--weight-body`: `400`
- `--weight-control`: `600`
- `--weight-label`: `600`

Report/app body is 16px/25px. Research prose is 18px/30px at about 66ch. The approved bold-granite refinement uses 700 for the hero, 650 for major marketing headings, and 600 for workspace/report headings. A brief Source Serif 4 verdict is 28px/36px at 400. Do not shrink working report evidence to match a marketing preview. This refinement targets browser typography; the separately rendered outputs retain their previously verified treatment until a dedicated output pass.

## Separate output pipelines

The same brand roles are the target, but browser CSS does not migrate these renderers:

- PDF: `web/lib/backend/pdf.ts` and `pdf-styles.ts`; inspect actual embedding, text selection, wrapping, tables, and page breaks.
- Open Graph: `web/app/opengraph-image.tsx`; inspect the actual raster and fallback handling.
- App and Apple icons: their ImageResponse routes; inspect small-size legibility.
- Authentication email: `web/lib/auth/otpEmail.ts`; verify supported fallback fonts and images-disabled rendering.

The September 5 local output pass rendered and inspected PDF, Open Graph, icons, and fallback-font email. See `output/competitive-visuals-20260905/output-identity/README.md` for fixtures, embedded-font checks, and limits. This does not establish delivered email-client or hosted production behavior. Future changes still require independent output checks; a browser CSS change alone is insufficient.

## Automated enforcement

`npm run qa:design-system` checks local font wiring and assets, shared family and weight tokens, canonical documentation, and absence of runtime font CDN imports. Palette, component, public-copy, accessibility, and security obligations remain active.

Existing launch and Research UI checks assert Instrument Sans as computed body and heading family. Family names alone do not prove successful downloads; browser verification must wait for `document.fonts.ready`, inspect loaded faces/local font requests, and check fallback behavior.

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
