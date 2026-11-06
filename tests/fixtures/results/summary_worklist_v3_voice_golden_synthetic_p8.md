# PromptOps Live Eval Report

**Run ID:** eval_1793988820713
**Timestamp:** 2026-11-06T18:15:34.620Z
**Tier:** golden
**Prompt Version:** v1
**Contract Version:** v3
**Execution Mode:** Live model evaluation
**Model:** gpt-6.1-terra
**Reasoning effort:** medium
**Resume prompt SHA-256:** 0a19c3ee70395ec8fb0584d4bea1b93da77aeca37469b4d47211bc8568544f0c
**Resume ideas prompt SHA-256:** 6d90925e63aae15476712f92af5ffbdf4e684feec413711e14d6dba7201b6fc7
**Incomplete-response retry:** high reasoning

## Summary

| Metric | Value |
|:-------|:------|
| Total Fixtures | 10 |
| ✅ Passed | 6 |
| ⚠️ Warned | 4 |
| ❌ Failed | 0 |
| Pass Rate | 60.0% |

## Cost

| Metric | Value |
|:-------|:------|
| API Calls | 10 |
| Token-calculated API Cost | $0.116885 |
| Input Tokens | 60,903 |
| Cached Input Tokens | 41,418 |
| Output Tokens | 18,093 |
| Reasoning Tokens | 5,404 |
| Budget | $2.00 |

## ⚠️ Warnings (Review Recommended)

### synth_sales_executive_mid_foundation_1

**Status:** WARN
**Score:** 47 (expected: 55–68)

**Warnings:**
- `W_SCORE_DRIFT`: Score 47 outside expected range [55, 68]
- `W_MECHANICAL_COPY`: cards.5.cannot_tell repeats the clause "what did you"

### synth_finance_analyst_senior_weak_1

**Status:** WARN
**Score:** 46 (expected: 55–68)

**Warnings:**
- `W_SCORE_DRIFT`: Score 46 outside expected range [55, 68]

### synth_operations_manager_entry_weak_1

**Status:** WARN
**Score:** 44 (expected: 55–68)

**Warnings:**
- `W_SCORE_DRIFT`: Score 44 outside expected range [55, 68]

### synth_product_manager_entry_elite_1

**Status:** WARN
**Score:** 74 (expected: 82–92)

**Warnings:**
- `W_SCORE_DRIFT`: Score 74 outside expected range [82, 92]
- `W_SPECIFICITY_LOW`: Card 1 example has no blank to fill

## Score Test-Retest

Each fixture was generated once, so test-retest was not measured. Use `--repeat <n>`, or replay several saved runs of the same fixtures together.

## ✅ Passed

6 fixtures passed all checks.

<details>
<summary>Expand to see fixture IDs</summary>

- synth_data_scientist_senior_elite_1 (score: 95)
- synth_marketing_manager_vp_elite_1 (score: 90)
- synth_software_engineer_mid_strong_1 (score: 76)
- synth_ux_designer_director_strong_1 (score: 84)
- synth_hr_manager_director_foundation_1 (score: 55)
- synth_project_manager_vp_strong_1 (score: 80)
</details>
