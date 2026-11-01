# PromptOps Live Eval Report

**Run ID:** eval_1793555238116_completed+eval_1793560274286_replay
**Timestamp:** 2026-11-01T17:56:05.976Z
**Tier:** golden
**Prompt Version:** v1
**Contract Version:** v2
**Execution Mode:** Live model evaluation
**Model:** gpt-6.1-terra
**Reasoning effort:** medium
**Resume prompt SHA-256:** a711fd79eea38b06839afb21e7e9e9a82cb85489b5119b49b2da54a4306ca52b
**Resume ideas prompt SHA-256:** 6d90925e63aae15476712f92af5ffbdf4e684feec413711e14d6dba7201b6fc7
**Incomplete-response retry:** high reasoning
**Validation Mode:** Saved output replay through current candidate
**Validation Timestamp:** 2026-11-01T20:09:23.853Z
**Source runs:** eval_1793555238116_completed (SHA-256 bc919d00ba583d491fe9fa0f3b239fff2610eb3d1b2f6cba26df1eb0ca450c36), eval_1793560274286 (SHA-256 75e6924ca54ec09e33571bceb01d64c416f5c6da71db60320705df30de267176)

## Summary

| Metric | Value |
|:-------|:------|
| Total Fixtures | 30 |
| ✅ Passed | 28 |
| ⚠️ Warned | 2 |
| ❌ Failed | 0 |
| Pass Rate | 93.3% |

## Cost

| Metric | Value |
|:-------|:------|
| API Calls | 40 |
| Token-calculated API Cost | $0.610499 |
| Input Tokens | 313,069 |
| Cached Input Tokens | 252,841 |
| Output Tokens | 76,490 |
| Reasoning Tokens | 18,544 |
| Budget | $3.00 |

## ⚠️ Warnings (Review Recommended)

### synth_software_engineer_mid_strong_1

**Status:** WARN
**Score:** 83 (expected: 78–88)

**Warnings:**
- `W_SUMMARY_STRUCTURE`: Summary has 6 sentences (expected 3-5)

### synth_software_engineer_mid_strong_1

**Status:** WARN
**Score:** 84 (expected: 78–88)

**Warnings:**
- `W_SUMMARY_STRUCTURE`: Summary has 6 sentences (expected 3-5)

## Report Integrity

What a customer reads, measured on each validated report. These checks are reported, not gated; the status counts above are unchanged. **Model** is the report as generated. **Shown** is the report after the deterministic post-generation pass that the web report and PDF both apply.

| Check | Model | Shown |
|:------|:------|:------|
| Reports with a rewrite | 0 of 30 (0 rewrites) | same |
| Keep/fix collisions on one line | 10 in 10 reports | 0 |
| Critical Miss line also in Keep | 2 reports | 0 reports |
| Repeated observations | 206 | 0 |
| Field-slot mapping issues | 0 | 0 |
| Critical Miss is a line edit / structural | 11 / 19 (employment gap 18, buried evidence 1) | same |
| Nothing critical (Critical Miss marked low impact) | 6 reports | same |
| Model's first fix dropped by validation | 1 report | same |
| Structural issue flagged, Critical Miss is a line edit | 0 reports | same |
| Verdict and Critical Miss disagree | 1 report | same |
| Verdict raises no concern | 0 reports | same |
| Fix headings over 12 words | 0 of 79 (longest 11 words) | same |
| Fix headings that open with a location / carry a condition | 0 / 0 | same |

