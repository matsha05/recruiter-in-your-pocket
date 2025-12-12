---
description: How to add a new research study to the Hiring Research Library
---

# Add Research Study Workflow

This workflow ensures every new research study follows consistent patterns, tone, and structure.

> **⚠️ REQUIRED READING BEFORE ANY RESEARCH PAGE WORK:**
> You MUST read and follow [docs/research-ui-contract.md](../docs/research-ui-contract.md) before creating or modifying any research page. This contract is binding and defines all allowed/prohibited UI patterns.

## Prerequisites

- The source paper/article text or link
- Identified category (Scanning, Structure, Bullets, ATS, Industry Analysis)
- Identified RIYP feature mappings
- Familiarity with the Research UI Contract

---

## Step 1: Create Study JSON (Ingestion)

Create a new JSON file at `/web/data/research/[category]/[slug].json`.

Use this prompt to convert source material into structured data:

```
ROLE: You are a research editor for Recruiter in Your Pocket (RIYP).
GOAL: Convert the provided source text into a structured Study JSON.

RULES:
- Use ONLY the provided source text. If a detail is missing (sample size, method, etc.), write "Not specified in provided text".
- No hype. No marketing claims. No invented stats.
- Every numeric claim must be included in a "claims" list with an exact citation pointer (quote or excerpt).

OUTPUT:
Return valid JSON matching this schema:
{
  "slug": "string",
  "category": ["string"],
  "title": "string",
  "subtitle": "string", 
  "year": number or "range",
  "authors": ["string"],
  "primary_source": {
    "link": "url",
    "type": "journal-article | report | web-article"
  },
  "study_snapshot": {
    "what_it_studied": "string",
    "method": ["string"],
    "sample": "string",
    "key_finding": "string",
    "key_stat": "string (short, impactful)",
    "so_what_for_resumes": "string"
  },
  "figures": [
    {
      "id": "figure-1",
      "title": "string",
      "caption": "string",
      "spec": { "type": "diagram | heatmap | funnel | causal-chain", "description": "string" }
    }
  ],
  "key_insights": [
    {
      "marker": "01 | F-PATTERN | text-only label (NO icons/emoji)",
      "title": "string",
      "explanation": "string",
      "riyp_implication": "string",
      "impacts": ["Top Fixes", "Bullet Upgrades", "etc"]
    }
  ],
  "examples": {
    "do": ["string"],
    "dont": ["string"]
  },
  "riyp_changes": [
    { "feature": "string", "why": "string" }
  ],
  "sources": [
    { "id": 1, "name": "string", "url": "string", "date": "string", "notes": "primary | supporting" }
  ],
  "limitations": ["string"],
  "last_updated": "YYYY-MM-DD"
}

INPUT SOURCE TEXT:
<<<PASTE SOURCE HERE>>>
```

---

## Step 2: Create Page Component

Create the page at `/web/app/research/[slug]/page.tsx`.

Use this prompt to generate consistent copy:

```
ROLE: You are a UX writer for RIYP's Hiring Research Library.

INPUTS:
1) Study JSON (from Step 1)
2) RIYP feature map:
   - Recruiter First Impression
   - Main Score  
   - Top Fixes
   - Bullet Upgrades
   - ATS Education
   - Report Structure
   - Readability Score

TASK:
Write a page.tsx file with these sections, in this exact order:
1) Metadata (title, description)
2) Hero section (chip, title, subtitle)
3) Study Snapshot component (with keyStat and year)
4) FigureWrapper + diagram component
5) Key prose section (2-3 paragraphs)
6) Key insights (4-6 InsightCards)
7) Do / Don't CalloutStrips (if applicable)
8) ProductConnection component (3-5 features)
9) SourcesNotes component (with explicit limitations)
10) Footer

STYLE:
- Short sentences. Concrete language.
- Match RIYP voice: calm, evidence-based, recruiter-realistic.
- No em dashes. Use commas or parentheses.
- Add footnote-style citations inline like [1]

IMPORTS REQUIRED:
- StudySnapshot, InsightCard, ProductConnection, SourcesNotes
- ExpandCollapse, CalloutStrip, FigureWrapper
- ThemeToggle from shared
- Link from next/link
- research.css

OUTPUT: Return complete TSX code only.
```

---

## Step 3: Create SVG Diagram

Create diagram at `/web/components/research/diagrams/[DiagramName].tsx`.

Use this prompt:

```
ROLE: You are an information designer creating SVG diagrams for research pages.

INPUT: Study JSON figures[] specification

TASK:
Create a React component that renders an SVG diagram matching the spec.

RULES:
- Use CSS variables: var(--accent), var(--bg-card), var(--text-main), var(--border-subtle)
- ViewBox should be reasonable (300-400px width)
- Use serif/sans-serif fonts sparingly
- Include text labels inside the SVG
- Do NOT include the caption (that goes in FigureWrapper)
- Wrap in <div className="hero-diagram">

OUTPUT: Return complete TSX component.
```

