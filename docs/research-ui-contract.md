# Research UI Contract (v1.0)

**Applies to:** All Hiring Research Library pages and all future research deep dives.

**Purpose:** Ensure every research page feels calm, editorial, credible, and research-grade. Prevent drift toward marketing UI, dashboards, or decorative patterns.

---

## 1. Core Principle

> Research pages are documents, not interfaces.

**They should feel like:**
- Internal research memos
- Technical documentation
- Editorial analysis

**They should NOT feel like:**
- Marketing landing pages
- Feature explainers
- Dashboard cards
- UI component galleries

**If an element draws attention to itself rather than the content, it is wrong.**

---

## 2. Allowed Visual Primitives (Hard Limit)

Research pages may ONLY use:

- Typography
- Whitespace
- Dividers
- Figures (images, diagrams)
- Inline links
- One brand accent color (indigo), used sparingly

**Anything outside this list requires explicit approval.**

---

## 3. Prohibited UI Patterns

The following patterns are **NOT allowed** on research pages:

| ❌ Prohibited | Reason |
|---------------|--------|
| Decorative icons | Draws attention to UI, not content |
| Emoji-style icons | Undermines credibility |
| Icon tiles | Marketing pattern |
| Chips | Marketing pattern |
| Pills | Marketing pattern |
| Badges | Marketing pattern |
| Card grids for insights | Dashboard pattern |
| Marketing-style callouts | Wrong tone |
| Decorative backgrounds | Visual noise |
| Excessive borders | Visual noise |

**Do not restyle these. Do not replace them. Remove them.**

---

## 4. Page Anatomy (Canonical Structure)

Every research deep dive must follow this exact structure and order:

### 4.1 Page Header

- Category label (text-only)
- Title
- Subtitle or framing sentence

**Rules:**
- No icons
- No pills
- No background container
- Typography only

### 4.2 Study Snapshot (Structured Container)

**Purpose:** Present study metadata and anchor credibility.

**Allowed:**
- Background container
- Key statistic highlight
- Editorial metadata rows

**Required Content:**
- Key statistic
- What it studied
- Method
- Sample
- Key finding
- "So what for resumes"
- Source + year range

**Rules:**
- No chips, pills, or icons
- Metadata must be label + value text
- Background must be subtle and calm

### 4.3 Figures

**Purpose:** Visually explain evidence.

**Rules:**
- Figures must be labeled (Figure 1, Figure 2, etc.)
- Each figure must have a one-sentence caption explaining meaning
- Figures may be visually expressive
- Figures must never compete with text hierarchy

> Figures are the only place where visual emphasis is encouraged.

### 4.4 Narrative Sections

Example headings:
- "People scan first, then decide whether to read"
- "Why dense bullets underperform"

**Rules:**
- Plain text
- No containers
- No icons
- No background fills
- Use whitespace and typography only

> These sections should read like an essay.

### 4.5 Insight Sections

**Purpose:** Summarize key research insights.

**Structure (each insight):**
- Optional typographic marker (e.g. "INSIGHT 01", "F-PATTERN")
- Headline
- Supporting explanation
- Optional RIYP mapping

**Rules:**
- No cards
- No iconography
- No chips
- No colored tiles
- Headline must carry hierarchy
- Marker, if used, must be text-only and secondary

> If an insight does not need a marker, omit it.

### 4.6 Examples (Do / Don't)

**Purpose:** Make abstract findings concrete.

**Allowed:**
- Subtle background for contrast
- Clear "Do" / "Don't" labeling

**Rules:**
- No icons or emoji
- Labels must be typographic
- Backgrounds must be neutral, not branded

### 4.7 "What this changes in RIYP"

**Purpose:** Explain how research informs the product.

**Allowed:**
- Background container
- Clear list of product impacts

**Rules:**
- No pills or badges
- No icons
- Product names may be bolded or prefixed inline
- Use editorial sentences, not UI labels

**Example format:**
> **Bullet Upgrades** encourage leading with metrics and strong verbs.

### 4.8 Sources & Notes

**Purpose:** Enable verification and transparency.

**Allowed:**
- Background container
- Inline footnotes
- Hover citation cards

**Rules:**
- Sources must be clearly separated from narrative content
- Limitations must be explicitly stated
- Footnotes must be quiet and unobtrusive

---

## 5. Color Contract

### Brand Gold Usage

**Gold may be used ONLY for:**
- Primary CTA
- Key finding highlight borders
- Very subtle background tones (bg-gold/5)
- "Hot" spots in data visualizations (if appropriate)

**Gold may NOT be used for:**
- Body text
- Decorative backgrounds (beyond subtle tint)
- Excessive borders

> Research content should be predominantly neutral (Ink & Paper).

---

## 6. Typography Contract

- Typography is the primary hierarchy mechanism
- Headings must do the work, not UI elements
- Metadata must be visually subordinate
- Nothing should compete with reading flow

**If you feel the need to add a visual element, first try:**
1. Adjusting spacing
2. Adjusting font size or weight
3. Removing something else

---

## 7. Spacing & Rhythm Contract

- Large spacing between conceptual sections
- Tight spacing within related content
- Avoid evenly stacked layouts
- Pages should feel breathable, not grid-bound

> Editorial rhythm over UI rhythm.

---

## 8. Side Rail & Footnotes

- Side rail remains text-only
- Footnotes remain minimal and citation-focused
- Both must feel secondary to the main content

> They support reading. They do not command attention.

---

## 9. Enforcement Rules

Any new research page must satisfy the following before merge:

- [ ] No decorative icons
- [ ] No chips, pills, or badges
- [ ] No unnecessary card containers
- [ ] Indigo used only in allowed roles
- [ ] Page reads cleanly with CSS disabled except typography

**If any of these fail, the page is non-compliant.**

---

## 10. Design Philosophy (Non-Optional)

> If a UI element exists, it must justify itself.
> If removing an element improves reading, it should be removed.

**Restraint is not a lack of design. Restraint is the design.**
