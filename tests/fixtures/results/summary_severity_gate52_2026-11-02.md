# PromptOps Live Eval Report

**Run ID:** eval_1793576471840+eval_1793576649134+eval_1793585522068_combined_with_retries_replay_severity_2026-11-02T17-00-37-745Z
**Timestamp:** 2026-11-02T17:00:37.747Z
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
**Validation Timestamp:** 2026-11-02T05:33:24.110Z
**Source run SHA-256:** 901cd3492321a5dc57710e299ca05e21f5e12e6d011484c2a2bd5bff8adb4d75

## Summary

| Metric | Value |
|:-------|:------|
| Total Fixtures | 52 |
| ✅ Passed | 49 |
| ⚠️ Warned | 3 |
| ❌ Failed | 0 |
| Pass Rate | 94.2% |

## Cost

| Metric | Value |
|:-------|:------|
| API Calls | 52 |
| Token-calculated API Cost | $0.110402 |
| Input Tokens | 104,193 |
| Cached Input Tokens | 68,030 |
| Output Tokens | 26,509 |
| Reasoning Tokens | 4,831 |
| Budget | $1.00 |

## ⚠️ Warnings (Review Recommended)

### synth_bp_retail_store_manager_1

**Status:** WARN
**Score:** 87 (expected: 78–92)

**Warnings:**
- `W_SPECIFICITY_LOW`: Fix 1 lacks a specific detail, quoted correction, or concrete target

### synth_bp_event_planner_relocation_1

**Status:** WARN
**Score:** 80 (expected: 66–84)

**Warnings:**
- `W_MECHANICAL_COPY`: ideas.questions.3.question repeats the clause "did you change"

### synth_cc_operations_manager_bad_1

**Status:** WARN
**Score:** 67 (expected: 45–85)

**Warnings:**
- `W_MECHANICAL_COPY`: ideas.questions.2.question repeats the clause "what did you"

## Report Integrity

What a customer reads, measured on each validated report. These checks are reported, not gated; the status counts above are unchanged. **Model** is the report as generated. **Shown** is the report after the deterministic post-generation pass that the web report and PDF both apply.

| Check | Model | Shown |
|:------|:------|:------|
| Reports with a rewrite | 0 of 52 (0 rewrites) | same |
| Keep/fix collisions on one line | 25 in 22 reports | 0 |
| Critical Miss line also in Keep | 9 reports | 0 reports |
| Repeated observations | 333 | 0 |
| Field-slot mapping issues | 0 | 0 |
| Critical Miss is a line edit / structural | 46 / 6 (positioning 6) | same |
| Nothing critical (Critical Miss marked low impact) | 0 reports | same |
| Model's first fix dropped by validation | 0 reports | same |
| Reports with 1 / 2 / 3 Critical Misses | 29 / 13 / 10 | same |
| Reports saying more than three exist | 0 | same |
| Critical Misses by kind | concrete fact 35, other 25, dates 18, direction 7 (of 85) | same |
| Structural issue flagged, Critical Miss is a line edit | 10 reports | same |
| Verdict and Critical Miss disagree | 12 reports | same |
| Verdict raises no concern | 20 reports | same |
| Fix headings over 12 words | 138 of 149 (longest 30 words) | same |
| Fix headings that open with a location / carry a condition | 121 / 27 | same |

