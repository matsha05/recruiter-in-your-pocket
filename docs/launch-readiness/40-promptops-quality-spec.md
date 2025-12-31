# A5: PromptOps and Quality Moat Spec

**Agent:** A5 Prompt Engineering and Quality Moat Lead  
**Date:** 2025-12-28  
**Purpose:** Make RIYP known for recruiter-grade output quality and consistency

---

## 1. Prompt Versioning Strategy

### 1.1 Current State (Verified)

**Prompt locations:**
| File | Size | Purpose |
|:-----|:-----|:--------|
| `/prompts/resume_v1.txt` | 479 lines | Root prompt (source of truth) |
| `/web/prompts/resume_v1.txt` | 33.8KB | Deployed version |
| `/web/prompts/linkedin_v1.txt` | 8.2KB | LinkedIn analysis |
| `/prompts/resume_ideas_v1.txt` | 1.9KB | Missing wins questions |

**Loading system:** `lib/backend/prompts.ts` with in-memory caching

### 1.2 Proposed Versioning Convention

**File naming:**
```
{track}_{version}_{variant?}.txt

Examples:
- resume_v1.txt           # Current production
- resume_v2.txt           # Next major version
- resume_v1_calibrated.txt # A/B test variant (future)
```

**Version changelog:** Add header comment block to each prompt:
```
# PROMPT: resume_v1
# VERSION: 1.0
# LAST_MODIFIED: 2025-12-28
# AUTHOR: Matt Shaw
# CHANGES:
#   - v1.0: Initial production version
#   - v1.1: Added SM1 evidence-backed fixes (pending)
```

### 1.3 PR Review Checklist for Prompt Changes

Before merging ANY prompt change:

- [ ] **Eval pass:** Run calibration dataset, all cases pass
- [ ] **Diff review:** Changes are intentional and scoped
- [ ] **Tone check:** Run 3 diverse resumes, verify voice consistency
- [ ] **Schema check:** Output still matches expected JSON shape
- [ ] **Regression test:** Score drift <±3 points on benchmark resumes

### 1.4 Canary/Staged Rollout (Future)

**Not required for 2-week sprint.** When ready:
1. Deploy new prompt version to 10% of traffic
2. Compare score distributions between versions
3. Monitor for anomalies (score spikes/drops, format errors)
4. Graduate to 100% if stable after 48 hours

---

## 2. Output Contracts

### 2.1 Resume Feedback Response Schema

**Required structure (enforced by Zod):**

```typescript
{
  // Core scoring
  score: number;                    // 0-100 integer
  score_label: string;              // "Strong Foundation", etc.
  score_comment_short: string;      // ~16 words
  score_comment_long: string;       // 2-3 sentences

  // Summary
  summary: string;                  // 3-5 sentences, starts with "You read as..."

  // Lists
  strengths: string[];              // 3-5 items
  gaps: string[];                   // 3-5 items
  next_steps: string[];             // 3-5 items

  // Structured items
  top_fixes: Array<{
    fix: string;                    // Max ~20 words
    impact_level: "high" | "medium" | "low";
    effort: "quick" | "moderate" | "substantial";
    section_ref: string;            // "Work Experience", etc.
  }>;

  rewrites: Array<{
    label: string;                  // "Impact", "Clarity", etc.
    original: string;               // Exact quote from resume
    better: string;                 // Improved version
    enhancement_note: string;       // "If you have it, include..."
  }>;

  // Subscores
  subscores: {
    impact: number;                 // 0-100
    clarity: number;                // 0-100
    story: number;                  // 0-100
    readability: number;            // 0-100
  };

  // Section breakdowns
  section_review: {
    [section: string]: {
      grade: string;                // A-F scale
      priority: "High" | "Medium" | "Low";
      working: string;
      missing: string;
      fix: string;
    }
  };

  // Alignment analysis
  job_alignment: {
    strongly_aligned: string[];
    underplayed: string[];
    missing: string[];
    role_fit: {
      best_fit_roles: string[];
      stretch_roles: string[];
      seniority_read: string;
      industry_signals: string[];
      company_stage_fit: string;
    };
    positioning_suggestion: string;
  };

  // Ideas for improvement
  ideas: {
    questions: Array<{
      question: string;
      archetype: string;
      why: string;
    }>
  }
}
```

### 2.2 Confidence/Uncertainty Signaling (P2)

