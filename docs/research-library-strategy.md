# Research library strategy

November 1, 2026. Branch `claude/research-library-strategy`, from `claude/wave-2`. Local only: not pushed, merged, or live.

## Status (Nov 1, later the same day)

Matt's decisions: **D1 yes** (question headlines), **D2 yes** (remove repeated FAQs), **D3 no** (no corrections promise), **D4 yes** (pain lines, high craft only). The second commit on this branch builds them:

- All 17 articles use the answer-first template (`web/components/research/AnswerArticle.tsx`). The hub question, the H1, and the search title are one string, and a test holds them together. The answer sits under the H1 with its study linked. There's one bridge to the report where the advice is. Repeated FAQs and their FAQPage markup are gone, and genuinely new FAQ answers moved into the body.
- 14 of 17 articles carry a pain line; three were cut as not good enough.
- `research_article_viewed` and the research report clicks are recorded, consent-gated, with tests.
- The prototype route is gone: `/research/how-recruiters-read` is now the full answer-first version.
- Held until the signature report merges: rec 3 (report to research through the score parts) and rec 4 ("How we write research" on `/methodology`).
- Wave 3 (Nov 2): rec 3 and rec 4 are built. The report's "Why we read it this way" links each score part to its article (§4 mapping, plus `/methodology`); `/methodology` has "How we write the research" (no corrections promise, per D3); and each article's method note links to it.

## The short version

1. **Open every article the way its hub row already does: the question, then the answer.** Today a searcher asks "Do recruiters only spend six seconds on a resume?" and lands on a headline that says "What recruiters notice in the first pass". The answer is in the dek, framed as a negative ("They do not establish a six-second deadline"). The hub has the right shape already: a question in the reader's words, and a one-line answer in the recruiter's voice. The article should be that row, expanded.
2. **Research is the report's receipts.** Each part of the report should link to the evidence behind it, and each article should point to the report part that applies it, once, at the moment the reader wants to apply it. Today the report links to no research, and every article ends on the same generic band.
3. **Trust without bylines comes from what's visible next to each claim:** the source named in the sentence, how it was done, what it can't tell you, a link to the full study, and a date. Add a short "How we write research" section to `/methodology` so the method is stated once.
4. **We can't yet see who arrives or whether research leads to reports.** Page statistics started on Oct 31. Two events already in the analytics policy would measure research to report; neither fires today. Search Console is the source for queries, and only Matt can open it.

## 1. Who arrives, from what search, in what state

**What the data says: nothing yet.** Vercel page statistics went live with #27 (Oct 31), and the Hobby plan keeps 31 days. Every recorded visit is from Nov 1: 31 visitors and 118 pageviews site-wide. Six research articles had one or two visitors each (`how-recruiters-read`, `referral-advantage` and `writing-quality-hire-probability` two; `ats-myths`, `resume-length-myths`, `skills-first-promise-reality` and `spelling-errors-impact` one). Google is the referrer for 23 of the 31 visitors, but those visits include `/status`, `/purchase/restore` and `/security`, pages nobody reaches from an organic search. Read it as us checking the site, not as readers. There is no Search Console access from here, so this plan works from search intent and comparable pages, and its first job is a baseline.

**What people are asking.** The hub's questions are already phrased the way people search. They fall into four states of mind:

| Kind of question | Examples from the hub | State of mind | What they need first |
| --- | --- | --- | --- |
| Myth check | Six seconds? One page? Is a robot rejecting me? Does one typo sink me? | Heard a rule, afraid they're breaking it | Is it true, and what do I do instead |
| Mid-edit how-to | What makes a bullet land? Should I explain a gap? STAR? | Editing right now | The move, then why it works |
| "Is it me?" | Does bias still decide? Do referrals matter? Where can software screen me out? | Explaining the silence after applying | An honest answer, including what a resume can't fix |
| After the offer | Should I negotiate? Which offer is better? | Relief, high stakes | What to say, and the basis for it |

The first three are the job search's pain: applications sent, nothing back, and a rule from somewhere that might explain it. Name that plainly (Matt's direction) and then answer it.

