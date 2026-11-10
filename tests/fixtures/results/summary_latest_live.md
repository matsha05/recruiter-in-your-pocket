# PromptOps Live Eval Report

**Run ID:** worklist_upgrades3_2026-11-07_replay_2026-11-10
**Timestamp:** 2026-11-07T22:12:24.478Z
**Tier:** Existing calibrated cases in the upgrades3 audit cohort (27 bulk cases, 1 golden case)
**Contract Version:** v3
**Execution Mode:** Live model evaluation
**Model:** gpt-6.1-terra
**Reasoning effort:** medium
**Resume prompt SHA-256:** 15dff271c2d212b2504350e8d09deec38785cfa3e7ee269f5f8154593e015688
**Resume ideas prompt SHA-256:** 6d90925e63aae15476712f92af5ffbdf4e684feec413711e14d6dba7201b6fc7
**Validation Mode:** Saved output replay through current candidate
**Validation Timestamp:** 2026-11-10
**Source run SHA-256:** 9db5042467c2e33ba4eb221f1b3a25ee73e589b3797c76da7481d539e10df585
**Validation source SHA-256:** 0e72d5bcebf532cab5baa8fd86b70951d71d7c967b1a34bd434ba1c761c2284d

## Summary

| Metric | Value |
|:--|:--|
| Total Fixtures | 28 |
| Passed | 28 |
| Warned | 0 |
| Failed | 0 |
| Pass Rate | 100.0% |

## What this proves

The November 7 `upgrades3` source records from commit `c52ceb78df61e37d3dc5eabef090bed9b1a109c0` carry the current resume prompt hash, model, reasoning effort, exact resume hashes, provider usage, original drafts, and four saved repaired drafts. Offline replay on November 10 validates all 59 report-producing records against the current request, sanitization, grounding, schema and band rules. The oversized sixtieth request is still refused before a model call and is not counted as a model PASS.

The launch denominator is selected by a rule fixed independently of the outputs: a record's exact resume bytes must match an existing entry in `tests/fixtures/calibration.json`. All 28 matching resume-only cases are included, covering 28 distinct resumes. A case with a posting is a different complete input and is not qualified by a resume-only calibration; the customer-success posting variant is therefore excluded from the denominator. They run the unchanged score ranges and all existing worklist source, copy and specificity checks. The other 31 records have no predefined score range for their complete input; they receive source/copy checks and are disclosed in the detailed receipt, but never enter the launch denominator. No range was invented or widened, no warning was converted to PASS manually, and no output was replaced or edited.

The runtime bar remains at least eight evaluated cases, at least 90% PASS and zero FAIL. This is a bounded calibrated-cohort replay, **not** a fresh full golden or smoke run, not proof of universal accuracy, and not a hosted customer-journey rehearsal. No provider calls or paid evaluation occurred on November 10. The current prompt is unchanged. The unchanged resume-ideas prompt is carried forward from the historical proof; it was not regenerated in this cohort.

## Detector correction and retained limitations

Before correcting the mechanical-copy detector, these same 28 cases returned **24 PASS, 4 WARN, 0 FAIL**. The original receipt is retained in `worklist_readiness_replay_2026-11-10_before.json` with the original validator/check fingerprints. Its warnings treated shared grammatical openers or factual job titles as repeated observations:

| Case | Original flagged phrase | Why the warning was incorrect |
|:--|:--|:--|
| Warehouse supervisor | “for the supervisor” | Covering a supervisor's responsibilities and preparation for a supervisor role refer to the same factual role. |
| HR generalist | “to HR Generalist” | The role inference and the recorded HR Assistant → HR Generalist progression need the same job title. |
| Marketing coordinator | “if you took” | Caregiving and a career break are distinct conditional examples, each explicitly limited to what is true. |
| Product designer | “what did you” | “What did you test with members, and what did you learn?” asks for two different facts. |

The correction extends the existing factual-role rule and distinguishes shared question/condition/modal openers only when their substantive continuations differ. It then checks the remaining substantive text for repetition. Paired controls still reject duplicate questions, identical conditions, repeated advice after otherwise distinct openers, and repeated full sentences. This changes the eval's copy detector, not generated report text, production validation, scoring ranges, the runtime launch threshold or any prompt.

Two warnings remain outside the calibrated cohort: `b15_career_changer_maria` and `b39_new_grad_daniel` each have a line example without a fill-in blank. Their `W_SPECIFICITY_LOW` results are preserved in the current detailed receipt. Across all 59 records, source/copy checks therefore leave 57 clear and two warned, with no source/schema failure; 31 of those records are not score-calibrated for their complete input. The ledger's display-band labels are historical presentation values, not current grading evidence; the replay uses the current validator and score rules.

## Reproduce and verify

From the repository root, without credentials or network calls:

