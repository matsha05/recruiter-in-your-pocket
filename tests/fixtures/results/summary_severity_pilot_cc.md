# PromptOps Live Eval Report

**Run ID:** eval_1793576471840+eval_1793576649134+eval_1793585522068_combined_with_retries_replay_severity_2026-11-02T16-57-32-289Z
**Timestamp:** 2026-11-02T16:57:32.290Z
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
| Total Fixtures | 12 |
| ✅ Passed | 11 |
| ⚠️ Warned | 1 |
| ❌ Failed | 0 |
| Pass Rate | 91.7% |

## Cost

| Metric | Value |
|:-------|:------|
| API Calls | 12 |
| Token-calculated API Cost | $0.035015 |
| Input Tokens | 104,193 |
| Cached Input Tokens | 68,030 |
| Output Tokens | 26,509 |
| Reasoning Tokens | 4,831 |
| Budget | $1.00 |

## ⚠️ Warnings (Review Recommended)

### synth_cc_operations_manager_bad_1

**Status:** WARN
**Score:** 67 (expected: 45–85)

**Warnings:**
- `W_MECHANICAL_COPY`: ideas.questions.2.question repeats the clause "what did you"

## Report Integrity

What a customer reads, measured on each validated report. These checks are reported, not gated; the status counts above are unchanged. **Model** is the report as generated. **Shown** is the report after the deterministic post-generation pass that the web report and PDF both apply.

| Check | Model | Shown |
|:------|:------|:------|
| Reports with a rewrite | 0 of 12 (0 rewrites) | same |
| Keep/fix collisions on one line | 4 in 4 reports | 0 |
| Critical Miss line also in Keep | 2 reports | 0 reports |
| Repeated observations | 70 | 0 |
| Field-slot mapping issues | 0 | 0 |
| Critical Miss is a line edit / structural | 8 / 4 (positioning 4) | same |
| Nothing critical (Critical Miss marked low impact) | 0 reports | same |
| Model's first fix dropped by validation | 0 reports | same |
| Reports with 1 / 2 / 3 Critical Misses | 4 / 2 / 6 | same |
| Reports saying more than three exist | 0 | same |
| Critical Misses by kind | concrete fact 8, dates 7, direction 5, other 6 (of 26) | same |
| Structural issue flagged, Critical Miss is a line edit | 1 report | same |
| Verdict and Critical Miss disagree | 3 reports | same |
| Verdict raises no concern | 2 reports | same |
| Fix headings over 12 words | 26 of 32 (longest 30 words) | same |
| Fix headings that open with a location / carry a condition | 19 / 4 | same |

| Fixture | Score | Rewrites | Keep/fix | Repeats | Slot issues | Critical Miss | Verdict and Critical Miss |
|:--------|:------|:---------|:---------|:--------|:------------|:--------------|:--------------------------|
| synth_cc_operations_manager_bad_1 | 67 | 0 | 0 → 0 | 5 → 0 | 0 → 0 | line edit | no concern |
| synth_cc_career_changer_bad_1 | 64 | 0 | 1 → 0 (Critical Miss in Keep) | 3 → 0 | 0 → 0 | line edit; flagged: target role (outranked) | mismatch |
| synth_cc_sales_rep_bad_1 | 67 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | structural (positioning); flagged: positioning | agree |
| synth_cc_marketing_director_bad_1 | 80 | 0 | 0 → 0 | 3 → 0 | 0 → 0 | line edit | agree |
| synth_cc_admin_generalist_bad_1 | 65 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | structural (positioning) | agree |
| synth_cc_staff_accountant_bad_1 | 67 | 0 | 1 → 0 (Critical Miss in Keep) | 5 → 0 | 0 → 0 | structural (positioning); flagged: employment gap | agree |
| synth_cc_recent_grad_bad_1 | 64 | 0 | 0 → 0 | 5 → 0 | 0 → 0 | structural (positioning); flagged: employment gap | agree |
| synth_cc_project_coordinator_bad_1 | 64 | 0 | 0 → 0 | 5 → 0 | 0 → 0 | line edit | no concern |
| synth_cc_product_manager_strong_1 | 87 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | line edit | agree |
| synth_cc_physical_therapist_strong_1 | 85 | 0 | 0 → 0 | 9 → 0 | 0 → 0 | line edit | mismatch |
| synth_cc_fpa_analyst_strong_1 | 87 | 0 | 1 → 0 | 7 → 0 | 0 → 0 | line edit | mismatch |
| synth_cc_construction_pm_strong_1 | 85 | 0 | 1 → 0 | 7 → 0 | 0 → 0 | line edit | agree |

