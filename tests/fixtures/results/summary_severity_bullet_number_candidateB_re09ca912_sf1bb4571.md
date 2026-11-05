# PromptOps Live Eval Report

**Run ID:** eval_1793920197789+eval_1793920473266_combined_severity_2026-11-05T23-22-52-631Z
**Timestamp:** 2026-11-05T23:22:52.633Z
**Tier:** bulk+golden
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
| Total Fixtures | 44 |
| ✅ Passed | 43 |
| ⚠️ Warned | 0 |
| ❌ Failed | 1 |
| Pass Rate | 97.7% |

## Cost

| Metric | Value |
|:-------|:------|
| API Calls | 43 |
| Token-calculated API Cost | $0.134269 |
| Input Tokens | 415,936 |
| Cached Input Tokens | 347,662 |
| Output Tokens | 116,126 |
| Reasoning Tokens | 22,494 |
| Budget | $4.00 |

## ❌ Blocking Failures

These must be fixed before shipping.

### synth_cc_physical_therapist_strong_1

**Status:** FAIL
**Score:** 84 (expected: 75–95)

**Errors (ship blockers):**
- `E_SCHEMA`: Production validation failed after repair: The model response failed the evidence grounding contract at summary unsupported narrative facts: giving, beyond, treatment.

## Report Integrity

What a customer reads, measured on each validated report. These checks are reported, not gated; the status counts above are unchanged. **Model** is the report as generated. **Shown** is the report after the deterministic post-generation pass that the web report and PDF both apply.

