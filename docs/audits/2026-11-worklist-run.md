# The worklist prompt on the live set, November 6, 2026

The measurement behind the worklist report's first PR (the prompt, its contract and its validator, behind `RIYP_WORKLIST_REPORT`). The shape is the one Matt chose on November 5 (`docs/design/2026-11-worklist-report/`): score and rung, the recruiter's write-up, then one card per line that needs work, in the order a recruiter hits them. No Critical Miss. The prompt is `web/prompts/resume_v3.txt`; `resume_v2.txt` is untouched and still writes the report when the flag is off.

Files: `2026-11-worklist-run/manifest.json` (the live-judgment set by reference, plus two employer-tier resumes from the November 5 blind pick), `tools/run-worklist.ts` (the runner; same path as the route: provider messages, the worklist validator, one repair, the severity check when on), `outputs/` (the shipped prompt's run: pass 8, `0a19c3ee`, since November 6), `outputs/pass1-b2c0d186/` to `outputs/pass7-6eb03ddb/` (the earlier prompts, kept so the changes can be read), `replay-pass3.json` and `outputs/pass2-05f0ed39/replay-pass2-current-validator.json` (the saved drafts replayed through the final validator with no model call). Every resume is synthetic.

## What ran, in order

| Pass | Prompt | Runs | Shipped | Repaired | Never shipped | What changed after it |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `b2c0d186` | 48 (6 holes, 40 breadth, 2 refused before the call) | 47 | 13 (27%) | 0 | Every repair was a retired phrase, 12 of them "the read" written in passing. Scores on labeled bad resumes ran 74 to 76 ("Mostly clear"). The severity check added a card on 1 of 47 reports. |
| 2 | `05f0ed39` | 50 (holes, breadth, 2 tier) | 49 | 11 (22%) | 0 | Still "the read". The rung rule ("each structural problem holds the page to Needs more context") over-corrected: the entry-level PM golden fixture fell to 69 against an 82 to 92 range. |
| 3 | `18e7e9ff` | 50 | 49 | 1 (2%) | 0 | The validator rewrites "the read" to "the first pass" instead of refusing; the rung rule became "costs a rung, never Clear and specific"; the example must read as a finished bullet. |
| 4 | `705c2997` | 10 (holes, tier) + golden 10 | 9 + 10 | 0 | 0 | After the surface's outside critique: blanks are short nouns ("[number]", "[tool]"), never "specific" or a suggested answer; a dates example starts with the page's own last date; one example per undated role; the keep note says what to copy in words the write-up didn't use; "verify", "size it" and the product's own words ("rung", "get you read") stay out of the person's report. |
| 5 | `70e795a1` | 49 (holes, tier, breadth) + golden 10 | 49 | 1 | 0 | The fifth band, Ready to send (pass 5 below). |
| 6 | `f4ff18ca` | 49 + golden 10 | 49 | 1 | 0 | Matt's voice (pass 6 to 8 below). The model copied the example lines: 19 reports said "pretty common", 18 "won't stand out in a pile", 7 recited the sabbatical rule to the person. |
| 7 | `6eb03ddb` | 49 + golden 10 | 49 | 1 | 0 | The copying fixed. Matt read the five: "there's not enough zooming out about what makes the best resumes great and weak ones weak and personalized to each person's resume. like whats the story and the overall takeaway". |
| 8 | `0a19c3ee` (shipped) | 49 + golden 10 | 49 | 0 | 0 | The write-up zooms out first: the story, then the one takeaway for the whole resume. Matt: "Ship it". |

Replaying pass 2's 49 drafts through the final validator: 48 ship as the first draft, 1 after repair, 0 never ship. The same for pass 3. The one pass-3 repair is "the open question is" in a write-up; the validator refused it and the repair shipped.

## Pass 4, the shipped prompt (`705c2997`)

The critique ran on the surface built on pass 3's prompt; the prompt changes it asked for are copy, not judgment, so pass 4 re-ran the holes, the tier cases and the synthetic golden set rather than the whole breadth set. Holes and tier: 9 reports of 9 that reached the model, 0 repairs, scores within two points of pass 3 on every case but the academic CV (74 to 79); the bad resume's three dates cards now read "June 2023 - Present [work, study, job search, caregiving, travel or career break]" and one "[Month Year] - [Month Year] Warehouse Associate, Miami Valley Distribution" per undated role; the lift fired on the Google engineer again (75) and declared itself without "get you read". Golden synthetic: 6 PASS, 4 WARN, 0 FAIL (the same score drifts as pass 3, plus one card whose example has no blank). The sample (`public/sample-report.json`) is generated on this prompt. Pass 3's full breadth set stays in `outputs/pass3-18e7e9ff/` as the record of the larger measurement; the pass 4 outputs are in `outputs/`.

## Pass 5, the fifth band (`70e795a1`, November 6)

Matt: "maybe we should have a higher 5th band. this needs to be brilliant and verifiably good." The proposal and his yes are in `docs/promptops/proposals/2026-11-fifth-band.md`: "Ready to send" at 93 to 99, earned only when no line needs work; "Clear and specific" narrows to 85 to 92; a page with nothing to fix never sits below 90; the employer lift never reaches the top band. The prompt carries the anchors and the rule; the validator refuses a draft that breaks it and repairs once; the band bar, the PDF, the methodology page and the copy system carry five bands. v2 reports keep their four.

The full set reran (holes, tier, breadth: 49 reports of 49 that reached the model, the 15-page CV refused as production refuses it), $0.40.

| | Pass 4 (`705c2997`) | Pass 5 (`70e795a1`) |
| --- | --- | --- |
| Shipped / repaired / never shipped | 49 / 0 (holes and tier) | 49 / 1 / 0 |
| Score 60 and below | 1 | 3 (the bad resume 42, the recent-grad bad page 55, the bad marketing director 60) |
| 61 to 69 | 17 | 16 |
| 70 to 84 | 15 | 14 |
| 85 to 92 | 6 (85 to 89) | 14 |
| 93 to 99 ("Ready to send") | 10 (90 and above) | 2: the strong PM (96) and the FP&A analyst (95), both with nothing to fix |
| Pages with nothing to fix | 8, from 85 to 95 | 4, from 90 to 96 |

The rule held on every shipped report: no page at 93 or above has a line to fix, no page with nothing to fix sits under 90, and the one lifted page (the Google engineer, 72) is nowhere near the top. The one repair was the one-paragraph paste: the first draft scored a clean page 85, the validator refused it under the floor, and the repair shipped it at 90. Against pass 4 on the same 49 cases the mean change is -0.9 (13 up, 27 down, 9 unchanged); three cases moved five or more: the academic CV under the cap 79 to 68 with the same two cards (the one move this run can't explain by the rule), the recent-grad bad page 62 to 55, and the one-paragraph paste 85 to 90 by the floor. The sample (`public/sample-report.json`) is regenerated on this prompt (75, six lines to fix); the homepage and methodology clippings are requoted from it.

Golden synthetic on this prompt: 7 PASS, 3 WARN (`W_SCORE_DRIFT` on the mid-career engineer, the foundation sales executive and the entry operations manager, the same drifts recorded for passes 3 and 4), 0 FAIL, $0.26. Spend for the pass: $0.67 (the rerun $0.40, golden $0.26, the sample $0.01); the wave's total is $3.06 of the $12 planned.


## Passes 6 to 8, Matt's voice (`0a19c3ee`, November 6)

On November 6 Matt settled the house voice (`docs/copy-system.md` §1, `docs/voice-and-tone.md` "Matt in his own words", his fourteen answers in `docs/copy/calibration/matt-voice-2026-11-06.md`) and said yes to the report's prompt following it. What changed in `web/prompts/resume_v3.txt`, and what did not:

- **How you write**, rebuilt from the voice chart: warm and a little bit coach, high EQ and high IQ, friendly and cool; the problem first, then the way out walked with them ("Let's start with the most recent one."); "we" is the person and us; big praise only with its reason; at most one exclamation point in a report, only on a real win, never in a critique; acknowledge the situation, never diagnose a feeling; no slang. Six of Matt's own lines (answers 1 to 5 and 10, without the slang) join "Lines that sound right", which now says never to copy one word for word.
- **The write-up** zooms out before it zooms in (Matt's read of pass 7): the story a recruiter would retell, in the person's own roles and employers, then the one takeaway for the whole resume (what a strong one does that a typical resume in the field doesn't, or the pattern holding a weak one back), then the model line, then the way forward. A weak resume hears that it's common before the problem; a strong one hears the praise and its reason first and, when it's true, that the resume isn't what stands between them and a call back, with what else does (a referral, how competitive the job is, a stepping-stone role). No statistics, no promise of interviews or responses.
- **Gaps** (Matt, November 6, question UI: "career break sabbatical only if true"): the note offers caregiving named plainly, a career break with what they did in it, freelance work only when real; a sabbatical only when the resume shows chosen time off; never a label the time didn't have.
- **"The page"** joins the words the person never sees for their resume; the prompt's own uses of "the page" and "rung" in its instructions became "the resume" and "band".
- **Untouched:** the JSON schema, the five grounding principles, every band's threshold and anchor, the Ready to send rule, the employer rule (byte for byte), and every other prompt. The validator is unchanged.

Each pass ran the full live set (holes, tier, breadth: 49 reports of 49 that reached the model; the 15-page CV refused as production refuses it) and the 10 synthetic golden fixtures, on `--today 2026-11-05` like pass 5.

| | Pass 5 (`70e795a1`) | Pass 6 (`f4ff18ca`) | Pass 7 (`6eb03ddb`) | Pass 8 (`0a19c3ee`, shipped) |
| --- | --- | --- | --- | --- |
| Shipped / repaired / never shipped | 49 / 1 / 0 | 49 / 1 / 0 | 49 / 1 / 0 | 49 / 0 / 0 |
| Mean score (change against pass 5) | 76.3 | 76.4 | 76.6 | 76.0 (-0.3; 15 up, 20 down) |
| Bands: Not ready yet / Needs more context / Mostly clear / Clear and specific / Ready to send | 3 / 16 / 14 / 14 / 2 | 5 / 13 / 15 / 14 / 2 | 4 / 13 / 16 / 14 / 2 | 3 / 14 / 19 / 12 / 1 |
| Band-rule violations after validation | 0 | 0 | 0 | 0 |
| Lines to fix per report (mean) | 3.53 | 3.53 | 3.49 | 3.59 |
| Write-up words (mean) | 77 | 85 | 89 | 127 |
| "the page" / "this page" / "rung" in a report | 9 / 1 / 1 (8 reports) | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 |
| Reports with an exclamation point | 0 | 0 | 14 | 12 |
| ...on a page below Clear and specific, in a critique, or more than one | | | 0 | 0 |
| Reports saying the resume's problem is common | 0 | 19 (all "pretty common", copied) | 18 (varied) | 17 (varied) |
| Reports with "Let's" walking the next step | 0 | 24 | 28 | 34 |
| The sabbatical rule recited to the person | | 7 | 0 | 0 |
| "Don't worry", slang, em dashes, "the read" | 0 | 0 | 0 | 0 |
| Golden synthetic (PASS / WARN / FAIL) | 7 / 3 / 0 | 5 / 5 / 0 | 7 / 3 / 0 | 6 / 4 / 0 |

The counts are a regex over the shipped reports' verdict, write-up, notes, questions and fit note (`'the page'`, `'!'`, `'common'` and so on), so they are this run's own view; Matt's read is the judgment. Pass 8's golden warnings are the drifts recorded for passes 3 to 5 (three weak fixtures at 44 to 47 against v2's 55 to 68; the entry-level PM at 74 against 82 to 92, the dated read pass 4 recorded), one repeated clause and one example with no blank. Scores moved five or more on five cases against pass 5, both ways and with the same cards: the IT support grad 64 to 59, the office manager 88 to 82, the bank branch manager with a gap 68 to 76, the academic CV under the cap 68 to 76 (the case that moved 79 to 68 in pass 5), the one-paragraph paste 90 to 82 (the floor repair no longer needed: the page now carries a line to fix). One run per case, so a single-case move is within what one draw can do; the mean, the bands and the rule held. Only one page has nothing to fix in pass 8 (the strong PM, 97), against four in pass 5; the FP&A analyst (95 in pass 5) now carries one line, about how the price modeling fed the review, at 91.

Matt read the five (`h1_bad_resume`, `h2_thin_resume`, `h3_strong_resume`, `h5_mismatched_posting`, `t1_google_engineer_maya`) in the Report Lab on a dev server, each beside its pass 5 version (the `-before` fixtures). On pass 7 he asked for the zoom-out; on pass 8 he said "Ship it". The sample (`public/sample-report.json`) is regenerated on `0a19c3ee` (76, six lines to fix) and the homepage, methodology and social-image clippings are requoted from it.

Receipts: `outputs/` (pass 8), `outputs/pass6-f4ff18ca/`, `outputs/pass7-6eb03ddb/`, `outputs/pass5-70e795a1/` (the runs and their ledgers), and `tests/fixtures/results/summary_worklist_v3_voice_golden_synthetic_p6.md`, `_p7.md`, `_p8.md` (golden).

Spend for passes 6 to 8: $1.62 (runner $1.22, golden $0.38, the sample twice $0.02), synthetic resumes only, `RIYP_ALLOW_PAID_EVALS=true` on each run. About $39.03 of the $50 cap remains.

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
