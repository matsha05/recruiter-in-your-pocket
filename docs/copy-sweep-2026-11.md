# Copy sweep, November 2026

Branch `claude/copy-sweep-2026-11`, cut from origin/main `568b923a`. This pass reads every public page and visible state for the bar Matt set: copy that is "warm, human, has character and craft, and is distinctive." It follows `docs/voice-and-tone.md` (Personality, Insider asides), the word list in `docs/copy-system.md` §1, and `docs/brand-system.md`.

## What this pass did and didn't do

- **Changed:** line copy on the workspace, sign-in, account menus, settings and billing errors, the 404 and app error, pricing and share titles, FAQ and trust, the methodology's suggested-edits section, the guides index, the footer and the homepage's progress footnote.
- **Not changed, by rule:** the homepage H1, the subhead's "the one thing to fix first", the HiringTruths Critical Miss line (its approved replacement ships with the severity feature), and the Critical Miss definition. Proposals are at the end.
- **Changed at Matt's request (via the coordinator):** the founder section and everything that named him. The site is now anonymous. See "Anonymous founder" below.
- **Not changed, by ownership:** report components (`components/workspace/report/*`, `ReportPanel`, `lib/backend/pdf.ts`, `lib/reports/report-presentation.ts`), the root layout and providers. Proposed changes for the report are in their own table below.
- **Left alone on purpose:**
  - Research article bodies and the two negotiation guides. They were fact-checked line by line in #35 and restructured in #39, and they already meet the voice.
  - Legal promises. Privacy and terms text is unchanged except the "Restore access" link label. Every fact in the privacy table is unchanged.
  - Server error messages from `app/api` and `lib/operations`. They're plain and correct; some start "Please". Generation-failure copy has its own tests, so it's listed as a follow-up.
  - The OTP email. It already uses the voice guide's reference lines.
  - Jobs, LinkedIn review and the extension page. They're behind launch flags and don't render in production.
- **Checked and kept:** the hero, worked example, silence section, wait screen, purchase confirmation and restore, status, security, the research hub chrome, share cards, and the sign-in email. They already read like the same insider.

## Before and after, by page

### Workspace (New report and Re-check)

| Where | Before | After |
| --- | --- | --- |
| Eyebrow | Resume review / Resume comparison | Your resume / Re-check |
| H1 | Start with your resume. | Let's see what they see. |
| Intro | Add the resume you're about to send. We'll look at the whole document, show you what's clear, and help you decide what to change first. | Add the resume you're about to send. We'll read the whole thing and show you what comes through, what slips past, and what to fix first. |
| Re-check intro | Upload your revision to see what improved and what still needs attention. | Add the new version. We'll put it beside the last one and show you whether the Critical Miss changed. |
| Run hint, free | Your first report is included | Your first report is free |
| Run hint, pass | 3 paid reports remaining | 3 reports left on your pass |
| Run hint, none left | A Job Search Pass is required for another report | Another report needs a Job Search Pass |
| Drop zone | No login required | No account needed |
| Wrong file type | Please upload a PDF or DOCX file. | That file type won't open here. Choose a PDF or DOCX. |
| Unreadable file fallback | Could not read file | We couldn't read this file. Try another PDF or DOCX. |
| Save prompt footnote | If you skip, this browser can recover the completed report for up to 24 hours, but it is not saved to history. | Skip it, and this browser can still bring the report back for up to 24 hours. It won't be saved to My reports. |
| Pass banner body | You now have five additional reports to use with a revised resume or another job posting. | Five more reports, good for 30 days. Spend one on your revision, or on a job you actually want. |
| Pass banner button | See suggested changes | See what to fix first |

### Saved reports drawer and labels

| Where | Before | After |
| --- | --- | --- |
| Signed out, title | Save reports you want to revisit | Keep every version in one place |
| Signed out, body | Sign in to save reports and compare feedback on different resume versions. | Sign in to save reports and see what changed between versions. |
| Empty, title | No reports yet | Nothing saved yet |
| Empty, body | Get a report on your resume, then save it to return to the feedback later. | Save a report and it waits here for your next revision. |
| Delete dialog | Delete Report? / …will be permanently deleted. This action cannot be undone. | Delete this report? / …will be permanently deleted. This can't be undone. |
| Label placeholder | e.g., General, Google PM, Senior Role... | General, Product roles, Startups… |
| Label hint | Labels help you track progress across different resume versions | Label each version, like "Product roles" or "Startups," to keep them apart in your history. |
| Label groups | Your Labels / Quick Pick / Or type your own above | Your labels / Quick pick / Or type your own |
| Errors (10 in the drawer, 4 in My reports) | …couldn't be renamed. Please try again. | …couldn't be renamed. Try again. |

