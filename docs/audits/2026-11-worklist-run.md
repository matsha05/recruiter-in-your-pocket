# The worklist prompt on the live set, November 6, 2026

The measurement behind the worklist report's first PR (the prompt, its contract and its validator, behind `RIYP_WORKLIST_REPORT`). The shape is the one Matt chose on November 5 (`docs/design/2026-11-worklist-report/`): score and rung, the recruiter's write-up, then one card per line that needs work, in the order a recruiter hits them. No Critical Miss. The prompt is `web/prompts/resume_v3.txt`; `resume_v2.txt` is untouched and still writes the report when the flag is off.

Files: `2026-11-worklist-run/manifest.json` (the live-judgment set by reference, plus two employer-tier resumes from the November 5 blind pick), `tools/run-worklist.ts` (the runner; same path as the route: provider messages, the worklist validator, one repair, the severity check when on), `outputs/` (pass 3, the shipped prompt), `outputs/pass1-b2c0d186/` and `outputs/pass2-05f0ed39/` (the two earlier prompts, kept so the changes can be read), `replay-pass3.json` and `outputs/pass2-05f0ed39/replay-pass2-current-validator.json` (the saved drafts replayed through the final validator with no model call). Every resume is synthetic.

## What ran, in order

| Pass | Prompt | Runs | Shipped | Repaired | Never shipped | What changed after it |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `b2c0d186` | 48 (6 holes, 40 breadth, 2 refused before the call) | 47 | 13 (27%) | 0 | Every repair was a retired phrase, 12 of them "the read" written in passing. Scores on labeled bad resumes ran 74 to 76 ("Mostly clear"). The severity check added a card on 1 of 47 reports. |
| 2 | `05f0ed39` | 50 (holes, breadth, 2 tier) | 49 | 11 (22%) | 0 | Still "the read". The rung rule ("each structural problem holds the page to Needs more context") over-corrected: the entry-level PM golden fixture fell to 69 against an 82 to 92 range. |
| 3 | `18e7e9ff` | 50 | 49 | 1 (2%) | 0 | The validator rewrites "the read" to "the first pass" instead of refusing; the rung rule became "costs a rung, never Clear and specific"; the example must read as a finished bullet. |
| 4 | `705c2997` (shipped) | 10 (holes, tier) + golden 10 | 9 + 10 | 0 | 0 | After the surface's outside critique: blanks are short nouns ("[number]", "[tool]"), never "specific" or a suggested answer; a dates example starts with the page's own last date; one example per undated role; the keep note says what to copy in words the write-up didn't use; "verify", "size it" and the product's own words ("rung", "get you read") stay out of the person's report. |

Replaying pass 2's 49 drafts through the final validator: 48 ship as the first draft, 1 after repair, 0 never ship. The same for pass 3. The one pass-3 repair is "the open question is" in a write-up; the validator refused it and the repair shipped.

## Pass 4, the shipped prompt (`705c2997`)

The critique ran on the surface built on pass 3's prompt; the prompt changes it asked for are copy, not judgment, so pass 4 re-ran the holes, the tier cases and the synthetic golden set rather than the whole breadth set. Holes and tier: 9 reports of 9 that reached the model, 0 repairs, scores within two points of pass 3 on every case but the academic CV (74 to 79); the bad resume's three dates cards now read "June 2023 - Present [work, study, job search, caregiving, travel or career break]" and one "[Month Year] - [Month Year] Warehouse Associate, Miami Valley Distribution" per undated role; the lift fired on the Google engineer again (75) and declared itself without "get you read". Golden synthetic: 6 PASS, 4 WARN, 0 FAIL (the same score drifts as pass 3, plus one card whose example has no blank). The sample (`public/sample-report.json`) is generated on this prompt. Pass 3's full breadth set stays in `outputs/pass3-18e7e9ff/` as the record of the larger measurement; the pass 4 outputs are in `outputs/`.

## The prompt on the live set (pass 3, `18e7e9ff`, the full set)

- 49 reports; 1 request refused before any call (the 15-page CV, as production refuses it).
- Cards per report: mean 4.1, median 4, from 1 (the strong pages, a single keep card) to 12 (the bad resume, the cap).
- Kinds across the 49: 137 line, 13 structure, 10 dates, 43 keep. 43 of 49 reports carry a keep card; 9 carry a dates card; 13 a structure card.
- Every write-up is two paragraphs, 76 words on average.
- Bands: 18 Needs more context, 15 Mostly clear, 16 Clear and specific. One page sits on the bottom rung (`h1_bad_resume`, 46; nothing else scored at or below 60; the labeled bad count-check resumes scored 55 to 64 in their own run).
- Against the November 5 production run (`resume_v2`, calibrated scores) on the 41 shared cases: mean change +1.6, 27 up, 11 down. The strong pages moved up (the strong PM 89 to 96); the pages with time nobody accounts for moved down (the layoff gap 82 to 69, the "unrelated current job" designer 80 to 68).
- The employer lift (brief decision 5) fired once in 50, on the Google engineer from the blind pick (bp5-04): 70, "Mostly clear", with the write-up saying "The Google line will get you read and lifts this resume one rung, but the bullets don't yet say which features you worked on." The operations leader with Google and Dell in older roles (bp5-10) was not lifted: 68.
- The mismatched posting (data analyst against a nursing role): 89 for the page, with the write-up opening on the mismatch and the fit note listing the posting's six requirements the page doesn't show.

