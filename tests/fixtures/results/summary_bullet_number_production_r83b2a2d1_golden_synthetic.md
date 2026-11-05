# PromptOps Live Eval Report

**Run ID:** eval_1793919973395
**Timestamp:** 2026-11-05T23:08:40.223Z
**Tier:** golden
**Prompt Version:** v1
**Contract Version:** v2
**Execution Mode:** Live model evaluation
**Model:** gpt-6.1-terra
**Reasoning effort:** medium
**Resume prompt SHA-256:** 83b2a2d1f9cde086ebb28fc2e0596ed7c58e6c4f905c4f57fe56cc86e9665107
**Resume ideas prompt SHA-256:** 6d90925e63aae15476712f92af5ffbdf4e684feec413711e14d6dba7201b6fc7
**Incomplete-response retry:** high reasoning

## Summary

| Metric | Value |
|:-------|:------|
| Total Fixtures | 10 |
| ✅ Passed | 10 |
| ⚠️ Warned | 0 |
| ❌ Failed | 0 |
| Pass Rate | 100.0% |

## Cost

| Metric | Value |
|:-------|:------|
| API Calls | 12 |
| Token-calculated API Cost | $0.187105 |
| Input Tokens | 104,476 |
| Cached Input Tokens | 68,030 |
| Output Tokens | 27,631 |
| Reasoning Tokens | 4,732 |
| Budget | $3.00 |

## Report Integrity

What a customer reads, measured on each validated report. These checks are reported, not gated; the status counts above are unchanged. **Model** is the report as generated. **Shown** is the report after the deterministic post-generation pass that the web report and PDF both apply.

| Check | Model | Shown |
|:------|:------|:------|
| Reports with a rewrite | 0 of 10 (0 rewrites) | same |
| Keep/fix collisions on one line | 7 in 5 reports | 0 |
| Critical Miss line also in Keep | 2 reports | 0 reports |
| Repeated observations | 59 | 0 |
| Field-slot mapping issues | 0 | 0 |
| Critical Miss is a line edit / structural | 10 / 0 | same |
| Nothing critical (Critical Miss marked low impact) | 0 reports | same |
| Model's first fix dropped by validation | 1 report | same |
| Reports with 1 / 2 / 3 Critical Misses | 10 / 0 / 0 | same |
| Reports saying more than three exist | 0 | same |
| Critical Misses by kind | concrete fact 8, other 2 (of 10) | same |
| Structural issue flagged, Critical Miss is a line edit | 5 reports | same |
| Verdict and Critical Miss disagree | 3 reports | same |
| Verdict raises no concern | 4 reports | same |
| Fix headings over 12 words | 27 of 27 (longest 27 words) | same |
| Fix headings that open with a location / carry a condition | 26 / 5 | same |

| Fixture | Score | Rewrites | Keep/fix | Repeats | Slot issues | Critical Miss | Verdict and Critical Miss |
|:--------|:------|:---------|:---------|:--------|:------------|:--------------|:--------------------------|
| synth_data_scientist_senior_elite_1 | 93 | 0 | 0 → 0 | 8 → 0 | 0 → 0 | line edit | mismatch |
| synth_marketing_manager_vp_elite_1 | 88 | 0 | 0 → 0 | 9 → 0 | 0 → 0 | line edit | no concern |
| synth_software_engineer_mid_strong_1 | 84 | 0 | 1 → 0 | 5 → 0 | 0 → 0 | line edit; flagged: employment gap (outranked) | no concern |
| synth_ux_designer_director_strong_1 | 82 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | line edit | mismatch |
| synth_sales_executive_mid_foundation_1 | 57 | 0 | 2 → 0 (Critical Miss in Keep) | 5 → 0 | 0 → 0 | line edit; flagged: employment gap (outranked) | agree |
| synth_hr_manager_director_foundation_1 | 59 | 0 | 1 → 0 | 6 → 0 | 0 → 0 | line edit; flagged: employment gap (outranked) | agree |
| synth_finance_analyst_senior_weak_1 | 60 | 0 | 2 → 0 (Critical Miss in Keep) | 5 → 0 | 0 → 0 | line edit; flagged: employment gap (outranked) | mismatch |
| synth_operations_manager_entry_weak_1 | 58 | 0 | 1 → 0 | 3 → 0 | 0 → 0 | line edit | agree |
| synth_project_manager_vp_strong_1 | 84 | 0 | 0 → 0 | 4 → 0 | 0 → 0 | line edit | no concern |
| synth_product_manager_entry_elite_1 | 86 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | line edit; flagged: employment gap (outranked) | no concern |

<details>
<summary>Integrity details</summary>

- **synth_data_scientist_senior_elite_1**: The takeaway ("Define the model errors") points at fix 2, not the Critical Miss. The biggest-gap example quotes fix 2's line. The Verdict says to keep part of the line fix 1 changes.
- **synth_marketing_manager_vp_elite_1**: The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_software_engineer_mid_strong_1**: The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_ux_designer_director_strong_1**: The takeaway ("Explain the design standards") points at fix 2, not the Critical Miss. The biggest-gap example quotes fix 2's line.
- **synth_sales_executive_mid_foundation_1**: The biggest-gap example quotes fix 2's line.
- **synth_finance_analyst_senior_weak_1**: The takeaway ("Name the project deliverables") points at fix 3, not the Critical Miss. The biggest-gap example quotes fix 3's line.
- **synth_project_manager_vp_strong_1**: The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_product_manager_entry_elite_1**: The Verdict raises no concern, yet the report still names a Critical Miss.
</details>

## Score Test-Retest

Each fixture was generated once, so test-retest was not measured. Use `--repeat <n>`, or replay several saved runs of the same fixtures together.

## ✅ Passed

10 fixtures passed all checks.

<details>
<summary>Expand to see fixture IDs</summary>

- synth_data_scientist_senior_elite_1 (score: 93)
- synth_marketing_manager_vp_elite_1 (score: 88)
- synth_software_engineer_mid_strong_1 (score: 84)
- synth_ux_designer_director_strong_1 (score: 82)
- synth_sales_executive_mid_foundation_1 (score: 57)
- synth_hr_manager_director_foundation_1 (score: 59)
- synth_finance_analyst_senior_weak_1 (score: 60)
- synth_operations_manager_entry_weak_1 (score: 58)
- synth_project_manager_vp_strong_1 (score: 84)
- synth_product_manager_entry_elite_1 (score: 86)
</details>
