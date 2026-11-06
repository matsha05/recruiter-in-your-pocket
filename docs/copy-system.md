# Copy Operations

> Canonical voice guide: [`voice-and-tone.md`](./voice-and-tone.md)

This document is the operating system around that guide. It covers naming, structure, and the small rules that keep the product voice from drifting.

Last updated: 2026-11-01
Owner: Product + Design

## 1. Product Naming

User-facing noun:
- `report`

Supporting phrases:
- `recruiter report`
- `what a recruiter sees first`

Avoid mixing:
- `review`
- `analysis`
- `artifact`

If the user is looking at the generated output, call it a `report`.

### One name each (Matt, November 1, 2026)

Each of these things has one name everywhere: marketing, the app, the report, the PDF and email. When a label and a heading sit together, the label is the short form of the heading. Retired names must not come back.

| Thing | Name | Retired |
| --- | --- | --- |
| The button that starts a report, signed out (header, hero, section closes, research, sample end, pricing) | `Get your free report` | Read mine, Start a report, Review my resume |
| The workspace submit button | `Get your free report` while the free report is available; `Get my report` for a pass report; `Compare my revision` for a revision | None |
| Starting a report from signed-in navigation | `New report` | None |
| Strengths to leave alone | Keep: `Keep these` (report tab, PDF), `Keep these. They're working.` (section heading), `Keep this one` (label in the opening read) | Leave these alone, Don't touch this one |
| What to change (v2 reports saved before November 6, 2026; the worklist's names are in the section below) | Fix: `Fix these first` (report tab, PDF); headings `Fix this first.`, `Fix these two first.`, `Fix these three first.` until the report knows its Critical Miss count, then the count heading below; cards `Critical Miss` (`Critical Miss 1`, `2`, `3` when there are several), then `Fix 2 of 3`, `Fix 3 of 3` by position (Nov 2, 2026: the count travels with the card, since phones hide the heading) | Start with these changes, Suggested change |
| A problem that could cost an interview on its own (v2 reports only; no public page names it since November 6, 2026) | `Critical Miss`. A report names one to three, in priority order; the first is the one to fix first. Never `Nothing critical` (Matt, November 1, 2026). On a clear page with one miss (Matt, November 5, 2026) the word never appears: the row is `The question they'd ask`, the heading `The question they'd ask.` with `Not a reason to pass on you. Worth a sentence before you send it.`, and the other rows `Worth tightening` (`Worth tightening · 1 of 2`) under `Worth tightening.`; the ending is `Send it. Then read it against the posting you're going for.` with `Read it against a posting` | Nothing critical |
| Where the resume stands | The band: `Not ready yet`, `Needs more context`, `Mostly clear`, `Clear and specific`, each with its anchor sentence (`web/lib/reports/score-band.ts`). The bottom rung (Matt, November 5, 2026: "Band only") is the lowest band at 60 and below and reads `The jobs are listed. A reader can't tell what you did in them or what you've done since.` | None |
| The questions before the report (ask-first, November 5, 2026) | `{Count} questions before the report.` (`Six questions before the report.`), `A recruiter would ask these. They won't get to.`, `Only what's true. Every answer goes into your resume in your own words.`, the three honest states on a line question (Matt, November 5, 2026) `I did this`, `I did related work` (then `Say what the related work was. It goes on the page as its own line, not into this one.`), `I haven't done this` (then `Left out.`); `I don't know` on a general question (then `Answer it after all`); `Write my report`, `Skip the questions and read it as it is`. Every ask in a row is the model's words in the pen; where the note is the ask, the field says the shape of the answer (`What you've done since, with dates`, `The title you're applying for, as the posting writes it`, otherwise `Your answer`). The report written from the answers says `written from 6 answers` where the read time goes, and the wait says `Writing it up from your answers.` | Skip anything you don't know (as a line under the heading) |
| The negotiation section and its guides | `After the offer` | Resources, Career resources, All Resources |
| The example report | `Sample report` (navigation and page title). The homepage link names the candidate: `See Jordan's report` | See an example, Example report |
| A paid re-run of a revised resume | `Re-check`. Public copy: `see which lines came off the list`. The comparison says a line came `off the list`, is `still there` or is `new`, and the score as a change; on two v2 reports the Critical Miss `changed`, never `fixed` | None |
| Keeping a report in My reports | `Save this version` (the section row and the signed-in ending, Nov 2, 2026) | Save report |

### The worklist report (Matt, November 5, 2026; built November 6)

The report's unit is the line, not the Critical Miss (`docs/design/2026-11-worklist-report/`). Its names, in the product and the PDF:

| Thing | Name |
| --- | --- |
| The one-sentence read under the score | The verdict (the model's sentence; no label above it) |
| The recruiter's paragraphs | The write-up (no heading; it follows the verdict in the pen) |
| The section of cards | `Line by line, in the order a recruiter hits them.` (report tab `Lines`); on a page with no work: `Nothing here needs work.` with `Send it. Then read it against the posting you're going for.` |
| A card's label | The model's `where` (`Marketing Intern, line 1`, `Dates`, `Structure`); on the keep card `Keep as is` with `The model for the rest` |
| What a recruiter can't tell | The model's words in the pen; no label |
| The example | The line with the detail in, blanks in the candidate's blue; no label; once filled, `Filled in` on the card |
| The question and its fields | The model's question as the label; one field per blank, the blank's label as its name; `Copy the line`; `I don't know yet` then `Left for now. A blank reads as a question, and recruiters don't call to ask it.` and `Fill it in after all`; under a filled line `Every fact in it is from your resume or your answers.`; kept answers say `Kept with this report.` |
| After the cards | `Lines not listed are fine as written.` |
| Fit | `Roles your experience points toward.` / with a posting `How your experience fits this role.`; `Roles to consider` / `The role, as the posting names it`; `How the page reads: …`; `What the posting asks for that the page doesn't show` |
| The score note | `What the rung and the number mean`: `The rung is what a recruiter does with the page after one pass. The number says where in the rung it sits. It doesn't predict interviews or offers.` |
| The re-check | `N lines are off the list.` / `The same lines are on the list.` / `Every line you worked on is off the list.`; the score only as `Up N since last time.`; a line off the list is never called fixed |

Retired with it in the product: `Critical Miss`, the count headings, `The question they'd ask`, `Worth tightening`, `Keep this one`, `Fix these first`, the questions-before-the-report screen (the worklist asks on each card) and the wait screen's fifth stage. The public pages that still name the old unit are listed with proposed replacements in `docs/promptops/proposals/2026-11-worklist-public-copy.md`, which is Matt's call; until he decides, the rows below stand for those pages and for reports saved before November 6, which keep the v2 shape.

## 2. Canonical Report Structure

The main report navigation uses these labels:
1. `Overview`
2. `Fix these first`
3. `Keep these`
4. `Role fit`

Section headings follow the same names: `Fix this first.` / `Fix these two first.` / `Fix these three first.` and `Keep these. They're working.`

### The Critical Miss count (v2 reports saved before November 6, 2026) (Matt, November 2, 2026: "i dont want to lie to people and say they have one critical miss if there are more")

Once the severity check has flagged the report's Critical Misses, the count leads the fix section on the web and in the PDF, phones included. The heading says how many and where to start; the line under it says what makes them critical.

| Count | Heading | Line under it |
| --- | --- | --- |
| 1 | `One Critical Miss. Fix it first.` | `It's the one most likely to cost you the interview.` A judgment, not a guarantee: say nothing about the rest of the report |
| 2 | `Two Critical Misses. Start with this one.` | `Either one could cost you the interview on its own.` |
| 3 | `Three Critical Misses. Start with this one.` | `Any one of them could cost you the interview on its own.` |
| More than 3 | `More than three Critical Misses. Here are the three that matter most.` | `Any one of them could cost you the interview on its own. Start with the first.` |

A report without the severity check's flags (every report saved before it) states no count: it keeps the fix heading above and `The one thing to fix first` under its Critical Miss. Code: `criticalCountHeading` in `web/lib/reports/report-presentation.ts`.

The count bends to the page (Matt, November 5, 2026). On `Clear and specific` with one miss, counted or not, the heading is `The question they'd ask.` and the line under it `Not a reason to pass on you. Worth a sentence before you send it.`; the interview-cost line is wrong there (the November 5 live run: every clear page's miss was a method or example ask). With two or more flagged misses on a clear page the severity check has earned the count, and the table above stands. On `Not ready yet` the count stands too; what changes there is that the questions come before the report (`docs/design/2026-11-weak-and-strong.md`). The full recruiter notes and the five interview-style questions after the fixes were cut on November 5, 2026 (Matt); the PDF keeps its `Next steps` checklist.

Within each recommendation, show the original quotation, what needs clarification, and a suggested revision with any missing facts marked.

These are UI labels. Internal schema and prompt field names may remain stable; do not rewrite Matt's tuned backend prompt merely to match display copy.

## 3. Copy Budgets

Keep the product scanning clean.

Budgets:
- headline: 2 lines max
- subhead: 1 sentence, sometimes 2
- card description: 1 sentence
- CTA: 2-4 words
- error state: what happened + next step

These are layout guidelines, not a reason to force fragments or slogans. A natural sentence that explains the issue is better than a shorter sentence the reader has to decode.

No taglines, helper text, or secondary labels (November 3, 2026). A screen is its heading, its controls, and the facts the reader needs right there: a price, a term, a limit, a consent line, an error. No eyebrow above a heading, no sentence under it that restates it, no hint under a button that the button already says, no label on a pill that the title carries. If a screen stops making sense without one of those, fix the layout or the heading instead of adding the line back. Report findings, the Critical Miss count line, the pass terms, privacy facts, and errors are content, not helper text.

## 4. Tone by State

Marketing:
- sharper
- more opinionated
- one idea at a time

In-app report:
- calmer
- more direct
- no extra selling once the user is inside

Billing and recovery:
- short
- reassuring
- exact next step

Trust and policy:
- plain English first
- policy detail second

## 5. Claims Rule

Every strong claim needs nearby proof.

Good pattern:
- claim
- proof
- what to do with it

Bad pattern:
- claim
- louder claim
- CTA

Never promise interviews, jobs, or guaranteed outcomes.

## 6. CTA System

Primary CTA:
- verb first
- clear outcome

Examples (sentence case):
- `Get your free report` (the one name for starting a report, signed out; see §1)
- `Get 5 more reports · $29`
- `Export PDF`

Secondary CTA:
- clarifies or supports

Examples:
- `See Jordan's report`
- `Restore access`
- `Copy link`

Avoid:
- `Get Started`
- `Learn More`
- `Submit`
- any name retired in §1

## 7. Error and Recovery Pattern

Every error should answer:
1. what happened
2. what to do next
3. fallback if needed

Example:
- `Could not load report. Refresh and try again.`
- `Still stuck? Restore access from Billing.`

Never use:
- `Something went wrong`
- blame language
- internal system terms

## 8. Free vs Paid Rule

Any pricing or paywall surface must make three things obvious:
1. what is free now
2. what paid unlocks
3. how much control the user has

Preferred phrasing:
- `Your first report is free.`
- `The Job Search Pass includes five additional reports for $29, valid for 90 days, with no automatic renewal.` (90 days since November 2, 2026)
- `PDF export and saved reports come with signing in, not with the pass.` The pass is for re-checks and other jobs; it is never sold as the way to get a PDF.

Do not imply the free report has shallower feedback. Saved history requires sign-in. Paid PDF exports remain available through the valid paid period even after all report credits are used.

## 9. Trust Copy Rule

Trust pages and trust blocks should answer:
1. what we store
2. why we store it
3. how long it stays
4. how the user deletes it
5. who handles billing

Say it in plain English. If legal wording is required, put it after the summary.

## 10. Ship Check

Copy is not ready if any of this is true:
1. the same thing has two names
2. the line sounds generic enough to belong to any SaaS app
3. the CTA does not say what happens next
4. the section intro repeats the headline
5. the report voice sounds like a coach instead of a recruiter
6. the words are individually familiar but the sentence is something no one would say aloud
7. personality depends on an unexplained metaphor or an abstract phrase about “the read”

## Homepage copy, November 4, 2026

The homepage was rebuilt from first principles on November 4, 2026 (`docs/design/2026-11-homepage-research.md`). Its lines, in order, so that no surface drifts from them:

| Beat | Copy |
| --- | --- |
| The pile (h1) | `244 people applied for the job you wanted.` then `Eighteen got called back. The other 226 have no idea why the recruiter passed.` Source line: `Greenhouse, The Hire Standard, March 2026: 244 applications per role in 2025, 7.6% past the first screen.` |
| The read (h2) | `By the time you finish reading this sentence, a recruiter has finished reading your resume.` The choices `Move forward` and `Reject`. Then `Nobody tells you why.` / `We do, before you apply for the next one.` |
| The note | `Here’s the note Jordan never saw.` then the clipping (the line and the note from the sample report) and `See Jordan’s full report`. The report's verdict sentence and its questions stay on the sample report. |
| The re-check | `Fix it. Then check it again.` Captions `First report` and `Revision 1`; the note `Changed. Up 6.`; `Up 11 since the first report.` Changed, never fixed. |
| The founder | `I’ve passed on more people than I can count. A few seconds a resume, fifteen years, at companies you’ve heard of and small ones around the world. The reasons were almost always the same, and nobody told you. I wrote them down.` Signed with the wordmark. The AI disclosure lives on How the report works and in the legal content, not here. |
| The close | `Before you apply for the next one.` |

Facts: fifteen years (Matt, November 4, 2026; the methodology FAQ and the legal content say 15 too). No company names, no name, no photograph. The button is `Get your free report` on every beat that has one (§1).
