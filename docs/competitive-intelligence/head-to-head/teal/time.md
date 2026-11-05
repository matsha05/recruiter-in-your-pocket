# Teal timing

All times are November 5, 2026. Local times use America/Denver (MST, UTC−07:00).

| Event | Local time | UTC |
| --- | --- | --- |
| Shared PDF upload started | 13:21:26.298 | 20:21:26.298 |
| First screen after upload captured, importing | 13:21:27.873 | 20:21:27.873 |
| Imported builder preview ready | 13:22:36.557 | 20:22:36.557 |
| Without-posting Analyzer score first observed | 13:23:07.365 | 20:23:07.365 |
| Without-posting Analyzer text capture saved | 13:23:25.745 | 20:23:25.745 |
| First price screen observed | 13:23:41.092 | 20:23:41.092 |
| Verified shared posting saved | 13:29:37.101 | 20:29:37.101 |
| Normal reload while match was still loading | 13:31:42.070 | 20:31:42.070 |
| Match Score and first usable keyword findings observed | 13:31:51.210 | 20:31:51.210 |
| Match result screenshot saved | 13:31:58.115 | 20:31:58.115 |
| All five keyword detail captures completed | 13:32:32.948 | 20:32:32.948 |

- Upload to visible Analyzer score: **1.68 minutes** (101.067 seconds).
- Upload to first usable Analyzer recommendation: **not reached**; all 16 detailed recommendations were locked. This is not a zero-minute result.
- Upload to first usable Job Matcher keyword findings: **10.42 minutes** (624.912 seconds).
- Correct posting save to first usable keyword findings: **2.24 minutes** (134.109 seconds).
- These are observed wall-clock durations, not isolated server processing times. They include navigation, inspection, the price screen, and entry troubleshooting.

The posting field initially discarded paste/fill input. Normal keyboard entry succeeded; the entered wording was verified against the shared posting after whitespace and automatic list-marker normalization before Save. After Save, the job summary was parsed but the Match Score kept showing a spinner. A normal reload preceded the first observed completed score. The timing above includes this delay; no faster result is assumed.

`first-screen.png` is the importing state captured before any subsequent click. The optional ready-preview image was removed because account-contact text was visible behind its introductory tour dialog; the observed ready timestamp is retained. The score and upsell screenshots show later states. Desktop viewport: 1440 × 1000; full-page capture requested.