```bash
node web/scripts/run-ts-test.cjs web/scripts/replay-worklist-readiness.ts
node web/scripts/run-ts-test.cjs web/tests/worklist-readiness-replay.test.ts
```

`--write` regenerates only the detailed replay receipt after review. The test recomputes every case and compares source hashes, the local validation dependency closure, dependency versions, outcomes and warnings with the recorded receipt. Changes to prompts, source bytes, calibration, checks or validators require investigation and a new receipt. Runtime matching continues to reject a different model, reasoning effort or prompt hash.

- Current detailed receipt: `tests/fixtures/results/worklist_readiness_replay_2026-11-10.json`.
- Original replay: `tests/fixtures/results/worklist_readiness_replay_2026-11-10_before.json`.
- Unchanged source artifacts: `docs/audits/2026-11-first-read/outputs/upgrades3/`.
- Earlier v2 proof: `tests/fixtures/results/summary_historical_2026-10-31.md`.
- Production candidate at the start of this reconciliation: `59fac9cc0b71837818bb5c3dcca98fa856dea781`. The corrected check is bound by the validation-source hash above; exact final-commit CI and hosted release verification are separate.

## Evaluated cases

| Case | Existing fixture | Tier | Score | Existing range | Result |
|:--|:--|:--|--:|:--|:--|
| b01_icu_nurse | synth_bp_icu_nurse_1 | bulk | 80 | 62–80 | PASS |
| b04_retail_store_manager | synth_bp_retail_store_manager_1 | bulk | 82 | 78–92 | PASS |
| b05_paralegal | synth_bp_paralegal_1 | bulk | 80 | 64–82 | PASS |
| b06_staff_accountant | synth_bp_staff_accountant_1 | bulk | 64 | 52–70 | PASS |
| b07_account_executive | synth_bp_account_executive_1 | bulk | 80 | 70–86 | PASS |
| b08_warehouse_supervisor | synth_bp_warehouse_supervisor_1 | bulk | 77 | 56–75 | PASS |
| b09_executive_assistant_freelance | synth_bp_executive_assistant_freelance_1 | bulk | 75 | 58–76 | PASS |
| b10_it_support_recent_grad | synth_bp_it_support_recent_grad_1 | bulk | 59 | 52–70 | PASS |
| b11_recent_grad_bad | synth_cc_recent_grad_bad_1 | bulk | 55 | 45–85 | PASS |
| b13_marketing_vp_elite | synth_marketing_manager_vp_elite_1 | golden | 88 | 85–95 | PASS |
| b14_teacher_to_instructional_designer | synth_bp_teacher_to_instructional_designer_1 | bulk | 68 | 60–78 | PASS |
| b16_career_changer_bad | synth_cc_career_changer_bad_1 | bulk | 59 | 45–85 | PASS |
| b17_hr_generalist_career_break | synth_bp_hr_generalist_career_break_1 | bulk | 67 | 56–74 | PASS |
| b20_customer_success_manager | synth_bp_customer_success_manager_1 | bulk | 78 | 62–80 | PASS |
| b24_physical_therapist_strong | synth_cc_physical_therapist_strong_1 | bulk | 89 | 75–95 | PASS |
| b25_fpa_analyst_strong | synth_cc_fpa_analyst_strong_1 | bulk | 94 | 75–95 | PASS |
| b26_construction_pm_strong | synth_cc_construction_pm_strong_1 | bulk | 87 | 75–95 | PASS |
| b27_backend_engineer_senior | synth_bp_backend_engineer_senior_1 | bulk | 90 | 84–96 | PASS |
| b28_cybersecurity_analyst | synth_bp_cybersecurity_analyst_1 | bulk | 91 | 80–94 | PASS |
| b29_mechanical_engineer | synth_bp_mechanical_engineer_1 | bulk | 68 | 60–78 | PASS |
| b30_social_worker | synth_bp_social_worker_1 | bulk | 65 | 58–76 | PASS |
| b31_kitchen_manager | synth_bp_kitchen_manager_1 | bulk | 67 | 52–70 | PASS |
| b32_logistics_dispatcher | synth_bp_logistics_dispatcher_1 | bulk | 63 | 50–68 | PASS |
| b33_nonprofit_program_manager | synth_bp_nonprofit_program_manager_1 | bulk | 72 | 58–76 | PASS |
| b34_bank_branch_manager_gap | synth_bp_bank_branch_manager_gap_1 | bulk | 77 | 62–80 | PASS |
| b35_marketing_coordinator_gap | synth_bp_marketing_coordinator_gap_1 | bulk | 68 | 55–72 | PASS |
| b36_product_designer_unrelated | synth_bp_product_designer_unrelated_1 | bulk | 67 | 58–78 | PASS |
| b37_marketing_director_bad | synth_cc_marketing_director_bad_1 | bulk | 54 | 45–85 | PASS |
