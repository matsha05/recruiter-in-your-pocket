# Launch Monitoring

**Last Updated:** November 1, 2026
**Plan item:** 6.4 in [70-audit-remediation-plan.md](70-audit-remediation-plan.md)
**Status:** Sentry monitors and the alert are live. The new counters start reporting when this branch deploys; the uptime check is created but disabled until then.

Four signals say the paid journey is healthy: reports finish, the free gate lets first-time visitors through, buyers get from checkout to an active pass, and the key pages load and respond quickly. Each signal below has a query, an alert threshold, and what to do when it fires. Alerts email the Sentry account's active members, the same delivery as the existing production-error alert (see [90-incident-runbook.md](90-incident-runbook.md)).

## What existed before this change

| Source | What it held | Why it was not enough |
| --- | --- | --- |
| Vercel runtime logs | `http.request.completed`, `llm.response.repair_failed` and the other structured logs | The project is on Vercel Hobby: runtime logs are kept for 1 hour and there is no log drain, so there was no history of completed or failed reports |
| Sentry errors | Handled report failures (`generation.resume_feedback_stream` with `error_code`), webhook fulfillment failures | Failures only, no completed-report denominator; the purchase kill switch logged nothing at all |
| Sentry traces | Browser pageloads with LCP, INP and CLS at a 10% sample | One to five readings per key page per month, too few for a p75 or an alert |
| Mixpanel | `paywall_viewed`, `checkout_started`, `checkout_completed`, `unlock_confirm_succeeded`, `billing_restore_succeeded` | Only visitors who accept analytics in Privacy choices, so it cannot count every buyer |
| Vercel Web Analytics | Cookieless page views (for example `/pricing`) | Page views only; custom events need a paid plan |
| Vercel Speed Insights | Not installed | |

## What this change adds

Server code now sends unsampled Sentry metric counters at each decision point (`web/lib/observability/launchSignals.ts`). The schema is closed, like product analytics: unknown names, attributes and values are dropped, and nothing identifies a visitor, account, report, checkout session or email. These are operational counts in the same category as error monitoring, so they do not depend on the analytics choice in Privacy choices.

| Metric | Attributes | Recorded in |
| --- | --- | --- |
| `riyp.report.outcome` | `outcome` (completed, failed), `failure` (none, validation, timeout, provider, canceled, paused, precondition, access, persistence, other), `error_code`, `mode`, `viewer`, `has_jd`, `endpoint` | `app/api/resume-feedback-stream/route.ts` |
| `riyp.report.repair` | `result` (started, completed, failed) | `lib/llm/validateResumeStreamOutput.ts`, next to the `llm.response.repair_*` logs |
| `riyp.severity.outcome` | `outcome` (added, none, fallback, error), `reason` (added, promoted, none, validation, first_fix_changed, timeout, provider), `critical` (1, 2, 3), `more` (yes, no), `endpoint` | `lib/reports/severity-check-report.ts`, after a resume report validates, while `RIYP_SEVERITY_CHECK` is on; next to the `llm.severity_check.*` logs, which carry its latency and cost |
| `riyp.free_gate.check` | `result` (allowed, blocked, identity_retry), `reason` (none, cookie, identity, network, hold, account, unknown), `first_attempt` (yes, no, unknown), `viewer` | Report stream route; reasons come from the anonymous ledger |
| `riyp.checkout.step` | `step` (see the funnel below), `source` | `/api/checkout`, `/api/stripe/webhook`, `/api/billing/confirm`, `/api/billing/restore` |

Two more pieces:

- **Field performance.** The browser now keeps every trace on the paid-journey pages (`/`, `/workspace`, `/reports`, `/pricing`, `/auth`, `/purchase/*`, `/sample-report`) and keeps the 10% sample elsewhere (`lib/observability/browserTracesSampler.ts`). It follows the page-statistics rule: nothing after an explicit decline in Privacy choices or a Do Not Track / Global Privacy Control signal. `NEXT_PUBLIC_SENTRY_KEY_ROUTE_TRACES_SAMPLE_RATE` overrides the key-page rate.
- **Kill-switch check.** `GET /api/health/paid-journey` returns 503 while `RIYP_DISABLE_NEW_PURCHASES`, `RIYP_DISABLE_GENERATION` or a disabled billing unlock is in effect. A Sentry uptime check polls it every 5 minutes, so a switch left on pages someone even when nobody visits. `/api/status` already shows the same state publicly.

