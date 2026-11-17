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

## Clear and specific is held to the cards

Added the same day, after a posting read from the 86 report came back with seven cards that need work under a score of 86.

The question: when one page reads 82 three times and 86 once, is there anything in the read itself that tells the stray from the steady? The cards do. No new reads were made for this; it is counted from reads already saved.

**Reads that scored 85 to 92, by cards that need work** (`line`, `structure` and `dates` cards; the keep card and upgrades are not work):

| Where | Reads at 85 to 92 | 0 | 1 | 2 | 3 | 4 or more |
| --- | --- | --- | --- | --- | --- | --- |
| Saved under `docs/audits` (November 6 to 12, several prompt versions) | 273 | 43 | 146 | 75 | 9 | 0 |
| The eval runs of November 11 to 13 (run files, not committed) | 7 | 0 | 3 | 2 | 0 | 2 (seven and eight) |
| The four live reads of one resume | 1 | 0 | 0 | 0 | 0 | 1 (five) |

The first row is `python3 docs/audits/2026-11-score-reread/tools/band-cards.py docs/audits`. A read saved in more than one file is counted once.

The three reads with more than three are the only reads in this record that crossed the line between Mostly clear and Clear and specific on a page nobody changed:

| Page | Every read, as score/cards that need work |
| --- | --- |
| Synthetic UX director (ten reads, four prompt versions) | **85/8**, 81/8, 82/10, 82/8, 80/8, 80/9, **85/7**, 80/7, 81/9, 80/9 |
| The live resume against one posting | 82/7, 82/8, 82/6, **86/5** |

On both pages the count barely moves while the number crosses a band. In the repeat run as a whole, two reads of one page gave the same count in 38 of 60 pairs and never sat more than 2 apart; the scores matched in 18 of 60.

The prompt already defines the band this way: "one or two still hide a detail". In 278 of the 281 reads the band came with three or fewer.

**The rule** (`scoreHeldToCards`, `CLEAR_AND_SPECIFIC_WORK_LIMIT` in `web/lib/score-utils.ts`): a page with more than three cards that need work scores at most 84. The validator applies it after every other check. The cards stand and the number comes down, with no refusal and no second call to the model, because which way to mend it is never in doubt. A posting read applies it to the saved score as well: a saved 86 over a read with four or more such cards shows 84.

Run over every read above, it lowers those three to 84 and changes no other. The saved golden run and the repeat run replay with the same counts as before (21 pass, 2 warnings, 0 failures; 38, 2, 0).

It runs one way. Few cards do not make a page Clear and specific: of 337 saved reads at 70 to 84, 205 carry three or fewer.

A held score is logged as `llm.response.score_held` with the number the read gave, so how often it applies can be counted from production.

What it leaves:

- The words of a held read. The 85 read of the UX director says "Your resume is already in good shape to send" above seven cards that need work, and carries two upgrade cards, which the prompt reserves for a strong resume. Holding the score makes the band agree with the cards; the write-up was still written by a read that thought the page was stronger. Changing that means a prompt change or a second call, and neither was made.
- Three or four. Nothing in the record sits between three cards and five, so the data does not choose between a limit of three and a limit of four. Three is one more than the prompt's own "one or two".
- Pages with three or fewer cards that sit near 85 can still land either side of it.
- A profile review uses the same validator and its prompt uses the same words for the band ("One or two parts still hide a detail"), so the rule holds there too. Only six profile reads are saved, one in the band with no card that needs work.

## The limit in the prompt, November 17

On production the rule worked as built. A posting read from the 86 report (report `fdbfc597`) logged `llm.response.score_held`: the model gave 87 over five cards that need work, and the report showed 84, Mostly clear, with no second call. Its words were written for an 87: two upgrade cards, and a write-up that closes "Your resume is unlikely to be the thing holding you back here".

