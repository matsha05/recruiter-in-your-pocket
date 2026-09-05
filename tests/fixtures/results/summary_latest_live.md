# PromptOps Live Eval Report

**Run ID:** eval_1788577888513_targeted_cohort_replay
**Timestamp:** 2026-09-05T03:22:08.062Z
**Tier:** golden
**Prompt Version:** v1
**Contract Version:** v2
**Execution Mode:** Live model evaluation
**Model:** gpt-5.6-terra
**Reasoning effort:** medium
**Resume prompt SHA-256:** 67c7257730ac5b53f3465454d7bc6831e83f07d50255435e7cafbc09d1f8fa86
**Resume ideas prompt SHA-256:** 6d90925e63aae15476712f92af5ffbdf4e684feec413711e14d6dba7201b6fc7
**Incomplete-response retry:** high reasoning
**Validation Mode:** Saved output replay through current candidate
**Validation Timestamp:** 2026-09-05T03:57:20.587Z
**Source run SHA-256:** 245686e38edf51014b54412f47e4c9d4ff6e3c235739190e4cc8d11413399d35

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
| API Calls | 58 |
| Token-calculated API Cost | $3.943779 |
| Input Tokens | 553,198 |
| Cached Input Tokens | 390,167 |
| Output Tokens | 229,244 |
| Reasoning Tokens | 129,689 |
| Budget | $10.00 |

## ⚠️ Warnings (Review Recommended)

### career_path_elementary_educator_1

**Status:** WARN
**Score:** 78 (expected: 74–88)

**Warnings:**
- `W_MECHANICAL_COPY`: job_alignment.role_fit.seniority_read repeats the clause "elementary teacher grade"

## ✅ Passed

22 fixtures passed all checks.

<details>
<summary>Expand to see fixture IDs</summary>

- golden_talent_leader_high_bar_matt_shaw_current_1 (score: 84)
- golden_finance_controller_strong_foundation_1 (score: 68)
- golden_sales_strong_foundation_mark_sherrod_1 (score: 80)
- anchor_elite_ml_staff_1 (score: 88)
- anchor_elite_pm_ai_1 (score: 87)
- anchor_elite_vp_talent_1 (score: 84)
- recruiter_palantir_strong_foundation_1 (score: 78)
- devops_senior_high_bar_1 (score: 68)
- law_inhouse_thin_signal_1 (score: 68)
- finance_not_ready_sam_helmuth_1 (score: 56)
- synth_data_scientist_senior_elite_1 (score: 92)
- synth_marketing_manager_vp_elite_1 (score: 88)
- synth_software_engineer_mid_strong_1 (score: 78)
- synth_ux_designer_director_strong_1 (score: 80)
- synth_sales_executive_mid_foundation_1 (score: 57)
- synth_hr_manager_director_foundation_1 (score: 61)
- synth_finance_analyst_senior_weak_1 (score: 57)
- synth_operations_manager_entry_weak_1 (score: 57)
- synth_project_manager_vp_strong_1 (score: 80)
- synth_product_manager_entry_elite_1 (score: 84)
- career_path_ministry_leader_1 (score: 76)
- frontline_retail_entry_1 (score: 80)
</details>

## Evidence provenance and limits

This is a saved-output replay of a 23-fixture cohort, not a fresh full-batch pass. The original full run returned 14 PASS, 1 WARN and 8 FAIL before validator corrections. Five designated cases were regenerated after format, factual or section-presence findings; every other source output is unchanged. Repair instructions were refined during the targeted checks. No report prose was manually edited.

The final separate three-fixture smoke run `eval_1788580173368` initially returned 3 FAIL from false rejections of technology recruiting, people-management assessment and a real graduation-date discrepancy. After paired guard corrections, the exact unedited outputs replay as 3 PASS, 0 WARN and 0 FAIL (`eval_1788580173368_replay`, source SHA-256 `198e516c430c316b110214549cc8625f56ee5ce06446cd3155d227b29d61946d`). Independent source review found no material factual or copy blocker. Total authorized campaign spend was $8.270279 of $10, calculated from returned token usage. The original failed runs remain retained locally.

All 23 selected reports were independently read against their source resumes. The one warning is repeated teacher-role wording, not a changed source fact. The checks reject the reproduced factual errors; they do not establish universal accuracy for future generated reports.

