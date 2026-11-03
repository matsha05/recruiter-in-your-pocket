# RIYP brand touchpoint audit

Worktree: `/Users/matsha05/Desktop/dev/riyp-bar-2026-11` at `3bfd639a` (Wave 3). Read-only; no files changed. Standards applied: `docs/voice-and-tone.md`, `docs/copy-system.md` (Nov 1 one-name table), `docs/brand-system.md`, `docs/design-system.md` (Highlighter 1.1), `docs/agent-design-standards.md`, and `docs/copy-sweep-2026-11.md`. All file paths below are relative to `web/` unless they start with `docs/`, `extension/` or `package.json`.

## Did the November sweep land?

Landed in code (verified): workspace H1 "Let's see what they see." (`components/workspace/InputPanel.tsx:142`); 404 and app-error copy; founder anonymized (`components/landing/LandingMineral.tsx:24-35`, `lib/seo/site.ts` has no Person, homepage JSON-LD has no `creator`); Terms §1 no longer mentions the founder's work history (`lib/legal/content.ts:220`); methodology band language and Critical Miss definition; pricing feature list; sample share title; manifest description; trust card "What the score tells you"; FAQ answers; footer "Bullets that show results" (`lib/navigation.ts:133`); research tie-ins ("Your Critical Misses are the problems that could cost you the interview on their own"); `referral-advantage` says "our founder's experience"; the HiringTruths replacement line shipped ("Not forty tips. Every Critical Miss, and the one to fix first.").

Not landed (the sweep marked these "for routing" to other sessions; they are still live): every report-component proposal (`ReportStream.tsx:278, 289-292, 299`, `ReadComparison.tsx:37-38`, `MissFeedback.tsx:39`, `FullRecruiterNotes.tsx:10, 130`, `IndependentAdvice.tsx:141`, `ReportPanel.tsx:183, 198`, `lib/reports/report-presentation.ts:33`, `lib/backend/pdf.ts:99, 211-213, 230`); the server "Please" messages (`app/api/account/delete/route.ts:154, 177`, `app/api/linkedin-feedback-stream/route.ts:267`); hidden-surface retired names (Jobs, LinkedIn, extension popup); dead `MARKETING_NAV` title case (`lib/navigation.ts:85-91`). The `LEGAL_LAST_UPDATED` date was not moved even though FAQ and trust copy changed (see finding 19).

## Touchpoint table

Pass/fail is for the surface as a customer sees it. "Hidden" means the surface is behind a launch flag that is off in production.

