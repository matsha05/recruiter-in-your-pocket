# First 100 users

November 2, 2026. Branch `claude/first-100-users`, from origin/main `568b923a`. Local only: not pushed, merged, or live.

Companions: [brand-drafts.md](brand-drafts.md) (bios, the first six posts, the partner email, community answers, listing copy) and [weekly-scorecard.md](weekly-scorecard.md) (the two-minute Monday read).

## The short version

**The goal.** 100 people outside the team finish a free report within 10 weeks of the first post. That's about 10 a week. A finished report is the right unit: it's the product's demo, it's what every channel is trying to produce, and it's counted for every visitor without depending on the analytics choice (Sentry `riyp.report.outcome outcome:completed`, see [monitoring.md](../launch-readiness/monitoring.md)). The secondary goal is the first five real purchases; there have been none since July 30.

**The three channels to start with**, ranked by expected reach per hour of Matt's time:

1. **Search.** The research library and the search foundation are built; what's missing is Search Console, which only Matt can open. About 1.5 hours once, then 30 minutes a week. Slowest to show results, cheapest to keep running.
2. **Community answers as the brand**, mostly Reddit's resume and job-search communities. About 2 hours a week. The fastest read on whether the voice and the free report land with people who are stuck right now.
3. **Partners who advise job seekers**: independent career coaches and bootcamp career teams first, career centers in parallel. About 1.5 hours a week. Slow to start, and one yes keeps sending people.

