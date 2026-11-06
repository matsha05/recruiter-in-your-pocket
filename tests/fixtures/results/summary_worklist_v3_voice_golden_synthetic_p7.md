# PromptOps Live Eval Report

**Run ID:** eval_1793987974952
**Timestamp:** 2026-11-06T18:01:39.497Z
**Tier:** golden
**Prompt Version:** v1
**Contract Version:** v3
**Execution Mode:** Live model evaluation
**Model:** gpt-6.1-terra
**Reasoning effort:** medium
**Resume prompt SHA-256:** 6eb03ddb4b32b2b65339085225b39b2ec67a805518799139b60e8c299167a186
**Resume ideas prompt SHA-256:** 6d90925e63aae15476712f92af5ffbdf4e684feec413711e14d6dba7201b6fc7
**Incomplete-response retry:** high reasoning

## Summary

| Metric | Value |
|:-------|:------|
| Total Fixtures | 10 |
| ✅ Passed | 7 |
| ⚠️ Warned | 3 |
| ❌ Failed | 0 |
| Pass Rate | 70.0% |

## Cost

| Metric | Value |
|:-------|:------|
| API Calls | 11 |
| Token-calculated API Cost | $0.128584 |
| Input Tokens | 66,948 |
| Cached Input Tokens | 40,077 |
| Output Tokens | 18,600 |
| Reasoning Tokens | 5,236 |
| Budget | $2.00 |

## ⚠️ Warnings (Review Recommended)

### synth_sales_executive_mid_foundation_1

**Status:** WARN
**Score:** 47 (expected: 55–68)

**Warnings:**
- `W_SCORE_DRIFT`: Score 47 outside expected range [55, 68]

### synth_operations_manager_entry_weak_1

**Status:** WARN
**Score:** 46 (expected: 55–68)

**Warnings:**
- `W_SCORE_DRIFT`: Score 46 outside expected range [55, 68]

### synth_project_manager_vp_strong_1

**Status:** WARN
**Score:** 80 (expected: 75–85)

**Warnings:**
- `W_MECHANICAL_COPY`: cards.11.question repeats the clause "did you work"

## Score Test-Retest

Each fixture was generated once, so test-retest was not measured. Use `--repeat <n>`, or replay several saved runs of the same fixtures together.

## ✅ Passed

7 fixtures passed all checks.

<details>
<summary>Expand to see fixture IDs</summary>

- synth_data_scientist_senior_elite_1 (score: 95)
- synth_marketing_manager_vp_elite_1 (score: 95)
- synth_software_engineer_mid_strong_1 (score: 79)
- synth_ux_designer_director_strong_1 (score: 80)
- synth_hr_manager_director_foundation_1 (score: 55)
- synth_finance_analyst_senior_weak_1 (score: 51)
- synth_product_manager_entry_elite_1 (score: 78)
</details>
