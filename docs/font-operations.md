# Lifted Line Font Operations

Last updated: 2026-07-11
Owner: Design + Frontend
Scope: Runtime typography integrity for Lifted Line

## Runtime stack

- Display and expressive evidence: `Newsreader Variable` normal and true italic
- Interface and body: `Instrument Sans Variable`
- Data: system monospace only when tabular scanning benefits
- Source: self-hosted Fontsource packages bundled by the application
- License: SIL Open Font License 1.1
- No runtime dependency on Google Fonts, Fontshare, or another font CDN

Canonical entrypoint:
- `/Users/matsha05/Desktop/dev/recruiter-in-your-pocket/web/app/layout.tsx`

Required packages:
- `@fontsource-variable/instrument-sans`
- `@fontsource-variable/newsreader`

Token mapping:
- `--font-display: "Newsreader Variable", Georgia, ui-serif, serif`
- `--font-body: "Instrument Sans Variable", ui-sans-serif, system-ui, sans-serif`
- `--font-mono: ui-monospace, SFMono-Regular, Menlo, monospace`

Required imports:
- `@fontsource-variable/instrument-sans/standard.css`
- `@fontsource-variable/newsreader`
- `@fontsource-variable/newsreader/standard-italic.css`

## Automated enforcement

`npm run qa:design-system` verifies:

- both Fontsource packages are declared as dependencies
- `app/layout.tsx` imports Instrument Sans, Newsreader normal, and Newsreader italic
- production code does not load fonts from a third-party runtime URL
- the design-system source of truth names the active families and tokens

## Verification

Run from `/Users/matsha05/Desktop/dev/recruiter-in-your-pocket/web`:

```bash
npm run qa:design-system
npm run lint
npm run build
```

In a production build, verify that both families are emitted as local `/_next/static/` assets and that the first viewport has no font-driven layout shift.

## Change control

When changing the family:

1. Confirm the package source and license.
2. Update `app/layout.tsx`, `app/globals.css`, `docs/design-system.md`, and this runbook together.
3. Update the design-system guardrail rather than leaving it pinned to an obsolete stack.
4. Run the full verification sequence above.
