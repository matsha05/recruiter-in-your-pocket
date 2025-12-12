# Research Library Expansion Spec

This document captures the full expansion plan for the Hiring Research Library, including new studies to add, premium polish improvements, and the workflow for consistent content creation.

---

## Phase Overview

| Phase | Focus | Status |
|-------|-------|--------|
| 1 | Polish existing 3 pages to gold standard | 🔄 In Progress |
| 2 | Implement Study JSON architecture | ⏳ Pending |
| 3 | Save LLM workflow prompts | ⏳ Pending |
| 4 | Add 2 new studies (Scanning category) | ⏳ Pending |

---

## Phase 1: Gold Standard Polish

**"Done" criteria:**
- [ ] Every page has Figure labels and captions
- [ ] Study Snapshot has standout stat or key finding highlighted
- [ ] Explicit Limitations section in Sources & Notes
- [ ] Clean, structured Sources & Notes
- [ ] Visual and structural patterns feel repeatable

---

## 10 Studies to Add (Post-Phase 1)

### 1. Recruiters' perceptions and use of applicant résumé information
- **Authors:** Cole, Rubin, Feild, Giles (2007)
- **Category:** Structure, Scanning
- **Why useful:** Directly about what recruiters pay attention to during screening
- **Infographic:** "Signals recruiters extract" diagram
- **RIYP mapping:** Top Fixes, By Section

### 2. Résumé content affects hiring recommendations through fit perceptions
- **Authors:** Tsai, Chi, Huang, Hsu (2011)
- **Category:** Job Alignment, By Section
- **Why useful:** Shows how content influences via perceived fit (P-J, P-O)
- **Infographic:** Causal chain: Resume Content → Fit Perceptions → Hiring Recommendation
- **RIYP mapping:** Job Alignment, Bullet Upgrades

### 3. Recruiter assessments of resume content predicting applicant attributes
- **Authors:** Cole (2003)
- **Category:** Structure, Scanning
- **Why useful:** "Recruiters infer more than you think from small cues"
- **Infographic:** "Inference map" with cues → inferred traits
- **RIYP mapping:** Recruiter First Impression, Main Score

### 4. Spelling carries real weight in recruiter judgment
- **Authors:** Martin-Lacroux (2017)
- **Category:** Bullets, Structure, Top Fixes
- **Why useful:** Quantifies impact of spelling errors (536 recruiters)
- **Infographic:** "Form vs content" split
- **RIYP mapping:** Top Fixes, Bullet Upgrades (error pass)

### 5. Text scanning patterns from eyetracking
- **Source:** Nielsen Norman Group
- **Category:** Scanning, Structure
- **Why useful:** Expands beyond F-pattern with named patterns
- **Infographic:** "4 scanning modes" cards
- **RIYP mapping:** Report Structure, Bullet Upgrades

### 6. Readability: optimal line length
- **Source:** Baymard Institute
- **Category:** Site UX, Report Design
- **Why useful:** Evidence-based readability guidance
- **Infographic:** "good / better / best" line-length visual
- **RIYP mapping:** Typography and layout choices in report tabs

### 7. Bias in resume screening has measurable impact
- **Authors:** Ock (2022)
- **Category:** Industry Analysis, ATS
- **Why useful:** Bias at screening compounds downstream
- **Infographic:** Two-stage funnel showing bias compounding
- **RIYP mapping:** ATS Myths, Product tone

### 8. Resume name discrimination field experiment
- **Authors:** Bertrand & Mullainathan (2004)
- **Category:** Industry Analysis
- **Why useful:** Foundational audit methodology; limits of "perfect resumes"
- **Infographic:** "Same résumé, different name" experimental design
- **RIYP mapping:** Mature voice about what resumes can't control

### 9. Meta-analysis of hiring discrimination over time
- **Authors:** Quillian, Pager, Hexel, Midtbøen (2017)
- **Category:** Industry Analysis
- **Why useful:** Big-picture discrimination trends
- **Infographic:** "What a meta-analysis is" + timeline
- **RIYP mapping:** Legitimacy and restraint in claims

