# The signature report (plan Phase 2, with 1.7, 1.8 and D5)

Date: 2026-11-01
Status: Built on branch `claude/hopeful-grothendieck-c224df`. Not pushed, merged, or deployed. The copy and band anchors marked "pending" are waiting on Matt.
Plan items: 2.1 to 2.6 in [70-audit-remediation-plan.md](70-audit-remediation-plan.md), plus 1.7 (recovered reports), 1.8 (hiding a suggestion), D5 (score bands) and D2's "Nothing critical".

## The idea

The report becomes a resume a recruiter has marked up. The candidate's own lines sit on the left with the blue-ink rule, the recruiter's notes are written in the right margin in pen, and the Critical Miss line carries the one highlighter. Under the Critical Miss the candidate answers one to three questions, and a revised line is built from their line and their answers only. Copy turns on only when the facts check out.

## Decisions

| # | Decision | Why |
| --- | --- | --- |
| 1 | The page shows the lines the report quotes, not the whole resume | Saved reports, recovered reports and the PDF don't have the resume. Quoted lines look the same everywhere (2.4) |
| 2 | The revised line is the original line plus the answers, word for word, after a colon | It is the only composition the existing guard passes on real outputs (see Evidence). Nothing is paraphrased, so the only words we add are punctuation |
| 3 | Edits may reword freely; a new number, name or claim (for example "led") must come in as an answer first | The guard stops us putting words in the candidate's mouth. Their own rewording is theirs, but an inflated claim needs a deliberate step |
| 4 | Score bands with anchors on the first report; the number only in revision comparisons (D5) | Thresholds match the validator's `score_label` (85 and 70) |
| 5 | "Nothing critical" is `top_fixes[0].impact_level === "low"` | The ranking session's prompt marks it that way (D2) |
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
- **Fixes 2 and 3:** "Work on this line" opens the same interaction. "Nothing critical" opens it the same way, since the fix is optional.
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

## Hide this suggestion (1.8)

Every row has Hide. The row collapses in place to "Critical Miss hidden. It stays hidden on this device." with "Bring it back". Focus moves to "Bring it back" after Hide, and back to the row after it returns. A fix hidden on an earlier visit never takes focus on load. Hidden rows persist in `localStorage` per report (its id, or a hash of its opening line), wrapped in try/catch. The Critical Miss appears only once, so there is no separate overview to fall out of step.

## Was this right? (2.6)

On the Critical Miss: "Was this the right thing to fix first?" (for Nothing critical, "Was this right?"). Yes sends at once. No opens an optional "What should it have been?" before Send. Then: "Thanks. Answers like this are how we check the read." It replaces the mailto ending.

`POST /api/report-feedback` (8 KB limit, 20 per hour per user or anonymous identity):

- Always counts `riyp.report.critical_miss_feedback` (answer, has note, nothing critical, viewer) as a PII-free launch signal in Sentry.
- Stores the answer in `report_feedback` (migration `022_report_feedback.sql`): the model's Critical Miss wording, the answer, the optional note, the report id when saved, and the user id when signed in (deleted with the account). It never stores the resume or its quoted line.
- If storage fails and there is a note, the request returns 503 and the reader sees "Couldn't send that". A bare yes/no is still counted.

**Before deploy:** apply migration 022 in production (needs Matt's OK), and add one line to the privacy page about Critical Miss answers.

## PDF

The same order: Verdict, band (name, bar, anchor; no number), "Fix these three first." with each marked line (the line on the left, the label and pen note in the margin, the Critical Miss line highlighted), "Before the bullets", "Keep this one", then "Keep these. They're working.", suggested edits, role fit, next steps. `normalizeReportForPdf` now carries each fix's quoted line, its section, and `nothing_critical`.

## Copy (follows the approved word list; new strings pending Matt)

| Where | Copy |
| --- | --- |
| Fix heading | "Fix this first." / "Fix these two first." / "Fix these three first." Nothing critical: "Nothing to fix first." (pending) |
| Critical Miss label | "Critical Miss" / "The one thing to fix first". Nothing critical: "Nothing critical" / "An optional refinement" (pending) |
| Bands (pending) | Needs more context: "The jobs are easy to follow. What you did in them mostly isn't." Mostly clear: "Most lines show what you did. A few leave your part or the result unclear." Clear and specific: "Lines say what you did and what changed because of it." |
| Questions (pending) | "Answer and we'll add it to your line." / "Only what's true. Skip anything you don't know." / "I don't know" / "I didn't do this" |
| Line (pending) | "Revised line", "Your wording", "Every word is from your resume or your answers. Reword it however you like.", "Addressed" |
| Feedback (pending) | As above |
| Ending | "Made your edits? See what changed." / "Compare my revision" (existing). Addressed: "Your line is ready. See how the whole page reads now." (pending). The comparison copy now says the Critical Miss "changed", never "fixed" |

## Files

- Report: `components/workspace/report/ReportStream.tsx`, `markup/{MarkedRows,LineLift,MissFeedback,ScoreBand}.tsx`, `markup/useHiddenFixes.ts`, `markup/MarkedReport.module.css`. `FixCanvas` is retired.
- Rules: `lib/reports/revised-line.ts`, `lib/reports/score-band.ts`, `lib/reports/report-feedback.ts`, `fixPlanHeadingForCount` and `isNothingCritical` in `lib/reports/report-presentation.ts`.
- Shells: `components/layout/ReportLayout.{tsx,module.css}`, `ReportPanel.tsx`, `ReportDetailClient.tsx`, `WorkspaceClient.tsx` (`data-document`), `app/globals.css`.
- PDF: `lib/backend/pdf.ts`, `pdf-styles.ts`, `lib/reports/pdf-export.ts`.
- Feedback: `app/api/report-feedback/route.ts`, `database/migrations/022_report_feedback.sql`, `lib/observability/launchSignals.ts`, `lib/analyticsPolicy.ts` (`critical_miss_addressed`).
- Prototype harness: `/internal/report-lab` (dev or `ALLOW_INTERNAL_PAGES`), with every saved output in fresh, recovered and saved states, the sample, and a constructed Nothing critical case.

## Not done here

- A model-polished revised line. It would need a new prompt, a paid eval, and a looser guard (decision 2).
- The revised line in the PDF. The export rebuilds the report from the server's validated copy, so session edits don't reach it.
- Usability sessions (6.2) for "most participants produce a line they'd use".
