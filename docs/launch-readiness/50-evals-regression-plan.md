# A6: Evaluation Harness and Regression Gates

**Agent:** A6 Evaluation Harness and Regression Gates Lead  
**Date:** 2025-12-28  
**Purpose:** Prevent quality regressions and shipping embarrassment

---

## 1. Minimal Eval Dataset Spec

### 1.1 Dataset Size and Composition

**Target:** 50-100 resumes with labeled expectations

**Current state:** 37 resume fixtures exist at `/tests/resumes/`

**Composition requirements:**

| Category | Count | Examples |
|:---------|:------|:---------|
| **By Quality** | | |
| Poor (30-55) | 10 | Sparse, unclear, no metrics |
| Average (55-70) | 15 | Foundation present, gaps in clarity |
| Strong (70-85) | 15 | Clear impact, some polish needed |
| Excellent (85+) | 10 | High bar or exceptional |
| **By Industry** | | |
| Tech | 15 | Engineering, PM, design |
| Business | 10 | Finance, consulting, operations |
| Other | 10 | Healthcare, education, nonprofit |
| Career transition | 5 | Cross-industry moves |
| Entry-level | 10 | New grads, internships |

### 1.2 Fixture Storage Format

**Location:** `/tests/resumes/` (existing) + `/tests/fixtures/calibration.json` (new)

**Metadata file structure:**
```json
{
  "version": "1.0",
  "last_updated": "2025-12-28",
  "fixtures": [
    {
      "id": "senior_pm_strong_001",
      "filename": "senior_pm_strong.txt",
      "expected_score_range": [78, 86],
      "expected_band": "high_bar",
      "expected_subscores": {
        "impact": [75, 90],
        "clarity": [80, 95],
        "story": [70, 85],
        "readability": [75, 90]
      },
      "required_observations": [
        "quantified outcomes",
        "clear ownership",
        "senior-level scope"
      ],
      "banned_phrases": [
        "strong experience",
        "proven track record"
      ],
      "tags": ["pm", "senior", "tech", "strong"]
    }
  ]
}
```

---

## 2. Automated Checks

### 2.1 Format Compliance

| Check | Rule | Pass Condition |
|:------|:-----|:---------------|
| JSON valid | Output parses as JSON | True |
| Schema match | All required fields present | True |
| Score integer | `score` is integer 0-100 | True |
| Arrays populated | `strengths`, `gaps` have 3-5 items | True |
| Subscores valid | All subscores are integers 0-100 | True |

**Implementation:**
```typescript
function checkFormatCompliance(output: unknown): CheckResult {
  const parsed = ResumeFeedbackResponseSchema.safeParse(output);
  return {
    passed: parsed.success,
    errors: parsed.success ? [] : parsed.error.issues,
  };
}
```

### 2.2 Completeness

| Check | Rule | Pass Condition |
|:------|:-----|:---------------|
| Summary length | 3-5 sentences | 100-500 words |
| Top fixes count | 3-5 fixes present | True |
| Rewrites count | 3-5 rewrites present | True |
| Section review | At least 2 sections reviewed | True |

### 2.3 Specificity

| Check | Rule | Pass Condition |
|:------|:-----|:---------------|
| Evidence grounding | Top fixes cite resume content | Contains quotes |
| No generic advice | Fixes are specific, not "add more details" | Keyword check |
| Metric preservation | Numbers from resume appear in rewrites | Cross-reference |

**Implementation:**
```typescript
function checkSpecificity(output: ResumeFeedback, resumeText: string): CheckResult {
  const fixes = output.top_fixes;
  const genericPhrases = ["add more details", "be more specific", "improve clarity"];
  
  for (const fix of fixes) {
    if (genericPhrases.some(phrase => fix.fix.toLowerCase().includes(phrase))) {
      return { passed: false, error: "Generic advice detected" };
    }
  }
  
  return { passed: true };
}
```

### 2.4 Hallucination Risk Flags

| Check | Rule | Flag Condition |
|:------|:-----|:---------------|
| Invented metrics | Numbers in rewrite not in original | Flag for review |
| Added companies | Company names in output not in input | Flag for review |
| Role inflation | Seniority in summary > resume signals | Flag for review |

**Note:** Some hallucination checks require human review. Flag, don't auto-fail.

### 2.5 Tone Constraints

| Check | Rule | Fail Condition |
|:------|:-----|:---------------|
| Summary opening | Starts with "You read as..." | Does not match |
| Banned phrases | List of corporate language | Any matches |
| Em-dash ban | No "—" characters | Any present |

**Banned phrase list (from prompt):**
- "strong experience"
- "solid experience"
- "seasoned"
- "strategic initiatives"
- "high-impact"
- "capable engineer"
- "track record"
- "proven"
- "effective communicator"
- "driving results"
- "strategic influence"
- "operational excellence"
- "leveraging expertise"

---

## 3. Human Spot-Check Workflow

### 3.1 Sampling Method

**Weekly sample:** 10 random fixtures from calibration set
**Trigger sample:** After any prompt change, run 5 diverse fixtures

**Selection criteria:**
- At least 1 from each quality tier
- At least 1 career transition case
- At least 1 entry-level case

### 3.2 Review Sheet Format

