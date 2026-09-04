# Copy Operations

> Canonical voice guide: [`voice-and-tone.md`](./voice-and-tone.md)

This document is the operating system around that guide. It covers naming, structure, and the small rules that keep the product voice from drifting.

Last updated: 2026-09-04
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

## 2. Canonical Report Structure

The main report navigation uses these labels:
1. `Overview`
2. `Fix these first`
3. `Keep these`
4. `Role fit`

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

Examples:
- `Get Your Free Report`
- `Get Another Report`
- `See Pricing`
- `Export PDF`

Secondary CTA:
- clarifies or supports

Examples:
- `Copy Link`
- `See Methodology`
- `View Pricing`

Avoid:
- `Get Started`
- `Learn More`
- `Submit`

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
- `The Job Search Pass includes five additional reports for $29, valid for 30 days, with no automatic renewal.`

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
