# Sentry production evidence: Recruiter in Your Pocket

Collected 2026-11-02 (UTC, ~21:30). Read-only. Org `recruiter-in-your-pocket`, region `https://us.sentry.io`. Nothing was resolved, assigned, or updated.

Window: last 30 days (2026-10-03 to 2026-11-02) unless noted. Every section lists the exact query the Sentry MCP agent executed and the raw numbers it returned. Sections that came back empty are marked **EMPTY**.

Two caveats that apply to everything below:

1. **Span/transaction counts are sampling-extrapolated.** The error event's trace context shows `client_sample_rate: 0.1` (10% tracesSampleRate). Nearly every span count comes back as a multiple of 10 (10, 20, 30, 60, 100...). Treat `count()` on spans as "≈10x sampled events". `count_unique(trace)` is a real count of sampled traces and is the better proxy for sessions.
2. **`user.geo` on server-side transactions and error events is the Vercel function's IP, not the visitor's.** Proof: trace `bb7156f41c6b4cb8803013c5a5a3bdeb` has the browser pageload `/workspace` geo-tagged `Monument` (client) while the server spans it triggered (`GET /api/free-status`, `POST /api/parse-resume`) in the same trace are tagged `Ashburn` (Vercel `iad1`). So "Ashburn" on error events JAVASCRIPT-NEXTJS-13/14 says nothing about where the person was. No `user.id`, `user.email`, or `user.ip_address` is set on any event (all `count_unique(user.*)` = 0), so Sentry cannot count distinct users at all.

---

## 1. Projects

Query: `find_organizations()` then `find_projects(organizationSlug='recruiter-in-your-pocket')`

| Project slug | Platform (from events) | Notes |
| --- | --- | --- |
| `javascript-nextjs` | SDK `sentry.javascript.nextjs`; error events all `platform: node`; browser side emits pageload/navigation spans and web vitals | Only project in the org. Project ID 4510598790774784. |

Query: `search_errors(query='count of errors grouped by platform and sdk.name over the last 90 days', period='90d')`
Result: `sdk.name=sentry.javascript.nextjs, platform=node, count()=15`. **Zero browser-platform error events in 90 days.**

---

## 2. Issues (last 30 days, and 90-day check)

Query A: `search_issues(query='lastSeen:-30d', sort='freq', limit=100, period='30d')`
Query B: `search_issues(query='status:[resolved,ignored,unresolved]', sort='freq', limit=100, period='90d')`
Both return the same **3 issues**. There are no other issues in the org in 90 days (resolved/ignored included).

Dashboard: https://recruiter-in-your-pocket.sentry.io/issues/?query=lastSeen%3A-30d

### Issue table

| ID | Title | Culprit | First seen | Last seen | Events (30d / lifetime) | Users | Level | Status / substatus | Release | Side | Path class |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| JAVASCRIPT-NEXTJS-14 | Error: The report did not pass its evidence check. Please try again. | `POST /api/resume-feedback-stream` | 2026-10-30T08:09:16Z | 2026-10-31T11:17:23Z | 9 / 9 | 0 | error | unresolved / new | e05da605d947c0b992022896d914e469dcc803ea | server (node) | **Report-generation path** (stream route, LLM output validation) |
| JAVASCRIPT-NEXTJS-13 | Error: Failed to find Server Action. This request might be from an older or newer deployment. | `POST /(marketing)/page` | 2026-09-22T21:35:46Z | 2026-10-16T11:49:23Z | 6 / 11 | 0 | error | unresolved / ongoing | e05da605d947c0b992022896d914e469dcc803ea | server (node, Next.js runtime) | **Noise: deployment skew** (stale tab posting a Server Action ID to a newer deploy) |
| JAVASCRIPT-NEXTJS-15 | RIYP launch: INP p75 on paid-journey pages | (metric alert, category `metric`, platform `python`) | 2026-11-01T18:48:44Z | 2026-11-01T18:48:44Z | 1 / 1 | 0 | error | **resolved** | n/a | browser web vital alert | Perf alert, not an exception; see section 5 |

Browser/client issues: **none**. Server/API issues: 13 and 14. Bots / extensions / ad blockers / hydration: **none captured as issues** (Sentry is filtering web-crawler spans at ingest; see section 6).

### Issue detail: JAVASCRIPT-NEXTJS-14 (report-generation path)

Query: `get_sentry_resource(resourceType='issue', resourceId='JAVASCRIPT-NEXTJS-14')`
Latest event `c57716c7bed34162af882eefc3e0b096` at 2026-10-31T11:17:23.646Z.