| Field | Description |
|:------|:------------|
| Fixture ID | Unique identifier |
| Expected score | From calibration metadata |
| Actual score | From eval run |
| Drift | Actual - Expected midpoint |
| Tone pass | Y/N - Does it sound right? |
| Evidence pass | Y/N - Are fixes grounded? |
| Notes | Reviewer observations |
| Verdict | PASS / FAIL / FLAG |

**Review sheet template (Google Sheets or CSV):**
```csv
fixture_id,expected_min,expected_max,actual_score,drift,tone_pass,evidence_pass,notes,verdict
senior_pm_strong_001,78,86,84,+2,Y,Y,"Good",PASS
entry_level_marketing_002,58,66,72,+9,Y,N,"Score inflated, generic fixes",FAIL
```

### 3.3 Pass/Fail Criteria

| Criterion | Pass | Flag | Fail |
|:----------|:-----|:-----|:-----|
| Score drift | ±3 points | ±5 points | ±8+ points |
| Tone | Sounds human | Minor slips | Corporate language |
| Evidence | All fixes grounded | 1-2 weak | Generic advice |
| Format | Schema valid | Minor issues | Parse failure |

---

## 4. Shipping Gates

### 4.1 "Cannot Ship Unless..." Rules

**Before ANY prompt deployment:**

- [ ] All calibration fixtures pass format checks
- [ ] 95%+ fixtures within score tolerance (±5 points)
- [ ] 0 fixtures with banned phrase matches
- [ ] Human spot-check of 5 diverse cases: all PASS
- [ ] No P0 regressions from previous version

### 4.2 Regression Definition

| Severity | Definition | Action |
|:---------|:-----------|:-------|
| P0 | Score drift >10 points on any fixture | Block deploy, investigate |
| P1 | Banned phrase appears in output | Block deploy, fix |
| P2 | Score drift 5-10 points on 3+ fixtures | Review before deploy |
| P3 | Minor tone inconsistency | Note, proceed |

---

## 5. How to Run Evals

### 5.1 Local Eval Script

**Location:** `/tests/run_eval.js` (to be created)

**Usage:**
```bash
# Run full eval
npm run eval

# Run specific fixture
npm run eval -- --fixture senior_pm_strong_001

# Run with verbose output
npm run eval -- --verbose
```

**Script outline:**
```javascript
// tests/run_eval.js
const fixtures = require('./fixtures/calibration.json');
const { analyzeResume } = require('../web/lib/backend/analyze');

async function runEval(options) {
  const results = [];
  
  for (const fixture of fixtures.fixtures) {
    const resumeText = await readFile(`./resumes/${fixture.filename}`, 'utf8');
    const output = await analyzeResume(resumeText);
    
    const checks = {
      format: checkFormatCompliance(output),
      score: checkScoreRange(output.score, fixture.expected_score_range),
      tone: checkToneConstraints(output),
      specificity: checkSpecificity(output, resumeText),
    };
    
    results.push({
      fixtureId: fixture.id,
      passed: Object.values(checks).every(c => c.passed),
      checks,
    });
  }
  
  return results;
}
```

### 5.2 CI Integration (Optional)

**When CI exists, add to workflow:**

```yaml
# .github/workflows/eval.yml
name: Prompt Eval
on:
  pull_request:
    paths:
      - 'prompts/**'
      - 'web/prompts/**'

jobs:
  eval:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
      - name: Install deps
        run: npm ci
      - name: Run eval
        run: npm run eval
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

**Gate:** PR cannot merge if eval fails

---

## 6. Eval Output Report

### 6.1 Summary Format

```
EVAL REPORT - 2025-12-28
========================
Prompt: resume_v1
Fixtures: 50
Duration: 4m 32s

RESULTS
-------
✅ Passed: 47/50 (94%)
⚠️ Flagged: 2/50 (4%)
❌ Failed: 1/50 (2%)

FAILURES
--------
[entry_level_sparse_007]
  Expected: 45-55
  Actual: 63
  Issue: Score inflated for thin content

FLAGS
-----
[career_transition_003]
  Expected: 65-73
  Actual: 68
  Note: Subscore drift on 'story' dimension (+12)

[executive_long_015]
  Expected: 80-88
  Actual: 84
  Note: Minor tone slip ("leveraging")
```

### 6.2 Diff Summary (on prompt changes)

```
PROMPT DIFF IMPACT
==================
Changes: +15 lines, -3 lines
Affected: Scoring rubric section

BEFORE → AFTER
--------------
Avg score: 72.4 → 73.1 (+0.7)
Score std dev: 12.3 → 11.8 (-0.5)
Tone failures: 2 → 0 (-2)
```

---

## 7. Implementation Priority

| Item | Effort | Priority |
|:-----|:-------|:---------|
| Calibration metadata file (calibration.json) | 1 day | P1 |
| Format compliance checks | 2 hours | P1 |
| Tone constraint checks | 2 hours | P1 |
| run_eval.js script | 4 hours | P1 |
| Human review sheet template | 1 hour | P1 |
| Specificity checks | 4 hours | P2 |
| Hallucination flags | 4 hours | P2 |
| CI integration | 2 hours | P3 |

---

*Generated by A6 Evals and Regression Gates Lead — 2025-12-28*
