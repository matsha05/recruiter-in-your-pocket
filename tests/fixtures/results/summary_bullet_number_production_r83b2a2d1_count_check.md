# PromptOps Live Eval Report

**Run ID:** eval_1793919975441
**Timestamp:** 2026-11-05T23:09:17.316Z
**Tier:** bulk
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
| Total Fixtures | 12 |
| ✅ Passed | 12 |
| ⚠️ Warned | 0 |
| ❌ Failed | 0 |
| Pass Rate | 100.0% |

## Cost

| Metric | Value |
|:-------|:------|
| API Calls | 15 |
| Token-calculated API Cost | $0.214233 |
| Input Tokens | 119,908 |
| Cached Input Tokens | 95,242 |
| Output Tokens | 35,730 |
| Reasoning Tokens | 7,299 |
| Budget | $3.00 |

## Report Integrity

What a customer reads, measured on each validated report. These checks are reported, not gated; the status counts above are unchanged. **Model** is the report as generated. **Shown** is the report after the deterministic post-generation pass that the web report and PDF both apply.

| Check | Model | Shown |
|:------|:------|:------|
| Reports with a rewrite | 0 of 12 (0 rewrites) | same |
| Keep/fix collisions on one line | 3 in 3 reports | 0 |
| Critical Miss line also in Keep | 0 reports | 0 reports |
| Repeated observations | 84 | 0 |
| Field-slot mapping issues | 0 | 0 |
| Critical Miss is a line edit / structural | 8 / 4 (positioning 4) | same |
| Nothing critical (Critical Miss marked low impact) | 0 reports | same |
| Model's first fix dropped by validation | 0 reports | same |
| Reports with 1 / 2 / 3 Critical Misses | 12 / 0 / 0 | same |
| Reports saying more than three exist | 0 | same |
| Critical Misses by kind | concrete fact 5, other 3, direction 4 (of 12) | same |
| Structural issue flagged, Critical Miss is a line edit | 2 reports | same |
| Verdict and Critical Miss disagree | 3 reports | same |
| Verdict raises no concern | 4 reports | same |
| Fix headings over 12 words | 35 of 35 (longest 33 words) | same |
| Fix headings that open with a location / carry a condition | 31 / 7 | same |

| Fixture | Score | Rewrites | Keep/fix | Repeats | Slot issues | Critical Miss | Verdict and Critical Miss |
|:--------|:------|:---------|:---------|:--------|:------------|:--------------|:--------------------------|
| synth_cc_operations_manager_bad_1 | 65 | 0 | 0 → 0 | 5 → 0 | 0 → 0 | line edit; flagged: employment gap (outranked) | no concern |
| synth_cc_career_changer_bad_1 | 64 | 0 | 0 → 0 | 3 → 0 | 0 → 0 | line edit | mismatch |
| synth_cc_sales_rep_bad_1 | 65 | 0 | 0 → 0 | 8 → 0 | 0 → 0 | structural (positioning) | agree |
| synth_cc_marketing_director_bad_1 | 80 | 0 | 0 → 0 | 8 → 0 | 0 → 0 | line edit; flagged: level (outranked) | agree |
| synth_cc_admin_generalist_bad_1 | 65 | 0 | 0 → 0 | 8 → 0 | 0 → 0 | structural (positioning) | agree |
| synth_cc_staff_accountant_bad_1 | 65 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | line edit | no concern |
| synth_cc_recent_grad_bad_1 | 62 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | structural (positioning); flagged: employment gap | no concern |
| synth_cc_project_coordinator_bad_1 | 64 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | structural (positioning); flagged: employment gap | agree |
| synth_cc_product_manager_strong_1 | 87 | 0 | 1 → 0 | 10 → 0 | 0 → 0 | line edit | no concern |
| synth_cc_physical_therapist_strong_1 | 86 | 0 | 1 → 0 | 9 → 0 | 0 → 0 | line edit | mismatch |
| synth_cc_fpa_analyst_strong_1 | 86 | 0 | 1 → 0 | 5 → 0 | 0 → 0 | line edit; flagged: positioning | mismatch |
| synth_cc_construction_pm_strong_1 | 85 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | line edit | agree |

<details>
<summary>Integrity details</summary>

- **synth_cc_operations_manager_bad_1**: The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_cc_career_changer_bad_1**: The takeaway ("Date your freelance work") points at fix 2, not the Critical Miss.
- **synth_cc_marketing_director_bad_1**: The biggest-gap example quotes fix 3's line.
- **synth_cc_admin_generalist_bad_1**: The biggest-gap example quotes fix 3's line.
- **synth_cc_staff_accountant_bad_1**: The Verdict says to keep part of the line fix 3 changes. The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_cc_recent_grad_bad_1**: The biggest-gap example quotes fix 2's line. The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_cc_project_coordinator_bad_1**: The biggest-gap example quotes fix 2's line.
- **synth_cc_product_manager_strong_1**: The biggest-gap example quotes fix 2's line. The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_cc_physical_therapist_strong_1**: The takeaway ("Explain the mentoring work") points at fix 3, not the Critical Miss. The biggest-gap example quotes fix 3's line. The Verdict says to keep part of the line fix 1 changes.
- **synth_cc_fpa_analyst_strong_1**: The Verdict's concern is positioning, but the Critical Miss is a single-line edit.
</details>

## Score Test-Retest

Each fixture was generated once, so test-retest was not measured. Use `--repeat <n>`, or replay several saved runs of the same fixtures together.

## ✅ Passed

12 fixtures passed all checks.

<details>
<summary>Expand to see fixture IDs</summary>

- synth_cc_operations_manager_bad_1 (score: 65)
- synth_cc_career_changer_bad_1 (score: 64)
- synth_cc_sales_rep_bad_1 (score: 65)
- synth_cc_marketing_director_bad_1 (score: 80)
- synth_cc_admin_generalist_bad_1 (score: 65)
- synth_cc_staff_accountant_bad_1 (score: 65)
- synth_cc_recent_grad_bad_1 (score: 62)
- synth_cc_project_coordinator_bad_1 (score: 64)
- synth_cc_product_manager_strong_1 (score: 87)
- synth_cc_physical_therapist_strong_1 (score: 86)
- synth_cc_fpa_analyst_strong_1 (score: 86)
- synth_cc_construction_pm_strong_1 (score: 85)
</details>
