# Voice judge calibration, set-2026-11-06

- Run: 2026-11-06T17:58:25.151Z
- Judge: `gpt-6.1-sol`, reasoning low, seed 20261106
- Prompt: `voice-judge-v3`, SHA-256 `e14a3ebf7dfd63937a186be14a921d72385e24d03473d615e73ce7caf83482be`
- Strings: 40; calls: 4; token-calculated spend: $0.0495

Labels: Claude (the copy-system session), by hand, against docs/copy-system.md as merged in PR 83, before the judge ran.

| Measure | All lines | Held out (text not in the prompt) |
| --- | --- | --- |
| Judged | 40 of 40 | 40 |
| Exact agreement (us, flat, no) | 31 (78%) | 31 (78%) |
| Us or not | 31 (78%) | 31 (78%) |
| Cohen's kappa | 0.58 | 0.58 |

The call a gate depends on: of 6 lines labelled "no", the judge failed 6; of its 7 "no" verdicts, 6 were labelled "no".

Too kind (the judge passed a line the labels don't): 7. Too harsh (the judge failed a line the labels pass): 2.

## Every disagreement

| # | Line | Label | Judge | Judge's reason | Judge's rewrite | Label note |
| --- | --- | --- | --- | --- | --- | --- |
| 8 | Paste the job posting here… | flat | us | 'Paste the job posting here' names both the content and the action in a plain instruction. |  | A placeholder that restates the field; fine for its job |
| 9 | Choose a PDF or DOCX under 4 MB. | flat | us | 'Choose a PDF or DOCX under 4 MB' gives the supported formats and size limit directly. |  | Literal and right, but cold where Matt would say why |
| 13 | Left blank for now. A recruiter will have the same question, and they won’t call to ask it. | flat | us | “A recruiter will have the same question” gives a direct reason to fill the gap. |  | Dry and a little scolding; Matt's answer 10 is warmer ('That's fine… you need a story') |
| 17 | Send it. Then read it against the posting you’re going for. | flat | us | “Read it against the posting you’re going for” is a concrete next step in ordinary words. |  | Fine, but cooler than Matt on a strong resume: no praise, no reason |
| 20 | The Job Search Pass is for what comes next: checking your revision, or tailoring your resume to another job. | flat | us | “Checking your revision, or tailoring your resume to another job” gives specific uses for the Job Search Pass. |  | Colon construction and a slightly sales tone; correct |
| 25 | Paid. One step left. | flat | us | “Paid” confirms the payment plainly, and “One step left” states where things stand. |  | Clear, but clipped fragments where one sentence would be warmer |
| 26 | Your code’s here. Pop it in and you’re back on the other side of the desk. | us | no | “Back on the other side of the desk” adds a playful metaphor to the sign-in instruction, where the step should stay plain. | Your code’s here. Enter it to sign back in. | The one warm line in the email |
| 35 | Something broke on our end, not yours. Saved reports aren’t affected. | us | flat | “On our end, not yours” owns the problem appropriately, but the string gives no next step and none can be added without more facts. |  | Owns it plainly, which is Matt's error voice |
| 39 | Keep the jobs you want to revisit. | flat | us | “Keep the jobs you want to revisit” plainly describes the extension's use. |  | Fine and literal; any job tracker could say it |

## Every line

| # | Line | Label | Judge | Judge's rewrite |
| --- | --- | --- | --- | --- |
| 1 | Eighteen got called back. The other 226 have no idea why the recruiter passed. | us | us |  |
| 2 | Not forty tips. Every line a recruiter trips on, in the order they hit it. | no | no | Every line a recruiter trips on, in the order they read it. |
| 3 | No ATS score. No interview odds. Just what reads clearly and what doesn’t. | no | no | See what reads clearly and what doesn’t. We don’t give ATS scores or interview odds. |
| 4 | Before you apply for the next one. | us | us |  |
| 5 | Let’s see what they see. | us | us |  |
| 6 | That’s 412 characters. We need at least 800 to review it, so add the whole resume, including your experience. | us | us |  |
| 7 | OpenAI writes the report from your resume. We don’t store the resume or opt it into model training. | us | us |  |
| 8 | Paste the job posting here… | flat | us |  |
| 9 | Choose a PDF or DOCX under 4 MB. | flat | us |  |
| 10 | Still going. Longer resumes can take a little more time. | us | us |  |
| 11 | If you retry and this one also finishes, both count as reports. Waiting is usually the better bet. | us | us |  |
| 12 | Lines that need work. Top to bottom, the way a recruiter reads. | us | us |  |
| 13 | Left blank for now. A recruiter will have the same question, and they won’t call to ask it. | flat | us |  |
| 14 | Every fact in it is from your resume or your answers. | us | us |  |
| 15 | Lines not listed are fine as written. | us | us |  |
| 16 | The band is what a recruiter would do with your resume after one pass. The number says where in the band you sit. Neither predicts interviews or offers. | us | us |  |
| 17 | Send it. Then read it against the posting you’re going for. | flat | us |  |
| 18 | Your line is ready. Drop it into your resume and see what changed. | us | us |  |
| 19 | Your first report is free. Five more are $29. | us | us |  |
| 20 | The Job Search Pass is for what comes next: checking your revision, or tailoring your resume to another job. | flat | us |  |
| 21 | Stripe handles your card. We never see or store the number. | us | us |  |
| 22 | A writer, a keyword scanner, a builder, and a recruiter’s read are different purchases, and the read is the one that decides: | no | no | A writer, a keyword scanner, a builder, and a recruiter’s review are different purchases. The recruiter decides: |
| 23 | Want another read? | no | no | Get another report |
| 24 | You’re in. Five more reads. | us | us |  |
| 25 | Paid. One step left. | flat | us |  |
| 26 | Your code’s here. Pop it in and you’re back on the other side of the desk. | us | no | Your code’s here. Enter it to sign back in. |
| 27 | Didn’t ask for this? Ignore it. No one gets in without the code, and we’ll never ask you for it. | us | us |  |
| 28 | That code was not accepted. Check the latest email or request a new code. | flat | flat | That code didn’t work. Check the latest email or request a new code. |
| 29 | Sign in and it’ll be in My reports. | us | us |  |
| 30 | Skip it, and this browser can still bring the report back for up to 24 hours. It won’t be saved to My reports. | us | us |  |
| 31 | What keeps tripping recruiters up, and what keeps landing. | no | no | Where recruiters keep getting stuck in your resume, and which details are clear. |
| 32 | Run a report and save it. Your next version will have something honest to measure against. | us | us |  |
| 33 | Showing your latest 50 reports. Older reports remain stored and can be included in an account export. | flat | flat | Showing your latest 50 reports. Older reports are still saved and can be included in an account export. |
| 34 | Resume saved. 14 skills identified. | flat | flat | Resume saved. Found 14 skills. |
| 35 | Something broke on our end, not yours. Saved reports aren’t affected. | us | flat |  |
| 36 | We couldn’t tell whether this used one of your reports. Check My reports before running it again. | us | us |  |
| 37 | Please upload a PDF, DOCX, or TXT file. | no | no | Upload a PDF, DOCX, or TXT file. |
| 38 | Could not open checkout. Try again. If this continues, contact support. | flat | flat | Our bad. We couldn't open checkout. Try again. If this continues, contact support. |
| 39 | Keep the jobs you want to revisit. | flat | us |  |
| 40 | A recruiter with fifteen years in hiring wrote these criteria. AI applies them, the same way to every resume, and nobody reads yours but you. | us | us |  |