**Proposed addition to schema:**

```typescript
confidence?: {
  overall: "high" | "medium" | "low";
  reason?: string;  // Only populated for medium/low
}
```

**Trigger conditions:**
- `low`: Resume <100 words, or parse errors detected
- `medium`: Unusual format, mixed languages, or sparse detail
- `high`: Standard resume with clear content

**UI treatment:**
- High: No indicator (default)
- Medium: Subtle note: "Some sections were harder to analyze"
- Low: Warning: "We had limited information to work with"

### 2.3 Fallback Behavior

**When output fails validation:**

1. **Parse failure:** Return structured error, suggest retry
2. **Missing required fields:** Log to Sentry, return partial with warning
3. **Score out of range:** Clamp to 0-100, log anomaly
4. **Empty arrays:** Accept (resume may lack content), don't error

**User-facing fallback message:**
> "We had trouble generating a complete analysis. Some sections may be incomplete. Try uploading a different version of your resume."

### 2.4 "Why This Recommendation" Requirements

**Every fix and rewrite must include:**

| Element | Requirement | Example |
|:--------|:------------|:--------|
| **Evidence** | Quote or reference from resume | "Your summary says 'managed team'..." |
| **Gap** | What's missing or unclear | "...but doesn't specify team size" |
| **Impact** | Why this matters to recruiters | "Recruiters need scale to judge seniority" |

**Enforced in prompt (lines 355-370):**
```
- Each fix must have:
  - fix: A clear, concrete action (max ~20 words)
  - impact_level: "high", "medium", or "low"
  - effort: "quick", "moderate", or "substantial"
  - section_ref: Which resume section this applies to
```

---

## 3. Rubric and Calibration Plan

### 3.1 Recruiter-Grade Rubric Definitions

**Score bands (from prompt):**

| Band | Range | Definition |
|:-----|:------|:-----------|
| Very Limited | 0-49 | Not review-ready; major gaps in content or clarity |
| Thin Signal | 50-59 | Signal present but clarity/structure block understanding |
| Needs Clarity | 60-69 | Story is there but buried; notable tightening needed |
| Solid Foundation | 70-77 | Impact present but uneven; needs sharpening |
| Strong Story | 78-84 | Real impact and ownership; a few gaps to tighten |
| High Bar | 85-91 | Consistent ownership, quantification, senior-level clarity |
| Top-Bar Ready | 92-96 | Standout story with minor polish left |
| Rare Air | 97-99 | Almost no gaps; reserve for exceptional clarity density |

**Subscore dimensions:**

| Subscore | What it measures |
|:---------|:-----------------|
| **Impact** | Measurable outcomes, meaningful results |
| **Clarity** | Direct language, jargon-free, recruiter can understand |
| **Story** | Coherent career narrative, clear professional identity |
| **Readability** | Scannable in 7.4 seconds, value visible |

### 3.2 Calibration Process

**Goal:** Ensure scores are consistent across runs and model updates

**Process:**
1. **Initial calibration:** Score 50 diverse resumes manually (1-2 days)
2. **Target assignment:** Human assigns expected score range (±5 points)
3. **Automated check:** Run all fixtures through prompt
4. **Drift detection:** Flag any case outside expected range
5. **Re-calibration:** Adjust targets OR prompt when drift detected

**Frequency:**
- Before any prompt change: Full eval run
- Weekly: Spot-check 10 random fixtures
- After model update: Full eval run

### 3.3 Calibration Dataset Structure

**Location:** `/tests/resumes/` (37 fixtures exist)

**Required metadata per fixture:**
```json
{
  "filename": "senior_pm_strong.txt",
  "expected_score_range": [78, 86],
  "expected_band": "strong_foundation",
  "key_characteristics": ["PM", "senior", "quantified"],
  "known_gaps": ["missing team size", "unclear scope"],
  "notes": "Should score high bar; clear impact demonstrated"
}
```

**Diversity requirements:**
- Industries: Tech, finance, healthcare, education, nonprofit
- Seniority: Entry, mid, senior, executive
- Quality: Poor (30-50), average (55-70), strong (75-85), excellent (85+)
- Formats: Clean, cluttered, sparse, verbose

---

## 4. Quality Bar Examples

### 4.1 Gold Outputs (Pass)