### Source receipts

| Run | SHA-256 |
| --- | --- |
| `eval_1788577888513` | `b179f4d1f7e616dcd33222a95105bcf118d0d10048c27719157128f37a2ef36f` |
| `eval_1788578961125` | `33b0d9d59693ba1bda166d7100afbfc7c083cfec8abec3f53800f0b67090d469` |
| `eval_1788578995258` | `bc799f7521880fb134ce71e9bf958f93c665ac7fe9d5909a348347ac343fc065` |
| `eval_1788579021545` | `6c2b0b81fce177143b7bd2f65400d303c8d9f2ebf651b998b5dec170950fce7f` |
| `eval_1788579097413` | `d50dc99f2d7ad642544873b690a16cd78cdb287440019b475baec72311f583ec` |
| `eval_1788579164184` | `16a1c612530fc642ac7dbe7aa5fafc937cb39ec2a6e45ef30f2b41d881c476bb` |
| `eval_1788579373788` | `06072d46775c12d67c169ce2f8fe2da2b9a1d654fc1834894e869565e1846ea7` |
| `eval_1788579461213` | `04f571e6624c042ff35655c88d8639a201af30866e05e9fef5a22d37959b1d57` |
| `eval_1788579729634` | `a42776a4036d49c1793410e8f4b54a0cfd0b09deffbadbe1c76edfdf7dff0ea3` |
| `eval_1788579971516` | `06c81d384ff67c516cfdfcd0f25b1586d3d0544b649d4aa981783771cc67face` |

### Selected fixture origins

| Fixture | Source receipt |
| --- | --- |
| `golden_talent_leader_high_bar_matt_shaw_current_1` | `2026-09-05T03-22-08-062Z_live_run.json` |
| `golden_finance_controller_strong_foundation_1` | `2026-09-05T03-22-08-062Z_live_run.json` |
| `golden_sales_strong_foundation_mark_sherrod_1` | `2026-09-05T03-22-08-062Z_live_run.json` |
| `anchor_elite_ml_staff_1` | `2026-09-05T03-22-08-062Z_live_run.json` |
| `anchor_elite_pm_ai_1` | `2026-09-05T03-22-08-062Z_live_run.json` |
| `anchor_elite_vp_talent_1` | `2026-09-05T03-22-08-062Z_live_run.json` |
| `recruiter_palantir_strong_foundation_1` | `2026-09-05T03-22-08-062Z_live_run.json` |
| `devops_senior_high_bar_1` | `2026-09-05T03-22-08-062Z_live_run.json` |
| `law_inhouse_thin_signal_1` | `2026-09-05T03-22-08-062Z_live_run.json` |
| `finance_not_ready_sam_helmuth_1` | `2026-09-05T03-29-55-241Z_live_run.json` |
| `synth_data_scientist_senior_elite_1` | `2026-09-05T03-22-08-062Z_live_run.json` |
| `synth_marketing_manager_vp_elite_1` | `2026-09-05T03-30-21-544Z_live_run.json` |
| `synth_software_engineer_mid_strong_1` | `2026-09-05T03-22-08-062Z_live_run.json` |
| `synth_ux_designer_director_strong_1` | `2026-09-05T03-22-08-062Z_live_run.json` |
| `synth_sales_executive_mid_foundation_1` | `2026-09-05T03-22-08-062Z_live_run.json` |
| `synth_hr_manager_director_foundation_1` | `2026-09-05T03-31-37-412Z_live_run.json` |
| `synth_finance_analyst_senior_weak_1` | `2026-09-05T03-22-08-062Z_live_run.json` |
| `synth_operations_manager_entry_weak_1` | `2026-09-05T03-43-24-552Z_live_run.json` |
| `synth_project_manager_vp_strong_1` | `2026-09-05T03-22-08-062Z_live_run.json` |
| `synth_product_manager_entry_elite_1` | `2026-09-05T03-48-03-108Z_live_run.json` |
| `career_path_elementary_educator_1` | `2026-09-05T03-22-08-062Z_live_run.json` |
| `career_path_ministry_leader_1` | `2026-09-05T03-22-08-062Z_live_run.json` |
| `frontline_retail_entry_1` | `2026-09-05T03-22-08-062Z_live_run.json` |
