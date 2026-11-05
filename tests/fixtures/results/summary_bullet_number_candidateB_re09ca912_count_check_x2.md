# PromptOps Live Eval Report

**Run ID:** eval_1793920473266
**Timestamp:** 2026-11-05T23:20:34.983Z
**Tier:** bulk
**Prompt Version:** v1
**Contract Version:** v2
**Execution Mode:** Live model evaluation
**Model:** gpt-6.1-terra
**Reasoning effort:** medium
**Resume prompt SHA-256:** e09ca912f3bb567a3f321273d9d5ecf351a8373e18307feb4a85c0f69dc734e6
**Resume ideas prompt SHA-256:** 6d90925e63aae15476712f92af5ffbdf4e684feec413711e14d6dba7201b6fc7
**Incomplete-response retry:** high reasoning

## Summary

| Metric | Value |
|:-------|:------|
| Total Fixtures | 24 |
| ✅ Passed | 23 |
| ⚠️ Warned | 0 |
| ❌ Failed | 1 |
| Pass Rate | 95.8% |

## Cost

| Metric | Value |
|:-------|:------|
| API Calls | 28 |
| Token-calculated API Cost | $0.367870 |
| Input Tokens | 224,927 |
| Cached Input Tokens | 201,527 |
| Output Tokens | 65,713 |
| Reasoning Tokens | 13,152 |
| Budget | $4.00 |

## ❌ Blocking Failures

These must be fixed before shipping.

### synth_cc_physical_therapist_strong_1

**Status:** FAIL
**Score:** 84 (expected: 75–95)

**Errors (ship blockers):**
- `E_SCHEMA`: Production validation failed after repair: The model response failed the evidence grounding contract at summary unsupported narrative facts: giving, beyond, treatment.

## Report Integrity

What a customer reads, measured on each validated report. These checks are reported, not gated; the status counts above are unchanged. **Model** is the report as generated. **Shown** is the report after the deterministic post-generation pass that the web report and PDF both apply.

| Check | Model | Shown |
|:------|:------|:------|
| Reports with a rewrite | 0 of 23 (0 rewrites) | same |
| Keep/fix collisions on one line | 8 in 7 reports | 0 |
| Critical Miss line also in Keep | 2 reports | 0 reports |
| Repeated observations | 147 | 0 |
| Field-slot mapping issues | 0 | 0 |
| Critical Miss is a line edit / structural | 13 / 10 (positioning 10) | same |
| Nothing critical (Critical Miss marked low impact) | 0 reports | same |
| Model's first fix dropped by validation | 1 report | same |
| Reports with 1 / 2 / 3 Critical Misses | 23 / 0 / 0 | same |
| Reports saying more than three exist | 0 | same |
| Critical Misses by kind | direction 10, other 3, concrete fact 10 (of 23) | same |
| Structural issue flagged, Critical Miss is a line edit | 3 reports | same |
| Verdict and Critical Miss disagree | 6 reports | same |
| Verdict raises no concern | 7 reports | same |
| Fix headings over 12 words | 66 of 66 (longest 32 words) | same |
| Fix headings that open with a location / carry a condition | 60 / 7 | same |

