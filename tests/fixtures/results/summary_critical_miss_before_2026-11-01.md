# PromptOps Live Eval Report

**Run ID:** eval_1793553133997_replay
**Timestamp:** 2026-11-01T17:22:02.097Z
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
**Validation Timestamp:** 2026-11-01T19:56:46.683Z
**Source run SHA-256:** 41d7da905956bc39c8f29f744159c983eefad4be26f391e84071052635d7a003

## Summary

| Metric | Value |
|:-------|:------|
| Total Fixtures | 30 |
| ✅ Passed | 25 |
| ⚠️ Warned | 3 |
| ❌ Failed | 2 |
| Pass Rate | 83.3% |

## Cost

| Metric | Value |
|:-------|:------|
| API Calls | 43 |
| Token-calculated API Cost | $0.640381 |
| Input Tokens | 388,772 |
| Cached Input Tokens | 298,843 |
| Output Tokens | 102,612 |
| Reasoning Tokens | 24,548 |
| Budget | $3.00 |

## ❌ Blocking Failures

These must be fixed before shipping.

### synth_data_scientist_senior_elite_1

**Status:** FAIL
**Score:** 92 (expected: 85–95)

**Errors (ship blockers):**
- `E_SCHEMA`: The model response failed the evidence grounding contract at ideas.questions[2].question unsupported narrative facts: unresolved relationship binding: What led you to decide to integrate GPU-accelerated models into the FinEdge fraud pipeline?.

### synth_project_manager_vp_strong_1

**Status:** FAIL
**Score:** 84 (expected: 75–85)

**Errors (ship blockers):**
- `E_SCHEMA`: The model response failed the evidence grounding contract at summary unsupported narrative facts: because, group, brought, together.

## ⚠️ Warnings (Review Recommended)

### synth_marketing_manager_vp_elite_1

**Status:** WARN
**Score:** 88 (expected: 85–95)

**Warnings:**
- `W_MECHANICAL_COPY`: gaps.2 repeats the clause "you used them"

### synth_finance_analyst_senior_weak_1

**Status:** WARN
**Score:** 58 (expected: 55–68)

**Warnings:**
- `W_SPECIFICITY_LOW`: Fix 3 lacks a specific detail, quoted correction, or concrete target

### synth_operations_manager_entry_weak_1

**Status:** WARN
**Score:** 58 (expected: 55–68)

**Warnings:**
- `W_MECHANICAL_COPY`: top_fixes.0.fix repeats the clause "records and reports"

## Report Integrity

What a customer reads, measured on each validated report. These checks are reported, not gated; the status counts above are unchanged. **Model** is the report as generated. **Shown** is the report after the deterministic post-generation pass that the web report and PDF both apply.

| Check | Model | Shown |
|:------|:------|:------|
| Reports with a rewrite | 0 of 28 (0 rewrites) | same |
| Keep/fix collisions on one line | 6 in 5 reports | 0 |
| Critical Miss line also in Keep | 2 reports | 0 reports |
| Repeated observations | 173 | 0 |
| Field-slot mapping issues | 0 | 0 |
| Critical Miss is a line edit / structural | 26 / 2 (employment gap 2) | same |
| Nothing critical (Critical Miss marked low impact) | 0 reports | same |
| Model's first fix dropped by validation | 0 reports | same |
| Structural issue flagged, Critical Miss is a line edit | 14 reports | same |
| Verdict and Critical Miss disagree | 15 reports | same |
| Verdict raises no concern | 8 reports | same |
| Fix headings over 12 words | 81 of 81 (longest 27 words) | same |
| Fix headings that open with a location / carry a condition | 78 / 9 | same |

