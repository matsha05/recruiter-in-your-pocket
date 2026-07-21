# Recruiter in Your Pocket - Lifted Line Design System

Last updated: 2026-07-20
Owner: Product Design + Engineering
Status: Current production source of truth
System version: Lifted Line 2.0

This is the single source of truth for how the approved Lifted Line brand is implemented. It replaces the older serif-led, teal-first, Instrument-Sans-only, Ink & Paper, Editorial Proof, dossier, and red-pen directions.

Related authority:

- [`brand-system.md`](./brand-system.md): identity, promise, voice posture, and signature grammar
- [`copy-system.md`](./copy-system.md) and [`voice-and-tone.md`](./voice-and-tone.md): writing system

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

### Families

| Role | Family | Use |
|---|---|---|
| Display | **Space Grotesk Variable** | wordmark, page headlines, verdicts, prices, major evidence, and primary actions |
| Interface | **Instrument Sans Variable** | navigation, controls, labels, metadata, body copy, dense product UI |
| Technical | **Instrument Sans Variable** with tabular figures | scores, time, compact indices, and machine-readable identifiers |

Both brand fonts are self-hosted through Fontsource imports in `web/app/layout.tsx`. No runtime font CDN is allowed.

Runtime mapping:

- `--font-display` -> `"Space Grotesk Variable"`
- `--font-body` -> `"Instrument Sans Variable"`
- `--font-mono` -> `"Instrument Sans Variable"` with tabular figures; no third branded font

### Type roles

| Role | Desktop guidance | Mobile guidance | Treatment |
|---|---:|---:|---|
| Display hero | 64-88px | 48-66px | Space Grotesk 620-680, tight leading and tracking |
| Display section | 42-68px | 34-52px | Space Grotesk 600-680 |
| Evidence statement | 28-56px | 25-40px | Space Grotesk; readable before decorative |
| Body large | 18-22px | 17-20px | Instrument Sans 400-500, 1.5-1.7 line height |
| Body | 15-18px | 15-17px | Instrument Sans 400-500 |
| Label | 11-13px | 11-13px | Instrument Sans 650-760; tracked only when genuinely categorical |
| Technical | 12-16px | 12-16px | Instrument Sans with tabular figures and deliberate spacing |

Guardrails:

- Space Grotesk carries the brand voice without making the product look like a consultancy or publication.
- Instrument Sans carries explanation and interaction.
- Exactly two families appear in branded product surfaces.
- Do not use browser serif, Times New Roman, or a third mono family as intentional brand typography.
- Do not set long paragraphs in Space Grotesk.
- Avoid all-caps labels as decoration. Use them for genuine metadata and short categories.
- Use `text-wrap: balance` for display type and `text-wrap: pretty` for prose where supported.

## 4. Color and surface tokens

The canonical palette is chalk, ink, citron, and cyan. Citron owns decisive action and progress; cyan owns recruiter insight and active state. Neither is general decoration.

### Core roles

| Semantic token | Purpose |
|---|---|
| `--background` / `--surface-page` | default warm-white page field |
| `--foreground` / `--text-strong` | primary graphite text |
| `--text-muted` | secondary explanation and metadata |
| `--line` | default structural rule |
| `--brand` / `--brand-strong` | readable deep cyan for recruiter insight, links, and focused state |
| `--brand-tint` | pale cyan teaching and selected-state treatment |
| `--citron` | acquisition, selection, completion, and the single marker gesture |
| `--cyan-bright` | tiny icons, active indicators, and 2px rules only |
| `--surface-sky` / `--surface-proof` | restrained teaching and evidence surfaces |
| `--accent-apricot` / `--accent-butter` | compatibility aliases mapped to cyan and citron while older surfaces migrate |
| `--annotation` | consequential edit or omission, mapped to readable deep cyan |

### Surface grammar

- **Chalk `#F7F5EF`** is the default field.
- **Ink `#071722`** provides authority and anchors all header and primary-action chrome.
- **Citron `#C8F238`** marks acquisition, selection, or completion. Use no more than one marker gesture per screen.
- **Deep cyan `#007FA3`** is the readable recruiter-insight color.
- **Bright cyan `#25BFEA`** is reserved for small indicators and 2px rules.
- **Error `#B42318`** uses the pale `#FEF3F2` recovery surface and always includes plain-language next action.
- Prefer rules, whitespace, typography, and contrast over generic bordered cards.
- No atmospheric gradients, startup glow, faux paper stacks, red-pen cosplay, or decorative grain used to manufacture character.

Never rely on color alone. Pair semantic color with a label, icon, position, or change in wording.

## 5. Signature evidence grammar

The system uses four recurring meanings:

