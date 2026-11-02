# Impeccable frontend audit, November 2026

Date: 2026-11-02
Target: https://www.recruiterinyourpocket.com, as served on Nov 2. The wave 2 work is live (homepage worked example, marked-up sample report). The homepage was prerendered about four minutes after `568b923a` merged; this was not checked against a deployment SHA.
Scope: home, pricing, sample report, research index, two articles (`/research/how-recruiters-read`, `/research/quantifying-impact`), the offer calculator (`/resources/tools/comp-calculator`), methodology, privacy, and the signed-out upload screen (`/workspace`), each at 390, 1024 and 1440.
Mode: read-only. Nothing was installed into the project, no fixes were made, nothing was submitted, and no report was run.
Reference: the Highlighter system ([design-system.md](../design-system.md), [brand-system.md](../brand-system.md), [voice-and-tone.md](../voice-and-tone.md)). Where Impeccable's generic taste disagrees with it, the system wins. Those conflicts are listed under [Considered and rejected](#considered-and-rejected).
Screenshots: [`2026-11-impeccable/`](2026-11-impeccable/)

## The short version

The frontend is in good shape. axe-core found one violation in 60 page, viewport and theme scans (item 2). Nothing overflows sideways at 320px or wider. Touch targets clear 44px. The Highlighter grammar holds on every page: one highlighter, pen for the recruiter, blue for the candidate, red for what is missing.

There are no P0 issues. The next wave should take these in order:

1. **Methodology and pricing still describe a 0 to 100 score.** The product retired that number for the score band on Nov 1. This is the most important fix because the score is the core promise.
2. **One WCAG Level A failure.** At 320px the report's section tab reads "Fixes" but is announced as "Fix these first", so a voice-control user can't say what they see.
3. **A handful of mobile and keyboard rough edges.** None blocks a job seeker, but several land exactly where they decide whether to trust us: the consent card, the sample report's fix order, pricing button emphasis, focus rings, and unlabeled skip buttons.

