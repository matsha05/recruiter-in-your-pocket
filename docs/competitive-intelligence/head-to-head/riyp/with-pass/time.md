# RIYP with Job Search Pass, with posting: time

Run date: **November 5, 2026**. Local times are America/Denver (MST, UTC−07:00). UTC timestamps are retained in [clock.json](clock.json).

| Event | MST | UTC |
| --- | --- | --- |
| Pass balance before: 5 | 14:05:24.081 | 21:05:24.081Z |
| Same PDF upload started | 14:05:24.148 | 21:05:24.148Z |
| Initial postupload screenshot completed | 14:05:24.213 | 21:05:24.213Z |
| Retained masked first-screen screenshot | 14:05:42.659 | 21:05:42.659Z |
| Entire posting verified in field, 6,856 characters | 14:06:52.272 | 21:06:52.272Z |
| Report request clicked | 14:06:59.937 | 21:06:59.937Z |
| “Checking every quote” observed | 14:07:41.331 | 21:07:41.331Z |
| “Checking for more misses” last-stage screenshot completed | 14:08:20.808 | 21:08:20.808Z |
| Verdict and completed report first observed | 14:08:32.120 | 21:08:32.120Z |
| Read-only expanded notes captured | 14:11:09.491 | 21:11:09.491Z |
| Pass balance after: 4 | 14:11:59.348 | 21:11:59.348Z |

- **Upload to first usable recommendation / Verdict: 3.133 minutes (187.972 seconds).**
- **Upload to full report: 3.133 minutes (187.972 seconds).** Both were present at the first completed-report observation; no earlier partial Verdict was observed.
- Request click to observed completion: **1.536 minutes (92.183 seconds)**. The report itself displayed **“read in 1 min 24 s”**; that is the product's own duration, not the measured upload-to-result interval.
- The page was still waiting at 21:08:23.844Z; completion was next inspected at 21:08:32.120Z. The reported observation time is an upper bound within that 8.276-second gap, not an exact render timestamp.
- Upload time includes posting entry, screenshot work and closing the account-menu overlay before submission. Expanded notes were available by disclosure, not a second generation.

The initial screenshot contained the account email because the menu's closing transition had not completed. It was excluded from the packet. `first-screen.png` is a masked recapture of the first postupload screen, before the next click; its timestamp comes from the saved file's modification time. This is a documented deviation from retaining the literal earliest frame.