| Meaning | User question | Visual treatment |
|---|---|---|
| Caught attention | What lands quickly? | citron completion cue plus explicit label |
| Needs context | What is hard to understand? | cyan cue plus the missing context |
| Evidence present | What supports the claim? | restrained citron tint plus the actual proof |
| Strongest next wording | What should I write instead? | one shallow citron marker or pale-cyan teaching surface |

These cues must mean the same thing on the homepage, in reports, in the workspace, and in Research. Diagrams may add domain-specific encodings, but they must preserve these meanings.

## 6. Layout and spacing

### Containers

| Surface | Default maximum | Horizontal padding |
|---|---:|---:|
| Marketing | 82rem | 1.25rem mobile, 2rem desktop |
| Editorial and Research | 72rem overall; 42-48rem prose rail | 1.25rem mobile, 2rem desktop |
| App and reports | 90rem | 1rem mobile, 1.5-2rem desktop |

### Spacing scale

Use the 4px rhythm in `globals.css`: `--space-4`, `--space-8`, `--space-12`, `--space-16`, `--space-20`, `--space-24`, `--space-32`, `--space-40`, `--space-56`, and `--space-72`.

- inside controls: 4-16px
- inside composed components: 12-32px
- between related blocks: 24-40px
- between major sections: 56-96px, chosen optically

Open layouts are preferred to card farms. Use a container when grouping changes meaning, interaction, or elevation - not merely because content exists.

## 7. Shape, borders, and elevation

| Token | Value | Use |
|---|---:|---|
| `--radius-sm` | 4px | compact controls and evidence labels |
| `--radius` | 8px | default controls and restrained panels |
| `--radius-lg` | 12px | major product surfaces |
| `--radius-xl` | 12px | legacy alias; do not create larger generic cards |

Rules:

- The Lifted Line system is mostly rectilinear, with modest softening for interaction.
- Circles are for compact status, avatars, or icon controls - not every icon.
- Borders are structural. Shadows indicate real elevation only.
- Avoid generic white-card-plus-shadow components.
- Marketing headers are 72px; product headers are 64px.
- Marketing and product chrome use ink. Header acquisition CTAs use citron; in-page primary CTAs use ink with a citron directional icon.
- Motion is 120-180ms and must honor reduced-motion preferences.

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

Every interactive component defines, when relevant: default, hover, active, focus-visible, disabled, loading, selected, error, and pending.

Shared primitives are the default. A route-specific component is appropriate when its semantics are route-specific, not because recreating a button or card was faster.

## 10. Surface contracts

### Homepage

- Lead with the candidate's real work and one visible transformation.
- Show judgment before listing features.
- Maintain one dominant action and one supporting route.

### Workspace and report

- Put the likely takeaway, exact evidence, and next useful action first.
- Density may increase, but hierarchy must stay calm.
- Scores support judgment; they do not replace it.

### Research

- Research is the trust layer, not a blog.
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

- `--duration-fast`: 100ms
- `--duration-normal`: 200ms
- `--duration-slow`: 350ms
- `--ease`: `cubic-bezier(0.16, 1, 0.3, 1)`

Motion should clarify transformation, selection, progress, or continuity. Animate `opacity`, `transform`, and color properties. One signature motion moment per screen is enough. Respect `prefers-reduced-motion` and never loop motion on essential content.

### Signature behavior: Lifted Trace

`web/components/shared/LiftedTrace.tsx` is the canonical cross-surface provenance and process rail. Its segments represent real states, not decoration:

1. source evidence
2. open question or interpretation
3. candidate-supplied fact
4. resolved wording or action

When a segment becomes active or complete, its structural rule moves three pixels off the baseline: bright cyan for the active segment, citron for completed segments. On narrow screens the same sequence becomes a vertical rail. Labels remain visible without motion or color.

Rules:

- Drive completion from user actions or real application state.
- Do not show simulated percentages or mark backend phases complete from elapsed time alone.
- Homepage teaching sequences may run once; deeper builders remain user-driven.
- Research figures may render the completed model statically.
- Reduced motion renders the relevant final state immediately.

## 12. Accessibility and responsive contract

- WCAG AA contrast minimums: 4.5:1 body text, 3:1 large text and essential graphics.
- Every interactive element has a visible focus state.
- Touch targets are at least 44px. Compact-looking controls keep the target and reduce visual weight inside it.
- Meaning never depends on color, hover, or motion alone.
- Full keyboard completion is required for upload, auth, report navigation, and purchase entry points.
- Auth and purchase entry points use semantic forms with correct email and one-time-code autocomplete hints.
- Dense desktop tables become labeled disclosure rows on small screens. Essential answers never require horizontal panning.
- Test at 390, 1024, and 1440 pixels. Also check 320px for overflow and 200% zoom for critical flows.

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

Use focused UI tests when the affected surface has interaction.

The guardrail must fail for:

- missing Space Grotesk or Instrument Sans runtime wiring
- stale teal-first or single-font design-system claims
- missing Lifted Line semantic tokens
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
