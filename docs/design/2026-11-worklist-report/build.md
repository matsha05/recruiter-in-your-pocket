# The worklist report: the build

Date: November 6, 2026. Branch `claude/worklist-surface`, cut from `main` after PR 76 (the prompt, its contract and validator). Status: built and verified on a production build; Matt's read of five reports and the public copy decisions (`docs/promptops/proposals/2026-11-worklist-public-copy.md`) remain.

Companions: [README.md](README.md) (what Matt chose and why), [sketch.html](sketch.html) Shape 2, [the brief's final section](../../promptops/proposals/2026-11-prompt-rewrite-brief.md), [the measurement](../../audits/2026-11-worklist-run.md), the loop in `.claude/commands/new-surface.md`.

## Spec

- **Who it is for.** Everyone who runs a report: the person with a weak page (every vague line called out, in order, with an example and a question), and the person with a strong one (a short write-up, a keep card, nothing manufactured).
- **What it must say.** The score and its rung. The verdict in one sentence. The recruiter's write-up: what a recruiter takes from the page, the first hesitation, the best-written line as a model, the structural things in plain words. Then one card per line that needs work: the line as written, what a recruiter can't tell, the example with blanks, the question. Fit at the end. No Critical Miss, nothing called "the read".
- **What the person does next.** Fills the blanks on a card in their own words, copies the line, drops it into the resume; a signed-in report keeps the answers. Then re-checks the revision, or reads it against a posting.
- **Out of scope this PR.** The public copy that names the old unit (Matt's table); the judge; the "I did related work" state from the questions-first screen (the card has "I don't know yet"; related work is a follow-up); Hide on a card.
- **How we know.** The production build renders the five live-set reports and the mock at 390, 1024 and 1440 with no overflow; the focused tests and the report specs pass; the PDF prints the same content; Matt reads the five reports.

## Step 1 and 2 of the loop

The interview and the sketches ran on November 5 (README). This build follows Shape 2's structure, not its CSS: the system's tokens, type roles, Paper, the pen and the marker.

## The build

- `web/components/workspace/report/worklist/WorklistReport.tsx`: the document. `ReportStream` branches to it for a `contract_version: "v3"` report and keeps the marked page for the v2 reports saved before it; `ReportEnding.tsx` is the ending both share, extracted unchanged.
- `WorklistCard.tsx`: one card. The quoted line is the site's clipping (`Paper` strip, the neighbours fading, `MarkerStroke` drawn on scroll-in); a structural item is a dashed pen statement; the example is split on its brackets by `lib/reports/worklist-presentation.ts` and re-rendered with the answers in the blanks; one input per blank; Copy waits for every blank; `I don't know yet` leaves the card; a signed-in report keeps the answers by card position with each blank's label as the question (`reports.line_answers`, now up to twelve cards).
- `WorklistComparison.tsx`: the re-check for two worklist reports: lines off the list, still there, new, and the score as a change.
- `Worklist.module.css`: phone first, one column; the fields pair up from 640px; cards are bordered blocks on the ground, never paper.
- The PDF (`lib/reports/pdf-export.ts`, `lib/backend/pdf.ts`, `pdf-styles.ts`): the same order, the blanks in blue, a kept answer printed in its blank.
- The header row names the first fit role; the section tabs are Overview, Line by line, Role fit; the wait screen's ladder ends on the quote check, since the second model call no longer runs.
- `RIYP_WORKLIST_REPORT` now defaults on; the mock, the sample (`public/sample-report.json`, regenerated on `resume_v3` `18e7e9ff`, $0.008) and the Report Lab's leading fixtures are worklist reports; the homepage clipping and the methodology clipping are requoted from the new sample; the first-read diagram quotes its cards.

## Deviations

- **The sample's blanks can be filled.** The spec said the sample has no one to answer; the cards are more convincing played with, and nothing is kept, so the inputs stay on the sample page.
- **"Keep as is" on a page with nothing else.** A strong page shows the heading `Nothing here needs work.`, the keep card and the ending; the sketch showed only the write-up. The keep card is the model the write-up points at, so it stays.
- **No "related work" state.** The questions-first screen's three states were cut with that screen; the card has fill and `I don't know yet`. Related work is a follow-up (a card for a line the resume doesn't have yet).
- **No "Was this the right thing to fix first?"** The Critical Miss carried that one-tap feedback; a worklist has no single first thing, so the report asks nothing of the kind. Feedback on a card (right line, wrong line) is a follow-up once the judge's calibration says what to collect.
- **Cards on the sample and on recovered reports have no ghost neighbours** when the resume text isn't in the visit, as the clipping already behaves.

## Outside critique

A fresh subagent that had not seen the build reviewed the 390, 1024 and 1440 captures against Impeccable's critique method with the house docs outranking it. Ten findings, ranked; what was done with each:

| # | Finding | Done |
| --- | --- | --- |
| 1 | A bracket that is a suggested value ("[Customer operations specialist]") becomes a blank with that text as its label; three fields for a one-title question | The prompt now asks for a short noun per blank ("[number]", "[tool]"), never a suggested answer or a clause with a condition; one example per undated role. A second bracket kind (suggestion) is a follow-up if the next live set still shows suggestions. |
| 2 | Structural examples were all blank ("[dates] [work, study...]") | The prompt starts a dates example with the page's own last date: "June 2023 - Present [what you've been doing...]". Pass 4 shows it. |
| 3 | Twelve cards and no count on a phone | "3 of 12" beside the card's label, once there are three or more cards that need work. |
| 4 | Field labels in lowercase blue read as the candidate's words and as unfinished | Labels are ink, sentence case, at every blank count; the blue stays on the bracket and the answer. |
| 5 | A disabled grey "Copy the line" pill on every card | Copy appears only once every blank is filled; until then the card asks and offers "I don't know yet". |
| 6 | Desktop cards a third empty, fields stretched past the line they serve | The card column is capped at reading width (46rem). |
| 7 | The keep card repeated the write-up, and "The model for the rest" sat above nothing | The prompt gives the keep note a different job; the secondary label shows only when there are cards that need work. |
| 8 | Ghost lines cut mid-word on phones | The horizontal fade starts earlier below 640px, so the cut edge reads as a fade. |
| 9 | "How the score is built" (link) forty pixels from "How the score works" (disclosure) | The disclosure is "What the rung and the number mean". |
| 10 | Olive card labels revived the miss palette on cards with no yellow | Card labels are ink. |

