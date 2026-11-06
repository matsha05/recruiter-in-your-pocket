# Recruiter in Your Pocket - Highlighter Design System

Last updated: 2026-11-01
Owner: Product Design + Engineering
Status: Approved implementation contract; route and output verification tracked separately
System version: Highlighter 1.1 (type roles, one Button, one interaction grammar, style budgets; Nov 1, 2026)

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
- the materials and the rhythm (Nov 4, 2026): `web/components/materials/` (`Paper`, `Pile`, `Pen`, `Clipping`, `SignedNote`, `Rhythm.module.css`) and `web/hooks/use-seen.ts`; see §10, "The site system"
- homepage story: `web/components/landing/home/` (`PileHero`, `ReadBeat`, `NoteSection`, `HiringTruths`, `RecheckSection`, `FounderNote`, `CloseField`), composed in `LandingMineral.tsx`

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
| Headlines and interface | **Schibsted Grotesk** | wordmark, headlines and titles (800), headings and controls (600), big numbers, navigation, labels, body, tables |
| Recruiter's voice | **Literata** | the Verdict, margin notes (italic), and quoted resume lines; never a route-wide type system |

Both are self-hosted in `web/app/globals.css` with `font-display: swap`, from `/fonts/schibsted-grotesk/SchibstedGrotesk-Variable.woff2` plus its italic (weights 400-900) and `/fonts/literata/Literata-Variable.woff2` plus `Literata-Italic-Variable.woff2` (200-900). Static `.woff` cuts in the same folders feed renderers that cannot read woff2 (share image, icons). Both are SIL Open Font License; each folder keeps its `OFL.txt`. Neither had been used in RIYP before; Geist and Newsreader (December 2025, July 2026) and Bricolage Grotesque were considered and not chosen. No runtime font CDN is allowed. There is no mono face.

Runtime mapping:

- `--font-brand-sans`, `--font-display`, `--font-body`, and `--font-mono` -> `"Schibsted Grotesk", "Helvetica Neue", Arial, sans-serif`
- `--font-editorial` -> `"Literata", Georgia, "Times New Roman", serif`
- `--weight-display` and `--weight-heading` -> `800`; `--weight-title` -> `600`
- `--weight-body` -> `400`
- `--weight-control` and `--weight-label` -> `600`

### Type roles

Numbers (Oct 31, 2026): Schibsted Grotesk's tabular figures also give commas a full digit width ("$1 ,370 ,000"), so `tabular-nums` is redefined globally to proportional digits. Right-align money columns for tidy edges; never re-enable `tnum` on anything that contains a comma or period.

Every piece of text on the site uses one of twelve roles (eleven on Nov 1, 2026, plus `verdict-lead` on Nov 2). The production audit counted 121 text styles, 31 sizes (some fractional, such as 13.76 and 100.8px), and weights from 400 to 800; the roles replace all of them. Sizes are whole pixels and step at breakpoints instead of scaling with `clamp()`, so a heading is the same size everywhere it appears at a given width.

| Role | Phone (<768px) | 768px and up | Weight and family | Use |
| --- | --- | --- | --- | --- |
| `display` | 36 / 38 | 60 / 62 | 600 Schibsted (`--weight-marketing`), -0.035em | marketing tier: the homepage's read, "By the time you finish reading this sentence…" (Nov 4, 2026). The pile's h1 is the `headline` size at the same 600 weight. The craft sites measured for the homepage set headlines at 500 to 600, never 800, so the marketing tier is the one place the weight drops |
| `headline` | 36 / 40 | 48 / 52 | 800 Schibsted, -0.04em | content tier: page titles on research, guides, pricing, legal, errors; marketing section titles |
| `title` | 28 / 34 | 32 / 38 | 800 Schibsted, -0.03em | app tier: workspace, report, account, and auth page titles; article h2; big numbers |
| `heading` | 24 / 30 | 24 / 30 | 600 Schibsted, -0.02em | section and card headings, report section titles |
| `lead` | 18 / 30 | 20 / 30 | 400 Schibsted | a page's deck or introduction |
| `prose` | 18 / 30 | 18 / 30 | 400 Schibsted | research and guide reading (18px / 30px) |
| `body` | 16 / 25 | 16 / 25 | 400 Schibsted (600 for emphasis and controls) | report, app, and marketing body (16px / 25px) |
| `small` | 14 / 22 | 14 / 22 | 400 or 600 Schibsted | tables, navigation, metadata, compact controls |
| `label` | 13 / 18 | 13 / 18 | 600 Schibsted (400 for captions) | labels, captions, footnotes; the 13px floor |
| `verdict` | 20 / 30 | 24 / 34 | 400 Literata | the Verdict, quoted resume lines, the recruiter's longer answers |
| `verdict-lead` | 22 / 30 | 28 / 38 | 400 Literata | the Verdict's first sentence on the report's first screen (Nov 2, 2026); the rest of the Verdict is `body` behind "Read the rest" on phones |
| `note` | 16 / 25 | 16 / 25 | 400 Literata, italic for margin notes | pen notes, figure notes, short quoted findings |

Rules:

