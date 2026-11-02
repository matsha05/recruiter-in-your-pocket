# PromptOps Live Eval Report

**Run ID:** eval_1793640409975_replay_severity_2026-11-02T18-20-37-527Z
**Timestamp:** 2026-11-02T18:20:37.530Z
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
**Validation Timestamp:** 2026-11-02T18:13:10.758Z
**Source run SHA-256:** c09a872dc6f890d66559dcc0eb08ee3aef44ba4625401d1b18858fecc3e17177

## Summary

| Metric | Value |
|:-------|:------|
| Total Fixtures | 1 |
| ✅ Passed | 1 |
| ⚠️ Warned | 0 |
| ❌ Failed | 0 |
| Pass Rate | 100.0% |

## Cost

| Metric | Value |
|:-------|:------|
| API Calls | 1 |
| Token-calculated API Cost | $0.003862 |
| Input Tokens | 257,956 |
| Cached Input Tokens | 197,129 |
| Output Tokens | 68,359 |
| Reasoning Tokens | 14,708 |
| Budget | $3.00 |

## Report Integrity

What a customer reads, measured on each validated report. These checks are reported, not gated; the status counts above are unchanged. **Model** is the report as generated. **Shown** is the report after the deterministic post-generation pass that the web report and PDF both apply.

| Check | Model | Shown |
|:------|:------|:------|
| Reports with a rewrite | 0 of 1 (0 rewrites) | same |
| Keep/fix collisions on one line | 1 in 1 report | 0 |
| Critical Miss line also in Keep | 0 reports | 0 reports |
| Repeated observations | 6 | 0 |
| Field-slot mapping issues | 0 | 0 |
| Critical Miss is a line edit / structural | 1 / 0 | same |
| Nothing critical (Critical Miss marked low impact) | 0 reports | same |
| Model's first fix dropped by validation | 0 reports | same |
| Reports with 1 / 2 / 3 Critical Misses | 1 / 0 / 0 | same |
| Reports saying more than three exist | 0 | same |
| Critical Misses by kind | concrete fact 1 (of 1) | same |
| Structural issue flagged, Critical Miss is a line edit | 1 report | same |
| Verdict and Critical Miss disagree | 0 reports | same |
| Verdict raises no concern | 0 reports | same |
| Fix headings over 12 words | 3 of 3 (longest 21 words) | same |
| Fix headings that open with a location / carry a condition | 3 / 1 | same |

| Fixture | Score | Rewrites | Keep/fix | Repeats | Slot issues | Critical Miss | Verdict and Critical Miss |
|:--------|:------|:---------|:---------|:--------|:------------|:--------------|:--------------------------|
| synth_hr_manager_director_foundation_1 | 61 | 0 | 1 → 0 | 6 → 0 | 0 → 0 | line edit; flagged: employment gap (outranked) | agree |

<details>
<summary>Integrity details</summary>

- **synth_hr_manager_director_foundation_1**: The biggest-gap example quotes fix 2's line.
</details>

## Score Test-Retest

Each fixture was generated once, so test-retest was not measured. Use `--repeat <n>`, or replay several saved runs of the same fixtures together.

## ✅ Passed

1 fixtures passed all checks.

<details>
<summary>Expand to see fixture IDs</summary>

- synth_hr_manager_director_foundation_1 (score: 61)
</details>


## Severity check

- Prompt: `severity_check_v1:f1bb4571` (SHA-256 `f1bb4571f3f4cfbf8ed82e78193d543448789f076fec95cb6e79a19f1bc19c90`), model `gpt-6.1-terra`, today 2026-11-02, mode live
- Source run: `eval_1793640409975_replay` (SHA-256 `c09a872dc6f890d66559dcc0eb08ee3aef44ba4625401d1b18858fecc3e17177`)
- Reports checked: 1; outcomes {"fallback":1}; reasons {"validation":1}
- Critical Misses per report: {"1":1}; more than three: 0
- Latency (call plus validation), ms: mean 24712, p50 24712, p90 24712, max 24712; the call alone: mean 11114, p90 11114
- Cost: $0.00386205 in 1 calls (token-calculated)

| Fixture | Status | Outcome | Critical Misses | Added | Latency ms | Added or promoted |
| --- | --- | --- | --- | --- | --- | --- |
| synth_hr_manager_director_foundation_1 | PASS | fallback (validation) | 1 |  | 24712 |  |
