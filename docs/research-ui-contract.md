# Research UI Contract (v5.0 - Lifted Line)

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
- Purpose: show the strongest findings, explain the hiring system, and route readers into the underlying sources.
- Form: one decisive opening, an evidence diagram, visual findings, myth corrections, then the library.
- Required: every featured claim must link directly to its primary study or current platform documentation.
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
- Headlines and large findings use Space Grotesk Variable; body, labels, controls, and data use Instrument Sans.
- Use the exact type roles, weights, tracking, and leading defined in `docs/design-system.md`. Research does not have a separate editorial font system.
- Favor whitespace, clear sectioning, and tight editorial hierarchy.
- Use lists and rules to structure reading flow.
- Use the same rectilinear report grammar as the approved homepage and report references: ink structural chrome, warm chalk fields, pale-cyan teaching surfaces, and one restrained citron completion cue where it carries meaning.

### Color Contract
Primary palette:
- `--foreground` for text and primary strokes
- `--muted` for supporting text and labels
- `--border` for dividers and figure frames
- `--brand` (deep cyan) for recruiter insight, action, active evidence, and key findings
- `--cyan-bright` for small active indicators and 2px rules only
- `--citron` for acquisition, selection, and completed evidence
- `--surface-sky` for explanatory fields and evidence stages
- `--annotation` for consequential edits or omissions; it maps to readable deep cyan

Allowable accent usage:
- Deep cyan for readable emphasis, links, and data focus.
- Citron for a single completed or selected state, never as general decoration.
- Heatmaps are allowed only when raw spatial data is available; illustrative attention maps are prohibited.
- Gradients are not part of the Lifted Line reference system and should not be introduced for atmosphere.

Research content should remain mostly warm white and graphite, with pale sky used to distinguish diagrams and proof fields.

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
- Corners: 4 radius for UI elements, up to 12 radius inside figures when it improves legibility.
- Fills: flat or subtle gradients inside figures only.
- Shadows: a single soft shadow is allowed inside a figure to create depth or separation.
- Backgrounds: transparent or `--background`.
- Annotations: callout chips, underlines, and highlighter bars are allowed if they map to the insight.

### Typography in Figures
- Axis labels: Instrument Sans, 10px, uppercase, `--muted`, with tabular numerics where numbers appear.
- Data labels: Instrument Sans, 11px, `--foreground`, with tabular numerics where numbers appear.
- Figure caption: Instrument Sans, 12px, `--muted`.
- Key conclusion callout: Space Grotesk Variable, 24 to 40px, with Instrument Sans supporting detail.

### Figure Labeling
Every figure must include:
- Figure number: "Fig. 1" (Instrument Sans, 10px, uppercase, muted, tabular numerics)
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
- Human opening with a clear point of view
- First-read system diagram
- Three to five findings strong enough to change the product
- Direct source and sample details beside each finding
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
- The approved landing, workspace, report, and pricing reference images are visual contracts, not inspiration.
- Research must use the same header height, wordmark treatment, font pairing, ink/chalk/cyan/citron palette, line weight, radius language, action treatment, and footer as those references.
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
- No retired serif, iris, teal-first, premium-color, gradient, or glass treatment
- Any anecdotal callout is labeled and qualitative
- No legacy palette utility relies on a scoped compatibility override
- No horizontal overflow at 320 or 390 pixels
- Header, footer, CTA, and article shell match the approved Lifted Line references

Restraint is still the baseline. Use visual craft to deepen understanding, not to decorate.

---

The diagram contract now lives in `docs/design-system.md`; do not create a second visual system for Research.