**The opening in search.** On Nov 1 the results for "do recruiters really spend 6 seconds on a resume" were mostly reprints of one 2012 job-site report, and "should a resume be one page" returned career sites and auto-generated pages. Few results answer with the study and its limits. A page that does, with the full study one click away, is the thing worth clicking and linking to.

## 2. What each page owes the reader

The order, top to bottom:

1. **The question as the headline**, in the words they searched. One string for the hub, the H1, and the search title.
2. **The answer** in two or three plain sentences, in the recruiter's voice (Literata, pen), with its main source named and linked directly under it. A reader who stops here leaves with the truth.
3. **What it means for your resume**: two to four concrete moves, labeled as our advice.
4. **One bridge to the report**, right there, naming the report part that applies the advice.
5. **The figure**, drawing the finding (not the methods) when the finding is about the resume.
6. **What the evidence says**: each source once, with what it found, how it was done, and what it can't tell you, plus a link to the full study.
7. **Next questions**: the hub rows a reader would ask next, with their one-line answers.
8. A short "How we write these" note, then the closing action.

Tested against the current article standard (`web/app/(editorial)/research/article-standard.md`), on `how-recruiters-read`:

| Today | Problem | Proposed |
| --- | --- | --- |
| Editorial headline; the question only in the search title | The page doesn't confirm the reader found what they searched for | The question is the H1 |
| "Key finding" card headlining "Longer looks at Experience" | Answers a question the reader didn't ask | The answer to their question, with its source |
| Figure 1 is an evidence table | Methods before the answer | Evidence after the advice; the figure draws the finding |
| The six-second origin appears five times (dek, body, figure, FAQ, limitations); the 221/24/2,043 sample four times | The standard says "say a limit once" | Each fact and limit once, beside its source |
| A visible FAQ mirroring the body, feeding FAQPage markup | Google shows FAQ results only for government and health sites, so the duplication buys nothing | Drop both; follow-up questions become "Next questions" links |
| "Where this shows up in your report" defines report parts; a generic CTA band about 6,400px down at 1440 | The product appears as a glossary, then as an ad | One bridge where the advice is, and a closing line from the article |
| Four gray advice cards ("What should be easy to understand") | A card farm with abstract advice | Three numbered moves and one thing not to do |

Keep the depth. Answer-first means a skimmer is done in one screen; the skeptic scrolls to the studies. Nothing gets shorter where the evidence is.

## 3. Trust without bylines