### Account menu, mobile drawer and settings

| Where | Before | After |
| --- | --- | --- |
| Pass holder | 3 paid reports remaining / 3 Paid Reports / 3 paid reports | 3 reports left on your pass |
| Free, available | 1 report remaining / 1 Free Report remaining / Free Plan | Free report available / Free account |
| Free, used | 0 reports remaining | Free report used |
| Legacy plans | Lifetime Access / Full Access Monthly / Lifetime / Monthly | Lifetime access / Monthly plan |
| Purchase history tiers | Extended Pack / Single Report | Extended pack / Single report |
| Menu action | Sign Out | Sign out |
| Checkout and delete buttons | Continue to Checkout / Keep Account | Continue to checkout / Keep account |
| Settings errors (19) | …Please try again. / Please try Export data again. | …Try again. / Try Export data again. |
| Default resume errors (4) | …Please try again. | …Try again. |

The mobile drawer's status line had a `capitalize` class that would have title-cased "left on your pass"; it's removed.

### Sign-in

| Where | Before | After |
| --- | --- | --- |
| Empty email | Please enter your email | Enter your email address. |
| Bad email | Please enter a valid email address | That email address doesn't look right. Check it and try again. |
| Send and verify failures | We couldn't send a code. Please try again. / We couldn't verify that code. Please try again. | We couldn't send a code. Try again. / We couldn't verify that code. Try again. |
| Empty first name | Please enter your first name | Add a first name, or choose Skip for now. |
| Modal note | Sign in to save reports. Reports you created without signing in are saved to your account only when you choose to keep them. | Sign in to save reports. Anything you ran before signing in joins your account only if you choose to keep it. |

### Errors and the 404

| Where | Before | After |
| --- | --- | --- |
| 404 body | The link may be old, or the address has a typo. Start with your free report, or read the research behind it. | No reply from this one, either. The link may be old, or the address has a typo. Your free report and the research are both still here. |
| App failed to load | Try again, or open your workspace in a new page. If this keeps happening, contact support and include the error reference below if one is shown. | Something broke on our end. Try again, or open your workspace in a new page. If it keeps happening, email support and include the error reference below, if you see one. |
| Restore errors (4) | Stripe billing couldn't open. Please try again. / We couldn't load your receipts. Please try again. | …Try again. |

The 404's aside nods to the homepage's "Not even a reply." It's aimed at the process, not the reader, and the address advice stays literal.

### Homepage, footer and search titles

| Where | Before | After |
| --- | --- | --- |
| Progress footnote | A re-check is one Job Search Pass report. Signed in, Progress keeps every version. Scores compare versions of your own resume; they don't predict interviews. | Each re-check uses one report from a Job Search Pass. Sign in, and Progress keeps every version. Scores compare your own versions; they don't predict interviews. |
| Footer, Research | What makes a bullet land | Bullets that show results |
| Search title | See What a Recruiter Sees: Free Resume Report (72 characters with the suffix) | See what a recruiter sees: free resume report (45) |

The homepage title now fits in search results, so `/` comes off the long-title exception list in `search-foundation.spec.ts`.

### Pricing and the sample report

| Where | Before | After |
| --- | --- | --- |
| Hero, right | Use the pass to check a revision, or to read your resume against a specific job. | Use the pass to check a revision, or to read your resume against a job you actually want. |
| "What five more reports are for" | Most people use them two ways. Here's each one on Jordan's resume. | Two good ways to spend them, both shown on Jordan's resume. |
| Re-check footnote | Signed in, Progress keeps every version. Scores compare versions of your own resume. They don't predict interviews. | Sign in, and Progress keeps every version. Scores compare your own versions; they don't predict interviews. |
| Share title | Your First Resume Report Is Free. Five More Are $29. | Your first resume report is free. Five more are $29. |
| Sample share title | Read an Example Resume Report | Sample report: Jordan's resume, start to finish |

"Most people use them two ways" was a claim about usage we have no data for. "Example report" is a retired name.

