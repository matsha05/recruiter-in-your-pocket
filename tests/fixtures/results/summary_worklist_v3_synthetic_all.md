# PromptOps Live Eval Report

**Run ID:** eval_1793935884432
**Timestamp:** 2026-11-06T03:33:02.762Z
**Tier:** golden
**Prompt Version:** v1
**Contract Version:** v3
**Execution Mode:** Live model evaluation
**Model:** gpt-6.1-terra
**Reasoning effort:** medium
**Resume prompt SHA-256:** b2c0d186992d2d925493008c0a67067de9f704dc44ec074808b3bc7176463d9a
**Resume ideas prompt SHA-256:** 6d90925e63aae15476712f92af5ffbdf4e684feec413711e14d6dba7201b6fc7
**Incomplete-response retry:** high reasoning

## Summary

| Metric | Value |
|:-------|:------|
| Total Fixtures | 10 |
| ✅ Passed | 9 |
| ⚠️ Warned | 1 |
| ❌ Failed | 0 |
| Pass Rate | 90.0% |

## Cost

| Metric | Value |
|:-------|:------|
| API Calls | 11 |
| Token-calculated API Cost | $0.119923 |
| Input Tokens | 51,321 |
| Cached Input Tokens | 27,108 |
| Output Tokens | 17,662 |
| Reasoning Tokens | 4,698 |
| Budget | $15.00 |

## ⚠️ Warnings (Review Recommended)

### synth_sales_executive_mid_foundation_1

**Status:** WARN
**Score:** 60 (expected: 55–68)

**Warnings:**
- `W_MECHANICAL_COPY`: cards.5.question repeats the clause "what did you"

## Score Test-Retest

Each fixture was generated once, so test-retest was not measured. Use `--repeat <n>`, or replay several saved runs of the same fixtures together.

## ✅ Passed

9 fixtures passed all checks.

<details>
<summary>Expand to see fixture IDs</summary>

- synth_data_scientist_senior_elite_1 (score: 93)
- synth_marketing_manager_vp_elite_1 (score: 91)
- synth_software_engineer_mid_strong_1 (score: 78)
- synth_ux_designer_director_strong_1 (score: 83)
- synth_hr_manager_director_foundation_1 (score: 63)
- synth_finance_analyst_senior_weak_1 (score: 52)
- synth_operations_manager_entry_weak_1 (score: 55)
- synth_project_manager_vp_strong_1 (score: 79)
- synth_product_manager_entry_elite_1 (score: 83)
</details>
