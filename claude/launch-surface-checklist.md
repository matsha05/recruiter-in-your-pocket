# Launch surface checklist

Working list for the `claude/launch-surface` branch. Source: three read-only audits on Oct 30, 2026 (marketing, product flows, outputs), checked against `docs/voice-and-tone.md`, `docs/copy-system.md` and `docs/design-system.md`. Matt's bar: maximum craft on every surface; copy in the sharp, generous recruiter-friend voice.

## Decisions (Matt, Oct 30)

- Retire the coral/yellow sample-card colors. Done (`ca39782`).
- No monospace face. Done (docs updated).
- Homepage: four beats. Hero, one full-report preview on the same Dana resume labeled Verdict / Score / Critical Miss, founder, one closing CTA.
- One header on every public page, with Pricing and Log in.
- Signed-in destination is called "My reports".
- Merge /methodology and /research/how-we-score into one "How the report works" page.

## Done

- [x] Report order: Verdict, Score, Critical Miss (`3e59f32`)
- [x] One score system in the web report (`3e59f32`)
- [x] Pre-upload CTA "Get your free report"; workspace copy lines (`954bafc`)
- [x] Hero "Your view / A recruiter's view"; instrument removed (`2f24e62`)
- [x] PDF matches the web report (`43b1f15`)

## Report (web)

- [x] Critical Miss is said twice: top block and Fix 01 repeat headline and why. Fix 01 becomes "Your Critical Miss" with evidence and rewrite only.
- [x] Report TOC lists Keep these / Role fit even when those sections don't render.
- [x] One "keep only what's true" line under the fixes heading; remove per-card repeats (FixCanvas, IndependentAdvice).
- [x] Copy-disabled notice: keep the page banner only.
- [x] Cut eyebrows to Verdict and Critical Miss; sentence-case headings elsewhere (ReportStream, FullRecruiterNotes).
- [x] "What already works" vs "Keep these / Also worth keeping": one name.
- [x] Sample CTA note renders "No card required. No account required." twice.
- [x] Exhausted state heading and body; comparison note copy.
- [x] "Fix 1" vs "Fix 01": one format.
- [x] Save naming: "Save report" / "Saved to History." / "Exporting…" / "Share report"; share copy needs await + feedback.
- [x] Empty state CTA and contrast (ReportPanel).
- [ ] "job posting" everywhere; section "Role fit".

## Analysis, outcomes, errors

- [x] One outcome-copy module (used / not used / unknown + next step) for generationFailureCopy, useResumeReview, useLinkedInReview, API messages.
- [x] AnalysisScanning: one heading, honest time ("one to two minutes"), steps only from real events, retry note.
- [x] "Review stopped" → "Report stopped"; drop "Resume review" eyebrows.
- [x] Sample report unavailable / retry unavailable toasts.
- [x] error.tsx "Return to the studio"; not-found tokens, pills, copy.
- [x] Anonymous recovery messages (no "recovery reference").

## Purchase and pricing

- [x] One purchase CTA: "Get 5 more reports · $29"; modal "Continue to checkout".
- [x] Paywall: price once, one terms line.
- [x] Purchase confirmed: "You're all set." No polling counter; no "Open workspace".
- [x] Pricing page: say "30 days, no renewal" once in the card and once after checkout; one buy label; free tier names Verdict / score / Critical Miss; drop redundant eyebrows; "In-browser" jargon.

## Homepage and chrome

- [x] Four-beat homepage (see decisions). Cut summary card, extra handoff CTA, repeated free promise, homepage "Free report limits".
- [x] Founder section: heading contradicts "no personal review" disclosure; one AI disclosure on the page.
- [ ] One header everywhere; "My reports" for signed-in.
- [ ] Sample report link label: "Read a sample report" everywhere.
- [ ] Footer copy; "job posting".
- [ ] Metadata, OG image, manifest (indigo theme color, short name).

## Methodology and research

- [ ] Read and fix every research article and every diagram (copy, voice, type sizes, tokens, mobile layout), not just the index.

- [ ] Merge /methodology into /research/how-we-score as "How the report works"; redirect; update links.
- [ ] Methodology copy: hedges, "not X" formulas, compliance-styled limits.
- [ ] FirstReadModelDiagram: retired "clarity summary"; lead with Verdict.
- [ ] Guides: Sparkle icon, duplicate eyebrows, guide naming.
- [ ] Trust card on score (lib/legal/content.ts:78) and FAQ keyword line.
- [ ] /status page: hide from public.

## Other scoring systems

- [ ] LinkedIn report: band + four subscores → Verdict / one score / Critical Miss.
- [ ] Version comparison: compare Verdict and whether the Critical Miss was resolved; drop subscores.
- [ ] Dashboard: drop "Average Score" and color bands; lead with what keeps coming up.
- [ ] Jobs: "% match" and bands → counts of posting terms found.

## Signed-in surfaces, settings, auth, small text, icons, dead code

- [ ] Visual and copy pass on every signed-in surface: My reports/history, dashboard, settings, jobs, LinkedIn, purchase confirmed/restore, auth.
- [ ] PDF: second visual pass after report changes (fonts, pagination, grayscale).

- [ ] Auth copy ("Please enter…", "Secure sign-in", "Login code").
- [ ] Settings sentence case, legacy labels, delete dialog copy.
- [ ] 12px minimum text; delete `riyp-type-10px` once unused.
- [ ] Phosphor only, starting inside the workspace.
- [ ] Delete dead code: FirstImpressionSection, ScoreSummarySection, EvidenceLedgerSection, BulletUpgradesSection, MissingWinsSection, JobAlignmentSection, useResumeAnalysis, LionScene + lionRig, unused landing variants, MARKETING_NAV.
- [ ] Token cleanup in globals.css (brass aliases, accent-apricot is teal, raw px in marketing CSS); move component styles out of globals.

## Still open from the launch plan

- [ ] Production report + Vercel logs within the hour (#1 reliability).
- [ ] Restore the Terms "does not guarantee" wording check (#6): Terms line 269 already says "Reports and scores do not predict or guarantee interviews, offers, or hiring outcomes." The PDF now states the score limit again.
- [ ] Paused-generation notice before upload (#8 part 2).
