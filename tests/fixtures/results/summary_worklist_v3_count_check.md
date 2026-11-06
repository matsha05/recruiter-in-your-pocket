# PromptOps Live Eval Report

**Run ID:** eval_1793938453750
**Timestamp:** 2026-11-06T04:15:17.654Z
**Tier:** bulk
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
| Total Fixtures | 12 |
| ✅ Passed | 11 |
| ⚠️ Warned | 1 |
| ❌ Failed | 0 |
| Pass Rate | 91.7% |

## Cost

| Metric | Value |
|:-------|:------|
| API Calls | 12 |
| Token-calculated API Cost | $0.079671 |
| Input Tokens | 49,035 |
| Cached Input Tokens | 41,028 |
| Output Tokens | 13,524 |
| Reasoning Tokens | 4,499 |
| Budget | $15.00 |

## ⚠️ Warnings (Review Recommended)

### synth_cc_sales_rep_bad_1

**Status:** WARN
**Score:** 59 (expected: 45–85)

**Warnings:**
- `W_SPECIFICITY_LOW`: Card 1 example has no blank to fill

## Score Test-Retest

Each fixture was generated once, so test-retest was not measured. Use `--repeat <n>`, or replay several saved runs of the same fixtures together.

## ✅ Passed

11 fixtures passed all checks.

<details>
<summary>Expand to see fixture IDs</summary>

- synth_cc_operations_manager_bad_1 (score: 59)
- synth_cc_career_changer_bad_1 (score: 64)
- synth_cc_marketing_director_bad_1 (score: 59)
- synth_cc_admin_generalist_bad_1 (score: 57)
- synth_cc_staff_accountant_bad_1 (score: 60)
- synth_cc_recent_grad_bad_1 (score: 55)
- synth_cc_project_coordinator_bad_1 (score: 60)
- synth_cc_product_manager_strong_1 (score: 92)
- synth_cc_physical_therapist_strong_1 (score: 89)
- synth_cc_fpa_analyst_strong_1 (score: 92)
- synth_cc_construction_pm_strong_1 (score: 90)
</details>
