# Monthly search and AI-answer measurement

## Before the first run

- [x] Create a Google Cloud service account, enable Search Console API, save its JSON key to `~/.config/riyp/gsc-service-account.json`, and add its email as a **Restricted** user on `sc-domain:recruiterinyourpocket.com`.
- [x] Generate the free Bing Webmaster API key from Settings → API access.
- [x] Configure GitHub access for this repository. A fine-grained token with **Contents** and **Pull requests** read/write is preferred. At the owner's explicit direction, this installation reuses the existing GitHub CLI OAuth credential instead; its permissions are broader. The script's destination and document paths are fixed.
- [x] Save those credentials and the existing product `OPENAI_API_KEY` in `~/.config/riyp/monthly.env`, mode **600**. The service-account JSON is also mode 600. **Perplexity is disabled**, following the owner's decision not to pay for that API; no Perplexity key is needed.

Completed November 5, 2026 in the existing Google Cloud project `recruiter-in-your-pocket`. Service-account email: `riyp-monthly-measure@recruiter-in-your-pocket.iam.gserviceaccount.com`. It has no Google Cloud project roles. GSC shows Matt as verified owner and this service account as Restricted. This supersedes the one-user observation in the earlier [setup log](search-console-setup.md).

Setup screens changed on November 5, 2026:

| Screen | Change |
| --- | --- |
| Google Cloud → API Library → Google Search Console API | Enabled the API in the existing project. |
| Google Cloud → IAM & Admin → Service Accounts | Created `riyp-monthly-measure` without project roles. |
| Service account → Keys | Created the JSON key and moved the download into the private configuration directory. |
| Search Console → Settings → Users and permissions | Added the service-account email as Restricted; Matt remains the verified owner. |
| Bing Webmaster Tools → Settings → API access | Generated the free API key and saved it privately. |

## What runs and when

