# Time

Clock: browser host UTC, with America/Denver (MST, UTC−07:00) equivalents.

| Event | UTC | America/Denver |
| --- | --- | --- |
| Normal sign-in code requested | 2026-11-05 20:21:40.574Z | 2026-11-05 13:21:40.574 MST |
| Shared PDF upload started | 2026-11-05 20:23:29.851Z | 2026-11-05 13:23:29.851 MST |
| First post-upload screenshot completed | 2026-11-05 20:23:34.370Z | 2026-11-05 13:23:34.370 MST |
| With-posting “Get my report” clicked | 2026-11-05 20:23:57.776Z | 2026-11-05 13:23:57.776 MST |
| Paid-pass gate first captured | 2026-11-05 20:23:58.554Z | 2026-11-05 13:23:58.554 MST |

Upload to observed gate: **28.703 seconds (0.478 minutes)**. This includes posting entry and capture operations, not just processing time.

Upload to first usable recommendation: **unavailable; no recommendation was returned**.

The post-upload screenshot was taken immediately after file selection completed, before any further click. The paid-pass screenshot was subsequently recaptured from the same unchanged modal with only the account-email label masked. The later capture timestamp is recorded in run-clock.json. No analysis request was repeated, no input changed, and no payment control selected during that recapture.

The sign-in form automatically verified the completed eight-digit code and navigated to the workspace; a redundant scripted click on the disappeared Verify code button timed out after navigation. The account was visibly signed in and its entitlement was checked before the upload. This interaction timeout did not prevent sign-in and is not included in upload-to-gate timing.
