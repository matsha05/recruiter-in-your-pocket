# The score on a second read of the same page

November 13, 2026.

## What was seen

On production, one resume was read against one posting four times across November 12 and 13: 82, 82, 82, 86. Nothing on the resume or the posting changed between reads. 82 is Mostly clear; 86 is Clear and specific.

## Why

The model sets the score. The prompt has it pick a band and then a number in the band, the model has no sampling setting to hold still, and code holds the score to the cards only at the top band (93 and up needs no card that needs work; a page with none sits at 90 or above). So two reads of one page give two numbers, and a page near a band's edge can land on either side of it.

## How far apart

Ten synthetic golden resumes, four reads each, on the shipped prompt (`gpt-6.1-terra`, medium reasoning, resume prompt `22a90f2273de`). Run `eval_1794596444924`, 41 calls, $0.49. Summary in `tests/fixtures/results/summary_score-retest-2026-11-13.md`.

| Resume | Four reads | Widest gap |
| --- | --- | --- |
| synth_marketing_manager_vp_elite_1 | 94, 94, 94, 94 | 0 |
| synth_data_scientist_senior_elite_1 | 95, 94, 95, 95 | 1 |
| synth_software_engineer_mid_strong_1 | 76, 77, 76, 77 | 1 |
| synth_project_manager_vp_strong_1 | 79, 79, 81, 80 | 2 |
| synth_hr_manager_director_foundation_1 | 49, 49, 52, 51 | 3 |
| synth_product_manager_entry_elite_1 | 78, 76, 78, 80 | 4 |
| synth_finance_analyst_senior_weak_1 | 45, 49, 44, 49 | 5 |
| synth_operations_manager_entry_weak_1 | 48, 43, 45, 43 | 5 |
| synth_sales_executive_mid_foundation_1 | 42, 44, 47, 42 | 5 |
| synth_ux_designer_director_strong_1 | 85, 80, 81, 80 | 5 |

Each resume gives six pairs of reads, 60 in all:

| Two reads sit | Pairs | Running share |
| --- | --- | --- |
| the same | 18 | 30% |
| 1 apart | 14 | 53% |
| 2 apart | 12 | 73% |
| 3 apart | 4 | 80% |
| 4 apart | 4 | 87% |
| 5 apart | 8 | 100% |

No pair sat more than 5 apart. One resume of the ten spanned two bands (85, then 80, 81, 80).

Two earlier runs on the same prompt (November 12) read the same ten resumes once each. Between those two, the widest gap was also 5 (69 and 74), and two resumes changed band (69 and 74; 91 and 94).

## What changed in the product

A first report is seen alone, and its number having a few points of play is what a judgment has. It misled where a second number sits beside the first.

1. **A posting read keeps the saved report's score.** The prompt says a posting changes the write-up and the fit note, not the score, and a posting read runs only on the resume the saved report was written on. The model still scored the page again, so a person holding an 82 could see 86 or 79 with nothing changed. The read now shows the saved report's score (`withSavedScore` in `web/lib/reports/posting-read.ts`). The top band's rule outranks it: when the saved score would put Ready to send over a card that needs work, or put a page with nothing to fix under 90, the read's own score stands. A report saved before November 6 has a score worked out differently, and a read on one keeps its own.
2. **A score difference of 5 or less is not announced as a change** (`SCORE_REREAD_SPREAD`, `scoreMoved` in `web/lib/score-utils.ts`). The re-check inside a report said "Up 2 since last time. That's the right direction!" or "Down 3 since last time." for any difference. It now speaks of the score only at 6 or more, and the lines that came off the list carry the result below that. My reports says "About the same score as version 2" where it said "Down 2 from version 2", and names no band change for a difference that size.

The homepage's fictional re-check stepped 80, 86, 91; the second step was 5, which the app no longer announces, so the sample is now 80, 86, 92.

## What this does not show

- Ten resumes, all synthetic, one prompt, one day. 5 is the widest gap seen in 60 pairs plus the earlier runs and the live reads. It is not a bound: a wider gap can happen and would be announced.
- A real improvement of 5 points or fewer is no longer announced as a number. From one pair of reads it can't be told from a re-read.
- The first score is as unsteady as it was. Steadying it means scoring twice, or tying the bands below the top to the cards in code. Neither was done; the second is a judgment change that needs its own evaluation.
- Reports compared in the earlier format (saved before November 6) still announce any difference. No new reports are made in that format, and this measurement was not run on it.
- No live posting read was made after the change; it is covered by unit tests.
