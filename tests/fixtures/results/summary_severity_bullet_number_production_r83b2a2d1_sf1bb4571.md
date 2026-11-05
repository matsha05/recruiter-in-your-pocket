# PromptOps Live Eval Report

**Run ID:** eval_1793919973395+eval_1793919975441_combined_severity_2026-11-05T23-10-52-661Z
**Timestamp:** 2026-11-05T23:10:52.663Z
**Tier:** bulk+golden
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
| Total Fixtures | 22 |
| ✅ Passed | 22 |
| ⚠️ Warned | 0 |
| ❌ Failed | 0 |
| Pass Rate | 100.0% |

## Cost

| Metric | Value |
|:-------|:------|
| API Calls | 22 |
| Token-calculated API Cost | $0.072371 |
| Input Tokens | 224,384 |
| Cached Input Tokens | 163,272 |
| Output Tokens | 63,361 |
| Reasoning Tokens | 12,031 |
| Budget | $3.00 |

## Report Integrity

What a customer reads, measured on each validated report. These checks are reported, not gated; the status counts above are unchanged. **Model** is the report as generated. **Shown** is the report after the deterministic post-generation pass that the web report and PDF both apply.

| Check | Model | Shown |
|:------|:------|:------|
| Reports with a rewrite | 0 of 22 (0 rewrites) | same |
| Keep/fix collisions on one line | 7 in 6 reports | 0 |
| Critical Miss line also in Keep | 2 reports | 0 reports |
| Repeated observations | 134 | 0 |
| Field-slot mapping issues | 0 | 0 |
| Critical Miss is a line edit / structural | 10 / 12 (employment gap 8, positioning 4) | same |
| Nothing critical (Critical Miss marked low impact) | 0 reports | same |
| Model's first fix dropped by validation | 1 report | same |
| Reports with 1 / 2 / 3 Critical Misses | 9 / 2 / 11 | same |
| Reports saying more than three exist | 0 | same |
| Critical Misses by kind | concrete fact 22, dates 12, other 7, direction 5 (of 46) | same |
| Structural issue flagged, Critical Miss is a line edit | 1 report | same |
| Verdict and Critical Miss disagree | 8 reports | same |
| Verdict raises no concern | 8 reports | same |
| Fix headings over 12 words | 53 of 64 (longest 33 words) | same |
| Fix headings that open with a location / carry a condition | 47 / 18 | same |

| Fixture | Score | Rewrites | Keep/fix | Repeats | Slot issues | Critical Miss | Verdict and Critical Miss |
|:--------|:------|:---------|:---------|:--------|:------------|:--------------|:--------------------------|
| synth_data_scientist_senior_elite_1 | 93 | 0 | 0 → 0 | 8 → 0 | 0 → 0 | line edit | mismatch |
| synth_marketing_manager_vp_elite_1 | 88 | 0 | 0 → 0 | 9 → 0 | 0 → 0 | line edit | no concern |
| synth_software_engineer_mid_strong_1 | 84 | 0 | 1 → 0 | 5 → 0 | 0 → 0 | line edit; flagged: employment gap (outranked) | no concern |
| synth_ux_designer_director_strong_1 | 82 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | line edit | mismatch |
| synth_sales_executive_mid_foundation_1 | 57 | 0 | 1 → 0 (Critical Miss in Keep) | 5 → 0 | 0 → 0 | structural (employment gap); flagged: employment gap | mismatch |
| synth_hr_manager_director_foundation_1 | 59 | 0 | 0 → 0 | 6 → 0 | 0 → 0 | structural (employment gap); flagged: employment gap | mismatch |
| synth_finance_analyst_senior_weak_1 | 60 | 0 | 2 → 0 (Critical Miss in Keep) | 5 → 0 | 0 → 0 | structural (employment gap); flagged: employment gap | agree |
| synth_operations_manager_entry_weak_1 | 58 | 0 | 0 → 0 | 2 → 0 | 0 → 0 | structural (employment gap) | agree |
| synth_project_manager_vp_strong_1 | 84 | 0 | 0 → 0 | 4 → 0 | 0 → 0 | line edit | no concern |
| synth_product_manager_entry_elite_1 | 86 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | structural (employment gap); flagged: employment gap | no concern |
| synth_cc_operations_manager_bad_1 | 65 | 0 | 0 → 0 | 4 → 0 | 0 → 0 | structural (employment gap); flagged: employment gap | no concern |
| synth_cc_career_changer_bad_1 | 64 | 0 | 0 → 0 | 3 → 0 | 0 → 0 | line edit | mismatch |
| synth_cc_sales_rep_bad_1 | 65 | 0 | 0 → 0 | 6 → 0 | 0 → 0 | structural (positioning) | agree |
| synth_cc_marketing_director_bad_1 | 80 | 0 | 0 → 0 | 6 → 0 | 0 → 0 | structural (employment gap); flagged: level | mismatch |
| synth_cc_admin_generalist_bad_1 | 65 | 0 | 0 → 0 | 6 → 0 | 0 → 0 | structural (positioning) | agree |
| synth_cc_staff_accountant_bad_1 | 65 | 0 | 0 → 0 | 6 → 0 | 0 → 0 | structural (employment gap) | no concern |
| synth_cc_recent_grad_bad_1 | 62 | 0 | 0 → 0 | 6 → 0 | 0 → 0 | structural (positioning); flagged: employment gap | no concern |
| synth_cc_project_coordinator_bad_1 | 64 | 0 | 0 → 0 | 8 → 0 | 0 → 0 | structural (positioning); flagged: employment gap | agree |
| synth_cc_product_manager_strong_1 | 87 | 0 | 1 → 0 | 10 → 0 | 0 → 0 | line edit | no concern |
| synth_cc_physical_therapist_strong_1 | 86 | 0 | 1 → 0 | 9 → 0 | 0 → 0 | line edit | mismatch |
| synth_cc_fpa_analyst_strong_1 | 86 | 0 | 1 → 0 | 5 → 0 | 0 → 0 | line edit; flagged: positioning | mismatch |
| synth_cc_construction_pm_strong_1 | 85 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | line edit | agree |