| # | Touchpoint | File(s) | Voice | Naming | Grammar | Anonymity | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Homepage | `app/(marketing)/page.tsx`, `components/landing/LandingMineral.tsx`, `components/landing/home/*.tsx`, `lib/marketing/jordan-example.ts` | Pass | Pass | Pass | Pass | Strongest surface. Fictional tags present. Founder section uses "I" without any identifying detail. Only nit: `page.tsx:9` share description still "the one thing to fix first" (kept by Matt's rule). |
| 2 | Site header, nav drawer, footer | `components/layout/SiteHeader.tsx`, `components/layout/NavDrawer.tsx`, `components/landing/Footer.tsx`, `lib/navigation.ts` | Pass | Pass | Pass | Pass | `lib/navigation.ts:85-91` dead `MARKETING_NAV` is title-cased ("How Recruiters Read", "Research Hub", "Negotiation Guide"); unused, delete it. |
| 3 | Pricing | `app/(marketing)/pricing/page.tsx`, `components/marketing/PricingPageClient.tsx`, `components/marketing/PassExamples.tsx`, `lib/billing/pricing.ts` | Pass | Pass | Pass | Pass | Blunt and literal. `PricingPageClient.tsx:30` "Immediate access" is the one corporate heading. |
| 4 | Sample report page | `app/(marketing)/sample-report/page.tsx`, `public/sample-report.json` | Pass | Pass | Pass | Pass | No identity in the JSON. Ends on the un-landed "Now let's look at yours." (finding 8). |
| 5 | Research index + article shell | `app/(editorial)/research/page.tsx`, `components/research/ResearchHub.tsx`, `ResearchHubData.ts`, `AnswerArticle.tsx` | Pass | Pass | Pass | Pass | "The questions you're asking at 1 a.m." is the house voice. Every article links its study and a limit. |
| 6 | Research articles (3) | `research/how-recruiters-read/page.tsx`, `research/referral-advantage/page.tsx`, `research/spelling-errors-impact/page.tsx` | Pass | Pass | Pass | Pass | Calibrated; "Our take" labeled; "we read only the abstract" stated. Résumé with accent at `quantifying-impact/page.tsx:60` is a quoted paper title (kept on purpose). |
| 7 | Methodology | `app/(editorial)/methodology/page.tsx`, `components/research/ResearchArticle.tsx`, `diagrams/FirstReadModelDiagram.tsx` | Pass | Pass | Pass | Pass | Band language landed. The report itself still contradicts it in one line (finding 3). |
| 8 | Guides: After the offer index, offer negotiation | `app/(editorial)/guides/page.tsx`, `guides/offer-negotiation/page.tsx` | Pass | Pass | Pass | Pass | Request → basis → decision throughout; limits on every study. |
| 9 | Comp calculator | `components/guides/comp-calculator/*.tsx` | Pass | Pass | Pass | Pass | "Modeled", "It is not a recommendation." Honest to a fault. Validation alerts use `bg-warning/10` (finding 1). |
| 10 | Privacy, Terms, Trust, Security, FAQ, Support, Status | `lib/legal/content.ts`, `lib/legal/dataHandling.ts`, `components/legal/*.tsx`, `app/(marketing)/{support,status}/page.tsx` | Pass | Partial | Partial | Pass | "Delete individual reports from Reports" (nav says "My reports") in `content.ts:96, 363` and `dataHandling.ts:27, 55`. Visible "Last updated September 4, 2026" on FAQ/trust/security is stale (finding 19). Status chips use `bg-warning/10` (finding 1). Three "please" (`StatusClient.tsx:163`, `SecurityClient.tsx:88`). |
| 11 | Sign-in | `app/(public)/signin/page.tsx` → `/auth`, `components/auth/AuthFlow.tsx`, `lib/auth/content.ts` | Pass | Pass | Pass | Pass | "Not there? Check spam and Promotions. Recruiters lose good emails there too." Code field carries a `font-mono` class (`AuthFlow.tsx:387`), harmless because `--font-mono` resolves to Schibsted. `app/auth/page.tsx:9` description "role context you choose to keep" is jargon. |
| 12 | LinkedIn review page (hidden) | `components/linkedin/LinkedInInputPanel.tsx`, `LinkedInReportPanel.tsx`, `components/workspace/LinkedInModeSection.tsx`, `ModeSwitcher.tsx` | Fail | Fail | Fail | Pass | Alpine survivor: Lucide icons, `font-mono` numerals, uppercase labels on every section, `text-success` green-for-good ("Professional", "Branded"), a `bg-premium text-white` filled button (`LinkedInModeSection.tsx:125`), "Review score" /100, "See example report", "Start with these changes.", "Suggested rewrites", "Review my profile", API "Please enter a valid LinkedIn profile URL (e.g., …)". Do not turn `linkedInReview` on until it is rebuilt on the marked-up report. |
| 13 | Report: Verdict, band, Critical Miss rows, LineLift | `components/workspace/report/ReportStream.tsx`, `markup/MarkedRows.tsx`, `markup/ScoreBand.tsx`, `markup/LineLift.tsx`, `lib/reports/score-band.ts`, `lib/reports/report-presentation.ts` | Partial | Pass | Partial | Pass | Core report is in voice. Fails: `ReportStream.tsx:278` "how easy the page is to scan" (finding 3), `:289-292` and `:299` (findings 8, 9), `report-presentation.ts:33` fallback (finding 13). `LiftedTrace` paints completed steps in Alpine citron (finding 5). `score-band.ts:15` comment says anchors are "pending Matt's copy approval". |
| 14 | Report: comparison (re-check) | `components/workspace/report/ReadComparison.tsx` | Fail | Fail | Pass | Pass | Finding 2. Numbers out of 100 are correct here (comparison only). |
| 15 | Report: full notes, other edits, feedback | `FullRecruiterNotes.tsx`, `IndependentAdvice.tsx`, `markup/MissFeedback.tsx`, `ResearchReceipts.tsx` | Partial | Fail | Pass | Pass | Findings 7, 10, 11. `FullRecruiterNotes.tsx:192` shows "Job match: n/100" on a first report. ResearchReceipts is good. |
| 16 | Report shell, empty, loading, unlock banner | `components/workspace/ReportPanel.tsx`, `AnalysisScanning.tsx`, `UnlockBanner.tsx`, `InputPanel.tsx` | Partial | Partial | Fail | Pass | Findings 1, 12, 20, 25. Wait screen is honest about stages and elapsed time. Save error (`ReportPanel.tsx:316`) and slow-run aside (`AnalysisScanning.tsx:188`) sit on the Critical Miss yellow. |
| 17 | PDF export | `lib/backend/pdf.ts`, `lib/backend/pdf-styles.ts` | Partial | Fail | Partial | Pass | Finding 6. Fonts, band, highlighter and pen margin notes are right. `pdf-styles.ts` `h2 { font-weight: 500 }` is outside the 400/600/800 system. File header comment still says "Alpine report PDF generator". |
| 18 | Share cards / OG | `app/opengraph-image.tsx`, `app/og/home/route.tsx`, `app/og/research/[id]/route.tsx`, `lib/seo/share-cards.ts` | Pass | Pass | Fail | Pass | Finding 4 (retired Source Serif + drop shadow on the homepage card). Research card label is uppercase (finding 23). Site card is correct: highlighter on the line, miss sheet, Literata question. |
| 19 | Sign-in email | `lib/auth/otpEmail.ts` | Pass | Pass | Pass | Pass | Reference-quality. One nit: "It works once and expires soon." could name the window if it is fixed. |
| 20 | Support email pipeline | `lib/support/inboundEmail.ts`, `replyEmail.ts`, `resendReplyProvider.ts` | n/a | Pass | n/a | Pass | No customer-facing auto-reply exists; inbound mail is forwarded to Gmail with an internal notice (`inboundEmail.ts:304` "SUPPORT NOTIFICATION — DO NOT REPLY FROM GMAIL", blue `#1d4ed8` box). Outbound replies are typed by the operator with no template or signature. There are no receipt, purchase-confirmed or report-ready emails in the repo; Stripe sends the receipt. |
| 21 | 404 / error / global-error | `app/not-found.tsx`, `app/error.tsx`, `app/global-error.tsx` | Pass | Pass | Pass | Pass | "No reply from this one, either." is a good aside. `font-mono` on the error reference (`error.tsx:50`, `global-error.tsx:45`) is a leftover class. |
| 22 | API error copy surfaced to users | `lib/billing/generationFailureCopy.ts`, `lib/billing/generation-stream-failure.ts`, `app/api/**/route.ts`, `components/upload/ResumeDropzone.tsx`, `components/workspace/hooks/useResumeReview.ts` | Pass | Partial | n/a | Pass | Generation failure copy is excellent ("This didn't use your free report."). Fails: `app/api/passes/route.ts:15, 25` raw strings reach the Settings toast (finding 17); `app/api/export-pdf/route.ts:48, 65` "paid access" (finding 18); `app/api/resume-feedback/route.ts:168` "Your browser is ready. Try creating your report again."; "Please" at `account/delete/route.ts:154, 177`. |
| 23 | Paywall / pass denied | `components/workspace/PaywallModal.tsx`, `lib/billing/pricing.ts` | Pass | Pass | Pass | Pass | "Want another read?" and the free-sign-in branch are plain and honest. |
| 24 | Settings, My reports, report detail, Progress | `components/workspace/SettingsClient.tsx`, `app/(app)/reports/page.tsx`, `components/reports/ReportHistoryList.tsx`, `ReportDetailClient.tsx`, `app/dashboard/ProgressView.tsx` | Pass | Fail | Pass | Pass | Findings 14, 15. "Points toward {role}" and "Your reports are safe. This is on our end" are good. `ReportDetailClient.tsx:144` "Check a revision" vs noun "Re-check" vs button "Compare my revision": three verbs for one action. |
| 25 | Purchase confirmed / restore / billing return | `components/purchase/PurchaseConfirmedClient.tsx`, `PurchaseRestoreClient.tsx`, `app/(marketing)/purchase/*/page.tsx` | Pass | Pass | Partial | Pass | "You're in. Five more reads." / "Paid. One step left." Fallback eyebrow is uppercase (finding 23). Warning notes on brass (finding 1). Receipt dates use `toLocaleDateString()` with no locale (`PurchaseRestoreClient.tsx:229`), so they will not read "Oct 25, 2026". |
| 26 | Stripe product names | `lib/billing/stripeOffers.ts`, `app/api/checkout/route.ts` | n/a | Pass | n/a | Pass | Product and price names live in Stripe (env IDs), not in the repo; the code only verifies the pair. Check the Stripe dashboard product is named "Job Search Pass" with the pass's own description; nothing here to audit. |
| 27 | Metadata: titles, manifest, robots, sitemap, JSON-LD | `app/layout.tsx`, `lib/seo/*.ts`, `app/manifest.ts`, `app/robots.ts`, `app/sitemap.ts`, route `metadata` | Partial | Pass | n/a | Pass | Finding 16 (root default title). Organization-only authorship; no Person anywhere. `app/(app)/reports/[id]/page.tsx:10` "Detailed report view with evidence-backed recruiter feedback." is generic (noindex). |
| 28 | Chrome extension listing + extension UI | `docs/launch-readiness/chrome-web-store-listing.md`, `extension/public/manifest.json`, `extension/src/popup/content.ts`, `extension/src/styles/tokens.css`, `extension/src/background/storage.ts` | Fail | Fail | Fail | Pass | Finding 22. Whole extension is still Alpine (Instrument Sans, mono, teal brand). Listing copy says "the studio". Hidden behind `extensionSync`. |
| 29 | package.json | `package.json` | Fail | Fail | n/a | Partial | Finding 21. "resume studio", "crafted feedback", `"author": "Matt"`. |
| 30 | LinkedIn Page drafts and social copy | `docs/growth/brand-drafts.md` | Pass | Partial | n/a | Pass | Voice and claims are strong; every number traces to an article. Finding 24: "a score that says where to start" predates the band decision; listing copy says "suggested edits". The anonymity rule block is exactly right. |