| Check | Model | Shown |
|:------|:------|:------|
| Reports with a rewrite | 0 of 43 (0 rewrites) | same |
| Keep/fix collisions on one line | 7 in 7 reports | 0 |
| Critical Miss line also in Keep | 5 reports | 0 reports |
| Repeated observations | 257 | 2 |
| Field-slot mapping issues | 0 | 0 |
| Critical Miss is a line edit / structural | 19 / 24 (employment gap 14, positioning 10) | same |
| Nothing critical (Critical Miss marked low impact) | 0 reports | same |
| Model's first fix dropped by validation | 3 reports | same |
| Reports with 1 / 2 / 3 Critical Misses | 17 / 4 / 22 | same |
| Reports saying more than three exist | 0 | same |
| Critical Misses by kind | concrete fact 42, other 12, dates 24, direction 13 (of 91) | same |
| Structural issue flagged, Critical Miss is a line edit | 2 reports | same |
| Verdict and Critical Miss disagree | 15 reports | same |
| Verdict raises no concern | 12 reports | same |
| Fix headings over 12 words | 98 of 121 (longest 32 words) | same |
| Fix headings that open with a location / carry a condition | 86 / 25 | same |

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
| synth_sales_executive_mid_foundation_1 | 60 | 0 | 0 → 0 | 6 → 0 | 0 → 0 | structural (employment gap) | no concern |
| synth_sales_executive_mid_foundation_1 | 60 | 0 | 0 → 0 | 4 → 0 | 0 → 0 | structural (employment gap); flagged: employment gap | no concern |
| synth_hr_manager_director_foundation_1 | 61 | 0 | 0 → 0 | 3 → 0 | 0 → 0 | structural (employment gap) | mismatch |
| synth_hr_manager_director_foundation_1 | 61 | 0 | 1 → 0 (Critical Miss in Keep) | 4 → 0 | 0 → 0 | structural (employment gap); flagged: employment gap | mismatch |
| synth_finance_analyst_senior_weak_1 | 61 | 0 | 0 → 0 | 6 → 0 | 0 → 0 | structural (employment gap); flagged: employment gap | no concern |
| synth_finance_analyst_senior_weak_1 | 58 | 0 | 0 → 0 | 5 → 0 | 0 → 0 | structural (employment gap) | agree |
| synth_operations_manager_entry_weak_1 | 61 | 0 | 1 → 0 (Critical Miss in Keep) | 3 → 0 | 0 → 0 | structural (employment gap); flagged: employment gap | mismatch |
| synth_operations_manager_entry_weak_1 | 60 | 0 | 0 → 0 | 4 → 0 | 0 → 0 | structural (employment gap) | no concern |
| synth_project_manager_vp_strong_1 | 83 | 0 | 0 → 0 | 5 → 0 | 0 → 0 | line edit | mismatch |
| synth_project_manager_vp_strong_1 | 84 | 0 | 0 → 0 | 4 → 0 | 0 → 0 | line edit | agree |
| synth_product_manager_entry_elite_1 | 88 | 0 | 0 → 0 | 6 → 0 | 0 → 0 | structural (employment gap); flagged: employment gap | mismatch |
| synth_product_manager_entry_elite_1 | 87 | 0 | 0 → 0 | 6 → 0 | 0 → 0 | structural (employment gap); flagged: employment gap | agree |
| synth_cc_operations_manager_bad_1 | 67 | 0 | 0 → 0 | 8 → 0 | 0 → 0 | structural (positioning); flagged: employment gap, positioning | agree |
| synth_cc_operations_manager_bad_1 | 67 | 0 | 0 → 0 | 6 → 0 | 0 → 0 | structural (positioning); flagged: employment gap | agree |
| synth_cc_career_changer_bad_1 | 62 | 0 | 0 → 0 | 6 → 0 | 0 → 0 | line edit; flagged: target role (outranked) | mismatch |
| synth_cc_career_changer_bad_1 | 65 | 0 | 0 → 0 | 6 → 0 | 0 → 0 | line edit | mismatch |
| synth_cc_sales_rep_bad_1 | 64 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | structural (employment gap) | mismatch |
| synth_cc_sales_rep_bad_1 | 65 | 0 | 0 → 0 | 8 → 0 | 0 → 0 | structural (positioning) | no concern |
| synth_cc_marketing_director_bad_1 | 80 | 0 | 1 → 0 (Critical Miss in Keep) | 5 → 0 | 0 → 0 | structural (employment gap); flagged: employment gap | mismatch |
| synth_cc_marketing_director_bad_1 | 80 | 0 | 1 → 0 (Critical Miss in Keep) | 6 → 0 | 0 → 0 | structural (employment gap); flagged: employment gap | mismatch |
| synth_cc_admin_generalist_bad_1 | 66 | 0 | 0 → 0 | 6 → 0 | 0 → 0 | structural (positioning) | agree |
| synth_cc_admin_generalist_bad_1 | 65 | 0 | 0 → 0 | 6 → 1 | 0 → 0 | structural (positioning); flagged: employment gap, positioning | agree |
| synth_cc_staff_accountant_bad_1 | 64 | 0 | 0 → 0 | 2 → 0 | 0 → 0 | structural (positioning); flagged: employment gap, positioning | agree |
| synth_cc_staff_accountant_bad_1 | 66 | 0 | 0 → 0 | 5 → 0 | 0 → 0 | structural (positioning); flagged: employment gap | agree |
| synth_cc_recent_grad_bad_1 | 66 | 0 | 0 → 0 | 6 → 0 | 0 → 0 | structural (positioning); flagged: employment gap | no concern |
| synth_cc_recent_grad_bad_1 | 66 | 0 | 0 → 0 | 6 → 0 | 0 → 0 | structural (positioning); flagged: employment gap | mismatch |
| synth_cc_project_coordinator_bad_1 | 66 | 0 | 1 → 0 (Critical Miss in Keep) | 6 → 0 | 0 → 0 | structural (employment gap) | agree |
| synth_cc_project_coordinator_bad_1 | 65 | 0 | 0 → 0 | 5 → 1 | 0 → 0 | structural (positioning); flagged: employment gap | agree |
| synth_cc_product_manager_strong_1 | 87 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | line edit | no concern |
| synth_cc_product_manager_strong_1 | 87 | 0 | 0 → 0 | 8 → 0 | 0 → 0 | line edit | mismatch |
| synth_cc_physical_therapist_strong_1 | 84 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | line edit | mismatch |
| synth_cc_fpa_analyst_strong_1 | 86 | 0 | 1 → 0 | 5 → 0 | 0 → 0 | line edit | no concern |
| synth_cc_fpa_analyst_strong_1 | 87 | 0 | 1 → 0 | 8 → 0 | 0 → 0 | line edit | agree |
| synth_cc_construction_pm_strong_1 | 84 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | line edit | no concern |
| synth_cc_construction_pm_strong_1 | 85 | 0 | 0 → 0 | 5 → 0 | 0 → 0 | line edit | no concern |

<details>
<summary>Integrity details</summary>