<details>
<summary>Integrity details</summary>

- **synth_data_scientist_senior_elite_1**: The takeaway ("Define the model errors") points at fix 2, not the Critical Miss. The biggest-gap example quotes fix 2's line. The Verdict says to keep part of the line fix 1 changes.
- **synth_marketing_manager_vp_elite_1**: The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_software_engineer_mid_strong_1**: The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_ux_designer_director_strong_1**: The takeaway ("Explain the design standards") points at fix 2, not the Critical Miss. The biggest-gap example quotes fix 2's line.
- **synth_sales_executive_mid_foundation_1**: The takeaway ("Name your account responsibilities") points at fix 2, not the Critical Miss.
- **synth_hr_manager_director_foundation_1**: The takeaway ("Specify your employee relations contribution") points at fix 2, not the Critical Miss. The biggest-gap example quotes fix 2's line.
- **synth_project_manager_vp_strong_1**: The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_product_manager_entry_elite_1**: The biggest-gap example quotes fix 2's line. The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_cc_operations_manager_bad_1**: The biggest-gap example quotes fix 2's line. The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_cc_career_changer_bad_1**: The takeaway ("Date your freelance work") points at fix 3, not the Critical Miss.
- **synth_cc_marketing_director_bad_1**: The Verdict's concern is fix 3's line, not the Critical Miss. The takeaway ("Explain your marketing decisions") points at fix 3, not the Critical Miss.
- **synth_cc_staff_accountant_bad_1**: The biggest-gap example quotes fix 2's line. The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_cc_recent_grad_bad_1**: The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_cc_product_manager_strong_1**: The biggest-gap example quotes fix 2's line. The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_cc_physical_therapist_strong_1**: The takeaway ("Explain the mentoring work") points at fix 3, not the Critical Miss. The biggest-gap example quotes fix 3's line. The Verdict says to keep part of the line fix 1 changes.
- **synth_cc_fpa_analyst_strong_1**: The Verdict's concern is positioning, but the Critical Miss is a single-line edit.
</details>

## Score Test-Retest

Each fixture was generated once, so test-retest was not measured. Use `--repeat <n>`, or replay several saved runs of the same fixtures together.

## ✅ Passed

22 fixtures passed all checks.

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


## Severity check

- Prompt: `severity_check_v1:f1bb4571` (SHA-256 `f1bb4571f3f4cfbf8ed82e78193d543448789f076fec95cb6e79a19f1bc19c90`), model `gpt-6.1-terra`, today 2026-11-05, mode live
- Source run: `eval_1793919973395+eval_1793919975441_combined` (SHA-256 `8c767bd40d120d4281c4e721f2749290f6d0f73a0c063b342aa58e0a088783a5`)
- Reports checked: 22; outcomes {"none":9,"added":13}; reasons {"none":9,"added":13}
- Critical Misses per report: {"1":9,"2":2,"3":11}; more than three: 0
- Latency (call plus validation), ms: mean 5090, p50 5929, p90 8436, max 10722; the call alone: mean 5034, p90 8368
- Cost: $0.07237125 in 22 calls (token-calculated)

