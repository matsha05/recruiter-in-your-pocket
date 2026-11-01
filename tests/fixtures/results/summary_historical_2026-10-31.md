# PromptOps Live Eval Report

**Run ID:** eval_1793463473819_replay
**Timestamp:** 2026-10-31T16:21:29.561Z
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
**Validation Timestamp:** 2026-10-31T17:56:36.243Z
**Source run SHA-256:** da5212325f26a0ad3183372e44c83fb59c3a8754bacbe0c240ef6fe3255cc257

**Validation candidate:** 09f0b89e3c361f1cc2dcfe5ffaa4ea02eb2d901d
**Original generation candidate:** 12570ee809a37d18cce2edf5506cc97c673c392a (uncommitted working-tree edits at the time were UI-only; prompts and report logic matched this commit)

## Summary

| Metric | Value |
|:-------|:------|
| Total Fixtures | 10 |
| ✅ Passed | 10 |
| ⚠️ Warned | 0 |
| ❌ Failed | 0 |
| Pass Rate | 100.0% |

## Cost

| Metric | Value |
|:-------|:------|
| API Calls | 14 |
| Token-calculated API Cost | $0.227279 |
| Input Tokens | 126,170 |
| Cached Input Tokens | 81,636 |
| Output Tokens | 33,508 |
| Reasoning Tokens | 7,621 |
| Budget | $2.00 |

## ✅ Passed

10 fixtures passed all checks.

<details>
<summary>Expand to see fixture IDs</summary>

- synth_data_scientist_senior_elite_1 (score: 92)
- synth_marketing_manager_vp_elite_1 (score: 90)
- synth_software_engineer_mid_strong_1 (score: 83)
- synth_ux_designer_director_strong_1 (score: 83)
- synth_sales_executive_mid_foundation_1 (score: 59)
- synth_hr_manager_director_foundation_1 (score: 60)
- synth_finance_analyst_senior_weak_1 (score: 60)
- synth_operations_manager_entry_weak_1 (score: 60)
- synth_project_manager_vp_strong_1 (score: 84)
- synth_product_manager_entry_elite_1 (score: 86)
</details>

## Scope and decision

This evidence covers the same ten synthetic golden fixtures as the October 30 proof, regenerated live on October 31 because the resume prompt changed after that proof (resume prompt SHA-256 `67c72577…` to `83b2a2d1…`). Synthetic resumes only; no customer or real-person resumes were sent to the model. Matt approved the spend. The readiness bar is unchanged: at least eight fixtures, at least 90% PASS and zero FAIL.

The live run returned **9 PASS, 0 WARN and 1 FAIL**. The Operations fixture's final report was withheld by the grounding check, and in production that person would have received no report. Investigation found three false rejections in the validator, each fixed with paired negative controls and verified to fail without the fix:

1. `3f2ea55`: the seniority read "entry-level" was not in the assessment vocabulary although "senior" was. Level-read forms matching the report's own scale were added; bare "entry", "junior" and "executive" were not, because they also name duties and titles.
2. `6136e75`: a sentence-initial "Using" was read as part of the product name "Using Microsoft Office" (the resume says "Used Microsoft Office tools…").
3. `09f0b89`: "would" was missing from the advice modals, so "More specific descriptions would help show what you handled" was audited as a factual claim while the same sentence with "could" passed.

This replay validates the same ten unedited original model outputs through candidate `09f0b89` and returns **10 PASS, 0 WARN and 0 FAIL**. It is saved-output replay, not a fresh ten-fixture generation on that candidate. No result was replaced and no report prose was edited. These bounded checks do not establish universal accuracy, hosted customer-journey completion or production readiness.

## Separate fresh Operations confirmations

All three single-fixture runs of `synth_operations_manager_entry_weak_1` are recorded, including the failure. None is substituted into the ten-fixture replay or its denominator.

| Run | Candidate | Result | Score | Calls | Token-calculated cost |
|:--|:--|:--|:--|:--|:--|
| `eval_1793469152573` | `6136e75` | **FAIL** (exposed fix 3, "would") | 58 | 2 | $0.05048975 |
| `eval_1793469297246` | `09f0b89` | **PASS** | 60 | 2 | $0.02894605 |
| `eval_1793469354166` | `09f0b89` | **PASS** | 58 | 1 | $0.01079665 |

Three attempts stopped before any provider call and made no model calls: one with paid evals disabled, one with `--max-calls 30` (below the 40 a ten-fixture run with repair may need), and one single-fixture attempt under a $0.25 budget guard.

## Immutable receipt references

Raw model outputs are retained locally, outside the committed summary. Hashes bind the exact bytes.

| Evidence | File | SHA-256 |
|:--|:--|:--|
| Original ten-fixture live run | `2026-10-31T16-21-29-561Z_live_run.json` | `da5212325f26a0ad3183372e44c83fb59c3a8754bacbe0c240ef6fe3255cc257` |
| Operations confirmation (FAIL) | `2026-10-31T17-53-36-916Z_live_run.json` | `f1c6c1ad8144ee2611ad7d981e1638686e1bf47e97158d0a21b665cb4a027853` |
| Operations confirmation (PASS) | `2026-10-31T17-55-53-554Z_live_run.json` | `be86bfdaae612cd53400d0bf14a3c4f807f605988ee7bedf12859e1e24c2433b` |
| Operations confirmation (PASS) | `2026-10-31T17-56-19-326Z_live_run.json` | `39b07d7a64503453e4fc3e2f3b1eb574cb91d89cb7883c8f1323651f3337f246` |

The ten-fixture run used 14 provider calls and **$0.22727880** in token-calculated standard-rate cost. Replay made no model calls. October 31 returned-token cost across all four live runs is **$0.31750740**; it is not an invoice.

The [October 30 evidence](summary_historical_2026-10-30.md) and [September 4 Terra 5.6 evidence](summary_historical_2026-09-04.md) remain historical and do not approve the current prompt.