### Help and FAQ, trust

| Where | Before | After |
| --- | --- | --- |
| FAQ description | Answers to common questions about the product, privacy, and billing. | Straight answers about the report, your data, and what you pay. |
| What does the report cover? | Your report explains the impression your resume may give, what it makes clear, and where a reader needs more detail. It quotes the lines behind the feedback and suggests what to change first. Add a job posting for feedback on that role. | What a recruiter is likely to take from your resume, what comes through clearly, and where they'd need more detail. Every note quotes the line behind it, and the Critical Miss tells you what to fix first. Add a job posting, and the report reads your resume against that role too. |
| How is this different from ATS keyword tools? | The report goes beyond a keyword list. It explains what your experience communicates, quotes the lines behind its feedback, and asks for facts that are missing. | Keyword tools count matches. The report reads for what you did and what changed because of it. It quotes the line behind every note and asks for the facts that are missing, instead of handing you a keyword score. |
| Question | Does a person review my resume? | Does a person read my resume? |
| Answer | AI generates your report using resume review criteria developed by Matt Shaw. A personal review from Matt is not included. Check suggested edits against your own experience before using them. | No. A recruiter with 14 years in hiring wrote the review criteria, and AI applies them to your resume. Nobody reads individual reports, so check every suggested edit against what you actually did. (Anonymous since the founder change below.) |
| File formats | …If the file cannot be read, you can paste the resume text instead. | …If we can't read the file, paste the resume text instead. Formatting doesn't matter; we only need the words. |
| Is the first report really free? | (the entitlement text alone) | Yes, and nothing in it is held back. (then the same entitlement text) |
| What is the Job Search Pass? | It is a $29 one-time purchase for five additional complete reports and PDF exports. The pass expires 30 days after purchase and never renews automatically. | One $29 payment for five more complete reports, plus PDF exports. Use them to check a revision or read your resume against a job. The pass expires 30 days after purchase and never renews automatically. |
| Categories | Privacy & Security / Pricing & Billing | Privacy and security / Pricing and billing |
| Restore answer, terms link | Restore Access | Restore access |
| Trust card: What the score tells you | Your resume gets a score out of 100, with an explanation of what affected it. | How clearly your resume shows your work, explained in plain words. A first report shows it as a band; a re-check shows how far the number moved. |
| Trust card titles | Clear data handling / Simple billing / You control deletion | What we keep, and for how long / One payment, no renewal / Delete it whenever you like |
| Trust and security promise | The score summarizes this resume review out of 100. | The score summarizes this resume review out of 100. It doesn't predict interviews or offers. |

The old score card said every resume "gets a score out of 100." Since D5 a first report shows a band, not the number, so the card now says that. The FAQ answers keep every fact (file limit, recovery window, refund terms, entitlement text). `/faq` and `/trust` dates move to 2026-11-02 in `public-pages.ts`.

### Anonymous founder (Matt's request, November 2)

Matt wants the site anonymous while he's employed elsewhere: a nod to big tech, but no name, photo, profile link or company names. His wording replaces the wave-2 founder copy.

| Where | Before | After |
| --- | --- | --- |
| Founder H2 | I've spent 14 years recruiting for companies like Google, Meta, and OpenAI. | After 14 years in recruiting, it's obvious to me why one resume gets the call and another doesn't. It almost never is to the person who wrote it. |
| Founder body | I'm Matt. I built this to give you the read I'd give a friend before they hit send. | That gap is why this exists. It shows you what goes through a recruiter's head when they read yours, and what to fix first. |
| Founder small line | Heads up: I wrote the review criteria, and AI applies them to your resume. I don't read each report myself. | Built by a recruiter with 14 years in hiring, including at some of the biggest names in tech. I wrote the review criteria; AI applies them, and I don't read each report myself. |
| Founder portrait and caption | Photo, alt "Matt Shaw, founder of Recruiter in Your Pocket", caption "Matt Shaw · Founder" | Removed. The left column now holds a small label, "Who built this". |
| Founder links | How the report works · Meet Matt (LinkedIn) | How the report works |
| Homepage JSON-LD | Person "Matt Shaw" with LinkedIn sameAs and the Google/Meta/OpenAI description; SoftwareApplication `creator` pointing at it | Removed. SoftwareApplication, Organization and WebSite remain. |
| Site JSON-LD (`lib/seo/site.ts`) | Organization `founder: { name: "Matt Shaw" }` | Removed |
| Methodology FAQ | No. Matt Shaw wrote the review criteria from 14 years in recruiting; AI applies them to your resume. | No. A recruiter with 14 years in hiring wrote the review criteria; AI applies them to your resume. |
| Methodology, "Ours" | …Matt designed the criteria; the studies did not test our score. | …A recruiter designed the criteria; the studies did not test our score. |
| Research: referral advantage | Our take: this section is Matt Shaw's experience from years of receiving referrals as a recruiter… | Our take: this section is our founder's experience from years of receiving referrals as a recruiter… |
| Public files | `public/assets/founder-avatar.jpg`, `public/assets/founder-portrait-print.png` (portrait photos, served publicly) | Deleted. Nothing referenced either one. `founder-avatar.svg` is a generic silhouette, unreferenced, and was left alone. |