| Fixture | Status | Outcome | Critical Misses | Added | Latency ms | Added or promoted |
| --- | --- | --- | --- | --- | --- | --- |
| synth_data_scientist_senior_elite_1 | PASS | none (none) | 1 |  | 1524 |  |
| synth_marketing_manager_vp_elite_1 | PASS | none (none) | 1 |  | 1552 |  |
| synth_software_engineer_mid_strong_1 | PASS | none (none) | 1 |  | 2023 |  |
| synth_ux_designer_director_strong_1 | PASS | none (none) | 1 |  | 1487 |  |
| synth_sales_executive_mid_foundation_1 | PASS | added (added) | 3 | no_recent_work, no_evidence_latest_role | 7376 | In the BrightWave account and proposal bullet, name an account task you helped with and what you prepared for a proposal or presentation. / In the BrightWave lead generation bullet, add the number of leads you personally worked or a measurable result, if you can verify it. |
| synth_hr_manager_director_foundation_1 | PASS | added (added) | 3 | no_recent_work, no_evidence_latest_role | 10382 | In the BrightWave employee relations bullet, describe a performance management or conflict resolution activity and what you contributed, without identifying employees. / In the BrightWave recruitment bullet, add the number of hires you personally managed or a measurable recruiting result, if you can verify it. |
| synth_finance_analyst_senior_weak_1 | PASS | added (added) | 3 | no_recent_work, no_evidence_latest_role | 7309 | In the Linton reporting bullet, name the types of reports or statements you prepared and who used them. / In the Linton budget and forecasting bullet, add the size of the budget you analyzed, if you can verify it. |
| synth_operations_manager_entry_weak_1 | PASS | added (added) | 3 | no_recent_work, no_evidence_latest_role | 7503 | In the Greenfield records and reports bullet, name the records you maintained and who used the reports. / In the Greenfield Operations Assistant role, add the volume of operational work you personally handled or a measurable result, if you can verify it. |
| synth_project_manager_vp_strong_1 | PASS | none (none) | 1 |  | 1281 |  |
| synth_product_manager_entry_elite_1 | PASS | added (added) | 2 | no_recent_work | 4292 | In the BrightLeaf customer-interview bullet, add one finding and explain how it informed backlog or roadmap prioritization. |
| synth_cc_operations_manager_bad_1 | PASS | added (added) | 2 | no_recent_work, title_level_mismatch | 5976 | In the day-shift supervision bullet, add the number of associates you supervised and the parts of the floor you were responsible for, if you can verify them. |
| synth_cc_career_changer_bad_1 | PASS | added (added) | 3 | no_target_role promoted Fix 2 | 8436 | Add a one-line headline above Experience naming the role you want, such as Web Developer, Shift Supervisor, or Medical Billing Assistant, if it reflects your target. / Add the actual start and end dates, or start date and present status, to the Freelance Web Developer entry. |
| synth_cc_sales_rep_bad_1 | PASS | added (added) | 3 | no_recent_work promoted Fix 2 | 5929 | Add one dated line covering February 2025 to today. / In the payroll and HR software sales bullet, add a verified sales result, such as quota attainment, if available. |
| synth_cc_marketing_director_bad_1 | PASS | added (added) | 3 | no_recent_work, title_level_mismatch | 10722 | In the Instagram bullet, explain how you selected or contributed to the content you posted, if applicable. / In the Lumen Candle Co. Director of Marketing role, clarify the title and add any marketing strategy or leadership responsibilities, if true. |
| synth_cc_admin_generalist_bad_1 | PASS | added (added) | 3 | no_recent_work, no_evidence_latest_role | 5885 | Add one dated line covering March 2025 to today, describing the period truthfully. / In the Riverbend Dental Group scheduling bullet, add how many patient appointments you handled or a measurable result, if you can verify it. |
| synth_cc_staff_accountant_bad_1 | PASS | added (added) | 3 | no_recent_work, no_evidence_latest_role | 6648 | In the Staff Accountant close bullet, name the close tasks you personally helped complete and any deliverable you prepared. / In the Front Range Builders Staff Accountant role, add the volume of entries or accounts you personally handled, if you can verify it. |
| synth_cc_recent_grad_bad_1 | PASS | added (added) | 3 | no_recent_work, no_evidence_latest_role | 5869 | Add one dated line covering May 2024 to today. / In the Badger State Credit Union role, add the number of social media posts you handled or a measurable result, if you can verify it. |
| synth_cc_project_coordinator_bad_1 | PASS | added (added) | 3 | no_recent_work, no_evidence_latest_role | 6509 | Add one dated line covering February 2025 to today. / In the Harborview Health IT Project Coordinator role, add the number of projects you personally tracked or a measurable result, if you can verify it. |
| synth_cc_product_manager_strong_1 | PASS | none (none) | 1 |  | 1266 |  |
| synth_cc_physical_therapist_strong_1 | PASS | none (none) | 1 |  | 7285 |  |
| synth_cc_fpa_analyst_strong_1 | PASS | none (none) | 1 |  | 1233 |  |
| synth_cc_construction_pm_strong_1 | PASS | none (none) | 1 |  | 1502 |  |
