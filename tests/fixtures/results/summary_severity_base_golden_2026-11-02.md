# PromptOps Live Eval Report

**Run ID:** eval_1793640409975
**Timestamp:** 2026-11-02T17:38:18.542Z
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
| Total Fixtures | 23 |
| ✅ Passed | 22 |
| ⚠️ Warned | 0 |
| ❌ Failed | 1 |
| Pass Rate | 95.7% |

## Cost

| Metric | Value |
|:-------|:------|
| API Calls | 29 |
| Token-calculated API Cost | $0.427663 |
| Input Tokens | 257,956 |
| Cached Input Tokens | 197,129 |
| Output Tokens | 68,359 |
| Reasoning Tokens | 14,708 |
| Budget | $3.00 |

## ❌ Blocking Failures

These must be fixed before shipping.

### synth_hr_manager_director_foundation_1

**Status:** FAIL
**Score:** 61 (expected: 55–68)

**Errors (ship blockers):**
- `E_SCHEMA`: Production validation failed after repair: The model response failed the evidence grounding contract at score_comment_short unsupported narrative facts: Most HR.

## Report Integrity

What a customer reads, measured on each validated report. These checks are reported, not gated; the status counts above are unchanged. **Model** is the report as generated. **Shown** is the report after the deterministic post-generation pass that the web report and PDF both apply.

| Check | Model | Shown |
|:------|:------|:------|
| Reports with a rewrite | 0 of 22 (0 rewrites) | same |
| Keep/fix collisions on one line | 5 in 4 reports | 0 |
| Critical Miss line also in Keep | 3 reports | 0 reports |
| Repeated observations | 142 | 0 |
| Field-slot mapping issues | 0 | 0 |
| Critical Miss is a line edit / structural | 20 / 2 (positioning 1, employment gap 1) | same |
| Nothing critical (Critical Miss marked low impact) | 0 reports | same |
| Model's first fix dropped by validation | 3 reports | same |
| Reports with 1 / 2 / 3 Critical Misses | 22 / 0 / 0 | same |
| Reports saying more than three exist | 0 | same |
| Critical Misses by kind | concrete fact 14, other 6, direction 1, dates 1 (of 22) | same |
| Structural issue flagged, Critical Miss is a line edit | 7 reports | same |
| Verdict and Critical Miss disagree | 7 reports | same |
| Verdict raises no concern | 8 reports | same |
| Fix headings over 12 words | 57 of 57 (longest 29 words) | same |
| Fix headings that open with a location / carry a condition | 50 / 8 | same |

| Fixture | Score | Rewrites | Keep/fix | Repeats | Slot issues | Critical Miss | Verdict and Critical Miss |
|:--------|:------|:---------|:---------|:--------|:------------|:--------------|:--------------------------|
| golden_talent_leader_high_bar_matt_shaw_current_1 | 84 | 0 | 0 → 0 | 6 → 0 | 0 → 0 | line edit; flagged: employment gap (outranked) | mismatch |
| golden_finance_controller_strong_foundation_1 | 72 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | line edit | agree |
| golden_sales_strong_foundation_mark_sherrod_1 | 80 | 0 | 0 → 0 | 8 → 0 | 0 → 0 | line edit; flagged: employment gap (outranked) | agree |
| anchor_elite_ml_staff_1 | 92 | 0 | 0 → 0 | 6 → 0 | 0 → 0 | line edit | no concern |
| anchor_elite_pm_ai_1 | 91 | 0 | 0 → 0 | 6 → 0 | 0 → 0 | line edit | agree |
| anchor_elite_vp_talent_1 | 91 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | structural (positioning) | no concern |
| recruiter_palantir_strong_foundation_1 | 84 | 0 | 0 → 0 | 4 → 0 | 0 → 0 | line edit | mismatch |
| devops_senior_high_bar_1 | 78 | 0 | 2 → 0 | 7 → 0 | 0 → 0 | line edit | no concern |
| law_inhouse_thin_signal_1 | 78 | 0 | 0 → 0 | 8 → 0 | 0 → 0 | line edit | mismatch |
| finance_not_ready_sam_helmuth_1 | 55 | 0 | 1 → 0 (Critical Miss in Keep) | 11 → 0 | 0 → 0 | line edit | agree |
| synth_data_scientist_senior_elite_1 | 92 | 0 | 0 → 0 | 4 → 0 | 0 → 0 | line edit; flagged: target role (outranked) | no concern |
| synth_marketing_manager_vp_elite_1 | 90 | 0 | 0 → 0 | 5 → 0 | 0 → 0 | line edit | no concern |
| synth_software_engineer_mid_strong_1 | 84 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | line edit | agree |
| synth_ux_designer_director_strong_1 | 82 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | line edit; flagged: target role (outranked) | no concern |
| synth_sales_executive_mid_foundation_1 | 61 | 0 | 1 → 0 (Critical Miss in Keep) | 5 → 0 | 0 → 0 | line edit; flagged: employment gap (outranked) | mismatch |
| synth_finance_analyst_senior_weak_1 | 58 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | line edit; flagged: employment gap, target role (outranked) | mismatch |
| synth_operations_manager_entry_weak_1 | 59 | 0 | 0 → 0 | 3 → 0 | 0 → 0 | line edit; flagged: employment gap (outranked) | mismatch |
| synth_project_manager_vp_strong_1 | 83 | 0 | 1 → 0 (Critical Miss in Keep) | 3 → 0 | 0 → 0 | line edit | no concern |
| synth_product_manager_entry_elite_1 | 87 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | structural (employment gap); flagged: employment gap | agree |
| career_path_elementary_educator_1 | 78 | 0 | 0 → 0 | 8 → 0 | 0 → 0 | line edit | mismatch |
| career_path_ministry_leader_1 | 81 | 0 | 0 → 0 | 8 → 0 | 0 → 0 | line edit | no concern |
| frontline_retail_entry_1 | 83 | 0 | 0 → 0 | 8 → 0 | 0 → 0 | line edit | agree |

