# A fifth band at the top

November 6, 2026. Matt, after shipping the worklist: "also maybe we should have a higher 5th band. this needs to be brilliant and verifiably good." Proposal, with the numbers, for his call.

## Where the live set lands today

The 49 shipped reports of the November 6 measurement (`docs/audits/2026-11-worklist-run.md`; pass 3's full set, with pass 4's reruns for the holes and tier cases), by score, with how many lines each page still had to fix:

| Band today | Score | Reports | Of which nothing to fix |
| --- | --- | --- | --- |
| Not ready yet | 60 and below | 1 | 0 |
| Needs more context | 61 to 69 | 17 | 0 |
| Mostly clear | 70 to 84 | 15 | 0 |
| Clear and specific | 85 to 89 | 6 | 2 (a mismatched posting at 88; a one-paragraph paste at 85) |
| Clear and specific | 90 to 94 | 8 | 4 (a senior backend engineer 94, an FP&A analyst 92, a construction PM 91; the other 4 have one line left) |
| Clear and specific | 95 to 99 | 2 | 2 (a two-page COO at 95; the strong PM golden case at 95) |

So the top band holds a third of the set, and inside it the pages with nothing to fix sit anywhere from 85 to 95, next to pages with one to three lines still to do. The band and the list disagree: a page can read "Clear and specific" and still show three entries that need work, and a page with nothing to fix can sit on the same band as one with three.

## The proposal

A fifth band that the page has to earn, defined by the list, not just the number:

| Band | Score | Anchor sentence |
| --- | --- | --- |
| Not ready yet | 60 and below | unchanged |
| Needs more context | 61 to 69 | unchanged |
| Mostly clear | 70 to 84 | unchanged |
| Clear and specific | 85 to 92 | unchanged |
| **Ready to send** | **93 to 99** | **Every line says what you did and what changed. There's nothing here a recruiter would stop on.** |

The rule, in the prompt and the validator: a page scores 93 or above only when no line needs work (every card is a keep card), and a page with no line that needs work scores at least 90. The employer lift never reaches the top band. On the current set that makes the top band about 4 of 49 (the two 95s, the 94, and the FP&A analyst at 92 would need to clear 93 or not), which is the right rarity for a band called ready.

Why "Ready to send": the ending already says "Send it. Then read it against the posting you're going for." on a clean page, so the band name and the ending agree, in words the reader doesn't have to translate. Why not score alone: a band is a judgment about the page; tying the top one to "nothing to fix" makes it checkable on every report, not a feeling about a number.

## What changes

- `web/prompts/resume_v3.txt`: the five anchors, the top band's rule, the lift rule (never into the top band). A prompt change, so it is measured: the holes, the tier cases and the full breadth set rerun (about $1.50), the golden synthetic set ($0.13), and the replay check that (score >= 93) and (no line needs work) agree on every shipped report.
- `web/lib/llm/worklist-validator.ts`: refuse a draft at 93+ with a work card, or a draft with no work card under 90, and repair once.
- `web/lib/reports/score-band.ts`: five bands; `ScoreBand` draws five segments; the band tests and `tests/fixtures/calibration.json` ranges follow.
- The PDF, the methodology page ("one of four bands" becomes five), the copy system.
- The first-screen and worklist specs that read the band row.

## Verifiably good

The gate for shipping it: golden synthetic 0 FAIL; on the rerun, every report at 93+ has no line to fix and every report with no line to fix sits at 90+; the band bar reads at 390px with five labels (the labels may need to shorten on phones); Matt reads the two pages that land on "Ready to send" and agrees they are.

Spend: about $1.70 of the $41 left on the November 5 cap.
