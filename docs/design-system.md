# Recruiter in Your Pocket - Alpine Design System

Last updated: 2026-09-07
Owner: Product Design + Engineering
Status: Approved implementation contract; route and output verification tracked separately
System version: Alpine 1.0

Matt approved the September 5 6 Pro recommendations for the whole product. On September 7, the approved glasses-wearing pocket lion replaced the granite artwork as the homepage anchor. The shared system remains Instrument Sans and Source Serif 4, warm surfaces, restrained aqua, dark pill actions, and softened sheets. Lifted Line evidence meanings, product truth, security, accessibility, and working behavior remain protected. Approval of this contract does not establish that every route or output has passed verification; see `docs/alpine-product-migration.md` for historical migration evidence and the current release record for deployment checks.

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
| Display and interface | **Instrument Sans** | wordmark, titles, prices, navigation, controls, labels, body, and dense product UI |
| Technical | **Instrument Sans** with tabular figures | scores, time, indices, and identifiers |
| Short verdict | **Source Serif 4** | selected brief assessments; never a separate route-wide type system |

Both families are self-hosted in `web/app/globals.css` with `font-display: swap`. Instrument Sans is served from `/fonts/instrument-sans/InstrumentSans-Variable.woff2`, normal weights 400-700. Source Serif 4 is served from `/fonts/source-serif-4/SourceSerif4-Variable.woff2`, normal weights 200-900; its short verdict role uses 400. No runtime font CDN is allowed. Retained assets from former systems do not define browser branding.

Runtime mapping:

- `--font-brand-sans` -> `"Instrument Sans", "Helvetica Neue", Arial, sans-serif`
- `--font-display`, `--font-body`, and `--font-mono` -> `var(--font-brand-sans)`
- `--font-editorial` -> `"Source Serif 4", Georgia, "Times New Roman", serif`
- `--weight-display` -> `700`; `--weight-heading` -> `650`; `--weight-title` -> `600`
- `--weight-body` -> `400`
- `--weight-control` and `--weight-label` -> `600`

### Type roles

| Role | Size / leading | Weight and treatment |
| --- | --- | --- |
| Landing hero | `clamp(40px, 4.55vw, 82px)` / 0.98; about 70px / 68.5px at 1536px | 700; matches the approved lion composition and preserves its three-line headline |
| Marketing section title | about 40px / 44px | 650 |
| Workspace title | 40px / 44px | 600; scale down on narrow screens without clipping |
| Report heading | 24px / 30px | 600 |
| Short verdict | 28px / 36px | Source Serif 4, 400 |
| Report and app body | 16px / 25px | Instrument Sans, 400 |
| Research prose | 18px / 30px | 400; about 66ch measure |
| Table data | 14px / 22px | 400; label numeric columns and use tabular figures |
| Controls | 14-16px | 600 |
| Labels | 12-14px | 600; tracking only for genuine metadata |

Do not shrink actual report evidence to the homepage preview's scale. Use shared tokens rather than route-local family declarations. Avoid a third branded font or separate mono face. Display text may use `text-wrap: balance`; prose may use `text-wrap: pretty`. Check actual loaded faces, fallback wrapping, long headings, and font-driven layout shifts.

### Separate output pipelines

PDF, Open Graph, icons, and email carry the same brand roles within each renderer's constraints. They do not inherit browser CSS. The September 5 local output migration was rendered and inspected; evidence is recorded in `output/competitive-visuals-20260905/output-identity/README.md`. Future font/layout changes require the same independent checks. Do not infer completion from a global font change. Email must remain readable with fallback fonts and images disabled; PDF must retain selectable text, useful pagination, and grayscale legibility.

## 4. Color and surface tokens

