# PromptOps Live Eval Report

**Run ID:** eval_1793640242308_replay_severity_2026-11-02T18-28-35-187Z
**Timestamp:** 2026-11-02T18:28:35.205Z
**Tier:** smoke
**Prompt Version:** v1
**Contract Version:** v2
**Execution Mode:** Live model evaluation
**Model:** gpt-6.1-terra
**Reasoning effort:** medium
**Resume prompt SHA-256:** 83b2a2d1f9cde086ebb28fc2e0596ed7c58e6c4f905c4f57fe56cc86e9665107
**Resume ideas prompt SHA-256:** 6d90925e63aae15476712f92af5ffbdf4e684feec413711e14d6dba7201b6fc7
**Incomplete-response retry:** high reasoning
**Validation Mode:** Saved output replay through current candidate
**Validation Timestamp:** 2026-11-02T18:14:14.388Z
**Source run SHA-256:** d56ade72cb27921e826eb1ae1eeb4aa402863c4d1cf5e49712753eecd701f95a

## Summary

| Metric | Value |
|:-------|:------|
| Total Fixtures | 3 |
| ✅ Passed | 3 |
| ⚠️ Warned | 0 |
| ❌ Failed | 0 |
| Pass Rate | 100.0% |

## Cost

| Metric | Value |
|:-------|:------|
| API Calls | 3 |
| Token-calculated API Cost | $0.002931 |
| Input Tokens | 27,063 |
| Cached Input Tokens | 13,606 |
| Output Tokens | 6,988 |
| Reasoning Tokens | 1,119 |
| Budget | $1.00 |

## Report Integrity

What a customer reads, measured on each validated report. These checks are reported, not gated; the status counts above are unchanged. **Model** is the report as generated. **Shown** is the report after the deterministic post-generation pass that the web report and PDF both apply.

| Check | Model | Shown |
|:------|:------|:------|
| Reports with a rewrite | 0 of 3 (0 rewrites) | same |
| Keep/fix collisions on one line | 0 in 0 reports | 0 |
| Critical Miss line also in Keep | 0 reports | 0 reports |
| Repeated observations | 25 | 0 |
| Field-slot mapping issues | 0 | 0 |
| Critical Miss is a line edit / structural | 3 / 0 | same |
| Nothing critical (Critical Miss marked low impact) | 0 reports | same |
| Model's first fix dropped by validation | 0 reports | same |
| Reports with 1 / 2 / 3 Critical Misses | 2 / 1 / 0 | same |
| Reports saying more than three exist | 0 | same |
| Critical Misses by kind | other 1, concrete fact 3 (of 4) | same |
| Structural issue flagged, Critical Miss is a line edit | 2 reports | same |
| Verdict and Critical Miss disagree | 0 reports | same |
| Verdict raises no concern | 2 reports | same |
| Fix headings over 12 words | 8 of 9 (longest 26 words) | same |
| Fix headings that open with a location / carry a condition | 7 / 1 | same |

| Fixture | Score | Rewrites | Keep/fix | Repeats | Slot issues | Critical Miss | Verdict and Critical Miss |
|:--------|:------|:---------|:---------|:--------|:------------|:--------------|:--------------------------|
| talent_leader_high_bar_matt_shaw_current_1 | 84 | 0 | 0 → 0 | 8 → 0 | 0 → 0 | line edit; flagged: employment gap (outranked) | no concern |
| finance_controller_strong_foundation_1 | 76 | 0 | 0 → 0 | 9 → 0 | 0 → 0 | line edit | agree |
| sales_strong_foundation_mark_sherrod_1 | 82 | 0 | 0 → 0 | 8 → 0 | 0 → 0 | line edit; flagged: employment gap (outranked) | no concern |

<details>
<summary>Integrity details</summary>

- **talent_leader_high_bar_matt_shaw_current_1**: The Verdict raises no concern, yet the report still names a Critical Miss.
- **finance_controller_strong_foundation_1**: The biggest-gap example quotes fix 2's line.
- **sales_strong_foundation_mark_sherrod_1**: The Verdict raises no concern, yet the report still names a Critical Miss.
</details>

## Score Test-Retest

Each fixture was generated once, so test-retest was not measured. Use `--repeat <n>`, or replay several saved runs of the same fixtures together.

## ✅ Passed

3 fixtures passed all checks.

<details>
<summary>Expand to see fixture IDs</summary>

- talent_leader_high_bar_matt_shaw_current_1 (score: 84)
- finance_controller_strong_foundation_1 (score: 76)
- sales_strong_foundation_mark_sherrod_1 (score: 82)
</details>


## Severity check

- Prompt: `severity_check_v1:f1bb4571` (SHA-256 `f1bb4571f3f4cfbf8ed82e78193d543448789f076fec95cb6e79a19f1bc19c90`), model `gpt-6.1-terra`, today 2026-11-02, mode live
- Source run: `eval_1793640242308_replay` (SHA-256 `d56ade72cb27921e826eb1ae1eeb4aa402863c4d1cf5e49712753eecd701f95a`)
- Reports checked: 3; outcomes {"none":2,"added":1}; reasons {"none":2,"added":1}
- Critical Misses per report: {"1":2,"2":1}; more than three: 0
- Latency (call plus validation), ms: mean 12094, p50 3390, p90 30333, max 30333; the call alone: mean 3937, p90 5960
- Cost: $0.00293105 in 3 calls (token-calculated)

| Fixture | Status | Outcome | Critical Misses | Added | Latency ms | Added or promoted |
| --- | --- | --- | --- | --- | --- | --- |
| talent_leader_high_bar_matt_shaw_current_1 | PASS | none (none) | 1 |  | 3390 |  |
| finance_controller_strong_foundation_1 | PASS | none (none) | 1 |  | 2559 |  |
| sales_strong_foundation_mark_sherrod_1 | PASS | added (added) | 2 | no_recent_work | 30333 | Add one dated line covering Oct. 2023 to today. |
