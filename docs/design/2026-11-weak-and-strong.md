# What a weak resume deserves, and what a strong one does

Date: November 5, 2026. Branch `claude/concept-weak-strong-1aeb11`, cut from `main` at `d15fc69c`. Status: **Matt chose direction A for both ends and "build both, no prompt changes"; built and verified on a production build (see "The build" and "Verification" at the end).** The interview and the six sketches are recorded in full below so the reasons survive.

Companions: [the November 5 review](../audits/2026-11-report-and-signed-in-review.md) (PR 60; its verdict, value ledger, holes H1 to H3 and sketches 1 and 2 are the starting point), [the signature report spec](../launch-readiness/72-signature-report-spec.md), [the bar](2026-11-bar.md), the loop in `.claude/commands/new-surface.md`.

## The problem, in one paragraph

The report has one shape: Verdict, band, one to three Critical Misses with a question under the first, keep, role fit. The review showed it is right for a mid-career page with a few weak lines and wrong at both ends. On Kevin's page (24 duty bullets, nothing dated after July 2023, an objective that says "results-driven and team player"; `tests/resumes/golden/synth_operations_manager_entry_weak_*.txt`, scored 58 to 60 in four production runs) the live product leads with "name the records you maintained and the reports you updated", puts the three-year gap second because the first fix never moves, says nothing about the objective, the CAPM "Learner level" or "References available upon request", and calls a 58 "Needs more context", the same words a 68 gets. On Meredith's page (every bullet has a result, a team of 8, $3.2M; `synth_data_scientist_senior_elite_*.txt`, scored 92) it prints "One Critical Miss. Fix it first. It's the one most likely to cost you the interview." over a request for the evaluation method behind a 15% figure.

## The interview (Matt, November 5, 2026)

Asked through the question UI with both resumes in front of him. His answers, in his words where he gave them.

| Question | Answer |
| --- | --- |
| Kevin's page lands on your desk. First minute? | **Pass in seconds. Ask eight questions. Tell him where he stands.** (All three; not "circle the one thing".) |
| Meredith's page lands on your desk? | **Form the screen question. Nothing. It's ready.** (Not "check level and target", not "look for what doesn't add up".) |
| Should Kevin get a report at all on day one? | "good question. probably questions first" |
| What should Meredith get that's worth the upload? | "focused more on tweaks to make it even better", plus **the question they'd ask** and **same report, honest heading**. |
| Where should Kevin's questions come from? | **A quick first read picks them** (over a fixed checklist, over report-first-with-questions-open). |
| What should a 58 read, when the bottom band covers 0 to 69? | **A fourth rung, "Not ready yet"**, with an anchor that names the two things (what you did, what since). Reopens the November 1 anchors for the bottom only. |
| Should "Critical Miss" appear on Meredith's 92? | **No. "The question they'd ask", then tweaks.** Critical Miss stays for the other bands. |
| What does $29 buy each? | **Kevin: the rebuild, one read at a time. Meredith: reads against postings.** |
| Who gets the questions-first path? | "um i dont know" |
| The three-miss shape: where did it come from, does it hold? | "meh i kinda made that up. for some resumes there will be a lot more than 1 or even 3 tbh" |
| What would embarrass you in front of Meredith? | "i dont know" |
| Which of the review's cuts (full notes, interview questions, role fit without a posting, Hide)? | No preference. |

What that settles: the weak end asks before it marks; the bottom of the band says not ready; the strong end never says Critical Miss and leads with the screen question; the cap of three is not a principle and a weak page may show more; the pass is the rebuild for one and the postings for the other.

What it leaves to the builder: the trigger for the questions-first path (my proposal below: the new bottom rung only); the cuts (none in this wave unless a chosen direction needs one).

## Spec

- **Who it is for.** Kevin: the not-ready page, probably most of day one. Meredith: the page that is already good.
- **What it must say.** Kevin: where he stands, plainly, then the questions a recruiter would ask and never get to, then a report written from his answers. Meredith: that nothing here makes a recruiter pass, the one question they'd ask with a place to answer it, and what's worth tightening.
- **What the person does next.** Kevin answers or skips, reads the report, edits, and checks each revision on the pass. Meredith answers the one question so the sentence is in the line before the screen, then reads it against a posting.
- **Out of scope.** Shipping a prompt change without a judged eval; invented numbers or interview odds; a builder, scanner or coach framing; the Highlighter materials where they are not literally true; the founder's identity.
- **How we know.** A direction chosen per end; built on a production build; focused checks pass; this file records it.

