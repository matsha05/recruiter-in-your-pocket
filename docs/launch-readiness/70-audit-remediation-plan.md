# Audit remediation plan

Date: 2026-11-01
Status: Draft for Matt's review. Nothing here is approved, merged, or deployed.
Production commit audited: `9c4eaad` (origin/main).

This plan consolidates five audits into one deduplicated list. Each finding appears once, under the phase that owns it.

| Key | Source |
| --- | --- |
| R1 | First product review (live site, desktop and mobile) |
| R2 | Full inspection: 47-route sweep, local states on the live commit, 12 live eval outputs, signed-in pages, PDF |
| CX | Codex review, four turns plus front-end deep audit (Nov 1) |
| RF | Research fact-check of all 18 research and guide pages against their sources |
| DX | Design and UX review: token inventory, contact sheets, interaction states |

Each item has a gate: **C** = before charging customers, **I** = important improvement, **P** = polish. "Ready to charge" means every C item is done and Phase 6.1 passes on the exact release commit.

## Guardrails for whoever executes this

- Work in this worktree on `claude/launch-surface`. Do not touch the main checkout. No merge or deploy without Matt.
- Prompt changes need explicit product reasoning and an eval run (`docs/promptops/shipping-gate.md`). Paid evals need Matt's OK first (the last 10-fixture golden run cost $0.23).
- Never create test accounts in production Supabase. Use the fake Supabase or the dev Supabase and Stripe **test** keys (`.review-harness/`).
- Review UI at 320, 390, 768, 1024 and 1440 px against `docs/design-system.md` (origin/main is the Highlighter system; the main checkout's copy is stale).
- Copy follows `docs/voice-and-tone.md` and `docs/copy-system.md`. Never invent numbers; label estimates.

## Decisions (made by Matt, 2026-11-01)

| # | Decision | Outcome |
| --- | --- | --- |
| D1 | Billing | **Fix the billing error and take payments.** No "not yet" state. Item 0.1 is now "make checkout work in production", verified end to end (6.1) |
| D2 | Critical Miss | Keep the name with one stricter definition everywhere; allow "Nothing critical" |
| D3 | Rewrites | Build the answer-to-revised-line interaction (Phase 2). Until it ships, pricing and sample copy must not promise rewrites (0.4) |
| D4 | Homepage hero | Keep the headline, reveal the note, add the worked example below it, cut one rejection beat |
| D5 | Score | Bands with anchors on the first report; the number only for revision deltas |
| D6 | Wordmark | Yes. Claude or Codex designs the logotype and symbol for Matt's approval (3.8) |
| D7 | Vocabulary | Approved: Resources → "After the offer"; one name each for keep, fix and the main action (4.8) |
| D8 | Research | Fix pages in place, writing-quality first |

## Phase 0: Truth and trust

Small, mostly independent fixes. Do these first.

| ID | Finding (source) | Change | Done when | Gate | Owner / files |
| --- | --- | --- | --- | --- | --- |
| 0.1 | Every $29 button returns 503 "Purchases are temporarily unavailable" because purchases are switched off in production (R1, R2, CX). Locally, checkout reaches Stripe in test mode. **Root cause (found Nov 1):** the billing-incident kill switch `RIYP_DISABLE_NEW_PURCHASES` was set in Vercel Production on Oct 30 at 21:55 UTC, 16 minutes after a cluster of "report did not pass its evidence check" failures (Sentry JAVASCRIPT-NEXTJS-14: 9 events on release `e05da605`, last seen Oct 31 at 11:17 UTC). The validator fixes for those false rejections are in production (`9c4eaad`, deployed Nov 1 at 03:27 UTC) with no recurrence since. The switch was never removed. Billing itself was verified in July (runbook 95). **Done Nov 1:** with Matt's go-ahead, `RIYP_DISABLE_NEW_PURCHASES=false` was set in Vercel Production and commit `9c4eaad` was redeployed unchanged (`dpl_4xkEo5Mfxx7fttdtJwnrBKmfSgk7`). The pricing CTA now opens a live Stripe Checkout ($29.00 Job Search Pass, one-time, no renewal). **Remaining:** Matt's real purchase and refund (6.1) | Per D1: find which production setting disables purchases, confirm live Stripe config (key, price, product, webhook) is complete, enable purchases, and verify purchase → entitlement → restore → receipt on production | A real purchase by Matt unlocks the pass, and a refund works | C | Eng + Matt: `app/api/checkout/route.ts`, Vercel production env, Stripe live dashboard |
| 0.2 | Status page says "Payments … Configured" while purchases are off (R2) | Status reflects real flags, or the page leaves public navigation. **Done locally Nov 1, not deployed:** `getPublicStatusSnapshot` now reports Payments as "limited", with an incident line, when `RIYP_DISABLE_NEW_PURCHASES` is on | Status never contradicts live behavior | C | Eng: `components/legal/StatusClient.tsx`, `app/(marketing)/status/page.tsx` |
| 0.3 | The Critical Miss "What to add" box shows the `why` sentence, not what to add (R2, live and local) | Map the box to the missing-detail questions; hide the label when there are none | Real eval outputs render a real "what to add" | C | Eng: `components/workspace/report/FixCanvas.tsx` |
| 0.4 | Pricing promises "Rewrites that use only your facts"; 0 of 12 production-prompt outputs contained rewrites (R2, CX) | Align the pricing and sample copy with what reports deliver until Phase 2 ships (D3) | Every promise on pricing is visible in a real report | C | Content + Eng: pricing client, `public/sample-report.json` |
| 0.5 | The sample shows drafts real reports don't have; Methodology calls it "A real report"; the sample page says "Example report" (R1, R2) | Label the sample as a fictional example everywhere; make it represent real output | One label; the sample matches real behavior | C | Content: `/sample-report`, `app/(editorial)/methodology/page.tsx` |
| 0.6 | Overclaims: "reads your resume the way a recruiter would", "most likely to skip past", "the gap most likely to cost you", research "Where this shows up in your report" boxes, Trust's "Things you can verify yourself" (R1, R2, RF) | Reword to describe the method ("applies a recruiter's criteria"); drop implied validation | No page implies validated prediction | C | Content: methodology, pricing, research pages, `/trust` |
| 0.7 | Trust page mentions extension data and saved jobs, which aren't offered publicly (R1) | Remove or mark as not available | Trust copy matches shipped features | C | Content: `/trust` |
| 0.8 | Founder claim ("led hiring globally at OpenAI, Meta, and Google", "hired hundreds") not independently verifiable (R1, RF) | Matt confirms the exact wording; show role, company and years | Every word is defensible | C | Matt + Content: `components/landing/LandingMineral.tsx` |
| 0.9 | Free-report promise vs network-based gate: "No account or card" while the allowance is per device and network, monthly (R1, R2) | One plain line about shared networks beside the promise on home and pricing | Promise and behavior agree | C | Content + Eng: homepage, pricing, `PaywallModal.tsx` |
| 0.10 | Returning visitor: "New report" shows the old report with no way forward (R1, CX) | Explicit used-free-report state with both paths (sign in, pass) | A returning visitor sees why before pasting | C | Eng: workspace, `lib/reports/anonymous-report-recovery-client.ts` |
| 0.11 | Corrupt PDF makes `/api/parse-resume` return 500, and the explanation vanishes in seconds (R2) | Return 4xx; persistent inline error next to the dropzone with "Paste the text instead" | The error stays visible and offers a path | I | Eng: `app/api/parse-resume/route.ts`, `components/workspace/InputPanel.tsx` |
| 0.12 | `/research/structured-interviews` returns 404; the Lever source returns 401 (R2, RF) | Redirect to `/research/star-method`; replace the Lever link | No dead links | I | Eng/Content |

## Phase 1: Report integrity (evals first)

| ID | Finding (source) | Change | Done when | Gate | Owner / files |
| --- | --- | --- | --- | --- | --- |
| 1.1 | Evals pass on grounding and schema but don't measure what customers feel (R2) | Add checks: rewrite count, keep/fix collision on the same line, repeated-observation count, field-slot mapping, Critical Miss category (bullet vs structural), Verdict/Critical Miss agreement, score test-retest | The harness reports all of these on the golden set; baseline recorded | C | Eng: `web/lib/evals/checks.ts`, `runner.ts` (paid run needs Matt's OK) |
| 1.2 | Keep/fix contradictions on the same line, seen three times: sample, production report, eval PDF (R1, R2, CX) | Deterministic post-generation pass: one disposition per line; the Critical Miss line never in Keep; drop questions that duplicate a fix; each observation rendered in full once. Applies to web and PDF | Zero collisions and no full repeats on the eval set | C | Eng: report normalization, `ReportStream.tsx`, `IndependentAdvice.tsx`, `lib/backend/pdf.ts` |
| 1.3 | All 12 Critical Misses are single-bullet edits; elite resumes (92, 90) still get one (R2) | Prompt change (needs eval and Matt's approval): structural first-read issues (gaps, target role, level, buried evidence) outrank bullet edits; allow "Nothing critical"; role-specific reasoning; Verdict and Critical Miss tell one story | Matt's blind pick agrees at a rate set in advance on about 30 resumes; zero Verdict/Critical Miss mismatches | C | Eng + Matt: `web/prompts/resume_v2.txt` |
| 1.4 | The model flagged a multi-year gap in 5 of 12 runs, but the UI shows it only inside the collapsed "Full recruiter notes" (R2) | Structural gaps surface in the opening read, not behind a disclosure | The gap is visible without expanding anything | C | Eng: `components/workspace/report/FullRecruiterNotes.tsx`, report layout |
| 1.5 | Critical Miss has different definitions on pricing, methodology and the report (R1, CX) | One definition everywhere (D2) | Home, pricing, methodology and report describe the same thing | I | Content |
| 1.6 | Score precision: weak resumes cluster at 59–60; retest gave 60, 60, 58 (R2) | Apply D5: bands with anchors, or the number plus "what would move it"; use it for revision deltas | The score never implies more precision than tested | I | Eng + Design |
| 1.7 | Recovered reports change after refresh: quotes shorten, the role heading changes, and "Saved reports don't keep your resume" appears on an unsaved report (CX) | Consistent recovered state; accurate copy; a way to reattach the source | Before/after refresh the report keeps its meaning | I | Eng: `ReportStream.tsx` |
| 1.8 | "Not relevant" doesn't persist; the overview still shows the dismissed Critical Miss; focus is lost (CX, confirmed) | Persist the dismissal or rename it "Hide this suggestion"; move focus to "Bring it back"; the overview follows | Dismiss, undo, refresh and reopen behave as labeled | I | Eng: `FixCanvas.tsx` |
| 1.9 | Fix headings are 2–5-line conditional instructions (CX, DX) | Short finding title, then location and conditions in the body (prompt field or UI split; prompt change needs eval) | Headings scan in one or two lines at 390px | I | Eng + Design |

## Phase 2: The signature report

Design, then test, then build. Needs D2 and D3, and 1.1–1.2 in place.

| ID | Change | Done when | Gate |
| --- | --- | --- | --- |
| 2.1 | **Marked-up resume layout.** Candidate lines in blue ink on the left; the Critical Miss line swept with the highlighter; pen notes in the right margin. On mobile, line cards with the note beneath. Uses existing Highlighter tokens (DX) | Prototype reviewed at 390/1024/1440 using real eval outputs, including long findings and strong resumes | I |
| 2.2 | **Answer to revised line.** One to three short questions from the Critical Miss produce a revised line built only from the candidate's answers, with the existing fabrication guard. Options: "I didn't do this" and "I don't know". The `LiftedTrace` steps become live states instead of a static list (R1, CX, DX) | A candidate copies a fact-only revised line without leaving the report; evals show no invented facts; most usability participants produce a line they'd use | C if D3 = build |
| 2.3 | **Re-check loop.** The Critical Miss shows "addressed" when the revised line contains the missing fact. Paid "re-check the whole resume" shows the delta (R1) | The free value moment lands before payment; the paid next step is obvious | I |
| 2.4 | **One report everywhere.** Sample, fresh, recovered, saved and PDF share one layout and one document scroll. Today the sample and fresh reports scroll inside a container while saved reports scroll the page (DX) | Same component and same scroll model on every route | I |
| 2.5 | **Mobile first screen.** The Critical Miss appears once; the first action sits inside the first screen (CX, DX) | Verified at 390px with long real outputs | I |
| 2.6 | **A designed ending.** Replace the mailto-only "Did we read you right?" with in-product feedback on the Critical Miss (which feeds evals) plus the next step (DX) | Feedback is captured in-product; the ending offers a clear next step | I |

## Phase 3: Design system enforcement

| ID | Finding (source) | Change | Done when | Gate | Files |
| --- | --- | --- | --- | --- | --- |
| 3.1 | 121 text styles, 31 sizes (including 13.76, 14.72, 15.2, 16.48, 100.8 px), 69 size/leading pairs, weights 400–800 including 500/520/720 (DX) | About 10 named text roles; weights 400/600/800; no fractional sizes. Heading tiers: marketing 64–72, content 44–48, app 32 | The guardrail counts roles and fails above budget | I | `web/app/globals.css`, `tailwind.config.js` |
| 3.2 | Heading scale inverted: the 404's 100.8px title is the largest type on the site; research index (76) beats the homepage (72); the sample's page title is a 24px paragraph (DX) | Apply the tiers from 3.1 | Hierarchy follows importance | I | `app/not-found.tsx`, `ResearchHub.tsx` |
| 3.3 | The primary dark pill exists in about 9 builds: heights 44–60, text 14–17px, weights 500/600, white vs `#F4F4F1` labels (DX) | One Button with sizes 44/48/60 and primary/secondary/quiet variants; link-styled CTAs use it | One build per size and variant | I | `components/ui/button.tsx` and callers |
| 3.4 | Hover and press feedback differ by surface; FAQ rows have none; press only on Button (DX) | One hover/press grammar for buttons, links, rows and cards | Every clickable thing responds the same way | I | shared CSS |
| 3.5 | No grid: 22 left edges on the homepage; pricing content at 40px vs footer at 84px; report sheet header and content misaligned (DX) | One content edge per surface on a shared grid | At most 3 content edges per page at 1440 | I | landing, pricing, report |
| 3.6 | Prose measure: research body at 69, 80 and 126 characters per line in one article; legal pages 73–81 (DX) | Prose rail capped at about 66ch; figures may break out | No body paragraph over 75ch | I | research and legal layouts |
| 3.7 | Two icon families in the product menu; public and app drawers open from opposite sides at different widths (CX, DX, confirmed) | One drawer component; Phosphor only; 16px inline, 20px navigation | Same control on every surface | I | `components/layout/MobileNav.tsx`, `AppHeader.tsx` |
| 3.8 | Wordmark is 12px stacked capitals (10px in the app header), smaller than the nav (DX) | D6: logotype and symbol across header, favicon, share card, PDF and email | Approved mark in every output | I | brand assets |
| 3.9 | Color-meaning drift: yellow fills both the bars and the note in the spelling figure; green headline lines on the guides; shadows on static legal containers (DX) | Enforce one highlighter per figure, pen only for recruiter notes, no shadows on static cards | The guardrail checks these | P | figures, guides, legal |
| 3.10 | At 1024px both hero buttons wrap in a 284px column (CX, confirmed) | Reflow the hero earlier | Button labels on one line at every width | I | `components/landing/home/VerdictHero.tsx` |
| 3.11 | Citation jumps land under the fixed header; report section links don't move focus (CX; axe flagged obscured footnote targets) | Header-aware `scroll-margin`; focus the target heading after a jump | Source fully visible; keyboard position follows | I | research article template, report TOC |
| 3.12 | Mobile trust sub-nav shows a clipped "rivacy Policy" (DX) | Edge fade and scroll padding, or fewer tabs (see 4.9) | No clipped labels | P | legal nav |
| 3.13 | Doc and runtime disagree: §3 says the hero is "See what a recruiter sees." while §10 says "They called someone back"; dark mode is documented but the site stays light under a dark system setting (DX) | Reconcile `docs/design-system.md` with runtime | No contradictions in the doc | P | docs |
| 3.14 | Guardrail doesn't catch drift (DX) | Add style-count budgets (text roles, button variants, radii, shadows) and a measure check to `qa:design-system` | Drift fails CI | I | `web/scripts/qa/design-system-guardrails.mjs` |
| 3.15 | 500–670 KB of JavaScript on text pages; lab first content 2.3–3.2s on slow 4G with 4× CPU (R2) | Trim client JavaScript on marketing and research routes | Lab LCP under 2.5s on the throttled run for every key page | I | build analysis |

## Phase 4: Journey and homepage

| ID | Finding (source) | Change | Done when | Gate |
| --- | --- | --- | --- | --- |
| 4.1 | The blurred reviewer note never resolves; rejection is stated three times before the product shows help (R1, CX, DX) | Apply D4: reveal the note on scroll; a worked fictional example (Jordan's line → note → answer → revised line); cut one rejection beat; consistent alignment | Five-second test: visitors can say what the product does and that the example is fictional | I |
| 4.2 | "See an example" switches from Jordan (CSM) to an unrelated PM (R1, CX) | The sample report is Jordan's | One candidate from homepage to sample | I |
| 4.3 | Company "logos" are typeset placeholders (DX) | A role, company and years line in place of the logo bar | Reads as a credential, not decoration | P |
| 4.4 | Paid features (re-check, job fit) are never shown; exhausted-pass and refund details live only in the FAQ (R1, CX) | Show both paid features with an example on pricing; add exhausted-pass and refund lines | A visitor can see what $29 buys | I |
| 4.5 | No privacy explanation at the input; no preview of what was parsed; short input only warns (CX, R2) | One linked privacy line at the input; a "What we read" preview; a stronger guard below a minimum length | The user knows what's processed and what was read | I |
| 4.6 | The 1–2 minute wait screen never changes (R2, DX) | Honest liveness (elapsed time, real stage when known) with no fake percentages | Users can tell it's working | I |
| 4.7 | Research index: the large question isn't clickable; only a 64×44 "Read →" at the far right of a 1124px row (DX, confirmed) | Make the whole row the link, with hover | The question opens the article | I |
| 4.8 | Competing labels: Research vs Resources; keep has 3 names; fix has 4; the main action has 3 (DX, CX) | D7 word list: Resources → "After the offer"; one name each for keep, fix and the main action; tab labels match headings | Glossary in `docs/copy-system.md`; UI matches | I |
| 4.9 | Trust cluster has 8 tabs; Status is an operations view (DX) | Consolidate to Privacy, Terms, Security and Help; Status becomes a real status page or leaves the nav | Four tabs at most | P |
| 4.10 | Footer is two unlabeled mixed rows, with an orphaned "free." (DX) | Grouped, labeled columns | Clear footer information architecture | P |
| 4.11 | Progress ("Up 14 since your first report") is invisible in marketing (R2) | Show the revision journey on home and pricing | Repeat value is visible before sign-in | I |
| 4.12 | Calculator ranks offers even when one is missing bonus and equity; the research index promises benefits the calculator excludes (R2, CX) | Flag incomplete offers in the ranking; fix the index copy | No confident ranking of incomplete inputs | P |
| 4.13 | The consent banner covers "Read mine" on short laptop screens (R2) | Compact banner or reposition | Primary CTA visible on first load at 1280×720 | P |
| 4.14 | Typed sign-in email was wiped once while the page settled (R2, single observation) | Investigate the hydration race | Not reproducible under throttling | P |

## Phase 5: Research and content credibility

Highest first. Each fix keeps the page's useful advice and restores the source's limits.

| Page | Corrections (RF unless noted) | Gate |
| --- | --- | --- |
| writing-quality-hire-probability | Add base rate (3.1% → 3.3%), 95% CI (3–13%), setting (non-generative grammar suggestions; short freelancer profiles; mostly non-native English; hires within 28 days). Cite the Management Science 2025 version and its funding disclosure. Fix the FAQ "Is writing quality just style? No." Remove the tie to AI rewrites | C |
| resources/offer-negotiation | Pew figure: 30 asked, 60 didn't, 10 don't remember (CX; not 70 didn't ask). Source or label "Almost every offer has room" and "Recruiters expect you to ask" as Matt's experience. Remove risk-free assurances. Gerhart & Rynes 4% is men only. Rewrite the Mason sentence so it can't be read backwards. Soften "the biggest loss is the 70 who never asked" | C |
| quantifying-impact | Use the published AER numbers for Bertrand & Mullainathan (10.79 / 8.50; 6.70 / 6.19), 4,870 resumes, fieldwork 2001–02. Fix "only for white-sounding names". Name Wiles consistently (not "van Inwegen") and explain 194,700 analyzed vs 480,948 randomized. Verify or soften Cole's "strongest predictor" | C |
| gaps-and-pivots | Hollister: the exception was software-tester roles, and tech employers did not broadly embrace mobility. Fix the reversal | C |
| who-you-are | The gap FAQ contradicts Kristal (explaining didn't help). The example rewrite adds facts while saying "the facts didn't change". Rivera: "usually", not "every". Flag the Kroft and Pallais leaps | C |
| referral-advantage | Name the author of the "recruiter's desk" section or label it as Matt's experience. Reconcile "isn't about being stronger" with Limitations. Use "applications", not "people". Caveat the 17×/36× ratio (built on a rounded 0.2%). Add Brown et al.'s firm and years (2006–2010) | C |
| spelling-errors-impact | State Belgium, Dutch-language resumes, 2020. Fix "Is grammar more important than content? No." Label "What to fix first" as advice. Mention heterogeneity | I |
| social-screening | Add the headline finding (no profile was penalized more than mental-health signals). Date it as a working paper. Name Vosen 2021 | I |
| skills-first-promise-reality | Correct the LinkedIn source title; it's a simulation, not platform data. Add nuance to "kept hiring the same people" | I |
| ats-myths and the research index | EEOC fact sheet isn't software-specific. "Gets lost" → a failed parse stays attached for manual handling (CX). Source or soften "workflows can reject". Drop the claim that RIYP extraction mirrors ATS parsers. Replace the Lever link | I |
| how-recruiters-read | The key finding headlines a sample size; state the one-state limitation; don't use Fritzsche & Brannick as writing advice; drop "Your Verdict is our version of that first pass" | I |
| methodology | "Attention concentrates on experience" is partial. Explain "not a simple average" alongside "no sub-scores". Say plainly that reports read text, not visual layout ("scanning the page" vs the resume-length article, CX) | I |
| hiring-discrimination-meta-analysis | The caption pairs the 28-study total with figures from the 24-study subset; "same resume" ignores in-person audits; label "better wording can't close this gap" as interpretation; add post-2015 evidence | I |
| automation-and-bias | The figure's "Parsing" stage comes from Greenhouse, not Upturn; use Upturn's own stage names; add newer evidence | I |
| human-vs-algorithm | Source or remove "a number you can trace"; note the French online panel | P |
| resume-length-myths, salary-history-bans, linkedin-visibility, tech-offer-negotiation, star-method | Data age (~28 years) and abstract-only disclosure; add authors to the salary sources; LinkedIn source date; cite w33903's encouragement finding; star-method is low risk | P |
| Cross-cutting | One evidence standard (vendor data labeled as vendor data everywhere); "Our take" labels on every experience claim; canonical tags on research and legal pages; add both guides to the sitemap; stop `/internal/system-lab` leaking its page title | I |

## Phase 6: Release verification and customer evidence

| ID | Change | Done when | Gate |
| --- | --- | --- | --- |
| 6.1 | Production end-to-end on the release commit: Matt signs in and runs a real report; the sign-in code email (template lives in the Supabase dashboard); live purchase and refund by Matt; webhook entitlement; restore; receipts; PDF; account deletion | Every step observed on production and recorded | C |
| 6.2 | 5–8 moderated sessions with active job seekers: understand the hero, read the report, produce a revised line, explain why they'd pay | Findings recorded; changes prioritized from evidence | C for Phase 2 sign-off |
| 6.3 | Accessibility: VoiceOver pass, 200% zoom, keyboard-only full journey (upload, auth, report, purchase) | No blockers | C |
| 6.4 | Monitoring: `llm.response.repair_failed`, gate hits on first anonymous attempts, checkout conversion, field performance data | Dashboards in place before charging | I |

## Parallel workstreams

These can run at the same time in separate worktree sessions without touching each other's files:

1. **Research corrections** (Phase 5): content-only page edits.
2. **Eval harness and post-generation pass** (1.1, 1.2): `web/lib/evals/`, report normalization.
3. **Design-system foundation** (3.1, 3.3, 3.4, 3.14): tokens, Button, guardrail budgets.
4. **Truth fixes** (0.1–0.12): small, scattered copy and route fixes.

Sequenced work:
- Phase 1 prompt items (1.3, 1.9) need 1.1 first.
- Phase 2 needs D2, D3, 1.1 and 1.2.
- Phase 4 homepage (4.1, 4.2) follows Phase 2's design.
- Phase 6.1 is the last gate before charging.

## Keep (don't regress)

- The research figure system (unit grids, pen notes, circled typos, one highlighter).
- Color discipline: 12 text colors, semantic pens.
- The Schibsted Grotesk + Literata pairing.
- The homepage silence list, the one-sentence verdict, the closing band.
- The founder AI disclosure.
- "No ATS score. No interview odds."
- Failure messages that keep pasted text and say the free report wasn't used.
- The paused-generation banner.
- The PDF layout.
- Signed-in Progress and Billing.
- Accessibility basics: clean axe scan, visible focus, 44px targets, 13px floor.

## Not covered by any audit yet

A screen-reader pass; physical-device testing; email clients; the favicon and share card in this design pass; real-customer report quality at volume; willingness to pay.