| Fixture | Score | Rewrites | Keep/fix | Repeats | Slot issues | Critical Miss | Verdict and Critical Miss |
|:--------|:------|:---------|:---------|:--------|:------------|:--------------|:--------------------------|
| synth_data_scientist_senior_elite_1 | 94 | 0 | 1 → 0 (Critical Miss in Keep) | 4 → 0 | 0 → 0 | line edit, nothing critical | agree |
| synth_data_scientist_senior_elite_1 | 95 | 0 | 0 → 0 | 6 → 0 | 0 → 0 | line edit, nothing critical | agree |
| synth_data_scientist_senior_elite_1 | 94 | 0 | 1 → 0 (Critical Miss in Keep) | 7 → 0 | 0 → 0 | line edit, nothing critical | agree |
| synth_marketing_manager_vp_elite_1 | 91 | 0 | 0 → 0 | 5 → 0 | 0 → 0 | line edit, nothing critical | agree |
| synth_marketing_manager_vp_elite_1 | 88 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | line edit, nothing critical | agree |
| synth_marketing_manager_vp_elite_1 | 89 | 0 | 0 → 0 | 5 → 0 | 0 → 0 | line edit, nothing critical | agree |
| synth_software_engineer_mid_strong_1 | 84 | 0 | 0 → 0 | 8 → 0 | 0 → 0 | structural (employment gap); flagged: employment gap | agree |
| synth_software_engineer_mid_strong_1 | 83 | 0 | 0 → 0 | 9 → 0 | 0 → 0 | structural (employment gap); flagged: employment gap | agree |
| synth_software_engineer_mid_strong_1 | 84 | 0 | 0 → 0 | 8 → 0 | 0 → 0 | structural (employment gap); flagged: employment gap | agree |
| synth_ux_designer_director_strong_1 | 81 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | line edit | agree |
| synth_ux_designer_director_strong_1 | 84 | 0 | 0 → 0 | 8 → 0 | 0 → 0 | line edit | agree |
| synth_ux_designer_director_strong_1 | 82 | 0 | 1 → 0 | 6 → 0 | 0 → 0 | structural (buried evidence); flagged: buried evidence | agree |
| synth_sales_executive_mid_foundation_1 | 57 | 0 | 1 → 0 | 7 → 0 | 0 → 0 | structural (employment gap); flagged: employment gap | agree |
| synth_sales_executive_mid_foundation_1 | 58 | 0 | 0 → 0 | 5 → 0 | 0 → 0 | structural (employment gap); flagged: employment gap | agree |
| synth_sales_executive_mid_foundation_1 | 57 | 0 | 1 → 0 | 7 → 0 | 0 → 0 | structural (employment gap); flagged: employment gap | agree |
| synth_hr_manager_director_foundation_1 | 58 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | structural (employment gap); flagged: employment gap | agree |
| synth_hr_manager_director_foundation_1 | 57 | 0 | 0 → 0 | 6 → 0 | 0 → 0 | structural (employment gap); flagged: employment gap | agree |
| synth_hr_manager_director_foundation_1 | 58 | 0 | 0 → 0 | 5 → 0 | 0 → 0 | structural (employment gap); flagged: employment gap | agree |
| synth_finance_analyst_senior_weak_1 | 58 | 0 | 0 → 0 | 8 → 0 | 0 → 0 | structural (employment gap); flagged: employment gap | agree |
| synth_finance_analyst_senior_weak_1 | 57 | 0 | 1 → 0 | 8 → 0 | 0 → 0 | structural (employment gap); flagged: employment gap | agree |
| synth_finance_analyst_senior_weak_1 | 58 | 0 | 1 → 0 | 7 → 0 | 0 → 0 | structural (employment gap); flagged: employment gap | agree |
| synth_operations_manager_entry_weak_1 | 58 | 0 | 0 → 0 | 8 → 0 | 0 → 0 | structural (employment gap); flagged: employment gap | agree |
| synth_operations_manager_entry_weak_1 | 58 | 0 | 0 → 0 | 6 → 0 | 0 → 0 | structural (employment gap); flagged: employment gap | agree |
| synth_operations_manager_entry_weak_1 | 58 | 0 | 1 → 0 | 6 → 0 | 0 → 0 | structural (employment gap); flagged: employment gap | agree |
| synth_project_manager_vp_strong_1 | 84 | 0 | 1 → 0 | 9 → 0 | 0 → 0 | line edit | agree |
| synth_project_manager_vp_strong_1 | 84 | 0 | 0 → 0 | 9 → 0 | 0 → 0 | line edit | agree |
| synth_project_manager_vp_strong_1 | 85 | 0 | 0 → 0 | 5 → 0 | 0 → 0 | line edit | mismatch |
| synth_product_manager_entry_elite_1 | 88 | 0 | 1 → 0 | 9 → 0 | 0 → 0 | structural (employment gap); flagged: employment gap | agree |
| synth_product_manager_entry_elite_1 | 86 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | structural (employment gap); flagged: employment gap | agree |
| synth_product_manager_entry_elite_1 | 86 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | structural (employment gap); flagged: employment gap | agree |