Matt rejected personal bylines and "Reviewed by" lines. Google's guidance asks for a byline only "where one might be expected", and puts equal weight on showing how content was made ([Creating helpful content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)). For research summaries a reader expects the study, not the writer. Cochrane's plain-language summaries are a useful model: key messages first, then what was found, then the limits of the evidence, then how up to date it is ([template](https://training.cochrane.org/template-writing-cochrane-plain-language-summary)).

**Visible on every article**

- The source named in the sentence that uses it, not only as a footnote number.
- What kind of source it is, in plain words: "a peer-reviewed study", "a job site's report about its own product", "LinkedIn's help pages". This is description, not a grade; the design system rules out evidence-strength labels.
- How it was done: who, where, how many, what setting.
- What it can't tell you, next to what it found.
- A link to the full study (DOI where one exists), and "We read only the abstract" where that's true.
- "Our advice" or "Our take" on anything that is ours.
- The updated date (already from `PUBLIC_PAGES`).
- A link to "How we write research".

**Markup only.** Article with the Organization as author and publisher, `dateModified` from the registry, `citation` for each source, and breadcrumbs (all shipped in the search foundation). Drop FAQPage.

**New: "How we write research" on `/methodology`.** Five lines, stated once: we read each study in full where we can and say when we read only the abstract; every number links to its source; each source's limit sits next to its finding; our advice is labeled as ours; and corrections go to support@recruiterinyourpocket.com, after which we fix the page and update its date. The corrections promise is Decision D3.

## 4. The path to the product

**Research to report.** One bridge, inside the article, right after "What it means for your resume". It asks the article's question of the reader's own resume and names the report part that answers it ("What does your Experience section say first? Your report opens with a Verdict..."), then one action: "Get your free report" (the agreed name, `docs/copy-system.md` §1). The closing band repeats the action with a line from the article. No sticky bar, modal, or exit prompt on research: the reader came for an answer, and the report is the obvious next step for anyone who wants it applied. The bridge uses the secondary button so the header's dark pill stays the one primary action on screen.

**Report to research.** The report schema has no per-finding category, but it has the four parts the score weighs (`subscores`: impact, clarity, story, readability), which `/methodology` already describes. Link at that level, from the report's score explanation and from a new "The research behind each part" list on `/methodology`:

| Part the score weighs | Research |
| --- | --- |
| The results you show (impact) | `quantifying-impact`, `writing-quality-hire-probability` |
| How clearly each line reads (clarity) | `how-recruiters-read` |
| How your experience fits together (story) | `who-you-are`, `gaps-and-pivots`, `star-method` |
| How easy the text is to follow (readability) | `spelling-errors-impact`, `resume-length-myths` |
| The score itself | `/methodology` |

This mapping is ours; the studies didn't test our score, and `/methodology` already says so. Per-finding links (a "Why this matters" link on a Critical Miss) would need the model to tag each fix with a kind: a prompt change with an eval. Do it later, and only if people use the part-level links. The report components belong to the signature-report session.

## 5. The index

Keep the hub as it is in shape: a page of questions with one-line answers, grouped by the four pillars Matt chose. It is already the strongest research surface. Don't reorganize it around report findings: searchers don't know our report's parts yet, and it would make the trust layer read like a product tour. The report-to-research map belongs on `/methodology` instead.

Seventeen articles isn't the problem. Each page owning one question is right; the pages just don't open with their answer. Three changes:

1. Make the hub row and the article's opening the same object, from the same data (`ResearchHubData.ts`), so they can't drift.
2. Choose the hub's lead questions from Search Console impressions once there are some. Today the featured five are guesses.
3. Don't add articles until Search Console shows what people ask that we don't answer. Merge two pages only if they compete for the same query.

## 6. Measurement

**Today.** Page statistics since Oct 31 only, 31 days of history on Hobby. `research_article_viewed` is in the analytics policy but nothing fires it. `landing_cta_clicked` fires only on `/`. `report_started` carries no entry source. Research to report can't be measured.

**Add (no new properties, no policy change).** In `components/privacy/AnalyticsLifecycle.tsx`: fire `research_article_viewed { slug }` on article pages, and let the click listener record `landing_cta_clicked` on `/research/*` with `cta` set to `research_bridge` or `research_close` (the prototype's links already carry these attributes). Then build a Mixpanel funnel: `research_article_viewed` → `landing_cta_clicked` (research) → `report_started` → `report_completed`. Mixpanel only sees visitors who allow analytics, so read the funnel as a trend, not a total.

| Signal | Where | Baseline now | When to look |
| --- | --- | --- | --- |
| Articles indexed (all 17) | Search Console, Pages | Unknown | 2 and 4 weeks after the search foundation deploys |
| Impressions and position per article, by query | Search Console, Performance | Unknown | Every 4 weeks; export it, since it keeps 16 months |
| Click-through rate per article | Search Console | Unknown | Once positions settle |
| Search landings per article | Vercel page statistics, `/research/*` from google.com | Nov 1 only, mostly us | Monthly export (31-day window) |
| Research to report starts | Mixpanel funnel above | Not measurable | After the two events ship |
| Report to research clicks | Mixpanel | No links exist | After the report links ship |

Don't set rate targets yet. At this volume a conversion rate swings on one visitor; report counts until they're large enough to compare. Vercel Pro isn't needed for any of this (Matt said "Not yet" on Nov 1): Search Console is free and holds the history.

## Recommendations, ranked by impact

1. **Answer first on every article** (H1 is the question; the answer and its source sit under it). The answers already exist on the hub. Needs D1.
2. **Measure research to report** with the two existing events. Small, consented, no policy change. Shared analytics file, so the coordinator picks the owner.
3. **Link the report to the research** through the four score parts, plus "The research behind each part" on `/methodology`. Signature-report session.
4. **"How we write research" on `/methodology`**, with the corrections line. Needs D3.
5. **One bridge per article, where the advice is**, and a closing line taken from the article. Copy follows the voice guide; the pattern is in the prototype.
6. **Say each fact and limit once, beside its source**; drop the visible FAQ and FAQPage markup where they repeat the body. Needs D2.
7. **Draw the finding, not the methods.** Replace evidence-table figures with figures of the resume where the finding is about the resume (`how-recruiters-read`, `resume-length-myths`, `quantifying-impact`).
8. **Grow the library from Search Console data**, not guesses.

Items 1, 5, 6 and 7 are one template change in `ResearchArticle` plus 17 content edits. Run them as one wave after D1, against the prototype, keeping every claim as #35 left it.

## Decisions for Matt

- **D1. Make each article's headline the reader's question.** It replaces the 17 editorial headlines ("What recruiters notice in the first pass" becomes "Do recruiters only spend six seconds on a resume?") and makes the hub, H1 and search title one string. *Recommendation: yes.* It's how people arrive, and the hub already speaks this way.
- **D2. Drop the visible "Common questions" block and its FAQPage markup** where they repeat the body. *Recommendation: yes.* Follow-up questions become "Next questions" links to other articles.
- **D3. Publish a corrections promise** on "How we write research": email us, we fix the page and update its date. *Recommendation: yes.* It's the strongest trust line available without a byline, and it commits us to answering those emails.
- **D4. One line of pain at the top of each article**, in the recruiter's margin voice, naming why the question hurts. For six seconds: "Six seconds is the kind of number that sticks when nobody writes back." Never with a number we can't source. *Recommendation: yes, one per article.* This is tone, so it's Matt's call.

## The prototype

First built at `/internal/research-prototype/how-recruiters-read`. Since D1 it *is* `/research/how-recruiters-read`: the template is `web/components/research/AnswerArticle.tsx` and the figure is `web/components/research/diagrams/SectionFindingsFigure.tsx`.

I picked `how-recruiters-read` because it answers the most-repeated hiring myth, the results for it are weak, and its subject is the product's own promise: what a recruiter sees first.

- **Claims.** Every research claim is the live article's, as #35 left it. The order and the sentences around the claims changed; no number, study, source, or limit was added or dropped. The hub answer, the 2012 report's 30 recruiters, the 2023 study's setup (221 recruited, 24 removed, 2,043 reviews, one southwestern US state, no time limit, no job named), the section results, the association limit, the 2002 abstract-only note, and each source's full title and journal all carry over. The four advice cards and the process figure's takeaway became three numbered moves.
- **Opening.** The H1 is the searched question. The answer sits in Literata in pen, the hub's answer voice, with its study linked underneath. D4's pain line sits in the margin, where the report puts its pen notes.
- **Middle.** Three numbered moves and one "what the studies don't support", then the bridge: "What does your Experience section say first?", using the existing tie-in wording and a secondary "Get your free report".
- **Figure.** It draws the finding: a resume sheet with the study's sections, a highlighter on Experience, and what the study found beside each section. It replaces both the evidence table and the process figure.
- **Evidence and close.** Each source once, with what it found, how it was done, what it can't tell you, and a link to the study. Then four "Next questions" pulled live from `ResearchHubData.ts`, the "How we write these" note (without a corrections promise, per D3), and the hub's closing pattern.
- **Height.** About 5,400px at 1440, down from about 6,900px.

Screenshots are in the session notes folder: `research-library/` holds the pre-wave live article for comparison, and `research-library/wave/` holds the shipped template at 320, 390, 1024 and 1440, at 200% zoom, and in dark mode.

Checked locally on a dev server: no horizontal overflow at 320, 390, 1024 and 1440; `npm run qa:design-system` passes (radii stay at 7); lint on the new components; `tsc --noEmit`; `test:search-foundation`; `test:research-figures`. Every link and button shows the shared focus ring; standalone controls are 44px or taller. Not checked: 200% zoom, a screen reader, dark mode, a production build.

## What this didn't cover

- No Search Console access, and no real traffic yet; reader intent is inferred, not observed.
- The comparable-site review was light: Google's guidance, Cochrane's summary template, one Nielsen Norman Group article page, and two result pages.
- The prototype is one article in new files. The template isn't wired into the live pages, and its copy hasn't been through Matt.
