# Recruiter in Your Pocket - Highlighter Design System

Last updated: 2026-10-30
Owner: Product Design + Engineering
Status: Approved implementation contract; route and output verification tracked separately
System version: Highlighter 1.0

On October 30, 2026 Matt chose the Highlighter direction for every surface: web, report, workspace, signed-in pages, research and diagrams, legal and error pages, emails, the PDF, icons, and the share image. A recruiter's actual tools are the system: a yellow highlighter marks what a recruiter would miss, and a green pen writes the notes. Schibsted Grotesk sets headlines and runs the interface, and Literata carries the recruiter's voice. Product truth, security, accessibility, and working behavior remain protected. It replaces the Alpine system (Instrument Sans, Source Serif 4, aqua), which is retired.

Related authority:

- [`brand-system.md`](./brand-system.md): identity, promise, voice posture, and signature grammar
- [`copy-system.md`](./copy-system.md) and [`voice-and-tone.md`](./voice-and-tone.md): writing system
- [`font-operations.md`](./font-operations.md): local font loading, verification, and separate export pipelines

If documentation and runtime disagree, the disagreement is a release blocker. Update both in the same change.


## 1. System idea

**Lifted Line** makes good work easier to see.

The recognizable move is a truthful transformation: vague language becomes specific, hidden scope becomes visible, and evidence moves closer to the claim. We never invent accomplishment or imply a hiring outcome.

The product should feel:

- bright, not bubbly
- confident, not grandiose
- literate, not literary
- useful, not clinical
- charming, not cute
- premium through craft, not luxury theater

The emotional sequence is: **I feel seen -> I understand the problem -> I know what to do next.**

## 2. Authority and implementation

Runtime sources:

- tokens and global roles: `web/app/globals.css`
- Tailwind semantic aliases: `web/tailwind.config.js`
- shared controls: `web/components/ui/`
- evidence and diagram grammar: `web/components/shared/diagrams/`
- living reference: `/internal/system-lab`
- automated contract: `web/scripts/qa/design-system-guardrails.mjs`
- homepage hero and “Your view / A recruiter's view” example: `web/components/landing/hero/`

Rules:

1. Prefer semantic tokens and shared primitives over route-specific styling.
2. A route may compose the system differently; it may not introduce a competing palette, type system, radius language, or icon family.
3. New one-off values require a documented visual reason. Repeated values become tokens or primitives.
4. Public-facing changes must be reviewed at 390, 1024, and 1440 pixels.

The system is the floor for consistency, not a page template. Do not repeat one successful composition across every surface. Bespoke art direction is encouraged when it expresses a product truth, creates a memorable focal moment, and still obeys the shared type, color, accessibility, and evidence meanings.

## 3. Typography

### Families and loading

| Role | Family | Use |
| --- | --- | --- |
| Headlines and interface | **Schibsted Grotesk** | wordmark, headlines (800), section titles (700), big numbers, navigation, controls, labels, body, tables; tabular figures for data |
| Recruiter's voice | **Literata** | the Verdict, margin notes (italic), and quoted resume lines; never a route-wide type system |

Both are self-hosted in `web/app/globals.css` with `font-display: swap`, from `/fonts/schibsted-grotesk/SchibstedGrotesk-Variable.woff2` plus its italic (weights 400-900) and `/fonts/literata/Literata-Variable.woff2` plus `Literata-Italic-Variable.woff2` (200-900). Static `.woff` cuts in the same folders feed renderers that cannot read woff2 (share image, icons). Both are SIL Open Font License; each folder keeps its `OFL.txt`. Neither had been used in RIYP before; Geist and Newsreader (December 2025, July 2026) and Bricolage Grotesque were considered and not chosen. No runtime font CDN is allowed. There is no mono face.

Runtime mapping:

- `--font-brand-sans`, `--font-display`, `--font-body`, and `--font-mono` -> `"Schibsted Grotesk", "Helvetica Neue", Arial, sans-serif`
- `--font-editorial` -> `"Literata", Georgia, "Times New Roman", serif`
- `--weight-display` -> `800`; `--weight-heading` -> `700`; `--weight-title` -> `600`
- `--weight-body` -> `400`
- `--weight-control` and `--weight-label` -> `600`

