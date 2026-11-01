# Phase 4 plan: journey and homepage

Date: 2026-11-01
Status: Phase A (plan and mockups). Nothing is implemented. Phase B starts after PR #37 (design-system foundation) merges, because #37 rewrites nearly every file listed here.
Items: 4.1, 4.2, 4.3, 4.4, 4.7, 4.8, 4.9, 4.10, 4.11, 4.12, 4.13 from [70-audit-remediation-plan.md](70-audit-remediation-plan.md). Matt's decisions D4 and D7 apply.

Mockups (static HTML, real fonts and tokens, for review only): [phase4-mockups/home.html](phase4-mockups/home.html), [pricing.html](phase4-mockups/pricing.html), [details.html](phase4-mockups/details.html). Orange dashed boxes are reviewer notes, not product UI.

## Open decisions (sent to the coordinating session for Matt)

| # | Decision | Recommendation | Alternative |
| --- | --- | --- | --- |
| Q1 | Which rejection beat to cut (D4). The plan's Keep list protects the silence list; D4 keeps the headline | Cut the hero card's "What Jordan got: 'We've decided to move forward with other candidates.'" line. Keep the "Not moving forward" stage | Cut the silence section and fold its honest line into the example |
| Q2 | Main action name (D7) | "Get your free report" for every signed-out start button; "New report" only as signed-in app navigation | "Read mine" in marketing, which leaves the header on a second name |
| Q3 | Founder credential wording (4.3, 0.8) | Headline "I've spent 14 years on the other side of the desk." plus role, company and years lines that Matt fills in | Keep the current headline if Matt confirms every word |
| Q4 | How Jordan's sample report is made (4.2) | Run the production prompt once on a full fictional Jordan resume (paid; needs Matt's OK), then the integrity pass | Hand-write it to the real schema at no cost |
| Q5 | Sequencing (coordinator) | The example's revised line shows Phase 2's answer-to-line feature (2.2), so the homepage ships in the same batch as 2.2 (D3) | Ship the example ending at Jordan's answer |
| Q6 | Ownership (coordinator) | Report labels (keep/fix) and `public/sample-report.json` overlap with the signature-report session; the coordinator assigns them | n/a |

## 4.1 Homepage: reveal the note, add the worked example, cut one beat

New order (recommended):

