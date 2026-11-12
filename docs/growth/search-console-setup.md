# Search Console and Bing Webmaster Tools setup

Setup date: November 5, 2026. Times below use America/Denver (MST, UTC−07:00).

## Scope and account

Site: [Recruiter in Your Pocket](https://www.recruiterinyourpocket.com). The apex redirects to www.

Used Matt Shaw’s existing signed-in Google account in Chrome. No accounts or additional users were created. Site code was not changed. Vercel access was limited to the domain’s DNS dashboard, and no Vercel setting was changed.

## Verified properties and sitemaps

| Tool | Property and verification | Sitemap status | Discovered URLs | Dates shown |
| --- | --- | --- | --- | --- |
| Google Search Console | Existing Domain property `recruiterinyourpocket.com`; DNS verified | Success | 37 | Submitted and Last read: Nov 5, 2026 |
| Bing Webmaster Tools | Imported site `https://recruiterinyourpocket.com/`; verification inherited from GSC | Success | 37 | Last submit and Last crawl: Nov 5, 2026 |

Both tools accepted `https://www.recruiterinyourpocket.com/sitemap.xml`. Bing reports 1 known sitemap, 0 errors, and 0 warnings.

**November 12, 2026.** The sitemap was resubmitted in Google Search Console after an audit found Google had not re-read it since November 5: it now reports 48 discovered pages. Indexing was requested by hand for the pages Google had not indexed, the six research pillar pages and the comparison pages first. Google caps these requests each day, so the rest follow on later days.

**Bing gets changes without anyone asking.** A daily Vercel cron calls `/api/indexnow`, which sends Bing's IndexNow feed the pages in `PUBLIC_PAGES` that are new or whose `updated` date changed since the last send (`web/lib/seo/indexnow.ts`; the record of what was sent is in Redis, so an unchanged page is never sent twice). The first run sends every page. Google does not take part in IndexNow; a new page there still needs the sitemap and, when it matters, a manual request.

## Google Search Console

The existing `sc-domain:recruiterinyourpocket.com` Domain property was found at the start of this session. It covers the apex, www, other subdomains, and both HTTP and HTTPS; no URL-prefix property was created. Settings showed **You are a verified owner** and **Property added to account July 30, 2026**. A duplicate property was not created. Ownership verification showed **Domain name provider: Successfully verified** at approximately 15:14 MST. Users and permissions showed **Users (1)**, **Matt Shaw (you)**, **Owner Verified**, and **1–1 of 1**. No user was added.

[Performance report](https://search.google.com/search-console/performance/search-analytics?resource_id=sc-domain%3Arecruiterinyourpocket.com)

## Indexing request log

All 10 requests were accepted in the specified order. **No daily quota limit was reached**, so there was no quota stopping point. “Indexing requested” means Google accepted the URL into its priority crawl queue; it does not mean the page is already indexed.

| Order | URL | Result | Time (MST) |
| --- | --- | --- | --- |
| 1 | `https://www.recruiterinyourpocket.com/` | Indexing requested | 15:17 |
| 2 | `https://www.recruiterinyourpocket.com/research` | Indexing requested | 15:18 |
| 3 | `https://www.recruiterinyourpocket.com/compare` | Indexing requested | 15:19 |
| 4 | `https://www.recruiterinyourpocket.com/research/how-recruiters-read` | Indexing requested | 15:20 |
| 5 | `https://www.recruiterinyourpocket.com/research/spelling-errors-impact` | Indexing requested | 15:20 |
| 6 | `https://www.recruiterinyourpocket.com/research/resume-length-myths` | Indexing requested | 15:21 |
| 7 | `https://www.recruiterinyourpocket.com/research/ats-myths` | Indexing requested | 15:22–15:23 |
| 8 | `https://www.recruiterinyourpocket.com/compare/jobscan` | Indexing requested | 15:24 |
| 9 | `https://www.recruiterinyourpocket.com/compare/resume-worded` | Indexing requested | 15:25 |
| 10 | `https://www.recruiterinyourpocket.com/compare/kickresume` | Indexing requested | 15:26 |

## Bing Webmaster Tools

Signed in to the existing Bing account with the same Google account. Used **Import from Google Search Console**. Bing offered one site, `https://recruiterinyourpocket.com/`, with the Administrator role and 0 sitemaps. Imported that site; it appeared in the site selector and opened without a verification challenge. No separate DNS verification record was required.

Submitted the www sitemap directly because no sitemap came through the import. It moved from **Processing** with no URL count at 15:19 MST to **Success** with **37 URLs discovered** at approximately 15:20 MST.

### AI Performance, November 5, 2026

The **AI Performance BETA** report is available as its own item in the left navigation, next to Search Performance. The default 3 M range covers August 4 through November 3, 2026. Citation sources are **Microsoft Copilots and Partners**. It shows **Total Citations: 0** and **Avg. Cited Pages: 0**.

| View or feature | Observed availability |
| --- | --- |
| Grounding Queries | Available; “No data available,” 0 rows. Columns: Grounding Query, Intent, Topic, Citations, Citation Share. |
| Pages (cited pages) | Available; “No results found” / “No data available,” 0 rows. Columns: Page and Citations. |
| Compare | Offered as a time-range control. |
| Topics Portfolio beta | No separate Topics Portfolio offer, tab, or enrollment control appeared on either report view. A Topic column is present in Grounding Queries. |

[AI Performance report](https://www.bing.com/webmasters/aiperformance?siteUrl=https%3A%2F%2Frecruiterinyourpocket.com%2F) · [Cited pages](https://www.bing.com/webmasters/aiperformance?siteUrl=https%3A%2F%2Frecruiterinyourpocket.com%2F&activeTab=AIPagesReport)

These are the views and data available to this property today, not a claim about availability to all Bing accounts.

## DNS records

No DNS records were added in this session. The existing Google DNS record was confirmed in Vercel at approximately 15:13 MST and preserved:

| Name | Type | Value | TTL | When added |
| --- | --- | --- | --- | --- |
| Apex (`@`; blank Name in Vercel) | TXT | `google-site-verification=C_mZAjRFy9fhggnO3nKHfd1B_BSsR_RbsGtXsr3g4H8` | 60 seconds | Vercel shows Jul 30; GSC property addition date is July 30, 2026 |

[Vercel DNS dashboard](https://vercel.com/matts-projects-59b2b24d/~/domains/recruiterinyourpocket.com). The domain is connected to `rip-nextjs-frontend` on `matts-projects-59b2b24d`; Vercel shows the apex redirect to www.

## Screen change log

Times are approximate to the minute. Read-only navigation is distinguished from submissions and settings changes. Repeated visits to the same screen are grouped where appropriate. The indexing table above records each URL separately.

| Time (MST) | Screen | Action and observed result |
| --- | --- | --- |
| 15:08–15:10 | GSC Overview → Settings | Opened the existing Domain property. Settings showed verified ownership and the original July 30, 2026 addition date. No settings changed. |
| 15:10–15:11 | GSC Ownership verification | Opened ownership details and refreshed once when content stayed blank. No verification mutation performed. |
| 15:11 | Bing Webmaster Tools → Sign In | Chose Google sign-in. Google account chooser opened; authentication was not yet complete. |
| 15:11 | GSC Users and permissions | Opened the requested permissions screen; content initially remained blank. |
| 15:12 | GSC Users and permissions | Retried page load; content remained blank. No permissions changed. |
| 15:12 | Vercel domain dashboard | Opened the domain URL. A two-factor setup prompt appeared before DNS controls. Paused and asked the user to handle it. Neither available button was selected by the agent. The user handled the prompt and explicitly asked to continue; the DNS dashboard was visible on return. |
| 15:13 | Vercel DNS Records | After the user handled the prompt, read the existing apex Google TXT record. No DNS or other Vercel settings changed. |
| 15:13–15:14 | GSC Users and permissions → Ownership verification | Confirmed one user, Matt Shaw (verified owner), and successful Domain name provider verification. No settings changed. |
| 15:14–15:16 | GSC Sitemaps | Re-submitted `https://www.recruiterinyourpocket.com/sitemap.xml`. Confirmed “Sitemap submitted successfully,” followed by Success, 37 discovered pages, 0 discovered videos, and Nov 5 for Submitted and Last read. The prior row showed 30 discovered pages, last read Oct 27. |
| 15:15–15:16 | Bing Google sign-in / Home | Used the existing Matt Shaw Google account. Dismissed the Copilot introduction with Not now. The existing Bing account opened on its previously registered site. |
| 15:16–15:17 | Bing Add a site → Import from Google Search Console | Chose Import and the same Google account. Google showed Bing already had access to view Search Console data, the primary email, and associated personal info; continued using that existing permission. |
| 15:16–15:17 | GSC URL Inspection: homepage | Clicked Request indexing. Google confirmed “Indexing requested” and addition to a priority crawl queue. |
| 15:18 | GSC URL Inspection: `/research` | Google confirmed “Indexing requested.” |
| 15:18 | Bing Import site selection | Imported the single RIYP apex site listed from GSC, with Administrator role and 0 sitemaps. Selected the imported property and opened Sitemaps. |
| 15:19 | Bing Sitemaps → Submit sitemap | Submitted the full www sitemap URL. The row initially showed Processing. |
| 15:19 | GSC URL Inspection: `/compare` | Google confirmed “Indexing requested.” |
| 15:19–15:20 | Bing AI Performance | Opened Grounding Queries, Pages, then Grounding Queries again. Recorded available columns, zero citations, zero cited pages, and no results in either view. No settings changed. |
| 15:20 | GSC URL Inspection: `/research/how-recruiters-read` | Google confirmed “Indexing requested.” |
| 15:20 | Bing Sitemaps | Returned after processing. Confirmed Success, 37 URLs discovered, and Nov 5 for Last submit and Last crawl. No additional submission. |
| 15:20 | GSC URL Inspection: `/research/spelling-errors-impact` | Google confirmed “Indexing requested.” |
| 15:21 | GSC URL Inspection: `/research/resume-length-myths` | Google confirmed “Indexing requested.” |
| 15:22 | GSC URL Inspection: `/research/ats-myths` | Google confirmed “Indexing requested.” |
| 15:23 | GSC Sitemaps | Opened a separate report tab to save the Success / 37-page evidence. No additional submission. |
| 15:24 | GSC URL Inspection: `/compare/jobscan` | Google confirmed “Indexing requested.” |
| 15:25 | GSC URL Inspection: `/compare/resume-worded` | Google confirmed “Indexing requested.” |
| 15:25 | Bing AI Performance | Returned to the report and left it available in Chrome. No settings changed. |
| 15:26 | GSC URL Inspection: `/compare/kickresume` | Google confirmed “Indexing requested.” All 10 requested URLs were accepted without a quota error. |

## Repository verification

Only this file and `weekly-scorecard.md` changed. The scorecard now says **URLs indexed (of 37)** and links to this setup log below its Search Console table. Documentation link, URL-list, exact DNS transcription, wording, and whitespace checks passed. Application tests were not run because no application code changed.