## The 25 findings, ranked

Each: the exact current string, where it is, why it fails, and a replacement in the house voice.

### 1. Operational warnings wear the Critical Miss yellow

- Current: `app/globals.css:135-136` `--warning: var(--brass); --warning-foreground: var(--brass);` with `--brass` = miss ink `#6b5400`. Used by `components/workspace/AnalysisScanning.tsx:188` `className="mt-7 rounded-xl border border-warning/35 bg-warning/10 …" aria-label="Report still in progress"`, `components/workspace/ReportPanel.tsx:316` (save error), `components/legal/StatusClient.tsx:79, 140, 154` ("Needs attention" chips), `components/purchase/PurchaseConfirmedClient.tsx:125, 192`, `components/workspace/SettingsClient.tsx:724`, `components/guides/comp-calculator/CompCalculatorResults.tsx:277`, `CompCalculatorOfferCard.tsx:129`.
- Why: design-system §4: "yellow only for the Critical Miss", and "Operational failures must be visually and verbally separate from resume findings." A slow report or a failed save now sits on the same brass/yellow family as the Critical Miss block.
- Replacement: give `--warning` its own non-yellow role. Suggested: operational notices as an inset sheet (`bg-secondary`, hairline `border-line`, ink text, Phosphor `Info`/`WarningCircle` in ink), e.g. in `AnalysisScanning.tsx:188` `className="mt-7 rounded-xl border border-line bg-secondary px-5 py-4 …"`, and point `--warning-foreground` at `--text-strong`. Keep `--brass` for the miss only. Also retire `components/shared/ConfirmModal.tsx:45, 50` `bg-amber-500/10` / `text-amber-500` (raw Tailwind amber outside the tokens).