<details>
<summary>Integrity details</summary>

- **synth_cc_operations_manager_bad_1**: The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_cc_career_changer_bad_1**: The Verdict's concern is fix 2's line, not the Critical Miss. The takeaway ("Date your freelance work") points at fix 2, not the Critical Miss.
- **synth_cc_sales_rep_bad_1**: The biggest-gap example quotes fix 3's line.
- **synth_cc_recent_grad_bad_1**: The biggest-gap example quotes fix 3's line.
- **synth_cc_project_coordinator_bad_1**: The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_cc_physical_therapist_strong_1**: The takeaway ("Describe your mentoring work") points at fix 2, not the Critical Miss. The biggest-gap example quotes fix 2's line.
- **synth_cc_fpa_analyst_strong_1**: The takeaway ("Describe your variance recommendations") points at fix 3, not the Critical Miss. The biggest-gap example quotes fix 3's line.
- **synth_cc_construction_pm_strong_1**: The biggest-gap example quotes fix 3's line.
</details>

## Score Test-Retest

Each fixture was generated once, so test-retest was not measured. Use `--repeat <n>`, or replay several saved runs of the same fixtures together.

## ✅ Passed

11 fixtures passed all checks.

<details>
<summary>Expand to see fixture IDs</summary>

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
- Reports checked: 12; outcomes {"added":8,"none":4}; reasons {"added":8,"none":4}
- Critical Misses per report: {"1":4,"2":2,"3":6}; more than three: 0
- Latency (call plus validation), ms: mean 9386, p50 6172, p90 25095, max 27157; the call alone: mean 7559, p90 18355
- Cost: $0.03501475 in 12 calls (token-calculated)

| Fixture | Status | Outcome | Critical Misses | Added | Latency ms | Added or promoted |
| --- | --- | --- | --- | --- | --- | --- |
| synth_cc_operations_manager_bad_1 | WARN | added (added) | 3 | no_recent_work promoted Fix 2 | 18473 | Add one dated line covering January 2025 to today, describing your activity truthfully. / In the summary, distinguish a Director of Operations target from experience already held, and add any verified multi-site work to the relevant job entry. |
| synth_cc_career_changer_bad_1 | PASS | added (added) | 2 | no_target_role, missing_dates | 27157 | Add the start and end dates, or a present designation if applicable, to the Freelance Web Developer role using dates you can verify. |
| synth_cc_sales_rep_bad_1 | PASS | added (added) | 3 | no_recent_work promoted Fix 2 | 25095 | Add one dated line covering February 2025 to today. / In the account executive sales bullet, add a verified sales result and its relevant timeframe if you can substantiate one. |
| synth_cc_marketing_director_bad_1 | PASS | added (added) | 2 | no_recent_work, no_target_role | 9737 | Add one dated line covering January 2025 to today. |
| synth_cc_admin_generalist_bad_1 | PASS | added (added) | 3 | no_recent_work promoted Fix 2 | 6172 | Add one dated line covering March 2025 to today. / In the patient scheduling bullet, describe the appointment types or coordination challenges you handled, if you can verify them. |
| synth_cc_staff_accountant_bad_1 | PASS | added (added) | 3 | no_recent_work promoted Fix 3 | 5959 | Add one dated line covering March 2025 to today. / Expand the bank and credit card reconciliation bullet with an example of a discrepancy you investigated and how you resolved or escalated it, if applicable. |
| synth_cc_recent_grad_bad_1 | PASS | added (added) | 3 | no_recent_work promoted Fix 2 | 6066 | Add one dated line covering May 2024 to today. / In the newsletter bullet, describe the specific content or production tasks you handled. |
| synth_cc_project_coordinator_bad_1 | PASS | added (added) | 3 | no_recent_work, no_evidence_latest_role | 8508 | Add one dated line covering February 2025 to today. / In the Harborview Project Coordinator role, add the number of projects you tracked or a measurable project result, if you can verify it. |
| synth_cc_product_manager_strong_1 | PASS | none (none) | 1 |  | 1442 |  |
| synth_cc_physical_therapist_strong_1 | PASS | none (none) | 1 |  | 1316 |  |
| synth_cc_fpa_analyst_strong_1 | PASS | none (none) | 1 |  | 1178 |  |
| synth_cc_construction_pm_strong_1 | PASS | none (none) | 1 |  | 1527 |  |
