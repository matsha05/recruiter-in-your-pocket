# The posting lists in the resume prompt, November 11, 2026

The resume prompt (`web/prompts/resume_v3.txt`) changed for "tailor to this job": with a posting, the report now lists up to three lines to move up (`fit.posting.lead`) and up to three to trim (`fit.posting.trim`). This is the evaluation of that change. Matt approved the spend on November 11.

Everything here ran on the final prompt (the runner's hash `e122fb00`), on `gpt-6.1-terra`, on synthetic resumes and postings only.

## What was asked

1. Did the change make the ordinary resume report worse? Nothing in it should touch a report without a posting.
2. Are the three posting lists right: do the lines to move up answer the posting, are the "missing" items really missing, and is anything marked to trim something the posting wants?

## 1. The ordinary report did not get worse

**The 49-case live set** (`docs/audits/2026-11-worklist-run/manifest.json`: holes, tier, breadth), against the shipped prompt's run (`2026-11-first-read/outputs/upgrades3/fullset`):

| | Shipped prompt | This prompt |
| --- | --- | --- |
| Reports written (the 15-page CV is refused before the call, as in production) | 49 | 49 |
| Runs that needed the repair pass | 3 | 2 |
| Mean score | 75.1 | 75.5 |
| Cards that need work, per report | 3.82 | 3.67 |
| The same, on resumes below 85 | 4.91 | 4.75 |
| Upgrade cards on a resume below 85 | 0 | 0 |
| Needs more context / Mostly clear / Clear and specific | 20 / 15 / 14 | 20 / 16 / 13 |

The two runs carded the same number of lines on 34 of 49 cases and differed by 0.39 cards a case. Two runs of one prompt differed by more than that on November 7 (24 of 49, 0.71 cards), so this is inside the noise floor.

**The golden synthetic fixtures** (`npm run eval:golden -- --filter synthetic`): 5 PASS, 5 WARN, 0 FAIL on ten fixtures. The shipped prompt's last run was 6, 4 and 0; four of the five warnings are the same fixtures for the same reason (see "Not covered"), and the fifth is the HR manager at 49 against an expected floor of 55. Summary: `tests/fixtures/results/summary_posting_tailoring_golden_synthetic.md`.

**A blind pairwise read** (`web/scripts/judge-worklist-pairs.ts`). A second model (`gpt-6.1-sol`) read each resume with the shipped prompt's report and this prompt's report, unlabelled, under the draft worklist rubric (`docs/evals/worklist-rubric.md`), in both side orders. A preference counts only when both orders agree.

| 49 resumes | |
| --- | --- |
| This prompt's report preferred | 18 (11 clearly) |
| The shipped prompt's report preferred | 17 (9 clearly) |
| No real difference, or the two orders disagreed | 14 |
| Reports with an unsupported claim flagged in both orders | 1 each |

That is an even split, which is what two draws of an unchanged report look like. The rubric is a draft and this judge has not been calibrated against Matt's picks, so it answers "did it get worse?" (no) and nothing finer. The nine clear wins for the shipped report are spread across the rubric with no pattern that points at this change: a vague line one run carded and the other didn't (two), an extra card on a line that was already fine (two), card order or a structural card (three), and a blank for a fact the page already had (two). The eleven clear wins the other way are the same kinds of difference.

## 2. The posting lists are right

Eleven resume-and-posting pairs (`web/scripts/run-posting-reads.ts`): software, marketing, nursing, customer success, an adjacent field (an account executive against a customer success posting), three mismatches (a data analyst against a nursing posting, a financial analyst against a marketing posting, an operations director against an engineering manager posting), and a two-page resume written so that "trim" has something to find. No run needed the repair pass, and every quoted line was on the resume.

`web/scripts/judge-posting-reads.ts` then asked `gpt-6.1-sol` one question per item, with the resume and the posting in front of it:

| | Items | Right | Partly | Wrong |
| --- | --- | --- | --- | --- |
| Lines to move up: does it answer something the posting asks for? | 12 | 8 | 4 | 0 |
| Missing: is it absent from the resume? | 48 | 32 | 16 | 0 |
| Lines to trim: is it safe to trim for this posting? | 6 | 6 | | 0 |

- **The mismatches got no lines to move up**, and neither did the two customer success pairs. The list stays empty when nothing on the page answers the posting or the order already serves it.
- **Trim fired only on the two-page resume**, three lines each time (the seating chart tool, the intern tour guide, the snack budget).
- **"Partly" is the list working as written.** A "partly" missing item is a requirement the resume touches without showing what the posting asks (Postgres named, "deep experience with PostgreSQL" asked). A "partly" line to move up answers half of a two-part requirement.
- **One read still half-contradicts itself.** The two-page resume lists "Partner with Finance and Risk on reconciliation and controls" as missing and also moves up the reconciliation line, saying it answers "part of" that requirement. The report says so itself; it isn't wrong, but it reads oddly.

### What the first pass found, and the fix

The first pass of the same eleven pairs had one wrong "missing" item of 49: a nurse with six years in hospitals was told "1 year of acute care nursing experience" was missing, and "strong communication with patients, families, and the interdisciplinary team" was listed as missing while a line about educating patients and families was moved up. The prompt now says: look for an item on the whole resume before calling it missing; the dated roles answer an ask for years of experience and the skills line answers an ask for a tool; a soft ask never goes in missing. Everything above was rerun after that edit.

## Not covered

- **The smoke tier was not run.** Its three fixtures are real people's resumes, and the approved spend covers synthetic resumes only.
- **Picks still vary between runs.** The backend resume against the senior backend posting got one line to move up on one run and two on the next.
- **No real resume and no real posting** had been through a posting read when this was written. One did on November 12, and it found what the section "What counts as a must-have" below records.

## The golden ranges, redrawn

`tests/eval-report.test.ts` had failed since the worklist prompt became the default: the bundled launch evidence was for the old prompt, and new evidence needs 90% of the golden fixtures to PASS. The expected score ranges in `tests/fixtures/calibration.json` were written for the old prompt, so the weak fixtures warned on every run since November 6. Matt approved redrawing them on November 11.

Each range is now the lowest and highest score the fixture got across seven live runs of the worklist prompt (November 5 to 11), widened by four points each side. A score more than twelve points outside a range still fails.

| Fixture | Seven runs | Was | Now |
| --- | --- | --- | --- |
| Data scientist, senior, elite | 93 to 96 | 85 to 95 | 89 to 100 |
| Marketing manager, VP, elite | 88 to 95 | 85 to 95 | 84 to 99 |
| UX designer, director, strong | 80 to 85 | 78 to 88 | 76 to 89 |
| Project manager, VP, strong | 76 to 81 | 75 to 85 | 72 to 85 |
| Software engineer, mid, strong | 68 to 79 | 78 to 88 | 64 to 83 |
| Product manager, entry, elite | 74 to 79 | 82 to 92 | 70 to 83 |
| HR manager, director, foundation | 49 to 55 | 55 to 68 | 45 to 59 |
| Sales executive, mid, foundation | 44 to 54 | 55 to 68 | 40 to 58 |
| Finance analyst, senior, weak | 43 to 58 | 55 to 68 | 39 to 62 |
| Operations manager, entry, weak | 43 to 46 | 55 to 68 | 39 to 50 |

Two things follow from the table. The worklist prompt scores a duty-only resume in the 40s, about fifteen points below the old prompt. And the product manager fixture, labelled elite when it was written, reads as Mostly clear: it has a generic summary, nothing dated after August 2023 and several lines without the work named.

One harness check changed with it: a card on a headline or summary whose example has no blank no longer warns (`lib/evals/worklist-checks.ts`). A headline rewritten from the page's own facts is a finished line. That card warned on the product manager fixture in both of today's runs.

The evidence is today's final golden run replayed through the new ranges at no cost (`scripts/replay-live-eval.ts`, which now replays worklist reports): 9 PASS, 1 WARN, 0 FAIL. The warning is a dates card that says "if you took" twice in one sentence. `tests/fixtures/results/summary_latest_live.md` and `lib/launch/liveEvalBaseline.ts` carry it, and the test passes.

### The sales fixture, November 12

The redraw above covered the ten synthetic fixtures. `sales_strong_foundation_mark_sherrod_1` (in both the smoke and golden tiers) kept the old prompt's range, 80 to 88, and failed a golden run on November 12 at 67. Seven live runs that day, on the shipped prompt before and after the verdict rule: 67, 66, 68, 68, 67, 68, 67. By the same method (lowest and highest, widened by four) the range is now 62 to 72.

Why it sits there: the range was written for the old prompt, and the resume's latest role ended in October 2023, so read today it has three years nothing accounts for, which costs a band. That rule is behaving as intended. A separate check on one strong synthetic resume with its latest role ended one, four, nine and twelve months ago scored 94, 95, 83 and 82 (two runs each, both within a point): a recent end costs nothing, and the cost starts somewhere between four and nine months.

The two other fixtures still on old-prompt ranges warned rather than failed. Matt approved redrawing both on November 12, by the same method, from seven live runs each that day:

| Fixture | Seven runs | Was | Now |
| --- | --- | --- | --- |
| `talent_leader_high_bar_matt_shaw_current_1` (smoke and golden) | 78, 79, 78, 83, 80, 82, 82 | 84 to 92 | 74 to 87 |
| `finance_not_ready_sam_helmuth_1` | 47, 46, 47, 48, 55, 52, 48 | 55 to 68 | 42 to 59 |

No fixture is left on a range written for the old prompt that the worklist prompt misses. Spend for the day's runs on these three fixtures and the date check: about $0.65.

## What counts as a must-have, November 12

The first real resume against real postings went through a posting read on November 12 (a live walk of the site on the founder's account, two public postings for a technical recruiter). Every quoted line was on the resume and nothing was both covered and missing, but the table showed the wrong rows:

- Conditions of employment listed as gaps: "Available to work extended hours and weekends as needed", "requires being onsite full-time" and "ITAR REQUIREMENTS" each marked "Not on your resume", above "If you've done it, say where."
- A heading and the tail of a sentence written as requirements, and "full lifecycle recruiting experience" cut down from an ask that went on "with substantial time supporting technical engineering organizations".
- "A field relevant to the role" and "Genuine interest in [the company's] mission" as rows, while all five preferred qualifications were left out, including the two the resume answers best (recruiting at a high-growth AI company, hiring for security).
- On the second posting the two closest matches, both written as "2+ years of ...", were missing from the table. That one was the validator: it dropped every covered row whose requirement mentions years.
- Both write-ups said "I read it for your [current title] role" on a read the person had given a posting for.

The eleven pairs above could not show any of this: their postings are clean lists with no preferred section, no logistics block and no conditions. Two postings shaped like the real ones were added, with a synthetic senior security recruiter (`resumes/posting_recruiter_aerospace.txt`, `resumes/posting_recruiter_ai_lab.txt`, `resumes/recruiter_security_senior.txt`; the people and companies are fictional). On the shipped prompt they reproduced it: extended hours, full-time onsite, export-control eligibility and a day-to-day duty in "missing", and the security and AI-company asks absent.

What changed:

- **The prompt says what a must-have is.** An ask about the work a recruiter screens a resume on, taken from the qualifications, required and preferred alike; a duty only when a posting has no qualifications. Never a condition of the job a resume doesn't state (citizenship, work authorization, export control, onsite or hybrid, relocation, travel, hours, a background check), never an ask about motive or character, never a line that names nothing a resume could show, never the employer's own text. A condition that could decide whether to apply goes in the fit note in one clause. Each item is one whole ask: no heading, no tail of a sentence, no ask cut to the half the resume answers.
- **A kind of work answers an ask that lists its specialties.** "Security hiring across all levels" covers "experience hiring for security engineering, incident response or threat intelligence"; a card can ask which.
- **With a posting, the write-up doesn't say which job it read the resume for.**
- **The validator** keeps a years ask in covered when the quoted line shows the work, and drops it only when the line is an employer-and-dates line. Under the prompt it also drops, from both lists, a section heading and a rule about who may be hired (citizenship, work authorization, export control).

The thirteen pairs on the final prompt, judged the same way (`gpt-6.1-sol`):

| | Before (eleven pairs, November 11) | After (thirteen pairs) |
| --- | --- | --- |
| Missing: wrong / partly / absent | 0 / 28 / 30 of 58 | 0 / 14 / 28 of 42 |
| Covered: no / partly / yes | 0 / 3 / 13 of 16 | 0 / 9 / 21 of 30 |
| Lines to move up: no / partly / yes | 0 / 1 / 8 of 9 | 0 / 3 / 8 of 11 |
| Lines to trim: wrong | 0 of 6 | 0 of 6 |
| Covered rows not in the posting | 0 | 0 |
| Contradictions | 0 | 0 |
| Answered asks left out of the table | 1 | 3 |

- No condition of employment, heading or fragment is in either list on any of the thirteen. The two recruiter pairs were run three times on the final prompt (twice on their own, then in the judged set); the security and AI-company asks were covered every time, and the conditions were in the note every time ("The posting names Waco, TX, but also says full-time onsite in Long Beach, CA").
- The three left out are all day-to-day duties the resume answers ("Precept students and new graduates as assigned"). That is the cost of keeping duties out of the table: a duty the resume doesn't show no longer reads as a gap, and one it does show no longer earns a row.
- No run needed the repair pass.
- The release evidence when this merged was the ten synthetic golden fixtures on the final prompt, first run: 10 pass, 0 warnings, 0 failures (`tests/fixtures/results/summary_golden_synthetic_must_have_2026-11-12.md`). The other thirteen golden fixtures were not run then; the full tier ran later that day and became the evidence (below).

### The full golden tier, run once

Matt approved one run of all 23 golden fixtures on this prompt the same day (thirteen are not marked synthetic, and at least four of those carry real people's names). Result: 20 pass, 3 warnings, 0 failures, $0.33.

| Fixture | Warning |
| --- | --- |
| `golden_sales_strong_foundation_mark_sherrod_1` | `W_MECHANICAL_COPY`: a write-up paragraph repeats the clause "year in your" |
| `law_inhouse_thin_signal_1` | `W_MECHANICAL_COPY`: a write-up paragraph repeats the clause "people you managed" |
| `anchor_elite_ml_staff_1` | `W_SPECIFICITY_LOW`: the first card's example has no blank to fill |

That is 87% passing. The bundled release evidence must show no failure and at least 90% passing, so as generated this run did not meet it and was not bundled; the ten-fixture run above stayed the evidence until the switch described below. The run was not repeated. Read plainly: none of the 23 fixtures carries a posting and none failed, the ten synthetic ones passed a second time, and the three warnings are kinds earlier golden runs showed the same day (the verdict prompt's final golden run was 19 pass and 4 warnings, `docs/audits/2026-11-verdict-opinion.md`). But the full tier on the prompt just before this one was 22 pass and 1 warning on its single run (`docs/audits/2026-11-gap-note.md`), so this is two more warnings than that, on a sample of one each. Receipt: `tests/fixtures/results/summary_golden_full_must_have_2026-11-12.md`.

**The three warnings, read.** None is a fault in the report.

- "The degree year in your header also differs from the end year in your education entry." The repeated words are "year in your", in a sentence that names two places a date appears. It reads as written.
- "Start with the Uplight lines on processes and the people you managed. Add what the processes changed and how many people you managed." The second use refers back to the first. An editor might vary it; it is not a recited phrase.
- The card with no blank is on a stray "javascript" alone on the last line of the resume, under the skills. The example folds it into the languages line and the question asks whether it belongs there. The line is really there (`tests/resumes/golden/anchor_elite_ml_staff_1.txt`), and the three earlier full runs that day did not mention it. A fix to where a word sits has nothing to fill in, so the check's rule (a card that needs work has a blank) does not fit this card.

Whether the must-have rule caused them cannot be told from one run, and the day's other full runs say this count is ordinary: 3 warnings and a failure, 4 warnings, 1 warning, and now 3, on four prompts. The legal and machine-learning fixtures passed in all three earlier runs; the sales fixture warned or failed in nearly every run that day, mostly on a score range that has since been redrawn. The checks were left as they are. The repeated-clause check flags "if you took" twice in a sentence, which is a real habit, by the same test that flags "year in your", and loosening it to pass this run would cost that.

**The evidence, switched.** Later the same day the repeated-clause check was corrected (PR 142; record in `docs/audits/2026-11-gap-note.md`): a repeated clause is trimmed of trailing function words and flagged only when three words are left, so "year in your" no longer counts and "if you took" and "people you managed" still do. That change was made by the session that owns the check, at Matt's request, after it read these warnings; its record has the counts.

The same saved run, replayed through the corrected check (`scripts/replay-live-eval.ts`, no model call): 21 pass, 2 warnings, 0 failures, 91.3%. Matt chose to make it the bundled release evidence in place of the ten-fixture run, since 23 fixtures is the broader proof. What that number is and is not: it is one generation, never repeated, that cleared the bar only after a check was corrected following the run. `lib/launch/liveEvalBaseline.ts` says so above the figures. The ten-fixture run's summary is kept as `tests/fixtures/results/summary_golden_synthetic_must_have_2026-11-12.md`.

Still not covered: a clearance or licence the posting requires and the resume lacks is treated as a must-have, which is right, but no fixture has one beside a citizenship rule to show the two are told apart.

## A quoted line cut mid-sentence, November 12

On the live walk one card quoted a bullet as far as "through innovative strategies aimed at" and stopped. The bullet is 293 characters. The model is asked for quotes under 200, and the validator widened a quote to the whole resume line only when the line was 200 or under, so on a longer line the quote ended wherever the model's limit landed.

The fix is in the validator; the prompt is unchanged and no model call was made. A report now holds a quoted line of up to 400 characters, the length of the longest example a card shows under it, while the model is still asked for 200. On a resume line over 200:

- a quote that stops at a break (the end of a sentence, or a clause mark) is the part the model chose and stands;
- a quote that stops anywhere else keeps its start and runs on to the end of its sentence;
- when that sentence is too long to show, the end moves to the nearest clause break, forward if it fits and back if not.

The same rule covers a card's line, a row of the posting's table, and the lines to move up or trim (`quoteWithinLine` in `web/lib/llm/worklist-grounding.ts`, tests in `web/tests/posting-tailoring.test.ts`).

Measured on saved output, not on new runs. The full golden run's 166 quoted lines, replayed: 13 sit on a resume line over 200 characters. Seven of those quotes stop at a break and are unchanged. Four change only by the bullet mark the resume's own form drops. Two stopped mid-clause and now run to the end of their sentence, one of them at "go to market, and G A". The run still scores 21 pass, 2 warnings, 0 failures. The live bullet, cut where the report cut it and put through the rule, comes back whole.

The first version of this fix showed every line up to 400 characters whole. On the same saved run that replaced quotes the model had kept to one sentence of a several-sentence line with the whole line, and ran one quote past a bullet mark into the next bullet (a file read had put two bullets on one line). The rule above is the correction: it changes a quote only when the quote stops mid-clause.

### The same limit at the quote's other end

After the fix was live, one posting read was run on production from the saved resume (the founder asked for it; the read is included with a pass). It quoted 15 lines, three of them on a resume line over 200 characters. None stopped mid-sentence. One did the reverse: on the same 293-character bullet the model quoted exactly 200 characters, from "achieving a 300% reduction" to the bullet's last word. To reach the end inside its limit it had dropped the start. The first live report's keep card had the same shape and had gone unremarked: it began at "onboarding 80".

A quote that begins after a clause break rarely reads without what came before it, where one that ends at a clause break usually does. So the two ends are treated differently:

- a quote that begins where a sentence begins stands, so one sentence of a several-sentence line stays the one the model chose;
- a quote that begins partway into a sentence goes back to the start of that sentence when the result fits in 400 characters;
- when it doesn't fit, the start stands.

Measured on saved output, no model call. Of the 13 quotes on long lines in the full golden run, 12 begin at a sentence and are unchanged; one began mid-clause ("directing ML Acceleration") and now starts with its sentence, 210 characters in place of 169, and goes back no further than the bullet mark that opens it. The run still scores 21 pass, 2 warnings, 0 failures. The live quote, put through the rule, comes back as the whole bullet, and the two other long-line quotes of that report (one sentence each) are unchanged.

### A quote cut inside a word, November 13

A second read on production, after the change above was live, showed no card on any long bullet, and took 1 minute 50 seconds where the one before took 45 seconds. The production log for the request gives the reason. The model's first draft quoted a 212-character bullet as far as "executive leadership and key bu": the limit had closed the quote inside the word "business". The validator matches a quote on whole words, so it read this one as not on the resume and refused the draft. The repair call took 52 seconds, and the second draft has no card on that role. The two reads before it both carded that role's "300% reduction" line; what else the refused draft held is not in the log.

So a quote cut inside a word cost the person a minute and the report a role's worth of cards. The fix is in how a quote is found (`locateQuote` in `web/lib/llm/worklist-grounding.ts`): a quote that isn't on the resume is looked for again without its last word, and stands when that finds exactly one line and the line carries the quote character for character, cut word included. A quote whose last word is not the start of the resume's word is still refused. The quote then goes through the rules above, so a card shows it to the end of its sentence. A row of the posting's table or a line to move up or trim with such a quote is kept where it was dropped.

Measured, no model call: the refused quote, put through the change, is found and shown as the whole bullet. Each of the resume's nine lines over 200 characters, cut inside a word just under 200, was refused before and is found now. The full golden run replays at 21 pass, 2 warnings, 0 failures.

Not measured: how often a live draft has been refused for this reason. Production logs are kept for an hour, and the saved golden run holds only drafts that passed.

Not changed: the repair call's instruction, which lets the model drop a card it cannot quote. That is a tuned prompt, and with a cut quote now found, this cause no longer reaches it.

Not measured: how often a live report now shows a quote between 200 and 400 characters. The Report Lab has a layout fixture for one (`worklist-long-line`).

## Spend

The full golden run on the must-have prompt: $0.33.

The must-have change of November 12: about $0.80 (thirty-six report calls across the drafts and the final set, the judge, the ten synthetic golden fixtures).

About $2.70 of live spend, by the runners' ledgers. The final pass, which everything above reports: the 49-case set $0.53, the golden fixtures $0.16, eleven posting reads $0.15, their judge $0.08, the pairwise judge $0.71. The first pass, before the "missing" fix, was about $1.00 for the same runs without a full pairwise read (one judge run was stopped early, so its cost is an estimate).

## How to rerun

From `web/`, with the OpenAI key in `.env.local`:

```
RIYP_ALLOW_PAID_EVALS=true RIYP_WORKLIST_REPORT=1 USE_MOCK_OPENAI=false node ../docs/audits/2026-11-worklist-run/tools/run-worklist.cjs --manifest ../docs/audits/2026-11-worklist-run/manifest.json --batch breadth --runs 1 --budget-usd 2 --today 2026-11-07 --out ../docs/audits/2026-11-posting-tailoring/outputs/fullset
RIYP_ALLOW_PAID_EVALS=true node --env-file=.env.local scripts/run-ts-script.cjs scripts/judge-worklist-pairs.ts ../docs/audits/2026-11-first-read/outputs/upgrades3/fullset ../docs/audits/2026-11-posting-tailoring/outputs/fullset --budget-usd 5
RIYP_SAMPLE_TODAY=2026-11-07 USE_MOCK_OPENAI=0 node --env-file=.env.local scripts/run-ts-script.cjs scripts/run-posting-reads.ts ../docs/audits/2026-11-posting-tailoring/outputs posting
RIYP_ALLOW_PAID_EVALS=true node --env-file=.env.local scripts/run-ts-script.cjs scripts/judge-posting-reads.ts ../docs/audits/2026-11-posting-tailoring/outputs
```

The full set also needs `--batch holes` and `--batch tier`. The judges' verdicts are in `2026-11-posting-tailoring/judged/`; the eleven reads open in the Report Lab (`/internal/report-lab?fixture=tailor-nurse-nursing-posting`).
