# PromptOps Live Eval Report

**Run ID:** eval_1793553816681_replay
**Timestamp:** 2026-11-01T17:31:55.701Z
**Tier:** golden
**Prompt Version:** v1
**Contract Version:** v2
**Execution Mode:** Live model evaluation
**Model:** gpt-6.1-terra
**Reasoning effort:** medium
**Resume prompt SHA-256:** fd692fcf56071d2bf15076e3fc58b5de8aa9eab8fcd048e1e5bb2dd65a277112
**Resume ideas prompt SHA-256:** 6d90925e63aae15476712f92af5ffbdf4e684feec413711e14d6dba7201b6fc7
**Incomplete-response retry:** high reasoning
**Validation Mode:** Saved output replay through current candidate
**Validation Timestamp:** 2026-11-01T20:01:55.199Z
**Source run SHA-256:** 25c06fc86d8d2ef2f4b91ac75270345143f522512f48b6a0f4d2d3b271330551

## Summary

| Metric | Value |
|:-------|:------|
| Total Fixtures | 30 |
| ✅ Passed | 27 |
| ⚠️ Warned | 3 |
| ❌ Failed | 0 |
| Pass Rate | 90.0% |

## Cost

| Metric | Value |
|:-------|:------|
| API Calls | 38 |
| Token-calculated API Cost | $0.539557 |
| Input Tokens | 366,174 |
| Cached Input Tokens | 293,289 |
| Output Tokens | 86,763 |
| Reasoning Tokens | 18,961 |
| Budget | $3.00 |

## ⚠️ Warnings (Review Recommended)

### synth_software_engineer_mid_strong_1

**Status:** WARN
**Score:** 84 (expected: 78–88)

**Warnings:**
- `W_SUMMARY_STRUCTURE`: Summary has 6 sentences (expected 3-5)

### synth_software_engineer_mid_strong_1

**Status:** WARN
**Score:** 84 (expected: 78–88)

**Warnings:**
- `W_SUMMARY_STRUCTURE`: Summary has 6 sentences (expected 3-5)

### synth_hr_manager_director_foundation_1

**Status:** WARN
**Score:** 58 (expected: 55–68)

**Warnings:**
- `W_MECHANICAL_COPY`: strengths.2 repeats the clause "financial services and"

## Report Integrity

What a customer reads, measured on each validated report. These checks are reported, not gated; the status counts above are unchanged. **Model** is the report as generated. **Shown** is the report after the deterministic post-generation pass that the web report and PDF both apply.

| Check | Model | Shown |
|:------|:------|:------|
| Reports with a rewrite | 0 of 30 (0 rewrites) | same |
| Keep/fix collisions on one line | 5 in 4 reports | 0 |
| Critical Miss line also in Keep | 1 report | 0 reports |
| Repeated observations | 180 | 0 |
| Field-slot mapping issues | 0 | 0 |
| Critical Miss is a line edit / structural | 11 / 19 (employment gap 16, buried evidence 3) | same |
| Nothing critical (Critical Miss marked low impact) | 6 reports | same |
| Model's first fix dropped by validation | 3 reports | same |
| Structural issue flagged, Critical Miss is a line edit | 2 reports | same |
| Verdict and Critical Miss disagree | 2 reports | same |
| Verdict raises no concern | 0 reports | same |
| Fix headings over 12 words | 0 of 62 (longest 10 words) | same |
| Fix headings that open with a location / carry a condition | 0 / 0 | same |