| Fixture | Score | Rewrites | Keep/fix | Repeats | Slot issues | Critical Miss | Verdict and Critical Miss |
|:--------|:------|:---------|:---------|:--------|:------------|:--------------|:--------------------------|
| synth_data_scientist_senior_elite_1 | 92 | 0 | 1 → 0 | 6 → 0 | 0 → 0 | line edit | mismatch |
| synth_marketing_manager_vp_elite_1 | 89 | 0 | 0 → 0 | 8 → 0 | 0 → 0 | line edit | no concern |
| synth_software_engineer_mid_strong_1 | 83 | 0 | 0 → 0 | 9 → 0 | 0 → 0 | line edit; flagged: positioning, employment gap (outranked) | mismatch |
| synth_ux_designer_director_strong_1 | 84 | 0 | 1 → 0 | 2 → 0 | 0 → 0 | line edit | no concern |
| synth_sales_executive_mid_foundation_1 | 60 | 0 | 0 → 0 | 8 → 0 | 0 → 0 | line edit; flagged: employment gap (outranked) | agree |
| synth_hr_manager_director_foundation_1 | 58 | 0 | 0 → 0 | 4 → 0 | 0 → 0 | line edit; flagged: employment gap (outranked) | agree |
| synth_finance_analyst_senior_weak_1 | 60 | 0 | 1 → 0 (Critical Miss in Keep) | 5 → 0 | 0 → 0 | line edit; flagged: employment gap (outranked) | agree |
| synth_operations_manager_entry_weak_1 | 58 | 0 | 0 → 0 | 5 → 0 | 0 → 0 | line edit; flagged: employment gap (outranked) | no concern |
| synth_project_manager_vp_strong_1 | 84 | 0 | 0 → 0 | 5 → 0 | 0 → 0 | line edit | agree |
| synth_product_manager_entry_elite_1 | 86 | 0 | 0 → 0 | 6 → 0 | 0 → 0 | structural (positioning); flagged: employment gap | no concern |
| synth_bp_customer_success_manager_1 | 80 | 0 | 1 → 0 | 7 → 0 | 0 → 0 | line edit | agree |
| synth_bp_icu_nurse_1 | 80 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | line edit | no concern |
| synth_bp_teacher_to_instructional_designer_1 | 66 | 0 | 0 → 0 | 6 → 0 | 0 → 0 | line edit | mismatch |
| synth_bp_staff_accountant_1 | 58 | 0 | 0 → 0 | 6 → 0 | 0 → 0 | line edit | agree |
| synth_bp_warehouse_supervisor_1 | 67 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | line edit | no concern |
| synth_bp_technical_recruiter_1 | 81 | 0 | 0 → 0 | 8 → 0 | 0 → 0 | line edit | agree |
| synth_bp_data_analyst_1 | 65 | 0 | 1 → 0 (Critical Miss in Keep) | 5 → 0 | 0 → 0 | line edit | no concern |
| synth_bp_mechanical_engineer_1 | 80 | 0 | 1 → 0 (Critical Miss in Keep) | 8 → 0 | 0 → 0 | line edit | agree |
| synth_bp_marketing_coordinator_gap_1 | 67 | 0 | 1 → 0 | 5 → 0 | 0 → 0 | line edit; flagged: employment gap (outranked) | mismatch |
| synth_bp_paralegal_1 | 80 | 0 | 1 → 0 | 8 → 0 | 0 → 0 | line edit | no concern |
| synth_bp_executive_assistant_freelance_1 | 67 | 0 | 0 → 0 | 5 → 0 | 0 → 0 | line edit | no concern |
| synth_bp_retail_store_manager_1 | 87 | 0 | 0 → 0 | 9 → 0 | 0 → 0 | structural (positioning) | no concern |
| synth_bp_ux_researcher_gap_1 | 86 | 0 | 0 → 0 | 6 → 0 | 0 → 0 | line edit | mismatch |
| synth_bp_backend_engineer_senior_1 | 91 | 0 | 1 → 0 | 8 → 0 | 0 → 0 | line edit | no concern |
| synth_bp_account_executive_1 | 84 | 0 | 2 → 0 | 9 → 0 | 0 → 0 | line edit | no concern |
| synth_bp_hr_generalist_career_break_1 | 64 | 0 | 0 → 0 | 5 → 0 | 0 → 0 | line edit; flagged: employment gap (outranked) | agree |
| synth_bp_product_designer_unrelated_1 | 80 | 0 | 0 → 0 | 6 → 0 | 0 → 0 | line edit | no concern |
| synth_bp_supply_chain_analyst_1 | 85 | 0 | 0 → 0 | 6 → 0 | 0 → 0 | line edit | mismatch |
| synth_bp_nonprofit_program_manager_1 | 67 | 0 | 2 → 0 (Critical Miss in Keep) | 7 → 0 | 0 → 0 | line edit | mismatch |
| synth_bp_it_support_recent_grad_1 | 62 | 0 | 1 → 0 (Critical Miss in Keep) | 6 → 0 | 0 → 0 | line edit | agree |
| synth_bp_social_worker_1 | 64 | 0 | 0 → 0 | 5 → 0 | 0 → 0 | line edit | no concern |
| synth_bp_cybersecurity_analyst_1 | 84 | 0 | 1 → 0 | 7 → 0 | 0 → 0 | line edit | no concern |
| synth_bp_kitchen_manager_1 | 64 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | line edit | no concern |
| synth_bp_civil_engineer_1 | 67 | 0 | 1 → 0 (Critical Miss in Keep) | 7 → 0 | 0 → 0 | line edit | mismatch |
| synth_bp_bank_branch_manager_gap_1 | 68 | 0 | 0 → 0 | 6 → 0 | 0 → 0 | line edit; flagged: employment gap (outranked) | agree |
| synth_bp_content_writer_freelance_1 | 73 | 0 | 1 → 0 | 7 → 0 | 0 → 0 | line edit | no concern |
| synth_bp_dental_hygienist_1 | 64 | 0 | 0 → 0 | 8 → 0 | 0 → 0 | line edit | mismatch |
| synth_bp_event_planner_relocation_1 | 80 | 0 | 1 → 0 | 7 → 0 | 0 → 0 | line edit | agree |
| synth_bp_logistics_dispatcher_1 | 58 | 0 | 1 → 0 | 7 → 0 | 0 → 0 | line edit | agree |
| synth_bp_graphic_designer_unrelated_1 | 63 | 0 | 2 → 0 (Critical Miss in Keep) | 8 → 0 | 0 → 0 | line edit; flagged: employment gap (outranked) | no concern |
| synth_cc_operations_manager_bad_1 | 67 | 0 | 0 → 0 | 5 → 0 | 0 → 0 | line edit | no concern |
| synth_cc_career_changer_bad_1 | 64 | 0 | 1 → 0 (Critical Miss in Keep) | 3 → 0 | 0 → 0 | line edit; flagged: target role (outranked) | mismatch |
| synth_cc_sales_rep_bad_1 | 67 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | structural (positioning); flagged: positioning | agree |
| synth_cc_marketing_director_bad_1 | 80 | 0 | 0 → 0 | 3 → 0 | 0 → 0 | line edit | agree |
| synth_cc_admin_generalist_bad_1 | 65 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | structural (positioning) | agree |
| synth_cc_staff_accountant_bad_1 | 67 | 0 | 1 → 0 (Critical Miss in Keep) | 6 → 0 | 0 → 0 | structural (positioning); flagged: employment gap | agree |
| synth_cc_recent_grad_bad_1 | 64 | 0 | 0 → 0 | 5 → 0 | 0 → 0 | structural (positioning); flagged: employment gap | agree |
| synth_cc_project_coordinator_bad_1 | 64 | 0 | 0 → 0 | 6 → 0 | 0 → 0 | line edit | no concern |
| synth_cc_product_manager_strong_1 | 87 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | line edit | agree |
| synth_cc_physical_therapist_strong_1 | 85 | 0 | 0 → 0 | 9 → 0 | 0 → 0 | line edit | mismatch |
| synth_cc_fpa_analyst_strong_1 | 87 | 0 | 1 → 0 | 7 → 0 | 0 → 0 | line edit | mismatch |
| synth_cc_construction_pm_strong_1 | 85 | 0 | 1 → 0 | 7 → 0 | 0 → 0 | line edit | agree |