---

## Step 4: Update Library Card

Add entry to the research landing page data in `/web/app/research/page.tsx`.

```
ROLE: You write the Research Library cards.

INPUT: Study JSON

OUTPUT:
{
  "id": "slug",
  "number": "04" (next in sequence),
  "category": "Eye-tracking research | Usability research | Industry analysis",
  "title": "...",
  "thesis": "One sentence, max 160 characters.",
  "methods": ["string", "string"],
  "readTime": "N min",
  "tags": ["Scanning", "Bullets", "ATS"],
  "href": "/research/[slug]",
  "productTie": "Recruiter First Impression | Bullet Upgrades | etc"
}

RULES:
- No hype. No vague promises.
- Thesis must say what the reader will learn.
```

---

## Step 5: Fact-Check Pass (Critical)

Before publishing, run this validation:

```
ROLE: You are a strict fact checker.

INPUTS:
- Draft page.tsx
- Study JSON with sources[]

TASK:
1. Verify every statistic has a matching source
2. Delete or rewrite any sentence not supported by source text
3. Ensure limitations are prominently stated
4. Check that RIYP mappings are honest (not overclaiming)

OUTPUT:
- List of removed/rewritten claims with reasons
- Corrected page.tsx if changes needed

CRITICAL RULES:
- Never invent statistics
- Prefer restraint over completeness
- If evidence is weak, say so explicitly
```

---

## Study Snapshot Headline Style Guide (Gating Rule)

> **This is a gating rule. Headlines that violate this guide must be rewritten before merge.**

### Core Principle

A Study Snapshot headline must summarize an observed constraint, behavior, or finding in plain language. It should feel like the title of a figure caption or a results section, not a thesis statement.

**If the headline feels like it could appear on a marketing slide, it is wrong.**

### Allowed Headline Types (choose exactly one)

#### 1. Quantitative finding
Use when a number is central and defensible.

**Format:** `~X units + context`

**Examples:**
- `~6 seconds for initial screening`
- `~80% of users scan, not read`
- `~30 recruiters reviewed 300+ resumes`

**Rules:** Never use a naked number alone. Include context.

#### 2. Behavioral observation
Use when the study describes how people behave.

**Format:** Plain-language statement, active voice, observable behavior

**Examples:**
- `Recruiters skim before they read`
- `Eyes jump to anchors like titles and numbers`
- `Dense text is frequently skipped`

**Rules:** No metaphors. No coined terms. No abstract nouns.

#### 3. Constraint or bottleneck
Use when the research identifies what limits outcomes.

**Format:** `[Constraint] is the primary bottleneck` or `[Factor], not [myth], drives outcomes`

**Examples:**
- `Human review is the primary bottleneck`
- `Attention, not algorithms, limits screening`
- `Time pressure shapes early decisions`

**Rules:** Must be defensible across sources.

#### 4. System function (for industry/tooling research)
Use when explaining how systems operate in practice.

**Format:** `Systems do X, not Y` or `X supports Y rather than Z`

**Examples:**
- `ATS systems rank candidates, not resumes`
- `Automation supports prioritization, not rejection`

**Rules:** Keep language operational. Avoid moral or emotional framing.

### Prohibited Headline Types (never allowed)

| ❌ Type | Examples |
|---------|----------|
| Metaphor | Human gate, Black box, Robot screener |
| Coined/branded phrase | Human-in-the-loop, Decision gateway |
| Value judgment | ATS doesn't matter, Keywords are useless |
| Slogan | Humans still decide, Clarity wins |

**If it sounds persuasive, it does not belong in the snapshot.**

### Enforcement Test

Before a Study Snapshot headline is approved, it must pass this test:

> **Could this headline be defended verbatim in a peer review or expert critique without clarification?**

If not, rewrite it.

### Current Library Headlines (canonical examples)

| Page | Headline |
|------|----------|
| Eye-tracking | `~6 seconds for initial screening` |
| Scanning | `~80% of users scan, not read` |
| ATS | `Human review is the primary bottleneck` |

---

## Quality Checklist

Before marking complete:

- [ ] Study JSON is complete and accurate
- [ ] Page has StudySnapshot with keyStat and year
- [ ] **keyStat headline passes Style Guide enforcement test**
- [ ] Figure has clear label ("Figure 1: ...") and caption
- [ ] 4-6 InsightCards present (text-only markers, no icons)
- [ ] ProductConnection maps to real RIYP features
- [ ] SourcesNotes has explicit Limitations
- [ ] Build passes (`npm run build`)
- [ ] Visual review in light and dark mode
- [ ] Added to library page card array

