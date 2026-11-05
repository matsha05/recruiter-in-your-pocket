# What a weak resume deserves, and what a strong one does

Date: November 5, 2026. Branch `claude/concept-weak-strong-1aeb11`, cut from `main` at `d15fc69c`. Status: **interviewed and sketched; no direction chosen yet; no product code changed.** Matt paused after the sketches ("we just did a lot of product work, I'll come back here"). The next session starts at "Where it stands".

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

## Where it stands

- Interview done; six sketches made and screenshotted; this record written. Nothing built, nothing merged.
- Open with Matt, asked and unanswered when he paused: which direction for Kevin, which for Meredith, and how far to build this session (both without prompt changes, the strong end only, or the record alone).
- The working notes and the screenshot script live in the session scratchpad (`implementation-notes.md`, `shoot.cjs`); the sketches and phone screenshots are copied here so the next session needs neither.
