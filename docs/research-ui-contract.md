# Research UI Contract (v2.0)

**Applies to:** All Hiring Research Library pages and future research deep dives.

**Purpose:** Ensure every research page feels calm, editorial, credible, and research-grade. Prevent drift toward marketing UI, dashboards, or decorative patterns.

---

## 1. Core Principle

> Research pages are documents, not interfaces.

**They should feel like:**
- Internal research memos
- Technical documentation from The Economist or academic journals
- Editorial analysis

**They should NOT feel like:**
- Marketing landing pages
- Feature explainers
- Dashboard cards

**If an element draws attention to itself rather than the content, it is wrong.**

---

## 2. Color Contract (V2.1 Alignment)

### Primary Palette
| Token | Light | Dark | Usage |
|---|---|---|---|
| `--foreground` | `#111111` | `#EEEEEE` | Headings, body text |
| `--muted` | `#6B7280` | `#9CA3AF` | Secondary text, labels, captions |
| `--border` | `rgba(0,0,0,0.08)` | `rgba(255,255,255,0.10)` | Dividers, figure borders |
| **`--brand`** | **`#0D9488` (Teal-600)** | **`#2DD4BF`** | Key finding highlights, data emphasis |
| `--premium` | `#D97706` | `#FBBF24` | **Reserved for product CTAs only. Never in research content.** |

### Usage Rules
- **Teal (`--brand`)** may be used for: key finding borders, data visualization highlights, subtle background tones (`bg-brand/5`).
- **Gold (`--premium`)** is **prohibited** in research content. It signals "premium unlock" which is wrong for credibility.
- Research content should be **90% neutral** (Ink & Paper) with Teal as the sole accent.

---

## 3. Allowed Visual Primitives (Hard Limit)

Research pages may ONLY use:

- Typography
- Whitespace
- Dividers
- Figures (diagrams, data visualizations)
- Inline links
- One brand accent color (Teal), used sparingly

**Anything outside this list requires explicit approval.**

---

## 4. Prohibited UI Patterns

| ❌ Prohibited | Reason |
|---|---|
| Decorative icons | Draws attention to UI, not content |
| Emoji-style icons | Undermines credibility |
| Chips, Pills, Badges | Marketing patterns |
| Card grids | Dashboard pattern |
| Glows, Blurs, Drop shadows | Decorative noise |
| Infinite animations | Distracting; undermines seriousness |

**Do not restyle these. Remove them.**

---

## 5. Diagram Specification (NEW — V2.0)

Diagrams are the **only** place where visual emphasis is encouraged. They must feel like data visualizations from a research paper or The Economist, not SaaS marketing.

### 5.1 Visual Style

| Attribute | Rule |
|---|---|
| **Strokes** | 1px, solid. No dashed lines unless semantically meaningful (e.g., "projected"). |
| **Corners** | Sharp (`stroke-linejoin: miter`). No rounded corners on data paths. |
| **Fills** | Flat colors only. No gradients. |
| **Colors** | Monochrome base (`--foreground`, `--muted`). `--brand` (Teal) for primary data emphasis. ONE highlight per diagram max. |
| **Shadows/Glows** | **Prohibited.** No `blur()`, no `box-shadow`, no `drop-shadow`. |
| **Backgrounds** | Transparent or `--background`. No decorative fills. |

### 5.2 Typography in Diagrams

| Element | Font | Size | Style |
|---|---|---|---|
| Axis labels | Geist Mono | 10px | Uppercase, `--muted` |
| Data labels | Geist Mono | 11px | `--foreground` |
| Figure caption | Geist Sans | 12px | `--muted`, italic allowed |
| Key stat callout | Fraunces | 24-32px | `--brand` or `--foreground` |

### 5.3 Animation Rules

| Rule | Reason |
|---|---|
| **Draw-in once on scroll** | Creates "reveal" moment. |
| **No loops** | Loops are distracting and undermine seriousness. |
| **End in static state** | The final frame must be fully legible. |
| **Duration: 350-500ms** | Slow enough to perceive, fast enough to not feel sluggish. |
| **Easing: `--ease`** | `cubic-bezier(0.16, 1, 0.3, 1)` — snappy. |

### 5.4 Figure Labeling

Every diagram must include:
- **Figure number:** "Fig. 1", "Fig. 2", etc. (Geist Mono, 10px, uppercase, `--muted`)
- **Caption:** One sentence explaining what the figure shows. (Geist Sans, 12px, `--muted`)

Example:
```
Fig. 1 — Aggregated gaze duration across 30 recruiter sessions.
```

### 5.5 Diagram Anatomy Examples

**Bar/Funnel Chart:**
- Bars: `--muted` fill for secondary data, `--brand` fill for highlighted bar.
- Axis: 1px `--border` stroke.
- Labels: Geist Mono, right-aligned for Y-axis, centered for X-axis.

**Heatmap:**
- Gradient: Monochrome (white → `--foreground`) or Teal gradient (`--brand/10` → `--brand`).
- No "glow" overlays. Use opacity steps for intensity.

**Path/Flowchart:**
- Lines: 1px `--foreground` or `--muted`.
- Nodes: 4px radius, 1px border, no fill (or subtle `--muted/10`).
- Arrows: Simple, not decorative.

---

## 6. Page Anatomy (Canonical Structure)

### 6.1 Page Header
- Category label (text-only, Geist Mono, uppercase, `--muted`)
- Title (Fraunces, `--foreground`)
- Subtitle (Geist Sans, `--muted`)

**No icons. No pills. No background container.**