| Fixture | Score | Rewrites | Keep/fix | Repeats | Slot issues | Critical Miss | Verdict and Critical Miss |
|:--------|:------|:---------|:---------|:--------|:------------|:--------------|:--------------------------|
| synth_cc_operations_manager_bad_1 | 67 | 0 | 0 → 0 | 8 → 0 | 0 → 0 | structural (positioning); flagged: employment gap, positioning | agree |
| synth_cc_operations_manager_bad_1 | 67 | 0 | 0 → 0 | 6 → 0 | 0 → 0 | structural (positioning); flagged: employment gap | agree |
| synth_cc_career_changer_bad_1 | 62 | 0 | 0 → 0 | 6 → 0 | 0 → 0 | line edit; flagged: target role (outranked) | mismatch |
| synth_cc_career_changer_bad_1 | 65 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | line edit | mismatch |
| synth_cc_sales_rep_bad_1 | 64 | 0 | 0 → 0 | 8 → 0 | 0 → 0 | line edit | mismatch |
| synth_cc_sales_rep_bad_1 | 65 | 0 | 0 → 0 | 9 → 0 | 0 → 0 | structural (positioning) | no concern |
| synth_cc_marketing_director_bad_1 | 80 | 0 | 2 → 0 (Critical Miss in Keep) | 5 → 0 | 0 → 0 | line edit; flagged: employment gap (outranked) | no concern |
| synth_cc_marketing_director_bad_1 | 80 | 0 | 1 → 0 (Critical Miss in Keep) | 4 → 0 | 0 → 0 | line edit; flagged: employment gap (outranked) | agree |
| synth_cc_admin_generalist_bad_1 | 66 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | structural (positioning) | agree |
| synth_cc_admin_generalist_bad_1 | 65 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | structural (positioning); flagged: employment gap, positioning | agree |
| synth_cc_staff_accountant_bad_1 | 64 | 0 | 0 → 0 | 4 → 0 | 0 → 0 | structural (positioning); flagged: employment gap, positioning | agree |
| synth_cc_staff_accountant_bad_1 | 66 | 0 | 1 → 0 | 5 → 0 | 0 → 0 | structural (positioning); flagged: employment gap | agree |
| synth_cc_recent_grad_bad_1 | 66 | 0 | 0 → 0 | 5 → 0 | 0 → 0 | structural (positioning); flagged: employment gap | no concern |
| synth_cc_recent_grad_bad_1 | 66 | 0 | 0 → 0 | 6 → 0 | 0 → 0 | structural (positioning); flagged: employment gap | mismatch |
| synth_cc_project_coordinator_bad_1 | 66 | 0 | 1 → 0 | 7 → 0 | 0 → 0 | line edit | agree |
| synth_cc_project_coordinator_bad_1 | 65 | 0 | 1 → 0 | 6 → 0 | 0 → 0 | structural (positioning); flagged: employment gap | agree |
| synth_cc_product_manager_strong_1 | 87 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | line edit | no concern |
| synth_cc_product_manager_strong_1 | 87 | 0 | 0 → 0 | 8 → 0 | 0 → 0 | line edit | mismatch |
| synth_cc_physical_therapist_strong_1 | 84 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | line edit | mismatch |
| synth_cc_fpa_analyst_strong_1 | 86 | 0 | 1 → 0 | 5 → 0 | 0 → 0 | line edit | no concern |
| synth_cc_fpa_analyst_strong_1 | 87 | 0 | 1 → 0 | 8 → 0 | 0 → 0 | line edit | agree |
| synth_cc_construction_pm_strong_1 | 84 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | line edit | no concern |
| synth_cc_construction_pm_strong_1 | 85 | 0 | 0 → 0 | 5 → 0 | 0 → 0 | line edit | no concern |

<details>
<summary>Integrity details</summary>

- **synth_cc_operations_manager_bad_1**: The biggest-gap example quotes fix 2's line.
- **synth_cc_operations_manager_bad_1**: The biggest-gap example quotes fix 2's line.
- **synth_cc_career_changer_bad_1**: The Verdict's concern is target role, but the Critical Miss is a single-line edit. The biggest-gap example quotes fix 3's line.
- **synth_cc_career_changer_bad_1**: The Verdict's concern is fix 2's line, not the Critical Miss.
- **synth_cc_sales_rep_bad_1**: The takeaway ("Explain your sales leadership") points at fix 2, not the Critical Miss.
- **synth_cc_sales_rep_bad_1**: The biggest-gap example quotes fix 2's line. The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_cc_marketing_director_bad_1**: The biggest-gap example quotes fix 3's line. The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_cc_admin_generalist_bad_1**: The biggest-gap example quotes fix 3's line.
- **synth_cc_staff_accountant_bad_1**: The biggest-gap example quotes fix 2's line.
- **synth_cc_staff_accountant_bad_1**: The biggest-gap example quotes fix 2's line.
- **synth_cc_recent_grad_bad_1**: The biggest-gap example quotes fix 2's line. The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_cc_recent_grad_bad_1**: The takeaway ("Explain your newsletter contribution") points at fix 2, not the Critical Miss. The biggest-gap example quotes fix 2's line.
- **synth_cc_project_coordinator_bad_1**: The biggest-gap example quotes fix 3's line.
- **synth_cc_product_manager_strong_1**: The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_cc_product_manager_strong_1**: The takeaway ("Explain a dashboard decision") points at fix 2, not the Critical Miss. The biggest-gap example quotes fix 2's line.
- **synth_cc_physical_therapist_strong_1**: The takeaway ("Explain your mentoring work") points at fix 3, not the Critical Miss. The biggest-gap example quotes fix 3's line. The Verdict says to keep part of the line fix 1 changes.
- **synth_cc_fpa_analyst_strong_1**: The biggest-gap example quotes fix 2's line. The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_cc_construction_pm_strong_1**: The biggest-gap example quotes fix 3's line. The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_cc_construction_pm_strong_1**: The biggest-gap example quotes fix 3's line. The Verdict says to keep part of the line fix 1 changes. The Verdict raises no concern, yet the report still names a Critical Miss.
</details>