The macOS user LaunchAgent `com.riyp.monthly-measure` runs on **day 1 of each month at 09:00 local time**. It reads the calendar month that just ended. It requires the user to be logged in; nobody needs to be at the keyboard. If the Mac is asleep at the scheduled time, launchd runs the job when it wakes. A powered-off or logged-out Mac does not provide the same catch-up guarantee; run it by hand after a missed month. [Apple scheduling behavior](https://developer.apple.com/library/archive/documentation/MacOSX/Conceptual/BPSystemStartup/Chapters/ScheduledJobs.html)

The job reads APIs, fetches the public Parse page, writes measurement documents, and opens one PR. It does not merge, enable auto-merge, post marketing content, send messages, buy anything, sign up for anything, submit URLs, or run a report on the product. OpenAI API usage is the only paid operation and is covered by the run budget. GitHub Actions is not used for scheduling or as evidence of a passing test.

Outputs:

- `docs/growth/search/YYYY-MM.md`: GSC totals, top 20 queries/pages, anchor candidates, sitemap metadata, Bing rows, and numeric month-over-month deltas.
- `docs/growth/ai-answers/YYYY-MM.md`: method, twelve prompt rows per engine, mentions, citations, main claims, evidence, Parse percentages, costs, and review tasks.
- `docs/growth/ai-answers/raw/YYYY-MM/`: full OpenAI answer responses and separate metadata-extraction responses.

Existing manual notes, including November's consumer ChatGPT observations, are preserved. An API section is appended between explicit markers and only that section is replaced on rerun. The filename names the reporting cycle; AI answers and sitemap metadata are observed **on the run date**, not reconstructed for the previous month.

## Credentials

The script parses only `~/.config/riyp/monthly.env`, never a repository `.env` file or shell-provided API key. The product key was copied there once with the owner's authorization. Do not put real credentials in documentation, a PR, a command-line argument, or a log.

```dotenv
GSC_SERVICE_ACCOUNT_FILE=/Users/your-user/.config/riyp/gsc-service-account.json
BING_API_KEY=your-private-key
GITHUB_TOKEN=your-private-token
OPENAI_API_KEY=your-private-key
```

The file must have mode 600. The JSON key must remain outside the repository. Credentials are used only with their owning provider. Bing API keys cover the account's verified sites, so keep this key private even though the measurement script uses only RIYP. For a future GitHub token replacement, select this repository only and grant Contents and Pull requests read/write; Metadata read access is implicit. [Bing API access](https://learn.microsoft.com/en-us/bingwebmaster/getting-access), [GitHub fine-grained token permissions](https://docs.github.com/en/rest/git/trees#create-a-tree)

## Run by hand

Use Node **24** and install root dependencies with `npm ci --ignore-scripts` if needed. Skipping install hooks avoids installing or running the product frontend just to measure search.

```sh
npm run measure:monthly -- --dry-run
npm run measure:monthly -- --dry-run --month 2026-10
npm run measure:monthly -- --month 2026-10
npm run test:monthly-measure
```

`npm run measure:monthly --dry-run` is also recognized through npm's dry-run flag. Prefer the explicit `-- --dry-run` form above. Dry run writes the reports and raw answers but makes no GitHub writes. It still uses paid OpenAI APIs on the first run for that month. `--output-dir /absolute/path` can redirect a dry run's reports without changing credential or paid-response storage.

A normal run creates a commit and pushes the branch through GitHub's Git database API, then opens **Monthly search and AI-answer read for &lt;Month YYYY&gt;** against `main`, on `codex/monthly-YYYY-MM`. This avoids switching or staging the working checkout. The tree starts from current remote `main` and permits only the two monthly reports and their raw JSON files. Existing monthly PRs (open, closed, or merged) are left alone; they prevent another automatic paid run. A branch left behind after a PR-creation failure can be resumed without repeating the paid answers.

The PR body reports Google clicks, Google impressions, Bing citations, RIYP mentions, and the largest absolute relative change among comparable nonzero prior GSC totals. Missing values are **unavailable**, never invented zeroes. Review the source status, incomplete-answer count, raw citations, machine summaries, and cost table before deciding what to do with the PR. The job never merges it.

## Sources and limits

- **Google:** `googleapis`, the `webmasters.readonly` scope, Domain property `sc-domain:recruiterinyourpocket.com`, web search, inclusive calendar dates in Google's Pacific timezone. The query/page request paginates in batches of 25,000. Candidates are returned query/page rows with position 4–15 and at least 10 impressions. Google suppresses some rows and does not guarantee all underlying data. `dataState: all` includes fresh data; any first incomplete date is recorded, because a first-of-month read may still be provisional. [Search Analytics API](https://developers.google.com/webmaster-tools/v1/searchanalytics/query)
- **Sitemap:** current submitted-URL count, dates, warnings and errors when accessible. Indexed coverage is unavailable: Google's `contents[].indexed` is deprecated. The job does not scrape Pages or request URL inspections. [Sitemap API](https://developers.google.com/webmaster-tools/v1/sitemaps)
- **Bing:** `GetQueryStats` and `GetPageStats` for the imported apex property. These methods update weekly and take no start/end parameters. Rows are filtered by their provider-local API Date and retain that date. They are not presented as exact calendar-month totals; the API cannot reconstruct boundary periods or missing history. [Query stats](https://learn.microsoft.com/en-us/dotnet/api/microsoft.bing.webmaster.api.interfaces.iwebmasterapi.getquerystats?view=bing-webmaster-dotnet)
- **Bing AI Performance:** **UI only, read by hand**. The documented Webmaster interface exposes no citations, cited-page, or grounding-query method. The reports link to [AI Performance](https://www.bing.com/webmasters/aiperformance?siteUrl=https%3A%2F%2Frecruiterinyourpocket.com%2F). An unavailable API count is not the zero observed during the earlier UI setup. [Bing API interface](https://learn.microsoft.com/en-us/dotnet/api/microsoft.bing.webmaster.api.interfaces.iwebmasterapi?view=bing-webmaster-dotnet)
- **OpenAI:** one Responses API request per verbatim prompt, no system prompt/history, web search required. The recommended web-search model at implementation is `gpt-6-astra`, pinned with its rate card. Each request uses low reasoning effort, low search context, at most one tool call, and 1,536 maximum output tokens. These caps can truncate an answer; incomplete rows remain unknown. This is not a consumer ChatGPT sample. A separate `gpt-6.1-terra` pass extracts the products, one-sentence claim and study/page evidence without web search or re-asking the prompt. Product names and evidence quotes must appear in the saved answer or cited page title. URLs and RIYP matching are extracted directly, not inferred by the metadata model. [Responses web search](https://developers.openai.com/api/docs/guides/tools-web-search), [models](https://developers.openai.com/api/docs/models)
- **Perplexity:** disabled at the owner's request because its API is paid. A row for each prompt explicitly says not run; a `PERPLEXITY_API_KEY` alone cannot enable spend. Claude is outside this API job. Consumer ChatGPT/Perplexity/Claude answers and Google AI Mode remain a by-hand read, noted in every monthly AI file.
- **Parse:** fetches the specified public prompt URL, follows its redirect, and parses only the visible “Brands AI mentions” percentage block. The current URL redirects to a topic page; its percentages are tracker observations, not this job's twelve-answer sample. Missing or changed markup becomes **not parsed** and does not stop other work.

## Budget and restart behavior

The initial estimate is **$2.7720** at the November 5 rate card: prompt byte sizes as a conservative token proxy, 512 overhead tokens, 8,000 estimated web context tokens, repeated output context, 1,536 output tokens, one search call, metadata extraction, and a 10% reserve. The run stops before paid calls if this exceeds **$3**. Before each further paid call, accumulated usage-priced spend plus that call's estimate must also fit under $3. [OpenAI prices](https://developers.openai.com/api/docs/pricing)

Search context has no documented exact token ceiling, so this is an estimate guard, not a provider-enforced absolute charge limit. The report records actual API token usage and search calls priced at the pinned rates, including cached inputs and extraction. It cannot read invoice adjustments or the balance of prepaid credits. Missing usage is marked unknown and stops further paid calls. Review model names and prices together before updating the pinned defaults.

A private lock prevents overlapping runs. Paid-call responses and pending markers live under `~/.config/riyp/monthly-state/YYYY-MM/`. Responses are reused on rerun. A timeout or interrupted call can have incurred a charge without returning usage, so a pending marker stops additional paid calls instead of silently retrying. Review the provider usage and the saved state before manually resolving it. Do not delete this state to force another paid baseline. If a process was killed, verify that its PID is no longer running before removing `monthly-state/run.lock`.

## launchd installation

```sh
node scripts/install-monthly-measure-launchd.mjs \
  --repo "$HOME/Desktop/dev/recruiter-in-your-pocket" \
  --npm /usr/local/lib/node_modules/npm/bin/npm-cli.js
launchctl list com.riyp.monthly-measure
```

Run the installer using Node 24. It snapshots only the measurement scripts and their pinned dependencies into `~/.config/riyp/monthly-runtime/`, with a private Node 24 binary. The agent's working directory is the requested repo, and it runs `npm --prefix <private-runtime> run measure:monthly` with report output directed to that repo. This keeps the schedule usable before this PR is merged and preserves the existing checkout's unrelated work. It does not install or modify the product's code or change the system Node installation. Rerun the installer after intentional script updates to refresh the snapshot.

The plist is `~/Library/LaunchAgents/com.riyp.monthly-measure.plist`. Both stdout and stderr go to `~/Library/Logs/riyp-monthly-measure.log` (mode 600). `RunAtLoad` and `KeepAlive` are false: loading the schedule does not spend credits, and errors do not trigger an automatic retry loop. Inspect the report and log after each run. To unload it:

```sh
launchctl bootout "gui/$(id -u)/com.riyp.monthly-measure"
```

## Verification

The fixture test runs the actual CLI in dry-run mode with recorded API responses and a fetch implementation that rejects any network access. It checks both report shapes, all twelve rows per engine, raw-answer retention, and reuse of paid-call checkpoints. Focused tests also cover pagination, date boundaries, the budget, unsupported data, evidence validation, manual-note preservation and the document-only publisher. `npm test` includes this test as its first step; unrelated product-report tests are not used to validate this job.


Verified locally on November 5, 2026:

- Live October dry run completed with both Google and Bing authenticated, twelve complete OpenAI answers, twelve metadata extractions, and eight Parse percentage rows. The saved reports and raw responses are included in this change.
- October Google totals: 0 clicks and 33 impressions. Bing returned no dated query/page rows. RIYP appeared in 0 of 12 complete OpenAI answers. Bing AI citations remain unavailable through the API.
- Measured OpenAI spend: **$1.106637** against the **$2.7720** estimate. Reruns reused all paid responses; no Perplexity calls were made.
- **13 tests passed**, including the actual CLI against recorded responses with network access disabled. The fixture is the live run's public measurement data, without credentials.
- The private Node 24 runtime completed the same live dry run, and the saved GitHub credential passed a read-only repository access check.
- `plutil -lint` passed. `launchctl list com.riyp.monthly-measure` showed the loaded agent; its plist has day 1, hour 9, minute 0 and the requested repo working directory. First scheduled run: **December 1, 2026 at 09:00 local time**, measuring November.
- The scheduled timer and automatic monthly PR publication have not yet fired. The publisher is covered by an offline API test; this setup run is a dry run, so it opens no monthly measurement PR.