## The severity check, both ways

The brief asked whether the second call stays or folds in. With the check on (passes 1 and 2, 96 shipped reports), it added a card to 1 report (`b36_product_designer_unrelated`, a `no_recent_work` item) and skipped the rest as already carded or as promotions the worklist has nowhere to put. The worklist prompt writes the structural cards itself: 23 of the 49 pass-3 reports carry a dates or structure card. So the check is off for worklist reports unless `RIYP_SEVERITY_CHECK=1` says otherwise (`isSeverityCheckEnabledForWorklist`), and the merge path (`web/lib/reports/worklist-severity.ts`) stays in the tree for the measurement. The v2 report keeps its default.

## The golden and count-check sets

| Run | Fixtures | Result | Cost |
| --- | --- | --- | --- |
| Golden, synthetic 10, shipped prompt | 10 | 4 PASS, 6 WARN, 0 FAIL | $0.13 |
| Count-check (bulk tier), shipped prompt | 12 | 11 PASS, 1 WARN (`W_SPECIFICITY_LOW`, a card whose example has no blank), 0 FAIL | $0.08 |

The six golden warnings are five `W_SCORE_DRIFT` and one `W_MECHANICAL_COPY`. The drifts are the product changes, not noise: the weak fixtures (44 to 53) now land on the fourth rung Matt asked for on November 5, where the v2 expected ranges start at 55; the mid-career engineer whose caregiving break ends in April 2024 (69) and the entry-level PM whose last role ended in August 2023 (74) read, with today's date in the prompt, as pages with time nobody accounts for, which the v2 prompt never saw because it was never told the date. The expected ranges in `tests/fixtures/calibration.json` are v2's; they are left as written so the drift stays visible until Matt reads the five reports. The smoke tier holds three real people's resumes, so it was not sent to the model; the synthetic golden set stands in for it, as the October 30 proof did.

## Spend

| What | Cost |
| --- | --- |
| Runner passes 1 to 4 (holes, breadth, tier), by the runner's ledgers | $1.51 |
| Eval harness runs (first look, three golden synthetic, two count-check, one golden on pass 2) | $0.86 |
| The sample, generated twice | $0.02 |
| Total | $2.39 of the $12 planned for this wave; stop line $15 |

Remaining on the November 5 cap after this run: about $41.32.

## Not measured here

- The judge in `web/lib/evals/judge/` compares Critical Misses and was not run; the worklist's judge question is drafted in `docs/evals/worklist-rubric.md`.
- Matt's read of five reports (a bad, a thin, a strong, a mismatch and a top-tier-employer case) decides whether the prompt ships to everyone; the candidates are `h1_bad_resume`, `h2_thin_resume`, `h3_strong_resume`, `h5_mismatched_posting` and `t1_google_engineer_maya` in `outputs/`.
- Variance across repeats (brief decision 17): one run per case here. The pass-2 and pass-3 runs of the same cases on near-identical prompts put the same lines on cards in most reports, but that is two prompts, not two draws.

## How to rerun

From `web/`, with only the OpenAI key in `.env.local`:

```
RIYP_ALLOW_PAID_EVALS=true RIYP_WORKLIST_REPORT=1 node ../docs/audits/2026-11-worklist-run/tools/run-worklist.cjs --manifest ../docs/audits/2026-11-worklist-run/manifest.json --batch holes --runs 1 --budget-usd 2 --today 2026-11-05
RIYP_ALLOW_PAID_EVALS=true RIYP_WORKLIST_REPORT=1 npm run eval:golden -- --filter synth --budget-usd 15 --output-label worklist_v3_golden_synthetic
RIYP_ALLOW_PAID_EVALS=true RIYP_WORKLIST_REPORT=1 npm run eval:bulk -- --filter count_check --budget-usd 15 --output-label worklist_v3_count_check
node scripts/run-ts-test.cjs scripts/replay-live-judgment.ts --dir ../docs/audits/2026-11-worklist-run --out ../docs/audits/2026-11-worklist-run/replay.json
```

The replay costs nothing and re-validates every saved draft under the current validator, so a validator change can be measured on these drafts without a model call.