## Score Test-Retest

| Fixture | Scores | Range | Mean | SD |
|:--------|:-------|:------|:-----|:---|
| synth_cc_operations_manager_bad_1 | 67, 67 | 0 | 67 | 0 |
| synth_cc_career_changer_bad_1 | 62, 65 | 3 | 63.5 | 2.1 |
| synth_cc_sales_rep_bad_1 | 64, 65 | 1 | 64.5 | 0.7 |
| synth_cc_marketing_director_bad_1 | 80, 80 | 0 | 80 | 0 |
| synth_cc_admin_generalist_bad_1 | 66, 65 | 1 | 65.5 | 0.7 |
| synth_cc_staff_accountant_bad_1 | 64, 66 | 2 | 65 | 1.4 |
| synth_cc_recent_grad_bad_1 | 66, 66 | 0 | 66 | 0 |
| synth_cc_project_coordinator_bad_1 | 66, 65 | 1 | 65.5 | 0.7 |
| synth_cc_product_manager_strong_1 | 87, 87 | 0 | 87 | 0 |
| synth_cc_physical_therapist_strong_1 | 84, 84 (1 from reports that failed validation) | 0 | 84 | 0 |
| synth_cc_fpa_analyst_strong_1 | 86, 87 | 1 | 86.5 | 0.7 |
| synth_cc_construction_pm_strong_1 | 84, 85 | 1 | 84.5 | 0.7 |

## ✅ Passed

23 fixtures passed all checks.

<details>
<summary>Expand to see fixture IDs</summary>

- synth_cc_operations_manager_bad_1 (score: 67)
- synth_cc_operations_manager_bad_1 (score: 67)
- synth_cc_career_changer_bad_1 (score: 62)
- synth_cc_career_changer_bad_1 (score: 65)
- synth_cc_sales_rep_bad_1 (score: 64)
- synth_cc_sales_rep_bad_1 (score: 65)
- synth_cc_marketing_director_bad_1 (score: 80)
- synth_cc_marketing_director_bad_1 (score: 80)
- synth_cc_admin_generalist_bad_1 (score: 66)
- synth_cc_admin_generalist_bad_1 (score: 65)
- synth_cc_staff_accountant_bad_1 (score: 64)
- synth_cc_staff_accountant_bad_1 (score: 66)
- synth_cc_recent_grad_bad_1 (score: 66)
- synth_cc_recent_grad_bad_1 (score: 66)
- synth_cc_project_coordinator_bad_1 (score: 66)
- synth_cc_project_coordinator_bad_1 (score: 65)
- synth_cc_product_manager_strong_1 (score: 87)
- synth_cc_product_manager_strong_1 (score: 87)
- synth_cc_physical_therapist_strong_1 (score: 84)
- synth_cc_fpa_analyst_strong_1 (score: 86)
- synth_cc_fpa_analyst_strong_1 (score: 87)
- synth_cc_construction_pm_strong_1 (score: 84)
- synth_cc_construction_pm_strong_1 (score: 85)
</details>
