# The signature report (plan Phase 2, with 1.7, 1.8 and D5)

Date: 2026-11-01
Status: Built on branch `claude/hopeful-grothendieck-c224df`. Not pushed, merged, or deployed. Decided (Nov 1): Matt chose quoted lines only, the band anchors as written, and guarded polish; the coordinator approved the new copy and the motion.
Plan items: 2.1 to 2.6 in [70-audit-remediation-plan.md](70-audit-remediation-plan.md), plus 1.7 (recovered reports), 1.8 (hiding a suggestion) and D5 (score bands). "Nothing critical" (D2) was dropped on Nov 1: every report names a Critical Miss.

## The idea

The report becomes a resume a recruiter has marked up. The candidate's own lines sit on the left with the blue-ink rule, the recruiter's notes are written in the right margin in pen, and the Critical Miss line carries the one highlighter. Under the Critical Miss the candidate answers one to three questions, and a revised line is built from their line and their answers only. Copy turns on only when the facts check out.

## Decisions

| # | Decision | Why |
| --- | --- | --- |
| 1 | The page shows the lines the report quotes, not the whole resume | Saved reports, recovered reports and the PDF don't have the resume. Quoted lines look the same everywhere (2.4) |
| 2 | The revised line starts as the original line plus the answers, word for word, after a colon; a guarded polish may replace it | The literal line always passes the guard (see Evidence). Matt chose "Guarded polish now": a model smooths it, and the smoother line shows only if every word traces to the line or the answers (see "Guarded polish") |
| 3 | Edits may reword freely; a new number, name or claim (for example "led") must come in as an answer first | The guard stops us putting words in the candidate's mouth. Their own rewording is theirs, but an inflated claim needs a deliberate step |
| 4 | Score bands with anchors on the first report; the number only in revision comparisons (D5) | Thresholds match the validator's `score_label` (85 and 70) |
| 5 | Always a Critical Miss; the layout is ready for up to three | Matt: "Always name a top fix" and "Up to three Critical Misses" (next prompt). `criticalFixCount` is the one place a v3 marker is read; rows, the highlighter (sweeping only the first), the revised-line flow, its polish and the PDF follow it |
| 6 | One signature motion: the highlighter sweeps the Critical Miss line once, then the note fades in | Reuses `Mark` and `useSeen` from the research figures. The old staggered reveal of the opening is gone; report prose stays still |

## Layout

Order on every route: Verdict, score band, the marked page (Critical Miss, then "Before the bullets", then "Keep this one", then Fix 2 and Fix 3), independent advice, Keep, role fit, how the score works, full recruiter notes, the next step.

- **960px and wider:** each row is a two-column grid. The line and the questions sit on the left; the margin (16rem, 19rem from 1280px) holds the label, the pen note, the reason, Hide, and "Was this right?". A pen-tinted rule runs down the margin.
- **Below 960px:** each row is a card in reading order: label, line, note, questions, reason, feedback. The note's parts slot around the line with `display: contents` and `order`, so nothing renders twice.
- **Phones (2.5):** the band name and bar share one row; the fix heading is kept for screen readers only; the Critical Miss's section name and the step rail wait for 640px; the section tabs stay out of the first screen and slide in under the header once the opening has scrolled away.
- **One document scroll (2.4):** the workspace and sample shells switch from a fixed-height panel to the page scroll while a report shows (`.workspace-product-shell[data-document]`); the saved page drops its inner scroller. The sticky tabs sit under whichever header the route has (`--report-sticky-top`).

Type is the shared roles only (verdict, heading, lead in Literata for quoted lines, note, body, small, label). Colors are the Highlighter tokens. The guardrail passes with 0 raw font sizes and 7 radii.

## The answer to revised line (2.2, 2.3)

- **Questions:** the Critical Miss's own missing-detail questions from the integrity pass. A compound question ("Which report did you prepare, and who used it?") becomes two fields when both halves are questions. With none, a fix's bracket placeholders give the questions; failing that, one open question ("What would you add to this line?").
- **Each question:** a field, plus "I don't know" (left out for now) and "I didn't do this" (left out; it's not their work). If every answer is "I didn't do this", the line says "Then this one isn't yours to fix" and "Was this right?" opens with the note field.
- **The line:** builds as they type. Their answers are underlined in blue ink. Edit opens it as text.
- **States, from `liftState`:** open, partly (some "I don't know"), addressed (every written answer is in the line), unknown, not mine. "Addressed" shows on the Critical Miss label and changes the ending's heading. The step rail (Your line, What's missing, Your answers, Revised line) follows these real states.
- **Fixes 2 and 3:** "Work on this line" opens the same interaction.
- **Without the resume:** the quoted excerpt stands in as the source. The note says why, accurately: "This page was reloaded…" for a recovered report, "Saved reports don't keep your resume…" for a saved one. "Paste your resume to work on the whole line" reattaches it in memory only, after checking that it contains the quoted lines (1.7).