### 10. Hiring algorithms, equity, and bias
- **Source:** Bogen & Rieke (2018), Upturn "Help Wanted" report
- **Category:** ATS, Industry Analysis
- **Why useful:** Expands ATS myths into predictive hiring tools
- **Infographic:** "Where automation enters the funnel" map
- **RIYP mapping:** ATS education → broader "screening systems education"

---

## Premium Polish Improvements

### 1. Sticky "On this page" rail (desktop)
- Right rail with 4-6 anchors
- "Reading time" and "Last updated"
- "Copy link" icon per section

### 2. Footnotes with hover cards
- Superscript numbers in paragraphs
- Hover/tap popover: author, year, title, "View source" link
- Keep full Sources section at bottom

### 3. Figure labels like a report
- "Figure 1: Recruiter skim attention zones"
- One-line caption stating what figure proves
- "Expand figure" affordance (modal)

### 4. Key statistic chip near top
- Compact chip row under title: Sample, Method, Evidence type, Year range
- Even approximate stats add research-grade feel

### 5. Interactive "Recruiter Lens"
- 3-way toggle: Recruiter / Job seeker / ATS (Systems)
- Each toggle changes only callout content

### 6. Insight card improvements
- Every card: headline, explanation, RIYP implication
- Standardize icon style
- Add "Impacts: Top Fixes / Bullet Upgrades" mini tags

### 7. Related studies at bottom
- Auto-generate based on shared tags
- Increases session depth

### 8. Stronger Sources & Notes structure
- Primary sources (with year, DOI)
- Supporting sources
- Limitations (2-3 bullets, explicit)

---

## Study JSON Schema

Location: `/data/research/[category]/[slug].json`

```json
{
  "slug": "recruiters-perceptions-resume-screening-2007",
  "category": ["Structure", "Scanning"],
  "title": "Recruiters' perceptions and use of applicant résumé information",
  "subtitle": "What recruiters extract during screening, and what it implies",
  "year": 2007,
  "authors": ["Cole", "Rubin", "Feild", "Giles"],
  "primary_source": {
    "link": "https://doi.org/...",
    "type": "journal-article"
  },
  "study_snapshot": {
    "what_it_studied": "...",
    "method": ["..."],
    "sample": "...",
    "key_finding": "...",
    "key_stat": "...",
    "so_what_for_resumes": "..."
  },
  "figures": [
    {
      "id": "figure-1",
      "title": "Signals recruiters infer during screening",
      "caption": "...",
      "spec": { "type": "diagram", "nodes": [], "edges": [] }
    }
  ],
  "key_insights": [
    {
      "title": "...",
      "explanation": "...",
      "riyp_implication": "...",
      "impacts": ["Top Fixes", "By Section"],
      "citations": [1]
    }
  ],
  "examples": {
    "do": ["..."],
    "dont": ["..."]
  },
  "riyp_changes": [
    { "feature": "Top Fixes", "why": "..." }
  ],
  "sources": [
    { "id": 1, "title": "...", "authors": ["..."], "year": 2007, "link": "...", "notes": "primary" }
  ],
  "limitations": ["...", "..."],
  "last_updated": "2025-12-12"
}
```

---

## LLM Prompts (to be saved as workflow)

### Prompt 1: Study Ingestion
Converts source text → Study JSON. Rules: only use provided text, no invented stats.

### Prompt 2: Page Writer
JSON → MDX page with consistent section order and RIYP voice.

### Prompt 3: Library Card Generator
JSON → card data for library listing.

### Prompt 4: Infographic Spec Generator
JSON → SVG/Figma-friendly visual spec.

### Prompt 5: Fact-Check Pass
Deletes/rewrites anything not supported by evidence.

---

## Success Criteria

When someone reads the library in order, they should think:

> "Most resume advice is wrong because it ignores how humans actually read. These people get it."

That's the feeling that creates trust, retention, and pricing power.