<details>
<summary>Integrity details</summary>

- **synth_data_scientist_senior_elite_1**: The takeaway ("Define the model errors") points at fix 2, not the Critical Miss. The biggest-gap example quotes fix 2's line.
- **synth_marketing_manager_vp_elite_1**: The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_software_engineer_mid_strong_1**: The Verdict's concern is positioning, but the Critical Miss is a single-line edit.
- **synth_ux_designer_director_strong_1**: The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_sales_executive_mid_foundation_1**: The biggest-gap example quotes fix 3's line.
- **synth_operations_manager_entry_weak_1**: The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_product_manager_entry_elite_1**: The biggest-gap example quotes fix 3's line. The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_bp_icu_nurse_1**: The biggest-gap example quotes fix 2's line. The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_bp_teacher_to_instructional_designer_1**: The takeaway ("Explain your department leadership") points at fix 2, not the Critical Miss. The biggest-gap example quotes fix 2's line. The Verdict says to keep part of the line fix 1 changes.
- **synth_bp_staff_accountant_1**: The biggest-gap example quotes fix 3's line.
- **synth_bp_warehouse_supervisor_1**: The biggest-gap example quotes fix 2's line. The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_bp_data_analyst_1**: The Verdict says to keep part of the line fix 2 changes. The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_bp_mechanical_engineer_1**: The biggest-gap example quotes fix 3's line.
- **synth_bp_marketing_coordinator_gap_1**: The takeaway ("Explain your campaign contributions") points at fix 3, not the Critical Miss. The Verdict says to keep part of the line fix 1 changes.
- **synth_bp_paralegal_1**: The biggest-gap example quotes fix 2's line. The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_bp_executive_assistant_freelance_1**: The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_bp_retail_store_manager_1**: The biggest-gap example quotes fix 2's line. The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_bp_ux_researcher_gap_1**: The takeaway ("Describe your mentoring approach") points at fix 3, not the Critical Miss. The biggest-gap example quotes fix 3's line. The Verdict says to keep part of the line fix 1 changes.
- **synth_bp_backend_engineer_senior_1**: The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_bp_account_executive_1**: The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_bp_product_designer_unrelated_1**: The Verdict says to keep part of the line fix 3 changes. The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_bp_supply_chain_analyst_1**: The takeaway ("Explain the buyer partnership") points at fix 2, not the Critical Miss. The biggest-gap example quotes fix 2's line.
- **synth_bp_nonprofit_program_manager_1**: The takeaway ("Explain the employer onboarding process") points at fix 2, not the Critical Miss. The biggest-gap example quotes fix 2's line.
- **synth_bp_social_worker_1**: The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_bp_cybersecurity_analyst_1**: The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_bp_kitchen_manager_1**: The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_bp_civil_engineer_1**: The takeaway ("Explain your coordination work") points at fix 2, not the Critical Miss. The biggest-gap example quotes fix 3's line.
- **synth_bp_content_writer_freelance_1**: The Verdict says to keep part of the line fix 1 changes. The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_bp_dental_hygienist_1**: The takeaway ("Explain your laser therapy contribution") points at fix 2, not the Critical Miss. The biggest-gap example quotes fix 2's line.
- **synth_bp_logistics_dispatcher_1**: The biggest-gap example quotes fix 2's line.
- **synth_bp_graphic_designer_unrelated_1**: The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_cc_operations_manager_bad_1**: The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_cc_career_changer_bad_1**: The Verdict's concern is fix 2's line, not the Critical Miss. The takeaway ("Date your freelance work") points at fix 2, not the Critical Miss.
- **synth_cc_sales_rep_bad_1**: The biggest-gap example quotes fix 3's line.
- **synth_cc_staff_accountant_bad_1**: The biggest-gap example quotes fix 3's line.
- **synth_cc_recent_grad_bad_1**: The biggest-gap example quotes fix 3's line.
- **synth_cc_project_coordinator_bad_1**: The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_cc_physical_therapist_strong_1**: The takeaway ("Describe your mentoring work") points at fix 2, not the Critical Miss. The biggest-gap example quotes fix 2's line.
- **synth_cc_fpa_analyst_strong_1**: The takeaway ("Describe your variance recommendations") points at fix 3, not the Critical Miss. The biggest-gap example quotes fix 3's line.
- **synth_cc_construction_pm_strong_1**: The biggest-gap example quotes fix 3's line.
</details>

