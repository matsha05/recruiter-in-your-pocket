# Quality and Reliability Systems

**How Competitors Maintain AI Output Quality and How RIYP Should Build Its Quality Moat**
**Last Updated:** 2025-12-27

---

## Executive Summary

AI resume tools face a trust crisis: users consistently complain about "generic AI output." The few products that win trust do so through **visible methodology**, **consistent output structure**, and **human-like tone constraints**. RIYP's current prompt engineering is sophisticated but lacks explicit quality measurement and regression testing.

---

## Part 1: Competitor Quality Patterns

### 1.1 Observed Guardrails Across Category

| Competitor | Guardrails Observed | Confidence |
|:-----------|:--------------------|:-----------|
| **Jobscan** | Match rate % requires JD input; mechanical scoring formula | High |
| **Resume Worded** | 20-check fixed criteria; section-by-section scoring | High |
| **Rezi** | 23-criteria Rezi Score; real-time feedback during editing | High |
| **Grammarly** | Rule-based grammar + statistical tone detection | High |
| **Enhancv** | ATS compatibility scan separate from design | Medium |

**Pattern:** Top products use **fixed scoring dimensions** that users can understand and track.

### 1.2 Human-in-the-Loop Patterns

| Competitor | HITL Pattern | Evidence |
|:-----------|:-------------|:---------|
| **VMock** | Campus career coaches validate/calibrate AI feedback | University partnerships |
| **Levels.fyi** | Human coaches for negotiation after AI analysis | Service pricing ($250+) |
| **Interviewing.io** | Human interviewers, not AI-only | Session-based ($225) |
| **Rora** | Human negotiators with AI-informed benchmarks | Performance-based |

**Pattern:** High-trust products layer **human expertise over AI** at critical moments.

### 1.3 Error Handling Patterns

| Pattern | Description | Products Using |
|:--------|:------------|:---------------|
| Fallback messaging | "We couldn't analyze this section" vs. silent failure | Resume Worded |
| Confidence indicators | "High confidence" / "Needs review" labels | Grammarly |
| Explicit limitations | "This tool doesn't evaluate content truth" | Jobscan |
| Manual override | User can reject/edit AI suggestions | Teal, Rezi |

---

## Part 2: RIYP Current State Audit

### 2.1 Prompt Quality Analysis

**Source:** `/web/prompts/resume_v1.txt` (587 lines)

**Strengths (Sophisticated):**
| Element | Implementation | Rating |
|:--------|:---------------|:-------|
| Tone constraints | Extensive rules for "calm, grounded confidence" | ✅ Strong |
| Few-shot examples | 5+ rewrite patterns with thin/strong/high-bar progression | ✅ Strong |
| Scoring rubric | Anchor bands at 50/70/85/92 with inflation prevention | ✅ Strong |
| Output schema | 40+ structured fields with strict requirements | ✅ Strong |
| Em-dash ban | Explicit punctuation rules for consistency | ✅ Strong |
| Anti-corporate language | Explicit banned phrases list | ✅ Strong |

**Gaps (Identified):**
| Gap | Risk | Priority |
|:----|:-----|:---------|
| No eval harness | Can't detect regressions after prompt changes | P1 |
| No calibration dataset | Scores may drift without ground truth | P1 |
| No confidence levels | Output appears certain even when uncertain | P2 |
| No fallback behavior | What happens when input is malformed? | P2 |
| Single prompt version | No A/B testing infrastructure for prompt variants | P3 |

### 2.2 Scoring Calibration Risk

**Current:** Score bands defined in prompt (0-49, 50-59, 60-69, 70-77, 78-84, 85-91, 92+)

**Risk:** Without calibration dataset, scores may:
- Drift over model updates (GPT-4o → future versions)
- Be inconsistent across edge cases (short resumes, unusual formats)
- Inflate or deflate based on prompt tweaks

---

## Part 3: Proposed RIYP Quality Moat

### 3.1 Quality System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    RIYP Quality System                   │
├─────────────────────────────────────────────────────────┤
│  Input Layer                                             │
│  ├── Resume parser validation (format, length, encoding) │
│  ├── Malformed input detection + graceful fallback      │
│  └── PII detection for safety                           │
├─────────────────────────────────────────────────────────┤
│  Prompt Layer                                            │
│  ├── Version-controlled prompts (currently implemented)  │
│  ├── Mode-specific prompts (resume, linkedin, ideas)     │
│  └── Tone constraints + few-shot examples                │
├─────────────────────────────────────────────────────────┤
│  Output Validation Layer (NEW)                           │
│  ├── Schema validation (JSON structure)                  │
│  ├── Score range checks (0-100, no nulls)               │
│  ├── Tone consistency checks (banned phrase detection)   │
│  └── Confidence scoring (when output quality is uncertain)|
├─────────────────────────────────────────────────────────┤
│  Evaluation Layer (NEW)                                  │
│  ├── Calibration dataset (50-100 resumes with target scores) │
│  ├── Regression tests on prompt changes                  │
│  └── A/B testing infrastructure for prompt variants      │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Priority Recommendations

