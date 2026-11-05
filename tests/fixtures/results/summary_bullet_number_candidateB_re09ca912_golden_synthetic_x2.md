# PromptOps Live Eval Report

**Run ID:** eval_1793920197789
**Timestamp:** 2026-11-05T23:14:32.611Z
**Tier:** golden
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
| Total Fixtures | 20 |
| ✅ Passed | 19 |
| ⚠️ Warned | 1 |
| ❌ Failed | 0 |
| Pass Rate | 95.0% |

## Cost

| Metric | Value |
|:-------|:------|
| API Calls | 22 |
| Token-calculated API Cost | $0.315448 |
| Input Tokens | 191,009 |
| Cached Input Tokens | 146,135 |
| Output Tokens | 50,413 |
| Reasoning Tokens | 9,342 |
| Budget | $4.00 |

## ⚠️ Warnings (Review Recommended)

### synth_finance_analyst_senior_weak_1

**Status:** WARN
**Score:** 61 (expected: 55–68)

**Warnings:**
- `W_MECHANICAL_COPY`: top_fixes.1.fix repeats the clause "the finance process"

## Report Integrity

What a customer reads, measured on each validated report. These checks are reported, not gated; the status counts above are unchanged. **Model** is the report as generated. **Shown** is the report after the deterministic post-generation pass that the web report and PDF both apply.

| Check | Model | Shown |
|:------|:------|:------|
| Reports with a rewrite | 0 of 20 (0 rewrites) | same |
| Keep/fix collisions on one line | 4 in 4 reports | 0 |
| Critical Miss line also in Keep | 0 reports | 0 reports |
| Repeated observations | 129 | 0 |
| Field-slot mapping issues | 0 | 0 |
| Critical Miss is a line edit / structural | 20 / 0 | same |
| Nothing critical (Critical Miss marked low impact) | 0 reports | same |
| Model's first fix dropped by validation | 2 reports | same |
| Reports with 1 / 2 / 3 Critical Misses | 20 / 0 / 0 | same |
| Reports saying more than three exist | 0 | same |
| Critical Misses by kind | concrete fact 13, other 7 (of 20) | same |
| Structural issue flagged, Critical Miss is a line edit | 7 reports | same |
| Verdict and Critical Miss disagree | 9 reports | same |
| Verdict raises no concern | 5 reports | same |
| Fix headings over 12 words | 55 of 55 (longest 23 words) | same |
| Fix headings that open with a location / carry a condition | 52 / 4 | same |

| Fixture | Score | Rewrites | Keep/fix | Repeats | Slot issues | Critical Miss | Verdict and Critical Miss |
|:--------|:------|:---------|:---------|:--------|:------------|:--------------|:--------------------------|
| synth_data_scientist_senior_elite_1 | 92 | 0 | 0 → 0 | 10 → 0 | 0 → 0 | line edit | agree |
| synth_data_scientist_senior_elite_1 | 93 | 0 | 0 → 0 | 8 → 0 | 0 → 0 | line edit | mismatch |
| synth_marketing_manager_vp_elite_1 | 89 | 0 | 0 → 0 | 9 → 0 | 0 → 0 | line edit | agree |
| synth_marketing_manager_vp_elite_1 | 88 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | line edit | no concern |
| synth_software_engineer_mid_strong_1 | 83 | 0 | 0 → 0 | 6 → 0 | 0 → 0 | line edit | mismatch |
| synth_software_engineer_mid_strong_1 | 84 | 0 | 0 → 0 | 6 → 0 | 0 → 0 | line edit | agree |
| synth_ux_designer_director_strong_1 | 82 | 0 | 0 → 0 | 5 → 0 | 0 → 0 | line edit; flagged: target role (outranked) | agree |
| synth_ux_designer_director_strong_1 | 83 | 0 | 0 → 0 | 9 → 0 | 0 → 0 | line edit | no concern |
| synth_sales_executive_mid_foundation_1 | 60 | 0 | 0 → 0 | 5 → 0 | 0 → 0 | line edit | no concern |
| synth_sales_executive_mid_foundation_1 | 60 | 0 | 0 → 0 | 5 → 0 | 0 → 0 | line edit; flagged: employment gap (outranked) | mismatch |
| synth_hr_manager_director_foundation_1 | 61 | 0 | 1 → 0 | 5 → 0 | 0 → 0 | line edit | agree |
| synth_hr_manager_director_foundation_1 | 61 | 0 | 1 → 0 | 6 → 0 | 0 → 0 | line edit; flagged: employment gap (outranked) | mismatch |
| synth_finance_analyst_senior_weak_1 | 61 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | line edit; flagged: employment gap (outranked) | mismatch |
| synth_finance_analyst_senior_weak_1 | 58 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | line edit | mismatch |
| synth_operations_manager_entry_weak_1 | 61 | 0 | 1 → 0 | 5 → 0 | 0 → 0 | line edit; flagged: employment gap (outranked) | no concern |
| synth_operations_manager_entry_weak_1 | 60 | 0 | 1 → 0 | 7 → 0 | 0 → 0 | line edit | mismatch |
| synth_project_manager_vp_strong_1 | 83 | 0 | 0 → 0 | 5 → 0 | 0 → 0 | line edit | mismatch |
| synth_project_manager_vp_strong_1 | 84 | 0 | 0 → 0 | 4 → 0 | 0 → 0 | line edit | agree |
| synth_product_manager_entry_elite_1 | 88 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | line edit; flagged: employment gap (outranked) | no concern |
| synth_product_manager_entry_elite_1 | 87 | 0 | 0 → 0 | 6 → 0 | 0 → 0 | line edit; flagged: employment gap (outranked) | mismatch |