### The copy rule (`revisedLinePolicy`)

1. The unedited composition must pass `resolveRewriteCopyPolicy`, with the answers as verified facts, waiving only its relationship-binding check. That check stops a rewrite from attaching a metric to a different action, and it refuses lines it can't parse. Nothing was rewritten here, so it is waived only for the exact composition.
2. An edited line may drop or reword words, but any new protected fact (number, name, tracked claim) blocks Copy and is named back: "“55”, “Google” isn't in your line or your answers. If it's true, add it as an answer first."
3. An empty line is never copyable.

## Evidence (13 saved production-prompt outputs, golden resumes, 2026-11-01)

- Composed lines with fictional answers pass the guard on 13 of 13 reports, with the resume and without it (saved).
- Model-style polished rewrites of the same lines failed the guard ("screening" vs "screened", "including", rebound metrics).
- 9 of 37 fix lines fail the guard even unchanged, all on the relationship check. This is why that one check is waived for the exact composition.
- An edit from "Helped oversee" to "Led" is blocked (`lead`); an invented "55" and "Google" are blocked; rewording the candidate's own facts is allowed.
- `tests/revised-line.test.ts` encodes all of the above and runs in `test:report-integrity`.

## Guarded polish (Matt, Nov 1: "Guarded polish now")

**Why.** The literal line is honest but reads like a form ("…using AWS: moved the billing service off the monolith; wrote the migration scripts"). A recruiter skims bullets, and a candidate is more likely to use a line that reads as one. The risk with any model rewrite is invented scope or results, so the model only proposes and a deterministic guard decides.

- **Prompt:** `web/prompts/revise_line_v1.txt`, recorded as `revise_line_v1:<sha8>` in logs and eval output; the build trace asserts it ships with the route. It may reorder, drop filler, and join with and/to/for/of/with/by/in/on/at/the/a/an. It may not add any word, change a word's form (the existing guard folds plurals only, so tense changes fail it), add numbers, names, scope, intensity or outcomes, shrink or grow the candidate's part, or drop an answer.
- **Model:** `resolveOpenAIModel("revise_line")` (the non-resume path: `OPENAI_MODEL`), production tuning, structured output `{ line }`, 10-second timeout, no retries.
- **Guard (`checkPolishedLine`, run on the server and again in the browser):**
  1. Every number and capitalized name comes from the line or the answers.
  2. Every other word, stemmed, comes from the line or the answers. Joining words are not exempt in production (`POLISH_ALLOWS_JOINERS = false`), so "Every word is from your resume or your answers" stays literally true.
  3. The existing fabrication guard passes, with the answers as facts. Only its relationship check is waived, and only when the literal line fails it too.
  4. Nothing is lost: every answer and every number from the line is still there.
  Anything else falls back to the literal line.
- **Endpoint:** `POST /api/revise-line`.
  - Callable only for a fix line from a report the visitor can open: their saved report (signed in), or their anonymous report's recovery (cookie-bound). The line must contain the report's quoted excerpt.
  - Caps: excerpt 400, line 600, one to three answers of 300 characters each, body 8 KB. Rate limit 30 an hour per identity.
  - `RIYP_DISABLE_GENERATION` turns it off. Every refusal or failure answers `line: null`, and the counter `riyp.revise.outcome` (polished, fallback, or error, with a closed reason) records it.
- **UX:**
  - The literal line shows at once. After the answers settle (1.2 seconds), the browser asks for a polish, re-checks it, and swaps it in.
  - "Use my exact words" switches back, and "Use the smoothed line" switches again.
  - Edits re-run the edit rule, and Copy follows it. The sample has no report context, so it keeps the literal line.
- **Eval:** `scripts/eval-revise-line.ts` runs the 13 saved outputs with realistic answers plus adversarial answers ("we crushed it", vague scope, an inflated role). It reports the strict pass rate, the pass rate with joining words, fallback reasons and a before/after sample, with a $5 cap. Results: `tests/fixtures/results/summary_revise_line_<date>.md`.

## Hide this suggestion (1.8)

Every row has Hide. The row collapses in place to "Critical Miss hidden. It stays hidden on this device." with "Bring it back". Focus moves to "Bring it back" after Hide, and back to the row after it returns. A fix hidden on an earlier visit never takes focus on load. Hidden rows persist in `localStorage` per report (its id, or a hash of its opening line), wrapped in try/catch. The Critical Miss appears only once, so there is no separate overview to fall out of step.

## Was this right? (2.6)

On the first Critical Miss: "Was this the right thing to fix first?". Yes sends at once. No opens an optional "What should it have been?" before Send. Then: "Thanks. Answers like this are how we check the read." It replaces the mailto ending.