| Fixture | Score | Rewrites | Keep/fix | Repeats | Slot issues | Critical Miss | Verdict and Critical Miss |
|:--------|:------|:---------|:---------|:--------|:------------|:--------------|:--------------------------|
| synth_data_scientist_senior_elite_1 | 94 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | line edit, nothing critical | agree |
| synth_data_scientist_senior_elite_1 | 94 | 0 | 1 → 0 | 7 → 0 | 0 → 0 | line edit, nothing critical | agree |
| synth_data_scientist_senior_elite_1 | 94 | 0 | 0 → 0 | 5 → 0 | 0 → 0 | line edit, nothing critical | agree |
| synth_marketing_manager_vp_elite_1 | 93 | 0 | 0 → 0 | 6 → 0 | 0 → 0 | line edit, nothing critical | agree |
| synth_marketing_manager_vp_elite_1 | 94 | 0 | 0 → 0 | 6 → 0 | 0 → 0 | line edit, nothing critical | agree |
| synth_marketing_manager_vp_elite_1 | 92 | 0 | 0 → 0 | 5 → 0 | 0 → 0 | line edit, nothing critical | agree |
| synth_software_engineer_mid_strong_1 | 84 | 0 | 0 → 0 | 5 → 0 | 0 → 0 | structural (employment gap); flagged: employment gap | agree |
| synth_software_engineer_mid_strong_1 | 84 | 0 | 0 → 0 | 2 → 0 | 0 → 0 | line edit; flagged: employment gap (outranked) | mismatch |
| synth_software_engineer_mid_strong_1 | 84 | 0 | 0 → 0 | 5 → 0 | 0 → 0 | structural (employment gap); flagged: employment gap | agree |
| synth_ux_designer_director_strong_1 | 83 | 0 | 0 → 0 | 8 → 0 | 0 → 0 | structural (buried evidence); flagged: buried evidence | agree |
| synth_ux_designer_director_strong_1 | 84 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | structural (buried evidence); flagged: buried evidence, target role | agree |
| synth_ux_designer_director_strong_1 | 84 | 0 | 0 → 0 | 6 → 0 | 0 → 0 | structural (buried evidence); flagged: buried evidence | agree |
| synth_sales_executive_mid_foundation_1 | 58 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | structural (employment gap); flagged: employment gap | agree |
| synth_sales_executive_mid_foundation_1 | 58 | 0 | 1 → 0 | 8 → 0 | 0 → 0 | structural (employment gap); flagged: employment gap | agree |
| synth_sales_executive_mid_foundation_1 | 57 | 0 | 0 → 0 | 5 → 0 | 0 → 0 | structural (employment gap); flagged: employment gap | agree |
| synth_hr_manager_director_foundation_1 | 58 | 0 | 0 → 0 | 5 → 0 | 0 → 0 | structural (employment gap); flagged: employment gap | agree |
| synth_hr_manager_director_foundation_1 | 58 | 0 | 0 → 0 | 5 → 0 | 0 → 0 | structural (employment gap); flagged: employment gap | agree |
| synth_hr_manager_director_foundation_1 | 58 | 0 | 0 → 0 | 4 → 0 | 0 → 0 | structural (employment gap); flagged: employment gap | agree |
| synth_finance_analyst_senior_weak_1 | 57 | 0 | 2 → 0 (Critical Miss in Keep) | 5 → 0 | 0 → 0 | line edit; flagged: employment gap (outranked) | mismatch |
| synth_finance_analyst_senior_weak_1 | 57 | 0 | 0 → 0 | 8 → 0 | 0 → 0 | structural (employment gap); flagged: employment gap | agree |
| synth_finance_analyst_senior_weak_1 | 57 | 0 | 1 → 0 | 7 → 0 | 0 → 0 | structural (employment gap); flagged: employment gap | agree |
| synth_operations_manager_entry_weak_1 | 58 | 0 | 0 → 0 | 2 → 0 | 0 → 0 | structural (employment gap); flagged: employment gap | agree |
| synth_operations_manager_entry_weak_1 | 58 | 0 | 0 → 0 | 5 → 0 | 0 → 0 | structural (employment gap); flagged: employment gap | agree |
| synth_operations_manager_entry_weak_1 | 58 | 0 | 0 → 0 | 6 → 0 | 0 → 0 | structural (employment gap); flagged: employment gap | agree |
| synth_project_manager_vp_strong_1 | 84 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | line edit | agree |
| synth_project_manager_vp_strong_1 | 84 | 0 | 0 → 0 | 8 → 0 | 0 → 0 | line edit | agree |
| synth_project_manager_vp_strong_1 | 84 | 0 | 0 → 0 | 10 → 0 | 0 → 0 | line edit | agree |
| synth_product_manager_entry_elite_1 | 87 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | structural (employment gap); flagged: employment gap | agree |
| synth_product_manager_entry_elite_1 | 87 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | structural (employment gap); flagged: employment gap | agree |
| synth_product_manager_entry_elite_1 | 86 | 0 | 0 → 0 | 5 → 0 | 0 → 0 | structural (employment gap); flagged: employment gap | agree |