### Type roles

| Role | Size / leading | Weight and treatment |
| --- | --- | --- |
| Landing hero | `clamp(44px, 7vw, 80px)` / 0.98 | Schibsted Grotesk 800, -0.045em; one line on desktop: “See what a recruiter sees.” |
| Marketing section title | 32-48px / 1.05 | Schibsted Grotesk 800 |
| Workspace and report headings | 24px / 30px | Schibsted Grotesk 700 |
| Verdict | 22-24px / 1.4 | Literata 400 |
| Margin notes | 15-17px / 1.45 | Literata italic 400, pen color |
| Report and app body | 16px / 25px | Schibsted Grotesk 400 |
| Research prose | 18px / 30px | Schibsted Grotesk 400; about 66ch measure |
| Table data | 14px / 22px | Schibsted Grotesk 400, tabular figures |
| Controls | 14-16px | Schibsted Grotesk 600 |
| Labels | 12-14px | Schibsted Grotesk 600; uppercase tracking only for Verdict and Critical Miss |

Nothing below 12px. Do not shrink actual report evidence to the homepage preview's scale. Use shared tokens rather than route-local family declarations. Display text may use `text-wrap: balance`; prose may use `text-wrap: pretty`. Check actual loaded faces, fallback wrapping, long headings, and font-driven layout shifts.

### Separate output pipelines

PDF, Open Graph, icons, and email carry the same brand roles within each renderer's constraints. They do not inherit browser CSS. The PDF embeds the three woff2 faces; the share image and icons use the static woff cuts; email uses system fallbacks with the Highlighter palette. Every font or layout change requires an independent render check of each output. Do not infer completion from a global font change. Email must remain readable with fallback fonts and images disabled; PDF must retain selectable text, useful pagination, and grayscale legibility.

## 4. Color and surface tokens

| Role | Canonical value | Semantic usage |
| --- | --- | --- |
| Ground | `#f4f4f1` | `--background` / `--surface-page`; a cool-neutral desk, not cream |
| Paper | `#ffffff` | `--card`; sheets, reports, forms |
| Inset | `#e9eae6` | `--secondary` / `--muted`; contained areas, toggles |
| Ink | `#111513` | `--foreground` / `--text-strong`; text and every primary action |
| Muted text | `#5a605c` | `--text-muted` / muted foreground |
| Pen | `#1f5a46` | `--pen` (aliased by `--brand`, `--ring`, `--cyan-bright`); links, focus, selected state, the recruiter's notes |
| Pen hover | `--pen-strong` | `--brand-strong`; hover and pressed emphasis on pen-colored links and controls |
| Pen tint | `#e6f0eb` | `--pen-tint` (aliased by `--brand-tint`, `--surface-sky`); quiet selected surfaces |
| Highlighter | `#ffe14d` | `--highlight`; marks a quoted line the recruiter would miss. Never a button or a large fill |
| Miss sheet | `#fff6c2` / `#f2dc6b` | `--miss-surface` / `--miss-line`; the Critical Miss block |
| Miss ink | `#6b5400` | `--brass` (aliased by `--premium`, `--warning`); text on or beside yellow |
| Divider | `#dfe0dc` | `--line`; nonessential grouping rules |
| Control boundary | `#808983` | `--control-line` / `--input`; identifiable input boundaries |

Store HSL components in tokens consumed by `hsl(var(...))`; never put a hex value inside those slots. Older names (`--brand`, `--surface-sky`, `--cyan-bright`, `--teal-bright`, `--accent-apricot`, `--assessment-*`, `--premium`, `--gold`, `--amber`) are aliases into this palette so existing utilities follow it. `--citron` / `--accent-butter` remain compatibility tokens only.

Rules: ink for actions; pen for anything the recruiter says or points at; yellow only for the Critical Miss and highlighted resume lines. Success, warning, destructive/error, and disabled roles remain distinct. Operational failures must be visually and verbally separate from resume findings. Pair color with labels, icons, position, or wording; never rely on color alone.