<details>
<summary>Integrity details</summary>

- **synth_data_scientist_senior_elite_1**: The Verdict says to keep part of the line fix 1 changes.
- **synth_project_manager_vp_strong_1**: The takeaway ("Name a representative project") points at fix 2, not the Critical Miss.
</details>

## Score Test-Retest

| Fixture | Scores | Range | Mean | SD |
|:--------|:-------|:------|:-----|:---|
| synth_data_scientist_senior_elite_1 | 94, 95, 94 | 1 | 94.3 | 0.6 |
| synth_marketing_manager_vp_elite_1 | 91, 88, 89 | 3 | 89.3 | 1.5 |
| synth_software_engineer_mid_strong_1 | 84, 83, 84 | 1 | 83.7 | 0.6 |
| synth_ux_designer_director_strong_1 | 81, 84, 82 | 3 | 82.3 | 1.5 |
| synth_sales_executive_mid_foundation_1 | 57, 58, 57 | 1 | 57.3 | 0.6 |
| synth_hr_manager_director_foundation_1 | 58, 57, 58 | 1 | 57.7 | 0.6 |
| synth_finance_analyst_senior_weak_1 | 58, 57, 58 | 1 | 57.7 | 0.6 |
| synth_operations_manager_entry_weak_1 | 58, 58, 58 | 0 | 58 | 0 |
| synth_project_manager_vp_strong_1 | 84, 84, 85 | 1 | 84.3 | 0.6 |
| synth_product_manager_entry_elite_1 | 88, 86, 86 | 2 | 86.7 | 1.2 |

## ✅ Passed

28 fixtures passed all checks.

<details>
<summary>Expand to see fixture IDs</summary>

- synth_data_scientist_senior_elite_1 (score: 94)
- synth_data_scientist_senior_elite_1 (score: 95)
- synth_data_scientist_senior_elite_1 (score: 94)
- synth_marketing_manager_vp_elite_1 (score: 91)
- synth_marketing_manager_vp_elite_1 (score: 88)
- synth_marketing_manager_vp_elite_1 (score: 89)
- synth_software_engineer_mid_strong_1 (score: 84)
- synth_ux_designer_director_strong_1 (score: 81)
- synth_ux_designer_director_strong_1 (score: 84)
- synth_ux_designer_director_strong_1 (score: 82)
- synth_sales_executive_mid_foundation_1 (score: 57)
- synth_sales_executive_mid_foundation_1 (score: 58)
- synth_sales_executive_mid_foundation_1 (score: 57)
- synth_hr_manager_director_foundation_1 (score: 58)
- synth_hr_manager_director_foundation_1 (score: 57)
- synth_hr_manager_director_foundation_1 (score: 58)
- synth_finance_analyst_senior_weak_1 (score: 58)
- synth_finance_analyst_senior_weak_1 (score: 57)
- synth_finance_analyst_senior_weak_1 (score: 58)
- synth_operations_manager_entry_weak_1 (score: 58)
- synth_operations_manager_entry_weak_1 (score: 58)
- synth_operations_manager_entry_weak_1 (score: 58)
- synth_project_manager_vp_strong_1 (score: 84)
- synth_project_manager_vp_strong_1 (score: 84)
- synth_project_manager_vp_strong_1 (score: 85)
- synth_product_manager_entry_elite_1 (score: 88)
- synth_product_manager_entry_elite_1 (score: 86)
- synth_product_manager_entry_elite_1 (score: 86)
</details>
