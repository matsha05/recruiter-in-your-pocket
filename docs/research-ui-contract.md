# Research UI Contract (v7.0 - Highlighter)

Applies to: Research hub and all Hiring Research Library articles.

Purpose: Research pages make trustworthy resume advice useful. Evidence should be visible, visual, and connected to a real candidate decision.

Design intent:
- Quiet authority, not academic stiffness.
- Illustration, diagrams, and motion are encouraged when they explain.
- Every visual move must increase clarity, recall, or trust.
- The page should feel designed, not templated.

---

## 1. Surface Types

### Research Hub (Index)
- Purpose: answer the questions people ask, fast, and route readers into the underlying sources. It is a reference page, not a landing page (Nov 6, 2026).
- Form: an opening that says what the page is, three findings drawn from their articles' own figures, then the index: search, plain topics, and one row per question with the short answer and what it rests on.
- Required: every finding and every row names its source and sample; every featured claim links directly to its primary study or current platform documentation.
- Not allowed: evidence-strength badges, apology labels, card grids, or a long column of undifferentiated prose.

### Research Articles (Evidence records)
- Purpose: credibility and clarity.
- Form: editorial prose with a key finding, figures, and sources.
- Allowed: lead figure, inline diagrams, and short motion moments tied to the insight.
- Not allowed: feature marketing layouts or dashboard UI.

---

## 2. Core Principle

Research pages are evidence experiences. The finding leads; design makes the finding easier to understand and remember. If a visual element does not teach, it is wrong.

They should feel like:
- A lucid evidence desk
- A high-craft product explanation
- An expert explainability layer for the product

They should not feel like:
- A sales landing page
- A marketing infographic dump
- A SaaS dashboard

---

## 3. Visual Language

### Typography and Layout
- Headlines and large findings use Schibsted Grotesk (800). Body, labels, controls, and data use Schibsted Grotesk (body 400, controls and labels 600). Quoted resume lines and recruiter verdicts use Literata through the shared editorial token.
- Use the exact type roles, weights, tracking, and leading defined in `docs/design-system.md`. Research does not have a separate editorial font system.
- Favor whitespace, clear sectioning, and tight editorial hierarchy.
- Use lists and rules to structure reading flow.
- Prose uses 18px/30px at about 66ch. Tables use 14px/22px with labeled numeric columns. Report excerpts remain readable at 16px/25px rather than marketing-preview scale.
- Use the Highlighter materials: white paper sheets on a neutral ground, quiet headers, the pen for emphasis, highlighter yellow only to mark a quoted line a recruiter would miss, dark pill actions, 18px sheets.

### Color Contract
Primary palette:
- `--foreground` for text and primary strokes
- `--text-muted` / muted foreground for supporting text and labels
- `--line` for subtle dividers; the stronger control boundary identifies inputs
- `--pen` (aliased by `--brand`) for readable links, focus, active evidence, and key findings
- `--pen-tint` (aliased by `--surface-sky` / `--brand-tint`) for quiet explanatory fields
- `--highlight` for a quoted line a recruiter would miss; `--annotation` maps to the pen
- Cyan-bright, teal, apricot, and assessment names are compatibility aliases into the Highlighter palette. Citron #c8f238 and its butter alias remain explicitly permitted for compatibility, not general action or header colors.

Allowable accent usage:
- The pen for readable emphasis, links, and data focus; `--pen-strong` for hover. Pair selection/completion with explicit labels or icons.
- Ink for dark pill primary actions; neutral surfaces for evidence; the pen tint when grouping adds meaning.
- Heatmaps are allowed only when raw spatial data is available; illustrative attention maps are prohibited.
- Gradients should not be introduced for atmosphere.

Research uses ground #f4f4f1, paper #ffffff, inset #e9eae6, ink #111513, muted #5a605c, pen #1f5a46, pen tint #e6f0eb, highlighter #ffe14d, divider #dfe0dc, and control boundary #808983. Use shared semantic tokens rather than route-local values. Keep diagnostic findings distinct from operational errors and preserve success, warning, and error semantics.

---

## 4. Illustrations and Motion

Illustrations are encouraged when they clarify an idea, reduce cognitive load, or make a research concept tangible.
Diagrammatic illustrations are first class. They should look like product design artifacts, not blog graphics.

Rules:
- Illustrations must encode meaning, not decoration.
- One signature motion moment per article is allowed.
- Motion must resolve to a static, readable state.
- No infinite loops, no ambient shimmer, no attention traps.

Motion budget:
- Micro transitions: 150 to 250ms
- Figure reveals: 350 to 700ms
- Line draw or heatmap fade: up to 1.2s if it teaches

---

## 5. Figures and Diagrams

Figures are the primary place where visual expression is encouraged.

