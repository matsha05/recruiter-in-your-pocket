# Resume Worded timing

All timestamps are November 5, 2026; MST is America/Denver (UTC−07:00). Times are observed wall-clock timestamps, not measured model-compute latency.

## Completed signed-in baseline, without posting

| Event | MST | UTC |
| --- | --- | --- |
| Exact shared PDF selected/upload initiated | 13:12:10.312 | 20:12:10.312 |
| Immediate post-selection screenshot, before any click | 13:12:10.578 | 20:12:10.578 |
| First score and usable resume-specific feedback observed | 13:13:46.710 | 20:13:46.710 |

**Upload to first observed usable recommendation: 96.398 seconds, or 1.607 minutes.** This is an observation upper bound: capture operations and the interval until the page was read are included. It does not assert that the result first became ready at precisely the readback timestamp.

## Initial anonymous attempt and authentication handoff

| Event | MST | UTC |
| --- | --- | --- |
| Exact shared PDF selected/upload initiated | 12:56:21.273 | 19:56:21.273 |
| Career-level page observed after immediate screenshot | 12:56:35.454 | 19:56:35.454 |
| Account-creation page observed after selecting Senior-level | 12:57:09.399 | 19:57:09.399 |
| Signup submitted | 13:00:13.074 | 20:00:13.074 |
| Human check explicitly displayed | 13:00:35.610 | 20:00:35.610 |
| Same upload session opened in visible browser for user verification | 13:02:15.877 | 20:02:15.877 |
| After user attempted manual verification, site reported failure | 13:03:30.574 | 20:03:30.574 |
| Signup retried using same details and upload session | 13:03:45.703 | 20:03:45.703 |
| Human check required again | 13:04:05.159 | 20:04:05.159 |

The user subsequently completed authentication in a separate browser with a user-authorized alternate email. The completed-run upload above followed that handoff. The end-to-end interval below includes manual verification, retries, capture operations, and browser transfer.

**Original anonymous upload to first observed usable recommendation: 1,045.437 seconds, or 17.424 minutes.** This includes the authentication handoff and the completed signed-in upload; it is not a pure processing-time measurement.

## Completed with-posting run — Targeted Resume

| Event | MST | UTC |
| --- | --- | --- |
| Exact shared PDF selected/upload initiated | 13:29:36.702 | 20:29:36.702 |
| Immediate post-selection screenshot | 13:29:36.956 | 20:29:36.956 |
| First result observed behind introductory overlay | 13:30:03.717 | 20:30:03.717 |
| Score 53 and general missing-keyword assessment observed in next intro | 13:30:19.787 | 20:30:19.787 |
| Detailed keyword list observed with guided tour still present | 13:31:50.441 | 20:31:50.441 |
| Guided tour dismissed; specific recommendations fully interactive | 13:33:28.600 | 20:33:28.600 |
| Magic Target action-step generation requested | 13:36:12.725 | 20:36:12.725 |

**Upload to first observed usable specific keyword list: 133.739 seconds, or 2.229 minutes.** The guided tour was still present when that list was observed. The earlier score/general assessment was observed at **43.085 seconds, or 0.718 minutes**; the specific recommendations were fully interactive after the tour was dismissed at **231.898 seconds, or 3.865 minutes**. All intervals include observation/capture delays; the longer intervals include time spent stepping through the site's intro and tour. These are upper bounds on availability, not pure processing latency. No human-authentication delay occurred during this already signed-in variant.

The initial pre-authentication Targeted Resume attempt had no upload or posting entry. Its historical account-gate capture is superseded by the completed result above.

## Price observation

The actual Pro plan-price screen was captured at **13:28:55.571 MST / 20:28:55.571 UTC**, after opening the baseline Pro offer. It showed Monthly **$49/month**. The earlier dashboard upsell advertised a LinkedIn bonus “worth $49”; those are distinct observations.
