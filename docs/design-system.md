# Design System V3.0

Last updated: 2026-02-07  
Owner: Product Design + Engineering  
Status: Production spec (single source of truth)

## 1. Typography Foundation

Canonical stack:
- Display: **Sentient**
- Interface + Data: **Satoshi**

Runtime loading:
- `next/font/local` in `/Users/matsha05/Desktop/dev/recruiter-in-your-pocket/web/app/layout.tsx`
- Local files in:
  - `/Users/matsha05/Desktop/dev/recruiter-in-your-pocket/web/public/fonts/sentient/sentient-400.woff2`
  - `/Users/matsha05/Desktop/dev/recruiter-in-your-pocket/web/public/fonts/sentient/sentient-500.woff2`
  - `/Users/matsha05/Desktop/dev/recruiter-in-your-pocket/web/public/fonts/sentient/sentient-700.woff2`
  - `/Users/matsha05/Desktop/dev/recruiter-in-your-pocket/web/public/fonts/satoshi/satoshi-400.woff2`
  - `/Users/matsha05/Desktop/dev/recruiter-in-your-pocket/web/public/fonts/satoshi/satoshi-500.woff2`
  - `/Users/matsha05/Desktop/dev/recruiter-in-your-pocket/web/public/fonts/satoshi/satoshi-700.woff2`

Token mapping in `/Users/matsha05/Desktop/dev/recruiter-in-your-pocket/web/app/globals.css`:
- `--font-display` -> `--font-sentient`
- `--font-body` -> `--font-satoshi`
- `--font-mono` -> `--font-satoshi` (with tabular numerics where needed)

### Type Roles

| Role | Desktop | Mobile | Weight | Tracking | Use |
|---|---:|---:|---:|---:|---|
| Hero H1 | 72/72 | 50/52 | 500 | -0.030em | Landing primary headline |
| Section H2 | 52/56 | 36/40 | 500 | -0.022em | Main section headers |
| Card H3 | 36/40 | 30/34 | 500 | -0.016em | Pricing, trust, research cards |
| Body L | 24/36 | 20/30 | 400 | -0.004em | Explanatory marketing copy |
| Body M | 20/30 | 18/28 | 400 | -0.002em | Default body/UI copy |
| Label | 12/16 | 11/14 | 500 | 0.105em | Overlines, metadata, tags |

### Typography Guardrails

- Display font is only for H1/H2/H3 and short signal callouts.
- Never set long paragraphs in display font.
- UI controls, table rows, legal copy, and FAQ answers must use body font.
- Numeric surfaces (score, pricing, metrics) must set `font-variant-numeric: tabular-nums`.

---

## 2. Tokens

### Color Tokens

| Token | Value (Light) | Value (Dark) | Usage |
|---|---|---|---|
| `--background` | `hsl(0 0% 98%)` | `hsl(0 0% 7%)` | page background |
| `--foreground` | `hsl(0 0% 7%)` | `hsl(0 0% 93%)` | primary text |
| `--brand` | `hsl(173 84% 24%)` | `hsl(168 76% 50%)` | primary CTA, key score |
| `--premium` | `hsl(43 96% 44%)` | `hsl(45 93% 55%)` | premium moments only |
| `--success` | `hsl(142 71% 29%)` | same semantic | positive |
| `--warning` | `hsl(48 96% 53%)` | same semantic | caution |
| `--destructive` | `hsl(0 72% 44%)` | `hsl(0 62% 31%)` | error |
| `--border` | `hsl(215 20% 88%)` | `hsl(215 20% 25%)` | structural dividers |
| `--surface-inverted` | `hsl(222 47% 11%)` | same semantic | deep ink sections |

### Radius Tokens

| Token | Value | Use |
|---|---:|---|
| `--radius-sm` | 4px | dense controls |
| `--radius` | 8px | default cards and inputs |
| `--radius-lg` | 12px | marketing cards |
| `--radius-xl` | 12px | legacy alias for marketing cards |

### Spacing Tokens

| Token | Value |
|---|---:|
| `--space-4` | 4px |
| `--space-8` | 8px |
| `--space-12` | 12px |
| `--space-16` | 16px |
| `--space-20` | 20px |
| `--space-24` | 24px |
| `--space-32` | 32px |
| `--space-40` | 40px |
| `--space-56` | 56px |
| `--space-72` | 72px |

Rhythm rule:
- Intra-component spacing uses 4-24px tokens.
- Intra-section spacing uses 24-40px tokens.
- Section-to-section spacing uses 56-72px tokens.

---

## 3. Motion and States

### Motion Tokens

| Token | Value |
|---|---|
| `--ease` | `cubic-bezier(0.16, 1, 0.3, 1)` |
| `--duration-fast` | `100ms` |
| `--duration-normal` | `200ms` |
| `--duration-slow` | `350ms` |

Rules:
- Animate only `opacity`, `transform`, and color properties.
- One signature motion moment per screen max.
- Respect `prefers-reduced-motion`.

### Required Component States

Every interactive component must define:
1. default
2. hover
3. active
4. focus-visible
5. disabled
6. loading

As applicable, also define:
7. selected
8. selected+hover
9. selected+focus
10. error
11. read-only
12. pending

---

## 4. Copy and Tone Contract

System voice:
- trusted recruiter friend
- warm, direct, specific
- technical only when useful

Structural contract for major sections:
1. outcome headline
2. mechanism sentence
3. one proof point
4. one clear CTA

Avoid terms:
- `operator-style`
- `first-pass filter`
- `unlock velocity`
- `AI-powered excellence`

Copy source:
- `/Users/matsha05/Desktop/dev/recruiter-in-your-pocket/docs/copy-system.md`

---

## 5. QA Gates (Ship Blockers)