## Score Test-Retest

Each fixture was generated once, so test-retest was not measured. Use `--repeat <n>`, or replay several saved runs of the same fixtures together.

## ✅ Passed

49 fixtures passed all checks.

<details>
<summary>Expand to see fixture IDs</summary>

- synth_data_scientist_senior_elite_1 (score: 92)
- synth_marketing_manager_vp_elite_1 (score: 89)
- synth_software_engineer_mid_strong_1 (score: 83)
- synth_ux_designer_director_strong_1 (score: 84)
- synth_sales_executive_mid_foundation_1 (score: 60)
- synth_hr_manager_director_foundation_1 (score: 58)
- synth_finance_analyst_senior_weak_1 (score: 60)
- synth_operations_manager_entry_weak_1 (score: 58)
- synth_project_manager_vp_strong_1 (score: 84)
- synth_product_manager_entry_elite_1 (score: 86)
- synth_bp_customer_success_manager_1 (score: 80)
- synth_bp_icu_nurse_1 (score: 80)
- synth_bp_teacher_to_instructional_designer_1 (score: 66)
- synth_bp_staff_accountant_1 (score: 58)
- synth_bp_warehouse_supervisor_1 (score: 67)
- synth_bp_technical_recruiter_1 (score: 81)
- synth_bp_data_analyst_1 (score: 65)
- synth_bp_mechanical_engineer_1 (score: 80)
- synth_bp_marketing_coordinator_gap_1 (score: 67)
- synth_bp_paralegal_1 (score: 80)
- synth_bp_executive_assistant_freelance_1 (score: 67)
- synth_bp_ux_researcher_gap_1 (score: 86)
- synth_bp_backend_engineer_senior_1 (score: 91)
- synth_bp_account_executive_1 (score: 84)
- synth_bp_hr_generalist_career_break_1 (score: 64)
- synth_bp_product_designer_unrelated_1 (score: 80)
- synth_bp_supply_chain_analyst_1 (score: 85)
- synth_bp_nonprofit_program_manager_1 (score: 67)
- synth_bp_it_support_recent_grad_1 (score: 62)
- synth_bp_social_worker_1 (score: 64)
- synth_bp_cybersecurity_analyst_1 (score: 84)
- synth_bp_kitchen_manager_1 (score: 64)
- synth_bp_civil_engineer_1 (score: 67)
- synth_bp_bank_branch_manager_gap_1 (score: 68)
- synth_bp_content_writer_freelance_1 (score: 73)
- synth_bp_dental_hygienist_1 (score: 64)
- synth_bp_logistics_dispatcher_1 (score: 58)
- synth_bp_graphic_designer_unrelated_1 (score: 63)
- synth_cc_career_changer_bad_1 (score: 64)
- synth_cc_sales_rep_bad_1 (score: 67)
- synth_cc_marketing_director_bad_1 (score: 80)
- synth_cc_admin_generalist_bad_1 (score: 65)
- synth_cc_staff_accountant_bad_1 (score: 67)
- synth_cc_recent_grad_bad_1 (score: 64)
- synth_cc_project_coordinator_bad_1 (score: 64)
- synth_cc_product_manager_strong_1 (score: 87)
- synth_cc_physical_therapist_strong_1 (score: 85)
- synth_cc_fpa_analyst_strong_1 (score: 87)
- synth_cc_construction_pm_strong_1 (score: 85)
</details>