1. **Hero.** Copy unchanged: "They called someone back. It wasn't you." / "See what a recruiter sees on your resume, and the one thing to fix first." / "Your first report is free. No account or card." Primary action per Q2; the quiet link becomes "See Jordan's report". The recruiter's screen keeps the requisition, the candidate, "Applied 9 days ago", the "Not moving forward" stage and the reviewer note; the "What Jordan got" line goes (Q1).
2. **Worked example** (new, directly under the hero; takes the `#how-it-works` anchor so the header's "How it works" lands here).
3. **Silence** (kept as is).
4. **One sentence** (kept as is; its button gets the Q2 name).
5. **What we look for, line by line** (kept as is).
6. **Founder** (4.3).
7. **Close band** (kept as is).

### The reveal

- At rest the note is blurred, as today. It clears once, from `blur(5px)` to none over `--duration-slow` (520ms) on `--ease`. The trigger is the first scroll past 48px, or the note card being fully in view on a phone (an `IntersectionObserver` at 0.9).
- Reduced motion: the note clears without a transition when triggered.
- The stage stays `aria-hidden`; the worked example carries the same words as real, readable text. The design-system rule "the note arrives once" still holds: the arrival animation is unchanged, and the reveal is a second, scroll-driven state.
- New client component `components/landing/home/NoteReveal.tsx` wraps only the screen card, so the hero copy and buttons stay server-rendered and never wait on JavaScript. Without JavaScript the note stays blurred, which is today's behavior.

### The worked example (copy)

- Tag: "Fictional example"
- Title (headline role): "Here's the note Jordan never saw."
- Deck: "It's about one line. Answer the question it asks, and the line finally says what Jordan did."
- Four steps, matching the Lifted Trace states (source evidence, open question, candidate's fact, revised wording):
  1. "On Jordan's resume". The label "Critical Miss" in the uppercase verdict-label style, with the quote in Literata on a blue-ink rule and highlighted: "Introduced monthly renewal-risk reviews across the portfolio".
  2. "The note". In pen, Literata italic, word for word as on the hero card: "Solid book of business, but the best example stops right before the good part. Did renewals go up?"
  3. "Jordan's answer". Three labeled fields: "Renewal rate before", "Renewal rate after", "Over what period". Each shows a placeholder in blue ink ("Jordan's number", "Jordan's answer"). Under them: "Blank on purpose. Jordan isn't real, and we don't make up numbers for anyone."
  4. "The revised line": "Introduced monthly renewal-risk reviews across the portfolio; renewal rate went from [before] to [after] in [period]." The bracket tokens are blue ink with a dotted underline. Under it: "Jordan's line plus Jordan's answer. Nothing added." The line uses only the original line and the answer, no facts from other lines, matching the 2.2 rule. "Went from … to" doesn't assume which direction the number moved.
- Coda (this is 4.11 on the homepage): "Then check it again." Last time: the struck-through Critical Miss. Now: "Your Critical Miss changed" and the new one, plus a pen-tint "Up 6" chip. Under it: "A re-check is one Job Search Pass report. Signed in, every version lands in Progress." and the link "See Jordan's full report →".
- The coda's new Critical Miss and "Up 6" are placeholders until Jordan's sample report exists (Q4). They will be replaced with what that report actually says.
- Five-second test target: a visitor can say what the product does (finds the line, asks the question, rebuilds the line from your answer) and that Jordan is made up (tag plus "Jordan isn't real").

Layout: one paper sheet (24px radius desktop, 16px mobile, hairline border, no shadow). On desktop it is a two-by-two grid: the line beside the note, then the answer beside the revised line, like the marked-up resume in 2.1 with candidate lines on the left and pen notes on the right. On phones the steps form one vertical rail with numbered markers (the Lifted Trace's narrow-screen form). One highlighter in the section, on the Critical Miss line only.

Files (Phase B): `LandingMineral.tsx` (order), `home/VerdictHero.tsx` and its module CSS, new `home/NoteReveal.tsx`, new `home/WorkedExample.tsx` and its module CSS, `home/OneSentence.tsx` (button label). Docs: `docs/design-system.md` §10 homepage contract and `docs/brand-system.md` homepage paragraph (story beats, reveal, removed line), updated in the same change.

## 4.2 "See an example" continues Jordan's story

- The sample report becomes Jordan's, built from a complete fictional resume that matches the hero (Northwind Analytics CSM, Brightpath Logistics coordinator, the same five bullets, plus enough to make a real report). Method per Q4.
- Labels: "Sample report" in the nav and on the page; the page shows a "Fictional example" tag (0.5); the hero link is "See Jordan's report".
- The homepage's one-sentence verdict and the worked example's note follow the sample's actual wording, so the story matches from homepage to sample.
- Knock-on: `components/research/diagrams/FirstReadModelDiagram.tsx` quotes the sample, and a test guards it (from #36). Both update with the new sample.
- Files: `public/sample-report.json`, a new fixture `web/tests/fixtures/sample/jordan-resume.txt`, `app/(marketing)/sample-report/page.tsx` (metadata says "fictional"), the methodology figure and its test.

## 4.3 Founder: a credential line instead of a logo bar

Proposed (Q3; Matt fills in every bracket, and nothing ships with blanks):

- Headline: "I've spent 14 years on the other side of the desk."
- Intro: "I'm Matt. I built this to give you the read I'd give a friend before they hit send."
- Lines (a definition list: company, title, years):
  - OpenAI · [title] · [YYYY–YYYY]
  - Meta · [title] · [YYYY–YYYY]
  - Google · [title] · [YYYY–YYYY]
  - "Earlier: X-Team, Robert Half."
- The disclosure and the links stay as they are.

Neither the repo nor Matt's public LinkedIn (logged-out view) shows titles or dates, so these have to come from Matt. Files: `LandingMineral.tsx`, `home/HomePage.module.css`.

## 4.4 and 4.11 Pricing: what $29 buys, shown

- Pass card features in `lib/billing/pricing.ts`:
  - "5 more complete reports"
  - "Re-check a revision and see whether your Critical Miss changed" (was "…is fixed after you revise"; the comparison never claims a fix)
  - "Read your resume against each job posting"
  - "PDF exports, and saved reports when signed in"
  - "$29 once. Good for 30 days. No automatic renewal."
- Card description: "For revising and applying: check each revision, and read your resume against each job you want."
- The intro line becomes "Use the pass to check a revision, or to read your resume against a specific job."
- `PaywallModal` `PASS_BULLETS` gets the same "changed" fix.
- New section after the cards, "What five more reports are for." with the deck "Most people use them two ways. Here's each one on Jordan's resume." It holds two example panels, each tagged "Fictional example":
  - **Check your revision.** "Run the revised resume, and the report puts it beside the last one: whether the Critical Miss changed, and which way the score moved." The demo is a miniature of the real `ReadComparison` (Last time / Now, "Your Critical Miss changed.", "Up 6"). Under it, a three-row Progress strip (First report, Revision 1 "Up 6", Revision 2 "Up 5") ending "Up 11 since your first report." Footnote: "Signed in, Progress keeps every version. Scores compare versions of your own resume. They don't predict interviews."
  - **Read it against each job.** "Paste the posting with your resume. The report shows what fits, what needs more detail, and what the posting asks for that your resume doesn't show." The demo uses the real role-fit group labels: "Relevant experience", "Needs more detail", and "Not shown in the resume" in red pen. Footnote: "Any report can include a posting, including your free one. The pass gives you a report for each job you're serious about." Job comparison works on free reports too, so the copy doesn't pretend it's paid-only.
- "What happens after checkout." gains two rows, worded from the Terms and FAQ:
  - **Used all five.** "Your saved reports stay open, and PDF exports keep working until the pass ends. Another report needs a new pass."
  - **Refunds.** "Haven't used a paid report yet? You can get a full refund within 14 days. Write to support from your checkout email. Terms has the details."
- Numbers: example scores appear only as changes, never as an absolute score (D5).
- Files: `lib/billing/pricing.ts`, `components/marketing/PricingPageClient.tsx`, new `components/marketing/PassExamples.tsx`, `components/workspace/PaywallModal.tsx` (one string).

## 4.7 Research index rows are fully clickable

- The question becomes the link text, which is also its accessible name. The link's `::after` covers the row (a stretched link), so the whole row opens the article.
- "Read →" (or "Compare →") stays as a decorative affordance (`aria-hidden`, `data-affordance` on the arrow).
- Hover: the shared `.riyp-surface-link` inset wash from #37; the arrow turns ink and nudges 2px. Press: the deeper wash. Focus: the pen ring around the row.
- Rows get a 12px radius and a negative inline margin, so the wash has room while the text stays on the same edge. This applies to lead rows and library rows. Reduced motion: no nudge.
- Files: `components/research/ResearchHub.tsx` and its module CSS. `ResearchHubData.ts` stays untouched (the research session's file).

## 4.8 One name each (D7)

To be recorded as a glossary table in `docs/copy-system.md` (pending Q2):

| Thing | Name | Retired |
| --- | --- | --- |
| Start a report (signed out) | Get your free report | Read mine, Start a report, Get my report, Review my resume |
| Start a report (signed-in navigation) | New report | n/a |
| Strengths to leave alone | Keep: "Keep these" (tab and PDF), "Keep these. They're working." (heading), "Keep this one" (opening-read label) | Leave these alone, Don't touch this one |
| What to change | Fix: "Fix these first" (tab and PDF), "Fix this first." / "Fix these two first." / "Fix these three first." (heading), "Critical Miss", "Fix 2", "Fix 3" (cards), "Fix" (full notes) | Start with these changes, Suggested change |
| Negotiation section | After the offer | Resources, Career resources, All Resources |
| The example report | Sample report (nav and page); "See Jordan's report" (hero link) | See an example, Example report |
| The output | report | review, analysis |

- Marketing surfaces (mine): `lib/navigation.ts`, `components/layout/SiteHeader.tsx` (desktop and mobile), `components/layout/AppHeader.tsx`, `app/(editorial)/resources/page.tsx` and `guides/page.tsx` metadata and eyebrow, the guide and calculator back-links, the hero, the closes and the research close.
- Report labels (`ReportTOC.tsx`, `ReportStream.tsx`, `FullRecruiterNotes.tsx`, `lib/reports/report-presentation.ts`, `lib/backend/pdf.ts`) wait on Q6, because the signature-report session is changing those files.
- Tab labels match their headings ("Keep these" over "Keep these. They're working.", "Fix these first" over "Fix these three first.").

## 4.9 Trust cluster: four tabs

- Tabs: Privacy, Terms, Security, Help.
  - Security is active on `/security` and `/trust`.
  - Help points to `/faq` and is active on `/faq` and `/support`. The FAQ's existing "Still need help?" callout links to Support.
- Status and How the report works leave the tabs. The `/status` route stays up for anyone with the link; the methodology stays in the footer's Product column and the research library.
- At 320px the four tabs fit without scrolling (checked in the mockup with 12px side padding). The edge fade stays for safety. This also closes 3.12 (the clipped "rivacy Policy").
- Files: `components/legal/LegalNav.tsx` (tab list and active matching).

## 4.10 Footer: grouped, labeled columns

| Column | Links |
| --- | --- |
| Brand block | Wordmark, "See what a recruiter sees before you apply. Your first report is free." (balanced wrap, so "free." can't orphan), support email |
| Product | How it works, Sample report, Pricing, How the report works |
| Research | All research, How recruiters read, What makes a bullet land |
| After the offer | Negotiate an offer, Read a tech offer, Offer calculator |
| Help | Help and FAQ, Security, Privacy, Terms, Privacy choices (the existing button) |

- Bottom row: "© 2026 Recruiter in Your Pocket" and "Already paid? Restore access".
- Column labels are sentence case, 13px, weight 600 (design system 8b). Each column is a `nav` with `aria-labelledby`.
- Phones: a two-by-two grid under the brand block.
- Files: `components/landing/Footer.tsx`, `Footer.module.css`, and `FOOTER_NAV` in `lib/navigation.ts`, which becomes grouped.

## 4.12 Calculator flags incomplete offers

- Rule: in a comparison of two or more offers, an offer is incomplete when its bonus or equity is zero and another compared offer has a non-zero value for it.
  - One-time pay is not flagged; plenty of real offers have none.
  - The current job is included.
- Display:
  - A neutral inset notice above the ranking (ink text and info icon, not yellow or red, because this isn't a resume finding): "[Company B] has no bonus or equity entered, so this isn't a fair comparison yet. Add them if the offer has them."
  - The incomplete row reads "No bonus or equity entered." with an "It has none" text button. That button confirms the zero and clears the flag; it is session state only, never persisted.
  - The top row says "Highest of what's entered" instead of "Highest modeled value" while any offer is flagged.
  - "Ranked by modeled value only. It is not a recommendation." stays.
- The index copy part of 4.12 is already fixed on main ("Compare benefits separately.").
- Files:
  - `lib/compensation-model.ts`: a pure `missingRecurringPay(offer, others)` helper, plus a unit test.
  - `components/guides/comp-calculator/CompCalculatorResults.tsx` and `CompCalculatorClient.tsx` for the confirmation state.

## 4.13 Consent panel no longer covers the main button

- Measured on production: at 1280×720 the panel (y 495 to 704) covers "Read mine" (y 528 to 588). At 1366×768 it still overlaps the button's lower half.
- From 1024px wide the panel moves to the bottom right, over the decorative illustration, and tightens to about 150px tall: smaller padding, the heading and text closer together, buttons side by side. Same words, same two equal-weight buttons.
- Phones keep it full width at the bottom.
- Done when the primary button is fully visible on first load at 1280×720 and 1366×768, and no page's primary action sits under the panel at 1024 to 1440.
- Files: `components/privacy/PrivacyControls.module.css`.

## Phase B verification

- Screenshots at 320, 390, 1024 and 1440 for home, pricing, sample report, research index, a trust page, the calculator and the footer. Also 1280×720 and 1366×768 with the consent panel showing.
- Interaction states: the note at rest and revealed (and with reduced motion); research row hover, press and focus; trust tab active states on `/trust` and `/support`; the calculator flag set and cleared.
- From `web/`: `npm run qa:design-system`, `npm run lint`, `npx tsc --noEmit`, `npm run build`, and the related UI specs (landing, pricing, research hub, legal nav, comp calculator, privacy controls; list confirmed in Phase B). Plus `test:release-integrity` if the sample changes.
- Copy: banned-phrase scan on changed strings, "resume" without accents, a read-aloud pass on each changed section.
