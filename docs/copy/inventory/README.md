# Copy inventory

Every user-facing string in `web/app`, `web/components`, `web/lib` and `extension/src`, by route and moment, as extracted by `web/scripts/copy-inventory.cjs`. Regenerate with `npm run copy:inventory` from `web/`; `npm run copy:inventory -- --check` fails when the committed tables are behind the source.

Not in the inventory, on purpose: the model's words (`web/prompts`, the sample report's content, `lib/marketing/jordan-example.ts`), tests and fixtures, the internal labs, and code the reader never sees (`lib/llm`, `lib/evals`, infrastructure).

## Counts

| Measure | Count |
| --- | --- |
| Files scanned | 416 |
| Files with copy | 256 |
| Strings | 2973 |
| Unique strings | 2489 |
| Routes with copy | 111 |

## By moment

| Moment | Strings |
| --- | --- |
| research | 903 |
| account | 442 |
| marketing | 416 |
| report | 319 |
| pricing | 223 |
| upload | 155 |
| legal | 114 |
| extension | 109 |
| shared | 85 |
| rewrite | 63 |
| error | 54 |
| auth | 53 |
| analysis | 16 |
| other | 11 |
| pdf | 6 |
| email | 4 |

## Tables

| Table | Strings | Routes |
| --- | --- | --- |
| [research](./research.md) | 598 | `/research`, `/research/ats-myths`, `/research/automation-and-bias`, `/research/gaps-and-pivots`, `/research/how-recruiters-read`, `/research/human-vs-algorithm` and 11 more |
| [workspace](./workspace.md) | 529 | `/api/export-pdf`, `/api/resume-feedback`, `/api/resume-feedback-stream`, `/api/revise-line`, `/auth`, `/extension` and 4 more |
| [shared](./shared.md) | 427 | `/`, `/api/auth/send-code`, `/api/billing/confirm`, `/api/billing/restore`, `/api/checkout`, `/api/export-pdf` and 86 more |
| [api](./api.md) | 286 | `/api/account/delete`, `/api/account/export`, `/api/analytics`, `/api/auth/send-code`, `/api/auth/sign-out`, `/api/auth/verify-code` and 27 more |
| [guides](./guides.md) | 264 | `/guides`, `/guides/offer-negotiation`, `/guides/tech-offer-negotiation`, `/guides/tools/comp-calculator`, `/resources`, `/resources/offer-negotiation` and 2 more |
| [extension](./extension.md) | 141 | `/extension`, `extension` |
| [settings](./settings.md) | 125 | `/settings/account`, `/settings/billing`, `/settings/matching`, `/settings/support-reply/[emailId]` |
| [help](./help.md) | 87 | `/help`, `/privacy`, `/status`, `/terms` |
| [jobs](./jobs.md) | 71 | `/jobs` |
| [home](./home.md) | 66 | `/`, `/methodology` |
| [jobs-id](./jobs-id.md) | 56 | `/jobs/[id]` |
| [compare](./compare.md) | 55 | `/compare`, `/compare/enhancv`, `/compare/jobscan`, `/compare/kickresume`, `/compare/resume-worded`, `/compare/rezi` and 2 more |
| [purchase](./purchase.md) | 51 | `/purchase/confirmed`, `/purchase/restore` |
| [pricing](./pricing.md) | 39 | `/pricing` |
| [methodology](./methodology.md) | 32 | `/methodology` |
| [dashboard](./dashboard.md) | 29 | `/dashboard` |
| [reports](./reports.md) | 21 | `/reports` |
| [status](./status.md) | 17 | `/status` |
| [reports-id](./reports-id.md) | 15 | `/reports/[id]` |
| [unrouted](./unrouted.md) | 15 |  |
| [llms.txt](./llms.txt.md) | 13 | `/llms.txt` |
| [resources](./resources.md) | 10 | `/resources`, `/resources/offer-negotiation`, `/resources/tech-offer-negotiation`, `/resources/tools/comp-calculator` |
| [auth](./auth.md) | 7 | `/auth` |
| [sample-report](./sample-report.md) | 6 | `/sample-report` |
| [privacy](./privacy.md) | 5 | `/privacy`, `/status`, `/terms` |
| [og-home](./og-home.md) | 3 | `/og/home` |
| [og-research-id](./og-research-id.md) | 3 | `/og/research/[id]` |
| [terms](./terms.md) | 2 | `/terms` |

## How a string is found

- JSX text, and string literals placed directly in JSX.
- JSX attributes a reader sees: `aria-label`, `aria-description`, `aria-placeholder`, `aria-valuetext`, `aria-roledescription`, `title`, `placeholder`, `alt`, `label`, `description`, `caption`, `content` and the rest of the list in the script.
- Object properties with copy keys (`title`, `description`, `label`, `body`, `q`, `a`, `cta`, `message`, `terms`, …) and arrays under them.
- Sentence-like string constants and assignments (a space or terminal punctuation; keys, class names, ids and paths fall out).
- Messages passed to toasts, `ClientActionError`, `setError` and `NextResponse.json`.
- Template literals keep their expressions as `{name}` placeholders.

A string's routes are the pages (`app/**/page.tsx`, `layout.tsx`, `route.ts`) whose import graph reaches its file. A string reached from five or more routes is in the shared table. The moment comes from the file's path first (an email module is `email` wherever it is imported), then from the route.
