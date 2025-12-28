# PromptOps Eval Report

**Run ID:** eval_1766963884871
**Timestamp:** 2025-12-28T23:21:07.397Z
**Tier:** golden
**Prompt Version:** v1
**Contract Version:** v2

## Summary

| Metric | Value |
|:-------|:------|
| Total Fixtures | 17 |
| ✅ Passed | 1 |
| ⚠️ Warned | 15 |
| ❌ Failed | 1 |
| Pass Rate | 5.9% |

## Cost

| Metric | Value |
|:-------|:------|
| API Calls | 17 |
| Actual Cost | $0.4250 |
| Budget | $2.00 |

## ❌ Blocking Failures

These must be fixed before shipping.

### synth_marketing_manager_vp_elite_1

**Status:** FAIL
**Score:** 90 (expected: 85–95)

**Errors (ship blockers):**
- `E_BANNED_PHRASE`: Contains banned phrase: "strategic initiatives"

**Warnings:**
- `W_EVIDENCE_PARAPHRASE`: Fix 1 evidence not verbatim match after normalization
- `W_SPECIFICITY_LOW`: Fix 1 lacks concrete tokens (digits, %, measurable nouns, time bounds)
- `W_SPECIFICITY_LOW`: Fix 2 lacks concrete tokens (digits, %, measurable nouns, time bounds)
- `W_SPECIFICITY_LOW`: Fix 4 lacks concrete tokens (digits, %, measurable nouns, time bounds)

**Evidence Issues:**
- Fix 1: paraphrase

## ⚠️ Warnings (Review Recommended)

### anchor_elite_ml_staff_1

**Status:** WARN
**Score:** 94 (expected: 90–98)

**Warnings:**
- `W_SPECIFICITY_LOW`: Fix 1 lacks concrete tokens (digits, %, measurable nouns, time bounds)
- `W_SPECIFICITY_LOW`: Fix 2 lacks concrete tokens (digits, %, measurable nouns, time bounds)
- `W_SPECIFICITY_LOW`: Fix 3 lacks concrete tokens (digits, %, measurable nouns, time bounds)
- `W_SPECIFICITY_LOW`: Fix 4 lacks concrete tokens (digits, %, measurable nouns, time bounds)
- `W_SPECIFICITY_LOW`: Fix 5 lacks concrete tokens (digits, %, measurable nouns, time bounds)

### anchor_elite_pm_ai_1

**Status:** WARN
**Score:** 93 (expected: 90–98)

**Warnings:**
- `W_SPECIFICITY_LOW`: Fix 2 lacks concrete tokens (digits, %, measurable nouns, time bounds)
- `W_SPECIFICITY_LOW`: Fix 3 lacks concrete tokens (digits, %, measurable nouns, time bounds)
- `W_SPECIFICITY_LOW`: Fix 4 lacks concrete tokens (digits, %, measurable nouns, time bounds)
- `W_SPECIFICITY_LOW`: Fix 5 lacks concrete tokens (digits, %, measurable nouns, time bounds)

### anchor_elite_vp_talent_1

**Status:** WARN
**Score:** 93 (expected: 90–98)

**Warnings:**
- `W_SPECIFICITY_LOW`: Fix 3 lacks concrete tokens (digits, %, measurable nouns, time bounds)
- `W_SPECIFICITY_LOW`: Fix 4 lacks concrete tokens (digits, %, measurable nouns, time bounds)

### devops_senior_high_bar_1

**Status:** WARN
**Score:** 87 (expected: 84–92)

**Warnings:**
- `W_EVIDENCE_PARAPHRASE`: Fix 5 evidence not verbatim match after normalization
- `W_SPECIFICITY_LOW`: Fix 2 lacks concrete tokens (digits, %, measurable nouns, time bounds)
- `W_SPECIFICITY_LOW`: Fix 4 lacks concrete tokens (digits, %, measurable nouns, time bounds)

**Evidence Issues:**
- Fix 5: paraphrase

### law_inhouse_thin_signal_1

**Status:** WARN
**Score:** 74 (expected: 68–78)

**Warnings:**
- `W_EVIDENCE_PARAPHRASE`: Fix 3 evidence not verbatim match after normalization
- `W_SPECIFICITY_LOW`: Fix 1 lacks concrete tokens (digits, %, measurable nouns, time bounds)
- `W_SPECIFICITY_LOW`: Fix 3 lacks concrete tokens (digits, %, measurable nouns, time bounds)
- `W_SPECIFICITY_LOW`: Fix 4 lacks concrete tokens (digits, %, measurable nouns, time bounds)
- `W_SPECIFICITY_LOW`: Fix 5 lacks concrete tokens (digits, %, measurable nouns, time bounds)

**Evidence Issues:**
- Fix 3: paraphrase

### finance_not_ready_sam_helmuth_1

**Status:** WARN
**Score:** 62 (expected: 58–68)

**Warnings:**
- `W_SPECIFICITY_LOW`: Fix 2 lacks concrete tokens (digits, %, measurable nouns, time bounds)
- `W_SPECIFICITY_LOW`: Fix 3 lacks concrete tokens (digits, %, measurable nouns, time bounds)
- `W_SPECIFICITY_LOW`: Fix 4 lacks concrete tokens (digits, %, measurable nouns, time bounds)
- `W_DISCOURAGED_PHRASE`: Contains discouraged phrase: "seasoned professional"

### synth_data_scientist_senior_elite_1

**Status:** WARN
**Score:** 88 (expected: 85–95)

