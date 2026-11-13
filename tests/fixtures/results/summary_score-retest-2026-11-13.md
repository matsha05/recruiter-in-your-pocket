# PromptOps Live Eval Report

**Run ID:** eval_1794596444924
**Timestamp:** 2026-11-13T19:08:02.240Z
**Tier:** golden
**Prompt Version:** v1
**Contract Version:** v3
**Execution Mode:** Live model evaluation
**Model:** gpt-6.1-terra
**Reasoning effort:** medium
**Resume prompt SHA-256:** 22a90f2273de5ce42637d4e17bd153524479681571b5471df18782f6b1bb6e6c
**Resume ideas prompt SHA-256:** 6d90925e63aae15476712f92af5ffbdf4e684feec413711e14d6dba7201b6fc7
**Incomplete-response retry:** high reasoning

## Summary

| Metric | Value |
|:-------|:------|
| Total Fixtures | 40 |
| ✅ Passed | 38 |
| ⚠️ Warned | 2 |
| ❌ Failed | 0 |
| Pass Rate | 95.0% |

## Cost

| Metric | Value |
|:-------|:------|
| API Calls | 41 |
| Token-calculated API Cost | $0.491854 |
| Input Tokens | 367,163 |
| Cached Input Tokens | 332,895 |
| Output Tokens | 86,481 |
| Reasoning Tokens | 27,759 |
| Budget | $6.00 |

## ⚠️ Warnings (Review Recommended)

### synth_sales_executive_mid_foundation_1

**Status:** WARN
**Score:** 42 (expected: 40–58)

**Warnings:**
- `W_MECHANICAL_COPY`: cards.1.question repeats a full sentence from verdict

### synth_project_manager_vp_strong_1

**Status:** WARN
**Score:** 81 (expected: 72–85)

**Warnings:**
- `W_MECHANICAL_COPY`: cards.10.question repeats a full sentence from cards.5.question

## Score Test-Retest

| Fixture | Scores | Range | Mean | SD |
|:--------|:-------|:------|:-----|:---|
| synth_data_scientist_senior_elite_1 | 95, 94, 95, 95 | 1 | 94.8 | 0.5 |
| synth_marketing_manager_vp_elite_1 | 94, 94, 94, 94 | 0 | 94 | 0 |
| synth_software_engineer_mid_strong_1 | 76, 77, 76, 77 | 1 | 76.5 | 0.6 |
| synth_ux_designer_director_strong_1 | 85, 80, 81, 80 | 5 | 81.5 | 2.4 |
| synth_sales_executive_mid_foundation_1 | 42, 44, 47, 42 | 5 | 43.8 | 2.4 |
| synth_hr_manager_director_foundation_1 | 49, 49, 52, 51 | 3 | 50.3 | 1.5 |
| synth_finance_analyst_senior_weak_1 | 45, 49, 44, 49 | 5 | 46.8 | 2.6 |
| synth_operations_manager_entry_weak_1 | 48, 43, 45, 43 | 5 | 44.8 | 2.4 |
| synth_project_manager_vp_strong_1 | 79, 79, 81, 80 | 2 | 79.8 | 1 |
| synth_product_manager_entry_elite_1 | 78, 76, 78, 80 | 4 | 78 | 1.6 |

## ✅ Passed

38 fixtures passed all checks.

<details>
<summary>Expand to see fixture IDs</summary>

- synth_data_scientist_senior_elite_1 (score: 95)
- synth_data_scientist_senior_elite_1 (score: 94)
- synth_data_scientist_senior_elite_1 (score: 95)
- synth_data_scientist_senior_elite_1 (score: 95)
- synth_marketing_manager_vp_elite_1 (score: 94)
- synth_marketing_manager_vp_elite_1 (score: 94)
- synth_marketing_manager_vp_elite_1 (score: 94)
- synth_marketing_manager_vp_elite_1 (score: 94)
- synth_software_engineer_mid_strong_1 (score: 76)
- synth_software_engineer_mid_strong_1 (score: 77)
- synth_software_engineer_mid_strong_1 (score: 76)
- synth_software_engineer_mid_strong_1 (score: 77)
- synth_ux_designer_director_strong_1 (score: 85)
- synth_ux_designer_director_strong_1 (score: 80)
- synth_ux_designer_director_strong_1 (score: 81)
- synth_ux_designer_director_strong_1 (score: 80)
- synth_sales_executive_mid_foundation_1 (score: 42)
- synth_sales_executive_mid_foundation_1 (score: 44)
- synth_sales_executive_mid_foundation_1 (score: 47)
- synth_hr_manager_director_foundation_1 (score: 49)
- synth_hr_manager_director_foundation_1 (score: 49)
- synth_hr_manager_director_foundation_1 (score: 52)
- synth_hr_manager_director_foundation_1 (score: 51)
- synth_finance_analyst_senior_weak_1 (score: 45)
- synth_finance_analyst_senior_weak_1 (score: 49)
- synth_finance_analyst_senior_weak_1 (score: 44)
- synth_finance_analyst_senior_weak_1 (score: 49)
- synth_operations_manager_entry_weak_1 (score: 48)
- synth_operations_manager_entry_weak_1 (score: 43)
- synth_operations_manager_entry_weak_1 (score: 45)
- synth_operations_manager_entry_weak_1 (score: 43)
- synth_project_manager_vp_strong_1 (score: 79)
- synth_project_manager_vp_strong_1 (score: 79)
- synth_project_manager_vp_strong_1 (score: 80)
- synth_product_manager_entry_elite_1 (score: 78)
- synth_product_manager_entry_elite_1 (score: 76)
- synth_product_manager_entry_elite_1 (score: 78)
- synth_product_manager_entry_elite_1 (score: 80)
</details>
