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

## Second pass: the page, not the boxes (November 6)

Matt read the five in the Report Lab: "i love the content i think its way improved. visualization i'm unsure of." A deep pass on the captures at 390, 1024 and 1440 against the brand system found four things, and the list was rebuilt around them:

| Finding | What changed |
| --- | --- |
| The page ignored its width: everything sat in a 46rem column on the left of a 1200px sheet, so two-thirds of the paper was empty at desktop and the strong resume's one card floated in a blank field. | From 960px each entry is a row of three columns: the margin (where the line sits, "5 of 12", the Filled in pill), the evidence (the clipping with the marker, then what a recruiter can't tell), and the answer (the question, then the example). A keep entry has no answer column and takes the width. The write-up keeps its reading column. |
| Twelve identical bordered boxes, the card farm the brand system names as a hard no: every card stacked the same five parts with three left-rule treatments, and the bad resume ran to about 8,000px at 1440. | Entries are divided by hairlines, never boxed; the pen note lost its rule (it is the margin-note register, in the pen, and needs no frame); the only frames left are the clipping's paper and the dashed statement of a structural item. The bad resume is about 5,400px at 1440. |
| The fields dominated: a labelled form grid under each question, 24 fields on the bad resume, every label repeating the blank already in the sentence. | The example is the form. Each blank is a field inside the sentence, in the candidate's blue, named by its placeholder and sized to what it holds; a phrase-length blank or answer takes its own line. The question above is the group's label. Copy still waits for every blank. |
| The v2 leftovers ("Why we read it this way", the score link) sat between the cards and the fit section. | They follow the fit section, before the rung disclosure, so the list runs straight into fit. |

Checked after: no horizontal overflow at 390, 1024 or 1440 on the bad, tier and strong fixtures; a comma after a blank stays on the blank's line; a filled entry shows its pill in the margin and Copy under the example; the inline fields keep their accessible names (the blank's label) and the question as the group label.

## Third pass: the typography (November 6)

Matt, on the second pass: "i love the score plus bands and the summary section. however i dont know about the font selection and spacing overall. its hard to read. its just like a blob of text. i love the highlighting and also the examples you give. its mostly spacing, font selection, variety of colors. it just doesnt seem high craft." Then: "do more abstract thinking, external design research, see how other world class products handle this or would handle this. be thoughtful and act from first principles."

The thinking is `typography-brief.md` (what the list is, what the world-class versions do, eight principles, sources). Four sketches (`type-sketches.html`); D follows the brief and was built. The list is now a reviewer's marks on a manuscript: the quoted line and the example are the same resume before and after, set in the document's own face (`--font-document`, the clipping's face, not Literata) at the strip's size and left edge, so they read as a diff; the recruiter's query between them in the sans; the note as marginalia in the pen beside the line from 960px and under it on a phone; color in the text only; hairlines between entries.

A fresh subagent then reviewed the captures as a staff product engineer (Anthropic, Google, OpenAI bar). Verdict: "Not yet. The blob is gone and the three-hands idea reads, but the entry's vertical craft isn't there." Ten findings, all applied:

| # | Finding | Done |
| --- | --- | --- |
| 1 | The marker covered only the first line of a wrapped quote on desktop | The clipping's phone rule (a background sweep with `box-decoration-break: clone`) is the worklist's marker at every width; the SVG stroke is not used here |
| 2 | The note sat 30px above the line it annotates | `.cannot` pads past the strip's top padding and, when a neighbour is drawn above the line (`data-ghost-above`), past that ghost line too |
| 3 | 96px between entries against 12px inside | Entries 28px/32px apart at 960+ (20/24 on phones); 12px row gap |
| 4 | The question was the faintest text on the entry; the escape hatch outweighed it | The question is body size in ink; "I don't know yet" is the quiet weight in muted |
| 5 | The dashed statement doubled the note's voice (both pen italic Literata) | The statement is in the document's hand, upright, at the strip's size: a fact about the page; the note stays the pen |
| 6 | A phrase-length placeholder truncated on the phone | A phrase-length blank is a one-row textarea that wraps and grows to what it holds |
| 7 | A filled long blank kept its rule to the column edge | The rule hugs the words once there are any (`min(Nch, 100%)`) |
| 8 | Punctuation floated after a blank | Field padding 0.1em, half a character of slack, a negative right margin |
| 9 | Focus put the pen's green on the candidate's blue field | Focus is blue ink, 3px radius, 1px offset |
| 10 | On phones the note ran full width and read as a paragraph of the write-up; a hairline sat 45px over another | The note takes the line's indent below 960px; `.unlisted` lost its rule |

Plus its copy note: the strong page's lead repeated the ending's sentence word for word; the lead is gone. Its three keeps (the strip with ghost neighbours, before/after in one hand on one left edge, the filled state in the margin) are untouched. Its disagreements with the brief (the question deserves body size in ink; focus is the candidate's blue; a statement about the page is not the pen's italic; the brief never addressed a wrapped quote) were all taken; the brief records them.

## Verification

On the production build in the worktree, with the mock model and hermetic Supabase values:

- `tsc --noEmit`, `lint`, and the unit groups `test:report-integrity` (including the new `worklist-presentation.test.ts`), `test:pdf-export`, `test:llm-contract`, `test:stream-contract`, `test:sample-report`, `test:backend-contracts`, `test:analytics-privacy`: green.
- Playwright: `worklist-report.spec.ts` (the cards, the blanks, Copy, the kept answers on a saved report, the phone width), `report-first-screen`, `report-navigation`, `mobile-resume-experience`, `product-motion`, `first-report-wait`, `report-answers` and `revised-line-polish` (the v2 report's answer flow, unchanged), `output-identity` (the PDF), `accessibility` (axe on the sample at 390 and 320), `workspace-handoffs`, `paid-decision`: 116 passed, 1 skipped (a LinkedIn motion case the spec itself skips), 1 failed (the known v2 case below), on the production build of November 6.
- Known: the v2 first-screen case for the saved `synth_product_manager_entry_elite_1` output (the first question field ends 7% below the fold at 390) fails on this branch and failed the same way on the pre-change tree (`claude/worklist-direction`, run on November 6), so it is unrelated to the worklist; the v2 document is untouched here. The red-team journeys run with their own runner (`npm run test:redteam-journeys`, Next dev for the anonymous ledger): 11 of 11 passed on November 6; the posting case now checks the worklist card (blanks, the composed example, Copy once every blank is filled) in place of the Critical Miss flow. A first run of that set failed its first two pages on hydration during the dev server's first compile and passed clean on the rerun; that is the known dev-mode flake, not the report.
- Captures at 390, 1024 and 1440 of the bad, thin, strong, mismatch, tier and mock reports: no horizontal overflow at any width; the PDF of the sample and of the bad resume rendered and read.