- Three headline tiers, so hierarchy follows importance: marketing 60 at 600 (the homepage), content 48 at 800, app 32 at 800. Nothing outranks the homepage's read; the 404 and the research index use the content tier.
- Three weights: 800 for headline and title; 600 for display (the marketing tier), headings, controls, labels, and bold text (`strong`, `b`, and `th` are 600, not the browser's 700); 400 for reading. Tailwind's `font-medium` and `font-semibold` both mean 600, and `font-bold` means 800.
- The one marketing quote (the homepage verdict in One Sentence) uses the `headline` size in Literata 400, with the leading opened to 44 / 58 (`--type-headline-serif-leading`) so the highlighter and Literata's ascenders don't collide.
- Uppercase stays reserved for the Verdict and Critical Miss labels (`label` with 0.1em tracking).
- Illustrations that draw a document, such as the hero resume, may use the document's own type; they are hidden from assistive technology. The stacked wordmark is exempt until the D6 logotype replaces it.

Implementation:

- The sizes live once, in `web/app/globals.css` (`--type-<role>-size` and `--type-<role>-leading`, with the phone-first steps in two media queries). `--type-<role>` is a `font` shorthand for CSS modules: `font: var(--type-body)`, plus `letter-spacing: var(--tracking-<role>)` for the four headline roles.
- `web/tailwind.config.js` exposes each role as `text-<role>`. Tailwind's own keys are aliases (`text-xs` -> label, `text-sm` -> small, `text-base` -> body, `text-lg` -> prose, `text-xl` -> lead, `text-2xl` -> heading, `text-3xl`/`4xl` -> title, `text-5xl`/`6xl` -> headline, `text-7xl` and up -> display), so every size class lands on the scale. `text-report-title` and `text-data` remain as deprecated aliases while another workstream edits the files that use them.
- A role owns its line height: don't add `leading-*` to a role, and don't write `text-[15px]`, `font-[500]`, or a raw `font-size` in CSS. The guardrail fails on all three.
- `cn()` (tailwind-merge) knows the role names, so `text-heading` and a text color never cancel each other.

Nothing below 13px. Do not shrink actual report evidence to the homepage preview's scale. Display text may use `text-wrap: balance`; prose may use `text-wrap: pretty`. Check actual loaded faces, fallback wrapping, long headings, and font-driven layout shifts.

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
| Pen | `#1f5a46` | `--pen` (aliased by `--brand`, `--ring`, `--cyan-bright`); link underlines, focus, selected state, the recruiter's notes |
| Pen hover | `--pen-strong` | `--brand-strong`; hover and pressed emphasis on pen-colored links and controls |
| Pen tint | `#e6f0eb` | `--pen-tint` (aliased by `--brand-tint`, `--surface-sky`); quiet selected surfaces |
| Blue ink | `#2448a8` | `--blue-ink`; the candidate's own work and numbers when they need a voice distinct from the recruiter's pen |
| Chart 1–4 | `#2f5bd3` `#2a8a5f` `#8a4fa8` `#d9731a` | `--chart-1`…`--chart-4` (`bg-chart-1`…); the categorical order for comparisons: blue ink, green pen, plum, orange. Validated with the dataviz palette checker (lightness band, chroma floor, color-vision separation, 3:1 on the sheet) in light and dark, Oct 31, 2026 |
| Red pen | `--destructive` | `--red-pen`; what slips past or is missing (wavy underline on skimmed lines, "What's missing" labels, "What keeps coming up"), plus errors and destructive actions. Never decoration |
| Highlighter | `#ffe14d` | `--highlight`; marks a quoted line the recruiter would miss. Never a button or a large fill |
| Miss sheet | `#fff6c2` / `#f2dc6b` | `--miss-surface` / `--miss-line`; the Critical Miss block |
| Miss ink | `#6b5400` | `--brass` (aliased by `--premium`); text on or beside yellow |
| Warning | ink on inset | `--warning` / `--warning-foreground` are the text ink and `--warning-surface` the inset (Nov 2, 2026): an operational notice (a slow run, a failed save, a purchase that needs a look) is ink on an inset sheet, never the Critical Miss yellow |
| Divider | `#dfe0dc` | `--line`; nonessential grouping rules |
| Control boundary | `#808983` | `--control-line` / `--input`; identifiable input boundaries |
| Paper sheet | `#fefefc` | `--paper-sheet`; the material of a drawn document: a sheet in the pile, a strip, a clipping (Nov 4, 2026). Its edge is `--paper-edge` (ink at 20%, a 0.5px hairline) and its lift `--paper-shadow` |
| Document ink | `#1b1b1b` / `#6f6f6c` | `--document-ink` / `--document-ghost`; text inside a drawn document, in the document's own face (`--font-document`, Georgia). The ghost is the passing grey of a clipping's neighbours; it reads at 4.5:1 and fades by mask, never by opacity |
| Marker | `--highlight` | `--marker`; the same yellow, named for the hand that holds it on the materials |
| Reject ink | `#c52a22` | `--reject-ink`; the one red mark on the site: the recruiter's decision, Reject circled on the homepage. Spent once; never used again |

Store HSL components in tokens consumed by `hsl(var(...))`; never put a hex value inside those slots. Older names (`--brand`, `--surface-sky`, `--cyan-bright`, `--teal-bright`, `--accent-apricot`, `--assessment-*`, `--premium`, `--gold`, `--amber`) are aliases into this palette so existing utilities follow it. `--citron` / `--accent-butter` remain compatibility tokens only.

Rules (a recruiter's desk of pens, Matt, Oct 31, 2026): ink for actions; green pen for anything the recruiter says or points at; blue ink for the candidate's own work and numbers; red pen (`--destructive`) only for problems and destructive actions, never decoration; yellow only for the Critical Miss and highlighted resume lines. Charts and comparisons use `--chart-1`…`--chart-4` in that fixed order, never cycled; a fifth series folds into "Other" or small multiples. Within one view a color means one thing: in the offer calculator it means the kind of pay (base, equity, bonus, one-time), so offers are told apart by name. Data labels and values stay in text ink, never the series color. Two hands on one page: anything quoted from the candidate's resume wears a blue-ink rule (the Critical Miss quote keeps the highlighter instead); the recruiter's notes, approvals ("Don't touch this one", "What keeps working"), and suggested wording wear the green pen; what is missing wears the red pen. Single-series charts use `--chart-1`. Guides wear the pen only for suggested wording (the "What you can say" box) and figure pen notes; their headlines, rules, section numbers, and labels stay ink or muted, and the guardrail checks it (Nov 1, 2026). Meaning is global, so color is spent only on meaning: pen colors mark text and mean the same thing on every page; chart colors live only inside a chart with a legend, which scopes them; a multi-series chart never shares a view with pen marks; and navigation, categories, tags, and pillars are never color-coded (they use position, numbering, and names). The research pillars were tried in chart colors on Oct 31 and rejected for exactly this reason: blue would have meant both "your words" and "Perception". Success, warning, destructive/error, and disabled roles remain distinct. Operational failures must be visually and verbally separate from resume findings. Pair color with labels, icons, position, or wording; never rely on color alone.

Dark mode has its own values: ground `#111412`-range ink-green, paper slightly lifted, pen lightened to a readable mint, and the highlighter becomes a deep olive mark under light text. Print uses white paper. Dark mode chart steps are lifted separately (`#5b80e6` `#3a9a6e` `#a06cc0` `#d9731a`) and validated against the dark sheet. Avoid gradients, glow, and grain.

Surfaces are paper on a desk: white sheets on the neutral ground, hairline borders, 18px radius for sheets and 10-12px for insets. Shadows mark real elevation only (a sheet lifted off the desk, a floating card, a dialog) and stay subtle; static cards and share images carry none (reconciled with §7, Nov 2, 2026). Motion is quiet (160-200ms, one shared curve) except one signature move: the highlighter sweeps across a line, then the note writes in. Reduced motion shows the same end state immediately.

## 5. Signature evidence grammar

The Lifted Line meanings remain stable while their old color treatment is retired:

| Meaning | User question | Required treatment |
| --- | --- | --- |
| Caught attention | What lands quickly? | explicit label and the supporting evidence |
| Needs context | What is hard to understand? | named missing context; pen note when useful |
| Evidence present | What supports the claim? | actual proof on a neutral or pen-tint inset |
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
| Research prose | 52ch (`max-w-reading`), about 69 characters | 18px / 30px reading, wider figures when needed |

Use 16-20px mobile gutters and 24-32px desktop gutters where the reference allows.

### Mobile composition

On phones, place the headline, explanation, and full-width action before the resume illustration so it never delays starting a report. Each beat of the story is one screen; the page never scrolls sideways.

Its longer first-impression and strengths content can expand on phones; the selected priority, source evidence, and next action stay available immediately.

The upload surface uses a compact file picker instead of a desktop-sized drop area. After a file is read, "What we read" shows the extracted text before the run, and text under 200 characters can't start a report (the server rejects it too) (Nov 1, 2026). The report uses one 44px row of section controls and 16px reading gutters, with its main takeaway before score context. On phones the section row stays out of the first screen, so the Verdict, the Critical Miss and its first question come first; it slides in under the header once the opening read has scrolled away (Nov 1, 2026, plan item 2.5). The report's first screen (W1, Nov 2, 2026): a header row on the sheet (the candidate's name from the resume's first line when this visit holds it, the first best-fit role, how long the read took, and a "Read as" chip from `role_fit.seniority_read` only when it is a short level, never a sentence), the Verdict's first sentence in `verdict-lead` with the rest behind "Read the rest" on phones, the band name and bar on one row, the Critical Miss count on one row, and the first Critical Miss on its miss sheet (`--miss-surface`) with the quoted line, the pen note and the first question. Save and Export ride in the sticky section row, icon-only on phones. Fix cards read "Fix 2 of 3". The PDF keeps its own order. Public and app navigation use one drawer, `components/layout/NavDrawer.tsx` (Nov 1, 2026): it opens from the right under its trigger at `min(88vw, 22rem)`, with the wordmark, text rows, and a Phosphor trigger and close, and it keeps the close control visible and scrolls its links on short screens. Research introductions and cards use tighter spacing while retaining readable prose and source links. Review these choices at 320, 390, and 430px, and check landscape/reflow navigation separately; absence of horizontal overflow is not visual approval.

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
| Action | the shared Button: a pill at 44, 48, or 60px |
| Input or utility field | 10px radius; visible control boundary |
| Inset | 12px radius |
| Main sheet | 24px radius desktop; 16px on mobile |
| Compact icon control | circle where useful; retain a 44px target |

Primary actions are pills; fields, tables, tabs, and utility controls are not all pills. Secondary actions use restrained borders and clear focus. Compact appearance does not reduce the target below 44px. Shadows indicate real elevation and remain subtle. Marketing and app navigation share warm materials and type while spacing follows context. The old ink-header, citron-CTA, and mostly rectilinear requirements are retired.

### Wordmark and app icons (D6, Nov 1, 2026)

Matt chose direction C, "Two Voices": the name in Schibsted Grotesk ExtraBold in ink, and "in" in Literata Italic in the pen green (mint on dark), the same two voices as the report. The favicon is C2, "The Noted R": a Schibsted R underlined once in pen. No yellow appears in the mark.

- `web/components/icons/Wordmark.tsx` draws outlined paths (`wordmark-paths.ts`), so it never waits on a web font. Ink follows the text color and "in" follows `--pen`. It sits on one line at about 20px type in the site header and footer and about 18px in the app header, and stacks on two lines below 640px in the headers.
- `app/icon.svg` follows the browser theme (paper tile, or ink tile in dark mode). `app/favicon.ico` carries the 16px drawing redrawn on whole pixels plus the 32px drawing. `app/apple-icon.png` and the manifest icons in `public/brand/` use the ink tile, and are safe as maskable icons.
- The share cards set the name in Satori spans with the Literata italic "in". The PDF embeds the static Literata Italic cut for it, and the sign-in email uses HTML text with a Georgia italic fallback, so it reads with images off.
- Sources are in `web/public/brand/` (from `docs/design-explorations/wordmark-2026-11/`). Run `node scripts/brand-assets.mjs` from `web/` after changing them.

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

### Figures: the recruiter's desk (October 31, 2026)

Research figures are drawn in the product's own hand, from `web/components/research/figures/FigureKit.tsx`. A generic bar chart is the fallback, not the default.

- **Count things people can picture.** When the number is a rate, show the units: 100 resume sheets, 500 applicants as dots, 136 callbacks. "1 in 500" lands when the reader sees the 500. Use `UnitGrid` (`shape="sheet"` for resumes, dots for people or events).
- **One pen note per figure.** `PenNote` is the recruiter's margin note: Literata italic in pen, one or two sentences, saying what a recruiter takes from the figure. It follows the voice guide's margin-note register and never claims more than the source.
- **One highlighter per figure.** `Mark` sweeps once when the figure scrolls into view and lands on the single takeaway: the highlighted unit, number, or phrase. Never two. When the data carries the highlight (a highlighted unit, bar, or band), the pen note stays pen with no `Mark` in it. The guardrail fails a figure that uses the highlighter two ways (Nov 1, 2026; the spelling figure had yellow bars and a yellow note).
- **Pen means the thing that matters; gray is everything else.** Highlighter yellow is reserved for the one takeaway. No other hues.
- **Draw the artifact when the finding is about the artifact.** A typo study shows a resume line with the typos circled in pen; a story study shows two versions of the same resume.
- **Lines for change over time.** Use the SVG line pattern in `GapPivotDiagram`: 2.5–3px strokes, direct labels at the points that matter, a soft highlighter band for the region the note is about.
- **Honesty stays visible.** Every figure carries its source in the caption and a plain footnote for rounding, our own arithmetic, small samples, or what the study didn't test.
- **Motion:** units reveal in reading order, lines draw in, and the highlighter sweeps, all once and all on the shared tokens. Reduced motion shows the finished figure.

## 8b. System rules set during the signed-in review (October 31, 2026)

- **13px is the floor.** No text below 0.8125rem anywhere: labels, captions, metadata, chips, footnotes.
- **Uppercase only for Verdict and Critical Miss**, via `.riyp-verdict-label`. Every other label is sentence case at 13px, weight 600. A resume section heading drawn inside an illustration may mimic the resume's own style.
- **Every button is a pill.** The shared Button is `rounded-full` in all variants, with no shadows. Outline buttons darken their border on hover; they don't turn green. Since Nov 1, 2026 there is one Button: three sizes, three variants, and the two delete treatments (§9).
- **Static cards don't react.** `.app-card` has a hairline border and no shadow or hover state. Only things you can click respond to the pointer.
- **The score is a band, not a color (D5, Nov 1, 2026).** A first report shows the score as one of three bands, named and anchored in words ("Needs more context", "Mostly clear", "Clear and specific"; thresholds 70 and 85, matching the validator's `score_label`), with an ink bar marking the current band (`markup/ScoreBand.tsx`, `lib/reports/score-band.ts`). The number appears only when two reads are compared. No green, gold or red; the written Verdict carries the judgment.
- **Status chips use pen.** "Active" and "Paid" use the pen tint, not success green. Green-for-good is not part of the system.
- **One date format:** "Oct 25, 2026" (`en-US`, short month). Money is formatted as currency ("$29.00").
- **Page intros align with their content.** `AppPageIntro` has no side padding of its own; the page container sets the gutter. Skip an eyebrow that just repeats the page title.
- **Icons are Phosphor** on every surface a customer reaches. Lucide remains only in internal and flagged-off surfaces until they're migrated.

## 9. Components and composition

Required shared categories:

- actions: Button, text link, icon button
- input: field, upload, mode switch, validation, loading and error states
- navigation: site header, app header, mobile navigation, breadcrumb or back path
- evidence: cue, finding row, before-and-after line, source row, limitation note
- page structure: shell, section, header, prose rail, action rail
- diagrams: frame, title, legend, caption, source, takeaway
- feedback: empty, loading, success, warning, error, paywall

Every interactive component defines, when relevant: default, hover, active, focus-visible, disabled, loading, selected, error, and pending. System Lab exposes actual primitives in these states, not imitation controls. Preserve entered content after recoverable failures. Loading describes real operational state without invented percentages or timed completion. The report wait screen shows elapsed time and the stage the stream reports (`stage` events: sending, reading, writing, checking, severity, or a retry); a step is done only when the stream moves past it (Nov 1, 2026). Since Nov 2, 2026 (W2) the wait is the person's own resume on a sheet, dimmed, in the document's own serif, with the pen on the line the stream is reading: the pen's position is a function of the stage, never of elapsed time, and the sheet scrolls to it only on a stage event. Five chips name the stages (Sent, Reading, Writing the notes, Checking every quote, Anything else that costs an interview?); the heading row carries the clock and "usually under two minutes" until a measured number replaces it; Stop is a quiet link; the slow-run aside is ink on an inset. Reduced motion shows the static sheet. The sheet is hidden from assistive technology; the status line says the same thing in words.

Shared primitives are the default. A route-specific component is appropriate when its semantics are route-specific, not because recreating a button or card was faster.

### Button

`web/components/ui/button.tsx` is the only button. The production audit found nine builds of the dark pill (heights from 44 to 60px, labels from 14 to 17px at 500 or 600, white or ground-colored text); there is now one build per size and variant. A link that looks like a button is the Button with `asChild` around the `Link`.

| Size | Height | Label | Use |
| --- | --- | --- | --- |
| `sm` | 44px | `small`, 600 | dense rows, report and account actions |
| `md` (default) | 48px | `body`, 600 | app and page actions, the header action |
| `lg` | 60px | 18px, 600 | the one large action on a marketing page or band |
| `icon` | 44px circle | none | menus and close controls |

| Variant | Rest | Hover | Use |
| --- | --- | --- | --- |
| `primary` (default) | ink fill, white label | ink at 88% | the one main action in a view |
| `secondary` | white sheet, control-line outline | outline turns ink | other actions |
| `quiet` | text with the quiet underline | underline goes solid | a supporting route beside a primary, like "See an example" |
| `destructive` | white sheet, red-pen outline and label | outline goes solid red | every delete control that opens or leads to a deletion; the red pen draws a line |
| `destructiveFinal` | red-pen fill, white label | fill at 88% | only the button that performs an irreversible step, inside its final confirm (delete account, delete report, delete job) |

Delete rule (Matt, Nov 1, 2026): outlined red everywhere, filled red only on the last irreversible step. A screen never shows a filled red button outside a confirm dialog.

Don't restyle a Button through `className` (height, padding, size, weight, fill, or border); pick the size and variant. Layout classes such as `w-full`, `mt-*`, `justify-between`, and `hidden md:inline-flex` are fine. An ink band (the homepage close) adds the `dark` class so its tokens, and the Button with them, invert.

## 10. Surface contracts

### The site system (November 4, 2026)

The homepage's rules are the site's (Matt, Nov 4, 2026; promoted from the homepage the same day, with the research behind the reach of the materials in `docs/design/2026-11-homepage-research.md`). Every public page is made of the same three materials and one red mark, on the same rhythm, with the same one button name. The shared pieces live in `web/components/materials/`.

**The materials.** Paper, the marker and the green pen, plus one red mark.

- **Paper** (`Paper`): off-white (`--paper-sheet`), a 0.5px hairline edge (`--paper-edge`), a soft lift (`--paper-shadow`), square corners. Every sheet and strip declares one box-shadow, the edge plus the lift, as two custom properties. Inside a drawn document the document's own face is allowed (`--font-document`, `--document-ink`, `--document-ghost`); a strip is one line cut from a document, a page is a whole sheet. Paper is only ever a real document or a real line from one. It is never a card.
- **The pile** (`Pile`): one sheet per thing counted, 8.5 by 11, in rows; the last row is short because the number is real. It arrives once as a hero (`motion="arrive"`, the marked sheets turning green after the pile is in), stands still elsewhere, goes pale at a distance, and can outline one sheet when seen. At `lg` and `xl` a sheet is lifted and shows the ghost of a document. The count is always a real, sourced number, and the label says it in words.
- **The marker** (`MarkerStroke`): two rough passes under the one line a recruiter would miss. One per figure, never two.
- **The pen** (`PenUnderline`, `PenCircle`, `PenArrow`, `PenNote`): the recruiter's hand. It underlines at reading pace, circles once, points from a margin note back to the line, and writes in Literata italic in `--pen`. The pen's words are the recruiter's actual words, never ours.
- **The clipping** (`Clipping`): the three materials assembled into the product's output: one line on its strip, the neighbours fading off the cut edges by mask, the marker across the line, the note in the margin with the arrow. Every clipping is a real line from a real resume, or a labelled fictional one (`FictionalTag`).
- **The signed note** (`SignedNote`): the recruiter in the first person, in the pen, signed with the wordmark rather than a name. It appears on the homepage beside the founder's drawing and once more on How the report works, where the disclosure lives. Nowhere else (Matt, Nov 4, 2026).
- **The one red mark** (`--reject-ink`): the red pen circles Reject on the homepage. It is the recruiter's decision, not decoration. It is spent; no other surface uses red for anything but errors and destructive actions (§4).

**Where the materials go** (Matt, Nov 4, 2026, on the recommendation "only where literally true"; the twelve craft sites measured that day carry a hero's device onto persuasion pages as a cheaper token of the same material and keep docs, help and sign-in plain). A sheet appears where there is a real document or report, a clipping where there is a real line, the pen where the recruiter speaks. So: the homepage and the report carry the composed objects; pricing shows reports as sheets (one free, five on the pass); How the report works shows the Verdict, the band and the Critical Miss as marks on Jordan's paper; research clips the line a study is about and keeps the pen for figures and margin notes; help and sign-in get the rhythm, the type and the button name, and no props.

**The rhythm** (`Rhythm.module.css`): one column (`--marketing-content`, 68rem), one hairline and one beat (`--beat`, 7rem) between sections; pages compose `.page`, `.opening`, `.section`, `.title`, `.deck`, `.link` and `.close` from it. A section is a headline, at most one short paragraph, one object and one link, about 44 words (the restrained pages measured on Nov 4 run a median of 44 words a section); a quote never sits inside a feature section; no page captions its object. A page runs four to six sections; the report is an instrument, so there the density rule bends.

**Motion.** Every mark is one gesture, made once, on scroll-in (`useSeen`, `web/hooks/use-seen.ts`), and reduced motion shows the finished state. A gesture is `--duration-gesture` (560ms) on `--ease-pen` or `--ease-marker`; what follows a mark waits `--delay-gesture` (700ms). Nothing loops; nothing moves on hover but the interaction grammar in §11. Reading, errors and recovering a report never depend on motion.

**The button.** `Get your free report` (`copy-system.md` §1), the shared Button, two to four times a page (header, hero, close), never twice in one section; a section's other action is a text link.

### Homepage

Rebuilt on November 4, 2026 from first principles (Matt; research, sources and the record of what was tried in `docs/design/2026-11-homepage-research.md`). No product is shown in the hero. The page is made of the site's three materials, paper, the marker and the green pen, plus the one red mark, and runs seven beats on the site rhythm (`components/materials/Rhythm.module.css`; sections compose `.section` and `.title` from it).

1. **The pile** (`PileHero`). The h1 “244 people applied for the job you wanted.”, then “Eighteen got called back. The other 226 have no idea why the recruiter passed.”, the one primary action (“Get your free report”, `copy-system.md` §1) and the quiet route (“See Jordan’s report”). Beside it, 244 sheets of paper (`#fefefc`, 8.5 by 11, a 0.5px hairline edge), eighteen of them green: the number arrives as three ticking digit flaps in step with the sheets, all on CSS from first paint. The source line cites Greenhouse, *The Hire Standard*, March 2026 (244 applications per role, 7.6% stage-one progression; 18 of 244 is the nearest whole number). On phones the pile comes first, then the headline and the button, all inside the first screen.
2. **The read** (`ReadBeat`). “By the time you finish reading this sentence, a recruiter has finished reading your resume.” The green pen draws a line under the sentence for five seconds, the width of its widest line, starting when a third of the section is in view. Then the recruiter's two choices appear where the pen stopped, “Move forward” and “Reject”, and the pen circles Reject in red (`--reject-ink`, the one red mark on the site: the decision, nothing else; the other choice falls back to `--text-muted`, which still reads at 4.5:1). Then “Nobody tells you why. We do, before you apply for the next one.” and the button.
3. **The note Jordan never saw** (`NoteSection`, `#how-it-works`). The product's output as a **clipping** (`Clipping`): one line cut out of the resume on its own strip of paper, the neighbouring lines in a passing grey fading off the cut edges by mask, the marker across the line, the recruiter's note in the margin in Literata green with the pen's arrow. One link to the full report and the “Fictional example” tag. The line and the note are quoted from the sample report (`lib/marketing/jordan-example.ts`). Inside the strip only, the document's own Georgia face is allowed, as a document drawn in an illustration may mimic its own style.
4. **What we look for, line by line** (`HiringTruths`). Unchanged.
5. **Fix it. Then check it again.** (`RecheckSection`). The same clipping twice: the first report's Critical Miss with a faded marker, the revision's with the pen's “Changed. Up 6.”, then the version ladder in the same pen. The Critical Miss *changed*, never *fixed*; scores appear only as changes.
6. **The founder note** (`FounderNote`, `#about`). The founder mark (`public/founder-mark.webp`, Nov 5, 2026: a line drawing of a type, cap and round glasses and a smile, black line with the cap in the pen's green, no photograph; it replaced the green scribble likeness, which smudged at 8 to 12rem and read as a face) beside a note in the recruiter's hand, signed with the wordmark, then “How the report works”. No name, no profile link, no employer names. The disclosure that AI applies the criteria lives on the methodology page and in the legal content, not in the note.
7. **The close** (`CloseField`). The pile returns, pale, and one sheet takes an ink outline when the section is in view: yours. “Before you apply for the next one.” and the button. No dark band.

The rules the page set are now the site's ("The site system", above). On this page the primary button appears four times (header, pile, read, close) and never twice in one beat.

### Workspace and report

- The report is a marked-up resume (Nov 1, 2026; [spec](launch-readiness/72-signature-report-spec.md)): the Verdict and score band, then the candidate's quoted lines in Literata on the left (blue-ink rule; the Critical Miss line carries the highlighter), with the recruiter's pen notes in a right margin from 960px and beneath each line below it. Under the Critical Miss the candidate answers one to three questions and the revised line is their line plus their answers, word for word; Copy waits for the facts to check out. When it can't (W3, Nov 2, 2026), the note names the word in the person's own words ("“web app” isn't in your line or your answers, but “web application” is."), ends with the if-it's-true clause, and never suggests adding something untrue; the relationship check offers "Use my exact words". A signed-in report keeps the answers and the chosen line (stored once the line checks out), so a saved report reopened elsewhere shows the line and "Addressed"; its ending leads with "Save this version" and the re-check second, and the $29 button stays on pricing and in the paywall. One component and one document scroll serve the sample, a fresh, recovered or saved report, and the PDF follows the same order.
- **On the site system** (Nov 4, 2026, Phase 3 of the system wave; mocked and chosen by Matt): the upload is a sheet of paper you drop a resume onto or click (`components/upload/ResumeDropzone.tsx`, `Paper`), one line on it, "Choose a file" as a quiet action, paste and the sample as quiet links, the job posting a collapsed row, one button, and no card around any of it. Every Critical Miss in the report is the site's clipping (`markup/MarkedRows.tsx`): the quoted line on its strip with the lines around it from the person's own resume fading off the cut edges, the marker across it, the pen note in the margin with the arrow; the yellow miss sheet is gone and yellow is the marker on the line, nowhere else. A report carries one to three; on phones the first strip shows the line alone so the first question keeps its place on the first screen. The re-check (`report/ReadComparison.tsx`) is the homepage's object: last time's Critical Misses as dimmed clippings, now's beneath them, each with the recruiter's note, the Verdict quiet under each read, and the score only as a change ("Up 6 since last time."), never two numbers. The wait screen is unchanged: it already shows the person's resume on a sheet with the pen on the line being read. Settings is one column of rows on hairlines with the pass as five sheets, receipts as one line each, and delete last, outlined.
- **Both ends of the report** (Nov 5, 2026; Matt chose the directions from six sketches, `docs/design/2026-11-weak-and-strong.md`). The band has four rungs; the bottom one, `Not ready yet`, is the validator's lowest band at 60 and below, on the score alone (`lib/reports/score-band.ts`; Matt: "Band only"). A page on that rung gets the questions first (`components/workspace/report/AskFirst.tsx`): the band, then up to eight questions, each on its line as a clipping with the pen note, with `Write my report` and the skip; the report is then written again from the resume with the answers composed in (`lib/reports/ask-first.ts`), free, through the stream route's `rebuild` (`lib/reports/ask-first-rebuild.ts`), and its header says `written from N answers`. A page on the top rung with one miss never says Critical Miss: the first row is `The question they'd ask`, the rest `Worth tightening` under their own heading, and the ending points at the posting; the PDF follows. The same report component serves every state; the Report Lab has an `Ask first` state. The full recruiter notes disclosure and the interview-style questions after the fixes are gone (Matt, Nov 5, 2026): the report is the Verdict, the band, the marked page, the rewrites it offers on other lines, Keep, role fit, the score note and the ending.
- **The worklist report** (Nov 6, 2026; Matt chose the shape on Nov 5 from two sketches, `docs/design/2026-11-worklist-report/`; the build record is `build.md` there): the score beside its rung, the verdict, the recruiter's write-up in the pen, then one card per line that needs work in the order a recruiter hits them (`components/workspace/report/worklist/`). A card is a bordered block on the ground, never paper; inside it the quoted line is the site's clipping with the marker across it (the only place the highlighter appears), a structural item is the pen's dashed statement, what a recruiter can't tell is the pen's note, the example is the line in Literata with the blanks and the answers in the candidate's blue, and the question labels one field per blank. The keep card carries the pen's tick and the blue-ink rule instead of the marker. Phone first: one column throughout; the fields pair up from 640px. The PDF prints the same order. Reports saved before Nov 6 keep the marked-page layout above.
- Put the likely takeaway, exact evidence, and next useful action first.
- Use a quiet shared header, regular-weight introduction, warm form/report sheet, and dark primary action. Report body is 16px/25px.
- Preserve file/paste modes, optional job context, generation, missing-fact entry, comparison, history, save, and export behavior.
- Density may increase, but hierarchy must stay calm. Operational errors are not resume findings.
- Scores support judgment; they do not replace it.
- After the fixes, "Why we read it this way" links each of the four parts the score weighs to the research behind it, as pen margin notes that open in a new tab (`components/workspace/report/ResearchReceipts.tsx`, Nov 2, 2026). It stays below the first screen so the Critical Miss keeps its place.

### Research

- Research is the trust layer, not a blog. Prose uses 18px/30px on the 52ch reading rail (about 69 characters per line), with readable figures and labeled tables.
- Articles open the way their hub row does (Nov 1, 2026): the reader's question as the H1 (the same string as the hub and the search title), the answer in Literata and pen with its study linked, and an optional margin note. One bridge to the report sits where the advice is; there is no FAQ block or key-finding card. `web/components/research/AnswerArticle.tsx`, documented in `web/app/(editorial)/research/article-standard.md`.
- The bridge is a note in the margin (Nov 4, 2026; `components/research/ArticleBridge.tsx`): the recruiter's question in the pen with the arrow, then a text link. It replaced a bordered card with a button inside the body, because a chapter carries one object and a text link and the big button belongs to the close (the site system, §10). Marginalia stays in figures and this one note; the research-grade article pages measured on Nov 4 (Our World in Data, Linear, Stripe, Baymard, The Pudding) open in 90 to 130 words and put annotation inside figures, never in the prose margin.
- **How the report works** (Nov 4, 2026; `app/(editorial)/methodology/page.tsx`): cut to the density rule on the site rhythm. The disclosure in the opening deck, then one part of the report per section with one object each: the Verdict as the report prints it, the band (`ScoreBand`) with the four parts it weighs, the Critical Miss as a clipping of Jordan's line with the report's own question in the margin, the facts rule, what it can't tell you, the signed note (its second and last appearance), and the research-method note with the two sources, keeping the `#how-we-write-research` anchor every article links to. The FAQ, the product cards, the key-finding card and the annotated sample diagram went. Methods explained by Linear's Method and Shape Up run 15 to 85 words a section with no diagrams; "what it can't tell you" is the section no precedent has.
- One left content edge (Nov 1, 2026): the header, the lead figure, and the reading rail start at the container edge; figures may run wider than the rail, to the right.
- A citation jump lands below the fixed header (`.riyp-jump-target`), marks the source in pen tint, and moves focus there.
- Start with a concrete recruiter or hiring claim.
- Show what the evidence supports, what remains uncertain, and what the reader can do with it.
- Prefer diagrams, comparisons, annotated processes, and source-backed teaching surfaces when they materially improve understanding.
- Never expose internal evidence-strength labels as consumer-facing taxonomy.

### Pricing, auth, trust, and legal

- **Pricing** (Nov 4, 2026; `components/marketing/PricingPageClient.tsx`): the reports as sheets. One `Pile` of one lifted sheet, outlined, for the free report, and one of five for the Job Search Pass, each with its name, its price, one line from `lib/billing/pricing.ts`, and its one button (the free report filled, the pass outlined; "Passes are paused for now", disabled, while billing is closed). Then the terms a buyer needs before paying, one plain line each on a hairline: one payment and no renewal, Stripe holds the card, the 14-day refund, what stays open after the fifth report. One closing section carries the comparison link and "Restore access". Billing copy stays plain: no pen, no marker, no example demos. On phones the two offers sit side by side with smaller sheets and the buttons stack under both, so both actions stay in the first screen (`tests/ui/pricing-mobile.spec.ts`). Direction A of three mocked on Nov 4 (the sheets; a plain list with no props; today's cards as paper), chosen by Matt; the fifteen pricing pages measured that day put the billing cadence under the price and bury refunds, and this page puts every term beside the price.
- **After the offer** (Nov 4, 2026; `app/(editorial)/guides/page.tsx`, `components/guides/GuideOpening.tsx`): the hub is three rows on hairlines (title, one line, the way in), the way the research hub lists its questions, then the questions behind them as hub rows; no cards. Each guide opens with the eyebrow, the title, our take as the one short paragraph, the quick start as three numbered rows, and one link; the guide body (sections, scripts, disclosures, figures) is unchanged this wave. The sample report keeps its frame (the raw report, labelled once, one button in its header row, which is what the sample pages measured on Nov 4 do); its first screen changes with the workspace in Phase 3.
- **Help** (Nov 4, 2026; `components/legal/HelpPage.tsx`): the legal nav, then every question visible under a plain heading per group on the site rhythm, no accordion, and a closing section, "Didn't find it? Write to a person.", with the address inline. The help indexes measured that day use plain headings or cards, never an accordion, and put contact at the bottom; none shows the address, so this page does. Privacy and Terms keep `LegalShell` until they are rebuilt.
- **Sign-in** (Nov 4, 2026; `app/auth/page.tsx`): bare. The wordmark as the only chrome, one narrow column on the ground, no card, the context headline, the form, and one quiet line under it ("No password. The code works once and expires soon."). The sign-in pages measured that day carry 20 to 90 words, no navigation and no decoration; Matt chose bare over a page under the site header. The flow, its labels and its copy are unchanged.
- Use the shortest, clearest version of the system.
- Keep claims factual and traceable to real behavior.
- Avoid invented urgency, inflated privacy language, and decorative brand performance.

## 11. Motion

Canonical tokens (CSS in `web/app/globals.css`, mirrored for Motion in `web/lib/animation.ts`; change both together):

| Token | Value | Use |
| --- | --- | --- |
| `--duration-fast` / `DURATION.fast` | 160ms | hover, press, link color, focus, dialog exit |
| `--duration-normal` / `DURATION.normal` | 200ms | selection, toggles, dialog entry, disclosure |
| `--duration-slow` / `DURATION.slow` | 520ms | the signature move only: the highlighter sweep and the homepage stage shift; the fades that follow a gesture |
| `--duration-gesture` | 560ms | one stroke of the pen or the marker (Nov 4, 2026): the circle, the marker's passes, the clipping's sweep on phones |
| `--delay-gesture` | 700ms | the pause before what follows a mark: the margin note after the marker, the choices after the pen, the outline on the sheet that is yours. Longer waits are multiples of it (`calc(var(--delay-gesture) * 2)`) |
| `--ease` / `EASE` | `cubic-bezier(0.22, 1, 0.36, 1)` | every transition; no `ease-out`, `ease-in-out`, or one-off curves |
| `--ease-pen` / `--ease-marker` | `cubic-bezier(0.45, 0, 0.25, 1)` / `cubic-bezier(0.3, 0, 0.15, 1)` | the hand's two strokes only: a quick loop that slows into its close, and a flat marker pass |

Use Tailwind `duration-fast`, `duration-normal`, `duration-slow`, and `ease-snap`, never numeric durations. Motion should clarify selection, real progress, or continuity. Animate `opacity`, `transform`, and color properties. Reading, errors, and essential content never depend on motion. The homepage note arriving on the resume is the one signature, once. The highlighter marks the miss in the one-sentence verdict. In the report, the highlighter sweeps the Critical Miss line once as it comes into view and the pen note fades in after it (`Mark` and `useSeen` from the figure kit); nothing else in the report moves, and report prose stays still. Reduced motion shows the same end state immediately.

### Links

One underline offset (`--link-offset`, 0.24em) and one thickness (`--link-thickness`, 1px) everywhere. Color says which kind of link it is:

| Kind | Class | Rest | Hover |
| --- | --- | --- | --- |
| Inline | `.riyp-link` | ink text, pen underline at 40% (`--link-line`) | pen-strong text, full underline |
| Quiet | `.riyp-link-quiet` | inherited muted text, ink hairline at 22% (`--link-line-quiet`) | ink text, full underline |
| Navigation | header, footer, and menu lists | no underline | ink text, underline appears |
| Prose | `.riyp-prose` container | unclassed links get the inline treatment | same as inline |

Inline links are for links inside sentences and standalone text actions. Quiet links are for sources, legal and support asides, and metadata. Primary actions are buttons, not links. Underlines use the same offset in every CSS module (`text-underline-offset: var(--link-offset)`); never hand-tune `underline-offset-*` or `decoration-brand/NN` per surface. Color transitions use `--duration-fast`. Focus uses the shared `focus-ring` (2px pen outline), never an underline change alone.

### Interaction grammar

Everything you can click answers the same way, at `--duration-fast` on the shared curve (Nov 1, 2026). Before this, hover differed by surface (ink at 90%, ink at 88%, a gray fill, an underline, a pen-colored border, or nothing on the FAQ rows), and only Button had a press state.

| Thing | Hover | Press | Implementation |
| --- | --- | --- | --- |
| Buttons | fill shifts to 88%; outline turns ink; quiet underline goes solid | scale 0.98 | `components/ui/button.tsx` |
| Links | color deepens and the underline goes solid | none | `.riyp-link`, `.riyp-link-quiet`, navigation classes |
| Rows and cards you can open (FAQ questions, menu rows, legal tabs, guide cards, related research, saved reports) | an inset wash; the row's arrow or caret turns ink | a deeper wash | `.riyp-surface-link`; mark the arrow `data-affordance` |
| Close and menu controls | the inset wash | the deeper wash | `Button` `icon` size, or `.riyp-surface-link` on Radix close buttons |

Static cards (`.app-card`) never react. Don't hand-tune `hover:bg-*`, `hover:border-*`, `hover:opacity-*`, or arrow nudges on new work; the guardrail caps the ones left.

### Shared interaction implementation

The September 13 motion pass uses these shared primitives across the product:

- `web/lib/animation.ts` mirrors the CSS tokens through `UI_TRANSITION` and `UI_TRANSITION_FAST`. Shared selection indicators move; report prose stays still.
- `AppProviders` supplies the Motion features required by existing `m` components. `web/hooks/use-reduced-motion.ts` subscribes to preference changes without remounting forms or losing entered text.
- `ActionFeedback` reserves the space for short idle, pending, and success labels. Only the current state is exposed to assistive technology; hidden sizing copies do not animate. `Button` accepts `loadingLabel` while keeping its idle children stable.
- Copy, save, parse, and export feedback follows the actual operation. Success appears only after confirmation, failures stay actionable, and repeated actions cancel stale feedback timers.
- Radix owns dialog, sheet, menu, and popover focus and dismissal. Shared CSS provides `--duration-normal` entry and `--duration-fast` exit. Native `ui-disclosure` details progressively animate intrinsic size where supported; their readable fallback and keyboard semantics remain intact.
- Reduced motion updates immediately, including a preference change while the page is open. Essential content is visible before JavaScript; the interface adds no decorative stagger or artificial waiting period.

The interactive examples in `/internal/system-lab` show these states explicitly. That reference remains protected from public production access.

### Signature behavior: Lifted Trace

`web/components/shared/LiftedTrace.tsx` is the canonical cross-surface provenance and process rail. Its segments represent real states, not decoration:

1. source evidence
2. open question or interpretation
3. candidate-supplied fact
4. resolved wording or action

Pen identifies current evidence and marks completed segments (Nov 2, 2026; the trace no longer completes in citron); completed states use explicit wording or icons. There is no neon completion requirement. On narrow screens the same sequence becomes a vertical rail. Labels remain visible without motion or color.

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
- style budgets (`web/scripts/qa/design-system-budgets.mjs`): more than 12 text roles; a Tailwind size key that doesn't resolve to a role; a weight other than 400, 600, or 800; a raw `font-size` or `text-[…px]` outside the roles; more than 5 Button variants or 4 sizes, a Button size that isn't 44/48/60px, or any hand-built pill; more than 7 corner radii or 5 shadows; more ad-hoc hover utilities, `leading-*` overrides, or legacy type utilities than the recorded counts; a shared reading rail over 75 characters per line

The rendered check loads 23 public routes at 1440 and 390px and fails on an off-scale or fractional size, a weight outside 400/600/800, more than 40 text styles, more than one build of the primary action per size, or a paragraph inside a reading rail over 75 characters per line. Paragraphs a page lays out outside the rail are listed as warnings:

```bash
npm run qa:design-system -- --measure http://127.0.0.1:3100
```

## 14. Final quality test

Before shipping, ask:

1. Is the most useful thing obvious in three seconds?
2. Does this make the candidate's real work clearer without inflating it?
3. Is the copy something a thoughtful human would actually say?
4. Does every visual teach, orient, or prove something?
5. Are the system's evidence cues used consistently?
6. Does this unmistakably belong to the same product as the homepage and report?

If any answer is no, the surface is not finished.