## Severity check

- Prompt: `severity_check_v1:f1bb4571` (SHA-256 `f1bb4571f3f4cfbf8ed82e78193d543448789f076fec95cb6e79a19f1bc19c90`), model `gpt-6.1-terra`, today 2026-11-01, mode live
- Source run: `eval_1793576471840+eval_1793576649134+eval_1793585522068_combined_with_retries_replay` (SHA-256 `901cd3492321a5dc57710e299ca05e21f5e12e6d011484c2a2bd5bff8adb4d75`)
- Reports checked: 52; outcomes {"none":29,"added":23}; reasons {"none":29,"added":20,"promoted":3}
- Critical Misses per report: {"1":29,"2":13,"3":10}; more than three: 0
- Latency (call plus validation), ms: mean 7836, p50 4581, p90 15684, max 48330; the call alone: mean 5980, p90 12621
- Cost: $0.11040185 in 52 calls (token-calculated)

| Fixture | Status | Outcome | Critical Misses | Added | Latency ms | Added or promoted |
| --- | --- | --- | --- | --- | --- | --- |
| synth_data_scientist_senior_elite_1 | PASS | none (none) | 1 |  | 3430 |  |
| synth_marketing_manager_vp_elite_1 | PASS | none (none) | 1 |  | 3747 |  |
| synth_software_engineer_mid_strong_1 | PASS | none (none) | 1 |  | 4191 |  |
| synth_ux_designer_director_strong_1 | PASS | none (none) | 1 |  | 1202 |  |
| synth_sales_executive_mid_foundation_1 | PASS | added (added) | 3 | no_recent_work promoted Fix 2 | 33027 | Add one dated line covering August 2023 to today. / Replace the broad BrightWave customer-engagement project description with one project, your contribution and any result you can verify. |
| synth_hr_manager_director_foundation_1 | PASS | added (added) | 3 | no_recent_work, no_evidence_latest_role | 48330 | Add one dated line covering August 2023 to today. / In the BrightWave role, add how many employees you supported or a measurable result from your HR work, if you can verify it. |
| synth_finance_analyst_senior_weak_1 | PASS | added (added) | 2 | no_recent_work, no_evidence_latest_role | 20215 | Add one dated line covering August 2023 to today. |
| synth_operations_manager_entry_weak_1 | PASS | added (added) | 3 | no_recent_work, no_evidence_latest_role | 33623 | Add one dated line covering Jul 2023 to today. / In the Greenfield daily operations bullet, add the volume of tasks you personally handled, if you can verify it. |
| synth_project_manager_vp_strong_1 | PASS | none (none) | 1 |  | 21562 |  |
| synth_product_manager_entry_elite_1 | PASS | added (promoted) | 2 |  promoted Fix 2 | 6162 | After the NovaSense role, add any relevant work, project, course, or other current activity you can accurately describe. |
| synth_bp_customer_success_manager_1 | PASS | none (none) | 1 |  | 1195 |  |
| synth_bp_icu_nurse_1 | PASS | none (none) | 1 |  | 1233 |  |
| synth_bp_teacher_to_instructional_designer_1 | PASS | none (none) | 1 |  | 1671 |  |
| synth_bp_staff_accountant_1 | PASS | added (promoted) | 2 |  promoted Fix 2 | 4581 | In the journal entry and reconciliation bullet, name the types of accounts you work on and how you handle discrepancies, if applicable. |
| synth_bp_warehouse_supervisor_1 | PASS | none (none) | 1 |  | 1455 |  |
| synth_bp_technical_recruiter_1 | PASS | none (none) | 1 |  | 1340 |  |
| synth_bp_data_analyst_1 | PASS | added (added) | 2 | no_evidence_latest_role | 15684 | In the Lakeshore Grocers dashboard bullet, add how many regional managers use the dashboards, if you can verify it. |
| synth_bp_mechanical_engineer_1 | PASS | added (added) | 2 | no_evidence_latest_role | 13372 | In the Westhaven Mechanical Engineer II role, add a measurable result from the tolerance stack-ups or FEA, if you can verify it. |
| synth_bp_marketing_coordinator_gap_1 | PASS | added (added) | 2 | no_recent_work | 13850 | Add one dated line covering March 2024 to today, describing your activity truthfully. |
| synth_bp_paralegal_1 | PASS | none (none) | 1 |  | 2937 |  |
| synth_bp_executive_assistant_freelance_1 | PASS | none (none) | 1 |  | 1387 |  |
| synth_bp_retail_store_manager_1 | WARN | none (none) | 1 |  | 1159 |  |
| synth_bp_ux_researcher_gap_1 | PASS | added (added) | 2 | no_recent_work | 6879 | Add one dated line covering January 2025 to today. |
| synth_bp_backend_engineer_senior_1 | PASS | none (none) | 1 |  | 1130 |  |
| synth_bp_account_executive_1 | PASS | none (none) | 1 |  | 1199 |  |
| synth_bp_hr_generalist_career_break_1 | PASS | none (none) | 1 |  | 5701 |  |
| synth_bp_product_designer_unrelated_1 | PASS | added (added) | 2 | no_recent_work | 6378 | Add a recent product design project, such as freelance or personal work, if true. |
| synth_bp_supply_chain_analyst_1 | PASS | none (none) | 1 |  | 1880 |  |
| synth_bp_nonprofit_program_manager_1 | PASS | none (none) | 1 |  | 1879 |  |
| synth_bp_it_support_recent_grad_1 | PASS | added (added) | 3 | no_recent_work, no_evidence_latest_role | 12107 | Add one dated line covering May 2025 to today that truthfully describes your activity. / In the Chattahoochee County Schools help desk internship, add the number of tickets you handled or laptops you set up, if you can verify it. |
| synth_bp_social_worker_1 | PASS | none (none) | 1 |  | 1356 |  |
| synth_bp_cybersecurity_analyst_1 | PASS | none (none) | 1 |  | 1098 |  |
| synth_bp_kitchen_manager_1 | PASS | none (none) | 1 |  | 1080 |  |
| synth_bp_civil_engineer_1 | PASS | none (none) | 1 |  | 2340 |  |
| synth_bp_bank_branch_manager_gap_1 | PASS | added (added) | 2 | no_recent_work | 7012 | Add one dated line covering December 2024 to today. |
| synth_bp_content_writer_freelance_1 | PASS | none (none) | 1 |  | 1206 |  |
| synth_bp_dental_hygienist_1 | PASS | none (none) | 1 |  | 1101 |  |
| synth_bp_event_planner_relocation_1 | WARN | added (added) | 2 | no_recent_work | 7887 | Add one dated line covering July 2024 to today, including any event-planning activity if true. |
| synth_bp_logistics_dispatcher_1 | PASS | none (none) | 1 |  | 2771 |  |
| synth_bp_graphic_designer_unrelated_1 | PASS | added (added) | 3 | no_recent_work, no_evidence_latest_role | 10412 | Add recent graphic design work, such as freelance work or a personal project, if true. / In the Blue Stem Creative role, add how many client projects you personally worked on, if you can verify it. |
| synth_cc_operations_manager_bad_1 | WARN | added (added) | 3 | no_recent_work promoted Fix 2 | 8142 | Add one dated line covering January 2025 to today, describing your activity during that period truthfully. / In the summary, distinguish a Director of Operations target from experience already held, and add any verified multi-site work to the relevant job entry. |
| synth_cc_career_changer_bad_1 | PASS | added (added) | 2 | no_target_role, missing_dates | 10766 | Add the verified start and end dates, or Present if applicable, to the Freelance Web Developer role. |
| synth_cc_sales_rep_bad_1 | PASS | added (added) | 3 | no_recent_work promoted Fix 2 | 7155 | Add one dated line covering February 2025 to today. / In the account executive sales bullet, add a verified sales result and its relevant timeframe if you can substantiate one. |
| synth_cc_marketing_director_bad_1 | PASS | added (added) | 2 | no_recent_work, no_target_role | 10869 | Add one dated line covering January 2025 to today. |
| synth_cc_admin_generalist_bad_1 | PASS | added (added) | 3 | no_recent_work promoted Fix 2 | 10134 | Add one dated line covering March 2025 to today. / In the patient scheduling bullet, describe the appointment types or coordination challenges you handled, if you can verify them. |
| synth_cc_staff_accountant_bad_1 | PASS | added (promoted) | 2 |  promoted Fix 3 | 12757 | Expand the bank and credit card reconciliation bullet with an example of a discrepancy you investigated and how you resolved or escalated it, if applicable. |
| synth_cc_recent_grad_bad_1 | PASS | added (added) | 3 | no_recent_work promoted Fix 2 | 12231 | Add one dated line covering May 2024 to today. / In the newsletter bullet, describe the specific content or production tasks you handled. |
| synth_cc_project_coordinator_bad_1 | PASS | added (added) | 3 | no_recent_work, no_evidence_latest_role | 13577 | Add one dated line covering February 2025 to today. / In the Harborview Health IT Project Coordinator role, add the number of projects you coordinated or a measurable result, if you can verify it. |
| synth_cc_product_manager_strong_1 | PASS | none (none) | 1 |  | 5436 |  |
| synth_cc_physical_therapist_strong_1 | PASS | none (none) | 1 |  | 3169 |  |
| synth_cc_fpa_analyst_strong_1 | PASS | none (none) | 1 |  | 2920 |  |
| synth_cc_construction_pm_strong_1 | PASS | none (none) | 1 |  | 1523 |  |