The JSON report endpoint (`/api/resume-feedback`) has no caller in the web app or extension, so it is not instrumented. Instrument it the same way if a client starts using it.

## Signals, queries and alerts

All monitors are in project `javascript-nextjs`, environment `production`, and connect to the alert [RIYP launch signals: email on warning or critical](https://recruiter-in-your-pocket.sentry.io/monitors/alerts/6274670/) (warning and critical, at most one email per hour per issue).

### 1. Report generation failures

**Query:** [report outcomes per hour][q-reports]: `sum(riyp.report.outcome)` grouped by `outcome` and `failure`. The failure rate is failed ÷ (completed + failed), leaving out `canceled` (the visitor left), `paused` (the operator switch, covered by the uptime check) and `precondition` (refused before any access was reserved, usually a browser that blocks the storage anonymous report recovery needs; a sudden rise here points at a client bug). [Repair results][q-repair] show how often the repair pass runs and how often it saves the report.

| Monitor | Filter | Window | Warning | Critical |
| --- | --- | --- | --- | --- |
| [Reports withheld or failed](https://recruiter-in-your-pocket.sentry.io/monitors/10824545/) | `outcome:failed failure:[validation,timeout,provider,access,persistence,other]` | 1 hour | 2 | 3 |
| [Report repair failed](https://recruiter-in-your-pocket.sentry.io/monitors/10824546/) | `riyp.report.repair result:failed` | 24 hours | 2 | 4 |

The alerts use counts, not a rate, because volume is too low for a rate to mean anything yet (see the baseline). Revisit both thresholds after two weeks of data. When it fires: open the Sentry issue for `generation.resume_feedback_stream` and group by `error_code`. A `validation` cluster matches the October 30 pattern; a `provider` or `timeout` cluster points at OpenAI; `access` means Redis or Supabase is failing for everyone. Follow "AI quality incident" in the incident runbook.

### 2. Gate hits on first anonymous attempts

**Query:** [anonymous gate checks per day][q-gate]: `sum(riyp.free_gate.check)` for `viewer:anonymous`, grouped by `result`, `reason` and `first_attempt`. The false-gate rate is blocked ÷ (allowed + blocked) for `first_attempt:yes`. `identity_retry` is the automatic retry when a browser has no anonymous id yet; it is followed by a second check, so leave it out of the rate.

A first attempt is one whose signed free-report cookie records no report this month. When such a visitor is refused, `reason` says why: `network` (another browser on the same network used the allowance, the shared-office, campus and mobile-carrier case), `identity` (this browser's anonymous id already used it, so the cookie was lost), or `hold` (a generation on the same id or network is still running).

| Monitor | Filter | Window | Warning | Critical |
| --- | --- | --- | --- | --- |
| [First-attempt visitors blocked](https://recruiter-in-your-pocket.sentry.io/monitors/10824548/) | `result:blocked first_attempt:yes` | 24 hours | 2 | 5 |

When it fires: group by `reason`. Mostly `network` means the network allowance is refusing new people and needs a product decision; `hold` means concurrent generations on one network; `identity` suggests a cookie-sync bug.

### 3. Checkout funnel

**Query:** [checkout steps per day][q-checkout]: `sum(riyp.checkout.step)` grouped by `step`. Read the funnel top to bottom:

| Funnel step | Source | Notes |
| --- | --- | --- |
| Paywall seen | Mixpanel `paywall_viewed` (consenting visitors); Sentry `riyp.free_gate.check result:blocked` (every in-app gate); Vercel Web Analytics `/pricing` views (cookieless) | No single unconditional count of paywall views exists without tracking every visitor |
| Checkout started | `step:checkout_started` | A Stripe Checkout Session was opened. Errors are `checkout_failed`; refusals by the kill switch are `purchases_disabled` |
| Stripe success | `step:payment_settled` | The webhook saw a paid session. `payment_pending` is an unsettled one |
| Webhook entitlement | `step:entitlement_granted` | The pass exists. `entitlement_blocked` means the session was refunded or disputed first; `fulfillment_failed` means the webhook errored and Stripe will retry |
| Pass active on the device | `step:confirm_unlocked` (return page), `step:restore_restored` or `restore_already_active` (restore) | Pending polls are not counted. Counts are calls, not buyers, so a refreshed return page counts twice |

| Monitor | Filter | Window | Critical |
| --- | --- | --- | --- |
| [Purchases refused by the kill switch](https://recruiter-in-your-pocket.sentry.io/monitors/10824531/) | `step:purchases_disabled` | 1 hour | 1 |
| [Checkout or fulfillment failing](https://recruiter-in-your-pocket.sentry.io/monitors/10824549/) | `step:[checkout_failed,fulfillment_failed,confirm_failed,restore_failed]` | 1 hour | 1 |
| [Purchases and reports switched on](https://recruiter-in-your-pocket.sentry.io/monitors/10824555/) (uptime) | `GET /api/health/paid-journey` returns 503 | 2 failed checks, 5 minutes apart | Down |

When it fires: follow "Billing incident" in the incident runbook. For the kill switch, check `RIYP_DISABLE_NEW_PURCHASES` in Vercel Production and remove it once the incident is closed.

### 4. Field performance

**Query:** p75 per page for [LCP][q-lcp], [INP][q-inp] and [CLS][q-cls] (Sentry metrics `browser.web_vital.*`). Sentry's built-in Web Vitals page under Insights → Frontend shows the same data per page.

| Monitor | Window | Warning | Critical |
| --- | --- | --- | --- |
| [LCP p75 on paid-journey pages](https://recruiter-in-your-pocket.sentry.io/monitors/10824550/) | 24 hours | above 2.5 s | above 4 s |
| [INP p75 on paid-journey pages](https://recruiter-in-your-pocket.sentry.io/monitors/10824551/) | 24 hours | above 200 ms | above 500 ms |
| [CLS p75 on paid-journey pages](https://recruiter-in-your-pocket.sentry.io/monitors/10824552/) | 24 hours | above 0.1 | above 0.25 |

The thresholds are Google's published Core Web Vitals lines ("needs improvement" and "poor"). With only a few readings a day, one slow visit can move the p75, so check the reading count before acting.

## Production baseline (November 1, 2026)

Measured with read-only queries against production Sentry, Supabase and Vercel.

- **Reports.** The signed-in generation ledger shows 7 attempts in the last 60 days, all released with `validation_error` in the week of October 26, and none completed. The `reports` table holds no rows. Sentry recorded 9 `OPENAI_RESPONSE_SHAPE_INVALID` failures in the last 30 days, the October 30 cluster on release `e05da605`. Anonymous reports were not counted anywhere durable, so the completed-report denominator starts with this deploy. The working estimate that the validator false-rejection bug withholds about 1 in 15 grounded reports is not measured from production data; production has too few reports to check it, so the first weeks of `riyp.report.outcome` are the baseline.
- **Gate.** No history: the gate reason did not exist before this change.
- **Checkout.** One pass (July 28 billing verification) and no Stripe events since July 30. There is no real purchase history yet.
- **Traffic.** October 26 to November 1: 10 `/pricing` page views from 7 visitors (Vercel Web Analytics). Report requests were too rare to appear in the 10% trace sample over 30 days.
- **Field performance.** LCP p75 over 30 days: `/` 905 ms (5 readings), `/pricing` 776 ms (2), `/auth` 404 ms (2). INP p75 56 ms across 6 readings site-wide. CLS readings are all below 0.02.

## After deploying this branch

1. Enable the uptime check: Sentry → Monitors → [Purchases and reports switched on](https://recruiter-in-your-pocket.sentry.io/monitors/10824555/) → Enable. Do this only after `https://www.recruiterinyourpocket.com/api/health/paid-journey` returns `{"ok":true,...}`, or it will page immediately.
2. Run one real report on production and confirm a `riyp.report.outcome outcome:completed` count appears in the [report outcomes query][q-reports] within a few minutes.
3. Load `/pricing` and confirm a new LCP reading in the [LCP query][q-lcp] the next day.
4. Delete nothing in Sentry: the `monitoring-verification` environment holds the seven test counters sent on November 1 to verify the pipeline and is excluded from every monitor.

## Steps that need Matt's account

1. **Sentry dashboard (at a glance).** The Sentry tools available to agents can create monitors and alerts but not dashboards. Open each query link above ([report outcomes][q-reports], [repairs][q-repair], [gate checks][q-gate], [checkout steps][q-checkout], [LCP][q-lcp], [INP][q-inp], [CLS][q-cls]), use the save menu's **Add to Dashboard** option (Sentry may label it slightly differently), and add all seven to one new dashboard named "RIYP launch signals". Set the dashboard's environment filter to `production`.
2. **Mixpanel funnel (consenting visitors only).** Mixpanel → Boards → New board "Checkout funnel" → add a Funnels report with steps `paywall_viewed` → `checkout_started` → `checkout_completed` → `unlock_confirm_succeeded`, conversion window 1 day, breakdown by `reason` on the first step. Add an Insights report for `billing_restore_succeeded` and `checkout_start_failed` by day. Treat it as a sample of visitors who allowed analytics; the Sentry counts are the totals.
3. **Alert recipient.** Alerts go to the Sentry account's active members, which today is `mattrshaw2011@gmail.com`. To add a phone push or Slack, edit the [alert](https://recruiter-in-your-pocket.sentry.io/monitors/alerts/6274670/) and add an action.
4. **Vercel plan.** Decide whether to move the project to Vercel Pro (see below).

## Known limits

- **Vercel Hobby.** Runtime logs last 1 hour and Vercel alerts, custom events and longer analytics retention need a paid plan. Vercel's terms limit Hobby to non-commercial use, so a project taking payments should move to Pro. Sentry holds every signal here, so monitoring does not depend on that move.
- **Sentry quota.** Keeping every trace on key pages raises span volume. At the current traffic this is small, but check Sentry → Stats after the first week and lower `NEXT_PUBLIC_SENTRY_KEY_ROUTE_TRACES_SAMPLE_RATE` if it approaches the plan limit.
- **Privacy copy.** Updated with this change: the privacy policy, the launch vendor registry and the vendor review now say Sentry handles error and performance monitoring.
- **Backup alert path.** The GitHub backup workflow files issues for production `error` and `fatal` Sentry issues only. Metric and uptime alerts rely on email.

[q-reports]: https://recruiter-in-your-pocket.sentry.io/explore/metrics/?statsPeriod=7d&interval=1h&metric=%7B%22metric%22%3A%7B%22name%22%3A%22riyp.report.outcome%22%2C%22type%22%3A%22counter%22%7D%2C%22query%22%3A%22sentry.environment%3Aproduction%22%2C%22aggregateFields%22%3A%5B%7B%22yAxes%22%3A%5B%22sum%28value%2Criyp.report.outcome%2Ccounter%2C-%29%22%5D%7D%2C%7B%22groupBy%22%3A%22outcome%22%7D%2C%7B%22groupBy%22%3A%22failure%22%7D%5D%2C%22aggregateSortBys%22%3A%5B%7B%22field%22%3A%22sum%28value%2Criyp.report.outcome%2Ccounter%2C-%29%22%2C%22kind%22%3A%22desc%22%7D%5D%2C%22mode%22%3A%22aggregate%22%7D
[q-repair]: https://recruiter-in-your-pocket.sentry.io/explore/metrics/?statsPeriod=7d&interval=1h&metric=%7B%22metric%22%3A%7B%22name%22%3A%22riyp.report.repair%22%2C%22type%22%3A%22counter%22%7D%2C%22query%22%3A%22sentry.environment%3Aproduction%22%2C%22aggregateFields%22%3A%5B%7B%22yAxes%22%3A%5B%22sum%28value%2Criyp.report.repair%2Ccounter%2C-%29%22%5D%7D%2C%7B%22groupBy%22%3A%22result%22%7D%5D%2C%22aggregateSortBys%22%3A%5B%7B%22field%22%3A%22sum%28value%2Criyp.report.repair%2Ccounter%2C-%29%22%2C%22kind%22%3A%22desc%22%7D%5D%2C%22mode%22%3A%22aggregate%22%7D
[q-gate]: https://recruiter-in-your-pocket.sentry.io/explore/metrics/?statsPeriod=7d&interval=1d&metric=%7B%22metric%22%3A%7B%22name%22%3A%22riyp.free_gate.check%22%2C%22type%22%3A%22counter%22%7D%2C%22query%22%3A%22sentry.environment%3Aproduction+viewer%3Aanonymous%22%2C%22aggregateFields%22%3A%5B%7B%22yAxes%22%3A%5B%22sum%28value%2Criyp.free_gate.check%2Ccounter%2C-%29%22%5D%7D%2C%7B%22groupBy%22%3A%22result%22%7D%2C%7B%22groupBy%22%3A%22reason%22%7D%2C%7B%22groupBy%22%3A%22first_attempt%22%7D%5D%2C%22aggregateSortBys%22%3A%5B%7B%22field%22%3A%22sum%28value%2Criyp.free_gate.check%2Ccounter%2C-%29%22%2C%22kind%22%3A%22desc%22%7D%5D%2C%22mode%22%3A%22aggregate%22%7D
[q-checkout]: https://recruiter-in-your-pocket.sentry.io/explore/metrics/?statsPeriod=30d&interval=1d&metric=%7B%22metric%22%3A%7B%22name%22%3A%22riyp.checkout.step%22%2C%22type%22%3A%22counter%22%7D%2C%22query%22%3A%22sentry.environment%3Aproduction%22%2C%22aggregateFields%22%3A%5B%7B%22yAxes%22%3A%5B%22sum%28value%2Criyp.checkout.step%2Ccounter%2C-%29%22%5D%7D%2C%7B%22groupBy%22%3A%22step%22%7D%5D%2C%22aggregateSortBys%22%3A%5B%7B%22field%22%3A%22sum%28value%2Criyp.checkout.step%2Ccounter%2C-%29%22%2C%22kind%22%3A%22desc%22%7D%5D%2C%22mode%22%3A%22aggregate%22%7D
[q-lcp]: https://recruiter-in-your-pocket.sentry.io/explore/metrics/?statsPeriod=14d&interval=1d&metric=%7B%22metric%22%3A%7B%22name%22%3A%22browser.web_vital.lcp%22%2C%22type%22%3A%22distribution%22%2C%22unit%22%3A%22millisecond%22%7D%2C%22query%22%3A%22sentry.environment%3Aproduction%22%2C%22aggregateFields%22%3A%5B%7B%22yAxes%22%3A%5B%22p75%28value%2Cbrowser.web_vital.lcp%2Cdistribution%2Cmillisecond%29%22%5D%7D%2C%7B%22groupBy%22%3A%22sentry.segment.name%22%7D%5D%2C%22aggregateSortBys%22%3A%5B%7B%22field%22%3A%22p75%28value%2Cbrowser.web_vital.lcp%2Cdistribution%2Cmillisecond%29%22%2C%22kind%22%3A%22desc%22%7D%5D%2C%22mode%22%3A%22aggregate%22%7D
[q-inp]: https://recruiter-in-your-pocket.sentry.io/explore/metrics/?statsPeriod=14d&interval=1d&metric=%7B%22metric%22%3A%7B%22name%22%3A%22browser.web_vital.inp%22%2C%22type%22%3A%22distribution%22%2C%22unit%22%3A%22millisecond%22%7D%2C%22query%22%3A%22sentry.environment%3Aproduction%22%2C%22aggregateFields%22%3A%5B%7B%22yAxes%22%3A%5B%22p75%28value%2Cbrowser.web_vital.inp%2Cdistribution%2Cmillisecond%29%22%5D%7D%2C%7B%22groupBy%22%3A%22sentry.segment.name%22%7D%5D%2C%22aggregateSortBys%22%3A%5B%7B%22field%22%3A%22p75%28value%2Cbrowser.web_vital.inp%2Cdistribution%2Cmillisecond%29%22%2C%22kind%22%3A%22desc%22%7D%5D%2C%22mode%22%3A%22aggregate%22%7D
[q-cls]: https://recruiter-in-your-pocket.sentry.io/explore/metrics/?statsPeriod=14d&interval=1d&metric=%7B%22metric%22%3A%7B%22name%22%3A%22browser.web_vital.cls%22%2C%22type%22%3A%22distribution%22%2C%22unit%22%3A%22none%22%7D%2C%22query%22%3A%22sentry.environment%3Aproduction%22%2C%22aggregateFields%22%3A%5B%7B%22yAxes%22%3A%5B%22p75%28value%2Cbrowser.web_vital.cls%2Cdistribution%2Cnone%29%22%5D%7D%2C%7B%22groupBy%22%3A%22sentry.segment.name%22%7D%5D%2C%22aggregateSortBys%22%3A%5B%7B%22field%22%3A%22p75%28value%2Cbrowser.web_vital.cls%2Cdistribution%2Cnone%29%22%2C%22kind%22%3A%22desc%22%7D%5D%2C%22mode%22%3A%22aggregate%22%7D
