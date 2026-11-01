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
- homepage story: `web/components/landing/home/VerdictHero.tsx` (with `NoteReveal.tsx`), `WorkedExample.tsx` (the How it works target), `SilenceSection.tsx`, `HiringTruths.tsx`, and `ProgressBeat.tsx`

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

Every piece of text on the site uses one of eleven roles (Nov 1, 2026). The production audit counted 121 text styles, 31 sizes (some fractional, such as 13.76 and 100.8px), and weights from 400 to 800; the roles replace all of them. Sizes are whole pixels and step at breakpoints instead of scaling with `clamp()`, so a heading is the same size everywhere it appears at a given width.

| Role | Phone (<768px) | 768px and up | Weight and family | Use |
| --- | --- | --- | --- | --- |
| `display` | 44 / 44 | 64 / 64; 72 / 72 from 1280px | 800 Schibsted, -0.045em | marketing tier: the homepage headline only |
| `headline` | 36 / 40 | 48 / 52 | 800 Schibsted, -0.04em | content tier: page titles on research, guides, pricing, legal, errors; marketing section titles |
| `title` | 28 / 34 | 32 / 38 | 800 Schibsted, -0.03em | app tier: workspace, report, account, and auth page titles; article h2; big numbers |
| `heading` | 24 / 30 | 24 / 30 | 600 Schibsted, -0.02em | section and card headings, report section titles |
| `lead` | 18 / 30 | 20 / 30 | 400 Schibsted | a page's deck or introduction |
| `prose` | 18 / 30 | 18 / 30 | 400 Schibsted | research and guide reading (18px / 30px) |
| `body` | 16 / 25 | 16 / 25 | 400 Schibsted (600 for emphasis and controls) | report, app, and marketing body (16px / 25px) |
| `small` | 14 / 22 | 14 / 22 | 400 or 600 Schibsted | tables, navigation, metadata, compact controls |
| `label` | 13 / 18 | 13 / 18 | 600 Schibsted (400 for captions) | labels, captions, footnotes; the 13px floor |
| `verdict` | 20 / 30 | 24 / 34 | 400 Literata | the Verdict, quoted resume lines, the recruiter's longer answers |
| `note` | 16 / 25 | 16 / 25 | 400 Literata, italic for margin notes | pen notes, figure notes, short quoted findings |

Rules:

