# The requirements table on a posting read, November 11, 2026

With a posting, the report now shows what the posting asks for as a table: each must-have with the resume line that answers it, or "Not on your resume". Before this it listed only what was missing. The resume prompt (`web/prompts/resume_v3.txt`) gained `fit.posting.covered` for it, so this is the evaluation of that change. Matt approved the build and its spend on November 11.

Everything here ran on the final prompt (the runner's hash `758861ac`), on `gpt-6.1-terra`, on synthetic resumes and postings only.

## The table is right

Eleven resume-and-posting pairs (`web/scripts/run-posting-reads.ts`), the same set as [the posting lists' evaluation](2026-11-posting-tailoring.md). `web/scripts/judge-posting-reads.ts` asked `gpt-6.1-sol` about every row, with the resume and the posting in front of it:

| | Items | Right | Partly | Wrong |
| --- | --- | --- | --- | --- |
| Covered: does the line answer the requirement? | 16 | 13 | 3 | 0 |
| Covered: is the requirement really in the posting? | 16 | 16 | | 0 |
| Missing: is it absent from the resume? | 58 | 30 | 28 | 0 |
| Lines to move up | 9 | 8 | 1 | 0 |
| Lines to trim | 6 | 6 | | 0 |

No read contradicted itself, and the three mismatched pairs got no covered rows.

"Partly" on a missing item is the rule working: the prompt lists a requirement as missing unless a line shows the main thing asked, so a requirement the resume only touches stays on the missing side. There are more of them than before (28 of 58 against 16 of 48) because every must-have now lands in one list or the other.

### What the first pass found, and the fixes

Both fixes are in the validator, so the prompt did not change again.

- **A years-of-experience ask "covered" by an employer-and-dates line.** Four of the first pass's 22 rows were this, and the judge faulted all four. The dates answer that ask on their own, so the validator drops a covered row whose requirement is a years ask.
- **A second model call over a few characters.** Three of eleven reads were sent back for repair because a requirement copied from the posting ran past 120 characters. The limit is now 200, and a longer one is cut to its first clause instead of failing the report.

## The ordinary report did not get worse

**The 49-case live set**, against the previous prompt's run (`2026-11-posting-tailoring/outputs/fullset`):

| | Previous prompt | This prompt |
| --- | --- | --- |
| Reports written | 49 | 49 |
| Mean score | 75.5 | 74.7 |
| Cards that need work, per report | 3.67 | 3.82 |
| The same, on resumes below 85 | 4.75 | 4.81 |
| Upgrade cards on a resume below 85 | 0 | 0 |
| Needs more context / Mostly clear / Clear and specific | 20 / 16 / 13 | 20 / 17 / 12 |
| Runs that needed the repair pass | 2 | 5 |

The two runs carded the same number of lines on 25 of 49 cases and differed by 0.63 cards a case, inside the noise floor measured on November 7 (24 of 49, 0.71 cards). Two of the five repairs were the 120-character limit above, on the set's two posting cases; the other three were existing rules (a name outside a bracket, a card without its question, twice).

**The golden synthetic fixtures**, run twice:

- First run: 7 PASS, 2 WARN, 1 FAIL. The failure was a quoted line that ended in garbled characters ("contribute toPorganizST") and failed again after repair. Four retests of that fixture produced 3 PASS and 1 WARN, so it reads as a one-off, but it is a real failure a person would have seen as an error.
- Second run: 9 PASS, 1 WARN, 0 FAIL. This is the run bundled as launch evidence (`tests/fixtures/results/summary_latest_live.md`, `lib/launch/liveEvalBaseline.ts`).

No blind pairwise read was run this time: the change adds one list to the posting section, and the card counts above are the regression check.

## Not covered

- No real resume and no real posting.
- A profile review never fills the table; its note already says where the posting's words sit.
- The smoke tier was not run (its fixtures are real resumes).

## Spend

About $1.60: two passes of the eleven posting reads $0.28, their judge $0.21, the 49-case set $0.56, and the golden fixtures $0.51 across two runs and the retests.

## How to rerun

From `web/`, with the OpenAI key in `.env.local`:

```
RIYP_SAMPLE_TODAY=2026-11-07 USE_MOCK_OPENAI=0 node --env-file=.env.local scripts/run-ts-script.cjs scripts/run-posting-reads.ts ../docs/audits/2026-11-posting-tailoring/outputs posting
RIYP_ALLOW_PAID_EVALS=true node --env-file=.env.local scripts/run-ts-script.cjs scripts/judge-posting-reads.ts ../docs/audits/2026-11-posting-tailoring/outputs
```

The reads open in the Report Lab (`/internal/report-lab?fixture=tailor-nurse-nursing-posting`).
