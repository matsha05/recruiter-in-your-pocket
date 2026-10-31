# PromptOps Live Eval Report

**Run ID:** eval_1793394208092_replay
**Timestamp:** 2026-10-30T21:11:44.528Z
**Tier:** golden
**Prompt Version:** v1
**Contract Version:** v2
**Execution Mode:** Live model evaluation
**Model:** gpt-6.1-terra
**Reasoning effort:** medium
**Resume prompt SHA-256:** 67c7257730ac5b53f3465454d7bc6831e83f07d50255435e7cafbc09d1f8fa86
**Resume ideas prompt SHA-256:** 6d90925e63aae15476712f92af5ffbdf4e684feec413711e14d6dba7201b6fc7
**Incomplete-response retry:** high reasoning
**Validation Mode:** Saved output replay through current candidate
**Validation Timestamp:** 2026-10-30T21:19:48.310Z
**Source run SHA-256:** b6e20c5669bbeb80b7b612993339a6a38a8c033813e2bb60a2502fab4bb41111

**Validation candidate:** f9d3903813c2449b205ec39baec9f344650006e5
**Original generation candidate:** 7a376299ec13f3d0a1b3bad6fd9a1add31efe45b

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
| API Calls | 16 |
| Token-calculated API Cost | $0.246390 |
| Input Tokens | 147,874 |
| Cached Input Tokens | 122,475 |
| Output Tokens | 41,705 |
| Reasoning Tokens | 12,094 |
| Budget | $20.00 |

## ✅ Passed

10 fixtures passed all checks.

<details>
<summary>Expand to see fixture IDs</summary>

- synth_data_scientist_senior_elite_1 (score: 92)
- synth_marketing_manager_vp_elite_1 (score: 89)
- synth_software_engineer_mid_strong_1 (score: 83)
- synth_ux_designer_director_strong_1 (score: 83)
- synth_sales_executive_mid_foundation_1 (score: 59)
- synth_hr_manager_director_foundation_1 (score: 58)
- synth_finance_analyst_senior_weak_1 (score: 62)
- synth_operations_manager_entry_weak_1 (score: 57)
- synth_project_manager_vp_strong_1 (score: 83)
- synth_product_manager_entry_elite_1 (score: 86)
</details>

## Scope and decision

This evidence covers the ten synthetic golden fixtures selected from the 23-fixture stored golden corpus. The other 13 fixtures were not newly generated in this launch rescue. The test scope uses synthetic resumes within Matt’s approved testing budget, keeping customer and real-person resume fixtures out of model calls. The prompts and existing readiness bar are unchanged: at least eight fixtures, at least 90% PASS and zero FAIL.

The original live run returned **9 PASS, 0 WARN and 1 FAIL**. Its Operations final was rejected solely because the editorial noun “descriptions” was missing from the validator's existing assessment vocabulary. A one-word lexical normalization and paired negative controls fixed that false rejection. This replay validates the same ten unedited original model outputs through candidate `f9d3903813c2449b205ec39baec9f344650006e5` and returns **10 PASS, 0 WARN and 0 FAIL**. It is saved-output replay, not a fresh ten-fixture generation on that candidate. No result was replaced and no report prose was manually edited. The original failure and provider attempts remain in the retained receipts.

Validation preserves deterministic removal of unsupported optional keyword or industry labels and the existing source-grounding checks for core claims. Independent review read the reports against their synthetic sources. These bounded checks do not establish universal accuracy, hosted customer-journey completion or production readiness.

## Separate fresh Operations confirmation

After the vocabulary correction, fresh run `eval_1793395105340` generated `synth_operations_manager_entry_weak_1` on candidate `f9d3903813c2449b205ec39baec9f344650006e5`: **1 PASS, 0 WARN, 0 FAIL**, score 58, two provider calls and a token-calculated standard-rate cost of **$0.03118420**. The launcher recorded unchanged source and exact fixture/provider coverage. This separate one-fixture confirmation is not substituted into the ten-fixture replay or added to its denominator.

The prior network-denied targeted attempt is retained as an unsuccessful attempt. It is not counted as quality evidence.

## Separate streaming coverage

Four synthetic streaming cases (Operations and brand/tool resumes, with and without a job description) ran separately on `92e45a0773c2aef6470053c9e3753b68f7b39fba`. The receipt `model-comparison-receipt-2026-10-30T20-45-16-752Z.json` records unchanged source. The same four raw provider outputs also replayed successfully on `f9d3903813c2449b205ec39baec9f344650006e5` (4 PASS, 0 FAIL; `riyp-final-four-replay.json`, SHA-256 `1dcd35766bc00f06c7eb9364b0ff3a3071a6cf3e557be2f5cb5a3115c84528aa`). This is an offline validation replay, not fresh streaming on the final candidate. These route/repair checks are separate from the golden cohort and are not the standard smoke-tier suite. This record does not claim that `launch:gate:strict` or all 23 live golden fixtures ran. Exact-commit CI, final-source verification and complete hosted rehearsal remain separate release requirements.

## Immutable receipt references

Raw model outputs and launcher receipts are retained locally, outside the committed summary. Hashes bind the exact bytes; source reports were not rewritten to create this evidence.

| Evidence | File | SHA-256 |
|:--|:--|:--|
| Original ten-fixture live run | `2026-10-30T21-11-44-528Z_live_run.json` | `b6e20c5669bbeb80b7b612993339a6a38a8c033813e2bb60a2502fab4bb41111` |
| Original launcher (9 PASS, 1 FAIL; exit 1 retained) | `synthetic-golden-receipt-2026-10-30T21-03-27-581Z.json` | `4057d10e82d7a2bc0c497f1cb58283e541eb2b169b05dc38bf31d1d3a7121837` |
| Separate fresh Operations live run | `2026-10-30T21-19-26-498Z_live_run.json` | `8a850619016e09c73afe03feaae6dd7fac4e66d053663a9124b147742ca30f79` |
| Fresh Operations launcher | `synthetic-golden-receipt-2026-10-30T21-18-24-848Z.json` | `32fa1380e62746d3668fc258edcdd99de3c8876d7bdd48179039b8206fd2d1aa` |
| Separate four-case streaming launcher | `model-comparison-receipt-2026-10-30T20-45-16-752Z.json` | `0833445be14de36b5de700db3dd508fc1723baa6cd4695237cfa074d786af441` |

The original ten-fixture run used 16 provider calls and **$0.24638950** in token-calculated standard-rate cost. Replay made no model calls. The observed golden ledger, including the earlier run and fresh Operations confirmation, totals **$0.52288225** in returned-token cost; it is not an invoice or a claim about total campaign spend across other ledgers.

The earlier October 30 run `eval_1793393314873` returned 9 PASS, 1 WARN and 0 FAIL on `92e45a0` (source JSON SHA-256 `e11499b1cabf13675dba5e79c550cb92c8901a95e0b5455554356ee324ca0de2`). It remains historical evidence and is not used to approve the changed validator.

The [September 4 Terra 5.6 evidence](summary_historical_2026-09-04.md) remains historical. Its 23-fixture replay and targeted replacements do not approve the Terra 6.1 launch model.
