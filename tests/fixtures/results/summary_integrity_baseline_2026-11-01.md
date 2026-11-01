# PromptOps Live Eval Report

**Run ID:** eval_1793463473819+eval_1793469152573+eval_1793469297246+eval_1793469354166_replay
**Timestamp:** 2026-10-31T16:21:29.561Z
**Tier:** golden
**Prompt Version:** v1
**Contract Version:** v2
**Execution Mode:** Live model evaluation
**Model:** gpt-6.1-terra
**Reasoning effort:** medium
**Resume prompt SHA-256:** 83b2a2d1f9cde086ebb28fc2e0596ed7c58e6c4f905c4f57fe56cc86e9665107
**Resume ideas prompt SHA-256:** 6d90925e63aae15476712f92af5ffbdf4e684feec413711e14d6dba7201b6fc7
**Incomplete-response retry:** high reasoning
**Validation Mode:** Saved output replay through current candidate
**Validation Timestamp:** 2026-11-01T16:02:59.981Z
**Source runs:** eval_1793463473819 (SHA-256 da5212325f26a0ad3183372e44c83fb59c3a8754bacbe0c240ef6fe3255cc257), eval_1793469152573 (SHA-256 f1c6c1ad8144ee2611ad7d981e1638686e1bf47e97158d0a21b665cb4a027853), eval_1793469297246 (SHA-256 be86bfdaae612cd53400d0bf14a3c4f807f605988ee7bedf12859e1e24c2433b), eval_1793469354166 (SHA-256 39b07d7a64503453e4fc3e2f3b1eb574cb91d89cb7883c8f1323651f3337f246)

## Summary

| Metric | Value |
|:-------|:------|
| Total Fixtures | 13 |
| ✅ Passed | 13 |
| ⚠️ Warned | 0 |
| ❌ Failed | 0 |
| Pass Rate | 100.0% |

## Cost

| Metric | Value |
|:-------|:------|
| API Calls | 19 |
| Token-calculated API Cost | $0.317511 |
| Input Tokens | 126,170 |
| Cached Input Tokens | 81,636 |
| Output Tokens | 33,508 |
| Reasoning Tokens | 7,621 |
| Budget | $2.00 |

## Report Integrity

What a customer reads, measured on each validated report. These checks are reported, not gated; the status counts above are unchanged. **Model** is the report as generated. **Shown** is the report after the deterministic post-generation pass that the web report and PDF both apply.

| Check | Model | Shown |
|:------|:------|:------|
| Reports with a rewrite | 0 of 13 (0 rewrites) | same |
| Keep/fix collisions on one line | 7 in 7 reports | 0 |
| Critical Miss line also in Keep | 1 report | 0 reports |
| Repeated observations | 71 | 0 |
| Field-slot mapping issues | 0 | 0 |
| Critical Miss is a line edit / structural | 13 / 0 | same |
| Structural issue flagged, Critical Miss is a line edit | 7 reports | same |
| Verdict and Critical Miss disagree | 6 reports | same |
| Verdict raises no concern | 4 reports | same |