Run from `/Users/matsha05/Desktop/dev/recruiter-in-your-pocket/web`:

```bash
npm run lint
npm run build
npm run test:ui
npm run qa:design-system
```

Minimum release bar:
- zero lint warnings
- build passes
- a11y suite passes on critical routes
- visual baselines pass for landing, pricing, research, guides, trust, and FAQ
- design-system guardrail script passes

---

## 6. Governance

Change process:
1. Update tokens or role map in `globals.css`.
2. Update this file in same PR.
3. If font files change, update `public/fonts/manifest.json` and `docs/font-operations.md`.
4. Run QA gates before merge.

No merge if docs and runtime diverge.

---

## 7. Layout System

### Container Widths

Canonical wrappers:
- Marketing and pricing sections: `max-w-7xl` with `px-6 md:px-8`
- Editorial longform (guides/research/legal): `max-w-4xl` with `px-5 md:px-6`
- Dense app surfaces (`/workspace`, `/jobs`, `/settings`): `max-w-[1440px]` with `px-4 md:px-6`

Layout contract:
- Use one primary container per section.
- Avoid nested width constraints unless a content sub-rail is intentional.
- Keep section rhythm on `--space-56` to `--space-72` intervals.
- Mobile sections must preserve at least `--space-24` top/bottom breathing room.

### Grid Rules

- Marketing split sections: 12-column grid at desktop, stacked on mobile.
- Card clusters: 3-up desktop, 2-up tablet, 1-up mobile.
- No orphan single-column card at desktop unless it is a featured card.
- Sticky headers/rails must not overlap page content at `320px` viewport width.

---

## 8. Component Acceptance Specs

### Hero + Report Artifact

- Hero headline must fit in 2-4 lines desktop and 3-5 lines mobile.
- Hero support copy max 2 sentences.
- Artifact must include:
  1. first-pass verdict
  2. one critical miss
  3. evidence-to-rewrite row
  4. score rows + priority sequence
- No explanatory copy inside the artifact that repeats what visuals already communicate.

### Pricing Cards

- Three cards only: Free / Monthly / Lifetime.
- One featured plan at a time (`lifetime` by default).
- Each card must show:
  1. price unit
  2. boundary of value
  3. primary CTA
- Avoid copy walls: max 6 bullets per paid card.

### Trust + Legal Cards

- One promise per card.
- Body copy max 2 lines mobile, 3 lines desktop.
- Must map to runtime truth in API or settings behavior.
- No claim without a control path (`settings`, `billing portal`, `support`).

### Guide Diagrams

- Diagrams must communicate in one glance without explanatory paragraphs.
- Legends and labels must use tokenized type roles.
- Never rely on color alone for meaning; include labels/icons.
- If content wraps awkwardly at mobile, switch to stacked card variant.

---

## 9. Accessibility and Readability Budgets

Minimum bars:
- Body text contrast: WCAG AA (4.5:1 minimum)
- Large text contrast: WCAG AA (3:1 minimum)
- Focus ring visible on every interactive element
- Full keyboard completion for:
  - `/workspace` upload -> run -> paywall -> checkout CTA
  - `/auth` sign-in + verification
  - `/settings/billing` restore flow

Readability:
- Paragraph max width: 65-78 characters on desktop.
- Default paragraph line-height: 1.5 to 1.7.
- Avoid more than two paragraph blocks back-to-back without a visual break.

Motion:
- Respect `prefers-reduced-motion`.
- No infinite motion loops on essential content.

---

## 10. Route-Level Visual QA Matrix

Every release candidate requires snapshots for:

| Route | Desktop 1440 | Tablet 1024 | Mobile 390 |
|---|---|---|---|
| `/` | required | required | required |
| `/pricing` | required | required | required |
| `/research` | required | required | required |
| `/guides` | required | required | required |
| `/guides/offer-negotiation` | required | required | required |
| `/trust` | required | required | required |
| `/privacy` | required | required | required |
| `/terms` | required | required | required |
| `/faq` | required | required | required |

Failure conditions:
- clipped type or overlapping cards
- broken rhythm (section spacing outside token cadence)
- CTA style drift (non-token colors/radii)
- inconsistent font stack on any route above

---

## 11. Font Operations and Performance

Hard requirements:
- Fonts are local-only via `next/font/local`.
- `font-display: swap` behavior must be preserved.
- No runtime dependency on third-party font CDNs.
- Font files must exist at:
  - `/Users/matsha05/Desktop/dev/recruiter-in-your-pocket/web/public/fonts/sentient/*`
  - `/Users/matsha05/Desktop/dev/recruiter-in-your-pocket/web/public/fonts/satoshi/*`

Performance budgets:
- No layout shift attributable to font swap in first viewport.
- LCP should not regress >100ms from typography changes alone.
- If LCP regression occurs, reduce weight count before adding new families.

Guardrails:
- `npm run qa:design-system` fails if required local font files are missing.
- `npm run qa:design-system` fails if `app/layout.tsx` does not wire Sentient/Satoshi.
- `npm run qa:design-system` fails if `public/fonts/manifest.json` checksum verification fails.
- Font operational runbook: `/Users/matsha05/Desktop/dev/recruiter-in-your-pocket/docs/font-operations.md`.

---

## 12. Exceptions

Allowed hardcoded colors:
- brand icons in `/web/app/icon.tsx` and `/web/app/apple-icon.tsx`
- PDF export styling in `/web/lib/backend/pdf.ts`
- domain-specific chart colors in `/web/app/(editorial)/guides/tools/comp-calculator/page.tsx`
- LinkedIn brand blue in `/web/components/research/diagrams/LinkedInResumeFlow.tsx`

All other surfaces must use tokens.
