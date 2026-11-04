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
| What to change | Fix: `Fix these first` (report tab, PDF); headings `Fix this first.`, `Fix these two first.`, `Fix these three first.` until the report knows its Critical Miss count, then the count heading below; cards `Critical Miss` (`Critical Miss 1`, `2`, `3` when there are several), then `Fix 2 of 3`, `Fix 3 of 3` by position (Nov 2, 2026: the count travels with the card, since phones hide the heading); `Fix` in the full notes | Start with these changes, Suggested change |
| A problem that could cost an interview on its own | `Critical Miss`. A report names one to three, in priority order; the first is the one to fix first. Never `Nothing critical` (Matt, November 1, 2026) | Nothing critical |
| The negotiation section and its guides | `After the offer` | Resources, Career resources, All Resources |
| The example report | `Sample report` (navigation and page title). The homepage link names the candidate: `See Jordan's report` | See an example, Example report |
| A paid re-run of a revised resume | `Re-check`. The comparison says the Critical Miss `changed`, never that it was `fixed` | None |
| Keeping a report in My reports | `Save this version` (the section row and the signed-in ending, Nov 2, 2026) | Save report |

## 2. Canonical Report Structure

The main report navigation uses these labels:
1. `Overview`
2. `Fix these first`
3. `Keep these`
4. `Role fit`

Section headings follow the same names: `Fix this first.` / `Fix these two first.` / `Fix these three first.` and `Keep these. They're working.`

### The Critical Miss count (Matt, November 2, 2026: "i dont want to lie to people and say they have one critical miss if there are more")

Once the severity check has flagged the report's Critical Misses, the count leads the fix section on the web and in the PDF, phones included. The heading says how many and where to start; the line under it says what makes them critical.

| Count | Heading | Line under it |
| --- | --- | --- |
| 1 | `One Critical Miss. Fix it first.` | `It's the one most likely to cost you the interview.` A judgment, not a guarantee: say nothing about the rest of the report |
| 2 | `Two Critical Misses. Start with this one.` | `Either one could cost you the interview on its own.` |
| 3 | `Three Critical Misses. Start with this one.` | `Any one of them could cost you the interview on its own.` |
| More than 3 | `More than three Critical Misses. Here are the three that matter most.` | `Any one of them could cost you the interview on its own. Start with the first.` |

A report without the severity check's flags (every report saved before it) states no count: it keeps the fix heading above and `The one thing to fix first` under its Critical Miss. Code: `criticalCountHeading` in `web/lib/reports/report-presentation.ts`.

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