### 6.2 Study Snapshot
- Background: `bg-brand/5` (subtle Teal tint) or `bg-secondary/20`
- Border-left: 4px `--brand`
- Key statistic: Fraunces, 32-40px
- Metadata: Geist Sans, label-value pairs

### 6.3 Figures
- Labeled: "Fig. X"
- Captioned: One-sentence explanation
- May be visually expressive (within rules above)

### 6.4 Narrative Sections
- Plain text. No containers, no icons, no background fills.
- Whitespace and typography only.

### 6.5 Product Tie-In ("How this shapes RIYP")
- Background container allowed
- No pills or badges
- Editorial sentences, not UI labels

### 6.6 Sources & Notes
- Numbered footnotes or endnotes
- Quiet and unobtrusive

---

## 7. Source Quality Standards (MANDATORY)

> **All citations must link to verifiable, accessible content. Broken links or unverifiable claims are acquisition blockers.**

### 7.1 Source Tiers

| Tier | Source Type | Verified Examples | Usage |
|------|-------------|-------------------|-------|
| **Tier 1 (Primary)** | Official platform data, academic journals, government surveys | See list below | **Required for key findings** |
| **Tier 2 (Industry)** | Established publications that cite primary sources | See list below | Acceptable if citing Tier 1 |
| **Tier 3 (Prohibited)** | Low-authority blogs, marketing tools, unknown sites | DottyPost, ContentIn.io, random Medium posts | **Never use** |

#### Tier 1 Sources for LinkedIn/Recruiting Research

| Source | URL | What It Contains |
|--------|-----|------------------|
| **LinkedIn Economic Graph** | `economicgraph.linkedin.com/blog` | Official hiring data, workforce reports, AI impact studies |
| **LinkedIn Newsroom** | `news.linkedin.com/about-us#Statistics` | Official member counts, hiring stats (7 hires/minute), company data |
| **Pew Research Center** | `pewresearch.org/internet/fact-sheet/social-media` | 32% of US adults use LinkedIn, demographic breakdowns |
| **Hootsuite Blog** | `blog.hootsuite.com/linkedin-statistics-business/` | 51 stats with primary LinkedIn citations |
| **SHRM.org** | `shrm.org` (search for survey reports) | HR professional surveys on recruiting practices |
| **Jobvite Recruiter Nation** | `jobvite.com` (annual reports) | Recruiter behavior surveys |
| **Academic papers** | Google Scholar, DOI links | Peer-reviewed research on resume screening |

#### Tier 2 Sources (Acceptable with Verification)

| Source | Why Acceptable | Verify Before Using |
|--------|----------------|---------------------|
| **Kinsta** | Tech-focused, cites primary sources | Check their citations go to Tier 1 |
| **TeamStage** | HR analytics, cites surveys | Check their methodology section |
| **Forbes** | Editorial standards, fact-checked | Check article date and author credentials |
| **HBR** | Research-grade editorial | Check study citations |

#### Tier 3 Sources (PROHIBITED)

| Source Type | Examples | Why Prohibited |
|-------------|----------|----------------|
| Small marketing tool blogs | DottyPost, ContentIn.io, Elev-AI | Fabricate stats to sell product |
| AI content farms | Generic "LinkedIn Statistics 2024" sites | No primary research, circular citations |
| Unattributed Medium posts | Random career advice articles | No editorial oversight |
| Generic landing pages | business.linkedin.com/talent-solutions (no stats) | Marketing copy, not data |
| 404s and broken links | Any URL that doesn't load | Obviously unverifiable |

### 7.2 Link Requirements

- [ ] **Every source URL must be verified BEFORE merge** — actually click it and find the stat
- [ ] **Links must go to the specific stat**, not a generic landing page
- [ ] **Links must be accessible** — no 404s, no login walls, no paywalls without archive link
- [ ] **Citations must match content** — the stat you cite must exist on the linked page
- [ ] **Check the source's source** — if they claim "87% of recruiters," where did THEY get it?

### 7.3 Search Strategies for Finding Tier 1 Sources

When researching a stat like "X% of recruiters use LinkedIn":

1. **Start with official sources**: `site:linkedin.com "hiring" statistics`
2. **Check academic sources**: Google Scholar + topic keywords
3. **Find primary surveys**: `site:shrm.org survey recruiting` or `site:jobvite.com recruiter nation`
4. **Verify aggregators**: If Hootsuite says "7 hires/minute" check their citation → `news.linkedin.com`
5. **Avoid circular citations**: If 3 sites all cite each other with no primary source, the stat is likely fabricated

### 7.4 When Evidence is Weak

If you cannot find a credible primary source for a claim:
1. **Remove the claim entirely** — restraint is better than bullshit
2. **Soften the language** — "LinkedIn is the primary professional network" instead of "93% of recruiters..."
3. **Add explicit limitation** — "Exact figures vary by source; the key insight is..."

**If in doubt, delete. Credibility > Completeness.**

---

## 8. Enforcement Checklist

Before merge, every research page must pass:

- [ ] No decorative icons
- [ ] No chips, pills, or badges
- [ ] No Gold (`--premium`) anywhere
- [ ] Teal (`--brand`) used only in allowed roles
- [ ] All diagrams have figure numbers and captions
- [ ] No infinite animations
- [ ] No glows or blurs

**If any fail, the page is non-compliant.**

---

## 9. Design Philosophy

> If a UI element exists, it must justify itself.
> If removing an element improves reading, it should be removed.

**Restraint is not a lack of design. Restraint is the design.**