## The sketches (six, at phone width, on the real tokens)

Files: [sketches/](2026-11-weak-and-strong/sketches/) (open any `.html` in a browser; `tokens.css` copies the Highlighter tokens and loads the site's fonts by relative path). Screenshots at 390 are beside them. Report text in every sketch is the saved production output for that resume (`web/tests/fixtures/report-integrity/live-outputs-83b2a2d1.json`, runs 10 and 0) plus the severity run (`tests/fixtures/results/summary_severity_golden_final_2026-11-02.md`); anything the prompt does not write today is labelled in the sketch's last line.

### Kevin

| | What he sees first | What he does next | What it costs us | Pass economics |
| --- | --- | --- | --- | --- |
| **A. Ask first** ([html](2026-11-weak-and-strong/sketches/weak-a-ask-first.html), [390](2026-11-weak-and-strong/weak-a-ask-first@390.jpg)) | "This isn't ready for an operations role yet. Before I write it up, I'd ask you eight things a recruiter won't get to." The band at "Not ready yet". Eight questions, each on the line it is about, the dates first, the objective second. "Write my report" and "Skip the questions and read it as it is". Then the report written from the answers, with the whole list and his revised lines in it. | Answers what he can, skips the rest, reads the report, edits, re-checks. | Cheapest honest build: run today's report; when it lands under the new rung, show its questions (the fixes' questions, the gaps, the general questions bound to lines) instead of the report; compose the answers into the resume the way the revised line already does (line, colon, answers, word for word); run the **unchanged** prompt again. No prompt change. Two model calls for a Kevin who answers, one for everyone else (about $0.06 instead of $0.03 at the measured cost). The "cut it" notes on the second screen need a prompt field and a judged eval; they are not in the first build. UI: a questions screen; answers persist with the report (`reports.line_answers` exists). | The free report becomes the rebuild's first read. The pass is "one read per revision", which is what Matt said it buys Kevin. |
| **B. The report is the plan** ([html](2026-11-weak-and-strong/sketches/weak-b-rebuild-list.html), [390](2026-11-weak-and-strong/weak-b-rebuild-list@390.jpg)) | "This isn't ready for an operations role yet, and it's not three fixes away. It's ten." The band. Ten things in order, each with the line, the note and a field; no Critical Miss count. One "Keep this one". | Works down the list, does the top three tonight, re-checks. | A new prompt field for the full list including "cut this" and "replace the objective" (the prompt has no way to say either today), a validator for it, a judged eval. One model call. UI: the list. | The free report gets much bigger for the people least likely to pay. The pass is the same re-check. |
| **C. Honest first screen** ([html](2026-11-weak-and-strong/sketches/weak-c-honest-first.html), [390](2026-11-weak-and-strong/weak-c-honest-first@390.jpg)) | Today's Verdict with the gap sentence added, the fourth rung, "Three Critical Misses, and more than three things to fix", the gap first, then one line naming the objective, the references line and the CAPM. | The same as today: answers under the first miss, "Work on this line" on the others. | The review's sketch 1: a merge rule (a `no_recent_work` or `title_level_mismatch` addition leads when Fix 1 is a duty-line edit) through the judge gate; the rung; an "also on this page" line from `gaps` and `section_review.*.missing` filtered against the fixes. Cheapest. | Unchanged. |

### Meredith