| Fixture | Score | Rewrites | Keep/fix | Repeats | Slot issues | Critical Miss | Verdict and Critical Miss |
|:--------|:------|:---------|:---------|:--------|:------------|:--------------|:--------------------------|
| synth_data_scientist_senior_elite_1 | 92 | 0 | 0 → 0 | 6 → 0 | 0 → 0 | line edit | mismatch |
| synth_data_scientist_senior_elite_1 | 92 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | line edit | no concern |
| synth_marketing_manager_vp_elite_1 | 88 | 0 | 0 → 0 | 6 → 0 | 0 → 0 | line edit | no concern |
| synth_marketing_manager_vp_elite_1 | 88 | 0 | 0 → 0 | 8 → 0 | 0 → 0 | line edit | no concern |
| synth_marketing_manager_vp_elite_1 | 90 | 0 | 0 → 0 | 4 → 0 | 0 → 0 | line edit | agree |
| synth_software_engineer_mid_strong_1 | 84 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | line edit; flagged: employment gap, positioning (outranked) | mismatch |
| synth_software_engineer_mid_strong_1 | 83 | 0 | 0 → 0 | 10 → 0 | 0 → 0 | line edit | no concern |
| synth_software_engineer_mid_strong_1 | 83 | 0 | 0 → 0 | 8 → 0 | 0 → 0 | line edit; flagged: employment gap, positioning (outranked) | mismatch |
| synth_ux_designer_director_strong_1 | 82 | 0 | 0 → 0 | 6 → 0 | 0 → 0 | line edit | no concern |
| synth_ux_designer_director_strong_1 | 84 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | line edit; flagged: target role (outranked) | no concern |
| synth_ux_designer_director_strong_1 | 82 | 0 | 0 → 0 | 8 → 0 | 0 → 0 | line edit | mismatch |
| synth_sales_executive_mid_foundation_1 | 58 | 0 | 1 → 0 | 6 → 0 | 0 → 0 | line edit; flagged: employment gap (outranked) | mismatch |
| synth_sales_executive_mid_foundation_1 | 58 | 0 | 1 → 0 (Critical Miss in Keep) | 6 → 0 | 0 → 0 | line edit; flagged: employment gap (outranked) | mismatch |
| synth_sales_executive_mid_foundation_1 | 58 | 0 | 1 → 0 (Critical Miss in Keep) | 6 → 0 | 0 → 0 | line edit; flagged: employment gap (outranked) | mismatch |
| synth_hr_manager_director_foundation_1 | 58 | 0 | 2 → 0 | 3 → 0 | 0 → 0 | line edit; flagged: employment gap (outranked) | no concern |
| synth_hr_manager_director_foundation_1 | 59 | 0 | 0 → 0 | 6 → 0 | 0 → 0 | line edit; flagged: employment gap (outranked) | mismatch |
| synth_hr_manager_director_foundation_1 | 62 | 0 | 0 → 0 | 4 → 0 | 0 → 0 | line edit; flagged: employment gap (outranked) | agree |
| synth_finance_analyst_senior_weak_1 | 58 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | line edit; flagged: employment gap (outranked) | mismatch |
| synth_finance_analyst_senior_weak_1 | 59 | 0 | 0 → 0 | 5 → 0 | 0 → 0 | line edit; flagged: employment gap (outranked) | mismatch |
| synth_finance_analyst_senior_weak_1 | 58 | 0 | 0 → 0 | 5 → 0 | 0 → 0 | line edit; flagged: employment gap (outranked) | mismatch |
| synth_operations_manager_entry_weak_1 | 58 | 0 | 0 → 0 | 4 → 0 | 0 → 0 | line edit | agree |
| synth_operations_manager_entry_weak_1 | 58 | 0 | 1 → 0 | 5 → 0 | 0 → 0 | line edit | agree |
| synth_operations_manager_entry_weak_1 | 58 | 0 | 0 → 0 | 7 → 0 | 0 → 0 | line edit; flagged: employment gap (outranked) | agree |
| synth_project_manager_vp_strong_1 | 84 | 0 | 0 → 0 | 9 → 0 | 0 → 0 | line edit | mismatch |
| synth_project_manager_vp_strong_1 | 84 | 0 | 0 → 0 | 6 → 0 | 0 → 0 | line edit | mismatch |
| synth_product_manager_entry_elite_1 | 86 | 0 | 0 → 0 | 8 → 0 | 0 → 0 | structural (employment gap); flagged: employment gap, positioning | mismatch |
| synth_product_manager_entry_elite_1 | 86 | 0 | 0 → 0 | 3 → 0 | 0 → 0 | structural (employment gap); flagged: positioning | mismatch |
| synth_product_manager_entry_elite_1 | 86 | 0 | 0 → 0 | 6 → 0 | 0 → 0 | line edit; flagged: employment gap (outranked) | no concern |

<details>
<summary>Integrity details</summary>

