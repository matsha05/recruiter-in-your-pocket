# Search foundation audit

November 1, 2026. Branch `claude/search-foundation`, based on `claude/wave-2` (908f4c0c). Local only, not pushed.

The question: how do the public pages show up in search and when someone shares a link? Pricing gets about 10 visits a week. The research library (17 articles) and the offer guides should be the organic entry points, so most of the work is there.

## How this was checked

- **Live, read-only.** On Nov 1 I fetched 60 production URLs (every public page, the redirect stubs, old URLs, app routes, the share images), plus `sitemap.xml` and `robots.txt`, and pulled each page's title, description, canonical, Open Graph and Twitter tags, JSON-LD, h1s, image alt text, links, and status codes. Production matches `claude/wave-2` for everything below except the footer.
- **Local.** A production build (`next build --webpack`) of this branch, checked by `tests/ui/search-foundation.spec.ts` (every sitemap page, rendered) and `tests/search-foundation.test.ts` (registry, sitemap, robots, structured data), plus the checks listed under Verification.

Priorities: **P0** broken for the visitor, **P1** changes how a page appears in search or in a shared link, **P2** polish.

## What mattered most

1. **The sitemap had no dates, and the article dates were wrong.** `sitemap.xml` listed 32 URLs with only `changefreq` and `priority`, which Google ignores. Each research article's Article JSON-LD took both its published and modified date from a hidden `lastUpdated` string ("July 2026" on 10 of 17), although #35 corrected all 17 against their sources on Nov 1. Now one registry (`web/lib/seo/public-pages.ts`) holds each page's real dates from git history. The sitemap's `lastmod`, the JSON-LD, `article:modified_time`, and a new visible "Last updated November 2026" line under each article's description all read from it.
2. **Research titles were statements, not the questions people search, and most were cut off.** 12 of 17 article titles ran 62 to 76 characters with the site name, so results would truncate them. The new titles lead with the question each article answers ("Do recruiters only spend six seconds on a resume?") and stay within 60 characters. The site name is dropped when it doesn't fit, since Google shows the site name on its own line.
3. **Shared research links showed the homepage pitch.** Every page except the homepage shared the site card: "See what a recruiter sees" with a Critical Miss example about renewal-risk reviews. Now every article, both guides, the calculator, and the methodology share a card with the question the page answers and the hub's one-line answer, all text already sourced on the Research hub. Articles now say `og:type article`, and every page I touched has `og:url`.
4. **No Organization or WebSite structured data.** The homepage had SoftwareApplication and Person only. Every page now carries Organization (name, logo, support email, founder by @id) and WebSite, which Google uses for the site name in results.
5. **robots.txt hid the noindex on private pages.** It blocked `/auth`, `/signin`, `/reports`, `/settings`, `/purchase/` and others, so crawlers couldn't read their `noindex`. `/auth` is linked from every header, which is how a blocked page ends up "Indexed, though blocked by robots.txt". Only `/api/`, `/internal/`, `/playground/` and `/monitoring` (Sentry's tunnel) stay blocked.
6. **An old calculator URL 404s.** `/guides/comp-calculator` redirected to `/resources/comp-calculator`, which doesn't exist.

## Findings by page

