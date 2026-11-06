# PromptOps Live Eval Report

**Run ID:** eval_1793987629042
**Timestamp:** 2026-11-06T17:55:57.143Z
**Tier:** golden
**Prompt Version:** v1
**Contract Version:** v3
**Execution Mode:** Live model evaluation
**Model:** gpt-6.1-terra
**Reasoning effort:** medium
**Resume prompt SHA-256:** f4ff18ca80174dffdce77796c99b298e4ced5fdab817d0ec307d0b591839e910
**Resume ideas prompt SHA-256:** 6d90925e63aae15476712f92af5ffbdf4e684feec413711e14d6dba7201b6fc7
**Incomplete-response retry:** high reasoning

## Summary

| Metric | Value |
|:-------|:------|
| Total Fixtures | 10 |
| ✅ Passed | 5 |
| ⚠️ Warned | 5 |
| ❌ Failed | 0 |
| Pass Rate | 50.0% |

## Cost

| Metric | Value |
|:-------|:------|
| API Calls | 11 |
| Token-calculated API Cost | $0.135347 |
| Input Tokens | 66,559 |
| Cached Input Tokens | 39,582 |
| Output Tokens | 19,931 |
| Reasoning Tokens | 5,517 |
| Budget | $2.00 |

## ⚠️ Warnings (Review Recommended)

### synth_sales_executive_mid_foundation_1

**Status:** WARN
**Score:** 46 (expected: 55–68)

**Warnings:**
- `W_SCORE_DRIFT`: Score 46 outside expected range [55, 68]

### synth_hr_manager_director_foundation_1

**Status:** WARN
**Score:** 50 (expected: 55–68)

**Warnings:**
- `W_SCORE_DRIFT`: Score 50 outside expected range [55, 68]

### synth_finance_analyst_senior_weak_1

**Status:** WARN
**Score:** 45 (expected: 55–68)

**Warnings:**
- `W_SCORE_DRIFT`: Score 45 outside expected range [55, 68]

### synth_operations_manager_entry_weak_1

**Status:** WARN
**Score:** 43 (expected: 55–68)

**Warnings:**
- `W_SCORE_DRIFT`: Score 43 outside expected range [55, 68]

### synth_product_manager_entry_elite_1

**Status:** WARN
**Score:** 78 (expected: 82–92)

**Warnings:**
- `W_SPECIFICITY_LOW`: Card 1 example has no blank to fill

## Score Test-Retest

Each fixture was generated once, so test-retest was not measured. Use `--repeat <n>`, or replay several saved runs of the same fixtures together.

## ✅ Passed

5 fixtures passed all checks.

<details>
<summary>Expand to see fixture IDs</summary>

- synth_data_scientist_senior_elite_1 (score: 96)
- synth_marketing_manager_vp_elite_1 (score: 90)
- synth_software_engineer_mid_strong_1 (score: 77)
- synth_ux_designer_director_strong_1 (score: 81)
- synth_project_manager_vp_strong_1 (score: 76)
</details>