### 2. The re-check claims to know what a recruiter would miss, and calls a changed miss "closed"

- Current: `components/workspace/report/ReadComparison.tsx:37` `"The revision didn't change what a recruiter would miss first. Start there again."` and `:38` `"Your report now leads with something new. Check that the old gap is really closed, then take on this one."`
- Why: methodology says the choice "isn't a prediction of what a particular recruiter will notice" (`methodology/page.tsx:99`); the comparison rule in copy-system §1 says the Critical Miss "changed", never "fixed" ("closed" is the same claim). Neither line names the Critical Miss.
- Replacement: `"Your revision didn't change the Critical Miss. Start there again."` and `"The report now leads with a new Critical Miss. Make sure the old one is really answered, then take this one on."`

### 3. The report says it scores "the page", the methodology says it never sees the page

- Current: `components/workspace/report/ReportStream.tsx:278` `"The band comes from a score that weighs four things a recruiter notices: the results you show, how clearly each line reads, how your experience fits together, and how easy the page is to scan. It is not a simple average. …"`
- Why: `methodology/page.tsx:145` "The report reads the text we pull from it, not the layout, fonts, or columns." and `:65` names the fourth part "how easy the text is to follow". Same product, two stories; this one over-claims.
- Replacement: `"The band comes from a score that weighs four things: the results you show, how clearly each line reads, how your experience fits together, and how easy the text is to follow. It isn't a simple average, and it doesn't predict interviews or offers. Re-check a revision and you'll see the number move."`

### 4. The homepage share card still loads the retired Alpine serif and a drop shadow

- Current: `app/og/home/route.tsx:25` `font("source-serif-4", "SourceSerif4-Regular.ttf")`, `:80` `fontFamily: "Source Serif"`, `:136` `{ name: "Source Serif", … }`, `:113` `boxShadow: "0 28px 48px -20px rgba(17, 21, 19, 0.32)"`. Retired font folders still ship: `public/fonts/instrument-sans`, `public/fonts/satoshi`, `public/fonts/sentient`, `public/fonts/source-serif-4`.
- Why: brand-system: "Source Serif 4 … retired"; design-system §4: "no drop shadows", §3 "a fourth font family" is a hard no. The hero illustration uses the system Times face for the fictional resume; the share card reaches for the retired brand serif instead. This card is the first thing a shared link shows.
- Replacement: set the illustrated resume in a generic document serif the renderer already has (`fontFamily: "Times New Roman", Georgia, serif`) or in Literata regular, drop the `boxShadow` for a hairline, delete the four retired font folders (only `og/home` references `source-serif-4`), and bump the `?v=` on `app/(marketing)/page.tsx:11`.

### 5. The revised-line trace completes in Alpine citron

- Current: `components/shared/LiftedTrace.module.css:46` `.item[data-state="complete"] .segment { background: hsl(var(--citron)); }` (`--citron: 73.548 87.736% 58.431%` at `globals.css:109`, a lime-yellow that is not the highlighter). Rendered under every Critical Miss by `markup/LineLift.tsx:187`.
- Why: design-system §4: `--citron` is a "compatibility token only"; yellow is "only for the Critical Miss and highlighted resume lines"; brand-system hard no on "ornamental completion markers". The report's one piece of non-palette color sits inside the signature flow.
- Replacement: `background: hsl(var(--pen));` for complete segments (the recruiter's pen marks what's done), `hsl(var(--line))` for pending, and remove `--citron`/`--accent-butter` once `qa:design-system` passes without them.

### 6. The PDF keeps the retired "Suggested edits" and a stiff footer