Dark mode has its own values: ground `#111412`-range ink-green, paper slightly lifted, pen lightened to a readable mint, and the highlighter becomes a deep olive mark under light text. Print uses white paper. Avoid gradients, glow, grain, and red-pen correction marks.

Surfaces are paper on a desk: white sheets on the neutral ground, hairline borders, 18px radius for sheets and 10-12px for insets, no drop shadows. Motion is quiet (160-200ms) except one signature move: the highlighter sweeps across a line, then the note writes in. Reduced motion shows the same end state immediately.

## 5. Signature evidence grammar

The Lifted Line meanings remain stable while their old color treatment is retired:

| Meaning | User question | Required treatment |
| --- | --- | --- |
| Caught attention | What lands quickly? | explicit label and the supporting evidence |
| Needs context | What is hard to understand? | named missing context; restrained aqua when useful |
| Evidence present | What supports the claim? | actual proof on a neutral or aqua inset |
| Strongest next wording | What should I write instead? | wording connected to the user's facts and next action |

Do not assign errors to missing career evidence or use green/red scores as substitutes for judgment. Charts may have domain-specific encodings, but labels and legends must explain them.

## 6. Layout and spacing

### Containers

| Surface | Default maximum | Density |
| --- | --- | --- |
| Marketing | 1360px | generous introduction and composed artwork |
| Workspace | 960px | focused task area, clear input grouping |
| Report shell | 1200px | readable assessment and compact useful actions |
| Authentication | about 440px | concise form and recovery messages |
| Research prose | about 66ch | 18px / 30px reading, wider figures when needed |

Use 16-20px mobile gutters and 24-32px desktop gutters where the reference allows.

### Mobile composition

On phones, place the headline, explanation, and full-width action before the example so trying the toggle never delays starting a report. Below 1100px the example becomes one sheet: the First Impression sits at the top, and each margin note sits directly under its resume line.

Its longer first-impression and strengths content can expand on phones; the selected priority, source evidence, and next action stay available immediately.

The upload surface uses a compact file picker instead of a desktop-sized drop area. The report uses one 44px row of section controls and 16px reading gutters, with its main takeaway before score context. Public navigation sheets keep their close control visible and scroll their links on short screens. Research introductions and cards use tighter spacing while retaining readable prose and source links. Review these choices at 320, 390, and 430px, and check landscape/reflow navigation separately; absence of horizontal overflow is not visual approval.

### Spacing scale

Use the 4px rhythm in `globals.css`: `--space-4`, `--space-8`, `--space-12`, `--space-16`, `--space-20`, `--space-24`, `--space-32`, `--space-40`, `--space-56`, and `--space-72`.

- inside controls: 4-16px
- inside composed components: 12-32px
- between related blocks: 24-40px
- between major sections: 56-96px, chosen optically

Open layouts are preferred to card farms. Use a container when grouping changes meaning, interaction, or elevation - not merely because content exists.

## 7. Shape, borders, and elevation

| Element | Geometry |
| --- | --- |
| Primary action | dark pill; 60px hero height, 48px app height |
| Input or utility field | 10px radius; visible control boundary |
| Inset | 12px radius |
| Main sheet | 24px radius desktop; 16px on mobile |
| Compact icon control | circle where useful; retain a 44px target |

Primary actions are pills; fields, tables, tabs, and utility controls are not all pills. Secondary actions use restrained borders and clear focus. Compact appearance does not reduce the target below 44px. Shadows indicate real elevation and remain subtle. Marketing and app navigation share warm materials and type while spacing follows context. The old ink-header, citron-CTA, and mostly rectilinear requirements are retired.

## 8. Icons and diagrams

- Use **Phosphor** for new branded and public-facing icon work.
- Existing Lucide icons may remain until a surface is intentionally migrated.
- Never mix icon families inside one surface.
- Use one optical weight per surface and size icons to the surrounding type, not the container.
- Bespoke illustration, generated imagery, custom SVG, and crafted motion are allowed when they are concept-specific and materially improve the story.
- Do not use generic blobs, stock SaaS scenes, decorative CSS art, or illustration-shaped filler to manufacture personality.