- **synth_data_scientist_senior_elite_1**: The takeaway ("Define the model errors") points at fix 3, not the Critical Miss. The biggest-gap example quotes fix 3's line. The Verdict says to keep part of the line fix 1 changes.
- **synth_marketing_manager_vp_elite_1**: The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_software_engineer_mid_strong_1**: The Verdict's concern is fix 2's line, not the Critical Miss.
- **synth_ux_designer_director_strong_1**: The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_sales_executive_mid_foundation_1**: The biggest-gap example quotes fix 3's line. The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_sales_executive_mid_foundation_1**: The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_hr_manager_director_foundation_1**: The takeaway ("Specify your recruiting contribution") points at fix 2, not the Critical Miss. The biggest-gap example quotes fix 2's line.
- **synth_hr_manager_director_foundation_1**: The takeaway ("Explain your employee relations work") points at fix 3, not the Critical Miss.
- **synth_finance_analyst_senior_weak_1**: The Verdict says to keep part of the line fix 2 changes. The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_operations_manager_entry_weak_1**: The takeaway ("Name the departments involved") points at fix 2, not the Critical Miss. The biggest-gap example quotes fix 2's line.
- **synth_operations_manager_entry_weak_1**: The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_project_manager_vp_strong_1**: The takeaway ("Explain your mentoring work") points at fix 2, not the Critical Miss. The biggest-gap example quotes fix 2's line.
- **synth_product_manager_entry_elite_1**: The takeaway ("Name the leadership finding") points at fix 2, not the Critical Miss. The biggest-gap example quotes fix 2's line.
- **synth_cc_operations_manager_bad_1**: The biggest-gap example quotes fix 3's line.
- **synth_cc_operations_manager_bad_1**: The biggest-gap example quotes fix 3's line.
- **synth_cc_career_changer_bad_1**: The Verdict's concern is target role, but the Critical Miss is a single-line edit.
- **synth_cc_career_changer_bad_1**: The Verdict's concern is fix 3's line, not the Critical Miss.
- **synth_cc_sales_rep_bad_1**: The takeaway ("Explain your sales leadership") points at fix 3, not the Critical Miss. The biggest-gap example quotes fix 2's line.
- **synth_cc_sales_rep_bad_1**: The biggest-gap example quotes fix 3's line. The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_cc_marketing_director_bad_1**: The takeaway ("Explain your marketing remit") points at fix 3, not the Critical Miss.
- **synth_cc_marketing_director_bad_1**: The takeaway ("Clarify your marketing responsibilities") points at fix 3, not the Critical Miss.
- **synth_cc_admin_generalist_bad_1**: Shown repeat: structural_gaps[0] repeats top_fixes[1]
- **synth_cc_recent_grad_bad_1**: The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_cc_recent_grad_bad_1**: The Verdict's concern is fix 3's line, not the Critical Miss. The takeaway ("Explain your newsletter contribution") points at fix 3, not the Critical Miss. The biggest-gap example quotes fix 3's line.
- **synth_cc_project_coordinator_bad_1**: The biggest-gap example quotes fix 2's line.
- **synth_cc_project_coordinator_bad_1**: Shown repeat: structural_gaps[0] repeats top_fixes[1]
- **synth_cc_product_manager_strong_1**: The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_cc_product_manager_strong_1**: The takeaway ("Explain a dashboard decision") points at fix 2, not the Critical Miss. The biggest-gap example quotes fix 2's line.
- **synth_cc_physical_therapist_strong_1**: The takeaway ("Explain your mentoring work") points at fix 3, not the Critical Miss. The biggest-gap example quotes fix 3's line. The Verdict says to keep part of the line fix 1 changes.
- **synth_cc_fpa_analyst_strong_1**: The biggest-gap example quotes fix 2's line. The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_cc_construction_pm_strong_1**: The biggest-gap example quotes fix 3's line. The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_cc_construction_pm_strong_1**: The biggest-gap example quotes fix 3's line. The Verdict says to keep part of the line fix 1 changes. The Verdict raises no concern, yet the report still names a Critical Miss.
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
| synth_cc_operations_manager_bad_1 | 67, 67 | 0 | 67 | 0 |
| synth_cc_career_changer_bad_1 | 62, 65 | 3 | 63.5 | 2.1 |
| synth_cc_sales_rep_bad_1 | 64, 65 | 1 | 64.5 | 0.7 |
| synth_cc_marketing_director_bad_1 | 80, 80 | 0 | 80 | 0 |
| synth_cc_admin_generalist_bad_1 | 66, 65 | 1 | 65.5 | 0.7 |
| synth_cc_staff_accountant_bad_1 | 64, 66 | 2 | 65 | 1.4 |
| synth_cc_recent_grad_bad_1 | 66, 66 | 0 | 66 | 0 |
| synth_cc_project_coordinator_bad_1 | 66, 65 | 1 | 65.5 | 0.7 |
| synth_cc_product_manager_strong_1 | 87, 87 | 0 | 87 | 0 |
| synth_cc_physical_therapist_strong_1 | 84, 84 (1 from reports that failed validation) | 0 | 84 | 0 |
| synth_cc_fpa_analyst_strong_1 | 86, 87 | 1 | 86.5 | 0.7 |
| synth_cc_construction_pm_strong_1 | 84, 85 | 1 | 84.5 | 0.7 |

