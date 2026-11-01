# PromptOps Live Eval Report

**Run ID:** eval_1793560728771_replay
**Timestamp:** 2026-11-01T19:20:04.692Z
**Tier:** smoke
**Prompt Version:** v1
**Contract Version:** v2
**Execution Mode:** Live model evaluation
**Model:** gpt-6.1-terra
**Reasoning effort:** medium
**Resume prompt SHA-256:** 55bee48bf96439b3171f1ccac5a8ca79cf1bdb6a003a3ef5f769e2c54f2b45c4
**Resume ideas prompt SHA-256:** 6d90925e63aae15476712f92af5ffbdf4e684feec413711e14d6dba7201b6fc7
**Incomplete-response retry:** high reasoning
**Validation Mode:** Saved output replay through current candidate
**Validation Timestamp:** 2026-11-01T20:10:29.385Z
**Source run SHA-256:** 10dd7f7aa6124dcd651faf044b9c565f331b4e0e1143221a6902076f10ff609b

**Validation candidate:** 0766adc18e3dca9781feeb8b8970ab909644d7a2
**Original generation candidate:** 1ddcc7b5ceac7023b2d21333af5de189b06e7260 (clean tree; the in-run result was also 2 PASS, 1 WARN, 0 FAIL)

## Summary

| Metric | Value |
|:-------|:------|
| Total Fixtures | 3 |
| ✅ Passed | 2 |
| ⚠️ Warned | 1 |
| ❌ Failed | 0 |
| Pass Rate | 66.7% |

## Cost

| Metric | Value |
|:-------|:------|
| API Calls | 4 |
| Token-calculated API Cost | $0.088971 |
| Input Tokens | 42,573 |
| Cached Input Tokens | 15,410 |
| Output Tokens | 10,850 |
| Reasoning Tokens | 3,483 |
| Budget | $1.00 |

## ⚠️ Warnings (Review Recommended)

### sales_strong_foundation_mark_sherrod_1

**Status:** WARN
**Score:** 81 (expected: 80–88)

**Warnings:**
- `W_SUMMARY_STRUCTURE`: Summary has 6 sentences (expected 3-5)

## Report Integrity

What a customer reads, measured on each validated report. These checks are reported, not gated; the status counts above are unchanged. **Model** is the report as generated. **Shown** is the report after the deterministic post-generation pass that the web report and PDF both apply.

| Check | Model | Shown |
|:------|:------|:------|
| Reports with a rewrite | 0 of 3 (0 rewrites) | same |
| Keep/fix collisions on one line | 1 in 1 report | 0 |
| Critical Miss line also in Keep | 0 reports | 0 reports |
| Repeated observations | 23 | 0 |
| Field-slot mapping issues | 0 | 0 |
| Critical Miss is a line edit / structural | 2 / 1 (employment gap 1) | same |
| Nothing critical (Critical Miss marked low impact) | 0 reports | same |
| Model's first fix dropped by validation | 0 reports | same |
| Structural issue flagged, Critical Miss is a line edit | 0 reports | same |
| Verdict and Critical Miss disagree | 0 reports | same |
| Verdict raises no concern | 0 reports | same |
| Fix headings over 12 words | 0 of 8 (longest 10 words) | same |
| Fix headings that open with a location / carry a condition | 0 / 0 | same |

| Fixture | Score | Rewrites | Keep/fix | Repeats | Slot issues | Critical Miss | Verdict and Critical Miss |
|:--------|:------|:---------|:---------|:--------|:------------|:--------------|:--------------------------|
| talent_leader_high_bar_matt_shaw_current_1 | 85 | 0 | 0 → 0 | 6 → 0 | 0 → 0 | line edit | agree |
| finance_controller_strong_foundation_1 | 68 | 0 | 1 → 0 | 8 → 0 | 0 → 0 | line edit | agree |
| sales_strong_foundation_mark_sherrod_1 | 81 | 0 | 0 → 0 | 9 → 0 | 0 → 0 | structural (employment gap); flagged: employment gap | agree |

## Score Test-Retest

Each fixture was generated once, so test-retest was not measured. Use `--repeat <n>`, or replay several saved runs of the same fixtures together.

## ✅ Passed

2 fixtures passed all checks.

<details>
<summary>Expand to see fixture IDs</summary>

- talent_leader_high_bar_matt_shaw_current_1 (score: 85)
- finance_controller_strong_foundation_1 (score: 68)
</details>