**Warnings:**
- `W_EVIDENCE_PARAPHRASE`: Fix 1 evidence not verbatim match after normalization
- `W_EVIDENCE_PARAPHRASE`: Fix 3 evidence not verbatim match after normalization
- `W_SPECIFICITY_LOW`: Fix 1 lacks concrete tokens (digits, %, measurable nouns, time bounds)
- `W_SPECIFICITY_LOW`: Fix 2 lacks concrete tokens (digits, %, measurable nouns, time bounds)
- `W_SPECIFICITY_LOW`: Fix 5 lacks concrete tokens (digits, %, measurable nouns, time bounds)

**Evidence Issues:**
- Fix 1: paraphrase
- Fix 3: paraphrase

### synth_software_engineer_mid_strong_1

**Status:** WARN
**Score:** 82 (expected: 78–88)

**Warnings:**
- `W_SPECIFICITY_LOW`: Fix 2 lacks concrete tokens (digits, %, measurable nouns, time bounds)
- `W_SPECIFICITY_LOW`: Fix 3 lacks concrete tokens (digits, %, measurable nouns, time bounds)
- `W_SPECIFICITY_LOW`: Fix 4 lacks concrete tokens (digits, %, measurable nouns, time bounds)

### synth_ux_designer_director_strong_1

**Status:** WARN
**Score:** 83 (expected: 78–88)

**Warnings:**
- `W_SPECIFICITY_LOW`: Fix 2 lacks concrete tokens (digits, %, measurable nouns, time bounds)
- `W_SPECIFICITY_LOW`: Fix 3 lacks concrete tokens (digits, %, measurable nouns, time bounds)
- `W_SPECIFICITY_LOW`: Fix 4 lacks concrete tokens (digits, %, measurable nouns, time bounds)
- `W_SPECIFICITY_LOW`: Fix 5 lacks concrete tokens (digits, %, measurable nouns, time bounds)

### synth_sales_executive_mid_foundation_1

**Status:** WARN
**Score:** 68 (expected: 68–78)

**Warnings:**
- `W_SPECIFICITY_LOW`: Fix 5 lacks concrete tokens (digits, %, measurable nouns, time bounds)
- `W_DISCOURAGED_PHRASE`: Contains discouraged phrase: "solid experience"

### synth_hr_manager_director_foundation_1

**Status:** WARN
**Score:** 68 (expected: 68–78)

**Warnings:**
- `W_SPECIFICITY_LOW`: Fix 1 lacks concrete tokens (digits, %, measurable nouns, time bounds)
- `W_SPECIFICITY_LOW`: Fix 2 lacks concrete tokens (digits, %, measurable nouns, time bounds)
- `W_SPECIFICITY_LOW`: Fix 4 lacks concrete tokens (digits, %, measurable nouns, time bounds)
- `W_SPECIFICITY_LOW`: Fix 5 lacks concrete tokens (digits, %, measurable nouns, time bounds)

### synth_finance_analyst_senior_weak_1

**Status:** WARN
**Score:** 62 (expected: 55–68)

**Warnings:**
- `W_SPECIFICITY_LOW`: Fix 1 lacks concrete tokens (digits, %, measurable nouns, time bounds)
- `W_SPECIFICITY_LOW`: Fix 2 lacks concrete tokens (digits, %, measurable nouns, time bounds)
- `W_SPECIFICITY_LOW`: Fix 3 lacks concrete tokens (digits, %, measurable nouns, time bounds)
- `W_SPECIFICITY_LOW`: Fix 4 lacks concrete tokens (digits, %, measurable nouns, time bounds)
- `W_SPECIFICITY_LOW`: Fix 5 lacks concrete tokens (digits, %, measurable nouns, time bounds)

### synth_operations_manager_entry_weak_1

**Status:** WARN
**Score:** 58 (expected: 55–68)

**Warnings:**
- `W_SPECIFICITY_LOW`: Fix 2 lacks concrete tokens (digits, %, measurable nouns, time bounds)
- `W_SPECIFICITY_LOW`: Fix 4 lacks concrete tokens (digits, %, measurable nouns, time bounds)
- `W_SPECIFICITY_LOW`: Fix 5 lacks concrete tokens (digits, %, measurable nouns, time bounds)

### synth_project_manager_vp_strong_1

**Status:** WARN
**Score:** 85 (expected: 75–85)

**Warnings:**
- `W_SPECIFICITY_LOW`: Fix 1 lacks concrete tokens (digits, %, measurable nouns, time bounds)
- `W_SPECIFICITY_LOW`: Fix 3 lacks concrete tokens (digits, %, measurable nouns, time bounds)
- `W_SPECIFICITY_LOW`: Fix 4 lacks concrete tokens (digits, %, measurable nouns, time bounds)
- `W_SPECIFICITY_LOW`: Fix 5 lacks concrete tokens (digits, %, measurable nouns, time bounds)
- `W_SUMMARY_STRUCTURE`: Summary missing: strength indicator
- `W_DISCOURAGED_PHRASE`: Contains discouraged phrase: "high-impact"

### synth_product_manager_entry_elite_1

**Status:** WARN
**Score:** 85 (expected: 82–92)

**Warnings:**
- `W_SPECIFICITY_LOW`: Fix 1 lacks concrete tokens (digits, %, measurable nouns, time bounds)
- `W_SPECIFICITY_LOW`: Fix 2 lacks concrete tokens (digits, %, measurable nouns, time bounds)
- `W_SPECIFICITY_LOW`: Fix 4 lacks concrete tokens (digits, %, measurable nouns, time bounds)
- `W_SPECIFICITY_LOW`: Fix 5 lacks concrete tokens (digits, %, measurable nouns, time bounds)

## ✅ Passed

1 fixtures passed all checks.

<details>
<summary>Expand to see fixture IDs</summary>

- recruiter_palantir_strong_foundation_1 (score: 83)
</details>