The deterministic detector should not become a CI check. Of its 45 warning-level findings, 42 were false positives against our design system, and it missed every P1 and P2 issue below. See [the CI recommendation](#should-the-detector-become-a-ci-check).

## Method

Impeccable is Paul Bakaus's design skill pack ([github.com/pbakaus/impeccable](https://github.com/pbakaus/impeccable), Apache 2.0). Its `audit` and `critique` commands are prompt files, and its `detect` command is a deterministic rule engine. This audit used each one.

| Piece | Version used | How it ran |
| --- | --- | --- |
| `impeccable` CLI (npm) | 4.8.0 | `npx --yes impeccable@4.8.0 detect --json`, from a scratch directory, with `IMPECCABLE_HOME` pointed at scratch. It wrote no config and no `.impeccable/` folder. |
| Detector engine | 0.1.18 (`@impeccable/cli-darwin-arm64`) | Rule catalog: 62 rules. |
| `audit.md` and `critique.md` | repo commit `24aa2547f1d80e8d0edd767d9b76bc0bb65a3b6b` (Nov 2, 2026) | Shallow clone in scratch; the files were read and applied, not installed. |
| axe-core | 4.14.0 | Injected into live pages; WCAG 2.0, 2.1 and 2.2 A/AA tags plus best practice. |
| Browser | Chrome 156.0.8078.74, headless, plus the Claude desktop browser pane | Measurements and screenshots were signed out, in fresh profiles. The pane was used for interactions only. |

Steps:

1. **Detector.**
   - Ran against a scratch copy of `web/app` and `web/components` (280 `.tsx` and `.css` files): 6 findings.
   - Ran against the 10 live URLs at 390x844, 1024x768 and 1440x900 (30 scans): 105 findings.
   - The URL scans flaked when run three at a time (25 of 30 failed to connect to Chrome); run one at a time, all 30 succeeded on the first attempt.
2. **Audit.** I applied `audit.md`'s five dimensions with live measurements:
   - axe at 320, 390, 1024 and 1440, light and dark;
   - horizontal overflow, touch targets, the 13px type floor, and heading outline;
   - keyboard focus on the first 12 to 14 tab stops of four pages;
   - CLS and LCP (warm) on every page, plus cold throttled loads (Slow 4G, 4x CPU) on five pages.
3. **Critique.**
   - Assessment A (design review) ran in an isolated sub-agent that never saw detector output.
   - Assessment B (detector) is step 1.
   - I verified A's claims against the live pages and source before using them; one claim was dropped (see Run notes).

Effort scale: XS is under an hour, S is half a day, M is one to two days, L is more.

## Scores

### Audit health (Impeccable `audit`)

| # | Dimension | Score | Key finding |
| --- | --- | --- | --- |
| 1 | Accessibility | 3 | axe found one violation in 60 scans: a Level A failure (Label in Name) on narrow screens. Header nav uses the browser's default focus ring. |
| 2 | Performance | 2 | Cold mobile first paint takes 3.1 to 7.2s throttled; 466 to 638 KB of JS and up to 264 KB of fonts. CLS is about 0 everywhere. Already tracked as plan item 3.15. |
| 3 | Theming | 3 | Tokens are used throughout and the detector found no off-palette color. Dark mode is documented but forced off at runtime (tracked, 3.13). |
| 4 | Responsive | 3 | No overflow from 320 to 1440 and 44px targets. On phones the consent card takes 22% of the first screen. Tablet gutters are 16 to 20px. |
| 5 | Implementation integrity | 3 | A coherent, product-specific system. Content drift: public pages describe a score the report no longer shows. |
| | **Total** | **14/20** | **Good** (address weak dimensions) |

### Design health (Impeccable `critique`, Nielsen heuristics)

Scored by Assessment A and checked against the pages:

| # | Heuristic | Score | Key issue |
| --- | --- | --- | --- |
| 1 | Visibility of system status | 3 | Active nav states, breadcrumbs and an honest disabled run button. Report wait states weren't exercised (no report was run). |
| 2 | Match with the real world | 3 | "No response" and "Not moving forward" are real recruiting language. "First Impression score" never appears in the report. |
| 3 | User control and freedom | 3 | Hide and Bring it back, "I don't know", paste or upload, refunds. |
| 4 | Consistency and standards | 2 | The core output appears three ways: a band (report), 80/100 (methodology) and "First Impression score" (pricing). Pricing button emphasis flips. |
| 5 | Error prevention | 3 | The run button stays disabled until a resume is added, plus a 200-character floor and a "What we read" preview. |
| 6 | Recognition rather than recall | 3 | On phones, the report shows "Fix 2" and "Fix 3" with no Fix 1. |
| 7 | Flexibility and efficiency | 3 | Upload or paste, an optional job posting, and report section jumps. |
| 8 | Aesthetic and minimalist design | 3 | Calm overall. The noise comes from the consent card and a four-button stack on mobile pricing. |
| 9 | Error recovery | 3 | Checked in source only (the scanned-PDF message and the paste fallback); not exercised live. |
| 10 | Help and documentation | 3 | Methodology and research exist, but the upload screen's header doesn't link to them. |
| | **Total** | **29/40** | **Good** (72.5%) |

**Design specificity verdict:** authored for this product, not interchangeable.

- **Specific to this product:**
  - the hero's recruiter screen over an ordinary resume;
  - the worked example's blank answers;
  - the marked-up sample report;
  - the research figures drawn as resume sheets and dots.
- **Category-standard:** the upload screen, the pricing cards and the calculator's empty state. These are task surfaces where familiarity helps, so I don't treat that as a defect (see Considered and rejected).

## Ranked backlog

Each finding lists its pages and viewports, screenshot, evidence, the Impeccable rule or principle, why it matters to a job seeker, a proposed fix, and effort. Where an item is already in [70-audit-remediation-plan.md](../launch-readiness/70-audit-remediation-plan.md), the plan ID is given.

### P0: blocking

None. Every journey in scope completed, and nothing failed WCAG in a way that stops a task.

### P1: fix in the next wave

#### 1. Methodology and pricing still promise a 0 to 100 "First Impression score"

- **Pages:** `/methodology` (all widths), `/pricing` (all widths)
- **Screenshots:** [01-methodology-80-score@1440.jpg](2026-11-impeccable/01-methodology-80-score@1440.jpg), [02-sample-score-band@1440.jpg](2026-11-impeccable/02-sample-score-band@1440.jpg), [03-pricing-first-impression-score@1440.jpg](2026-11-impeccable/03-pricing-first-impression-score@1440.jpg)
- **Evidence:**
  - The methodology hero card reads "Example score 80 / 100". Fig. 1 shows "80 /100 First Impression score" under the claim "Everything in this figure comes from our sample report".
  - "What you'll see in your report" lists "02 First Impression score: One number that summarizes the read". The FAQ answers "Why one score instead of four?" with "One number plus a written read keeps you focused".
  - The sample report shows the band ("Mostly clear") and no number, which matches design-system §8b (D5, Nov 1): "The number appears only when two reads are compared."
  - Pricing's free tier lists "Your Verdict and First Impression score".
  - Two more stale lines on the same page:
    - "What the score weighs" says "Four parts" but lists three. "How your experience fits together" is missing, though the FAQ names it.
    - "How suggested edits protect your facts" describes words held "in brackets for you to fill in". The shipped flow asks questions and builds the revised line from the answers.
- **Rule:**
  - critique heuristic 4 (Consistency and standards) and heuristic 2 (Match with the real world);
  - audit dimension 5 (Implementation integrity: "misleading or decorative content");
  - AGENTS.md: never invent authority, and keep claims traceable to real behavior.
- **Why it matters to a job seeker:** the person most likely to read methodology is the skeptic. They came because the homepage says "No ATS score. No interview odds." Then the page that explains our method shows exactly the 0 to 100 number they distrust, and the report they get shows something else. That costs trust at the moment we are asking for it.
- **Fix:**
  - Rebuild methodology Fig. 1 and the hero card from the live `ScoreBand` component, showing "Mostly clear" with the three anchors.
  - Retitle "First Impression score" to the band language on methodology and pricing, for example "Your Verdict and where your resume lands".
  - Rewrite "Why one score instead of four?" around the band.
  - Add the fourth "weighs" row.
  - Replace the brackets paragraph with the question-to-revised-line flow.
  - This is copy and figure work only; no prompt change. Check with copy-sweep, which is working on public copy now.
- **Effort:** S
- **Plan:** extends 1.5 and 1.6 (D5). Neither covered methodology's figure.

#### 2. Report section tab fails WCAG 2.5.3 Label in Name at narrow widths

- **Page:** `/sample-report`, and every report that uses `ReportTOC`, below 640px once the section row slides in. axe caught it at 320.
- **Screenshot:** [04-sample-tabs-fixes-label@320.jpg](2026-11-impeccable/04-sample-tabs-fixes-label@320.jpg)
- **Evidence:**
  - axe reports `label-content-name-mismatch` (serious, WCAG 2.1 A) on `button[aria-label="Fix these first"]`, whose visible text is "Fixes".
  - Source: `web/components/workspace/report/ReportTOC.tsx:19` sets `mobileLabel: "Fixes"`, and `:46` sets `aria-label={item.label}`. Below `sm` only the short label renders.
  - "Keep" passes because "Keep these" contains it.
- **Rule:** audit dimension 1 (Accessibility, "Missing ARIA: ... labels"); Impeccable's P1 definition includes any WCAG violation.
- **Why it matters to a job seeker:** a voice-control user saying "click Fixes" gets nothing. It is small, but it sits on the report's main navigation.
- **Fix:** drop the `aria-label` and let the visible text be the name. If the long name matters, use visually hidden text that starts with the visible word ("Fixes" plus a hidden " to make first").
- **Effort:** XS
- **Note:** the existing `test:accessibility` spec runs axe only at 1440, which is why it passed. See the CI recommendation.

### P2: fix in the next pass

#### 3. On phones, the consent card covers the first screen's most important content

- **Pages:** every page at 390 on a first visit
- **Screenshot:** [06-consent-card-first-screen@390.jpg](2026-11-impeccable/06-consent-card-first-screen@390.jpg)
- **Evidence:** the card is 187px tall on an 844px screen (22%). It sits over:
  - the sample report's first Critical Miss question;
  - the $0 tier on pricing;
  - the upload screen's run button and its privacy line ("OpenAI writes the report from your resume. We don't store the resume...");
  - the article's "Updated" and "How we write these" row.
  At 1440 it is a slim bar that clears the hero action (checked at 1280x720 too, so plan item 4.13's laptop case is resolved).
- **Rule:**
  - critique cognitive load "Single focus";
  - persona Casey (distracted mobile): "Important actions ... unreachable";
  - audit dimension 4 (Responsive).
- **Why it matters to a job seeker:** the upload screen is where people decide whether to hand over their resume. The one sentence that answers "what happens to my resume?" is under the card.
- **Fix:**
  - Make the phone version a compact bar, about 112 to 120px tall: one line of text, the policy link, and Decline and Allow kept equal in weight.
  - Separately, move the upload privacy line up beside "PDF or DOCX · 4 MB max" (see item 13 for the screenshot with the card dismissed).
- **Effort:** S
- **Plan:** related to 4.13, which covered laptops only.

#### 4. Sample report on phones: "Fix 2" and "Fix 3" appear with no Fix 1

- **Page:** `/sample-report` at 390 (below 640px)
- **Screenshot:** [08-sample-fix-rows-no-heading@390.jpg](2026-11-impeccable/08-sample-fix-rows-no-heading@390.jpg)
- **Evidence:**
  - `.pageTitle` ("Fix these three first.") is visually hidden below 640px (`MarkedReport.module.css:105`, shown again at `:641`). The rows read: Critical Miss, "Keep this one", "Fix 2", "Fix 3".
  - On desktop the heading is visible, but it sits beside "The one thing to fix first", so "three first" and "the one thing" compete.
- **Rule:** critique heuristic 6 (Recognition rather than recall) and cognitive load "Working memory" (the memory bridge).
- **Why it matters to a job seeker:** they meet "Fix 2" and have to work out that the highlighted Critical Miss was Fix 1. In the product's core output, the order of what to fix should be obvious.
- **Fix:** label the Critical Miss row "Fix 1 of 3 · The one thing to fix first" and the others "Fix 2 of 3" and "Fix 3 of 3", or show the heading on phones. Keep "Critical Miss" as the label.
- **Effort:** XS

#### 5. Pricing flips button emphasis below 1024px

- **Page:** `/pricing` at 390 and up to 1023px
- **Screenshot:** [07-pricing-button-emphasis@390.jpg](2026-11-impeccable/07-pricing-button-emphasis@390.jpg)
- **Evidence:**
  - The "Pricing actions" nav (`PricingPageClient.tsx:56`, `lg:hidden`) shows "Get your free report" filled and "Get 5 more reports · $29" outlined.
  - A screen later, the cards reverse it: free is outlined and $29 is filled.
  - The top pair also uses `justify-between`, putting the label at the left edge and the arrow at the right, unlike every other Button on the site.
  - That makes four full-width pills within about 1.5 screens.
- **Rule:**
  - critique heuristic 4 (Consistency);
  - cognitive load "Minimal choices";
  - design-system §10: "Maintain one dominant action and one supporting route".
- **Why it matters to a job seeker:** on the page where money is involved, the interface changes its mind about what it recommends.
- **Fix:**
  - Keep the free action filled at the top.
  - Make the $29 route there a quiet link that scrolls to the pass card.
  - Keep the card buttons as they are.
  - Center the label like the shared Button.
- **Effort:** XS

#### 6. Header and footer links fall back to the browser's blue focus ring

- **Pages:** every public page at 1024 and 1440 (and the app header on `/workspace`)
- **Screenshot:** [05-header-nav-focus-default-vs-cta@1440.jpg](2026-11-impeccable/05-header-nav-focus-default-vs-cta@1440.jpg). On the left, "How it works" has Chrome's 1px blue `auto` ring; on the right, the CTA has the system's 2px pen ring.
- **Evidence:**
  - `.site-nav-link:focus-visible` (`globals.css:788`) sets a wash and an underline but no outline, so Chrome draws `outline: auto 1px rgb(0, 95, 204)`.
  - The same fallback appears on the footer "Terms" link and the workspace header links.
  - CTAs, cards and research rows use the pen ring correctly.
- **Rule:** audit dimension 1 ("Missing focus indicators") and 3 (Theming: wrong token). design-system §11: "Focus uses the shared focus-ring (2px pen outline)".
- **Why it matters to a job seeker:** a keyboard user sees a different, off-brand focus treatment on the first seven stops of every page. It passes WCAG 2.4.7 (the ring is visible) but breaks the system.
- **Fix:** add `focus-ring` (or `outline: 2px solid hsl(var(--ring)); outline-offset: 2px`) to `.site-nav-link`, `.app-nav-link` and the footer link class.
- **Effort:** XS

#### 7. "I don't know" and "I didn't do this" have the same name for every question

- **Pages:** `/sample-report` and every report's Critical Miss block, at all widths
- **Evidence:**
  - `web/components/workspace/report/markup/LineLift.tsx:218-219` renders the two quiet buttons per question with no `aria-describedby` and no hidden suffix.
  - With two questions, tabbing hears "I don't know, I didn't do this" twice with nothing to tell which question each pair belongs to.
  - Hide buttons already do this right ("Hide this suggestion: Critical Miss").
- **Rule:** audit dimension 1 (ARIA labels); persona Sam (screen reader): "Custom components that break screen reader flow"; WCAG 2.4.6 (Headings and Labels).
- **Why it matters to a job seeker:** this is the product's value moment, answering the questions that build the revised line, and a screen-reader user can't tell which answer they are skipping.
- **Fix:** add `aria-describedby={questionLabelId}` to both buttons, or visually hidden text naming the question.
- **Effort:** XS

#### 8. The homepage quotes a sentence the sample report hides

- **Pages:** `/` (worked example, all widths), then `/sample-report`
- **Screenshots:** [10-home-section-edges@1440.jpg](2026-11-impeccable/10-home-section-edges@1440.jpg) (left column, "The read on Jordan's resume, in one sentence"), [02-sample-score-band@1440.jpg](2026-11-impeccable/02-sample-score-band@1440.jpg)
- **Evidence:**
  - The homepage quotes "Your account portfolio and review cadence are specific, but results remain unclear." Design-system §10 calls it "the sentence the report prints under its Verdict".
  - In the sample report that sentence is inside the collapsed "How the score works" disclosure. Under the Verdict, the report shows the band and "Most lines show what you did. A few leave your part or the result unclear."
- **Rule:** critique heuristic 4 (Consistency); emotional journey (the promise made on the homepage should pay off on the next click).
- **Why it matters to a job seeker:** they click "See Jordan's full report" to find the line they just read and can't.
- **Fix:** print the one-sentence read under the band in the report (it is short and is the takeaway), or change the homepage label to say where it lives. The first matches the system doc and the "takeaway first" rule.
- **Effort:** S

#### 9. Cold mobile loads are slow (already tracked)

- **Pages:** `/`, `/sample-report`, `/research/how-recruiters-read`, `/workspace`, `/pricing` at 390, cold cache, Slow 4G, 4x CPU, two runs each
- **Evidence:**
  - First paint took 3.1 to 7.2s and LCP 3.7 to 7.2s, with one outlier at 16.1s on a busy machine. Treat these as lab numbers, not field data.
  - Encoded JS was 466 KB (home), 478 KB (article), 484 KB (pricing), 621 KB (sample) and 638 KB (workspace).
  - Fonts were 264 KB on pages that use both families' italics and 153 KB elsewhere.
  - CLS was 0 to 0.003. Warm desktop LCP was under 700ms on every page except one 3.99s outlier.
- **Rule:** audit dimension 2 ("Bundle size").
- **Why it matters to a job seeker:** many arrive on a phone from search, and four to seven seconds of blank screen loses some of them before the headline appears.
- **Fix:** the page-weight session owns this. One additional idea: subset the four variable woff2 files to Latin and check whether both italic cuts must load on pages that use one.
- **Effort:** M
- **Plan:** 3.15

#### 10. Homepage sections don't share a content edge, and tablet gutters are phone-sized

- **Page:** `/` at 1024 and 1440
- **Screenshots:** [09-home-section-edges@1024.jpg](2026-11-impeccable/09-home-section-edges@1024.jpg), [10-home-section-edges@1440.jpg](2026-11-impeccable/10-home-section-edges@1440.jpg)
- **Evidence (measured heading x positions):**
  - At 1440: the hero at 112px, "What we look for" at 160px, the worked example and re-check at 196px, plus three centered sections.
  - At 1024: the hero at 48px, while the sections sit at 16 to 20px. Design-system §6 asks for 24 to 32px desktop gutters.
- **Rule:** audit dimension 4 (Responsive); plan 3.5's acceptance ("at most 3 content edges per page at 1440").
- **Why it matters to a job seeker:** it's subtle, but the page reads as assembled section by section rather than as one story. At 1024, text sits close to the screen edge.
- **Fix:** one marketing container with a single left edge per breakpoint, and 24 to 32px gutters from 768px.
- **Effort:** S
- **Plan:** residual of 3.5. It's numerically within the 3-edge target at 1440 but not at 1024.

### P3: polish

#### 11. Headings and paragraphs don't use `text-wrap: balance` or `pretty` consistently

- **Pages:** all, worst at 390
- **Evidence:**
  - The detector flagged 46 stragglers (one word alone on a last line) and 17 unbalanced headings.
  - Examples: "What would they think of yours?" (`#research-close-title`, every article, every width); the hero's reviewer note ending on "changed?"; seven privacy-table cells at 390.
  - Design-system §3 already allows `balance` for display text and `pretty` for prose.
- **Rule:** detector `straggler` and `unbalanced-heading` (advisory).
- **Why it matters to a job seeker:** small, but on headings it reads as unfinished.
- **Fix:** in `globals.css`, `h1, h2, h3 { text-wrap: balance }` and `p, li, dd { text-wrap: pretty }`; add both to the guardrail.
- **Effort:** XS

#### 12. The upload screen's nav changes for signed-out visitors

- **Page:** `/workspace` at 1024 and 1440
- **Screenshot:** [12-workspace-signed-out@1440.jpg](2026-11-impeccable/12-workspace-signed-out@1440.jpg)
- **Evidence:** the header switches to the app shell ("New report, My reports, Research, After the offer, Sign in"). Sample report and Pricing disappear, and "My reports" shows before the visitor has any.
- **Rule:** critique heuristic 4 and persona Jordan (first-timer): "Ambiguous next steps".
- **Why it matters to a job seeker:** a hesitant visitor loses the two pages that would reassure them right before upload.
- **Fix:** keep the marketing nav until sign-in, or add a quiet "See Jordan's report" link under the dropzone.
- **Effort:** S

#### 13. The upload privacy line sits below the disabled run button

- **Page:** `/workspace` at all widths
- **Screenshot:** [13-workspace-trust-line@390.jpg](2026-11-impeccable/13-workspace-trust-line@390.jpg) (consent card dismissed)
- **Evidence:** `InputPanel.tsx:328` places the lock line last in the card, after "Choose a resume to begin". The line deserves to sit where the decision is made, next to the file picker.
- **Rule:** critique emotional journey ("reassurance at high-stakes moments").
- **Fix:** move it under "PDF or DOCX · 4 MB max".
- **Effort:** XS (pairs with item 3)

#### 14. The sample report has no site footer

- **Page:** `/sample-report` at all widths
- **Evidence:** the measured landmarks show 0 `footer` elements at every width (the other public pages have one). The page ends on the "Now let's look at yours." card, then bare ground.
- **Rule:** critique heuristic 3 (User control: "Clear navigation back to safety").
- **Why it matters to a job seeker:** Privacy, Terms and Pricing are a long scroll back up from the end of the most-visited proof page.
- **Fix:** render the site footer under the report shell on the sample route.
- **Effort:** XS

#### 15. "Still unclear: Nothing important is missing from this section."

- **Page:** `/sample-report`, Full recruiter notes, Education
- **Screenshot:** [11-sample-still-unclear@390.jpg](2026-11-impeccable/11-sample-still-unclear@390.jpg)
- **Evidence:** the label and its text contradict each other.
- **Rule:** critique heuristic 2; voice-and-tone checklist item 9 (repeated or contradictory observations).
- **Fix:** hide the "Still unclear" row when the model says nothing is missing (a render rule, no prompt change), and regenerate or edit the sample's Education note.
- **Effort:** XS

#### 16. The pricing re-check miniature is nested three containers deep

- **Page:** `/pricing` at all widths
- **Screenshot:** [15-pricing-recheck-nesting@390.jpg](2026-11-impeccable/15-pricing-recheck-nesting@390.jpg)
- **Evidence:** a card, then a gray inset, then "Your Critical Miss changed" (a card), then "Last time" and "Now" (cards). The homepage shows the same `RecheckExample` with one level fewer.
- **Rule:** detector `nested-cards` (the 3 `RecheckExample_panel` flags); design-system §6: "Use a container when grouping changes meaning".
- **Fix:** drop the pricing wrapper's inset and let the miniature sit on the card as it does on the homepage.
- **Effort:** XS

#### 17. Research hub answers are long runs of italic pen Literata

- **Page:** `/research` at 390 (3 to 5 lines each)
- **Evidence:**
  - Design-system §3 gives "the recruiter's longer answers" the upright `verdict` role. It reserves italic for short margin notes.
  - The article answer box is upright, so the hub and the article already disagree.
- **Rule:** critique heuristic 4; persona Sam (low vision and dyslexia readers).
- **Fix:** set hub answers upright in Literata and pen, matching the article answer.
- **Effort:** XS

#### 18. Mixed Phosphor weights on the upload screen

- **Page:** `/workspace`
- **Evidence:** `InputPanel.tsx` uses `duotone` (Target, Info, LockKey), `bold` (Check, ArrowRight) and regular icons on one surface.
- **Rule:** design-system §8: "Use one optical weight per surface".
- **Fix:** pick one weight.
- **Effort:** XS

#### 19. Smaller notes

- The quoted section label in report rows shows "EXPERIENCE" in capitals because Jordan's resume heading is in capitals. The system reserves uppercase for the Verdict and Critical Miss labels. Consider sentence-casing the label at render time; the quoted line itself stays verbatim.
- The homepage worked example's dashed "Jordan's answer" boxes look like inputs but are static. The "Blank on purpose" note explains them; a solid hairline would read less like a field.
- The article meta links "How we write these" (18px tall) and source links (22px) are under the 24px target size. They pass WCAG 2.5.8 only through the spacing exception.
- Docs conflict: design-system §4 says "no drop shadows" while §7 allows "subtle" shadows for real elevation, and the hero cards use one. Reconcile the doc.
- Dark mode is documented in §4 but `AppProviders.tsx` forces light, and only the favicon follows the system theme. This is already plan 3.13 and still open.

## Considered and rejected

These are Impeccable rules or generic critique points that conflict with the Highlighter system, or that turned out to be false positives on inspection.

| Source | Finding | Where | Why it was rejected |
| --- | --- | --- | --- |
| Detector `kicker-above-heading` (warning, 2) | "VERDICT" label above the Verdict heading | sample report, 1024 and 1440 | The system reserves exactly this: uppercase tracked labels for the Verdict and the Critical Miss only (§3, §8b). It is a brand mark, not an AI eyebrow. |
| Detector `text-occlusion` (warning, 13) | Resume bullets "63% covered" by the recruiter's screen card | homepage hero, all widths | The overlap is the composition: the recruiter's screen sits on top of the resume. The illustration is hidden from assistive technology, and the worked example repeats the note's words as text (§10). Screenshot: [14-detector-text-occlusion-hero@1440.jpg](2026-11-impeccable/14-detector-text-occlusion-hero@1440.jpg). |
| Detector `nested-cards` (warning, 21 of 24) | Card inside card | homepage `RecheckExample` (6), methodology figure (3), privacy table (3), upload dropzone (3), pricing miniature cards (6) | Paper sheet plus inset is the system's two-level surface grammar (§4, §7). The re-check is a miniature of the real Progress view, and a dashed drop target inside a form sheet is the standard upload pattern. Only the extra pricing wrapper was kept (item 16). |
| Detector `nested-cards` (advisory, 3) | Card inside card | quantifying-impact article | An inset example block inside the figure frame, as the figure kit intends. |
| Detector `side-tab` (source, 1) | `border-left: 3px solid hsl(var(--blue-ink))` | `WorkedExample.module.css:90` | The blue-ink rule marks anything quoted from the candidate's resume (§4, "two hands on one page"). It carries meaning, not decoration. |
| Detector `side-tab` (source, 1) | `border-left: 2px solid hsl(var(--destructive))` | `InputPanel.module.css:33` | The red pen marks the "too little text" guard. That is the red pen's one job (§4). |
| Detector `side-tab` (source, 2) | `border-l-4` | `app/(app)/launch/page.tsx`, `launch/gauntlet/page.tsx` | Internal launch tooling, not a customer surface. Out of scope. |
| Detector `border-accent-on-rounded` (source, 2) | `border-b-2` on rounded tabs | `JobDetailTabs.tsx:75`, `SettingsClient.tsx:561` | A selected-tab underline, not an accent border on a card. False positive, and on signed-in surfaces. |
| Critique (generic) | The upload screen "looks like any other uploader" | `/workspace` | At the riskiest step, familiarity beats novelty. The brand belongs in the copy and the privacy line (items 3 and 13), not in a reinvented dropzone. |
| Critique (generic) | The ink closing band is category-standard | homepage | It carries the brand line ("Good work deserves a good read.") and inverts the shared Button through the `dark` class as §9 specifies. Harmless and on-system. |
| Critique (generic) | Center the research reading column at 1440 | articles | "One left content edge" is a deliberate Nov 1 rule (§10, Research): figures run wider to the right. |
| Critique (generic) | Remove the tilted, shadowed hero cards ("floating mockup") | homepage | The overlap tells the story. The only open question is the doc wording on shadows (item 19). |
| Critique cognitive load | Desktop header has 7 items (5 links, Sign in, CTA) | all pages | It is within Impeccable's own "≤5 top-level items" guidance once the account link and the one primary action are counted separately, and it matches §10's one dominant action. |

The detector's typography and palette rules did not fire at all: `overused-font`, `flat-type-hierarchy`, `cream-palette`, `ai-color-palette`, `gradient-text`, `monotonous-spacing` and `em-dash-overuse`. Schibsted Grotesk, Literata and the #f4f4f1 ground read to it as deliberate choices, which they are.

## Should the detector become a CI check?

**No, not as a gate.** Run it by hand once per wave if you want a second opinion, and put its one useful rule into our own guardrail instead.

The numbers, on this run:

| | Findings | Kept | False positive against Highlighter |
| --- | --- | --- | --- |
| Warning-level (would fail CI, exit code 2) | 45 (39 live, 6 source) | 3 | 42 (93%) |
| Advisory (never fails CI) | 66 | 63 (stragglers and unbalanced headings, accurate but cosmetic) | 3 |

What it missed matters more than what it flagged. It caught none of the P1 or P2 items above:

- the score contradiction;
- the Label in Name failure;
- the consent coverage;
- the hidden fix heading;
- the pricing emphasis flip;
- the default focus ring;
- the unlabeled skip buttons;
- the hidden one-sentence read.

axe and a keyboard pass found the accessibility ones; reading the pages found the rest.

Practical costs also count against it:

- Each URL scan launches Chrome and takes about 30 seconds. Our 23-route rendered check at two widths would add about 23 minutes.
- Parallel scans flaked badly (25 of 30 failed to connect when three ran at once).
- The npm shim fetches a platform binary from GitHub releases at runtime. It is checksum-verified, but it is still a network dependency in CI.

Do these instead, cheapest first:

1. **Run axe at phone widths too.** Extend `web/tests/ui/accessibility.spec.ts` to run the axe scan at 320 and 390 as well as 1440. That alone would have caught item 2.
2. **Check focus rings.** Add a focus-ring assertion to `qa:design-system -- --measure`: tab through the header and require a 2px pen outline, which would catch item 6.
3. **Encode the detector's one useful rule.** Put `text-wrap: balance` on headings and `pretty` on prose in `globals.css`, and add both to the guardrail (item 11).

Revisit Impeccable if it learns to read a design system's sanctioned patterns (it already supports `DESIGN.md` and `.impeccable/config.json` ignores). Even with `text-occlusion`, `kicker-above-heading` and `side-tab` ignored, `nested-cards` would still have been 21 of 24 wrong on this site.

## What's working

- **Accessibility foundation.**
  - One axe violation in 60 scans across 320 to 1440 and both color schemes (item 2); everything else came back clean.
  - One H1 per page, a skip link, labeled landmarks, the hero art hidden from screen readers with its words repeated as text, and named Hide buttons.
  - 44px targets on every standalone control.
- **Color carries meaning, and only meaning.** Yellow appears only on what a recruiter would miss, red only on what's missing, blue on the candidate's words and pen on the recruiter's. The detector found no off-palette color, and the system holds from the homepage to the research figures.
- **Motion is restrained and honest.** The reviewer note clears exactly as specified: after 48px of scroll with the card in view on desktop, and once the card is centered on phones. The highlighter sweeps once on the sample's Critical Miss. CLS is 0 to 0.005 everywhere.
- **Research reads as a trust layer, not a blog.** It is question-first: the answer comes first, and every source says what it found and what it can't tell you.

## Run notes

- **Isolation:** Assessment A ran in its own sub-agent with no detector output. The parent (me) had seen detector output before A returned. That is a partial deviation from the critique method, which wants detector findings kept out of the parent until A finishes.
- **Claims checked before use:** every Assessment A claim that entered the backlog was checked against live text or source: the methodology "80 / 100", the missing fourth "weighs" row and the brackets paragraph; pricing's "First Impression score"; the hidden heading below 640px; `LineLift` skip buttons; the hidden one-sentence read; the workspace nav; "Still unclear: Nothing important is missing"; and forced light mode.
- **Claim dropped:** A also noted that the homepage's "Jordan's answer" boxes might be mistaken for fields. I kept it as a minor note, not a finding.
- **Not run:**
  - The critique's browser overlay (`impeccable live-server` plus an injected `detect.js`) was skipped so that no script was injected into the live site. The CLI URL scans cover the same rules.
  - Snapshot persistence to `.impeccable/critique/` was skipped because it would write into the repo.
  - The critique's closing questions to the user were replaced by this ranked backlog, which goes to the coordinating session.
- **Not covered:**
  - report generation and wait states (no report was run);
  - signed-in pages, checkout and auth;
  - VoiceOver (structure was inferred from the DOM and axe);
  - 200% zoom on desktop (the 320px pass covers the same reflow);
  - real-device touch.
- **Browser profile:** the desktop browser pane was signed in to Matt's account. It was used only on public pages (homepage drawer, sample report), not on account pages. All measurements and screenshots used fresh, signed-out headless profiles.
- **Upload screen state:** on this machine's network the screen showed "Sign in for your free report, or get a Job Search Pass", because the anonymous monthly allowance had been used. A first-time visitor sees "Your first report is included". This is not a defect.
- **Scratch only:** detector output, measurement JSON and full-page captures stayed in the session scratch folder. Only the 15 cropped screenshots are committed (1.4 MB).