| Role | Canonical value | Semantic usage |
| --- | --- | --- |
| Canvas | `#f6f3ef` | `--background` / `--surface-page` / paper |
| Sheet | `#fbfaf8` | card and report/form surfaces |
| Inset | `#f0efeb` | secondary or contained evidence areas |
| Ink | `#12191b` | `--foreground` / `--text-strong`; primary actions |
| Muted text | `#5f6667` | `--text-muted` / muted foreground |
| Aqua | `#00738f` | `--brand`; links, focus, selected state |
| Aqua surface | `#e6f3f2` | `--brand-tint` / `--surface-sky`; restrained explanatory areas |
| Divider | `#dcdedb` | `--line`; nonessential grouping rules |
| Control boundary | `#7e888a` | identifiable input and utility-control boundaries |

Store HSL components in tokens consumed by `hsl(var(...))`; never put a hex value inside those slots. Update linked aliases together: backgrounds, foregrounds, cards, primary actions, focus, borders, and inverted surfaces. `--brand-strong` is the deliberate darker aqua hover/emphasis role. `--cyan-bright`, `--surface-proof`, and `--accent-apricot` remain compatibility aliases into this palette. The proposal explicitly retains citron `#c8f238` through `--citron` / `--accent-butter` for compatibility; it is not a general CTA, header, or decorative completion treatment.

Headers use the quiet warm canvas treatment. Dark ink is for text, primary actions, and intentional inverted regions rather than a mandatory header band. Aqua is a restrained semantic accent. Dividers are deliberately subtle; use the stronger control boundary to identify inputs.

Success, warning, destructive/error, and disabled roles remain distinct. Operational failures must be visually and verbally separate from resume findings. Preserve accessible error/recovery surfaces and plain-language next actions. Pair color with labels, icons, position, or wording; never rely on color alone.

Matt's September 5 bold-granite refinement adds saturated assessment graphics: `--assessment-aqua` (HSL 188 85% 34%), `--assessment-green` (156 64% 37%), and `--assessment-amber` (42 94% 58%). Use these for small labeled graphics, score strokes, and priority markers; keep dark semantic colors for readable text. Matt's subsequent exact-reference correction overrides the homepage's static assessment illustration: coral first marker, golden-yellow second and third markers, neutral-gray later markers, dark number ink, and a thick forest-green score ring on a pale-gray track. Keep these in scoped `--illustration-*` roles; they provide illustrative emphasis, not error or severity classifications. These illustration colors preserve the approved report treatment alongside the current lion artwork; they do not change real report data, body weight, or the serif verdict.

Dark mode requires its own verified semantic values. Print uses white paper. Avoid atmospheric gradients, startup glow, red-pen cosplay, or decorative grain used to manufacture character.

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

On phones, compose the landing as headline, complete pocket illustration, explanation, and full-width action. Use 20-24px outer gutters, a 36-46px headline, and a 52px primary action. Between 701 and 900px, place that complete illustration beside the copy in a compact two-column composition. The approved pocket and overhanging resume keep their original pixels; a silhouette mask removes the rectangular backdrop from the fixed 43:50 mobile crop. Do not introduce a newly generated face or a competing texture behind the page.

Keep the six trusted-company marks in a balanced two-column phone grid, including the Apple mark. The illustrative assessment remains colorful. Its longer first-impression and strengths content can expand on phones; the selected priority, source evidence, and next action stay available immediately.

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

- Preserve the complete approved Alpine artwork, copy, three-line desktop headline, original company marks, CTA placement, and report introduction at the 1536 x 1024 comparison size.
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

Motion should clarify selection, real progress, or continuity. For interface transitions, animate `opacity`, `transform`, and color properties. Reading, errors, and essential content never depend on motion. The homepage uses a restrained layered lion rig: eyes lead a small head movement toward the pointer, preserving the original face, glasses, mane, and handmade texture. The pocket, paws, pencil, and resume remain fixed. Hold the attentive pose while the pointer stays in the hero and ease back on leave. Render only while the pose changes; stop offscreen, when the page is hidden, and once settled. Touch devices, reduced motion, and graphics failures retain the original still image. No required content or action depends on exploring the artwork. Do not regenerate the approved character to animate one region.

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

- missing local Instrument Sans or Source Serif 4 loading, family ranges, or shared typography tokens
- stale canonical font, palette, or geometry claims
- missing Alpine semantic tokens or compatibility aliases
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