- **synth_data_scientist_senior_elite_1**: The takeaway ("Define the model errors") points at fix 2, not the Critical Miss. The biggest-gap example quotes fix 2's line. The Verdict says to keep part of the line fix 1 changes.
- **synth_data_scientist_senior_elite_1**: The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_marketing_manager_vp_elite_1**: The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_marketing_manager_vp_elite_1**: The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_software_engineer_mid_strong_1**: The Verdict's concern is positioning, but the Critical Miss is a single-line edit. The Verdict's concern is fix 3's line, not the Critical Miss.
- **synth_software_engineer_mid_strong_1**: The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_software_engineer_mid_strong_1**: The Verdict's concern is positioning, but the Critical Miss is a single-line edit. The Verdict's concern is fix 2's line, not the Critical Miss.
- **synth_ux_designer_director_strong_1**: The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_ux_designer_director_strong_1**: The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_ux_designer_director_strong_1**: The takeaway ("Show the standards you established") points at fix 2, not the Critical Miss. The biggest-gap example quotes fix 2's line.
- **synth_sales_executive_mid_foundation_1**: The takeaway ("Explain your prospecting work") points at fix 2, not the Critical Miss. The biggest-gap example quotes fix 2's line.
- **synth_sales_executive_mid_foundation_1**: The takeaway ("Describe a customer-engagement project") points at fix 2, not the Critical Miss. The biggest-gap example quotes fix 2's line.
- **synth_sales_executive_mid_foundation_1**: The takeaway ("Name a customer engagement project") points at fix 2, not the Critical Miss. The biggest-gap example quotes fix 2's line. The Verdict says to keep part of the line fix 1 changes.
- **synth_hr_manager_director_foundation_1**: The Verdict raises no concern, yet the report still names a Critical Miss.
- **synth_hr_manager_director_foundation_1**: The takeaway ("Explain your employee relations work") points at fix 2, not the Critical Miss. The biggest-gap example quotes fix 2's line.
- **synth_hr_manager_director_foundation_1**: The biggest-gap example quotes fix 2's line.
- **synth_finance_analyst_senior_weak_1**: The takeaway ("Name the finance deliverables") points at fix 2, not the Critical Miss. The biggest-gap example quotes fix 2's line.
- **synth_finance_analyst_senior_weak_1**: The takeaway ("Name the finance deliverables") points at fix 3, not the Critical Miss. The biggest-gap example quotes fix 3's line.
- **synth_finance_analyst_senior_weak_1**: The takeaway ("Name the finance deliverables") points at fix 3, not the Critical Miss. The biggest-gap example quotes fix 3's line.
- **synth_project_manager_vp_strong_1**: The takeaway ("Describe your mentoring approach") points at fix 2, not the Critical Miss. The biggest-gap example quotes fix 2's line.
- **synth_project_manager_vp_strong_1**: The takeaway ("Explain your mentoring approach") points at fix 3, not the Critical Miss. The biggest-gap example quotes fix 3's line.
- **synth_product_manager_entry_elite_1**: The Verdict's concern is positioning, but the Critical Miss is employment gap. The biggest-gap example quotes fix 2's line.
- **synth_product_manager_entry_elite_1**: The Verdict's concern is positioning, but the Critical Miss is employment gap. The takeaway ("Explain the onboarding messaging") points at fix 2, not the Critical Miss. The biggest-gap example quotes fix 2's line.
- **synth_product_manager_entry_elite_1**: The biggest-gap example quotes fix 2's line. The Verdict raises no concern, yet the report still names a Critical Miss.
</details>

## Score Test-Retest

| Fixture | Scores | Range | Mean | SD |
|:--------|:-------|:------|:-----|:---|
| synth_data_scientist_senior_elite_1 | 92, 92, 92 (1 from reports that failed validation) | 0 | 92 | 0 |
| synth_marketing_manager_vp_elite_1 | 88, 88, 90 | 2 | 88.7 | 1.2 |
| synth_software_engineer_mid_strong_1 | 84, 83, 83 | 1 | 83.3 | 0.6 |
| synth_ux_designer_director_strong_1 | 82, 84, 82 | 2 | 82.7 | 1.2 |
| synth_sales_executive_mid_foundation_1 | 58, 58, 58 | 0 | 58 | 0 |
| synth_hr_manager_director_foundation_1 | 58, 59, 62 | 4 | 59.7 | 2.1 |
| synth_finance_analyst_senior_weak_1 | 58, 59, 58 | 1 | 58.3 | 0.6 |
| synth_operations_manager_entry_weak_1 | 58, 58, 58 | 0 | 58 | 0 |
| synth_project_manager_vp_strong_1 | 84, 84, 84 (1 from reports that failed validation) | 0 | 84 | 0 |
| synth_product_manager_entry_elite_1 | 86, 86, 86 | 0 | 86 | 0 |

## ✅ Passed

25 fixtures passed all checks.

<details>
<summary>Expand to see fixture IDs</summary>

- synth_data_scientist_senior_elite_1 (score: 92)
- synth_data_scientist_senior_elite_1 (score: 92)
- synth_marketing_manager_vp_elite_1 (score: 88)
- synth_marketing_manager_vp_elite_1 (score: 90)
- synth_software_engineer_mid_strong_1 (score: 84)
- synth_software_engineer_mid_strong_1 (score: 83)
- synth_software_engineer_mid_strong_1 (score: 83)
- synth_ux_designer_director_strong_1 (score: 82)
- synth_ux_designer_director_strong_1 (score: 84)
- synth_ux_designer_director_strong_1 (score: 82)
- synth_sales_executive_mid_foundation_1 (score: 58)
- synth_sales_executive_mid_foundation_1 (score: 58)
- synth_sales_executive_mid_foundation_1 (score: 58)
- synth_hr_manager_director_foundation_1 (score: 58)
- synth_hr_manager_director_foundation_1 (score: 59)
- synth_hr_manager_director_foundation_1 (score: 62)
- synth_finance_analyst_senior_weak_1 (score: 59)
- synth_finance_analyst_senior_weak_1 (score: 58)
- synth_operations_manager_entry_weak_1 (score: 58)
- synth_operations_manager_entry_weak_1 (score: 58)
- synth_project_manager_vp_strong_1 (score: 84)
- synth_project_manager_vp_strong_1 (score: 84)
- synth_product_manager_entry_elite_1 (score: 86)
- synth_product_manager_entry_elite_1 (score: 86)
- synth_product_manager_entry_elite_1 (score: 86)
</details>