**Example 1: Senior PM Resume (Expected: 82-88)**
```
Score: 85
Score Label: "High Bar"
Score Comment: "Clear ownership of outcomes with specific metrics. 
Recruiters will see a PM who ships and measures impact."

Summary: "You read as a senior PM who has shipped products at scale. 
Your bullets show you understand the difference between activity 
and outcomes. What's harder to see is how you navigated the 
hard trade-offs—the why behind the what."

Top Fix 1: "Add decision context to your launch bullets"
- Impact: High
- Evidence: "Your PM launches are crisp but don't show how you 
  decided what to cut or prioritize when scope changed."
- Impact statement: "Recruiters look for judgment, not just execution."
```

**Why it passes:**
- Score matches expected band
- Summary uses correct "You read as..." opening
- Tone is calm, direct, grounded
- Fixes cite evidence and explain impact
- No corporate language or filler

---

**Example 2: Entry-Level Marketing (Expected: 58-66)**
```
Score: 62
Score Label: "Needs Clarity"
Score Comment: "Solid foundation with real campaigns. Numbers are 
thin—adding scale would make this competitive."

Summary: "You read as an early-career marketer who has touched 
real campaigns. You have the vocabulary but the scope is hard to 
see. Recruiters will wonder about the size of what you managed."

Top Fix 1: "Quantify your top campaign"
- Impact: High
- Evidence: "Your Instagram campaign bullet mentions 'increased 
  engagement' but doesn't say by how much or from what baseline."
- Impact statement: "Numbers tell recruiters this was real work."
```

**Why it passes:**
- Score appropriate for entry-level with limited metrics
- Tone is honest but supportive
- Fixes are specific and actionable
- No condescension or excessive encouragement

---

**Example 3: Career Transition Resume (Expected: 65-73)**
```
Score: 70
Score Label: "Solid Foundation"
Score Comment: "Your transferable skills are visible. The story 
needs tightening to make the connection explicit."

Summary: "You read as someone making a deliberate career move. 
Your previous experience shows leadership and problem-solving. 
What's harder to see is how those skills translate directly 
to the roles you're targeting now."

Top Fix 1: "Add a positioning summary at the top"
- Impact: High
- Evidence: "Your resume jumps into experience without setting 
  up your transition story."
- Impact statement: "Recruiters need 3 seconds to understand 
  why you're a fit—give them that context upfront."
```

**Why it passes:**
- Addresses transition context appropriately
- Doesn't assume tech/traditional path
- Fixes are relevant to transition scenario
- Supportive without being patronizing

---

### 4.2 Unacceptable Outputs (Fail)

**Failure 1: Corporate Coaching Tone**
```
❌ FAIL

Score: 78
Summary: "You have demonstrated strong experience in leveraging 
strategic initiatives to drive impactful results. Your proven 
track record showcases effective leadership capabilities."

Why it fails:
- Uses banned phrases: "strong experience", "leveraging", 
  "strategic initiatives", "impactful results", "proven track record"
- Sounds like LinkedIn bot, not human recruiter
- No grounded observations from actual resume content
```

---

**Failure 2: Vague/Generic Fixes**
```
❌ FAIL

Top Fix 1: "Add more specifics to your bullets"
- Impact: High
- Evidence: (none)
- Impact statement: "This will improve your resume."

Why it fails:
- Fix is vague (which bullets? what specifics?)
- No evidence cited from resume
- Impact statement is content-free
- Not actionable
```

---

**Failure 3: Score Inflation**
```
❌ FAIL

Resume: 3 bullet points, no metrics, unclear role titles
Score: 82
Score Label: "Strong Story"

Why it fails:
- Score wildly inflated for thin content
- Should be in 50-60 range given limited signal
- Violates rubric anchor bands
- Would erode user trust
```

---

## 5. Implementation Priority

| Item | Effort | Priority |
|:-----|:-------|:---------|
| Prompt versioning header comments | 2 hours | P1 |
| PR review checklist documentation | 2 hours | P1 |
| Calibration metadata for 50 fixtures | 1 day | P1 |
| Gold/fail output examples documented | 4 hours | P1 |
| Confidence scoring schema | 2 days | P2 |
| Fallback response handling | 1 day | P2 |
| Canary rollout infrastructure | 3 days | P3 |

---

*Generated by A5 PromptOps Quality Moat Lead — 2025-12-28*
