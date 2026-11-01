# PromptOps Live Eval Report

**Run ID:** eval_1793560808592_replay
**Timestamp:** 2026-11-01T19:27:24.729Z
**Tier:** golden
**Prompt Version:** v1
**Contract Version:** v2
**Execution Mode:** Live model evaluation
**Model:** gpt-6.1-terra
**Reasoning effort:** medium
**Resume prompt SHA-256:** 55bee48bf96439b3171f1ccac5a8ca79cf1bdb6a003a3ef5f769e2c54f2b45c4
**Resume ideas prompt SHA-256:** 6d90925e63aae15476712f92af5ffbdf4e684feec413711e14d6dba7201b6fc7
**Incomplete-response retry:** high reasoning
**Validation Mode:** Saved output replay through current candidate
**Validation Timestamp:** 2026-11-01T20:11:26.633Z
**Source run SHA-256:** d72a2dbe77a0bff34afc7c44a3dc9ae10cd6df98f479c135e5035fe8bdbd7069

**Validation candidate:** 0766adc18e3dca9781feeb8b8970ab909644d7a2 (validator commits 11a7a021 and 64b12217, eval harness 0766adc1)
**Original generation candidate:** 1ddcc7b5ceac7023b2d21333af5de189b06e7260 (clean tree; the in-run result was 20 PASS, 1 WARN, 2 FAIL, both failures validator false rejections fixed in 64b12217 with paired controls)

## Summary

| Metric | Value |
|:-------|:------|
| Total Fixtures | 23 |
| ✅ Passed | 22 |
| ⚠️ Warned | 1 |
| ❌ Failed | 0 |
| Pass Rate | 95.7% |

## Cost

| Metric | Value |
|:-------|:------|
| API Calls | 30 |
| Token-calculated API Cost | $0.452260 |
| Input Tokens | 294,721 |
| Cached Input Tokens | 237,795 |
| Output Tokens | 73,847 |
| Reasoning Tokens | 20,297 |
| Budget | $4.00 |

## ⚠️ Warnings (Review Recommended)

### golden_sales_strong_foundation_mark_sherrod_1

**Status:** WARN
**Score:** 82 (expected: 80–88)

**Warnings:**
- `W_SUMMARY_STRUCTURE`: Summary has 6 sentences (expected 3-5)

## Report Integrity

What a customer reads, measured on each validated report. These checks are reported, not gated; the status counts above are unchanged. **Model** is the report as generated. **Shown** is the report after the deterministic post-generation pass that the web report and PDF both apply.

| Check | Model | Shown |
|:------|:------|:------|
| Reports with a rewrite | 0 of 23 (0 rewrites) | same |
| Keep/fix collisions on one line | 8 in 8 reports | 0 |
| Critical Miss line also in Keep | 1 report | 0 reports |
| Repeated observations | 156 | 0 |
| Field-slot mapping issues | 0 | 0 |
| Critical Miss is a line edit / structural | 12 / 11 (buried evidence 4, employment gap 6, positioning 1) | same |
| Nothing critical (Critical Miss marked low impact) | 5 reports | same |
| Model's first fix dropped by validation | 2 reports | same |
| Structural issue flagged, Critical Miss is a line edit | 1 report | same |
| Verdict and Critical Miss disagree | 1 report | same |
| Verdict raises no concern | 2 reports | same |
| Fix headings over 12 words | 0 of 56 (longest 10 words) | same |
| Fix headings that open with a location / carry a condition | 0 / 0 | same |