<details>
<summary>Integrity details</summary>

- **synth_software_engineer_mid_strong_1**: The Verdict's concern is employment gap, but the Critical Miss is a single-line edit.
- **synth_finance_analyst_senior_weak_1**: The Verdict's concern is employment gap, but the Critical Miss is a single-line edit.
</details>

## Score Test-Retest

| Fixture | Scores | Range | Mean | SD |
|:--------|:-------|:------|:-----|:---|
| synth_data_scientist_senior_elite_1 | 94, 94, 94 | 0 | 94 | 0 |
| synth_marketing_manager_vp_elite_1 | 93, 94, 92 | 2 | 93 | 1 |
| synth_software_engineer_mid_strong_1 | 84, 84, 84 | 0 | 84 | 0 |
| synth_ux_designer_director_strong_1 | 83, 84, 84 | 1 | 83.7 | 0.6 |
| synth_sales_executive_mid_foundation_1 | 58, 58, 57 | 1 | 57.7 | 0.6 |
| synth_hr_manager_director_foundation_1 | 58, 58, 58 | 0 | 58 | 0 |
| synth_finance_analyst_senior_weak_1 | 57, 57, 57 | 0 | 57 | 0 |
| synth_operations_manager_entry_weak_1 | 58, 58, 58 | 0 | 58 | 0 |
| synth_project_manager_vp_strong_1 | 84, 84, 84 | 0 | 84 | 0 |
| synth_product_manager_entry_elite_1 | 87, 87, 86 | 1 | 86.7 | 0.6 |

## ✅ Passed

27 fixtures passed all checks.

<details>
<summary>Expand to see fixture IDs</summary>

- synth_data_scientist_senior_elite_1 (score: 94)
- synth_data_scientist_senior_elite_1 (score: 94)
- synth_data_scientist_senior_elite_1 (score: 94)
- synth_marketing_manager_vp_elite_1 (score: 93)
- synth_marketing_manager_vp_elite_1 (score: 94)
- synth_marketing_manager_vp_elite_1 (score: 92)
- synth_software_engineer_mid_strong_1 (score: 84)
- synth_ux_designer_director_strong_1 (score: 83)
- synth_ux_designer_director_strong_1 (score: 84)
- synth_ux_designer_director_strong_1 (score: 84)
- synth_sales_executive_mid_foundation_1 (score: 58)
- synth_sales_executive_mid_foundation_1 (score: 58)
- synth_sales_executive_mid_foundation_1 (score: 57)
- synth_hr_manager_director_foundation_1 (score: 58)
- synth_hr_manager_director_foundation_1 (score: 58)
- synth_finance_analyst_senior_weak_1 (score: 57)
- synth_finance_analyst_senior_weak_1 (score: 57)
- synth_finance_analyst_senior_weak_1 (score: 57)
- synth_operations_manager_entry_weak_1 (score: 58)
- synth_operations_manager_entry_weak_1 (score: 58)
- synth_operations_manager_entry_weak_1 (score: 58)
- synth_project_manager_vp_strong_1 (score: 84)
- synth_project_manager_vp_strong_1 (score: 84)
- synth_project_manager_vp_strong_1 (score: 84)
- synth_product_manager_entry_elite_1 (score: 87)
- synth_product_manager_entry_elite_1 (score: 87)
- synth_product_manager_entry_elite_1 (score: 86)
</details>
