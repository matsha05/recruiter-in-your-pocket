# Weekly scorecard

The Monday read for [the first-100-users plan](first-100-users.md). Reading it takes two minutes; filling it takes about ten, and an agent can fill every row except Mixpanel and Search Console from read-only Vercel and Sentry access. Add each week as a new section at the top of the log, newest first.

## How to read it in two minutes

1. **Headline row: finished reports.** On pace means the total is at least 10 × the week number. Behind for two weeks running means the next week's hours go to whichever channel has the most finished reports.
2. **Channel rows.** Compare each one with its success and kill numbers in the plan's table. Make the call at week 2, then every two weeks. In between, just note the direction.
3. **One decision.** Every week ends with one line: what changes next week, or "no change".

Read counts, not rates, until a channel has 20 finished reports. Before that, one visitor moves a rate by several points.

## The template

**Week N** (Mon *date* to Sun *date*). Filled by *who*.

| Headline | This week | Last week | Since week 1 | Goal |
| --- | --- | --- | --- | --- |
| Finished reports, real people | | | | 100 by week 10 (about 10 a week) |
| Purchases | | | | 5 |
| Visitors | | | | |
| Finished reports ÷ visitors | | | | Replaces the plan's placeholders (1 in 6 homepage, 1 in 20 research) |
| Analytics coverage | | | | Share of finished reports that Mixpanel saw |

| Channel | Matt's hours | Visits (by referrer) | Finished reports (consented) | Status | Call at week 2, 4, 6... |
| --- | --- | --- | --- | --- | --- |
| Search | | | | | |
| AI answers | | | | | |
| Community | | | | | |
| Partners | | n/a (mostly email) | | | |
| Directories | | | | | |
| Social | | | | | |
| Direct or unknown | | | | | |

Status is one of: *on track* (at or above the success number's pace), *below*, *at kill* (at or under the kill line).

| Search Console | This week | Last week |
| --- | --- | --- |
| URLs indexed (of 37) | | |
| Impressions | | |
| Clicks | | |
| Top query we don't answer yet | | |

See [Search Console and Bing setup](search-console-setup.md) for verification, sitemap, and indexing-request records.

**Monthly:** [Search and AI-answer measurement](monthly-measurement.md).

**Our own runs to subtract:** *list any test reports or purchases by us.*

**One decision:** *one line.*

## Where each number comes from

| Number | Where | Notes |
| --- | --- | --- |
| Finished reports | Sentry, the [report outcomes query in monitoring.md](../launch-readiness/monitoring.md#1-report-generation-failures), last 7 days, `outcome:completed` | Every visitor, no analytics choice needed. Subtract our own runs |
| Purchases | Stripe → Payments, succeeded, last 7 days | Cross-check with Sentry `riyp.checkout.step step:entitlement_granted` |
| Visitors | Vercel → Analytics, production, last 7 days | Cookieless; excludes people who declined analytics or send Do Not Track or Global Privacy Control |
| Visits by channel | Vercel → Analytics → Referrers | Group the referring sites as below. Vercel Hobby can't break visits down by UTM tag |
| Finished reports by channel | Mixpanel, the saved funnel, last 7 days, `report_completed` broken down by `entry_medium` | Consenting visitors only. Partners and email show up only here |
| Analytics coverage | Mixpanel `report_completed` total ÷ Sentry finished reports | If coverage is low, a channel's Mixpanel count understates it by about the same share |
| Search Console rows | Search Console → Pages (indexed), Performance (last 7 days) | Data lags two to three days |
| Matt's hours | Matt | Actual, not planned |

**Referring sites by channel**

| Channel | Referring sites in Vercel | `entry_medium` in Mixpanel |
| --- | --- | --- |
| Search | google.com (and country domains), bing.com, duckduckgo.com | `organic` |
| AI answers | chatgpt.com, perplexity.ai, gemini.google.com, copilot.microsoft.com, claude.ai | `ai` |
| Community | reddit.com, out.reddit.com, quora.com | `community` |
| Partners | usually none (email) or the partner's site | `partner` |
| Directories | each listing's domain | `directory` |
| Social | linkedin.com, lnkd.in, threads.net, threads.com, t.co, x.com | `social` |
| Paid (if run) | google.com | `cpc` |
| Other sites | anything else | `referral` |

## Log

### Week 0 (baseline, before any posting)

| Headline | Value | Source |
| --- | --- | --- |
| Finished reports, real people | None recorded, October 27 to November 2 | Sentry `riyp.report.outcome` in production, read-only query on November 2. The counter shipped in #39; confirm it's deployed before reading zero as zero |
| Purchases | 0 since July 30 | monitoring.md baseline |
| Visitors | 37 (23 from google.com, 14 direct), October 25 to November 2, mostly us | Vercel page statistics, read-only query on November 2 |
| `/pricing` views | 10 from 7 visitors, October 26 to November 1 | monitoring.md baseline |
| Search Console | Not set up | |

**One decision:** hold all posting until the anonymized site is live in production; then start week 1.