## ✅ Passed

43 fixtures passed all checks.

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
- synth_finance_analyst_senior_weak_1 (score: 61)
- synth_finance_analyst_senior_weak_1 (score: 58)
- synth_operations_manager_entry_weak_1 (score: 61)
- synth_operations_manager_entry_weak_1 (score: 60)
- synth_project_manager_vp_strong_1 (score: 83)
- synth_project_manager_vp_strong_1 (score: 84)
- synth_product_manager_entry_elite_1 (score: 88)
- synth_product_manager_entry_elite_1 (score: 87)
- synth_cc_operations_manager_bad_1 (score: 67)
- synth_cc_operations_manager_bad_1 (score: 67)
- synth_cc_career_changer_bad_1 (score: 62)
- synth_cc_career_changer_bad_1 (score: 65)
- synth_cc_sales_rep_bad_1 (score: 64)
- synth_cc_sales_rep_bad_1 (score: 65)
- synth_cc_marketing_director_bad_1 (score: 80)
- synth_cc_marketing_director_bad_1 (score: 80)
- synth_cc_admin_generalist_bad_1 (score: 66)
- synth_cc_admin_generalist_bad_1 (score: 65)
- synth_cc_staff_accountant_bad_1 (score: 64)
- synth_cc_staff_accountant_bad_1 (score: 66)
- synth_cc_recent_grad_bad_1 (score: 66)
- synth_cc_recent_grad_bad_1 (score: 66)
- synth_cc_project_coordinator_bad_1 (score: 66)
- synth_cc_project_coordinator_bad_1 (score: 65)
- synth_cc_product_manager_strong_1 (score: 87)
- synth_cc_product_manager_strong_1 (score: 87)
- synth_cc_physical_therapist_strong_1 (score: 84)
- synth_cc_fpa_analyst_strong_1 (score: 86)
- synth_cc_fpa_analyst_strong_1 (score: 87)
- synth_cc_construction_pm_strong_1 (score: 84)
- synth_cc_construction_pm_strong_1 (score: 85)
</details>


## Severity check

- Prompt: `severity_check_v1:f1bb4571` (SHA-256 `f1bb4571f3f4cfbf8ed82e78193d543448789f076fec95cb6e79a19f1bc19c90`), model `gpt-6.1-terra`, today 2026-11-05, mode live
- Source run: `eval_1793920197789+eval_1793920473266_combined` (SHA-256 `dc4707dbe5e5b0e3c7268577fa5e240d47dcd1ae38a8cb4c39391ed4f2f16c11`)
- Reports checked: 43; outcomes {"none":17,"added":26}; reasons {"none":17,"added":26}
- Critical Misses per report: {"1":17,"2":4,"3":22}; more than three: 0
- Latency (call plus validation), ms: mean 4995, p50 4811, p90 10133, max 12740; the call alone: mean 4940, p90 10094
- Cost: $0.13426850 in 43 calls (token-calculated)