| Fixture | Score | Rewrites | Keep/fix | Repeats | Slot issues | Critical Miss | Verdict and Critical Miss |
|:--------|:------|:---------|:---------|:--------|:------------|:--------------|:--------------------------|
| synth_data_scientist_senior_elite_1 | 92 | 0 | 1 → 0 | 5 → 0 | 0 → 0 | line edit; flagged: target role (outranked) | mismatch |
| synth_marketing_manager_vp_elite_1 | 90 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | line edit | no concern |
| synth_software_engineer_mid_strong_1 | 83 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | line edit; flagged: employment gap (outranked) | mismatch |
| synth_ux_designer_director_strong_1 | 83 | 0 | 1 → 0 | 7 → 0 | 0 → 0 | line edit | no concern |
| synth_sales_executive_mid_foundation_1 | 59 | 0 | 1 → 0 (Critical Miss in Keep) | 3 → 0 | 0 → 0 | line edit; flagged: employment gap (outranked) | agree |
| synth_hr_manager_director_foundation_1 | 60 | 0 | 0 → 0 | 5 → 0 | 0 → 0 | line edit; flagged: employment gap (outranked) | no concern |
| synth_finance_analyst_senior_weak_1 | 60 | 0 | 0 → 0 | 5 → 0 | 0 → 0 | line edit; flagged: employment gap (outranked) | mismatch |
| synth_operations_manager_entry_weak_1 | 60 | 0 | 1 → 0 | 5 → 0 | 0 → 0 | line edit | mismatch |
| synth_project_manager_vp_strong_1 | 84 | 0 | 0 → 0 | 5 → 0 | 0 → 0 | line edit | no concern |
| synth_product_manager_entry_elite_1 | 86 | 0 | 1 → 0 | 8 → 0 | 0 → 0 | line edit; flagged: employment gap, positioning (outranked) | mismatch |
| synth_operations_manager_entry_weak_1 | 58 | 0 | 0 → 0 | 4 → 0 | 0 → 0 | line edit | agree |
| synth_operations_manager_entry_weak_1 | 60 | 0 | 1 → 0 | 6 → 0 | 0 → 0 | line edit | mismatch |
| synth_operations_manager_entry_weak_1 | 58 | 0 | 1 → 0 | 4 → 0 | 0 → 0 | line edit; flagged: employment gap (outranked) | agree |

<details>
<summary>Integrity details</summary>

- **synth_data_scientist_senior_elite_1**: The Verdict's concern is target role, but the Critical Miss is a single-line edit.
- **synth_marketing_manager_vp_elite_1**: The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_software_engineer_mid_strong_1**: The Verdict's concern is employment gap, but the Critical Miss is a single-line edit.
- **synth_ux_designer_director_strong_1**: The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_sales_executive_mid_foundation_1**: The biggest-gap example quotes fix 2's line.
- **synth_hr_manager_director_foundation_1**: The Verdict says to keep part of the line fix 2 changes. The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_finance_analyst_senior_weak_1**: The takeaway ("Name the finance deliverables") points at fix 2, not the Critical Miss. The biggest-gap example quotes fix 2's line.
- **synth_operations_manager_entry_weak_1**: The takeaway ("Describe the departmental handoffs") points at fix 2, not the Critical Miss. The biggest-gap example quotes fix 2's line.
- **synth_project_manager_vp_strong_1**: The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_product_manager_entry_elite_1**: The Verdict's concern is positioning, but the Critical Miss is a single-line edit.
- **synth_operations_manager_entry_weak_1**: The takeaway ("Describe the department coordination") points at fix 2, not the Critical Miss. The biggest-gap example quotes fix 2's line.
</details>

## Score Test-Retest

| Fixture | Scores | Range | Mean | SD |
|:--------|:-------|:------|:-----|:---|
| synth_operations_manager_entry_weak_1 | 60, 58, 60, 58 | 2 | 59 | 1.2 |

## ✅ Passed

13 fixtures passed all checks.

<details>
<summary>Expand to see fixture IDs</summary>

- synth_data_scientist_senior_elite_1 (score: 92)
- synth_marketing_manager_vp_elite_1 (score: 90)
- synth_software_engineer_mid_strong_1 (score: 83)
- synth_ux_designer_director_strong_1 (score: 83)
- synth_sales_executive_mid_foundation_1 (score: 59)
- synth_hr_manager_director_foundation_1 (score: 60)
- synth_finance_analyst_senior_weak_1 (score: 60)
- synth_operations_manager_entry_weak_1 (score: 60)
- synth_project_manager_vp_strong_1 (score: 84)
- synth_product_manager_entry_elite_1 (score: 86)
- synth_operations_manager_entry_weak_1 (score: 58)
- synth_operations_manager_entry_weak_1 (score: 60)
- synth_operations_manager_entry_weak_1 (score: 58)
</details>