Directories and listings (4), brand social accounts (5), and a paid search test (6, Matt's spend call) follow.

**Nothing goes out before the site is anonymous in production.** Today the founder's name and three employers are on the homepage and in several other places (listed under "Before the first post"). Every post and email in this plan drives strangers to those pages.

**Decisions for Matt** are at the end. The one that blocks everything is the anonymity gate; the rest can wait for week 2 data.

## Where we start

Measured, not estimated:

- **Traffic.** October 26 to November 1: 10 `/pricing` views from 7 visitors (monitoring baseline). October 25 to November 2: 37 visitors site-wide, 23 from google.com and 14 direct (Vercel page statistics, read-only query on November 2). The research strategy found most November 1 visits were us checking the site.
- **Reports.** The signed-in ledger shows 7 attempts in 60 days and none completed; anonymous reports weren't counted anywhere durable until the monitoring counters shipped in #39.
- **Purchases.** One pass (the July 28 billing verification) and no Stripe events since July 30.

So any channel that brings ten real visitors a week doubles the site's traffic. For the first month, read every number as a count. A conversion rate at this volume moves several points on one visitor.

## The goal, and the assumptions behind the thresholds

Week 1 starts the Monday after the anonymized site is live in production (target November 9). Week 10 ends around January 17, 2027. Late December may be slow; we have no data on that, so the scorecard will show it rather than the plan predicting it.

Each channel gets a **success number** and a **kill criterion** at two weeks. They're decision thresholds sized to the goal, not forecasts or industry benchmarks:

- A channel **works** if it's on track to deliver at least 3 finished reports a week. At that rate it could carry a third of the goal.
- To turn that into the visits each channel needs, the thresholds use two placeholder rates: **about 1 in 6** visitors who land on the homepage finish a free report, and **about 1 in 20** who land on a research article do. Nothing in our data supports or contradicts these yet. In week 2 the scorecard replaces both with our own rate (finished reports ÷ visitors), and the thresholds move with it.
- So a channel whose links land on the homepage needs roughly 18 visits a week (36 in two weeks), and one whose links land on research articles roughly 60 a week (120 in two weeks).
- A channel's finished reports are its consented count divided by the week's analytics coverage (see the scorecard). Partners and email have no referrer, so they're read this way only.
- The **kill line** is a third of success: under 12 homepage visits or 40 research visits in two weeks, and 2 or fewer finished reports, after the cadence was actually delivered.
- A **kill** means stop spending Matt's hours there and move them to the best channel. It doesn't mean deleting anything that's already live.

## Before the first post: keep the founder out of it

These are blockers. Check each one in production, not on a branch.

1. **The site.** The anonymization is in progress in another session. On origin/main today the name or the employers appear in: the homepage founder section and its Person structured data (`app/(marketing)/page.tsx`, `components/landing/LandingMineral.tsx`), the site Organization's `founder` (`lib/seo/site.ts`), the methodology FAQ about who wrote the review criteria (`app/(editorial)/methodology/page.tsx`), the referrals article's "Our take" (`research/referral-advantage/page.tsx`), and the FAQ answer about who developed the criteria (`lib/legal/content.ts`). The approved replacement line is "Built by a recruiter with 14 years in hiring, including at some of the biggest names in tech."
2. **Search results.** After the anonymized deploy, use Search Console's URL Inspection and Request indexing on `/`, `/methodology`, `/faq`, and `/research/referral-advantage`, so Google's snippets catch up. Older copies can stay in caches and web archives; we can't remove those, so the brand should never confirm or deny a name.
3. **Email.** Outreach goes from a brand address (suggest `hello@recruiterinyourpocket.com`) with the display name "Recruiter in Your Pocket". Before the first send, mail a throwaway inbox and read the original message: the From, Reply-To, and Return-Path must not show a personal address or name. Sign off as "Recruiter in Your Pocket".
4. **Stripe.** The public business name and the card statement descriptor say Recruiter in Your Pocket, and a test receipt and invoice show no personal name or home address.
5. **Domain.** WHOIS privacy is on for recruiterinyourpocket.com.
6. **Accounts.** Each brand account is registered to a brand email. The LinkedIn Page needs a personal profile as its admin; LinkedIn doesn't show admins publicly, but Matt should never list the company on his profile, follow or react from his personal account, or use "invite connections to follow" (invitations show who sent them). Threads needs an Instagram account: make a brand one.
7. **Places that require a real identity, skipped for now.** Product Hunt (a maker profile is a person; the July decision memo already dropped it), Google Ads (advertiser verification shows the verified legal name in ad disclosures and the Ads Transparency Center, and brand names aren't accepted: [Google's FAQ](https://support.google.com/adspolicy/answer/9720978)), and Blind (needs a work email).
8. **Links.** Never share a Vercel preview URL publicly; preview hostnames include the account slug.

## The channels, ranked

| # | Channel | Matt's time | First action | Weekly cadence | Success at 2 weeks | Kill at 2 weeks |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Search | 1.5 h once, then 30 min/week | Search Console steps 1, 2, 4, 6 from the [search audit](../launch-readiness/search-foundation-audit.md#google-search-console-what-matt-needs-to-check) | Monday: export Performance; an agent turns it into page fixes, links, and at most one new article | Sitemap "Success"; 25 of 32 URLs indexed; impressions on 5+ research articles | Not killed. Re-plan if fewer than 10 URLs are indexed (a technical problem, not a demand one) |
| 2 | Community answers | 2 h/week | Create the brand Reddit account; read the rules of the five communities below; answer 3 questions with no links | 6 to 8 answers a week; links only where rules allow and the article answers the exact question | 12+ answers; 3+ with replies or 10+ upvotes; 36+ visits from Reddit or 6+ finished reports | Removed or banned in 2+ communities, or under 12 Reddit visits and 2 finished reports after 12 answers. Then: answers without links, 2 a week, and move the hours to partners |
| 3 | Partners | 1.5 h/week | Build a list of 30 (coaches and bootcamp career teams first); send the first 10 emails | 10 personal emails, one follow-up after five business days, replies the same week | 20 sent; 3+ replies; 1 partner sharing the link | No positive reply from 20: change the segment and the opening line. No yes after 40: stop |
| 4 | Directories and listings | 2.5 h once, then 10 min/week | Submit the free listings below with the copy in brand-drafts.md | Answer reviews and questions on listings; add one listing a week if the first ones send visits | 6+ listings live; 36+ visits from directory referrers | Under 12 visits from all live listings combined, two weeks after they go live: stop adding, leave them up |
| 5 | Brand social (Threads, LinkedIn Page, X) | 1 h setup, then 1 h/week | Create the accounts with the bios in brand-drafts.md; schedule posts 1 to 3 | 3 posts a week, the same post on all three; reply to job-search conversations from the brand | 6 posts on each; 120+ visits from linkedin.com, threads, or t.co, or 6+ finished reports | Under 40 visits and 2 finished reports after 6 posts: keep 1 post a week on the best platform as the brand's home, move the hours to community |
| 6 | Paid search test (optional) | 1.5 h setup, then 15 min/week; $150 cap | Matt's spend call. Blocked by the ad-verification name (above) | Read the test daily for the first 3 days, then weekly | After $150 or 100 clicks: 10+ finished reports and 1+ purchase | Fewer than 5 finished reports from 100 clicks |

Matt's total for channels 1 to 5 is about 5 hours a week after a setup week of about 6 hours. An agent can do the drafting, the Search Console analysis, the partner list, and the weekly scorecard pull; none of it posts, sends, or creates anything.

### 1. Search

**Why it ranks first.** The work that needs skill is done: 17 answer-first research articles whose headlines are the questions people type, question-led search titles, a dated sitemap, structured data, and share cards that show each article's answer. What's missing is Search Console, which only Matt's Google account can set up, and which is also the only place that shows what people actually searched. It's slow. Indexing takes days to weeks and rankings longer, so it won't answer "which channel works" in the first two weeks. It's still the best reach per hour, because after setup it costs half an hour a week and keeps working.

**First action (Matt, about 1.5 hours).** From the search audit's checklist: step 1 (Domain property by DNS TXT record), step 2 (submit the sitemap), step 4 (URL Inspection and Request indexing on `/`, `/research`, `/methodology`, `/research/how-recruiters-read`, `/resources/offer-negotiation`), and step 6 (export the baseline). Do it after the anonymized deploy so the first recrawl sees the anonymous pages. Then add the site to Bing Webmaster Tools by importing from Search Console (a few minutes); Bing's index is used by other search tools too.

**Weekly (30 minutes of Matt's time).** Every Monday, export Performance → Search results for the last 7 days (queries and pages) and hand the file to an agent. The agent comes back with three lists, in this order:

1. **Pages that almost rank.** Queries where a page has impressions at an average position between about 8 and 30. Fix the page's answer, title, or description so it answers that query in the reader's words. This is the highest-return edit.
2. **Internal links.** For each page with impressions, check it links to the two or three questions a reader asks next and to the report bridge. The search audit already found two weakly linked articles (`gaps-and-pivots`, `who-you-are`) and a missing report-to-research direction; that last one is with the report owner.
3. **Questions we don't answer yet.** A query cluster with impressions in two or more weeks and no page that answers it becomes an article candidate. The research strategy's rule holds: don't add articles from guesses. Candidates to watch for, as hypotheses only: how far back a resume should go, whether to include a summary, whether GPA belongs, and whether a cover letter still matters. Each new article follows `article-standard.md` and the research claims rules, and needs Matt's read before it ships.

**AI answer tools.** The answer-first pages, with their sources linked, are the format answer engines quote. The new analytics labels count visits from chatgpt.com, perplexity.ai, gemini.google.com, copilot.microsoft.com, and claude.ai as `ai`, and Vercel shows the same referrers for all visitors.

**Success and re-plan.** Two weeks after setup: the sitemap reads "Success", at least 25 of 32 URLs are indexed, and at least 5 research articles have impressions. By week 6: at least 60 visits a week to `/research/*` from google.com, the research-landing threshold above. Search isn't killed; it costs 30 minutes a week. If fewer than 10 URLs are indexed at two weeks, inspect "Crawled, currently not indexed" and fix the technical cause. If a page has impressions but no clicks for four weeks, rewrite its title.

### 2. Community answers

**Why second.** People ask "what's wrong with my resume" in public every day, and they're the exact reader. A good answer is useful on its own, which is what the brand voice is for: the insider over coffee. It's the fastest feedback in the plan; within days we'll know whether answers get replies and whether anyone follows the link.

**Where.** Start with five: r/resumes, r/jobs, r/jobsearchhacks, r/careerguidance, and r/cscareerquestions (strict rules; answer only). Read each community's rules and sidebar before the first comment; rules change and some ban links outright. Skip r/recruitinghell to start: it's there to vent about recruiters, and a recruiter-built brand turning up uninvited is the wrong first impression. Off Reddit, Quora answers can rank in search for years; add it in week 3 if Reddit works.

**How it works as the brand.**

- A brand username (suggestions in brand-drafts.md) and a profile that says plainly that we make Recruiter in Your Pocket and are built by a recruiter with 14 years in hiring.
- Answer the question that was asked, in full, with no link. Most answers should never link.
- Link only when the community allows it and a research article answers the exact question; say it's ours ("we wrote up the studies here"). Mention the product only when someone asks for a tool, and disclose it.
- Never upvote our own comments, never use a second account, never post the same answer twice.
- New accounts are often filtered by communities' karma and age rules, so week 1 is answers only.

**Cadence.** 6 to 8 answers a week, about 15 minutes each. Sort by new on r/resumes and answer posts that share a resume or ask a question the research covers. The three templates in brand-drafts.md cover the most common questions; each must be rewritten around the person's actual post.

**Success and kill.** Success at two weeks: 12 or more answers, at least 3 with replies or 10+ upvotes, and either 36+ visits from Reddit or 6+ finished reports from `entry_source=reddit`. Kill: removals or bans in two or more communities, or under 12 Reddit visits and 2 finished reports after 12 answers. Then keep 2 link-free answers a week for presence and move the hours to partners. Reddit's app often opens links without a referrer, so Vercel undercounts Reddit; the tagged profile link fixes that for consenting visitors.

### 3. Partners

**Why third.** One person who advises job seekers can send dozens of them, and keeps doing it. It's slow: replies take days, and a yes takes a conversation. Start now so it's producing by week 4.

**Who, in order of how fast they decide.**

1. **Independent career coaches** (fast, aligned: they want clients to arrive with the first-pass problems already known). Resume writers too, framed as a quick first read before their intake, though some will see a competitor.
2. **Bootcamp and career-switch program career teams** (many people at once, all rewriting resumes in a new field).
3. **University career centers.** Slow, sometimes with a review process for outside tools, but large. The quickest way in is a center whose resources page already lists outside resume tools. Send a few a week from week 1.
4. **Outplacement firms and workforce boards** (American Job Centers). Slowest; week 4 onward, if the first segments reply.

**How to find them.** Public coach directories, coaches who write about resumes on their own sites, bootcamp career-services pages, and career-center resource pages. An agent can build the list with a reason to write to each one; Matt reviews and sends.

**The offer.**

- Their clients' first report is free already. That's the whole pitch for most.
- A free Job Search Pass so the partner can try it on a few resumes before deciding. Checkout already accepts Stripe promotion codes (`allow_promotion_codes` in `app/api/checkout/route.ts`), and fulfillment treats `no_payment_required` as settled, so a 100%-off code should work without code changes. Matt creates the code; test it in Stripe test mode first. The cost is the model cost of five reports.
- A tagged link so we can see which partner's clients finish reports. Don't promise partners a report on their clients: the count only covers consenting visitors.
- No client discount at first. That's a pricing decision; revisit if a partner asks for it.

**The anonymity question.** Partners will ask who's behind it. The answer is in brand-drafts.md: the approved founder line, the sample report and the methodology as the work to judge, and no name. If the question loses partners repeatedly, that's a finding for "What would change our mind".

**Cadence and numbers.** 10 personal emails a week (6 to 8 minutes each, each with one line that shows we read their work), one follow-up after five business days, replies the same week. Success at two weeks: 20 sent, 3+ replies, 1 partner sharing the link. By week 4: 2 active partners. Kill: no positive reply from 20 means change the segment and the opening line; no yes after 40 means stop.

### 4. Directories and listings

**Why fourth.** A few hours once, and a listing keeps sending a trickle of people who are already looking for a tool, plus links back to the site. The best ones meet people comparing tools: "alternatives to" pages for the scanners named in the competitive docs.

**Where (free submissions first).** AlternativeTo (as an alternative to Jobscan, Resume Worded, and Teal), SaaSHub, and the larger AI-tool directories (There's An AI For That, Futurepedia, Toolify). Several charge for a listing or a faster review; skip any fee without Matt's OK. A Show HN post on Hacker News is a one-day gamble worth one try in week 2: the free report is something people can use without signing up, which Show HN requires, and the audience is blunt.

**Listing rules.** Use the listing copy in brand-drafts.md: what it does, that the first report is free, what it isn't (an ATS score or a resume writer). Link with the directory's tag. Use sample report screenshots, never a real person's resume. Answer reviews within a few days, plainly.

**Success and kill.** Success at two weeks: 6+ listings live and 36+ visits from directory referrers. Kill: under 12 visits from all live listings combined, two weeks after they're up. Then stop adding listings; leave the live ones.

### 5. Brand social

**Why fifth.** A new brand account with no followers reaches few people, and LinkedIn Pages in particular get little reach without them. The accounts still matter: partners and Reddit readers check that the brand exists, and every research finding makes a post. Keep the cost low.

**Order.** Threads first (its feed shows posts from accounts people don't follow yet), then the LinkedIn Page (where job seekers and recruiters are), then X. Same post on all three, adapted to length.

**Content.** The six drafted posts, each a research finding with its pain line and a link to the article. After those, one finding per post from the other 11 articles, and an occasional short margin note in the hiring-truth register ("'Results-driven' is on every resume. Show the result instead."). No engagement bait, no polls for their own sake, no outcome promises.

**Success and kill.** Success at two weeks: 6 posts on each platform and either 120+ visits from linkedin.com, threads, or t.co, or 6+ finished reports. Expect it to fall short: that bar is what carrying a third of the goal takes, and a new account rarely gets there in two weeks. Kill: under 40 visits and 2 finished reports after 6 posts. Then keep one post a week on whichever platform did best, and move the hours to community answers.

### 6. Paid search test (Matt's spend call; not set up)

**Why last, and why still worth designing.** Paid search buys reach, so per hour it's the most reach in the plan. It's also the cleanest test of the funnel: people searching "free resume review" have intent, so if they don't finish the free report, the problem is the site, not the channel. Two things hold it back: the cost, and Google's advertiser verification, which publicly shows a verified legal name and doesn't accept a brand name. Without a company to advertise under, it would show Matt's name. Microsoft Ads is the alternative; check its own verification and disclosure rules before assuming it's different.

**Design.**

- **Keywords**, exact and phrase match: free resume review, resume review, resume feedback, resume critique, recruiter resume review. A separate ad group for "resume checker" to see whether checker-seekers finish the report (our positioning isn't an ATS checker).
- **Negatives:** template, builder, writer, examples, jobs, salary, near me.
- **Target:** United States, all devices. Landing page: the homepage.
- **Ads**, in the brand voice and within the claims rules: "See what a recruiter sees in your resume. Your first report is free." No interview or ATS promises.
- **Budget:** $10 a day for up to 14 days, $150 hard cap. Before launch, check Keyword Planner: if top-of-page bids for the core terms are above about $3, $150 buys too few clicks to read, so don't run it.
- **Tag:** `utm_source=google&utm_medium=cpc&utm_campaign=resume-review-test&utm_content=<ad group>`.
- **Read:** Ads clicks; consented visits and finished reports with `entry_medium=cpc`; the change in Sentry finished reports during the test; purchases in Stripe.
- **Decision** after $150 or 100 clicks: success is 10+ finished reports (about $15 or less each) and at least one purchase; kill is fewer than 5 finished reports.

**The economics, honestly.** The pass is $29, one time. Paid search pays for itself only if the cost per purchase stays under that, after Stripe's fee and model costs. We don't know the purchase rate, so this is a $150 experiment that buys an answer, not a channel to scale.

**Recommendation.** Not yet. Revisit after week 2 if organic channels have produced fewer than 10 finished reports in total, and only if there's a company to advertise under.

## Tracking

### What we can see, and for whom

| Step | Every visitor (no analytics choice needed) | Consenting visitors, by channel |
| --- | --- | --- |
| Landing | Vercel page statistics: visitors by page and by referring site | Mixpanel `page_viewed`, `research_article_viewed` with the `entry_*` properties |
| Free report start | Sentry `riyp.free_gate.check result:allowed` (anonymous) | Mixpanel `report_started` |
| Report finished | Sentry `riyp.report.outcome outcome:completed` | Mixpanel `report_completed` |
| Checkout | Sentry `riyp.checkout.step step:checkout_started` | Mixpanel `checkout_started` |
| Purchase | Stripe; Sentry `step:entitlement_granted` | Mixpanel `checkout_completed` |

Two limits shape how to read it:

- **Vercel Hobby can't break visits down by campaign tag.** The page statistics keep the `utm_*` tags, but Vercel's API returned "UTM dimensions require an Enterprise plan or the Web Analytics Plus add-on" when queried on November 2. Visits by referring site work. So the scorecard counts landings by referrer and uses the tags through Mixpanel.
- **Mixpanel only sees visitors who allow analytics.** The scorecard computes coverage each week (Mixpanel finished reports ÷ Sentry finished reports) and reads channel shares from Mixpanel, totals from Sentry.

### What this branch changed

Before this change, nothing after the landing page knew where a visitor came from: the Mixpanel setup deliberately blocks every campaign tag and the referrer (`property_blacklist` in `web/lib/analytics.ts`), so a finished report or a checkout couldn't be tied to a channel.

Now every consented event carries four first-touch properties: `entry_source`, `entry_medium`, `entry_campaign`, `entry_variant`.

- They come from our own campaign tags, but only when `utm_medium` is one of the six mediums below and each value is a short lowercase label. Someone else's tags, search terms (`utm_term`), and ad click IDs are dropped.
- An untagged visit keeps only the kind of site it came from (`google`/`organic`, `reddit`/`community`, `linkedin`/`social`, `chatgpt`/`ai`, `other`/`referral`), never the address or the search. Returning from Stripe checkout or a sign-in provider doesn't count as a new channel.
- The label sits in memory until the visitor allows analytics; then it's registered once with the Mixpanel SDK, so it's cleared with the rest of Mixpanel's storage on withdrawal. A later visit from another channel keeps the first one.
- Code: `visitEntry` in `web/lib/analyticsPolicy.ts`, `noteVisitEntry` in `web/lib/analytics.ts`, called from `components/privacy/AnalyticsLifecycle.tsx`.
- Tests: `tests/analytics-entry.test.ts` (the labels, the consent gate, and the channel on `page_viewed`, `report_started`, `report_completed`, `checkout_started`, `checkout_completed`), added to `npm run test:analytics-privacy`. In `tests/ui/privacy-checklist.spec.ts` (`npm run test:consent-ui`, in CI), a new browser test follows a tagged Reddit link through the real SDK to a finished mock report, and the existing search-terms test now checks the Google label.
- Privacy wording: the analytics row on `/security` and in the privacy policy now says it measures "which kind of site or link a visit came from" (`lib/legal/dataHandling.ts`), with the privacy date and the sitemap dates for `/privacy` and `/security` moved to November 2. `docs/analytics-consent.md` describes the change.

### The UTM convention

Every link we place carries `utm_source`, `utm_medium`, and `utm_campaign`; `utm_content` is optional. All values are lowercase letters, digits, hyphens, or underscores, up to 40 characters. Anything else is dropped.

| Tag | Meaning | Values |
| --- | --- | --- |
| `utm_medium` | The channel. Only these six are kept. | `social`, `community`, `partner`, `directory`, `cpc`, `email` |
| `utm_source` | Where the link sits | The platform (`linkedin`, `threads`, `x`, `reddit`, `quora`), the partner's short name (`northside-coaching`), or the directory (`alternativeto`) |
| `utm_campaign` | What the link is for | `bio`, a post id (`p01` to `p06`), a community (`r-resumes`), `outreach`, `clients`, `listing` |
| `utm_content` | Optional placement | `post`, `answer`, `profile`, `signature` |

Organic search and AI answers carry no tags; they're labeled from the referrer.

### Ready links

The base is `https://www.recruiterinyourpocket.com`.

| Channel | Placement | Link |
| --- | --- | --- |
| Social | LinkedIn Page website | `/?utm_source=linkedin&utm_medium=social&utm_campaign=bio` |
| Social | Threads bio | `/?utm_source=threads&utm_medium=social&utm_campaign=bio` |
| Social | X bio | `/?utm_source=x&utm_medium=social&utm_campaign=bio` |
| Social | Post 1 (six seconds), LinkedIn | `/research/how-recruiters-read?utm_source=linkedin&utm_medium=social&utm_campaign=p01` |
| Social | Post *n* on platform *p* | `/research/<slug>?utm_source=<p>&utm_medium=social&utm_campaign=p0<n>` (each post's link is in brand-drafts.md) |
| Community | Reddit profile | `/?utm_source=reddit&utm_medium=community&utm_campaign=profile` |
| Community | A Reddit answer that links (where allowed) | `/research/<slug>?utm_source=reddit&utm_medium=community&utm_campaign=r-<subreddit>&utm_content=answer` |
| Community | Quora (week 3) | `/research/<slug>?utm_source=quora&utm_medium=community&utm_campaign=answer` |
| Partner | Link in our outreach email | `/?utm_source=<partner>&utm_medium=partner&utm_campaign=outreach` |
| Partner | Link a partner shares with clients | `/?utm_source=<partner>&utm_medium=partner&utm_campaign=clients` |
| Directory | Any listing | `/?utm_source=<directory>&utm_medium=directory&utm_campaign=listing` |
| Paid | Google test | `/?utm_source=google&utm_medium=cpc&utm_campaign=resume-review-test&utm_content=<ad-group>` |
| Email | Brand email signature | `/?utm_source=signature&utm_medium=email&utm_campaign=hello` |

Spell partner and directory names the same way every time; the scorecard groups by them.

### One-time setup in Mixpanel (Matt, 15 minutes)

On the board the monitoring doc already describes, add a Funnels report: `page_viewed` or `research_article_viewed` → `report_started` → `report_completed` → `checkout_started` → `checkout_completed`, conversion window 14 days, broken down by `entry_medium`, then by `entry_source`. Save a second copy broken down by `entry_campaign` for posts and partners.

### One more source worth adding (not in this branch)

Ask people. A single optional question after a finished report, "Where did you hear about us?", with fixed choices (search, Reddit or a forum, a coach or school, LinkedIn, Threads or X, a friend, other), would count partners and word of mouth that no referrer shows, without depending on the analytics choice. It's a report-surface change, so it belongs to the report owner; the anonymous feedback store from the signature report work could hold it.

## What would change our mind

These are decision rules for the first 100 finished reports, judged on counts and stated in advance so a good week or a bad one doesn't rewrite them.

**Price.**

- If 50+ people finish a free report and 10+ start checkout but 1 or fewer buy, the price or the checkout's trust is the problem. Look at where they stop in Stripe, then test a smaller paid step (one more report) before lowering the pass.
- If 5 or more of the first 50 finishers buy, the price is probably low for the value. Hold it until 25 paid users (the decision memo's checkpoint), then test a higher price.

**Offer.**

- If 50+ finish and fewer than 3 even start checkout, the pass doesn't match the job. Most people want one read, not five reports in 30 days. Lead with the Re-check of a revised resume rather than a bundle.
- If many visitors hit the free limit wanting a second read the same week (Sentry `riyp.free_gate.check` blocked with `first_attempt:no`), demand for revision checks is real; market the Re-check before anything else.
- If partners say yes to clients but ask for volume, a partner pack (passes bought in bulk by a coach or bootcamp) becomes a real second offer.

**Positioning.**

- If directory and "resume checker" visitors arrive in numbers but rarely finish the report, while research and community visitors finish, the "see what a recruiter sees" position is right and the checker-seeking crowd is the wrong audience. Stop chasing ATS-shaped traffic.
- If community answers get engagement but the people they send don't finish reports, the voice works and the landing page doesn't. Fix the page before adding channels.
- If research readers finish reports at a higher rate than homepage visitors, lead with the research: it's the trust layer, and the plan should shift hours to search and to posting findings.
- If "who's behind this?" costs us partners or community trust repeatedly, anonymity has a price. Answer it with more visible evidence (the sample report, the methodology, the sources), not a name.
- If people describe the score as an ATS score or a prediction in replies and feedback, the decision memo's rule applies: make the number quieter.

## Decisions for Matt

1. **Hold every post and email until the anonymized site is live in production**, and the email, Stripe, and domain checks in "Before the first post" pass. *Recommendation: yes.* Each channel sends strangers to pages that name you today.
2. **The LinkedIn Page needs your personal profile as its hidden admin.** *Recommendation: create it, with no link from your profile and no invitations.* Admins aren't public, and the Page is what partners will look for. The alternative is to skip LinkedIn and lean on Threads and X.
3. **Partner trial passes through a 100%-off Stripe promotion code**, one pass per interested partner, model cost only. *Recommendation: yes, after a test-mode check.*
4. **Paid search test, $150 cap.** *Recommendation: not now.* Revisit after week 2 if organic channels produce fewer than 10 finished reports in total, and only under a company name, since Google's ads show the verified legal name.
5. **The privacy wording change in this branch** ("which kind of site or link a visit came from", privacy date November 2). *Recommendation: keep.* It describes the new channel labels plainly; reverting it should go with reverting the tracking.