The founder headline uses the title type role at 34ch instead of the 20ch headline role, because it's now two sentences.

**Checked, nothing identifying:** share cards and OG images, the sample report JSON, the PDF template, the sign-in email, alt text, and research pages. The only remaining "Google" on a public page is a research citation (Laszlo Bock's formula). "OpenAI" appears only as the API vendor in privacy, processor and workspace copy, which stays.

**Legal pages don't name him.** One terms sentence refers to employers the site no longer names. It's unchanged, for Matt to decide:
- `lib/legal/content.ts:219` (Terms §1): "Company names that describe our founder's work history do not mean those companies sponsor, endorse, or are affiliated with RIYP."
- Privacy and terms both say RIYP is "operated from Colorado, United States". That names no person.

**Internal only, not public:**
- `/launch` and `/launch/gauntlet` (404 in production) show "Matt" in `lib/gauntlet/progress/summary.ts` and `lib/launch/program.ts`.
- Code comments say "(Matt, Nov 1)"; minification strips them.
- The red-team spec's test resume starts "MATT SHAW".
- The root layout has a comment, "the homepage adds the founder"; the layout belongs to the page-weight session.

### Methodology

| Where | Before | After |
| --- | --- | --- |
| How suggested edits protect your facts | When the report suggests new wording, it uses only what's already on your resume. Anything we can't know, like a number or a team size, stays in brackets for you to fill in. You can't copy a draft until those brackets hold real details, and a draft that changes one of your facts is flagged. | Under the Critical Miss, the revised line is your line plus the answers you type, word for word. When we offer a smoother version, it can drop filler words but never add one. Other suggested wording uses only what's already on your resume. Anything we can't know, like a number or a team size, stays in brackets as a template for you to fill in, and a draft that changes one of your facts is flagged and can't be copied. |
| Research hub row | …how the Verdict, Score, and Critical Miss are made… | …how the Verdict, the score, and the Critical Miss are made… |

The old paragraph predated the answer-to-line flow (#39) and implied a bracketed draft becomes copyable once it's filled in. In the report a bracketed draft is a read-only template (`IndependentAdvice`). The polish guard drops only filler (`revised-line-polish.ts`). `/methodology` moves to 2026-11-02.

### Band language (Impeccable audit P1 #1)

A first report shows a band, not a number (D5, design-system §8b). Methodology and pricing still promised a 0 to 100 "First Impression score". This change is copy and figure work only; no prompt changed.

| Where | Before | After |
| --- | --- | --- |
| Methodology hero card | Example score · 80 / 100 · the sample's short comment | Example band · Mostly clear · "Most lines show what you did. A few leave your part or the result unclear." (from `SCORE_BANDS`) |
| Methodology header | …a Verdict, one First Impression score, and the Critical Miss… | …a Verdict, a band that shows where your resume stands, and the Critical Miss… |
| Methodology search description | How your report reaches its Verdict, First Impression score, and Critical Miss, what the score can't tell you… | How your report reaches its Verdict, where your resume stands, and its Critical Miss, what it can't tell you… |
| "What you'll see", item 2 | First Impression score: One number that summarizes the read. The written findings explain it. | Where your resume stands: One of three bands, from Needs more context to Clear and specific, with a line on what it means. The number behind it is for comparing versions, in My reports and in a re-check. |
| FAQ | What does the score summarize? | What does the band summarize? The answer adds that a score out of 100 sits behind it, and that the number is for comparing versions. |
| FAQ | Why one score instead of four? / Four numbers invite you to chase the lowest one. One number plus a written read keeps you focused… | Why a band instead of a number? / A number invites you to chase points, and four numbers invite you to chase the lowest one. A band plus a written read keeps you on the change that matters most… When you revise, a re-check shows how far the number moved. |
| FAQ | Should I optimize for the number? / …A higher number on a less accurate resume doesn't help you. | Should I chase a better band? / Not for its own sake… A better band on a less accurate resume doesn't help you. |
| Fig. 1 | "80 /100 First Impression score" | The report's own `ScoreBand` component, at the sample's score (Mostly clear, the three-step scale, the anchor) |
| Fig. 1 | What the score weighs: "Four parts" with three rows (the empty "How your experience fits together" row was filtered out) | What goes into the band: all four rows. A part with no note in the sample says "The sample report has no note here." |
| Fig. 1 caption | The number summarizes; the written read tells you what to change first. | The band summarizes; the written read tells you what to change first. |
| How suggested edits protect your facts | …stays in brackets as a template for you to fill in… | For each fix, the report asks what's missing, and the revised line is your line plus the answers you type, word for word. Skip a question, or say you didn't do it, and it stays out… If you edit the line and add something that isn't in your line or your answers, we flag it, and it can't be copied until you add it as an answer. Wording suggested for other lines uses only what's already on your resume… |
| Section headings | How to use the score / The four things the score weighs | How to use the band / The four things behind the band |
| Pricing, free tier | Your Verdict and First Impression score | Your Verdict and where your resume stands |
| Pricing, paused layout | Your Verdict, First Impression score, and Critical Miss… | Your Verdict, where your resume stands, and the Critical Miss… |
| Research: human vs algorithm | Your First Impression score sums up the written findings… the number on its own… | Your report's band sums up the written findings… the band on its own… |
| Research hub, methodology row | …how the Verdict, the score, and the Critical Miss are made, and what the score can't tell you. | …how the Verdict, the band, and the Critical Miss are made, and what they can't tell you. |
| App manifest | your Verdict, First Impression score, and the one thing they would miss. | your Verdict, where your resume stands, and what to fix first. |
| Trust and security promise | The score summarizes this resume review out of 100. It doesn't predict interviews or offers. | The band summarizes this resume review. It doesn't predict interviews or offers. |

The suggested-edits paragraph is checked against `LineLift.tsx` (the questions, the "I don't know" and "I didn't do this" choices, the new-fact guard, the "Use my exact words" toggle) and `IndependentAdvice.tsx` (templates behind "View draft template", the unsafe-draft copy guard).

**Product note, not changed:** design-system §8b says "the number appears only when two reads are compared". My reports and the history drawer show each saved report's number (`ScoreBadge`), even when there's only one. Methodology now describes what ships: "for comparing versions, in My reports and in a re-check".

**Regression test:** `editorial-surfaces.spec.ts` has a "score language" block. On /methodology it checks for no "/100", no "First Impression score", the band component reading "Mostly clear", and four rows under "What goes into the band". On /pricing it checks for no "First Impression score" and the band wording.

### After the offer (guides index)

| Where | Before | After |
| --- | --- | --- |
| Description | Recruiter-grounded negotiation guides and an offer calculator, for when the offer arrives. | Negotiation guides written from the recruiter's side of the table, plus an offer calculator for comparing the pay. |
| H1 | Work out what to ask for in your next offer | Got the offer? Here's what to ask for, and how. |
| Deck | Compare the pay, understand the terms, and find words you can use with the recruiter. | Most offers have some room, in our experience. Compare the pay, read the terms, and find words you can actually say to the recruiter. |
| Section label | The philosophy | How these are written |
| Section body | These guides explain how a request moves through a hiring team, which facts help someone evaluate it, and what you can say without overstating your leverage. | Your counter doesn't stop with the recruiter. It gets passed to a manager or a compensation team, so these guides show you how to ask in a way that survives the handoff, without overstating your leverage. |
| Card 1 | Examples you can adapt. / Use the sample wording to ask about pay, request more time, or make a counteroffer. | Words you can actually say. / Sample lines for asking about pay, buying more time, and making the counter. |
| Card 2 | Sources and limits included. / Research links are included where relevant, with source limits stated plainly. | The research, with its limits. / Where a study helps, we link it and say what it can't tell you. |
| Card 3 | Built for your next conversation. / Go straight to the question you need help with, whether you have an offer or are still interviewing. | Start with your question. / Jump to the part you need, whether the offer is in hand or you're still interviewing. |

"Most offers have some room" is labeled as our experience, the same way the offer guide labels it, and it follows the voice guide's negotiation rule. The handoff line is the guide's own request → basis → decision idea in plain words.

## Critical Miss definition (separate commit; drop it if the severity check fails its gate)

The definition: a problem that could cost you the interview on its own. The report flags up to three and starts with the one to fix first. The homepage H1, the subhead, its share description and the sample description keep "the one thing to fix first", as Matt asked. The HiringTruths line ships with the severity feature elsewhere.

| Where | Before | After |
| --- | --- | --- |
| Methodology header | …and the Critical Miss, the one thing to fix first. | …and up to three Critical Misses, each a problem that could cost you the interview on its own, starting with the one to fix first. |
| Methodology, "What you'll see" | The one change to make first, with the line it comes from and the questions to answer. | A problem that could cost you the interview on its own. The report flags up to three and starts with the one to fix first, each with its line and the questions to answer. |
| How the Critical Miss is chosen | Of everything that could be clearer, the report picks one thing to fix first… The report quotes the line… | A Critical Miss is a problem that could cost you the interview on its own. The report flags up to three, in order, and starts with the one to fix first… For each one, the report quotes the line… |
| Methodology FAQ and "How to use the band" | …which is the Critical Miss. / Fix the Critical Miss… / Start with the Critical Miss… | …which is your first Critical Miss. / Start with your first Critical Miss… (twice) |
| Fig. 1 path | Critical Miss: The one change to make first | Critical Miss: Up to three, starting with the one to fix first |
| Pricing, free tier | The Critical Miss: the one thing to fix first | Critical Misses: what could cost you the interview, starting with the one to fix first |
| Pricing, paused layout | …and the Critical Miss, with the lines behind them… | …and up to three Critical Misses, with the lines behind them… |
| FAQ, What does the report cover? | …and the Critical Miss tells you what to fix first. | …and each Critical Miss flags a problem that could cost you the interview, starting with the one to fix first. |
| gaps-and-pivots | If it's the one thing to fix first, it becomes the Critical Miss… | If it could cost you the interview on its own, it becomes a Critical Miss… |
| how-recruiters-read | …the Critical Miss leads with that as the one thing to fix first. | …in a way that could cost you the interview, a Critical Miss says so, starting with the one to fix first. |
| spelling-errors-impact | It leads with the Critical Miss, the one thing to fix first. | It leads with your Critical Misses, the problems that could cost you the interview, starting with the one to fix first. |
| referral-advantage | The Critical Miss is the one thing to fix first. | Your Critical Misses are the problems that could cost you the interview on their own; start with the first. |
| linkedin-visibility | …and the Critical Miss is the one thing to fix first. | …and each Critical Miss is a problem that could cost you the interview on its own, starting with the one to fix first. |
| hiring-discrimination-meta-analysis | Your Critical Miss is the one thing to fix first on the page. Fixing it won't close a gap… | Your Critical Misses are the problems on the page that could cost you the interview. Fixing them won't close a gap… |
| salary-history-bans | …and the Critical Miss is the one thing to fix first. | …and each Critical Miss flags a problem that could cost you the interview, starting with the one to fix first. |

Those seven research pages move to 2026-11-02 in `public-pages.ts`, inside the same commit.

**For routing, not edited here (owned by the critical-miss-count session):**
- `components/workspace/report/markup/MarkedRows.tsx:128` and `lib/backend/pdf.ts:76` label the first row "The one thing to fix first". That label stays true for the first of several. When the count ships, the report should lead with the count ("3 Critical Misses. Start with this one."), per Matt's November 1 decision.
- `report-navigation.spec.ts:102` asserts that label.
- `docs/copy-system.md` §1 still says the Critical Miss "may be Nothing critical (D2)". Matt has since ruled that out. That session is editing the file.

## Proposed changes to report components (for routing)

These files are being edited by the signature-report and research-receipts sessions, so nothing here is committed.

| File:line (at 568b923a) | Before | Proposed | Why |
| --- | --- | --- | --- |
| `report/ReportStream.tsx:259` | …how easy the page is to scan. | …how easy the text is to follow. | Methodology renamed this part in #35. The report reads text, not layout. |
| `report/ReportStream.tsx:270` | Now let's look at yours. | What would they think of yours? | The homepage's turn line. The sample's end is the same moment. |
| `report/ReportStream.tsx:271` | Upload or paste it to see what comes through clearly, where it leaves questions, and what to change first. | Upload it or paste it. You'll see what comes through, what slips past, and what to fix first. | The voice guide's reference wording, and the same promise the workspace makes. |
| `report/ReportStream.tsx:273` | Your first report is free. No card or account needed. | Your first report is free. No account or card. | Matches the hero, the share card and pricing. |
| `report/ReportStream.tsx:280` | Your line is ready. See how the whole page reads now. | Your line is ready. Run the whole resume again and see what changed. | "How the page reads" is the abstraction the voice guide warns about. The button runs a re-check. |
| `report/ReadComparison.tsx:37` | The revision didn't change what a recruiter would miss first. Start there again. | Your revision didn't change the Critical Miss. Start there again. | #35 removed claims that the Critical Miss is what a recruiter would notice. |
| `report/ReadComparison.tsx:38` | Your report now leads with something new. Check that the old gap is really closed, then take on this one. | The report now leads with a new Critical Miss. Make sure the old one is really answered, then take this one on. | Names the thing. "Closed" sits close to "fixed", which the word list forbids for re-checks. |
| `report/markup/MissFeedback.tsx:39` | Thanks. Answers like this are how we check the read. | Thanks. This is how we find out when we picked the wrong thing. | Says what the feedback is for, without "the read". |
| `report/FullRecruiterNotes.tsx:10` | Work Experience | Work experience | Sentence case. |
| `report/FullRecruiterNotes.tsx:130` | The full read. | The rest of the notes. | The label above it is "Full recruiter notes"; this keeps the heading literal. |
| `report/IndependentAdvice.tsx:141` | Other suggested edits. | More lines worth a second look. | "Suggested change" is retired. This also says what the section is. |
| `ReportPanel.tsx:183` | Add your resume and see what a recruiter notices first. | Add your resume to see what a recruiter sees first. | The product's promise, and less certain than "notices". |
| `ReportPanel.tsx:198` | Get your free report → | Get your free report (with the `ArrowRight` icon) | Every other instance uses the icon, not a text arrow. |
| `lib/reports/report-presentation.ts:33` | Review the suggestions below. | Here's where to start. | The fallback heading reads like a form. ReportStream already uses "Here's where to start." |
| `lib/backend/pdf.ts` (rewrites section) | Suggested edits / Revising your resume | More lines to revise | Retired "Suggested" name. One heading in place of a kicker that repeats it. |
| `lib/backend/pdf.ts` (template note) | About draft templates: Complete the bracketed details with facts from your experience before using a draft. | Fill in the brackets with your own facts before you use a draft. | Same rule, half the words. |
| `lib/backend/pdf.ts` (footer) | AI-generated feedback. Check every suggested detail before using it. | A recruiter's review criteria, applied by AI. Check every suggested detail against what you actually did. | Matches the founder disclosure and FAQ without naming anyone. The current line is accurate; this one is optional. |

## Brand-identity proposals (Matt's call, via the coordinator)

1. **Homepage H1, "They called someone back. It wasn't you."** Keep. It's the most distinctive line on the site and it carries the pain Matt asked for. No alternative beats it.
2. **Founder headline.** Superseded: Matt asked for an anonymous site (see "Anonymous founder" above), and his new wording is in place.
3. **Subhead, "…and the one thing to fix first", and the Critical Miss definition.** Matt approved up to three Critical Misses on November 1 ("A Critical Miss is any problem that would cost an interview on its own"), and the critical-miss-count session is building it. Once a report can say "3 Critical Misses. Start with this one.", these lines say something the report doesn't:
   - `HiringTruths.tsx:15`: "One Critical Miss, not forty tips. Every report names the one thing to fix first." Matt has already approved its replacement, which ships with the severity feature in another session. This branch leaves the line exactly as it is.
   - `pricing.ts:40`: "The Critical Miss: the one thing to fix first"
   - `methodology/page.tsx:23, 38, 95`: "the Critical Miss, the one thing to fix first"; "The one change to make first"; "the report picks one thing to fix first"
   - `FirstReadModelDiagram.tsx:41`, `MarkedRows.tsx:128`, `pdf.ts:76`: "The one change to make first" / "The one thing to fix first"
   - `sample-report/page.tsx:12`, and `page.tsx:9` (share description): "the one thing to fix first"
   - Research tie-ins in seven articles: "the Critical Miss is the one thing to fix first"

   **Status:** the coordinator asked for the definition below as its own droppable commit; see "Critical Miss definition" above.

   **Recommendation:** keep the subhead as is. "The one thing to fix first" stays true, because a report with three still starts with one. Change the definition everywhere else on the day the count ships:
   - Definition: "A Critical Miss is a problem that could cost you the interview on its own. The report flags up to three and starts with the one to fix first."
   - Pricing feature: "Critical Misses: what could cost you the interview, starting with the one to fix first"

   Alternative subhead, if Matt wants it to match the count: "See what a recruiter sees on your resume, and what to fix first." It's accurate but loses the edge of "the one thing".

## Follow-ups

- **When multiple Critical Misses ship:** apply the definition change in proposal 3 across the files listed there, in the same release.
- **Server error copy:** about a dozen `app/api` and `lib/operations` messages start "Please try again". They're plain and correct. Changing them means updating `generation-failure-copy.test.ts` and related tests, so they weren't touched here.
- **Hidden surfaces:** Jobs and LinkedIn review use the retired "Start a report" and "Start with these changes", and LinkedIn says "example report". They're behind launch flags (Jobs is a 404 in production). Fix them before either flag turns on.
- **Dead code:** `MARKETING_NAV` in `lib/navigation.ts` is unused and title-cased ("How Recruiters Read", "Research Hub").
- **Kept on purpose:** "Résumé" in `quantifying-impact` is the cited paper's title, quoted as published.

## Verification (local, November 2, 2026)

- **Passed:** `tsc --noEmit`, `npm run lint`, `npm run qa:design-system` (0 banned copy terms), `test:search-foundation`, `tests/billing-pricing.test.ts`.
- **Banned-phrase scan of every added line:** voice-and-tone's avoid list, the retired names in copy-system §1, "Please", accents on resume, and em dashes. No hits in copy.
- **UI specs on a production build:** billing off, mock OpenAI, Supabase pointed at 127.0.0.1. 111 passed, 1 skipped, 0 failed across 13 files:
  - homepage-seo, site-mobile-navigation, legal-mobile-layout, landing-navigation, pricing-mobile
  - editorial-surfaces, search-foundation, auth-code-retry, workspace-handoffs (which runs the shared action-failure cases)
  - first-report-wait, mobile-resume-experience, status-states, accessibility
- **Looked at in the browser:** the workspace, the guides index, the 404 and the trust page, on that build.
- **Not run:**
  - `privacy-checklist.spec.ts` needs an analytics-on build (`test:consent-ui`).
  - `redteam-journeys.spec.ts` needs the dev-server journey runner.
  - `paid-decision.spec.ts` needs a billing-on build.

  The only change in the first two is the workspace H1 string. No paid-decision assertion changed.
- The last two string edits (the workspace eyebrow, a trust-card sentence) came after that build. tsc, lint and the guardrails were re-run on the final commit.
- **Anonymous-founder pass, on a fresh build of `c9609f58`:**
  - Passed: lint, `qa:design-system`, `test:search-foundation` (now asserting no founder or Person).
  - The production build's type check passed.
  - The served homepage HTML has no "Matt", "Shaw", "Google", "OpenAI" or photo path.
  - Looked at the founder section and methodology at 390 and 1440: no horizontal overflow, no name anywhere on methodology.
  - 8 UI spec files: 48 passed, 2 failed. homepage-seo (the new founder assertions), search-foundation, editorial-surfaces, homepage-responsive, landing-navigation, mobile-landing and site-mobile-navigation all passed.
  - The 2 failures were timeouts in `research-surface.spec.ts` while the machine's load average was about 25. On a rerun, "load without browser errors" passed. The axe sweep (17 pages in 180 seconds) timed out again; neither run failed an assertion.
  - Run directly, axe found no serious or critical violations on `/research/referral-advantage` (the only research page changed), `/` at 1440 and 390, or `/methodology` at 1440 and 390.
  - The research axe sweep should be re-run on a quieter machine or in CI.