- Current: `lib/backend/pdf.ts:211` `<div class="section-kicker">Suggested edits</div>`, `:212` `<h2>Revising your resume</h2>`, `:213` `<strong>About draft templates</strong><span>Complete the bracketed details with facts from your experience before using a draft.</span>`, `:99` `Suggested edit ${String(index + 1).padStart(2, "0")}`, `:230` `AI-generated feedback. Check every suggested detail before using it.`
- Why: copy-system §1 retires "Suggested change"; the web report calls these lines "More lines…"; the footer disclosure differs from the FAQ and founder wording. Same document, two names.
- Replacement: kicker `More lines to revise`, drop the duplicate h2; template note `Fill in the brackets with your own facts before you use a draft.`; card heading `Line 01` (keep the label); footer `A recruiter's review criteria, applied by AI. Check every suggested detail against what you actually did.`

### 7. "Other suggested edits." and a prompt that sounds like a worksheet

- Current: `components/workspace/report/IndependentAdvice.tsx:141` `Other suggested edits.`, `:143` `Compare each suggestion with the original before you use it.`, `:158` `Use these prompts to recall relevant examples. You don't need an answer to every one.`
- Why: retired name; "prompts" and "recall relevant examples" is coach language (copy-system §10.5).
- Replacement: `More lines worth a second look.` / `Read each one beside your original before you use it.` / `They're here to jog your memory. Answer the ones you can.`

### 8. The sample report's ending repeats the old promise with a third wording of "no account"

- Current: `components/workspace/report/ReportStream.tsx:289` `Now let's look at yours.`, `:290` `Upload or paste it to see what comes through clearly, where it leaves questions, and what to change first.`, `:292` `Your first report is free. No card or account needed.`
- Why: the homepage, research close and share card all turn on "What would they think of yours?"; the fine print is "No account or card." everywhere else (`VerdictHero.tsx:34`). Three spellings of one promise.
- Replacement: `What would they think of yours?` / `Upload it or paste it. You'll see what comes through, what slips past, and what to fix first.` / `Your first report is free. No account or card.`

### 9. "See how the whole page reads now."

- Current: `components/workspace/report/ReportStream.tsx:299` `` `${revisable.length > 1 ? "Your lines are" : "Your line is"} ready. See how the whole page reads now.` ``
- Why: voice-and-tone bans commentary "about the read" that hides the action; the button underneath runs a re-check.
- Replacement: `Your line is ready. Run the whole resume again and see what changed.` (plural: `Your lines are ready. …`)

### 10. Full notes: title case, "The full read.", and HR labels

- Current: `components/workspace/report/FullRecruiterNotes.tsx:10` `"Work Experience"`, `:130` `The full read.`, `:48` `"Overall assessment"`, `:49` `"Example to improve"`.
- Why: sentence case everywhere else; "the read" is the abstraction the guide warns about; "Overall assessment" is performance-review language.
- Replacement: `"Work experience"`; `The rest of the notes.`; `"The whole resume"`; `"The example that stops short"`.

### 11. Feedback thank-you leans on "the read"

- Current: `components/workspace/report/markup/MissFeedback.tsx:39` `Thanks. Answers like this are how we check the read.`
- Why: same abstraction; it doesn't say what the answer is for.
- Replacement: `Thanks. This is how we find out when we picked the wrong thing.`

### 12. Empty report panel: "notices", and a text arrow

- Current: `components/workspace/ReportPanel.tsx:183` `Add your resume and see what a recruiter notices first.` and `:198` `<span className="text-brand hover:underline">Get your free report →</span>` inside a hand-built `<button>`.
- Why: "notices" is more certain than the promise ("See what a recruiter sees"); every other instance is the shared `Button` with the Phosphor `ArrowRight`, and design-system §9 says there is one Button.
- Replacement: `Add your resume to see what a recruiter sees first.` and `<Button asChild><Link href="/workspace">Get your free report <ArrowRight weight="bold" aria-hidden="true" /></Link></Button>`.

### 13. Fallback fix heading reads like a form

- Current: `lib/reports/report-presentation.ts:33` `if (count === 0) return "Review the suggestions below.";`
- Why: not in the one-name table; "review" is an avoided noun; `ReportStream.tsx:93` already falls back to "Here's where to start."
- Replacement: `return "Here's where to start.";`

### 14. "First Impression score" survives on Progress

- Current: `app/dashboard/ProgressView.tsx:102` `First Impression score over time` (also the docblock at `components/shared/ScoreBadge.tsx:12` "the First Impression score as the report shows it: a number out of 100").
- Why: the sweep retired "First Impression score" on methodology, pricing, trust and the manifest in favor of band language; Progress is the one customer page still using it, and `ScoreBadge` shows a number out of 100 on My reports, which design-system §8b says appears "only when two reads are compared".
- Replacement: `Your score over time` with the existing footnote; and a product decision on `ScoreBadge`: show the band name in My reports and the number only in the comparison and Progress timeline.

### 15. "Resume review" as the default saved-report title; "Get your first report"

- Current: `components/reports/ReportHistoryList.tsx:39` `return report.name || "Resume review";` and `:132` `Get your first report`.
- Why: copy-system §1: the noun is `report`, avoid `review`; the one name for the start button is `Get your free report`.
- Replacement: `"Resume report"` (or the date, e.g. `Report · Oct 25, 2026`) and `Get your free report`.

### 16. The root default `<title>` is Title Case and 78 characters