Stack (first-party frames):
```
web/app/api/resume-feedback-stream/route.ts:385:35 (stream.start)
    const validated = await validateResumeStreamOutput({
web/./lib/llm/validateResumeStreamOutput.ts:133:9 (validateResumeStreamOutput)
    const validationError = new Error("The report did not pass its evidence check. Please try again.") as Error & { code: string };
    validationError.code = "OPENAI_RESPONSE_SHAPE_INVALID";
    throw validationError;
```
HTTP: `POST https://www.recruiterinyourpocket.com/api/resume-feedback-stream`
Tags: `error_code=OPENAI_RESPONSE_SHAPE_INVALID`, `riyp.operation=generation.resume_feedback_stream`, `handled=yes`, `mechanism=generic`, `environment=production`, `release=e05da605...`, `browser=Chrome 156`, `client_os=macOS`, `os=Linux` (server), `runtime=node v24.22.2`, `server_name=169.254.60.77`, `cloud.region=iad1`, trace `2622eb91d6f74d9c9f481628ea9b4df1` (`client_sample_rate: 0.1`).
Trace lookup: `get_sentry_resource(resourceType='trace', resourceId='2622eb91d6f74d9c9f481628ea9b4df1')` -> **0 spans, 1 error** (the stream request was not sampled for tracing).

All 9 events (Query: `search_issue_events(issueId='JAVASCRIPT-NEXTJS-14', period='30d')`):

| # | Timestamp (UTC) | browser | client_os |
| --- | --- | --- | --- |
| 1 | 2026-10-30T08:09:16Z | Chrome 156 | macOS |
| 2 | 2026-10-30T08:12:32Z | Chrome 156 | macOS |
| 3 | 2026-10-30T08:22:44Z | Chrome 156 | macOS |
| 4 | 2026-10-30T08:26:37Z | Chrome 156 | macOS |
| 5 | 2026-10-30T08:31:24Z | Chrome 156 | macOS |
| 6 | 2026-10-30T21:36:06Z | (blank) | (blank) |
| 7 | 2026-10-30T21:37:30Z | Chrome 152.0.7977 | macOS |
| 8 | 2026-10-30T21:39:23Z | Chrome 152.0.7977 | macOS |
| 9 | 2026-10-31T11:17:23Z | Chrome 156 | macOS |

Tag distributions (Query: `get_issue_tag_values(issueId='JAVASCRIPT-NEXTJS-14', tagKey='browser'|'client_os')`): browser `Chrome 156` x6, `Chrome 152.0.7977` x2, blank x1; client_os `macOS` x8, blank x1.
Three tight bursts (5 events in 22 min, 3 events in 3 min, 1 single) from two Chrome builds on macOS. Zero events after 2026-10-31T11:17Z, i.e. none on any release after e05da605 (9c4eaada went to production 2026-11-01T15:07Z).

Dropped alongside: `find_dropped_events(dataset='errors', statsPeriod='30d')` shows 2 `client_discard / network_error` errors on 2026-10-30 (and 1 on 2026-10-16). Accepted: 6 on Oct 16, 8 on Oct 30, 1 on Oct 31. So on Oct 30 there were likely 10 evidence-check failures, 8 captured.

### Issue detail: JAVASCRIPT-NEXTJS-13 (noise: deployment skew)