| Fixture | Status | Outcome | Critical Misses | Added | Latency ms | Added or promoted |
| --- | --- | --- | --- | --- | --- | --- |
| synth_data_scientist_senior_elite_1 | PASS | none (none) | 1 |  | 1695 |  |
| synth_data_scientist_senior_elite_1 | PASS | none (none) | 1 |  | 3247 |  |
| synth_marketing_manager_vp_elite_1 | PASS | none (none) | 1 |  | 1723 |  |
| synth_marketing_manager_vp_elite_1 | PASS | none (none) | 1 |  | 1387 |  |
| synth_software_engineer_mid_strong_1 | PASS | none (none) | 1 |  | 1817 |  |
| synth_software_engineer_mid_strong_1 | PASS | none (none) | 1 |  | 1645 |  |
| synth_ux_designer_director_strong_1 | PASS | none (none) | 1 |  | 1338 |  |
| synth_ux_designer_director_strong_1 | PASS | none (none) | 1 |  | 1173 |  |
| synth_sales_executive_mid_foundation_1 | PASS | added (added) | 3 | no_recent_work promoted Fix 3 | 10707 | In the BrightWave account and proposal bullet, name the account tasks you handled and a proposal or presentation contribution you can describe. / In the BrightWave customer engagement bullet, name one project, your contribution, and any result you can verify. |
| synth_sales_executive_mid_foundation_1 | PASS | added (added) | 3 | no_recent_work, no_evidence_latest_role | 9713 | In the BrightWave client-account bullet, name the account tasks you handled and one part of a proposal you helped prepare. / In the BrightWave Sales Executive role, add the number of leads you worked with or a measurable sales result, if you can verify it. |
| synth_hr_manager_director_foundation_1 | PASS | added (added) | 3 | no_recent_work, no_evidence_latest_role | 9027 | In the BrightWave recruiting bullet, specify which recruiting or onboarding activities you helped oversee and for which teams. / In the BrightWave HR strategy bullet, add how many employees or departments you personally supported, if you can verify it. |
| synth_hr_manager_director_foundation_1 | PASS | added (added) | 3 | no_recent_work, no_evidence_latest_role | 12740 | In the BrightWave recruitment bullet, name the hiring or onboarding steps you personally handled and the teams involved. / In the BrightWave role, add the number of employees or teams you personally supported, or a measurable result you achieved, if you can verify it. |
| synth_finance_analyst_senior_weak_1 | PASS | added (added) | 2 | no_recent_work, no_evidence_latest_role | 11487 | In the senior financial reporting bullet, name the reports or statements you prepared and who used them. |
| synth_finance_analyst_senior_weak_1 | PASS | added (added) | 2 | no_recent_work, no_evidence_latest_role | 6854 | In the Linton reporting bullet, name the reports or statements you prepared and who received them. |
| synth_operations_manager_entry_weak_1 | PASS | added (added) | 3 | no_recent_work, no_evidence_latest_role | 5211 | In the Greenfield coordination bullet, name the departments and describe what you helped coordinate between them. / In the Greenfield Logistics role, add how many records or reports you maintained, if you can verify it. |
| synth_operations_manager_entry_weak_1 | PASS | added (added) | 3 | no_recent_work, no_evidence_latest_role | 8095 | In the Greenfield records and reports bullet, name the types of records you maintained and who used the reports. / In the Greenfield daily operational tasks bullet, add the volume of tasks you personally handled, if you can verify it. |
| synth_project_manager_vp_strong_1 | PASS | none (none) | 1 |  | 1661 |  |
| synth_project_manager_vp_strong_1 | PASS | none (none) | 1 |  | 1196 |  |
| synth_product_manager_entry_elite_1 | PASS | added (added) | 2 | no_recent_work | 4800 | In the NovaSense leadership presentation bullet, identify the finding you presented that influenced the personalization expansion. |
| synth_product_manager_entry_elite_1 | PASS | added (added) | 2 | no_recent_work | 4811 | In the BrightLeaf customer interview bullet, add one finding and the backlog or roadmap priority it informed. |
| synth_cc_operations_manager_bad_1 | PASS | added (added) | 3 | no_recent_work promoted Fix 2 | 4710 | Add one dated line covering January 2025 to today. / In the day-shift supervision bullet, add how many associates you supervised and what the shift was responsible for handling. |
| synth_cc_operations_manager_bad_1 | PASS | added (added) | 3 | no_recent_work promoted Fix 2 | 5416 | Add one dated line covering January 2025 to today. / In the day-shift supervision bullet, add the number of associates you supervised and an example of a decision you made on the floor. |
| synth_cc_career_changer_bad_1 | PASS | added (added) | 3 | no_target_role, missing_dates | 7430 | Add a one-line headline above Experience naming the role you want. / Add the start and end dates for the Freelance Web Developer role, if you can verify them. |
| synth_cc_career_changer_bad_1 | PASS | added (added) | 3 | no_target_role promoted Fix 2 | 11913 | Add a one-line headline above Experience naming the role you want to pursue. / Add the actual dates of your freelance web development work beside the role title. |
| synth_cc_sales_rep_bad_1 | PASS | added (added) | 3 | no_recent_work promoted Fix 2 | 4559 | In the account executive sales bullet, add a verified sales result, such as closed business or attainment, if available. / Replace the Sales Director opening with positioning grounded in your listed roles, or add the leadership work that supports it if applicable. |
| synth_cc_sales_rep_bad_1 | PASS | added (added) | 3 | no_recent_work promoted Fix 2 | 3668 | Add one dated line covering February 2025 to today. / In the payroll and HR software sales bullet, add a verified sales result, such as quota attainment, if available. |
| synth_cc_marketing_director_bad_1 | PASS | added (added) | 3 | no_recent_work, title_level_mismatch | 8374 | In the Instagram bullet, describe the kinds of posts you published and add a result from that work if you can verify one. / In the Lumen Candle Co. Director of Marketing role, clarify the role's scope and add any marketing strategy or team leadership responsibilities if true. |
| synth_cc_marketing_director_bad_1 | PASS | added (added) | 3 | no_recent_work, title_level_mismatch | 10133 | In the Instagram bullet, describe what the posts covered and any response to them that you can verify. / In the Lumen Candle Co. Director of Marketing role, add any leadership or strategy responsibilities you held alongside the posting and product writing, if you can verify them. |
| synth_cc_admin_generalist_bad_1 | PASS | added (added) | 3 | no_recent_work, no_evidence_latest_role | 5597 | Add one dated line covering March 2025 to today. / In the Riverbend appointment bullet, add how many patient appointments you scheduled over a typical period, if you can verify it. |
| synth_cc_admin_generalist_bad_1 | PASS | added (added) | 3 | no_recent_work, no_evidence_latest_role | 5764 | Add one dated line covering March 2025 to today, noting relevant activity if true. / In the Riverbend appointment bullet, add how many appointments you personally scheduled or a measurable scheduling result, if you can verify it. |
| synth_cc_staff_accountant_bad_1 | PASS | added (added) | 3 | no_recent_work, no_evidence_latest_role | 6729 | Add one dated line covering March 2025 to today, identifying your activity during that period if true. / In the Front Range Builders role, add the number of accounts you personally reconciled or a measurable result, if you can verify it. |
| synth_cc_staff_accountant_bad_1 | PASS | added (added) | 3 | no_recent_work, no_evidence_latest_role | 5278 | Add one dated line covering March 2025 to today. / In the Front Range Builders staff accountant role, add how many accounts you personally reconciled, if you can verify it. |
| synth_cc_recent_grad_bad_1 | PASS | added (added) | 3 | no_recent_work, no_evidence_latest_role | 5965 | Add one dated line covering May 2024 to today. / In the Badger State Credit Union marketing internship, add the newsletter's audience size or a measurable campaign result you contributed to, if you can verify it. |
| synth_cc_recent_grad_bad_1 | PASS | added (added) | 3 | no_recent_work, no_evidence_latest_role | 5670 | Add one dated line covering May 2024 to today. / In the Badger State Credit Union marketing internship, add the newsletter audience size or a measurable result from your work, if you can verify it. |
| synth_cc_project_coordinator_bad_1 | PASS | added (added) | 3 | no_recent_work, no_evidence_latest_role | 7101 | In the Smartsheet plan bullet, name the project and describe the kinds of changes you made to its plan. / In the Harborview Health IT Project Coordinator role, add the number of projects you tracked or stakeholders you supported, if you can verify it. |
| synth_cc_project_coordinator_bad_1 | PASS | added (added) | 3 | no_recent_work, no_evidence_latest_role | 7080 | Add one dated line covering February 2025 to today. / In the Harborview Health IT role, add the number of projects or stakeholders you coordinated, or a measurable result, if you can verify it. |
| synth_cc_product_manager_strong_1 | PASS | none (none) | 1 |  | 1247 |  |
| synth_cc_product_manager_strong_1 | PASS | none (none) | 1 |  | 1172 |  |
| synth_cc_physical_therapist_strong_1 | FAIL | skipped (no shown report in the source run) |  |  |  |  |
| synth_cc_physical_therapist_strong_1 | PASS | none (none) | 1 |  | 1320 |  |
| synth_cc_fpa_analyst_strong_1 | PASS | none (none) | 1 |  | 1295 |  |
| synth_cc_fpa_analyst_strong_1 | PASS | none (none) | 1 |  | 1225 |  |
| synth_cc_construction_pm_strong_1 | PASS | none (none) | 1 |  | 1536 |  |
| synth_cc_construction_pm_strong_1 | PASS | none (none) | 1 |  | 1292 |  |