- Current: `app/layout.tsx:15` `default: "Recruiter in Your Pocket | Free Resume Report from a Recruiter's Perspective"`.
- Why: the sweep moved every page title to sentence case and under 60 characters; this default still shows wherever a route sets no title (error boundaries, `global-error`), and "from a Recruiter's Perspective" is SEO filler.
- Replacement: `default: "Recruiter in Your Pocket: see what a recruiter sees"` (52 characters).

### 17. Raw server strings reach the Settings toast

- Current: `app/api/passes/route.ts:15` `message: "Not authenticated"`, `:25` `message: "Failed to fetch passes"`. `components/workspace/SettingsClient.tsx:115` wraps them with `new ClientActionError(data?.message, …)`, which prefers the server string, so the customer sees "Failed to fetch passes".
- Why: copy-system §7: never "internal system terms"; "passes" is not the customer-facing noun.
- Replacement: `"Sign in to see your purchases."` and `"We couldn't load your purchases. Try again."`

### 18. PDF export errors talk about "paid access"

- Current: `app/api/export-pdf/route.ts:48` `"Sign in with a paid account to export a PDF."`, `:65` `"PDF export is included with paid access."`
- Why: the thing has one name, Job Search Pass; "paid account" doesn't exist in the product (passes aren't account tiers).
- Replacement: `"PDF export comes with the Job Search Pass. Sign in with the email you used to pay."` and `"PDF export comes with the Job Search Pass."`

### 19. FAQ, trust and security say "Last updated September 4, 2026" after a November rewrite

- Current: `lib/legal/dataHandling.ts:3` `LEGAL_LAST_UPDATED = "September 4, 2026"`, rendered by `components/legal/LegalShell.tsx:51` on `/faq`, `/trust`, `/security`; `lib/seo/public-pages.ts:55, 56, 60` say `2026-11-02` for the same pages.
- Why: the sweep changed eight FAQ answers and two trust cards on November 2 and moved the sitemap date, but not the date the reader sees. Honesty on a trust surface, and the sitemap now disagrees with the page.
- Replacement: `LEGAL_LAST_UPDATED = "November 2, 2026"` (or split it per page the way privacy and terms already are).

### 20. The pass-ready banner is a brass sheet with a decorative sparkle

- Current: `components/workspace/UnlockBanner.tsx:71` `className="relative overflow-hidden rounded border border-premium/20 bg-premium/5 p-4 md:p-6"`, `:75-78` `{/* Background Sparkle Decoration */} <InsightSparkleIcon className="size-16 text-premium" />`, `:84` sparkle beside the title.
- Why: `--premium` is the miss ink; brand-system hard noes: "AI magic language" and "gradients used as atmosphere"/decoration; design-system: static cards are hairline paper, no ornament, system radii. The copy on it is already right ("Five more reports, good for 30 days. Spend one on your revision, or on a job you actually want.").
- Replacement: `className="app-card rounded-2xl p-4 md:p-6"` with a pen-tint status chip ("Pass active") and the Phosphor `Check`; delete both sparkles.

### 21. package.json still describes "a high-end resume studio" by "Matt"

- Current: `package.json:4` `"description": "A high-end resume studio that reads your resume like a recruiter, providing crafted feedback on how you read, what's working, what's harder to see, stronger bullets, and simple next steps."`, `:45` `"author": "Matt"`.
- Why: "studio" and "crafted feedback" are the retired framing (brand-system: not a consultancy or editorial service); a founder name in package metadata is the kind of leak the anonymity rule exists for, even in a private repo.
- Replacement: `"description": "Recruiter in Your Pocket: see what a recruiter sees on your resume, and what to fix first."`, `"author": "Recruiter in Your Pocket"`.

### 22. The Chrome extension is still Alpine, and its listing says "the studio"

- Current: `docs/launch-readiness/chrome-web-store-listing.md:13` `… carry that context back into the studio.`, `:15` `… open the studio when you're ready for a report.`; `extension/public/manifest.json:4` `"description": "Capture supported LinkedIn and Indeed roles, keep saved jobs close, and open recruiter-grade match context in RIYP."`; `extension/src/popup/content.ts:39, 43, 47` `cta: "Review my resume"`; `extension/src/styles/tokens.css:5-7` `'Instrument Sans Variable'` and `--font-mono: 'SF Mono', 'Fira Code', monospace;`, `:21` `--brand: 173 80% 30%;` (teal); `extension/src/background/storage.ts:150` `color: '#0D9488' }); // Brand teal`.
- Why: "studio" is retired; "recruiter-grade match context" is hype jargon; "Review my resume" is a retired CTA; teal, Instrument Sans and a mono face are all hard noes. Hidden behind `extensionSync`, but the listing is the public face if it ships.
- Replacement: listing `… and open your workspace in Recruiter in Your Pocket when you're ready for a report.`; manifest `"Save LinkedIn and Indeed job postings, then check your resume against them in Recruiter in Your Pocket."`; CTA `Get your free report`; tokens to Highlighter (Schibsted/Literata, pen `#1f5a46`, badge in pen).

### 23. Uppercase outside Verdict and Critical Miss

