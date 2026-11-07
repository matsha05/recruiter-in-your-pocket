# Jobscan timing

Date: November 5, 2026. Local timezone: America/Denver (MST, UTC−07:00). Timestamps were recorded by the browser clock. This was a free account created with the user-specified email. No paid trial or card was used.

## With the posting

| Event | UTC | America/Denver |
| --- | --- | --- |
| Initial onboarding PDF upload began | 20:01:44.526 | 13:01:44.526 MST |
| Initial post-upload screenshot (`first-screen.png`) | 20:01:46.555 | 13:01:46.555 MST |
| Same PDF selected in the scanner | 20:02:45.776 | 13:02:45.776 MST |
| Scanner post-upload screenshot (`first-screen-with-posting.png`) | 20:02:46.244 | 13:02:46.244 MST |
| Earliest captured upgrade prompt (`upsell.png`, same scanner screen) | 20:02:46.244 | 13:02:46.244 MST |
| “Scan” clicked | 20:03:02.878 | 13:03:02.878 MST |
| First usable recommendations observed (`first-result-with-posting.png`) | 20:03:24.223 | 13:03:24.223 MST |
| First captured priced plan screen | 20:04:56.946 | 13:04:56.946 MST |

**Upload to first usable recommendation: 1.662 minutes (99.697 seconds), measured from the first onboarding upload.** This includes onboarding and operator navigation. The same-PDF scanner upload to first observed recommendation was **0.641 minutes (38.447 seconds)**. The “Scan” click to first observed recommendation was 21.345 seconds.

These are observation upper bounds, not a continuously instrumented measurement of server processing. The report may have become available before the next observation. Both first post-upload screenshots were taken before the next click. No rewrite or reformat was accepted between uploads.

The first captured upgrade prompt (“Get 7 days free” / “Upgrade”) preceded the scan and did not quote a price. The later first priced plan screen is preserved separately in `upsell-price.png`.

## Without the posting

| Event | UTC | America/Denver |
| --- | --- | --- |
| Same PDF selected, job-description field empty | 20:08:48.482 | 13:08:48.482 MST |
| First post-upload screenshot (`first-screen-without-posting.png`) | 20:08:48.701 | 13:08:48.701 MST |
| Disabled “Scan” control observed | 20:08:48.706 | 13:08:48.706 MST |

**Time to usable recommendation: unavailable.** The tool would not run with an empty job-description field, and no no-posting result was generated. Four scans remained. The old 35% score behind the rescan form belongs to the with-posting run.

## Preliminary browser-access delay

Before the successful capture session, a separate isolated browser showed Cloudflare verification on the homepage and signup page. Those attempts had no upload and are documented in `access-attempt.md`; they are not included in the upload-to-recommendation measurement.
