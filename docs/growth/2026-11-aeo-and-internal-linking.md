# Showing up in AI answers and in search: the plan

November 4, 2026. Written after investigating two posts Matt sent: an AEO agency's Juicebox case study (jam, @wespreadjam) and a founder's internal-linking video (Florian Darroman, distribb.io). Neither post's numbers could be verified, and both are marketing for the poster's own product. The methods behind them are sound, and this plan takes what applies to RIYP. It lands after the site-wide design rollout, so it never edits a page that rollout is rewriting.

Companions: [first-100-users.md](first-100-users.md) (channels, the anonymity gate), [brand-drafts.md](brand-drafts.md) (community answers), [../research-library-strategy.md](../research-library-strategy.md) (the answer-first article), [../competitive-intelligence/decision-memo.md](../competitive-intelligence/decision-memo.md).

## Where we stand, measured on November 4

Crawl of the 29-page sitemap on the merged homepage build, with the crawler described under "Measure":

- No orphan pages. Every public page is reachable from another public page.
- The graph is flat. 14 pages are linked from every page through the nav and footer: the product pages, the hubs, two research articles, the three resources, and the legal pages.
- The other 15 research articles get 2 to 7 inbound links each, nearly all from the research hub and the three "Next questions" rows under sibling articles. No article links to a sibling from inside its text. No product page links to a specific article. The Help page links none.
- Main has four comparison pages and a hub since November 3 (`/compare`, `/compare/topresume`, `/compare/jobscan`, `/compare/resume-worded`, `/compare/teal`, #48). One of them links one research article. No research article links back to a comparison.
- Structured data is already in place: Organization, WebSite, SoftwareApplication, Article with citations, BreadcrumbList. The sitemap carries real last-modified dates. Robots allows everything but API and internal routes.
- Nothing measures what ChatGPT, Claude, Perplexity or Google AI Mode say when someone asks about resume review tools.

What the AI engines say today, from a third-party tracker (Parse, 88 answers, July 7 to November 1, 2026, [source](https://www.parse.gl/prompts/p/which-ai-resume-tool-should-i-use--33139686-7e3d-4a1f-9733-b36c2b6fb704)): for "which AI resume tool should I use", Kickresume is named in 92% of answers, Rezi 78%, Teal 65%, Jobscan 34%, Enhancv 24%. RIYP is not named. The sources those answers cite are vendor blogs, zapier.com, reddit.com and youtube.com. That is the whole AEO problem in one table: the engines name the tools that comparison roundups and Reddit threads name.

## What the two posts get right, and what we skip

Keep:

- **Pages that answer the exact question a buyer asks an AI.** "Is Jobscan worth it", "Jobscan vs Teal", "which resume tool should I use". The compare pages are this. The gap is coverage: three of the five tools the engines name most have no page.
- **Third-party mentions.** Engines cite roundups, Reddit and YouTube before they cite a vendor. The brand channels in first-100-users.md (community answers as the brand, partners) are the way in, plus asking the roundup authors to include the report.
- **Internal links as the map of what matters.** The articles are the evidence behind the report. Linking them to each other and from the product pages tells crawlers and models the same thing the report says.
- **Watch the answers, not just the rankings.** A fixed prompt set, run on a schedule, is the only way to know if any of this works, and the only way to notice when a model change drops us.

Skip:

- **Our own "best resume tools" listicle ranking ourselves first.** The vendors doing this (VisualCV, StylingCV) rank themselves first and it reads that way. It would cost the trust the compare pages' "How we compare" note builds. The honest version already exists: the compare hub.
- **llms.txt as a lever.** The evidence says mainstream engines barely fetch it: 97% of llms.txt files got zero requests in a 137,000-domain log study, OpenAI's crawler fetched it 7 times against 3,990 robots.txt fetches across 83 sites, and PerplexityBot never did ([ppc.land summary](https://ppc.land/llms-txt-adoption-rises-8-8x-but-97-of-files-get-zero-ai-requests/), [coredna](https://signin.coredna.com/blogs/llms-txt-do-you-need-it)). It costs twenty minutes, so it is last on the list, with no expectation.
- **"Send this to your AI agent."** The distribb video shows a link graph before and after, with the orphan count rising from 124 to 218 and no traffic or ranking data. There is no prompt to send. The work is editorial: which page should cite which, and why.

## The plan, in order

### 1. Cross-link the research inside the text

One PR. Each article gets two or three in-sentence links to the sibling that holds the claim it leans on, placed where the reader would want the evidence, never as a "see also" list. Examples, from the articles' own text:

| Article | Links to, from the sentence about |
| --- | --- |
| spelling-errors-impact | writing-quality-hire-probability (the pattern penalty), how-recruiters-read (what the first pass catches) |
| resume-length-myths | how-recruiters-read (time on page one), quantifying-impact (what a second page earns) |
| ats-myths | human-vs-algorithm (who actually rejects), automation-and-bias, /compare/jobscan (the match-rate claim) |
| how-recruiters-read | spelling-errors-impact, resume-length-myths, quantifying-impact |
| gaps-and-pivots | who-you-are, star-method, social-screening |
| referral-advantage | linkedin-visibility, hiring-discrimination-meta-analysis |
| star-method | quantifying-impact, writing-quality-hire-probability |

The rest follow the same rule. The link text is the claim ("recruiters spend longer on the Experience block"), not the article title. Links go through the hub data (`components/research/ResearchHubData.ts`) so a renamed or retired article fails the build, the same way "Next questions" already does.

Product and trust pages link the article that backs their claim: `/sample-report` and `/pricing` where they describe the first read, the Help page's answers about scoring and ATS, and each compare page's "Is X worth it" section to ats-myths or human-vs-algorithm. The homepage keeps its one link per section and is not touched.

Done when: every research article has at least 4 inbound links from pages other than the hub and the footer, no article's body has more than four links, and the crawl script passes as a test.

### 2. Comparison pages for the tools the engines name

One PR per page or one for all three: Kickresume, Rezi, Enhancv. Same template and rules as #48: every price quoted from the tool's own pricing page on the day it was read, "How we compare" stating we have not run the tools on the same resume, the report's limits stated. Each page links the research that backs its claims and the research links back where the claim appears. Competitor notes already exist in `docs/competitive-intelligence/competitors/` for all three.

Then the compare hub gains the question people actually ask the engines, "Which resume tool should I use?", answered honestly: it depends on whether you need a builder, a keyword scanner, or a recruiter's read, with the report's limits in the answer.

### 3. A baseline of what the engines say, and a monthly reread

Not code. A fixed set of twelve prompts, run in ChatGPT, Claude, Perplexity and Google AI Mode, with the tools named and the sources cited written down in `docs/growth/ai-answers/2026-11.md`. Suggested prompts:

1. Which AI resume tool should I use?
2. Is Jobscan worth it?
3. Jobscan vs Teal
4. Best free resume review
5. How do recruiters actually read a resume?
6. Do recruiters really spend six seconds on a resume?
7. Should my resume be one page?
8. Will one typo on my resume cost me the interview?
9. Why am I not getting callbacks?
10. Is an AI resume checker accurate?
11. Resume Worded alternative
12. What does a recruiter look for in the first pass?

Prompts 5 to 8 and 12 are the research articles' own headlines. If the engines cite the article, the answer-first format is working; if they cite a reprint of the 2012 eye-tracking report instead, the article needs the study named higher. Matt runs this, since it needs his accounts; about an hour the first time. Parse's free prompt pages cover prompt 1 without an account.

### 4. Third-party mentions, brand-led

Runs alongside the channels plan, with the same anonymity rules. Three moves:

- **Roundup inclusion.** The pages the engines cite for "best resume review tools" are vendor and affiliate roundups ([VisualCV](https://www.visualcv.com/blog/best-ai-resume-checker-tools/), [Blaze](https://blaze.today/blog/ai-resume-review/), [Fueler](https://www.fueler.io/blog/best-ai-resume-review-tools-for-job-seekers), [cvowl](https://cvowl.com/blog/best-ai-resume-review-tools-compared-2026)). One email each from the brand address with the sample report and the free report, asking to be considered. No founder name. Expect most to want a fee or an affiliate link; decline those and note which.
- **Reddit answers as the brand**, already in first-100-users.md. The research articles are what to cite there, not the homepage: a link to "Will one typo cost me the interview?" in a thread about typos is useful; a link to the product is spam.
- **YouTube** is the one cited source we cannot use without a face or a voice. Parked until Matt decides whether a voice-only walkthrough of the sample report is acceptable.

### 5. The small things, last

Shipped November 5, 2026:

- `/llms.txt` (`web/app/llms.txt/route.ts`, built by `web/lib/seo/llms.ts`): the report pages, every research answer, the guides, and the compare pages, each as its hub answer or summary with the date its content last changed. Built from the same data the pages render, so it cannot drift from them or name a private route. No expectation, for the reasons above.
- `ItemList` structured data on `/research` and `/compare` (`itemListStructuredData` in `web/lib/seo/structured-data.ts`), listing each hub's pages in the order the page shows them, beside the breadcrumb trail.
- The price reread has a deadline: `web/tests/compare-prices.test.ts` fails when `PRICES_CHECKED` is more than 90 days old, or when a compare page's `updated` date is older than the reread. It runs with `test:search-foundation` and in the launch gate, so a release with stale prices stops there until the seven pricing pages are reread and the date moved.

## Measure

- **Internal links.** The crawl script (fetch `/sitemap.xml`, follow every internal `href` on each page, count inbound per page, list orphans and the pages linked from everywhere) becomes `scripts/internal-links.mjs` and a test that fails when a public page has fewer than 4 inbound links outside the nav and footer.
- **Search.** Search Console, which only Matt can open: impressions and clicks for the research questions and the compare pages, read monthly with the weekly scorecard.
- **AI answers.** The monthly prompt set above. The number that matters is how many of the twelve answers name RIYP or cite a RIYP page. Today it is zero.
- **Reports.** Finished free reports with a research or compare referrer, from the consented analytics (first-100-users.md explains the coverage adjustment).

## What this does not promise

No traffic, ranking or signup numbers are predicted here. The Juicebox post's figures (4,500 signups, +336% from ChatGPT) have no source outside the post, and the distribb video shows link counts, not outcomes. The plan is built so that in one month we have our own numbers instead.