| | What she sees first | What she does next | What it costs us | Pass economics |
| --- | --- | --- | --- | --- |
| **A. The question they'd ask** ([html](2026-11-weak-and-strong/sketches/strong-a-question.html), [390](2026-11-weak-and-strong/strong-a-question@390.jpg)) | Her Verdict, "Clear and specific" on the four-rung band, then "The question they'd ask. Not a reason to pass on you. Worth a sentence before you send it." The readmissions line as the clipping, the question, a field, the revised line. Then "Worth tightening" (the headline, the FinEdge evaluation), "Keep these", and "Send it. Then read it against the posting." | Answers the one question, copies the line, pastes a posting. | UI only, on the Clear and specific band: the first fix is presented as the question row (its own `fix` text; the pen line "Fifteen percent against what?" in the sketch is illustrative), the other fixes as "Worth tightening", the heading and lead stop claiming interview cost, the ending points at the posting. With two or more flagged misses on a strong band the severity check has earned today's heading and it stays. No prompt change, no eval. | Points her at the one thing the pass is for her: five postings. |
| **B. The targeting read** ([html](2026-11-weak-and-strong/sketches/strong-b-targeting.html), [390](2026-11-weak-and-strong/strong-b-targeting@390.jpg)) | "This page reads as a hands-on data science lead. It doesn't yet say which job it's for." Then Level (what the page reads as), Role (the three-title headline, a field for the one title), Against the posting (a paste field), and the question second. | Names the role, pastes the posting, re-reads. | The level as a structured read (`seniority_read` is a sentence today, so the "Read as" chip rarely shows): a prompt change and a judged eval. The posting field moved inline (the bar's F3). UI: three rows. | Sells the pass best: "Five postings, five reads." |
| **C. Send it** ([html](2026-11-weak-and-strong/sketches/strong-c-send-it.html), [390](2026-11-weak-and-strong/strong-c-send-it@390.jpg)) | "Send it." The band. One sentence to add (the headline). "Keep these". A pen line saying what they'll ask on the phone, without a field. | Adds the headline and stops. | "Send it." is a verdict the prompt does not write; the UI would have to say it from the band. Drops the answer flow for strong pages. Small. | Nothing to answer and nothing to re-check; the pass has no job here. |

My recommendation to Matt, pending his reaction: **A for both ends**, built without prompt changes this wave (the fourth rung, the strong-page presentation, and ask-first on today's prompt), with everything that needs a prompt change written up as a proposal with an eval plan.

### The trigger (my proposal, since Matt said "I don't know")

The questions-first path runs only when the report's own band lands on the new bottom rung. That is the rung Matt defined as "a reader can't tell what you did or what you've done since", which is exactly when a recruiter asks before marking. Everyone above it gets the report straight away, as now. The threshold is the calibration question below.

## What still needs the live-model results

The parallel session is to run six hole resumes (bad, thin, strong, paragraph, Spanish, cover letter) through the live model once Matt authorizes the spend (about $0.30). Fold in:

- **The fourth rung's threshold.** The prompt's scale puts "a weak resume made mostly of generic duties" at 55 to 68 and "Below 50: Not ready yet"; the calibrator caps a page with eight or more bullets, no outcomes and 45% generic duties at 68. Kevin scored 58 to 60 in four runs, so a rung "under 55" would not catch him; the rung has to be read off the golden set's scores (`resume-score-calibration.ts`, the 13 saved outputs, the four persona reports) and then checked against the six hole resumes. Decision pending: the cut sits where Kevin and the other three labelled weak synthetic resumes fall and the four "foundation" resumes don't.
- **Whether a re-run on the composed resume behaves.** Ask-first on today's prompt depends on the second call reading Kevin's answers as facts in his lines. The revised-line guard already proves the composition passes provenance on 13 of 13; what is unmeasured is the second report's Verdict, band and fix choice on the composed page. One run of Kevin with fictional answers composed in, judged against the first.
- **The thin resume (H3).** Priya's page may land on the bottom rung for the wrong reason (nothing to show yet, not nothing said). The questions-first path would then ask a student for scale. Needs the live run before the trigger is final.
- **The strong page with two flagged misses.** Over-count gate says strong pages stay at one (4 of 4); the live strong resume confirms or breaks the "today's heading stays with two or more" rule.

## Matt's choice (November 5, 2026, after the sketches)

Kevin: **A, ask first.** Meredith: **A, the question they'd ask.** Scope: **build both, no prompt changes**; anything that needs a prompt change goes below as a proposal with an eval plan.

## Matt's decisions on the first build (November 5, 2026, through the question UI in the parent session)

1. **Trigger: band only.** Ask-first runs on the bottom rung alone; the second trigger (a flagged Critical Miss) came out. Widen later only if a live weak resume earns it.
2. **Pricing: "The answered read is free"**, for free and pass users, as built.
3. **Cuts in this wave: "Full recruiter notes" and "The five interview questions."** Both are gone from the web report (the PDF never printed them; its `Next steps` checklist stays). Not cut: role fit without a posting, Hide on every row.
4. **Order.** Matt merges PR 66 himself after reading it; the judgment wave (validator refusals, the two detector bugs from PR 62, the first-fix-never-moves rule) comes after, in its own session.

And one addition, if it fit the question unit cheaply: three honest states in place of the two escape hatches. It fit the questions screen (below) and not the report's own answer flow, which is written up as a follow-up.

## The build

Everything below runs on the unchanged production prompt (`83b2a2d1`) and the unchanged severity check; no validator rule changed; no new model call for anyone whose page is not on the bottom rung.

### The fourth rung, and the tone of the report

`web/lib/reports/score-band.ts`. The band has four rungs: `Not ready yet`, `Needs more context`, `Mostly clear`, `Clear and specific`. The three upper ones match the validator's `score_label` as before (85 and 70); `score_label` itself is unchanged, so stored reports, the preview event and the evals keep their three labels. The bottom rung is the validator's lowest band at 60 and below, on the score alone (Matt, after reading the first build: "Band only", then "60 and below" so the same resume gets the same screen on every run; a second trigger on a flagged Critical Miss was built and taken out, to be widened later only if a live weak resume earns it).

Why not "under 55", which the review sketched: the live run of November 5 (PR 62) found nothing scores below 57, the whole weak set sits between 57 and 68, and a rung under 55 "would have caught nothing in 90 reports". Kevin's four production runs scored 58, 60, 60 and 58, so a line below 60 would have caught two of his four runs and not the other two; at 60 and below it catches all four, and on the golden set it puts the labelled weak pages at 55, 58, 59 and 60 on the rung and leaves the two "foundation" pages with a gap (61), the thin student drafts (64 to 65), the unverifiable-claim page (64) and the career changer with a thin portfolio (68) above it. That is a calibration read, not a measurement of the rung against people; see "What still needs the live-model results".

`reportTone(score, misses)` names how the report speaks: `not_ready` (the bottom rung), `ready` (the top rung with a single miss, counted or not), `standard`. The same function drives the web report, the PDF and the server's ask-first offer, so the three never disagree.

### The strong page

`criticalCountHeading(misses, tone)` and `fixLabel(index, misses, tone, total)` in `report-presentation.ts`; `ReportStream.tsx`, `MarkedRows.tsx` (a label override on `FixRow`), `pdf.ts`. On `ready`:

- the heading is `The question they'd ask.` with `Not a reason to pass on you. Worth a sentence before you send it.`; the interview-cost line never prints;
- the first row's label is `The question they'd ask`; the line, the pen note, the answer fields and the revised line are unchanged, so the sentence still goes into the line before the screen;
- the other rows sit under `Worth tightening.` as `Worth tightening · 1 of 2`;
- the ending reads `Send it. Then read it against the posting you're going for.` with `Read it against a posting` (the existing revision flow; a second read spends a report as before);
- the PDF's kicker reads `Before you send it`, with the same heading and labels.

With two or more flagged misses on a clear page the severity check has earned the count, and today's heading stands. No prompt change, no model change: the fix's own words are the question.

### Ask-first

`web/lib/reports/ask-first.ts` (the rule, the questions, the composition), `ask-first-rebuild.ts` (the server gate), the stream route, `lib/api.ts`, `useResumeReview.ts`, `WorkspaceClient.tsx`, `ResumeModeSection.tsx`, `ReportPanel.tsx`, `AskFirst.tsx`.

1. The first read runs as it always has. When the finished report's tone is `not_ready`, the `complete` event carries `ask_first: true` (`RIYP_ASK_FIRST=0` turns this off; a re-check comparison never asks).
2. The workspace shows the questions instead of the report: `{Count} questions before the report.`, the band at `Not ready yet` with its anchor sentence (shown on phones here, where it is the screen's point), then `A recruiter would ask these. They won't get to.`, `Only what's true. Every answer goes into your resume in your own words.`, and up to eight questions. They come from the report itself, in the report's order: each marked line's own questions first (the Critical Misses lead, so a flagged gap or missing headline comes before a duty bullet), two per line at most, then the report's open questions. Each line question shows the line as the site's clipping; every ask is the model's words in the pen (one voice per row); when a line has no question of its own, the note is the ask and the field's placeholder says the shape of the answer. Each question about a line on the page has three honest states (Matt): `I did this` (the answer goes into the line), `I did related work` (the field asks for the related work, which goes on the page as its own line, never into the line it was asked about), `I haven't done this` (left out). A general question keeps `I don't know`. `Write my report` with nothing answered is the same as `Skip the questions and read it as it is`: the first read.
3. The answers go into the resume the way the revised line already builds them: a line's answers are composed into that line, word for word (`composeRevisedLine`); a headline answer becomes one line under the name; the time since the last dated role and any general answer go as the person's own lines under `Added after the first read` at the end. Nothing else moves. Every added word is theirs.
4. The report is written again from that page by the unchanged prompt, through the stream route with `rebuild: { report_id | recovery_id }` instead of a reservation: it spends no free report and no pass credit, the counter is refreshed but never decremented for it, and the wait reads `Writing it up from your answers.` The server runs it only for a first report this visitor can open (their saved report, or their anonymous report's recovery), on the bottom rung, whose first marked line is still on the page sent, and at most three times a day per identity; refusals spend nothing and leave the first report on screen with the questions. Signed in, the rebuilt report is kept as a report of its own (the first stays). Anonymous, it carries a receipt so it can be saved by signing in; a reload returns the first report, since the recovery slot is bound to the first reservation.
5. The rebuilt report is a normal report, written from the composed page, with `written from N answers` where the read time goes. It never asks again.

Cost: one extra model call for a person on the bottom rung who answers (about $0.011 to $0.019 per shipped report at the live run's measured cost), none for anyone else.

### What was cut

`FullRecruiterNotes` (the section-by-section grades, the remaining strengths and gaps, next steps, the role detail) and the "Questions only you can answer" list are gone from the web report (Matt, November 5). The report is now the Verdict, the band, the marked page, the rewrites it offers on other lines, Keep, role fit, the score note and the ending. The integrity tests now assert that what lived in those sections renders nowhere on the web; the PDF keeps its `Next steps` checklist and never printed the rest.

### Follow-up: the three states in the report's own answer flow

The Critical Miss answer flow (`LineLift`) keeps `I don't know` and `I didn't do this`. Giving it the same three states means a new answer kind in the stored answers (`reports.line_answers`, migration 024, and `line-answers.ts`'s validation), a rule for where related work goes when it can't go into the line, and the saved-report restore. More than UI; not in this PR.

### What the sketch promised that this build doesn't

- The sketch's second screen listed everything wrong ("Nine things to fix, six in your hands") and said "cut it" on filler. The prompt has no fix kind that can say cut or replace, and the report shows three fixes; the rebuilt report is a normal report. Proposal below.
- The sketch's questions were written by hand for the page. The product's come from the report: when a fix has no question of its own, the pen note is the ask.

### Proposals that need a prompt change and a judged eval

1. **A fix kind that cuts or replaces** (the objective, "References available upon request", "team player"): a `top_fixes` entry whose `fix` says remove or replace and whose evidence is the line. Gate: the judge's blind preference on the twelve labelled resumes plus the golden set, zero vetoes, and the count checks; the live run's H1 shows 0 of 11 runs produced such a fix today.
2. **Letting a `no_recent_work` or `title_level_mismatch` addition lead** when Fix 1 is a duty-line edit (the review's sketch 1; the live run: 8 of 8 structural finds sat second or third). Ask-first softens this (the gap's question comes first on the questions screen because the Critical Misses lead), but the report under it still puts the gap second. Gate: the judge's under-count and preference checks.
3. **The validator before any of that**: the summary detector that kills student resumes and CVs, and the narrative audit's blindness to the posting (PR 62's two cheaper, larger wins). A prompt change evaluated through a validator that loses 11% of runs is measured on a biased sample.

## The outside critique (Impeccable's critique prompt, fresh subagent, screenshots at 390, 1024 and 1440)

Nothing blocking. What it found and what happened to each:

| Finding | Done |
| --- | --- |
| A green ring around the questions screen's heading at every width (programmatic focus) | Fixed: no ring on the heading; it still takes focus for assistive technology |
| `Write my report` looked disabled and the skip read as the primary; two sentences of helper text under the buttons | Fixed: the button is always on (nothing answered is the skip), the skip is a quiet link on the column edge, the sentences went; the one fact moved into the lead: `Only what's true. Every answer goes into your resume in your own words.` |
| Two voices in one row (a pen note and an ink question) and rows without a line in ink | Fixed: every ask is the model's words in the pen; where the note is the ask, the field's placeholder says the shape of the answer |
| The band's anchor sentence hidden on phones | Fixed on the questions screen, where the band is the point; the report keeps the phone band as the spec set it |
| `What to add` in red on a clear page | Fixed: on the `ready` tone the label is in the pen; the questions still render (the integrity test insists every question appears once) |
| `1 of 6` in pen green | Fixed: muted ink |
| The marker covers only the first wrapped line of a long quote at 1024 and 1440 | Not this wave: the materials' `MarkerStroke` has always done this on every report's Critical Miss; recorded as a follow-up |
| The heading and the row label say the same thing (`The question they'd ask.` then `THE QUESTION THEY'D ASK`) | Kept: copy-system §1 says the label is the short form of the heading when they sit together, as `One Critical Miss` and `CRITICAL MISS` already do |
| `The comparison lasts for this visit. Save the report to keep it.` under `Read it against a posting` | Kept: the posting read is the revision flow, and that sentence is its fact |
| A blank body column beside a `Worth tightening` row's margin at desktop | Not this wave: `FixRow`'s existing two-column layout |

## Verification (production build of this branch, mock model, hermetic `.env.local`, `next start` on localhost:3157)

- `tsc --noEmit`, `npm run lint`, `qa:design-system` (0 raw font sizes, 0 hex violations, 0 banned terms), `test:search-foundation`: pass.
- Node suites: `test:report-integrity` (now including `ask-first.test.ts` and `ask-first-rebuild.test.ts`), `test:backend-contracts`, `test:pdf-export`, `test:stream-contract`, `test:generation-access`, `test:analytics-privacy`, `test:request-body`: pass. The rebuild route test proves, through the real route with the stores mocked: no source report, a report above the rung, or a page without the first marked line are refused with nothing reserved and nothing spent; a rebuild runs the model without `reserveGenerationAccess`, answers `rebuilt: true` with no `free_uses_remaining`, keeps a signed-in rebuild as its own report, stops at the fourth in a day, and refuses when `RIYP_ASK_FIRST=0`.
- The Report Lab on the production build, screenshotted at 390, 1024 and 1440 (`2026-11-weak-and-strong/build/`): Kevin as the live product reads him (gap flagged), the questions screen with six questions (the first fix's line, the dated gap, the daily-tasks line, then three of the report's open questions); the same output as a report (`Not ready yet`, `Three Critical Misses. Start with this one.`); Meredith's 92 (`Clear and specific`, `The question they'd ask.`, `Worth tightening.`, `Send it. Then read it against the posting you're going for.`, and no "Critical Miss" anywhere on the page, checked case-insensitively); the sample report unchanged. No horizontal overflow from the product at 390; the one overflow found was the lab's own toolbar select, now capped.
- In the browser: the keyboard walks field, skip, field, skip; `Write my report` composes the typed answer into the quoted line (`Duties included maintaining records and updating reports: the daily shipment log.`) and the lab shows the resume the report would be written from.
- Not verified here: a live model run of the rebuild (the mock returns one canned report whatever the page); the anonymous flow end to end (needs Redis and the proxy header, as every local walk has); dark mode (documented as forced off); real people.

## Where it stands

- Built on this branch; the interview, the sketches and this record are the earlier commit (c45b6454).
- The working notes and the screenshot scripts live in the session scratchpad (`implementation-notes.md`, `shoot.cjs`, `shoot-lab.cjs`); the sketches and phone screenshots are copied here, and the Report Lab (`/internal/report-lab`) has an `Ask first` state and a "Kevin as the live product reads him" fixture, so the next session needs neither.
