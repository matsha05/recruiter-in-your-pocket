# Research UI Contract (v3.1)

Applies to: Research hub and all Hiring Research Library articles.

Purpose: Research pages are proof engines. They should feel like premium editorial instruments built by a product design team. Calm, credible, and visually intentional.

Design intent:
- Quiet authority, not academic stiffness.
- Illustration, diagrams, and motion are encouraged when they explain.
- Every visual move must increase clarity, recall, or trust.
- The page should feel designed, not templated.

---

## 1. Surface Types

### Research Hub (Index)
- Purpose: orientation and navigation, not persuasion.
- Form: typographic lists, dividers, and minimal grouping.
- Allowed: one lead figure or illustration if it explains the library or methodology.
- Not allowed: card grids, badge stacks, or marketing hero theatrics.

### Research Articles (Documents)
- Purpose: credibility and clarity.
- Form: editorial prose with a key finding, figures, and sources.
- Allowed: lead figure, inline diagrams, and short motion moments tied to the insight.
- Not allowed: feature marketing layouts or dashboard UI.

---

## 2. Core Principle

Research pages are editorial instruments. The content leads, design supports it. If a visual element does not increase understanding, it is wrong.

They should feel like:
- A premium research memo
- A designed, high craft editorial
- An expert explainability layer for the product

They should not feel like:
- A sales landing page
- A marketing infographic dump
- A SaaS dashboard

---

## 3. Visual Language

### Typography and Layout
- Headers use Fraunces, body uses Geist Sans, data uses Geist Mono.
- Favor whitespace, clear sectioning, and tight editorial hierarchy.
- Use lists and rules to structure reading flow.
- Embrace layout rhythm. A research page can feel designed without feeling busy.

### Color Contract
Primary palette:
- `--foreground` for text and primary strokes
- `--muted` for supporting text and labels
- `--border` for dividers and figure frames
- `--brand` (Teal-600) for emphasis and key findings
- `--premium` is reserved for product CTAs only, never for research content

Allowable accent usage:
- Teal for emphasis, highlights, and data focus.
- Warm heat scales (red to orange) are allowed inside heatmaps only and must be labeled as intensity, not brand.
- Subtle gradients are allowed inside figures only, never as page backgrounds.
- Tiny accent colors are allowed for annotation callouts if they map to meaning.

Research content should remain 85 to 90 percent neutral.

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
- Axis labels: Geist Mono, 10px, uppercase, `--muted`.
- Data labels: Geist Mono, 11px, `--foreground`.
- Figure caption: Geist Sans, 12px, `--muted`.
- Key stat callout: Fraunces, 24 to 32px.

### Figure Labeling
Every figure must include:
- Figure number: "Fig. 1" (Geist Mono, 10px, uppercase, muted)
- Caption: one sentence explaining what the figure shows

Captions can live under the figure or inside the figure if the layout demands it.

---

## 6. Evidence and Citations

Research credibility is a product feature. If it cannot be cited, it does not ship.

Rules:
- All factual claims in research articles and figures must have citation markers and sources.
- The hub must stay descriptive and avoid numeric claims.
- Recruiter judgement can be used, but must be labeled as "Recruiter lens".

### Anecdotal and Field Notes
Anecdotes are allowed when clearly labeled. They must be qualitative, not quantitative.
- Label: "Recruiter lens" or "Field note".
- No numbers unless backed by a Tier-1 or Tier-2 source.

Citation format follows `docs/design-system.md`.
Source quality follows `docs/source-quality.md`.

---

## 7. Page Anatomy

### Research Hub
- Editorial header: tag, title, short description
- Essential reading list
- Methodology note
- Category sections
- Product translation

### Research Articles
- Back to Research
- Category label, title, subtitle, metadata
- Key finding excerpt
- Figures and narrative sections
- Product tie-in
- Sources and notes

---

## 8. Prohibited UI Patterns

Avoid anything that reads as marketing chrome:
- Decorative icons or mascots with no informational role
- Badge stacks and pill chips used as adornment
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
- Primary research from recognized orgs (Nielsen Norman Group, TheLadders)

### Tier-2 Sources
- Reputable industry reports with clear methodology
- Top-tier consultancies with primary data

### Prohibited
- Marketing blogs
- Aggregators without primary citations
- Generic landing pages
- Broken links or paywalled stats without mirrors

If a strong source does not exist, soften or remove the claim.

---

## 10. Enforcement Checklist

Before merge, every research page must pass:
- No marketing layout patterns
- Figures are labeled and captioned
- Motion is purposeful and non-looping
- All claims are cited
- No premium color usage
- Any anecdotal callout is labeled and qualitative

Restraint is still the baseline. Use visual craft to deepen understanding, not to decorate.

---

*See also: `diagram-visual-spec.md` for detailed diagram implementation patterns, motion grammar, and archetype definitions.*