So the limit went into the prompt as well, as one sentence at the end of the Clear and specific bullet: "This band is held to the cards as well: a page with more than three cards that need work never scores above 84, and no card a line needs is ever left off to reach it." The second half is there so the model doesn't drop cards to keep a higher score. The code rule stays as the backstop.

Matt approved about $2 of synthetic reads; $1.39 was spent. Every read below is synthetic.

**How often a read had to be held**:

| | Shipped prompt, today | New prompt |
| --- | --- | --- |
| Ten synthetic golden resumes | 12 reads of the UX director (run `eval_1794930816744`): 79 to 83, none held | 40 reads of all ten (runs `eval_1794931009733`, `eval_1794931229682`): none held |
| Posting reads, the two recruiter pairs | 12 reads: one drafted 86 over four cards that need work, held to 84, with two upgrade cards | 12 reads: none drafted above 84 with more than three |
| Posting reads, the rest of the set | 10 reads of the strong backend pairs: none held | 17 reads: none held |

On the shipped prompt, holds are rare: one in 34 reads today. On the new prompt there were none in 69. With rates this low, that is the direction we hoped for, not proof.

**Scores, ten synthetic golden resumes** (the shipped prompt's 50 reads from November 12 and 13 against the new prompt's 40):

| Resume | Shipped: score, cards that need work | New: score, cards that need work |
| --- | --- | --- |
| Data scientist, senior | 94 to 95, 0 | 95 to 96, 0 |
| Marketing manager, VP | 91 to 94, 0 to 1 | 94 to 95, 0 |
| UX director | 80 to 85, 7 to 9 | 80 to 82, 6 to 8 |
| Product manager, entry | 76 to 80, 2 to 3 | 78 to 79, 3 to 4 |
| Project manager, VP | 77 to 81, 10 to 12 | 76 to 78, 11 |
| Software engineer, mid | 69 to 77, 9 to 11 | 69 to 75, 10 to 11 |
| The four weak resumes | 42 to 52, 11 to 12 | 40 to 54, 12 |

**The strong backend posting pairs** read slightly lower: a mean of 89.3 over ten reads on the new prompt against 90.9 on the shipped prompt. Six of the ten carried one card that needs work, against three of ten. Two reached Ready to send, against three. With ten reads on each side, this can't be told from re-reading noise (the gap between two reads of one page runs to 5). The two strong golden resumes moved up, not down. Nothing here says the sentence pushes strong pages down, but a small effect would not show yet.

**Release evidence:** the ten synthetic fixtures once on the new prompt. 9 pass, 1 warning (a card whose fix has no blank), 0 failures: 90%, on the bar. Across all 40 reads on the new prompt there were 5 warnings, against 2 in the shipped prompt's 50:

- two cards with no blank to fill;
- two repeated clauses ("the work you" twice);
- one card question that repeats the verdict, which the shipped prompt also produced on the same resume.

Warnings of these kinds were in the bundled evidence before this change too, and none is about the score or the band.

What it leaves: the sentence tells the model the limit, but cannot make it write the right words for every read. A read that still drafts 85 or more over four cards is held by the code, with the words it wrote.

## What this does not show

- Ten resumes, all synthetic, one prompt, one day. 5 is the widest gap seen in 60 pairs plus the earlier runs and the live reads. It is not a bound: a wider gap can happen and would be announced.
- A real improvement of 5 points or fewer is no longer announced as a number. From one pair of reads it can't be told from a re-read.
- Inside a band the first score is as unsteady as it was. The one crossing this record shows on an unchanged page, into Clear and specific over a long list of cards, is closed by the rule above; a page can still read 78 once and 82 the next time.
- Reports compared in the earlier format (saved before November 6) still announce any difference. No new reports are made in that format, and this measurement was not run on it.
- One live posting read was made after the first two changes, from the 86 report: it showed 86, over seven cards that need work. That read is what prompted the rule above. One more was made after the rule (November 17): see "The limit in the prompt".