- Three headline tiers, so hierarchy follows importance: marketing 72 (the homepage), content 48, app 32. Nothing outranks the homepage headline; the 404 and the research index use the content tier.
- Three weights: 800 for display, headline, and title; 600 for headings, controls, labels, and bold text (`strong`, `b`, and `th` are 600, not the browser's 700); 400 for reading. Tailwind's `font-medium` and `font-semibold` both mean 600, and `font-bold` means 800.
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
| Miss ink | `#6b5400` | `--brass` (aliased by `--premium`, `--warning`); text on or beside yellow |
| Divider | `#dfe0dc` | `--line`; nonessential grouping rules |
| Control boundary | `#808983` | `--control-line` / `--input`; identifiable input boundaries |

Store HSL components in tokens consumed by `hsl(var(...))`; never put a hex value inside those slots. Older names (`--brand`, `--surface-sky`, `--cyan-bright`, `--teal-bright`, `--accent-apricot`, `--assessment-*`, `--premium`, `--gold`, `--amber`) are aliases into this palette so existing utilities follow it. `--citron` / `--accent-butter` remain compatibility tokens only.

Rules (a recruiter's desk of pens, Matt, Oct 31, 2026): ink for actions; green pen for anything the recruiter says or points at; blue ink for the candidate's own work and numbers; red pen (`--destructive`) only for problems and destructive actions, never decoration; yellow only for the Critical Miss and highlighted resume lines. Charts and comparisons use `--chart-1`…`--chart-4` in that fixed order, never cycled; a fifth series folds into "Other" or small multiples. Within one view a color means one thing: in the offer calculator it means the kind of pay (base, equity, bonus, one-time), so offers are told apart by name. Data labels and values stay in text ink, never the series color. Two hands on one page: anything quoted from the candidate's resume wears a blue-ink rule (the Critical Miss quote keeps the highlighter instead); the recruiter's notes, approvals ("Don't touch this one", "What keeps working"), and suggested wording wear the green pen; what is missing wears the red pen. Single-series charts use `--chart-1`. Guides wear the pen only for suggested wording (the "What you can say" box) and figure pen notes; their headlines, rules, section numbers, and labels stay ink or muted, and the guardrail checks it (Nov 1, 2026). Meaning is global, so color is spent only on meaning: pen colors mark text and mean the same thing on every page; chart colors live only inside a chart with a legend, which scopes them; a multi-series chart never shares a view with pen marks; and navigation, categories, tags, and pillars are never color-coded (they use position, numbering, and names). The research pillars were tried in chart colors on Oct 31 and rejected for exactly this reason: blue would have meant both "your words" and "Perception". Success, warning, destructive/error, and disabled roles remain distinct. Operational failures must be visually and verbally separate from resume findings. Pair color with labels, icons, position, or wording; never rely on color alone.

Dark mode has its own values: ground `#111412`-range ink-green, paper slightly lifted, pen lightened to a readable mint, and the highlighter becomes a deep olive mark under light text. Print uses white paper. Dark mode chart steps are lifted separately (`#5b80e6` `#3a9a6e` `#a06cc0` `#d9731a`) and validated against the dark sheet. Avoid gradients, glow, and grain.

Surfaces are paper on a desk: white sheets on the neutral ground, hairline borders, 18px radius for sheets and 10-12px for insets, no drop shadows. Motion is quiet (160-200ms, one shared curve) except one signature move: the highlighter sweeps across a line, then the note writes in. Reduced motion shows the same end state immediately.

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

The upload surface uses a compact file picker instead of a desktop-sized drop area. After a file is read, "What we read" shows the extracted text before the run, and text under 200 characters can't start a report (the server rejects it too) (Nov 1, 2026). The report uses one 44px row of section controls and 16px reading gutters, with its main takeaway before score context. Public and app navigation use one drawer, `components/layout/NavDrawer.tsx` (Nov 1, 2026): it opens from the right under its trigger at `min(88vw, 22rem)`, with the wordmark, text rows, and a Phosphor trigger and close, and it keeps the close control visible and scrolls its links on short screens. Research introductions and cards use tighter spacing while retaining readable prose and source links. Review these choices at 320, 390, and 430px, and check landscape/reflow navigation separately; absence of horizontal overflow is not visual approval.

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
- **The score is a number, not a color.** `ScoreBadge` shows the score in ink with "/100". No green, gold or red bands and no band labels; the written Verdict carries the judgment.
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

Every interactive component defines, when relevant: default, hover, active, focus-visible, disabled, loading, selected, error, and pending. System Lab exposes actual primitives in these states, not imitation controls. Preserve entered content after recoverable failures. Loading describes real operational state without invented percentages or timed completion. The report wait screen shows elapsed time and the stage the stream reports (`stage` events: sending, reading, writing, checking, or a retry); a step is done only when the stream moves past it (Nov 1, 2026).

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

### Homepage

- Headline: “They called someone back. It wasn’t you.” One dark primary action (“Get your free report”, the one name for starting a report; see `copy-system.md` §1) and one quiet secondary route (“See Jordan’s report”).
- The story runs in five beats (Matt, Nov 1, 2026): the hidden verdict (hero); the worked example (the note, explained); the silence (a fading “No response” list); “What we look for, line by line”; and the re-check (“Fix it. Then check it again.”). The hero's screen shows the stage (“Not moving forward”) and the note; the rejection email line was cut so the help arrives one beat sooner.
- The worked example opens with the one-sentence read (Literata, the section's one highlighter on the miss), then the line behind it on a blue-ink rule, the reviewer's note in pen, and the report's own questions with Jordan's answers as labeled blanks (“Blank on purpose”). The read (the sentence the report prints under its Verdict), the line and the questions are quoted word for word from the sample report, which is real output on Jordan's fictional resume; regenerate the sample and update the quotes together when the prompt changes. It carries a “Fictional example” tag and ends with “What would they think of yours?” The revised line joins as a fourth step only when the answer-to-line feature ships (plan 2.2); until then the homepage promises no rewrite.
- The re-check beat is a miniature of the real comparison and Progress views, tagged as a fictional example: the Critical Miss *changed*, never *fixed*, and scores appear only as changes (“Up 6”).
- The hero resume is fictional and deliberately ordinary, drawn as a printed document; inside this illustration only, the document's own Times face is allowed, as a resume drawn in an illustration may mimic its own style. The reviewer note on the recruiter's screen starts blurred and stays hidden from assistive technology; the worked example carries its words as text.
- The note arrives once; reduced motion shows it in place. It clears once (blur to none on `--duration-slow`) when the visitor has scrolled past 48px and the card is fully in view: right away on a laptop, once the card scrolls up on a phone. Reduced motion clears it without a transition; without JavaScript it stays blurred. The illustration must not gate the report action.
- Below 1200px the hero stacks (headline and actions, then the illustration at its desktop size) so the 64 and 72px headline never wraps in a narrow column; below 640px the actions go full width.
- The preview bridges to the same working report grammar, not an independently styled promise.
- Maintain one dominant action and one supporting route.

### Workspace and report

- Put the likely takeaway, exact evidence, and next useful action first.
- Use a quiet shared header, regular-weight introduction, warm form/report sheet, and dark primary action. Report body is 16px/25px.
- Preserve file/paste modes, optional job context, generation, missing-fact entry, comparison, history, save, and export behavior.
- Density may increase, but hierarchy must stay calm. Operational errors are not resume findings.
- Scores support judgment; they do not replace it.

### Research

- Research is the trust layer, not a blog. Prose uses 18px/30px on the 52ch reading rail (about 69 characters per line), with readable figures and labeled tables.
- One left content edge (Nov 1, 2026): the header, the lead figure, and the reading rail start at the container edge; figures may run wider than the rail, to the right.
- A citation jump lands below the fixed header (`.riyp-jump-target`), marks the source in pen tint, and moves focus there.
- Start with a concrete recruiter or hiring claim.
- Show what the evidence supports, what remains uncertain, and what the reader can do with it.
- Prefer diagrams, comparisons, annotated processes, and source-backed teaching surfaces when they materially improve understanding.
- Never expose internal evidence-strength labels as consumer-facing taxonomy.

### Pricing, auth, trust, and legal

- Use the shortest, clearest version of the system.
- Keep claims factual and traceable to real behavior.
- Avoid invented urgency, inflated privacy language, and decorative brand performance.

## 11. Motion

Canonical tokens (CSS in `web/app/globals.css`, mirrored for Motion in `web/lib/animation.ts`; change both together):

| Token | Value | Use |
| --- | --- | --- |
| `--duration-fast` / `DURATION.fast` | 160ms | hover, press, link color, focus, dialog exit |
| `--duration-normal` / `DURATION.normal` | 200ms | selection, toggles, dialog entry, disclosure |
| `--duration-slow` / `DURATION.slow` | 520ms | the signature move only: the highlighter sweep and the homepage stage shift |
| `--ease` / `EASE` | `cubic-bezier(0.22, 1, 0.36, 1)` | every transition; no `ease-out`, `ease-in-out`, or one-off curves |

Use Tailwind `duration-fast`, `duration-normal`, `duration-slow`, and `ease-snap`, never numeric durations. Motion should clarify selection, real progress, or continuity. Animate `opacity`, `transform`, and color properties. Reading, errors, and essential content never depend on motion. The homepage note arriving on the resume is the one signature, once. The highlighter marks the miss in the one-sentence verdict. Report prose stays still. Report prose stays still. Reduced motion shows the same end state immediately.

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

Pen identifies current evidence; completed states use explicit wording or icons. There is no neon completion requirement. On narrow screens the same sequence becomes a vertical rail. Labels remain visible without motion or color.

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
- style budgets (`web/scripts/qa/design-system-budgets.mjs`): more than 11 text roles; a Tailwind size key that doesn't resolve to a role; a weight other than 400, 600, or 800; a raw `font-size` or `text-[…px]` outside the roles; more than 5 Button variants or 4 sizes, a Button size that isn't 44/48/60px, or any hand-built pill; more than 7 corner radii or 5 shadows; more ad-hoc hover utilities, `leading-*` overrides, or legacy type utilities than the recorded counts; a shared reading rail over 75 characters per line

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
