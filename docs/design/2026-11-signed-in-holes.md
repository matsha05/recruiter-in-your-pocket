# The signed-in holes wave (November 6, 2026)

Matt asked for the signed-in pass he had deferred on November 5. The map is [the report and signed-in review](../audits/2026-11-report-and-signed-in-review.md), "The signed-in product around the report". Its report findings (the Critical Miss shape, the band's bottom rung) were overtaken by the worklist report and the fifth band, so this wave takes only the signed-in product around the report: what a returning person sees, what the saved report and My reports say, and the places the product said something untrue.

## What changed

| Hole (audit) | Was | Now |
| --- | --- | --- |
| Workspace, returning: the counter | `useState(1)`: before `/api/free-status` answered, a signed-in person was promised a free report | A signed-in person sees "Get my report" and no hint until the server answers (`freeStatusKnown`); anonymous visitors are unchanged |
| Workspace, returning: pass holders | "Get your free report" on the button, because the paid-access floor fed the free label | A pass holder's button reads "Get my report", and the line under it says how many reports are left on the pass |
| Workspace, returning: the last report | Signed in, no way back to it (the recovery link was anonymous-only) | "Open your last report" opens the newest saved report (`/api/reports?limit=1`) |
| The report, signed in | Nothing said the report was kept | The ending says "Kept in My reports." with the link |
| My reports | A score number once there were two reads; "Progress" linked to `/dashboard`; the empty state said "Get your free report" to an account that may have used it | The band name on every row, as the report shows it; no Progress link; "Get my report" |
| Saved report | "Check a revision", a third name for the re-check; on a phone a blank strip between the page bar and the report's header row | "Compare my revision", the name the report and the workspace use; the strip is gone below 768px |
| `/dashboard` | Rendered to anyone, linked from My reports | A temporary redirect to My reports until Progress is a surface we'd show a customer |
| Extension job links | `?job=` and `source=extension-local` loaded job context with the extension held back | Nothing loads unless the `extensionSync` flag is on |
| Settings, account | "Everything we hold about you, as a file." | "Your reports, passes, receipts and profile, as a file." (the seven tables `accountExport.ts` reads) |
| Privacy table | "RIYP does not store your answers." two rows below the row that says saved history includes them | Signed out, we don't keep them; signed in, they're saved with the report until it or the account is deleted |
| Privacy policy | Inngest "coordinates … PDF generation" | Inngest coordinates account exports only; the PDF route renders itself |
| PDF export, signed out | Opened the pass paywall, "PDFs come with a signed-in report": a purchase screen for something free | Opens sign-in |
| The wait | "If you retry and this one also finishes, both count as reports." Retry cancels the first run | "Retry stops this one and starts over. Waiting is usually faster." |
| Sign-in, code step | No line for a code that hasn't arrived | "Not there? Check spam and Promotions." (the voice guide's line) |
| PDF | Date in the server's locale; the footer URL could wrap mid-word; the older report printed "Company stage: Not clear from the resume alone" | US English date in UTC; the URL never wraps; the filler line is gone |

## Also in this change

The article-openings pass (PR 92) found one more race-split figure on the site: quantifying-impact's paragraph and Figure 2 on the 2004 name-swap audit study (callbacks by white- and Black-sounding names). Matt ruled race and discrimination research off the site on November 6, so the paragraph, the figure (`ResumeQualityDiagram`) and its source are gone; the study was cited nowhere else. The ats-myths article keeps one sentence quoting EEOC guidance that a screen can't disproportionately exclude people "by race, sex, or another protected trait": a legal rule, not a finding about race, left for Matt to rule on.

## Verified

Local production build of this branch, served on its own port with the Playwright config's hermetic settings: `tsc`, `lint`, `copy:check`, `test:pdf-export`, and the signed-in and workspace specs (the new `signed-in-returning.spec.ts` plus `worklist-report`, `report-answers`, `workspace-handoffs`, `first-report-wait`, `paid-decision`). Captures of the returning workspace, the report's ending and the saved report at 390 and 1440 are in the PR.

## Still open

- **My reports as rendered.** It is a server component that reads Supabase before it renders, so the mocked session can't draw it; the change is a band name and a removed link, checked in code and by type check only.
- **The settings pass label** when `/api/free-status` fails for a pass holder (the free branch wins). The audit found the code fixed and unverified live; a real pass is still the only way to see it.
- **Sign-in errors.** A wrong code and an expired one get the same sentence because Supabase returns the same error for both; the code's lifetime is a Supabase setting, not in the repository.
- **The wait.** Nothing caps "Sent", Stop still says "couldn't tell" when the server released the report, and the `preview` event is never read. Each needs the stream protocol, not copy.
- **The first-name step at sign-in**, `HistorySidebar`, `VersionComparisonView` and the LinkedIn panels: dead or near-dead paths the audit would cut. Left for a cleanup pass.