<details>
<summary>Integrity details</summary>

- **golden_talent_leader_high_bar_matt_shaw_current_1**: The Verdict's concern is fix 2's line, not the Critical Miss.
- **anchor_elite_ml_staff_1**: The Verdict raises no concern, yet the report still names a Critical Miss.
- **anchor_elite_vp_talent_1**: The Verdict raises no concern, yet the report still names a Critical Miss.
- **recruiter_palantir_strong_foundation_1**: The Verdict's concern is fix 2's line, not the Critical Miss.
- **devops_senior_high_bar_1**: The Verdict raises no concern, yet the report still names a Critical Miss.
- **law_inhouse_thin_signal_1**: The takeaway ("Explain the platform rollout") points at fix 2, not the Critical Miss. The biggest-gap example quotes fix 2's line.
- **synth_data_scientist_senior_elite_1**: The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_marketing_manager_vp_elite_1**: The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_ux_designer_director_strong_1**: The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_sales_executive_mid_foundation_1**: The takeaway ("Describe your engagement work") points at fix 2, not the Critical Miss. The biggest-gap example quotes fix 2's line.
- **synth_finance_analyst_senior_weak_1**: The takeaway ("Name the project deliverables") points at fix 2, not the Critical Miss. The biggest-gap example quotes fix 2's line.
- **synth_operations_manager_entry_weak_1**: The takeaway ("Explain the departmental handoffs.") points at fix 2, not the Critical Miss. The biggest-gap example quotes fix 2's line.
- **synth_project_manager_vp_strong_1**: The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_product_manager_entry_elite_1**: The biggest-gap example quotes fix 3's line.
- **career_path_elementary_educator_1**: The Verdict's concern is fix 2's line, not the Critical Miss. The takeaway ("Explain your curriculum contribution") points at fix 2, not the Critical Miss. The biggest-gap example quotes fix 2's line.
- **career_path_ministry_leader_1**: The Verdict raises no concern, yet the report still names a Critical Miss.
</details>

## Score Test-Retest

Each fixture was generated once, so test-retest was not measured. Use `--repeat <n>`, or replay several saved runs of the same fixtures together.

## ✅ Passed

22 fixtures passed all checks.

<details>
<summary>Expand to see fixture IDs</summary>

- golden_talent_leader_high_bar_matt_shaw_current_1 (score: 84)
- golden_finance_controller_strong_foundation_1 (score: 72)
- golden_sales_strong_foundation_mark_sherrod_1 (score: 80)
- anchor_elite_ml_staff_1 (score: 92)
- anchor_elite_pm_ai_1 (score: 91)
- anchor_elite_vp_talent_1 (score: 91)
- recruiter_palantir_strong_foundation_1 (score: 84)
- devops_senior_high_bar_1 (score: 78)
- law_inhouse_thin_signal_1 (score: 78)
- finance_not_ready_sam_helmuth_1 (score: 55)
- synth_data_scientist_senior_elite_1 (score: 92)
- synth_marketing_manager_vp_elite_1 (score: 90)
- synth_software_engineer_mid_strong_1 (score: 84)
- synth_ux_designer_director_strong_1 (score: 82)
- synth_sales_executive_mid_foundation_1 (score: 61)
- synth_finance_analyst_senior_weak_1 (score: 58)
- synth_operations_manager_entry_weak_1 (score: 59)
- synth_project_manager_vp_strong_1 (score: 83)
- synth_product_manager_entry_elite_1 (score: 87)
- career_path_elementary_educator_1 (score: 78)
- career_path_ministry_leader_1 (score: 81)
- frontline_retail_entry_1 (score: 83)
</details>