Research visuals must teach a concrete idea. Every figure needs:

1. a specific claim or question
2. readable labels
3. a clear visual encoding
4. a source or evidence note when applicable
5. a plain-language takeaway

If removing a diagram loses no understanding, the diagram is decoration and should not ship.

## 9. Components and composition

Required shared categories:

- actions: Button, text link, icon button
- input: field, upload, mode switch, validation, loading and error states
- navigation: site header, app header, mobile navigation, breadcrumb or back path
- evidence: cue, finding row, before-and-after line, source row, limitation note
- page structure: shell, section, header, prose rail, action rail
- diagrams: frame, title, legend, caption, source, takeaway
- feedback: empty, loading, success, warning, error, paywall

Every interactive component defines, when relevant: default, hover, active, focus-visible, disabled, loading, selected, error, and pending. System Lab exposes actual primitives in these states, not imitation controls. Preserve entered content after recoverable failures. Loading describes real operational state without invented percentages or timed completion.

Shared primitives are the default. A route-specific component is appropriate when its semantics are route-specific, not because recreating a button or card was faster.

## 10. Surface contracts

### Homepage

- Headline: “See what a recruiter sees.” One dark primary action (“Get your free report”) and one quiet secondary route (“See a sample report”).
- The example is a fictional resume shown two ways. “Your view” is the page alone. “A recruiter’s view” adds margin notes in the pen color (Literata italic), the First Impression with an example score, and the Critical Miss highlighted in yellow. Notes name what the line does or leaves out; they never invent results.
- The recruiter's view appears once when the example scrolls into view. A visitor's choice wins after that. The example must not gate the report action.
- The preview bridges to the same working report grammar, not an independently styled promise.
- Maintain one dominant action and one supporting route.

### Workspace and report

- Put the likely takeaway, exact evidence, and next useful action first.
- Use a quiet shared header, regular-weight introduction, warm form/report sheet, and dark primary action. Report body is 16px/25px.
- Preserve file/paste modes, optional job context, generation, missing-fact entry, comparison, history, save, and export behavior.
- Density may increase, but hierarchy must stay calm. Operational errors are not resume findings.
- Scores support judgment; they do not replace it.

### Research

- Research is the trust layer, not a blog. Prose uses 18px/30px at about 66ch, with readable figures and labeled tables.
- Start with a concrete recruiter or hiring claim.
- Show what the evidence supports, what remains uncertain, and what the reader can do with it.
- Prefer diagrams, comparisons, annotated processes, and source-backed teaching surfaces when they materially improve understanding.
- Never expose internal evidence-strength labels as consumer-facing taxonomy.

### Pricing, auth, trust, and legal

- Use the shortest, clearest version of the system.
- Keep claims factual and traceable to real behavior.
- Avoid invented urgency, inflated privacy language, and decorative brand performance.

## 11. Motion

Canonical tokens:

- `--duration-fast`: 140ms
- `--duration-normal`: 180ms
- `--duration-slow`: 180ms
- `--ease`: `cubic-bezier(0.22, 1, 0.36, 1)`

Motion should clarify selection, real progress, or continuity. For interface transitions, animate `opacity`, `transform`, and color properties. Reading, errors, and essential content never depend on motion. The homepage example uses Motion: the toggle thumb slides between options, margin notes open in sequence, and leader lines draw from the resume to each note. Reduced motion shows the same states immediately. Do not make report access depend on the example.

### Shared interaction implementation

The September 13 motion pass uses these shared primitives across the product:

