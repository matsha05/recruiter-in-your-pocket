# GPT-5 Model Bake-Off - July 28, 2026

**Status:** Complete
**Production model changed:** Yes, in the release candidate
**Decision:** GPT-5.6 Luna cleared the candidate-bound launch proof and is approved for production promotion.

## Bounds and Method

- Models: pinned `gpt-5-nano-2025-08-07`, `gpt-5.6-luna`, and `gpt-5.6-terra`
- Corpus: all 23 current golden fixtures, including strong anchors, thin resumes, weak resumes, nontraditional careers, and frontline work
- Prompt and schema: identical deployed `resume_v2` prompt and response contract for every model
- Reasoning: `low` for every model
- Full-run completion ceiling: 8,000 tokens per call
- Concurrency: 3
- Paid-eval authorization: explicit
- Aggregate authorized ceiling: $10.00
- Actual spend, including three probes and one Nano completion-control rerun: **$1.31150330**
- Production configuration and prompt files were not changed

The longest-resume compatibility probe used about 8.1K input tokens for each model, below the harness's 20K input reservation. No LLM judge was used; the comparison used production validation, deterministic grounding and quality checks, calibrated score ranges, and a manual review of six diverse outputs.

## Results

| Model | PASS | WARN | FAIL | Full-run cost | Median fixture latency | P95 fixture latency | Mean distance outside expected score range |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| GPT-5 nano | 12 | 10 | 1 | $0.021318 | 12.2s | 25.4s | 3.26 points |
| GPT-5.6 Luna | 12 | 11 | 0 | $0.319732 | 13.8s | 15.2s | 1.09 points |
| GPT-5.6 Terra | 9 | 11 | 3 | $0.891766 | 21.8s | 25.3s | 3.13 points |

Nano's table replaces one 8K `finish_reason=length` result with the successful 24K production-ceiling control result. The control passed with a score of 86 and cost $0.000894. Nano's remaining blocking failure was a severe score miss on the current talent-leader anchor.

### Blocking failures

- GPT-5 nano: one `E_SCORE_EXTREME` on the current talent-leader anchor, scoring 55 against an expected 84-92.
- GPT-5.6 Luna: none.
- GPT-5.6 Terra: three `E_SCORE_EXTREME` results on the finance-controller, DevOps, and ministry-leader cases.
- No model produced a grounding, invented-specific, source-drift, or banned-phrase blocking failure in the full comparison.

### Output usefulness

| Model | Average top fixes | Average rewrites | Average summary words |
| --- | ---: | ---: | ---: |
| GPT-5 nano | 1.09 | 0.17 | 56.7 |
| GPT-5.6 Luna | 2.91 | 2.09 | 74.8 |
| GPT-5.6 Terra | 2.78 | 2.30 | 81.7 |

Nano's lower warning count is not evidence of richer quality. It frequently returned only one generic fix and no rewrite, leaving fewer opportunities for the automated checks to flag specificity problems. Luna consistently returned a fuller, more useful report while staying grounded.

## Manual Spot Check

The manual review covered the current talent leader, finance-not-ready CPA, thin-signal corporate counsel, ministry leader, frontline retail candidate, and entry-level product manager.

- Luna best preserved role level and surfaced the candidate's strongest verified signals.
- Luna's fixes were generally tied to a specific source bullet and named the missing scope or outcome.
- Nano was materially more generic and under-read the strongest senior candidate.
- Terra produced polished prose but systematically under-scored several credible candidates and was the slowest and most expensive option.

## Final launch proof

The refined Luna production candidate completed the full 23-fixture golden corpus as run `eval_1785271781375`: 22 PASS, 1 WARN, 0 FAIL at a token-calculated cost of $0.287278. The 95.7% pass rate clears the 90% launch bar. The sole warning was non-blocking score variance; all copy, grounding, schema, specificity, and safety checks passed.

The bundled readiness evidence now binds `gpt-5.6-luna` to the exact resume and resume-ideas prompt hashes used in that run.

## Recommendation

Promote `gpt-5.6-luna` to production.

Completed promotion prerequisites:

1. Ran the full launch-quality proof with Luna at the intended production 24K completion ceiling and unchanged prompt hashes.
2. Confirmed zero blocking failures and reviewed thin, strong, nontraditional, and frontline reports.
3. Updated bundled live-eval evidence to bind the exact Luna model string and both prompt hashes.
4. Authorized production promotion only after the proof cleared the launch bar.

Terra should not advance. Nano remains the rollback-safe control if Luna requires an operational rollback after promotion.
