# RIYP with Job Search Pass, without posting: time

Run date: **November 5, 2026**. Local times are America/Denver (MST, UTC−07:00). UTC timestamps are retained in [clock.json](clock.json).

| Event | MST | UTC |
| --- | --- | --- |
| Pass balance before: 4 | 14:12:13.981 | 21:12:13.981Z |
| Same PDF upload started | 14:12:17.732 | 21:12:17.732Z |
| First screen screenshot completed, before another click | 14:12:17.795 | 21:12:17.795Z |
| Posting field verified empty; report request clicked | 14:12:26.596 | 21:12:26.596Z |
| “Checking for more misses” last-stage screenshot completed | 14:13:00.816 | 21:13:00.816Z |
| Verdict and completed report first observed | 14:13:02.848 | 21:13:02.848Z |
| Read-only expanded notes captured | 14:13:10.322 | 21:13:10.322Z |
| Pass balance after: 3 | 14:13:18.548 | 21:13:18.548Z |

- **Upload to first usable recommendation / Verdict: 0.752 minutes (45.116 seconds).**
- **Upload to full report: 0.752 minutes (45.116 seconds).** Both were present at the first completed-report observation; no earlier partial Verdict was observed.
- Request click to observed completion: **0.604 minutes (36.252 seconds)**. The report itself displayed **“read in 36 s”**.
- The completion monitor sampled visible page text approximately every 0.5 seconds, with screenshot overhead when the stage changed. These are first-observed times, not exact render timestamps.
- The first screen preserves “Reading your resume file…” rather than substituting the later ready state. `ready-empty-posting.png` separately records the empty posting field before submission.

No account handoff was included in this interval. No follow-up answer, re-check or export was requested.
