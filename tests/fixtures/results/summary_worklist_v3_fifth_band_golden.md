# PromptOps Live Eval Report

**Run ID:** eval_1793982768003
**Timestamp:** 2026-11-06T16:39:49.052Z
**Tier:** golden
**Prompt Version:** v1
**Contract Version:** v3
**Execution Mode:** Live model evaluation
**Model:** gpt-6.1-terra
**Reasoning effort:** medium
**Resume prompt SHA-256:** 70e795a1e91877ad12f5394154dccd644b9f9d298e123ca182963a0e3e089350
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
| API Calls | 12 |
| Token-calculated API Cost | $0.264655 |
| Input Tokens | 63,566 |
| Cached Input Tokens | 37,090 |
| Output Tokens | 45,943 |
| Reasoning Tokens | 31,881 |
| Budget | $15.00 |

## ⚠️ Warnings (Review Recommended)

### synth_software_engineer_mid_strong_1

**Status:** WARN
**Score:** 68 (expected: 78–88)

**Warnings:**
- `W_SCORE_DRIFT`: Score 68 outside expected range [78, 88]

### synth_sales_executive_mid_foundation_1

**Status:** WARN
**Score:** 46 (expected: 55–68)

**Warnings:**
- `W_SCORE_DRIFT`: Score 46 outside expected range [55, 68]

### synth_operations_manager_entry_weak_1

**Status:** WARN
**Score:** 43 (expected: 55–68)

**Warnings:**
- `W_SCORE_DRIFT`: Score 43 outside expected range [55, 68]

## Score Test-Retest

Each fixture was generated once, so test-retest was not measured. Use `--repeat <n>`, or replay several saved runs of the same fixtures together.

## ✅ Passed

7 fixtures passed all checks.

<details>
<summary>Expand to see fixture IDs</summary>

- synth_data_scientist_senior_elite_1 (score: 94)
- synth_marketing_manager_vp_elite_1 (score: 89)
- synth_ux_designer_director_strong_1 (score: 85)
- synth_hr_manager_director_foundation_1 (score: 52)
- synth_finance_analyst_senior_weak_1 (score: 58)
- synth_project_manager_vp_strong_1 (score: 79)
- synth_product_manager_entry_elite_1 (score: 78)
</details>