| Fixture | Score | Rewrites | Keep/fix | Repeats | Slot issues | Critical Miss | Verdict and Critical Miss |
|:--------|:------|:---------|:---------|:--------|:------------|:--------------|:--------------------------|
| golden_talent_leader_high_bar_matt_shaw_current_1 | 86 | 0 | 0 → 0 | 4 → 0 | 0 → 0 | structural (buried evidence); flagged: buried evidence | agree |
| golden_finance_controller_strong_foundation_1 | 68 | 0 | 0 → 0 | 10 → 0 | 0 → 0 | line edit | agree |
| golden_sales_strong_foundation_mark_sherrod_1 | 82 | 0 | 0 → 0 | 9 → 0 | 0 → 0 | structural (employment gap); flagged: employment gap | agree |
| anchor_elite_ml_staff_1 | 91 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | line edit, nothing critical | agree |
| anchor_elite_pm_ai_1 | 92 | 0 | 0 → 0 | 6 → 0 | 0 → 0 | line edit, nothing critical | agree |
| anchor_elite_vp_talent_1 | 94 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | structural (positioning), nothing critical | agree |
| recruiter_palantir_strong_foundation_1 | 82 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | line edit | agree |
| devops_senior_high_bar_1 | 75 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | structural (buried evidence); flagged: buried evidence | agree |
| law_inhouse_thin_signal_1 | 78 | 0 | 1 → 0 | 6 → 0 | 0 → 0 | line edit | agree |
| finance_not_ready_sam_helmuth_1 | 55 | 0 | 0 → 0 | 3 → 0 | 0 → 0 | line edit | no concern |
| synth_data_scientist_senior_elite_1 | 95 | 0 | 0 → 0 | 4 → 0 | 0 → 0 | line edit, nothing critical | agree |
| synth_marketing_manager_vp_elite_1 | 92 | 0 | 1 → 0 | 6 → 0 | 0 → 0 | line edit, nothing critical | agree |
| synth_software_engineer_mid_strong_1 | 83 | 0 | 0 → 0 | 11 → 0 | 0 → 0 | structural (employment gap); flagged: employment gap | agree |
| synth_ux_designer_director_strong_1 | 82 | 0 | 0 → 0 | 6 → 0 | 0 → 0 | structural (buried evidence) | no concern |
| synth_sales_executive_mid_foundation_1 | 58 | 0 | 1 → 0 | 8 → 0 | 0 → 0 | structural (employment gap); flagged: employment gap | agree |
| synth_hr_manager_director_foundation_1 | 59 | 0 | 0 → 0 | 4 → 0 | 0 → 0 | structural (employment gap); flagged: employment gap, level | agree |
| synth_finance_analyst_senior_weak_1 | 58 | 0 | 1 → 0 | 4 → 0 | 0 → 0 | line edit; flagged: employment gap (outranked) | mismatch |
| synth_operations_manager_entry_weak_1 | 57 | 0 | 1 → 0 | 8 → 0 | 0 → 0 | structural (employment gap); flagged: employment gap | agree |
| synth_project_manager_vp_strong_1 | 84 | 0 | 1 → 0 | 8 → 0 | 0 → 0 | line edit | agree |
| synth_product_manager_entry_elite_1 | 85 | 0 | 0 → 0 | 8 → 0 | 0 → 0 | structural (employment gap); flagged: employment gap | agree |
| career_path_elementary_educator_1 | 78 | 0 | 1 → 0 (Critical Miss in Keep) | 7 → 0 | 0 → 0 | line edit | agree |
| career_path_ministry_leader_1 | 84 | 0 | 0 → 0 | 8 → 0 | 0 → 0 | structural (buried evidence) | agree |
| frontline_retail_entry_1 | 83 | 0 | 1 → 0 | 8 → 0 | 0 → 0 | line edit | agree |

<details>
<summary>Integrity details</summary>

- **finance_not_ready_sam_helmuth_1**: The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_ux_designer_director_strong_1**: The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_finance_analyst_senior_weak_1**: The Verdict's concern is employment gap, but the Critical Miss is a single-line edit.
</details>

## Score Test-Retest

Each fixture was generated once, so test-retest was not measured. Use `--repeat <n>`, or replay several saved runs of the same fixtures together.

## ✅ Passed

22 fixtures passed all checks.

<details>
<summary>Expand to see fixture IDs</summary>

- golden_talent_leader_high_bar_matt_shaw_current_1 (score: 86)
- golden_finance_controller_strong_foundation_1 (score: 68)
- anchor_elite_ml_staff_1 (score: 91)
- anchor_elite_pm_ai_1 (score: 92)
- anchor_elite_vp_talent_1 (score: 94)
- recruiter_palantir_strong_foundation_1 (score: 82)
- devops_senior_high_bar_1 (score: 75)
- law_inhouse_thin_signal_1 (score: 78)
- finance_not_ready_sam_helmuth_1 (score: 55)
- synth_data_scientist_senior_elite_1 (score: 95)
- synth_marketing_manager_vp_elite_1 (score: 92)
- synth_software_engineer_mid_strong_1 (score: 83)
- synth_ux_designer_director_strong_1 (score: 82)
- synth_sales_executive_mid_foundation_1 (score: 58)
- synth_hr_manager_director_foundation_1 (score: 59)
- synth_finance_analyst_senior_weak_1 (score: 58)
- synth_operations_manager_entry_weak_1 (score: 57)
- synth_project_manager_vp_strong_1 (score: 84)
- synth_product_manager_entry_elite_1 (score: 85)
- career_path_elementary_educator_1 (score: 78)
- career_path_ministry_leader_1 (score: 84)
- frontline_retail_entry_1 (score: 83)
</details>