<details>
<summary>Integrity details</summary>

- **synth_data_scientist_senior_elite_1**: The takeaway ("Define the model errors") points at fix 3, not the Critical Miss. The biggest-gap example quotes fix 3's line. The Verdict says to keep part of the line fix 1 changes.
- **synth_marketing_manager_vp_elite_1**: The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_software_engineer_mid_strong_1**: The Verdict's concern is fix 2's line, not the Critical Miss.
- **synth_ux_designer_director_strong_1**: The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_sales_executive_mid_foundation_1**: The biggest-gap example quotes fix 3's line. The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_sales_executive_mid_foundation_1**: The takeaway ("Name a BrightWave project") points at fix 2, not the Critical Miss. The biggest-gap example quotes fix 2's line.
- **synth_hr_manager_director_foundation_1**: The takeaway ("Explain your employee relations work") points at fix 2, not the Critical Miss. The biggest-gap example quotes fix 2's line.
- **synth_finance_analyst_senior_weak_1**: The takeaway ("Name your finance deliverables") points at fix 2, not the Critical Miss. The biggest-gap example quotes fix 2's line. The Verdict says to keep part of the line fix 1 changes.
- **synth_finance_analyst_senior_weak_1**: The takeaway ("Name the finance deliverables") points at fix 2, not the Critical Miss. The biggest-gap example quotes fix 2's line.
- **synth_operations_manager_entry_weak_1**: The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_operations_manager_entry_weak_1**: The takeaway ("Name the departments you supported") points at fix 2, not the Critical Miss. The biggest-gap example quotes fix 2's line.
- **synth_project_manager_vp_strong_1**: The takeaway ("Explain your mentoring work") points at fix 2, not the Critical Miss. The biggest-gap example quotes fix 2's line.
- **synth_product_manager_entry_elite_1**: The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_product_manager_entry_elite_1**: The Verdict's concern is employment gap, but the Critical Miss is a single-line edit.
</details>

## Score Test-Retest

| Fixture | Scores | Range | Mean | SD |
|:--------|:-------|:------|:-----|:---|
| synth_data_scientist_senior_elite_1 | 92, 93 | 1 | 92.5 | 0.7 |
| synth_marketing_manager_vp_elite_1 | 89, 88 | 1 | 88.5 | 0.7 |
| synth_software_engineer_mid_strong_1 | 83, 84 | 1 | 83.5 | 0.7 |
| synth_ux_designer_director_strong_1 | 82, 83 | 1 | 82.5 | 0.7 |
| synth_sales_executive_mid_foundation_1 | 60, 60 | 0 | 60 | 0 |
| synth_hr_manager_director_foundation_1 | 61, 61 | 0 | 61 | 0 |
| synth_finance_analyst_senior_weak_1 | 61, 58 | 3 | 59.5 | 2.1 |
| synth_operations_manager_entry_weak_1 | 61, 60 | 1 | 60.5 | 0.7 |
| synth_project_manager_vp_strong_1 | 83, 84 | 1 | 83.5 | 0.7 |
| synth_product_manager_entry_elite_1 | 88, 87 | 1 | 87.5 | 0.7 |

## ✅ Passed

19 fixtures passed all checks.

<details>
<summary>Expand to see fixture IDs</summary>

- synth_data_scientist_senior_elite_1 (score: 92)
- synth_data_scientist_senior_elite_1 (score: 93)
- synth_marketing_manager_vp_elite_1 (score: 89)
- synth_marketing_manager_vp_elite_1 (score: 88)
- synth_software_engineer_mid_strong_1 (score: 83)
- synth_software_engineer_mid_strong_1 (score: 84)
- synth_ux_designer_director_strong_1 (score: 82)
- synth_ux_designer_director_strong_1 (score: 83)
- synth_sales_executive_mid_foundation_1 (score: 60)
- synth_sales_executive_mid_foundation_1 (score: 60)
- synth_hr_manager_director_foundation_1 (score: 61)
- synth_hr_manager_director_foundation_1 (score: 61)
- synth_finance_analyst_senior_weak_1 (score: 58)
- synth_operations_manager_entry_weak_1 (score: 61)
- synth_operations_manager_entry_weak_1 (score: 60)
- synth_project_manager_vp_strong_1 (score: 83)
- synth_project_manager_vp_strong_1 (score: 84)
- synth_product_manager_entry_elite_1 (score: 88)
- synth_product_manager_entry_elite_1 (score: 87)
</details>
