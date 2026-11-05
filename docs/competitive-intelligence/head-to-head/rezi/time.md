# Rezi timing

Clock: browser host UTC; America/Denver on this date is MST (UTC−07:00). Times include navigation, signup, email confirmation, and capture work. They are observed elapsed times, not isolated server latency.

## Original strict-protocol attempt

| Event | UTC | America/Denver |
| --- | --- | --- |
| Upload began | 2026-11-05 19:56:38.225Z | 12:56:38.225 MST |
| Immediate post-upload screenshot completed | 2026-11-05 19:56:45.015Z | 12:56:45.015 MST |
| Settled signup/rebuilt-preview screenshot completed; original stop recorded | 2026-11-05 19:57:14.347Z | 12:57:14.347 MST |

No recommendation was produced in this first attempt. Upload-to-stop was **0.602 minutes**. `first-screen.png` preserves the settled post-upload signup page before any click; `upload-transition.png` preserves the earlier frame while automatic navigation was pending. The fixed-height signup layout clips the lower preview even in a full-page 1440 × 1000 screenshot; `first-screen.txt` preserves exposed preview text.

## Continuation authorized by the user's later steering

The identical PDF was uploaded again; automatic import was allowed, while edits and suggested rewrites remained unaccepted. The previous abandoned session was not used as the timing start.

| Event | UTC | America/Denver |
| --- | --- | --- |
| Continuation upload began | 2026-11-05 20:14:02.162Z | 13:14:02.162 MST |
| Post-upload signup screenshot completed | 2026-11-05 20:14:17.505Z | 13:14:17.505 MST |
| Email confirmation gate recorded | 2026-11-05 20:15:34.184Z | 13:15:34.184 MST |
| Authenticated first report screen recorded | 2026-11-05 20:20:43.555Z | 13:20:43.555 MST |
| First usable no-posting recommendation observed | 2026-11-05 20:20:56.656Z | 13:20:56.656 MST |
| Shared posting submitted through UI | 2026-11-05 20:22:23.485Z | 13:22:23.485 MST |
| Timed with-posting score/recommendation capture completed | 2026-11-05 20:24:19.316Z | 13:24:19.316 MST |
| In-product paid-plan offer captured | 2026-11-05 20:27:06.105Z | 13:27:06.105 MST |

**Without posting: 6.908 minutes from upload to first usable recommendation.** This includes signup, verification access clarification, transfer to a visible browser for possible user handoff, and sign-in. The email code was ultimately read through the normal full-message Gmail response and entered by the agent under the user's explicit instruction. Those delays are not attributed to Rezi's scoring engine.

**With posting: recommendations were verified and captured no later than 10.286 minutes from the same upload, or 1.931 minutes after posting submission.** They were visible in a preceding untimed observation; 10.286/1.931 minutes are upper bounds based on the first timed saved capture, not an exact first-render measurement. No second resume import or manual source correction occurred between these two score states.

The initial with-posting frame showed a loading keyword panel; an intermediate score of 93 was captured before the later 96 result. Separate screenshots retain those states. The original PDF hash was checked after both variants and remained unchanged.