- Current: `app/(marketing)/purchase/confirmed/page.tsx:14` `<p className="text-xs font-semibold uppercase riyp-track-010 text-brand">Payment</p>` (Suspense fallback a buyer sees); `app/og/research/[id]/route.tsx:69` `letterSpacing: "0.08em", textTransform: "uppercase"` on the research card label; plus the LinkedIn panels (hidden).
- Why: design-system §8b: "Uppercase only for Verdict and Critical Miss, via `.riyp-verdict-label`."
- Replacement: `<p className="text-label text-brand">Payment</p>`; on the research card drop `textTransform` and `letterSpacing` and keep the 16px pen label in sentence case.

### 24. The LinkedIn Page copy sells "a score" the first report no longer shows

- Current: `docs/growth/brand-drafts.md:32` `You get a Verdict in plain words, a score that says where to start, and the Critical Miss: what to fix first, with your facts kept intact.` (repeated at `:196`, `:272`); `:277` `… a score that summarizes the review and says where to start, and the Critical Miss: what to fix first, with suggested edits that keep your facts intact. Add a job description to see how the resume reads for that role.`
- Why: D5: a first report shows a band, not a number; the site now says "where your resume stands"; "suggested edits" is the retired name; "how the resume reads" is the abstraction.
- Replacement: `You get a Verdict in plain words, where your resume stands, and the Critical Miss: what to fix first, built from your own facts.` and for the listing: `… and the Critical Miss: what to fix first, with a revised line built only from your own answers. Add a job posting to see how your experience fits that role.`

### 25. Two small honesty slips in the workspace

- Current: `components/workspace/InputPanel.tsx:230` `This is a short resume ({charCount} characters), so the review may have less to work with.`; `components/workspace/AnalysisScanning.tsx:22` `detail: "Sections, roles, dates, and visible structure"` (the non-live fallback steps).
- Why: "review" is the avoided noun; "visible structure" contradicts the methodology's "reads the text … not the layout".
- Replacement: `This is a short resume ({charCount} characters), so the report may have less to work with.` and `detail: "Roles, dates, results, and the words on the page"`.

### Also noted (below the cut)

- `app/api/resume-feedback/route.ts:168` `"Your browser is ready. Try creating your report again."` → `"Your browser is set. Try your report again."`
- `app/api/account/delete/route.ts:154, 177` and `app/api/linkedin-feedback-stream/route.ts:267` still start sentences with "Please"; `components/legal/StatusClient.tsx:163` "please contact support"; `SecurityClient.tsx:88` "please email".
- `components/workspace/report/FullRecruiterNotes.tsx:192` `Job match: {n}/100` shows a number out of 100 on a first report.
- `lib/score-utils.ts:25, 84` color a score `bg-premium/10` (brass) above 70: color-coded scoring, which §8b retired.
- `components/purchase/PurchaseRestoreClient.tsx:229` `new Date(item.created_at).toLocaleDateString()` ignores the one date format.
- `app/auth/page.tsx:9` "role context you choose to keep"; `app/(app)/reports/[id]/page.tsx:10` "Detailed report view with evidence-backed recruiter feedback."
- `lib/reports/score-band.ts:15` comment "Draft anchors (spec 71, pending Matt's copy approval)" on live copy.
- `lib/backend/pdf-styles.ts` `h2 { font-weight: 500 }` and `.marked-label.miss` tracking 0.08em vs the web's 0.1em.
- `lib/navigation.ts:78-102` dead `MARKETING_NAV` ("How Recruiters Read", "Research Hub", "Negotiation Guide", "Offer Calculator").
- `components/workspace/report/ReportSectionHeader.tsx:17-21` docblock sample copy in the old "I" voice ("What made me lean in, and what made me pause."); verify the component is unused and delete it.
- Legal pages name features that don't render in production ("Settings > Matching", "Delete saved jobs from Jobs", extension capture) in `lib/legal/dataHandling.ts:48, 55`. Defensible while the code exists; revisit when the flags are decided.
- `lib/auth/otpEmail.ts:68` "It works once and expires soon." could state the window.

## Lines to protect (best examples of the voice)

Quote these back to anyone who proposes a rewrite.

