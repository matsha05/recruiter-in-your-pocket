# PromptOps Live Eval Report

**Run ID:** eval_1793938227795
**Timestamp:** 2026-11-06T04:12:27.914Z
**Tier:** golden
**Prompt Version:** v1
**Contract Version:** v3
**Execution Mode:** Live model evaluation
**Model:** gpt-6.1-terra
**Reasoning effort:** medium
**Resume prompt SHA-256:** 18e7e9ff21a0c2fda0fe219456e2d1f965de7d79bcc85173eaebd632dd83f42e
**Resume ideas prompt SHA-256:** 6d90925e63aae15476712f92af5ffbdf4e684feec413711e14d6dba7201b6fc7
**Incomplete-response retry:** high reasoning

## Summary

| Metric | Value |
|:-------|:------|
| Total Fixtures | 10 |
| ✅ Passed | 4 |
| ⚠️ Warned | 6 |
| ❌ Failed | 0 |
| Pass Rate | 40.0% |

## Cost

| Metric | Value |
|:-------|:------|
| API Calls | 11 |
| Token-calculated API Cost | $0.131351 |
| Input Tokens | 55,693 |
| Cached Input Tokens | 27,352 |
| Output Tokens | 18,913 |
| Reasoning Tokens | 5,600 |
| Budget | $15.00 |

## ⚠️ Warnings (Review Recommended)

### synth_software_engineer_mid_strong_1

**Status:** WARN
**Score:** 69 (expected: 78–88)

**Warnings:**
- `W_SCORE_DRIFT`: Score 69 outside expected range [78, 88]

### synth_sales_executive_mid_foundation_1

**Status:** WARN
**Score:** 49 (expected: 55–68)

**Warnings:**
- `W_SCORE_DRIFT`: Score 49 outside expected range [55, 68]
- `W_MECHANICAL_COPY`: cards.11.question repeats the clause "did you use"

### synth_finance_analyst_senior_weak_1

**Status:** WARN
**Score:** 48 (expected: 55–68)

**Warnings:**
- `W_SCORE_DRIFT`: Score 48 outside expected range [55, 68]

### synth_operations_manager_entry_weak_1

**Status:** WARN
**Score:** 44 (expected: 55–68)

**Warnings:**
- `W_SCORE_DRIFT`: Score 44 outside expected range [55, 68]

### synth_project_manager_vp_strong_1

**Status:** WARN
**Score:** 80 (expected: 75–85)

**Warnings:**
- `W_MECHANICAL_COPY`: cards.9.question repeats a full sentence from cards.6.question

### synth_product_manager_entry_elite_1

**Status:** WARN
**Score:** 74 (expected: 82–92)

**Warnings:**
- `W_SCORE_DRIFT`: Score 74 outside expected range [82, 92]

## Score Test-Retest

Each fixture was generated once, so test-retest was not measured. Use `--repeat <n>`, or replay several saved runs of the same fixtures together.

## ✅ Passed

4 fixtures passed all checks.

<details>
<summary>Expand to see fixture IDs</summary>

- synth_data_scientist_senior_elite_1 (score: 93)
- synth_marketing_manager_vp_elite_1 (score: 91)
- synth_ux_designer_director_strong_1 (score: 82)
- synth_hr_manager_director_foundation_1 (score: 53)
</details>