`POST /api/report-feedback` (8 KB limit, 20 per hour per user or anonymous identity):

- Always counts `riyp.report.critical_miss_feedback` (answer, has note, viewer) as a PII-free launch signal in Sentry.
- Stores the answer in `report_feedback` (migration `022_report_feedback.sql`): the model's Critical Miss wording, the answer, the optional note, the report id when saved, and the user id when signed in (deleted with the account). It never stores the resume or its quoted line.
- If storage fails and there is a note, the request returns 503 and the reader sees "Couldn't send that". A bare yes/no is still counted.

**Before deploy:**

- Apply migration 022 in production. This needs Matt's OK.
- Add one line to the privacy page about Critical Miss answers.
- Include a signed-in reader's `report_feedback` rows in the account export (`lib/backend/accountExport.ts`). Deletion already cascades with the account.

## PDF

The same order: Verdict, band (name, bar, anchor; no number), "Fix these three first." with each marked line (the line on the left, the label and pen note in the margin, the Critical Miss line highlighted), "Before the bullets", "Keep this one", then "Keep these. They're working.", suggested edits, role fit, next steps. `normalizeReportForPdf` now carries each fix's quoted line, its section, and `nothing_critical`.

## Copy (follows the approved word list; new strings pending Matt)

| Where | Copy |
| --- | --- |
| Fix heading | "Fix this first." / "Fix these two first." / "Fix these three first." |
| Critical Miss label | "Critical Miss" / "The one thing to fix first" (the definition only on the first; the copy for several Critical Misses ships with v3) |
| Bands (approved) | Needs more context: "The jobs are easy to follow. What you did in them mostly isn't." Mostly clear: "Most lines show what you did. A few leave your part or the result unclear." Clear and specific: "Lines say what you did and what changed because of it." |
| Questions (approved) | "Answer and we'll add it to your line." / "Only what's true. Skip anything you don't know." / "I don't know" / "I didn't do this" |
| Line (approved) | "Revised line", "Your wording", "Every word is from your resume or your answers. Reword it however you like.", "Addressed" |
| Feedback (approved) | As above |
| Ending | "Made your edits? See what changed." / "Compare my revision" (existing). Addressed: "Your line is ready. See how the whole page reads now.". The comparison copy now says the Critical Miss "changed", never "fixed" |

## Files

- Report: `components/workspace/report/ReportStream.tsx`, `markup/{MarkedRows,LineLift,MissFeedback,ScoreBand}.tsx`, `markup/useHiddenFixes.ts`, `markup/MarkedReport.module.css`. `FixCanvas` is retired.
- Rules: `lib/reports/revised-line.ts`, `lib/reports/score-band.ts`, `lib/reports/report-feedback.ts`, `fixPlanHeadingForCount` and `isNothingCritical` in `lib/reports/report-presentation.ts`.
- Shells: `components/layout/ReportLayout.{tsx,module.css}`, `ReportPanel.tsx`, `ReportDetailClient.tsx`, `WorkspaceClient.tsx` (`data-document`), `app/globals.css`.
- PDF: `lib/backend/pdf.ts`, `pdf-styles.ts`, `lib/reports/pdf-export.ts`.
- Feedback: `app/api/report-feedback/route.ts`, `database/migrations/022_report_feedback.sql`, `lib/observability/launchSignals.ts`, `lib/analyticsPolicy.ts` (`critical_miss_addressed`).
- Prototype harness: `/internal/report-lab` (dev or `ALLOW_INTERNAL_PAGES`), with every saved output in fresh, recovered and saved states and the sample.

## Verification (local only, production build of this branch, dummy CI environment, mock model)

- Node suites: `test:report-integrity` (including `revised-line`), `test:source-fidelity`, `test:pdf-export`, launch signals, and analytics privacy. `qa:design-system` and lint pass on the changed files; `npm run build` passes.
- **Phone first screen, 390×844:** the Critical Miss appears once, and its first answer field is on screen for the sample and the five longest real outputs. The worst case is the 277-character Verdict, about 2px inside the fold.
- **Every width:** no horizontal overflow and no inner scrollers at 390, 1024 and 1440.
- **UI specs on the build:** report navigation, mobile resume experience, red-team journeys, product motion, paid decision, workspace handoffs, accessibility. Seven failures are environmental here and none of them reach report code:
  - Red-team 4, 5, 10 and 11 need the anonymous-access backend.
  - Paid decision's two confirmation cases stop at the purchase page.
  - The internal-route 404 check fails because this build allows internal pages for the lab.

## Not done here

- A model-polished revised line. It would need a new prompt, a paid eval, and a looser guard (decision 2).
- The revised line in the PDF. The export rebuilds the report from the server's validated copy, so session edits don't reach it.
- Usability sessions (6.2) for "most participants produce a line they'd use".