Query: `get_sentry_resource(resourceType='issue', resourceId='JAVASCRIPT-NEXTJS-13')`
Message: `Failed to find Server Action. This request might be from an older or newer deployment. Read more: https://nextjs.org/docs/messages/failed-to-find-server-action`
Stack: Next.js runtime only (`/var/task/web/___next_launcher.cjs:224:7 handler` -> `app-page-runtime.js`); no first-party frame. `mechanism=auto.function.nextjs.on_request_error`, `handled=no`.
HTTP: `POST https://www.recruiterinyourpocket.com/index`; nextjs context `router_path=/(marketing)/page`, `route_type=render`.
Tags: `browser=Safari 26.2`, `client_os=Mac OS X >=10.15.7`, `runtime=node v24.19.0`, `release=e05da605...` (First Seen for this issue was 2026-09-22, i.e. before e05da605's production deploy; the 6 in-window events are all on e05da605).
All 6 in-window events: 2026-10-16T11:48:49Z, 11:48:55Z, 11:49:07Z, 11:49:12Z, 11:49:15Z, 11:49:23Z (34 seconds, one Safari client). `get_issue_tag_values(tagKey='url')`: `https://www.recruiterinyourpocket.com/index` x5, blank x1. `tagKey='browser'`: `Safari 26.2` x6.
Classification: a Safari tab holding a pre-deploy page submitted a Server Action after a new deployment. Not a report-path defect. Could be recategorised as expected post-deploy noise; it has not recurred in 17 days.

### Issue detail: JAVASCRIPT-NEXTJS-15 (metric alert)

Query: `get_sentry_resource(resourceType='issue', resourceId='JAVASCRIPT-NEXTJS-15')`
Metric alert "RIYP launch: INP p75 on paid-journey pages". Evaluated value **1616** against thresholds "above 500, above 200". Fired 2026-11-01T18:48:44Z, status resolved, 1 occurrence. Section 5 shows the single 1616 ms INP sample came from `browser.name=Chrome` (max of 30 Chrome INP samples); HeadlessChrome's max INP was 8 ms, so this was not the headless gate.

### Error events: full 30-day list

Query: `search_errors(query='error events in the last 30 days with timestamp, message, title, ...', period='30d', limit=50)` -> **15 events total**, all `platform=node`, all `environment=production`, all `release=e05da605d947c0b992022896d914e469dcc803ea`: 9 x evidence-check (above) + 6 x Server Action (above). Nothing else.

Query: `search_errors(query='count of errors, count of distinct users, grouped by release over the last 30 days')` -> `release=e05da605..., count()=15, count_unique(user.id)=0`.

Query: `search_errors(query='count of errors per day over the last 90 days grouped by platform', period='90d')` -> daily buckets: 2026-10-16: 6, 2026-10-30: 8, 2026-10-31: 1, all other days 0. Total 15. Sentry reported 3 dropped (12.5%), reason `network_error`.

Query: `search_errors(query='errors whose message contains severity or repair or generation or stream in the last 30 days, grouped by title with count')` -> Sentry query `message:[*severity*,*repair*,*generation*,*stream*]` -> 1 row: `Error: The report did not pass its evidence check. Please try again.` count 9. No "severity" or "repair" error messages exist.

---

## 3. Launch counters (metrics and logs)

### Metrics

| Query | Executed Sentry query | Result |
| --- | --- | --- |
| `search_metrics('riyp.severity.outcome counts grouped by outcome over the last 30 days')` | `metric.name:riyp.severity.outcome` grouped by `outcome` | **EMPTY. The metric `riyp.severity.outcome` has never been received.** |
| `search_metrics('count of riyp.report.outcome grouped by outcome in production over the last 30 days')` | `metric.name:riyp.report.outcome AND sentry.environment:production` | **EMPTY in `production`.** |
| `search_metrics('sum of riyp.report.outcome counter grouped by outcome, sentry.environment and sentry.release ... (no environment filter)')` | `metric.name:riyp.report.outcome AND metric.type:counter` | 2 rows: `outcome=completed` sum 1; `outcome=failed` sum 1. Both `sentry.environment=monitoring-verification`, `sentry.release=monitoring-verification`. |
| `search_metrics('count of llm.response.repair_failed over the last 30 days')` | `count(value,llm.response.repair_failed,counter,-)` | **0** (metric name resolves, zero samples). |
| `search_metrics('sum of riyp.report.repair counter grouped by outcome, result, reason and sentry.environment')` | `metric.name:riyp.report.repair AND metric.type:counter` | 1 row: `result=failed`, env `monitoring-verification`, sum 1. |
| `search_metrics('sum of riyp.free_gate.check counter grouped by ... (outcome, result, reason, status)')` | `metric.name:riyp.free_gate.check AND metric.type:counter` | 2 rows: `result=blocked, reason=network` sum 1; `result=allowed, reason=none` sum 1. (env not grouped here; the samples below are all `monitoring-verification`.) |
| `search_metrics('sum of riyp.checkout.step counter grouped by step, outcome, result and sentry.environment')` | `metric.name:riyp.checkout.step AND metric.type:counter` | 2 rows: `step=purchases_disabled` sum 1; `step=checkout_started` sum 1. Both env `monitoring-verification`. |
| `search_metrics('metric samples excluding browser.web_vital.* in the last 30 days')` | `!metric.name:browser.web_vital.*` | **7 samples total, all at 2026-11-01T18:31:16Z** (within 17 ms of each other): `riyp.checkout.step` x2, `riyp.free_gate.check` x2, `riyp.report.repair` x1, `riyp.report.outcome` x2. |
| `search_metrics('metric samples where metric.name starts with riyp. or llm. or report or generation in the last 90 days')` | `metric.name:riyp.* OR metric.name:llm.* OR metric.name:report* OR metric.name:generation*` | 1 sample shown (`riyp.free_gate.check` at 2026-11-01T18:31:16Z); same 7-sample burst. |
| `find_dropped_events(dataset='metrics', statsPeriod='30d')` | n/a | `droppedEvents: []`; accepted `trace_metric` = **7**, all in the 2026-11-01 bucket. |

Interpretation (confirmed by the data): every custom `riyp.*` counter Sentry has ever received arrived in one burst at 2026-11-01T18:31:16Z, tagged `environment=monitoring-verification` / `release=monitoring-verification` (a release created 2026-11-01T20:40:04Z with no deploys and no commits). That is a one-off instrumentation smoke test, not product traffic. **In `production`, zero `riyp.report.outcome`, `riyp.severity.outcome`, `riyp.report.repair`, `riyp.free_gate.check`, or `riyp.checkout.step` counters have been recorded in 30 days.** `riyp.severity.outcome` does not exist under any environment. `llm.response.repair_failed` is 0 everywhere.

Over-time breakdown: not possible; only one timestamp exists.

Metrics the project does emit in production: `browser.web_vital.inp`, `.lcp`, `.fcp`, `.cls`, `.ttfb` (distributions). Query: `search_metrics('any metric rows in production in the last 30 days')` -> `sentry.environment:production` -> 50 most recent samples are all `browser.web_vital.*`, newest 2026-11-02T20:56:47Z.

### Logs

| Query | Executed Sentry query | Result |
| --- | --- | --- |
| `search_logs('logs mentioning riyp.severity.outcome or riyp.report.outcome or repair_failed in the last 30 days')` | `message:["*riyp.severity.outcome*","*riyp.report.outcome*","*repair_failed*"]` | **EMPTY** |
| `search_logs('count of all logs grouped by severity over the last 30 days')` | `(empty)` grouped by `severity` | **EMPTY** |
| `search_logs('most recent 20 log entries of any severity in the last 90 days', period='90d')` | `(empty)` | **EMPTY** |

**Sentry Logs has received zero log lines from this project in 90 days.** Either `enableLogs` is off in the SDK config or nothing calls `Sentry.logger`. Any "launch counter" that was supposed to be a structured log is not landing in Sentry.

---

## 4. Session replays

Query: `search_replays(query='all replays in the last 30 days', period='30d', limit=100)` -> Sentry query `(empty)`, sort `-started_at` -> **EMPTY. No replays found.**
Dashboard: https://recruiter-in-your-pocket.sentry.io/explore/replays/?sort=-started_at&statsPeriod=30d
Replays appear not to be enabled (no `replayIntegration`, or sample rates of 0). Count, pages, errors-in-replay, device breakdown: **not available**.

---

## 5. Traces and performance

### Server (http.server) transactions, 30 days

Query: `search_traces('count, p50, p95, max span.duration of http.server transactions grouped by sentry.segment.name, sorted by count descending, last 30 days')` -> `span.op:http.server AND is_transaction:true`

| Transaction | count() (extrapolated) | p50 ms | p95 ms | max ms |
| --- | --- | --- | --- | --- |
| GET /workspace | 1411 | 5.4 | 144.0 | 538.5 |
| GET /pricing | 1167 | 5.7 | 186.9 | 631.9 |
| GET /sample-report | 1029 | 5.2 | 286.8 | 722.4 |
| GET middleware GET | 100 | 6.7 | 219.7 | 219.7 |
| GET /api/free-status | 65 | 77.3 | 917.7 | 1204.7 |
| GET /api/generation-status | 21 | 29.5 | 51.2 | 52.0 |
| GET /.well-known/security.txt | 20 | 111.9 | 123.6 | 123.6 |
| GET /reports | 15 | 4.6 | 23.1 | 23.6 |
| GET /api/status | 10 | 726.5 | 726.5 | 726.5 |
| POST /api/parse-resume | 10 | 221.0 | 221.0 | 221.0 |
| GET /api/passes | 9 | 302.9 | 1001.9 | 1001.9 |

**Report-generation route (`POST /api/resume-feedback-stream`): no transaction data at all.**
Query: `search_traces('spans where transaction contains "resume-feedback" or span.description contains "resume-feedback" in the last 30 days')` -> `(sentry.segment.name:"*resume-feedback*" OR span.description:"*resume-feedback*")` -> **EMPTY**.
Query: `search_traces('transactions where http.request.method is POST ...')` -> `is_transaction:true AND http.request.method:POST` -> only `middleware POST` (10) and `POST /api/parse-resume` (10). No `/api/resume-feedback-stream`, no `/api/generate`, no `/api/report`, no Stripe webhook, no PDF export, no Supabase persistence transaction. p50/p95 for the stream route: **cannot be computed from Sentry**. (Possible reasons, inferred not confirmed: 10% sampling plus low volume; or streaming Response bodies on Vercel not being captured as a finished transaction.)

Report-path routes that DO appear: `POST /api/parse-resume` (upload parsing), `GET /api/generation-status` (polling), `GET /api/passes`, `GET /api/free-status` (gate). Query: `search_traces('transactions whose name is POST /api/parse-resume or GET /api/generation-status or GET /api/passes or GET /api/free-status ... sorted by timestamp')` -> 60 spans across 4 traces:
- `cf47381f82ae42a599f01e22202741f5` 2026-10-30T22:02:04Z, `/api/free-status`, release e05da605, 200.
- `61020777c63b46899c269076bcfbff91` 2026-11-01T13:32:37Z, `/api/free-status`, release 9c4eaada, 200 (from a Chrome/Mac `/sample-report` pageload geo Monument, 3573 ms pageload).
- `bb7156f41c6b4cb8803013c5a5a3bdeb` 2026-11-01T15:12:39Z to 15:12:47Z, release 9c4eaada: Chrome/Mac pageload `/workspace` (Monument) -> `GET /api/generation-status` 200 -> `GET /api/free-status` 200 (Upstash pipeline x2) -> `POST /api/parse-resume` **500** (`span.status=internal_error`, 221 ms; inside it `executing api route (app) /api/parse-resume` 158 ms `internal_error`, Upstash `multi-exec` 200). **No error event was captured for this 500.**
- `388e2846b05749b5803070c65ef43597` 2026-11-02T03:34:21Z, release 568b923a: `/sample-report` pageload (Chrome/Mac, Monument) -> many `/api/free-status` and `/api/passes` calls, all 200; slowest `/api/free-status` 1204.7 ms.

Query: `search_traces('count of transactions grouped by http.response.status_code and sentry.segment.name where status code is 400 or higher')` -> `is_transaction:true http.response.status_code:>=400` -> **1 row: `500` on `POST /api/parse-resume`, count 10** (one sampled request, the trace above). No other 4xx/5xx sampled in 30 days.

### Browser transactions (pageload/navigation), 30 days

Query: `search_traces('count of pageload and navigation transactions grouped by transaction name ...')` -> `is_transaction:true AND transaction.op:[pageload,navigation]` -> 29 routes. Top: `/` 128, `/research` 50, `/workspace` 42, `/privacy` 40, `/resources/tools/comp-calculator` 40, `/methodology` 40, `/research/quantifying-impact` 40, `/pricing` 33, `/sample-report` 33, `/auth` 30, then 20 each for `/research/salary-history-bans`, `/trust`, `/status`, `/research/social-screening`, `/research/who-you-are`, `/research/writing-quality-hire-probability`, `/research/human-vs-algorithm`, `/research/hiring-discrimination-meta-analysis`; 10 each for `/terms`, `/this-page-does-not-exist`, `/research/how-recruiters-read`, `/research/automation-and-bias`, `/resources/tech-offer-negotiation`, `/resources/offer-negotiation`, `/research/linkedin-visibility`, `/research/referral-advantage`, `/research/star-method`, `/resources`, `/research/resume-length-myths`. `count_unique(user.id)` and `count_unique(user.ip_address)` = 0 everywhere.

Unique sampled traces per page, excluding headless/curl/bot UAs (Query: `search_traces('pageload transactions excluding HeadlessChrome, curl and bots: count, count_unique(trace), count_unique(user.geo.city) grouped by sentry.segment.name')` -> `transaction.op:pageload !user_agent.original:*HeadlessChrome* !user_agent.original:*curl* !user_agent.original:*bot*`; note the agent dropped `is_transaction:true`, so `count()` here counts child spans and is not comparable; use `count_unique(trace)`):
`/` 34 traces (3 cities), `/sample-report` 15 (2 cities), `/workspace` 14, `/pricing` 14, `/privacy` 4, `/resources/tools/comp-calculator` 4, `/research/quantifying-impact` 4, `/methodology` 3, `/auth` 3, `/status` 2, `/research` 2, and 1 to 2 for each research/resources article.

### Slowest transactions

Query: `search_traces('slowest 25 transactions in the last 30 days ...')` -> `is_transaction:true` sorted `-span.duration`:
30000 ms `/sample-report` HeadlessChrome 2026-11-02T17:02:50Z; 30000 ms `/workspace` HeadlessChrome 17:06:03Z; 26494 ms `/` HeadlessChrome; 25438 ms `/sample-report` HeadlessChrome; 24859 ms `/pricing` HeadlessChrome; 23468 ms `/` HeadlessChrome; **21113 ms `/research/how-recruiters-read` Chrome 2026-10-31T13:03:43Z**; **20509 ms `/` Chrome 2026-11-02T08:30:12Z**; **15868 ms `/research/quantifying-impact` Chrome 2026-10-15T21:34:26Z**; 13522 ms `/workspace` HeadlessChrome; 13138 ms `/pricing` HeadlessChrome; ... **7960 ms `/research/quantifying-impact` Chrome 2026-10-25**; **5898 ms `/workspace` Chrome Mobile (Pixel 9) 2026-10-29T13:12:44Z**; **3702 ms `/resources/offer-negotiation` Chrome Mobile (Oppo, Beijing) 2026-10-17**; **3573 ms `/sample-report` Chrome 2026-11-01T13:32:34Z**; 3452 ms `/` Chrome 2026-11-02T18:33:04Z.
All 30 s / 25 s entries are HeadlessChrome on 2026-11-02 16:41 to 17:15 UTC (a browser-automation run hitting timeouts). Real-browser slow loads are the bolded rows.

Slowest `http.client` calls (Query: `search_traces('http.client spans in the last 30 days grouped by span.description and sentry.segment.name ... sorted by max duration')`): `GET /api/generation-status` from `/workspace` p95 3526 ms, max 7891 ms (count 22); `GET /api/free-status` from `/workspace` max 6991 ms; `GET /api/free-status` from `/sample-report` p95 2712 ms; `POST https://mokcjrwkhxulznquxamb.supabase.co/auth/v1/token` from middleware p95 865 ms (3); `GET .../supabase.co/rest/v1/user_profiles` from `GET /api/status` 659 ms. The other long `http.client` rows are Next.js prefetches of internal pages (`GET https://www.recruiterinyourpocket.com/workspace` etc., 1.0 to 2.3 s p95).

### Web vitals (metrics dataset, production)

INP p75 by page (Query: `search_metrics('p75 of browser.web_vital.inp grouped by transaction in production over the last 30 days, with count')`): `/workspace` **448 ms** (n=7), `/sample-report` 136 (6), `/pricing` 80 (6), `/auth` 56 (1), `/resources/tools/comp-calculator` 56 (1), `/methodology` 48 (1), `/research/hiring-discrimination-meta-analysis` 48 (1), `/resources` 40 (1), `/` 24 (6), `/research` 8 (1), `/research/quantifying-impact` 8 (1).
INP by browser (Query: `search_metrics('p75 and max and count of browser.web_vital.inp grouped by browser.name')`): Chrome p75 160 / max **1616** / n=30; Chrome Mobile iOS 48 / 48 / 1; HeadlessChrome 8 / 8 / 1. The 1616 ms sample that fired alert JAVASCRIPT-NEXTJS-15 came from a real Chrome session, not the headless gate.
LCP p75 by page and browser (Query: `search_metrics('p75 and count of browser.web_vital.lcp grouped by sentry.segment.name and browser.name')`): `/research/how-recruiters-read` Chrome **18236 ms** (n=1); `/research/quantifying-impact` Chrome **13308 ms** (n=2); `/workspace` HeadlessChrome 3028 (12); `/` HeadlessChrome 2228 (15); `/resources/tools/comp-calculator` HeadlessChrome 1224 (4); `/pricing` HeadlessChrome 1083 (13); `/sample-report` HeadlessChrome 856 (10); `/` Chrome **622** (8); `/research/quantifying-impact` HeadlessChrome 508 (2); `/` Chrome Mobile iOS 99 (1); everything else HeadlessChrome under 500 ms with n=1 to 4. Real-Chrome LCP samples exist only for `/` (good), `/research/quantifying-impact` (bad, 2 samples) and `/research/how-recruiters-read` (bad, 1 sample).

---

## 6. Usage signal, releases, data fidelity

### Volume over time

Query: `search_traces('count of transactions per day for the last 30 days, split by transaction.op')` (agent returned an un-split daily series): total 7,419 transactions; 2026-10-04: 30, 10-05: 50, 10-08: 10, 10-09: 10, 10-11: 30, 10-12: 60, 10-13: 110, 10-15: 100, 10-17: 40, 10-19: 10, 10-22: 20, 10-24: 30, 10-25: 60, 10-26: 10, 10-28: 50, 10-29: 40, 10-30: 90, **10-31: 1,240, 11-01: 4,070, 11-02: 1,359 (partial)**; all other days 0.
Query: `search_traces('count of pageload transactions per day over the last 30 days where browser.name is not HeadlessChrome and not curl')` -> `is_transaction:true AND transaction.op:pageload AND !browser.name:HeadlessChrome AND !browser.name:curl` -> total 211 (extrapolated): 10-04: 10, 10-13: 10, 10-15: 10, 10-17: 20, 10-24: 10, 10-25: 10, 10-29: 10, 10-30: 10, 10-31: 10, **11-01: 100**, 11-02: 11; other days 0. In raw sampled events that is roughly 1 real-browser pageload per active day before Nov 1 and about 10 on Nov 1.

### Who the traffic is

Query: `search_traces('count of transactions and count_unique(trace) grouped by browser.name over the last 30 days')`:

| browser.name | count() | unique traces |
| --- | --- | --- |
| HeadlessChrome | 3931 | 107 |
| Chrome | 2738 | 118 |
| (null) | 379 | 39 |
| curl | 130 | 13 |
| Chrome Mobile | 91 | 6 |
| Chrome Mobile iOS | 90 | 5 |
| Mobile Safari | 50 | 5 |
| com/bot | 10 | 1 |

Same query at `period='3d'`: HeadlessChrome 3931/107, Chrome 2348/97, null 249/28, curl 130/13, Chrome Mobile iOS 90/5, Chrome Mobile 1/1. **100% of HeadlessChrome and curl traffic, and 82% of Chrome transactions, happened in the last 3 days (Oct 31 to Nov 2).** The Oct 31 to Nov 2 spike is launch-gate / browser-automation / verification traffic, not organic growth.

Query: `search_traces('count of transactions grouped by browser.name and os.name and device.family')`: HeadlessChrome/Linux 3460; Chrome/Linux 2508 (server-side transactions inherit the browser tag; os=Linux is the Vercel function); HeadlessChrome/Mac OS X/Mac 461; null/Linux 379; Chrome/Mac OS X/Mac 164; curl/Linux 130; Chrome/null 66; Chrome Mobile iOS/iOS/iPhone 50; Mobile Safari/Linux 50; Chrome Mobile/Linux 40; Chrome Mobile iOS/Linux 30; Chrome Mobile/Android/**Oppo CPH2653** 30; HeadlessChrome/null 10; Chrome Mobile iOS/null 10; Chrome Mobile/Android/**Samsung SM-S938B** 10; com/bot/Linux 10; Chrome Mobile/Android/**Pixel 9** 10; Chrome Mobile/Android/**Pixel 8** 1.

Query: `search_traces('count of transactions and count_unique(trace) grouped by user.geo.country_code and user.geo.city, excluding browser.name HeadlessChrome and curl')` (server geo = Vercel region for server spans; client geo for pageloads): US/Ashburn 1918 tx / 123 traces (Vercel iad1, not people); US/San Jose 809 / 80 (likely Vercel/edge or a cloud agent region; not confirmed); **US/Monument 240 / 49**; US/(null) 181 / 27; SG/Singapore 70 / 5; CN/Beijing 40 / 4; BR/São Paulo 20 / 2; KR/Suwon 20 / 1; DE/Frankfurt 10 / 1; FI/Helsinki 10 / 1; GB/City of London 10 / 1; US/Tukwila 10 / 1; CN/(null) 10 / 1; SG/(null) 10 / 1.

Query: `search_traces('transactions where user.geo.city is Ashburn ... grouped by browser.name, user_agent.original and transaction.op')`: every Ashburn row is `transaction.op=http.server` or `http.server.middleware` (HeadlessChrome 1826/42 traces, Chrome 1210/94, null 348/37, curl 60/6, Chrome Mobile 30/3, Chrome Mobile iOS 20/1, Mobile Safari 20/2, com/bot 10/1). `user_agent.original` is null on all. Confirms Ashburn = server-side geo.

All mobile pageloads/navigations in 30 days (Query: `search_traces('pageload and navigation transactions from mobile browsers ...')` -> `is_transaction:true AND transaction.op:[pageload,navigation] AND browser.name:*Mobile*`), 11 sampled:
1. 2026-10-04T09:04:45Z `/research/star-method` Chrome Mobile, Oppo CPH2653, Beijing, 1572 ms
2. 2026-10-17T11:00:47Z `/resources/offer-negotiation` Chrome Mobile, Oppo CPH2653, Beijing, 3702 ms
3. 2026-10-17T19:28:52Z `/` Chrome Mobile, Samsung SM-S938B, Beijing, 2827 ms
4. 2026-10-24T10:21:19Z `/sample-report` Chrome Mobile, Oppo CPH2653, Beijing, 3172 ms
5. 2026-10-29T13:12:44Z `/workspace` Chrome Mobile, Pixel 9, (no city), 5898 ms
6. 2026-10-31T21:01:57Z `/research` Chrome Mobile iOS, iPhone, Monument, 2165 ms
7. 2026-10-31T21:02:05Z `/research/hiring-discrimination-meta-analysis` Chrome Mobile iOS, iPhone, Monument, 1001 ms
8. 2026-11-01T13:17:35Z `/` Chrome Mobile iOS, iPhone, Monument, 2539 ms
9. 2026-11-01T19:03:59Z `/methodology` Chrome Mobile iOS, iPhone, Monument, 505 ms
10. 2026-11-01T19:04:11Z `/` Chrome Mobile iOS, iPhone, Monument, 534 ms
11. 2026-11-02T16:49:29Z `/` Chrome Mobile, Pixel 8, Monument, 397 ms

Real-browser pageloads on paid-journey pages, 30 days (Query: `search_traces('pageload transactions for /workspace, /reports, /auth, /pricing, /sample-report excluding HeadlessChrome')`): 7 sampled: `/sample-report` 2026-11-02T16:52:12Z Chrome/Mac Monument 332 ms; `/sample-report` 2026-11-02T03:34:21Z Chrome/Mac Monument 780 ms; `/workspace` 2026-11-01T15:12:39Z Chrome/Mac Monument 486 ms (the parse-resume 500 trace); `/auth` 2026-11-01T14:00:50Z Chrome/Mac Monument 319 ms; `/sample-report` 2026-11-01T13:32:34Z Chrome/Mac Monument 3573 ms; `/workspace` 2026-10-29T13:12:44Z Chrome Mobile/Android Pixel 9 5898 ms; `/sample-report` 2026-10-24T10:21:19Z Chrome Mobile/Android Beijing 3172 ms. **No sampled `/reports` pageload and no sampled `/pricing` pageload from a non-headless browser.** (At 10% sampling, absence of a sample is weak evidence.)

### Distinct users / sessions

`count_unique(user.id)`, `count_unique(user.email)`, `count_unique(user.ip_address)` are **0** on every query (no user context is attached to events). Best available proxy: **210 unique sampled traces in 30 days** across all transactions (Query: `search_traces('count of transactions and count_unique(user.ip), count_unique(user.id), ... count_unique(trace) ... no grouping')` -> `count()=7419, count_unique(browser.name)=7, count_unique(trace)=210`). Of those, 107 are HeadlessChrome and 13 are curl, leaving about 90 traces from real-looking browsers, 49 of which are geo-tagged Monument (the same Colorado location that is on the Nov 1/2 `/workspace`, `/auth`, `/sample-report` sessions). Release health sessions are not instrumented (no session data in `get_release_details(includeHealth=true)`).

### Releases seen in the window

Query: `search_traces('count of transactions grouped by sentry.release and environment over the last 30 days')`:

| sentry.release | env | tx count |
| --- | --- | --- |
| 9c4eaada009c0e9d5644edbbb3ea29f9f46147dc | production | 3290 |
| 568b923ac05c7da5bf6e59d3303b4a44e10f05f9 | production | 1179 |
| (null) | production | 832 |
| ef22f0796b763377306b31bcf3a7605af3b0d54b | production | 800 |
| e05da605d947c0b992022896d914e469dcc803ea | production | 690 |
| 6d66ef9ab19a12cd8a6bea125dc28c14459bae0a | preview | 100 |
| 0c024e171071119dde5d2ca283176820d8de9253 | production | 70 |
| 076d4e0c82c2abe008bfc04ed8b20221cd961191 | production | 70 |
| 9464adbd2229fcee46f68fab5a162430ca786d22 | preview | 60 |
| 446fd41d7d7521104fe9b0cbd882f71ee8dae358 | production | 60 |
| 726e28ad474ef03b23b869f63010a5ad9550b412 | production | 60 |
| 50cc0a64256d9becb178bac15eb0be9715e2de52 | production | 60 |
| 00c17faf85e2d6aba7cd9810b621bcc905c1b098 | preview | 50 |
| 3dc7f4dae1c6bd12b612a967e8f07a50ba03116e | production | 40 |
| 3bfd639aed96fac6a0172ae8c9e849fa2fe32707 | production | 38 |
| 66c5894bcbd82830af6b7bab3701b1f8047fc7c9 | production | 10 |
| 17a85e71a86d3e2a3fe024752417f2b82484d253 | production | 10 |

Release deploy facts (Query: `execute_sentry_tool('find_releases', projectSlug='javascript-nextjs')` and `get_release_details(...)`):
- `e05da605...`: created 2026-09-14, **vercel-production deploy 2026-10-30T23:09:18Z**; first event 2026-10-16, last event 2026-10-31T11:17:23Z; 2 new issues. The only release with any error events. (Note: its first error event, Oct 16, predates its Oct 30 production deploy record; the release string was already live then via an earlier deploy not listed, or the tag is the build SHA baked into an older deploy.)
- `ef22f079...`: vercel-production 2026-10-31T20:57:54Z.
- `9c4eaada...`: vercel-production 2026-11-01T15:07:46Z (most traffic; the launch-gate runs).
- `3dc7f4da...` prod 2026-11-01T16:14Z; `0c024e17...` prod 16:29Z; `446fd41d...` prod 16:58Z; `50cc0a64...` prod 17:35Z; `568b923a...` prod 2026-11-02T03:30Z; `3bfd639a...` prod 2026-11-02T20:47Z (current).
- `a4e8996355b791e74e82e3afc80902d5c14dd6a2` ("Track stable Next root parameter declarations", the local HEAD) has a Sentry release record with a vercel-production deploy dated 2026-09-12 and `dateReleased` 2026-11-01T22:02Z, but **zero transactions or errors are tagged with it** in 30 days.
- `monitoring-verification`: created 2026-11-01T20:40Z, no deploys, no commits; carries the 7 synthetic `riyp.*` metric samples.
- Preview-environment releases with traffic: `6d66ef9a...` (100), `9464adbd...` (60), `00c17faf...` (50). 832 transactions have **no release tag** (likely browser-side pageloads without a release, or edge middleware).
- `find_releases` returned `hasMore: true`; 25 shown (many Nov 1 to Nov 2 vercel-preview releases omitted here).

### Data fidelity (dropped events)

Query: `find_dropped_events(dataset='spans', projectSlug='javascript-nextjs', statsPeriod='30d', interval='1d')`:
- `filtered / web-crawlers` (intentional, Sentry inbound filter) every day: e.g. 10-03: 158, 10-04: 155, 10-05: 84, 10-06: 75, 10-08: 74, 10-09: 230, 10-11: 203, 10-12: 75, 10-15: 155, 10-17: 299, 10-18: 305, 10-19: 77, 10-21: 230, 10-22: 92, 10-23: 169, 10-24: 136, 10-26: 151, 10-29: 232, 10-30: 8, 10-31: 40, 11-01: 131, 11-02: 13. **Bots are hitting the site daily (roughly 75 to 305 crawler spans/day) and are being dropped before storage**, which is why no bot noise shows up in issues.
- `client_discard / no_parent_span` (intentional): 10-31: 1193, 11-01: 3476, 11-02: 2072 (plus small numbers earlier). Large volume of orphan spans during the launch-gate runs.
- `client_discard / sample_rate`: 10-30: 15, 10-31: 3, 11-01: 37, 11-02: 33 (confirms client-side trace sampling is active).
- Accepted spans per day: 10-03: 84, 10-04: 79, 10-05: 17, 10-08: 3, 10-09: 2, 10-11: 19, 10-12: 24, 10-13: 115, 10-15: 106, 10-17: 154, 10-19: 9, 10-22: 4, 10-24: 86, 10-25: 97, 10-26: 2, 10-28: 24, 10-29: 96, 10-30: 110, 10-31: 1173, 11-01: 3710, 11-02: 7394.

Query: `find_dropped_events(dataset='errors', ...)`: dropped `client_discard / network_error` 1 on 2026-10-16, 2 on 2026-10-30; accepted 6 (10-16), 8 (10-30), 1 (10-31).
Query: `find_dropped_events(dataset='metrics', ...)`: no drops; 7 accepted on 2026-11-01.

---

## Empty / unavailable checklist

- `riyp.severity.outcome`: **never received** (any environment).
- `riyp.report.outcome`, `riyp.report.repair`, `riyp.free_gate.check`, `riyp.checkout.step` in `production`: **EMPTY**; only the 7-sample `monitoring-verification` burst exists.
- `llm.response.repair_failed`: 0.
- Sentry Logs: **EMPTY for 90 days**.
- Session Replay: **EMPTY for 30 days** (not enabled, or sample rate 0).
- `POST /api/resume-feedback-stream` transactions / latency: **EMPTY** (no sampled transaction in 30 days despite 9 error events on that route).
- Distinct users: **not measurable** (no user context; `count_unique(user.*)` = 0 everywhere).
- Release health sessions: not instrumented.
- Browser-side (JavaScript platform) error events: **0 in 90 days**.
- Stripe webhook, PDF export, Supabase persistence transactions: **none present** under any name.