- `components/landing/home/VerdictHero.tsx:18` "They called someone back. It wasn't you."
- `components/landing/home/SilenceSection.tsx:23-26` "Not even a reply." / "Sometimes it's the market, a ghost job, or a stack of other applicants. Sometimes it's one line on your resume. That part you can fix."
- `components/landing/home/WorkedExample.tsx:20-21` "Here's the note Jordan never saw." / "It's about one line. The report finds it, then asks what only Jordan can answer."
- `components/landing/home/WorkedExample.tsx:51` "Blank on purpose. Jordan isn't real, and we don't make up answers for anyone."
- `lib/marketing/jordan-example.ts:42` "Solid book of business, but the renewal-risk reviews stop right before the good part. What did Jordan look for, and what changed?"
- `components/landing/home/HiringTruths.tsx:10-11` "“Results-driven professional” is on every resume." / "Show the result instead."
- `components/landing/home/HiringTruths.tsx:18-19` "No ATS score. No interview odds." / "Just what reads clearly and what doesn't, with every suggestion quoting your line and using only your facts."
- `components/landing/LandingMineral.tsx:26` "After 14 years in recruiting, it's obvious to me why one resume gets the call and another doesn't. It almost never is to the person who wrote it."
- `components/landing/LandingMineral.tsx:41` "Good work deserves a good read."
- `components/workspace/InputPanel.tsx:142, 147` "Let's see what they see." / "Add the resume you're about to send. We'll read the whole thing and show you what comes through, what slips past, and what to fix first."
- `components/workspace/InputPanel.tsx:198` "Formatting can be rough. We only need the words."
- `components/workspace/InputPanel.tsx:250` "We could only read {n} characters, and we need at least 200. A scanned or image-only PDF often does this. Paste the text instead."
- `lib/reports/report-presentation.ts:104` "One Critical Miss. Fix it first." / "It's the one most likely to cost you the interview."
- `lib/reports/score-band.ts:17` "The jobs are easy to follow. What you did in them mostly isn't."
- `components/workspace/report/markup/LineLift.tsx:190-191` "Answer and we'll add it to your line." / "Only what's true. Skip anything you don't know."
- `components/workspace/report/markup/LineLift.tsx:253-255` "Then this one isn't yours to fix. Keep the line as it is." / "Keep the line as it is for now. If you can find out, it's worth adding."
- `components/workspace/report/markup/LineLift.tsx:286` "Every word is from your resume or your answers. Reword it however you like."
- `components/workspace/report/markup/LineLift.tsx:312` "It stays in this tab. We don't send it anywhere."
- `components/workspace/report/ReportStream.tsx:246` "Keep these. They're working."
- `components/workspace/report/ResearchReceipts.tsx:9-12` "Why we keep asking what changed" / "How much a typo really costs"
- `components/workspace/AnalysisScanning.tsx:190-191` "Still going. Longer resumes can take a little more time." / "If you retry and this one also finishes, both count as reports. Waiting is usually the better bet."
- `lib/billing/generationFailureCopy.ts:5, 12` "This didn't use one of your reports." / "We gave that report back. Try again whenever you're ready."
- `lib/auth/otpEmail.ts:61-62, 73` "Your code's here." / "Pop it in and you're back on the other side of the desk." / "Didn't ask for this? Ignore it. No one gets in without the code, and we'll never ask you for it."
- `components/auth/AuthFlow.tsx:310` "Not there? Check spam and Promotions. Recruiters lose good emails there too."
- `app/not-found.tsx:30` "No reply from this one, either. The link may be old, or the address has a typo. Your free report and the research are both still here."
- `app/error.tsx:35` "Something broke on our end, not yours. Try again, or start over from the homepage. Saved reports aren't affected."
- `components/purchase/PurchaseConfirmedClient.tsx:101, 105-106` "5 more reports, good for 30 days. Spend them on revisions, or on the jobs you actually want." / "You're in. Five more reads." / "Paid. One step left."
- `app/(app)/reports/page.tsx:51` "Every version you've run, read the way a recruiter reads it. Run the next one and see what moved."
- `components/reports/ReportHistoryList.tsx:153` "Points toward {targetRole}"
- `app/dashboard/page.tsx:84` "Nothing to compare yet." / "Run a report and save it. Your next version will have something honest to measure against."
- `components/research/ResearchHub.tsx:33-34` "The questions you're asking at 1 a.m." / "Straight answers, and where each one comes from."
- `app/(editorial)/research/how-recruiters-read/page.tsx:29` "Six seconds is the kind of number that sticks when nobody writes back."
- `app/(editorial)/research/referral-advantage/page.tsx:32, 112` "Same resume, different door." / "A referral gets you a hearing. It doesn't pass the read for you."
- `components/research/diagrams/SectionFindingsFigure.tsx:41` "Time here went with moving forward. Make it the easiest section to judge."
- `app/(editorial)/methodology/page.tsx:121, 128` "The research library is where the report's advice comes from, so it has to survive a skeptic." / "We'd rather print a small, honest number than a big, round one."
- `app/(editorial)/guides/offer-negotiation/page.tsx:47-48, 130` "Most offers have some room. Here's how to find it." / "The number, the basis, and the decision. Say the last part only if it's true."
- `app/(editorial)/guides/page.tsx:155` "Your counter doesn't stop with the recruiter. It gets passed to a manager or a compensation team, so these guides show you how to ask in a way that survives the handoff, without overstating your leverage."
- `components/guides/comp-calculator/CompCalculatorResults.tsx:128` "Ranked by modeled value only. It is not a recommendation."
- `lib/legal/content.ts:342` "No. A recruiter with 14 years in hiring wrote the review criteria, and AI applies them to your resume. Nobody reads individual reports, so check every suggested edit against what you actually did."
- `docs/growth/brand-drafts.md:36, 128, 150` "No six-second stopwatch. No robot quietly eating your resume." / "The robot story is popular because silence needs a villain." / "You can stop drafting the apology."
- `docs/growth/brand-drafts.md:215` "We keep the name off it on purpose, so the work has to stand on its own."
