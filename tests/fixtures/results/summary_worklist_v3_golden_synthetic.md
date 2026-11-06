# PromptOps Live Eval Report

**Run ID:** eval_1793940617236
**Timestamp:** 2026-11-06T04:52:41.149Z
**Tier:** golden
**Prompt Version:** v1
**Contract Version:** v3
**Execution Mode:** Live model evaluation
**Model:** gpt-6.1-terra
**Reasoning effort:** medium
**Resume prompt SHA-256:** 705c29972bf764486ea54aff743eed45a9ee81f97f985646e94bcbb4963504a4
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
| API Calls | 12 |
| Token-calculated API Cost | $0.139498 |
| Input Tokens | 64,019 |
| Cached Input Tokens | 36,060 |
| Output Tokens | 20,551 |
| Reasoning Tokens | 6,215 |
| Budget | $15.00 |

## ⚠️ Warnings (Review Recommended)

### synth_software_engineer_mid_strong_1

**Status:** WARN
**Score:** 68 (expected: 78–88)

**Warnings:**
- `W_SCORE_DRIFT`: Score 68 outside expected range [78, 88]

### synth_finance_analyst_senior_weak_1

**Status:** WARN
**Score:** 49 (expected: 55–68)

**Warnings:**
- `W_SCORE_DRIFT`: Score 49 outside expected range [55, 68]
- `W_MECHANICAL_COPY`: write_up.1 repeats the clause "you worked on"

### synth_operations_manager_entry_weak_1

**Status:** WARN
**Score:** 46 (expected: 55–68)

**Warnings:**
- `W_SCORE_DRIFT`: Score 46 outside expected range [55, 68]
- `W_MECHANICAL_COPY`: cards.8.cannot_tell repeats a full sentence from cards.2.cannot_tell

### synth_product_manager_entry_elite_1

**Status:** WARN
**Score:** 75 (expected: 82–92)

**Warnings:**
- `W_SCORE_DRIFT`: Score 75 outside expected range [82, 92]
- `W_SPECIFICITY_LOW`: Card 1 example has no blank to fill

## Score Test-Retest

Each fixture was generated once, so test-retest was not measured. Use `--repeat <n>`, or replay several saved runs of the same fixtures together.

## ✅ Passed

6 fixtures passed all checks.

<details>
<summary>Expand to see fixture IDs</summary>

- synth_data_scientist_senior_elite_1 (score: 93)
- synth_marketing_manager_vp_elite_1 (score: 91)
- synth_ux_designer_director_strong_1 (score: 85)
- synth_sales_executive_mid_foundation_1 (score: 54)
- synth_hr_manager_director_foundation_1 (score: 55)
- synth_project_manager_vp_strong_1 (score: 81)
</details>
