# PromptOps Live Eval Report

**Run ID:** eval_1794931229682
**Timestamp:** 2026-11-17T16:08:11.173Z
**Tier:** golden
**Prompt Version:** v1
**Contract Version:** v3
**Execution Mode:** Live model evaluation
**Model:** gpt-6.1-terra
**Reasoning effort:** medium
**Resume prompt SHA-256:** 31aaaaa165a693ca738aa2ab774bde8497f256a9472501edc1e12f0debca674d
**Resume ideas prompt SHA-256:** 6d90925e63aae15476712f92af5ffbdf4e684feec413711e14d6dba7201b6fc7
**Incomplete-response retry:** high reasoning

## Summary

| Metric | Value |
|:-------|:------|
| Total Fixtures | 30 |
| ✅ Passed | 26 |
| ⚠️ Warned | 4 |
| ❌ Failed | 0 |
| Pass Rate | 86.7% |

## Cost

| Metric | Value |
|:-------|:------|
| API Calls | 32 |
| Token-calculated API Cost | $0.375952 |
| Input Tokens | 290,481 |
| Cached Input Tokens | 283,471 |
| Output Tokens | 70,608 |
| Reasoning Tokens | 23,994 |
| Budget | $5.00 |

## ⚠️ Warnings (Review Recommended)

### synth_software_engineer_mid_strong_1

**Status:** WARN
**Score:** 69 (expected: 64–83)

**Warnings:**
- `W_MECHANICAL_COPY`: write_up.2 repeats the clause "the work you"

### synth_sales_executive_mid_foundation_1

**Status:** WARN
**Score:** 44 (expected: 40–58)

**Warnings:**
- `W_MECHANICAL_COPY`: cards.1.question repeats a full sentence from verdict

### synth_hr_manager_director_foundation_1

**Status:** WARN
**Score:** 49 (expected: 45–59)

**Warnings:**
- `W_MECHANICAL_COPY`: fit.note repeats the clause "the work you"

### synth_product_manager_entry_elite_1

**Status:** WARN
**Score:** 78 (expected: 70–83)

**Warnings:**
- `W_SPECIFICITY_LOW`: Card 1 example has no blank to fill

## Score Test-Retest

| Fixture | Scores | Range | Mean | SD |
|:--------|:-------|:------|:-----|:---|
| synth_data_scientist_senior_elite_1 | 96, 96, 95 | 1 | 95.7 | 0.6 |
| synth_marketing_manager_vp_elite_1 | 94, 94, 95 | 1 | 94.3 | 0.6 |
| synth_software_engineer_mid_strong_1 | 75, 74, 69 | 6 | 72.7 | 3.2 |
| synth_ux_designer_director_strong_1 | 80, 80, 81 | 1 | 80.3 | 0.6 |
| synth_sales_executive_mid_foundation_1 | 44, 43, 44 | 1 | 43.7 | 0.6 |
| synth_hr_manager_director_foundation_1 | 49, 53, 49 | 4 | 50.3 | 2.3 |
| synth_finance_analyst_senior_weak_1 | 49, 45, 46 | 4 | 46.7 | 2.1 |
| synth_operations_manager_entry_weak_1 | 47, 43, 43 | 4 | 44.3 | 2.3 |
| synth_project_manager_vp_strong_1 | 78, 76, 78 | 2 | 77.3 | 1.2 |
| synth_product_manager_entry_elite_1 | 78, 78, 78 | 0 | 78 | 0 |

## ✅ Passed

26 fixtures passed all checks.

<details>
<summary>Expand to see fixture IDs</summary>

- synth_data_scientist_senior_elite_1 (score: 96)
- synth_data_scientist_senior_elite_1 (score: 96)
- synth_data_scientist_senior_elite_1 (score: 95)
- synth_marketing_manager_vp_elite_1 (score: 94)
- synth_marketing_manager_vp_elite_1 (score: 94)
- synth_marketing_manager_vp_elite_1 (score: 95)
- synth_software_engineer_mid_strong_1 (score: 75)
- synth_software_engineer_mid_strong_1 (score: 74)
- synth_ux_designer_director_strong_1 (score: 80)
- synth_ux_designer_director_strong_1 (score: 80)
- synth_ux_designer_director_strong_1 (score: 81)
- synth_sales_executive_mid_foundation_1 (score: 44)
- synth_sales_executive_mid_foundation_1 (score: 43)
- synth_hr_manager_director_foundation_1 (score: 53)
- synth_hr_manager_director_foundation_1 (score: 49)
- synth_finance_analyst_senior_weak_1 (score: 49)
- synth_finance_analyst_senior_weak_1 (score: 45)
- synth_finance_analyst_senior_weak_1 (score: 46)
- synth_operations_manager_entry_weak_1 (score: 47)
- synth_operations_manager_entry_weak_1 (score: 43)
- synth_operations_manager_entry_weak_1 (score: 43)
- synth_project_manager_vp_strong_1 (score: 78)
- synth_project_manager_vp_strong_1 (score: 76)
- synth_project_manager_vp_strong_1 (score: 78)
- synth_product_manager_entry_elite_1 (score: 78)
- synth_product_manager_entry_elite_1 (score: 78)
</details>