| Page | Finding (live evidence) | Priority | What changed |
| --- | --- | --- | --- |
| All research articles (17) | Title 62–76 chars with suffix on 12 of 17; statements rather than searched questions. | P1 | New question-led titles ≤ 60 chars (table below). |
| All research articles | JSON-LD `datePublished` = `dateModified` = parsed hidden `lastUpdated` ("July 2026" → `2026-07-01T07:00Z`); "December 2025" on hiring-discrimination. No visible date. | P1 | Dates from `PUBLIC_PAGES` (published from git, updated Nov 1 for #35). Visible "Last updated" `<time>` under the description, styled like the legal pages' date. |
| All research articles | Article JSON-LD had no `url`, `image`, `mainEntityOfPage`; author and publisher were bare names. | P1 | Article now has url, image (its share card), `isPartOf` WebSite, author and publisher by Organization @id, and `citation` for each listed source. |
| All research articles | No BreadcrumbList. Visible "All research" back link. | P2 | Home › Research › article. |
| All research articles | `og:type website`, no `og:url`, generic site card. | P1 | `og:type article`, `og:url`, `article:published_time` / `modified_time`, answer card. |
| `/research/skills-first-promise-reality`, `/research/automation-and-bias` | Descriptions 64 and 75 chars, vague ("where adoption still lags"). | P2 | Rewritten from the article's own header text. |
| `/research/salary-history-bans` ↔ `/resources/offer-negotiation` | No research article linked to a guide. The offer guide's salary-history advice didn't link to the research. | P1 | Salary history now lists the offer guide first in related reading; the guide's "They ask what you make now" answer links to the salary-history studies. |
| `/research/gaps-and-pivots`, `/research/who-you-are` | Live crawl: gaps-and-pivots had one inbound link (the hub), who-you-are two. No page is a true orphan, because the hub links every article, but these two sat outside the related-reading web. | P2 | who-you-are now lists gaps-and-pivots, and star-method lists who-you-are, in related reading (all three are Story). |
| `/support` | Live crawl: 6 inbound links, none from research or guides, and not in the footer. | P2 | **Not changed.** The homepage session's grouped footer (4.10, `claude/friendly-herschel-134cdb`) links both guides directly, which fixes their weak inbound linking, and shows the support email; its Help column could add `/support` too. |
| `/research` | Title "Hiring research" (generic). h1 "The questions you're asking at 1 a.m." | P2 | Title "Resume and hiring research: the questions job seekers ask"; description leads with two of the hub's questions. h1 unchanged (hub copy). |
| `/methodology` | Same date problem as the articles ("October 2026", parsed); generic share card. | P1 | Registry dates, "How the report works" card, title names the score, Verdict, and Critical Miss. |
| `/resources/offer-negotiation` | No structured data; h1 text reads "Most offers have some room.Here's how to find it." to crawlers (block span, no space). | P1 | Article + BreadcrumbList, answer card, space restored in the h1. |
| `/resources/tech-offer-negotiation` | Title 65 chars; same h1 spacing ("tech offeryear by year"). | P2 | "How to negotiate a tech offer: base, bonus, equity, level"; Article + BreadcrumbList; space restored. |
| `/resources/tools/comp-calculator` | Title "Compare two offers side by side"; the tool compares up to five, including your current job. | P1 | Title and description say what it does; the hub's link text matches; BreadcrumbList. |
| `/guides/comp-calculator` | 308 → `/resources/comp-calculator` → **404**. | P0 | Direct 308 to `/resources/tools/comp-calculator` (and `/resources/comp-calculator` too). |
| `/guides` | Two hops: 308 → `/resources/` → 308 → `/resources`. | P2 | One hop. |
| `/extension` | Permanent 308 to `/workspace` while the extension is off, and `research-surface.spec.ts` treats it as retired. Browsers cache 308s, so if the extension ever comes back, switch to a 307 before relaunching. | P2 | Not changed (deliberate). Left out of the sitemap: the page is noindex until its store listing is public. |
| `/faq`, `/support` | No canonical. | P2 | Canonical, `og:url`, sharper titles and descriptions. |
| `/privacy` | Description "Privacy Policy for Recruiter in Your Pocket - how we handle…" | P2 | Says what the page covers: what we collect, why, who processes it, export and delete. |
| `/trust` | Description is a list of nouns ("data, security, billing controls, and product methodology"). | P2 | Follows the page's own intro and four sections. |
| `/trust`, `/terms`, `/faq` | Visible "Last updated September 4, 2026"; git shows content changes on Oct 31 (terms, FAQ) and Nov 1 (trust). `/privacy` says Oct 31; its processor wording changed Nov 1. | P2 | **Not changed** (legal dates are Matt's call). The sitemap uses the git dates. |
| `/resources` | Title "Career resources" (being renamed "After the offer"); no `og:url`. | P2 | **Not changed** (metadata is being edited by the homepage session). |
| `/` (homepage) | Title 72 chars, cut off in results. h1 is the story line ("They called someone back. It wasn't you."), so the title carries the search terms. No Organization or WebSite. | P1 | Organization + WebSite added from the root layout. Title **not changed** (file owned by the homepage session; see below). |
| `/sample-report` | Title "Sample report" says little in a result. Share image has no alt text. h1 is the report's verdict sentence. | P2 | **Not changed** (metadata is being edited by the homepage session; h1 belongs to the report components). |
| `/pricing` | Title "Pricing". Good OG title and description, but the share image has no alt text. No structured data of its own (the homepage SoftwareApplication carries both offers). | P2 | **Not changed** (pricing copy is being edited). |
| Report (`/workspace`, saved reports, sample) | No link from the report to `/methodology` or any research article. Research and guides reach the report through every article's CTA, but not the other way. | P1 | **Not changed** (report components are owned by the signature-report session). |
| robots.txt | Blocks noindexed pages (see above). Missing `/monitoring`. | P1 | Fixed. |
| Every page | No `<img>` without `alt` on any of the 60 URLs. One h1 on every public page. 404 page is noindex. | None | None needed. |
| Hosts | `http://recruiterinyourpocket.com` takes two hops (→ https apex → www). Trailing slashes 308 to the canonical. | P2 | Vercel domain setting; not changed. |

### Titles and descriptions

Search titles are the question or task the page answers. The visible headlines are unchanged. Every description stays inside what the page's own header, key finding, or FAQ already says; no new numbers.

| Page | Before (live) | After |
| --- | --- | --- |
| ats-myths | What applicant tracking systems actually do | Does an ATS reject your resume? What parsing really does |
| automation-and-bias | Where automation enters hiring | Where automation and bias enter the hiring process |
| gaps-and-pivots | Gaps, pivots, and short stints | Should you explain a resume gap? What experiments found |
| hiring-discrimination-meta-analysis | Discrimination in hiring hasn't gone away | Racial discrimination in hiring: what field experiments show |
| how-recruiters-read | What recruiters notice in the first pass | Do recruiters only spend six seconds on a resume? |
| human-vs-algorithm | What recruiters trust and what they follow | Do recruiters follow AI advice when screening resumes? |
| linkedin-visibility | What makes a LinkedIn profile easier to find | How recruiters search LinkedIn, and what you can control |
| quantifying-impact | Show what changed and your part in it | How to write resume bullets that show results |
| referral-advantage | What a referral changes | Do job referrals really help? What hiring data shows |
| resume-length-myths | There is no universal one-page rule | Should a resume be one page? What the research says |
| salary-history-bans | Should you share your salary history? | Should you share your salary history? What studies found |
| skills-first-promise-reality | Skills-first hiring: the promise and the practice | Skills-based hiring: do degree cuts change who gets hired? |
| social-screening | How public social cues changed candidate ratings | Does your social media affect hiring? What one study found |
| spelling-errors-impact | How spelling errors changed recruiter ratings | Do resume typos matter? An experiment with 445 recruiters |
| star-method | Tell the story behind the line | How to use the STAR method on your resume and in interviews |
| who-you-are | Can a recruiter tell who you are? | Can a recruiter tell who you are from your resume? |
| writing-quality-hire-probability | Writing help led to more hires in one experiment | Does better writing get you hired? One field experiment |
| /methodology | How the Report Works | How the resume report works: score, Verdict, Critical Miss |
| /research | Hiring research | Resume and hiring research: the questions job seekers ask |
| /resources/offer-negotiation | How to negotiate a job offer | How to negotiate a job offer (description rewritten) |
| /resources/tech-offer-negotiation | How to read and negotiate a tech offer | How to negotiate a tech offer: base, bonus, equity, level |
| /resources/tools/comp-calculator | Compare two offers side by side | Job offer comparison calculator: salary, bonus, equity |
| /faq | FAQ | FAQ: the free report, files, privacy, and pricing |
| /support | Support | Get help with a report, sign-in, or billing |
| /trust | Trust and Security | Trust: your data, billing, and reports |
| /security | Security and Data Handling | Security and data handling |

Privacy and Terms keep their titles.

## For the owners of files this audit didn't touch

- **Homepage (`app/(marketing)/page.tsx`, homepage session).** The title is 72 characters with the suffix and gets cut off. Suggest `title: { absolute: "See what a recruiter sees: free resume report" }` (45), which also matches the share title's sentence case. Optionally point the SoftwareApplication at the site publisher: `publisher: { "@id": "https://www.recruiterinyourpocket.com/#organization" }`. The Person entry stays the one place the founder is described; the site Organization only references it by `#matt-shaw`, so keep that @id if the entry changes. `tests/ui/homepage-seo.spec.ts` now picks the homepage's own JSON-LD script by its SoftwareApplication text, because the layout adds a second script.
- **Sample report (`app/(marketing)/sample-report/page.tsx`).** Suggest the search title "Sample resume report: a complete example" (`absolute`, 40 chars). The h1 is the report's verdict sentence, which is right for the report but says nothing in search; a visually quiet h1 such as "Sample report: Jordan, a fictional candidate" with the verdict as the lead paragraph would fix it. That's a report-component change (`web/components/workspace/report/*`).
- **Pricing (`app/(marketing)/pricing/page.tsx`).** Suggest the search title "Resume report pricing: first report free, five more for $29" (`absolute`, 59), if the pricing session agrees. Give the share image an alt (pass `{ url, width: 1200, height: 630, alt }` instead of a bare string); the same applies to the sample report.
- **After the offer index (`app/(editorial)/resources/page.tsx`, `guides/page.tsx`, homepage session).** "After the offer" works as a label but nobody searches for it. Suggest the search title "Job offer negotiation guides and an offer calculator", visible label unchanged. The page also has no `og:url`; switching its metadata to `pageMetadata({ path: "/resources", title, description })` fixes both and drops it from the spec's exception list. The breadcrumbs in the guides' JSON-LD already say "After the offer" (`SECTION_NAMES` in `web/lib/seo/site.ts`), to match that session's rename; the visible breadcrumb on `claude/wave-2` still says "Resources" until that branch merges.
- **Report components (signature-report session).** Link the report to the research behind it: the score to `/methodology`, a Critical Miss about missing results to `/research/quantifying-impact`, a gap or pivot to `/research/gaps-and-pivots`. This is the one missing direction of research ↔ guides ↔ report.
- **Dead routes.** `app/(editorial)/guides/*/page.tsx` can't be reached (next.config redirects `/guides/*` first) but still carry metadata, and `/resources/*` renders their components. Moving the components under `/resources` is a cleanup for after the IA settles.

## Questions for Matt (sent to the coordinator)

**Search titles that differ from the headline.** The research article standard said one title serves the hub, the H1, and the metadata. This branch keeps the H1s and hub titles as they are, but gives search results the question each article answers ("Should a resume be one page? What the research says" for "There is no universal one-page rule"), and updates `article-standard.md` to say so. Recommendation: keep it. The headlines are good editorial lines, but nobody searches "there is no universal one-page rule", and 12 of them were cut off in results. Reverting is one line per page.

**Who wrote the research.** Research articles have no byline, so their Article author is the organization. A named, accountable reviewer is a strong trust signal for this kind of page. If Matt reviews each article, the honest version is a visible "Reviewed by Matt Shaw" line and `reviewedBy` / `author` Person markup. If he doesn't, keep the organization. Recommendation: keep the organization until he confirms.

## Keeping it right

- **`web/lib/seo/public-pages.ts`** is the list of pages in search. Add a page there or the guard test fails. Bump `updated` in the same change as a content edit (a corrected claim, a new section, a changed price); styling doesn't count, and it is never the build date.
- **`app/(editorial)/research/article-standard.md`** now describes the search title, the `path` prop, and the registry dates.
- **`pageMetadata()`** (`web/lib/seo/metadata.ts`) sets the title (suffix only when it fits), description, canonical, Open Graph, and Twitter in one call. Pass `type: "article"` for articles and guides.
- **Share cards** (`/og/research/[id]`) render from `ResearchHubData.ts`. If an article's hub answer changes, its card changes with it.
- **`tests/search-foundation.test.ts`** (`npm run test:search-foundation`, now in CI) fails on: a public page missing from the registry, a redirect or noindex page in the sitemap, a future or malformed date, a title over 60 characters or a duplicate title or description, a canonical that doesn't match the route, robots.txt hiding a noindex, or a card that isn't the page's hub answer.
- **`tests/ui/search-foundation.spec.ts`** (in the CI browser job) renders every sitemap page and checks one h1, unique titles and descriptions, canonical = `og:url`, a 200 PNG share card, alt text, JSON-LD that parses, Article headline = h1, breadcrumbs ending at the canonical, FAQPage questions visible on the page, the redirects, and noindex on app routes.

## Google Search Console: what Matt needs to check

No agent has access, so these are for Matt. Do steps 1 and 6 before this ships, so there's a baseline.

1. **Property.** Use a Domain property (DNS TXT record) for `recruiterinyourpocket.com`, so www, apex, http, and https are one property.
2. **Sitemap.** Sitemaps → submit `https://www.recruiterinyourpocket.com/sitemap.xml`. After the deploy, it should read "Success" with 32 discovered URLs and a last-read date after the deploy.
3. **Page indexing.** Indexing → Pages. Expected "not indexed" reasons: *Excluded by noindex* (workspace, sign-in, status, purchase, settings), *Page with redirect* (`/guides/*`, old research slugs, `/research/how-we-score`), *Not found (404)* (old app URLs). Watch for:
   - *Indexed, though blocked by robots.txt*: should clear within a few weeks of the robots change.
   - *Duplicate without user-selected canonical* or *Google chose different canonical*: shouldn't appear; inspect any that do.
   - *Crawled, currently not indexed* or *Discovered, currently not indexed* on research articles: the signal that matters most for organic growth. Note which articles.
4. **URL Inspection.** Inspect `/`, `/research/how-recruiters-read`, and `/resources/offer-negotiation`. Check that the user-declared and Google-selected canonicals match. Run *Test live URL* and confirm the rendered HTML has the JSON-LD. Then *Request indexing* for those three, plus `/research` and `/methodology`.
5. **Rich results.** Search Console has a Breadcrumbs report under Enhancements, which should list the research articles and guides within a few weeks. It has no Article report, so run two article URLs and the homepage through the Rich Results Test (search.google.com/test/rich-results). Google limits FAQ rich results to government and health sites, so FAQPage markup won't show in results; that's expected.
6. **Performance baseline.** Performance → Search results, last 3 months, Pages filter "contains /research/" and then "contains /resources/". Export queries and pages with impressions, clicks, CTR, and position. Re-check about four weeks after the deploy, comparing the new titles with the queries they target (six seconds, one page, typos, salary history, negotiate a job offer, STAR method).
7. **Site name.** Search `recruiterinyourpocket.com` on Google after recrawl and confirm results show "Recruiter in Your Pocket" as the site name.
8. **Crawl stats.** Settings → Crawl stats: the share of 404 and redirect responses should drop after the calculator redirect fix.
9. **Share previews.** Not Search Console, but the same day: paste a research URL into LinkedIn's Post Inspector and Facebook's Sharing Debugger to refresh their cached cards.

## Verification

Local results on this branch are below. Nothing here is deployed; hosted checks wait for the batch PR's preview and production.

All on commit `c11b0fb9`, locally:

- `npx tsc --noEmit`, `npm run lint` (zero warnings): pass.
- `npm run qa:design-system`: pass. The new card route is on the same Satori allowlist as the other two share cards, since ImageResponse needs literal colors.
- `npm run test:research-figures`, `test:sample-report`, `test:client-bundle`: pass.
- `npm run test:search-foundation`: pass (32 pages, 28 titles). I broke it on purpose five ways: a duplicated title, a page missing from the registry, a future date, robots.txt blocking `/auth`, and a wrong canonical. It failed each time.
- `next build --webpack` with CI's dummy environment: pass. Against `next start` on that build, Playwright ran `search-foundation`, `homepage-seo`, `research-surface` (including the axe scans of the hub and every article), `editorial-surfaces`, and `page-weight`: 33 passed.
- By eye: six share cards (two articles, the skills-first card with curly quotes, a guide, the calculator, methodology), and the article header at 1440 and 390 px, with no horizontal overflow. `/og/research/<unknown>` returns 404.
- Local `sitemap.xml`: 32 URLs, each with its content date. Local `robots.txt`: blocks only `/api/`, `/internal/`, `/playground/`, `/monitoring`.

Not verified: anything hosted. After the batch deploys, re-fetch `sitemap.xml`, `robots.txt`, one article and one share card from production, then run the Search Console steps above.

Found in passing, not changed: on phones the research meta row ("Recruiter attention / 5 min read / 2 peer-reviewed studies…") wraps with a separator left dangling at the line end. That predates this branch.