### Visual Style
- Strokes: 1px or 1.5px.
- Corners: 10px for fields, 12px for inset figures, 24px desktop/16px mobile for main sheets. Primary actions are pills; not every utility control is a pill.
- Fills: flat or subtle gradients inside figures only.
- Shadows: a single soft shadow is allowed inside a figure to create depth or separation.
- Backgrounds: transparent or `--background`.
- Annotations: callout chips, underlines, and highlighter bars are allowed if they map to the insight.

### Typography in Figures
- Axis labels: Schibsted Grotesk, normally at least 12px at actual display size, muted foreground, tabular numerics where numbers appear.
- Data labels: Schibsted Grotesk, 12-14px, foreground, tabular numerics where numbers appear.
- Figure caption: Schibsted Grotesk, 14px/22px, muted foreground.
- Key conclusion callout: Schibsted Grotesk 700, 24px/30px, with readable supporting detail.

### Figure Labeling
Every figure must include:
- Figure number: "Fig. 1" (Schibsted Grotesk, 12px, weight 600, muted foreground, tabular numerics)
- Caption: one sentence explaining what the figure shows

Captions can live under the figure or inside the figure if the layout demands it.

---

## 6. Evidence and Citations

Research credibility is a product feature. If it cannot be cited, it does not ship.

Rules:
- All factual claims in research articles and figures must have citation markers and sources.
- The hub may use numeric claims only when the source, sample, comparison, and direct link are visible in the same finding.
- Documented recruiter practice can be used, but must be labeled plainly as recruiter practice rather than presented as published research.

### Anecdotal and Field Notes
Anecdotes are allowed when clearly labeled. They must be qualitative, not quantitative.
- Label: "Recruiter practice" or "Field note".
- No numbers unless backed by a Tier-1 or Tier-2 source.

Citation content and source quality follow `docs/source-quality.md`. Figure structure and visual behavior follow `docs/design-system.md`.

---

## 7. Page Anatomy

### Research Hub
- An opening that says what the page is and how many questions it answers
- Three findings, each drawn from its article's own figure data
- Direct source and sample details beside each finding and on every index row
- The index: search, topic jump links, one row per question
- Corrections to common resume folklore
- Topic library
- Product translation

### Research Articles
- Back to Research
- Category label, title, subtitle, metadata
- Key finding excerpt
- Figures and narrative sections
- Product tie-in
- Sources and notes

### Cross-surface fidelity
- The Highlighter homepage and shared product contract govern the visual system. Old baseline captures document migration gaps, not competing reference designs.
- Research shares the warm header, wordmark, Schibsted Grotesk / Literata tokens, neutral ground with pen and highlighter, line weights, softened geometry, dark pill actions, and footer. Reading density varies intentionally.
- The research index and every article must be checked at 390, 1024, and 1440 pixels.
- Shared article and diagram primitives are the source of truth. Route-level overrides may explain a specific idea, but may not introduce a competing visual system.

---

## 8. Prohibited UI Patterns

Avoid anything that reads as marketing chrome:
- Decorative icons or mascots with no informational role
- Badge stacks and pill chips used as adornment
- Evidence-strength tags such as “limited,” “moderate,” or “varies” in the primary hierarchy
- Card grids for navigation
- Glassmorphism, glows, or ambient blur at the page level
- Infinite animations

---

## 9. Source Quality Standards (Mandatory)

All citations must link to verifiable, accessible content. Broken links or unverifiable claims are blockers.

### Tier-1 Sources
- Peer-reviewed journals, DOI links
- Government or academic institution reports
- Official platform data (LinkedIn Newsroom, Economic Graph)
- Current official platform documentation for operational product behavior

### Tier-2 Sources
- Reputable industry reports with clear methodology
- Top-tier consultancies with primary data

### Prohibited
- Marketing blogs
- Aggregators without primary citations
- Generic landing pages
- Broken links or paywalled stats without mirrors

If a strong source does not exist, remove the claim from the featured experience. A caveat is not a substitute for better evidence.

---

## 10. Enforcement Checklist

Before merge, every research page must pass:
- No marketing layout patterns
- Figures are labeled and captioned
- Motion is purposeful and non-looping
- All claims are cited
- No retired font pairing, iris/teal-first/premium color system, atmospheric gradient, or glass treatment; Literata is approved only for quoted lines, verdicts, and margin notes
- Any anecdotal callout is labeled and qualitative
- No legacy palette utility relies on a scoped compatibility override
- No horizontal overflow at 320 or 390 pixels
- Header, footer, CTA, and article shell match the Highlighter system
- Visible keyboard focus, labeled controls/errors, 44px targets, sufficient text/graphics contrast, and reduced-motion behavior remain release requirements
- Check actual display-size figure labels, long titles, 200% zoom, and narrow layouts; screenshots alone do not prove accessibility

Restraint is still the baseline. Use visual craft to deepen understanding, not to decorate.

---

The diagram contract now lives in `docs/design-system.md`; do not create a second visual system for Research.