Copy the critique read as AI, and what changed: "specific" in blanks (banned in the prompt); "verify" ("actually did"); "size it" ("how big"); "get you read" and "rung" in the person's text (the product's words stay out of the report); commentary about writing ("give the line a job to do") replaced by the work itself. The critique's "working, don't touch" list (the opening row, the write-up in the pen, the clipping with the marker, blue blanks in a Literata example, the dashed statement, the keep tick, the "Left for now" line) is unchanged.

## Verification

On the production build in the worktree, with the mock model and hermetic Supabase values:

- `tsc --noEmit`, `lint`, and the unit groups `test:report-integrity` (including the new `worklist-presentation.test.ts`), `test:pdf-export`, `test:llm-contract`, `test:stream-contract`, `test:sample-report`, `test:backend-contracts`, `test:analytics-privacy`: green.
- Playwright: `worklist-report.spec.ts` (the cards, the blanks, Copy, the kept answers on a saved report, the phone width), `report-first-screen`, `report-navigation`, `mobile-resume-experience`, `product-motion`, `first-report-wait`, `report-answers` and `revised-line-polish` (the v2 report's answer flow, unchanged), `output-identity` (the PDF), `accessibility` (axe on the sample at 390 and 320), `workspace-handoffs`, `paid-decision`: 116 passed, 1 skipped (a LinkedIn motion case the spec itself skips), 1 failed (the known v2 case below), on the production build of November 6.
- Known: the v2 first-screen case for the saved `synth_product_manager_entry_elite_1` output (the first question field ends 7% below the fold at 390) fails on this branch and failed the same way on the pre-change tree (`claude/worklist-direction`, run on November 6), so it is unrelated to the worklist; the v2 document is untouched here. The red-team journeys run with their own runner (`npm run test:redteam-journeys`, Next dev for the anonymous ledger): 11 of 11 passed on November 6; the posting case now checks the worklist card (blanks, the composed example, Copy once every blank is filled) in place of the Critical Miss flow. A first run of that set failed its first two pages on hydration during the dev server's first compile and passed clean on the rerun; that is the known dev-mode flake, not the report.
- Captures at 390, 1024 and 1440 of the bad, thin, strong, mismatch, tier and mock reports: no horizontal overflow at any width; the PDF of the sample and of the bad resume rendered and read.