#### P1: Calibration Dataset (1 week)

**What:** Create 50-100 resume samples with target scores and expected outputs.

**Why it matters:**
- Detects score drift after prompt changes
- Enables regression testing before deployment
- Provides ground truth for model comparison

**Implementation:**
1. Select 50 diverse resumes (different industries, seniority, quality levels)
2. Manually assign target scores + key expected observations
3. Store as test fixtures in `/web/prompts/fixtures/`
4. Run before deploying prompt changes

---

#### P1: Eval Harness (1 week)

**What:** Automated testing system that runs prompt against calibration dataset.

**Why it matters:**
- Catches regressions before users see them
- Enables confident prompt iteration
- Creates evidence for acquisition diligence

**Implementation:**
1. Script that runs each fixture through prompt
2. Compares output score to target (±5 point tolerance)
3. Checks for banned phrases in output text
4. Reports pass/fail with diff summary

**Template:**
```typescript
// prompts/eval.ts
interface EvalCase {
  resumeText: string;
  expectedScoreRange: [number, number];
  mustInclude: string[];  // phrases that should appear
  mustNotInclude: string[];  // banned phrases
}

async function runEval(cases: EvalCase[]): Promise<EvalResult[]>
```

---

#### P2: Output Confidence Scoring (2 weeks)

**What:** Add confidence indicators to uncertain outputs.

**Why it matters:**
- Builds trust when AI is honest about limitations
- Reduces "false certainty" complaints
- Creates premium perception

**Implementation:**
- Detect when input is edge case (very short resume, unusual format)
- Add `"confidence": "high" | "medium" | "low"` to output schema
- Surface in UI: "We're very confident about these suggestions" or "Some sections were harder to analyze"

---

#### P2: Graceful Fallback Behavior (3 days)

**What:** Explicit handling for when input is malformed or output fails validation.

**Why it matters:**
- Silent failures erode trust
- Explicit "we couldn't process this" is better than wrong output

**Implementation:**
- Input validation: Minimum word count, maximum length, character encoding
- Output validation: JSON parse, required fields, score range
- Fallback response: "We had trouble analyzing this resume. Try uploading a different format."

---

#### P3: A/B Testing Infrastructure (Future)

**What:** Run multiple prompt variants with random assignment.

**Why it matters:**
- Data-driven prompt optimization
- Faster iteration on quality improvements
- Creates competitive intelligence moat

**Implementation (when ready):**
- Prompt variant flag in request
- Assignment based on user/session hash
- Track completion rate, user actions, NPS by variant

---

## Part 4: Quality Moat Competitive Advantage

### Current Position

| Quality Dimension | RIYP | Jobscan | Resume Worded | Teal |
|:------------------|:-----|:--------|:--------------|:-----|
| Tone consistency | ✅ Strong | ⚪ Mechanical | ⚪ Generic | ⚪ Generic |
| Scoring methodology | ✅ Strong | ✅ Clear | ✅ Clear | ⚪ Vague |
| Few-shot examples | ✅ Strong | ❌ None visible | ❌ None visible | ❌ None visible |
| Eval harness | ❌ Missing | Unknown | Unknown | Unknown |
| Calibration data | ❌ Missing | Unknown | Unknown | Unknown |

### Recommended Positioning

**Quality Story for Acquisition:**
1. "We have version-controlled prompts with explicit tone constraints"
2. "We maintain a calibration dataset of 100 resumes with target outputs"
3. "We run regression tests before every prompt change"
4. "Our scoring bands are empirically validated, not arbitrary"

This creates **defensible IP** beyond just "good prompts" — it's a **quality engineering system**.

---

## Part 5: Implementation Priority

| Item | Effort | Impact | Priority |
|:-----|:-------|:-------|:---------|
| Calibration dataset (50 resumes) | 1 week | High (regression prevention) | P1 |
| Eval harness script | 1 week | High (confidence to iterate) | P1 |
| Fallback behavior | 3 days | Medium (edge case trust) | P2 |
| Confidence scoring | 2 weeks | Medium (honest AI perception) | P2 |
| A/B testing infra | 2 weeks | Medium (optimization speed) | P3 |

---

## Source Notes

- RIYP prompt analysis: `/web/prompts/resume_v1.txt` (587 lines reviewed)
- Competitor guardrails: Product documentation, public feature descriptions
- Quality engineering patterns: Industry best practices (Anthropic, OpenAI docs)

**Confidence Level:** HIGH for RIYP analysis; MEDIUM for competitor internal systems (not directly observable).