- `web/lib/animation.ts` mirrors the CSS tokens through `UI_TRANSITION` and `UI_TRANSITION_FAST`. Shared selection indicators move; report prose stays still.
- `AppProviders` supplies the Motion features required by existing `m` components. `web/hooks/use-reduced-motion.ts` subscribes to preference changes without remounting forms or losing entered text.
- `ActionFeedback` reserves the space for short idle, pending, and success labels. Only the current state is exposed to assistive technology; hidden sizing copies do not animate. `Button` accepts `loadingLabel` while keeping its idle children stable.
- Copy, save, parse, and export feedback follows the actual operation. Success appears only after confirmation, failures stay actionable, and repeated actions cancel stale feedback timers.
- Radix owns dialog, sheet, menu, and popover focus and dismissal. Shared CSS provides 180ms entry and 140ms exit. Native `ui-disclosure` details progressively animate intrinsic size where supported; their readable fallback and keyboard semantics remain intact.
- Reduced motion updates immediately, including a preference change while the page is open. Essential content is visible before JavaScript; the interface adds no decorative stagger or artificial waiting period.

The interactive examples in `/internal/system-lab` show these states explicitly. That reference remains protected from public production access.

### Signature behavior: Lifted Trace

`web/components/shared/LiftedTrace.tsx` is the canonical cross-surface provenance and process rail. Its segments represent real states, not decoration:

1. source evidence
2. open question or interpretation
3. candidate-supplied fact
4. resolved wording or action

Aqua identifies current evidence; completed states use explicit wording or icons. There is no neon completion requirement. On narrow screens the same sequence becomes a vertical rail. Labels remain visible without motion or color.

Rules:

- Drive completion from user actions or real application state.
- Do not show simulated percentages or mark backend phases complete from elapsed time alone.
- Homepage teaching sequences may run once; deeper builders remain user-driven.
- Research figures may render the completed model statically.
- Reduced motion renders the relevant final state immediately.

## 12. Accessibility and responsive contract

- WCAG AA contrast minimums: 4.5:1 body text, 3:1 large text and essential graphics.
- Every interactive element has a visible focus state. Inputs use an identifiable boundary, not the subtle divider alone.
- Touch targets are at least 44px. Compact-looking controls keep the target and reduce visual weight inside it.
- Meaning never depends on color, hover, or motion alone.
- Full keyboard completion is required for upload, auth, report navigation, and purchase entry points.
- Auth and purchase entry points use semantic forms with correct email and one-time-code autocomplete hints.
- Dense desktop tables become labeled disclosure rows on small screens. Essential answers never require horizontal panning.
- Test at 390, 768, 1024, and 1440 pixels. Also check 320px for overflow and 200% zoom for critical flows.
- Dialogs preserve focus management and screen-reader names. Errors retain associated labels and recovery actions.

Ship blockers include clipped typography, overlapping controls, horizontal overflow, missing states, dead navigation, and layout shift caused by fonts.

## 13. Governance and release gates

For any visual-system change:

1. Update semantic tokens or shared primitives first.
2. Update this document in the same change.
3. Add or update the living reference in `/internal/system-lab`.
4. Verify representative marketing, Research, report, and app surfaces.
5. Run from `web/`:

```bash
npm run qa:design-system
npm run lint
npm run build
```

Use focused UI tests when the affected surface has interaction. Keep security, privacy, billing, identity, and accessibility release checks intact. Browser route/state and output verification remain separate; render actual PDFs and inspect embedded fonts, selectable text, long findings, pagination, tables, grayscale output, and links. Check email with fallback fonts and images disabled. Record evidence and pending work in `docs/alpine-product-migration.md`.

The guardrail must fail for:

- missing local Schibsted Grotesk or Literata loading, family ranges, or shared typography tokens
- stale canonical font, palette, or geometry claims
- missing Highlighter semantic tokens or compatibility aliases
- external font imports
- unauthorized hardcoded colors
- banned public copy patterns
- increasing arbitrary-value or legacy-palette debt beyond the recorded baseline

## 14. Final quality test

Before shipping, ask:

1. Is the most useful thing obvious in three seconds?
2. Does this make the candidate's real work clearer without inflating it?
3. Is the copy something a thoughtful human would actually say?
4. Does every visual teach, orient, or prove something?
5. Are the system's evidence cues used consistently?
6. Does this unmistakably belong to the same product as the homepage and report?

If any answer is no, the surface is not finished.
