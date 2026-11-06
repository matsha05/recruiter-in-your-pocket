# Voice judge calibration, 2026-11-06 set

- Run: 2026-11-06T17:54:57.557Z
- Judge: `gpt-6.1-sol`, reasoning low, seed 20261106
- Prompt: `voice-judge-v1`, SHA-256 `1f759dbcefaccf97200d5aac1ce83334776282eb943240e2626295d5f0900c98`
- Strings: 40; calls: 4; token-calculated spend: $0.0506

Labels: Claude (the copy-system session), by hand, against docs/copy-system.md as merged in PR 83, before the judge ran.

| Measure | All lines | Held out (text not in the prompt) |
| --- | --- | --- |
| Judged | 40 of 40 | 40 |
| Exact agreement (us, flat, no) | 31 (78%) | 31 (78%) |
| Us or not | 31 (78%) | 31 (78%) |
| Cohen's kappa | 0.61 | 0.61 |

Too kind (the judge passed a line the labels don't): 5. Too harsh (the judge failed a line the labels pass): 4.

## Every disagreement

| # | Line | Label | Judge | Judge's reason | Judge's rewrite | Label note |
| --- | --- | --- | --- | --- | --- | --- |
| 4 | Before you apply for the next one. | us | no | “Before you apply for the next one” leaves both the action and the thing being offered unnamed. | Check your resume before you apply. | A short close Matt approved; the button beside it does the work |
| 5 | Let’s see what they see. | us | no | “Let’s see what they see” is a pitch rather than a clear upload instruction. | Add your resume for a recruiter’s review. | Warm, 'let's' is the candidate's side; says what's about to happen |
| 8 | Paste the job posting here… | flat | us | “Paste the job posting here” names exactly what belongs in the field. |  | A placeholder that restates the field; fine for its job |
| 9 | Choose a PDF or DOCX under 4 MB. | flat | us | “Choose a PDF or DOCX under 4 MB” gives the file types and size limit without extra language. |  | Literal and right, but cold where Matt would say why |
| 20 | The Job Search Pass is for what comes next: checking your revision, or tailoring your resume to another job. | flat | us | “Checking your revision, or tailoring your resume to another job” gives concrete uses for the Job Search Pass. |  | Colon construction and a slightly sales tone; correct |
| 26 | Your code’s here. Pop it in and you’re back on the other side of the desk. | us | no | “Back on the other side of the desk” adds a playful metaphor to a sign-in instruction. | Your code’s here. Enter it to sign back in. | The one warm line in the email |
| 34 | Resume saved. 14 skills identified. | flat | us | “Resume saved. 14 skills identified.” gives two literal status facts without embellishment. |  | Passive 'identified'; correct |
| 35 | Something broke on our end, not yours. Saved reports aren’t affected. | us | no | “On our end, not yours” adds contrast for emphasis instead of simply owning the error, and no next step is given. | Our bad. Something broke on our end. Saved reports aren’t affected. | Owns it plainly, which is Matt's error voice |
| 39 | Keep the jobs you want to revisit. | flat | us | “Keep the jobs you want to revisit” plainly explains what saving jobs is for. |  | Fine and literal; any job tracker could say it |

## Every line

| # | Line | Label | Judge | Judge's rewrite |
| --- | --- | --- | --- | --- |
| 1 | Eighteen got called back. The other 226 have no idea why the recruiter passed. | us | us |  |
| 2 | Not forty tips. Every line a recruiter trips on, in the order they hit it. | no | no | See every line a recruiter trips on, in the order they read it. |
| 3 | No ATS score. No interview odds. Just what reads clearly and what doesn’t. | no | no | See what reads clearly and what doesn’t. You won’t get an ATS score or interview odds. |
| 4 | Before you apply for the next one. | us | no | Check your resume before you apply. |
| 5 | Let’s see what they see. | us | no | Add your resume for a recruiter’s review. |
| 6 | That’s 412 characters. We need at least 800 to review it, so add the whole resume, including your experience. | us | us |  |
| 7 | OpenAI writes the report from your resume. We don’t store the resume or opt it into model training. | us | us |  |
| 8 | Paste the job posting here… | flat | us |  |
| 9 | Choose a PDF or DOCX under 4 MB. | flat | us |  |
| 10 | Still going. Longer resumes can take a little more time. | us | us |  |
| 11 | If you retry and this one also finishes, both count as reports. Waiting is usually the better bet. | us | us |  |
| 12 | Lines that need work. Top to bottom, the way a recruiter reads. | us | us |  |
| 13 | Left blank for now. A recruiter will have the same question, and they won’t call to ask it. | flat | flat | Left blank for now. A recruiter will have the same question. Let's answer it here. |
| 14 | Every fact in it is from your resume or your answers. | us | us |  |
| 15 | Lines not listed are fine as written. | us | us |  |
| 16 | The band is what a recruiter would do with your resume after one pass. The number says where in the band you sit. Neither predicts interviews or offers. | us | us |  |
| 17 | Send it. Then read it against the posting you’re going for. | flat | flat | Read it against the posting you’re going for before you send it. |
| 18 | Your line is ready. Drop it into your resume and see what changed. | us | us |  |
| 19 | Your first report is free. Five more are $29. | us | us |  |
| 20 | The Job Search Pass is for what comes next: checking your revision, or tailoring your resume to another job. | flat | us |  |
| 21 | Stripe handles your card. We never see or store the number. | us | us |  |
| 22 | A writer, a keyword scanner, a builder, and a recruiter’s read are different purchases, and the read is the one that decides: | no | no | A writer, a keyword scanner, a builder, and a recruiter’s review are different purchases. |
| 23 | Want another read? | no | no | Get another report |
| 24 | You’re in. Five more reads. | us | us |  |
| 25 | Paid. One step left. | flat | flat | You've paid. There's one step left. |
| 26 | Your code’s here. Pop it in and you’re back on the other side of the desk. | us | no | Your code’s here. Enter it to sign back in. |
| 27 | Didn’t ask for this? Ignore it. No one gets in without the code, and we’ll never ask you for it. | us | us |  |
| 28 | That code was not accepted. Check the latest email or request a new code. | flat | flat | That code didn’t work. Check the latest email or request a new code. |
| 29 | Sign in and it’ll be in My reports. | us | us |  |
| 30 | Skip it, and this browser can still bring the report back for up to 24 hours. It won’t be saved to My reports. | us | us |  |
| 31 | What keeps tripping recruiters up, and what keeps landing. | no | no | Where recruiters get stuck in your resume, and which details work. |
| 32 | Run a report and save it. Your next version will have something honest to measure against. | us | us |  |
| 33 | Showing your latest 50 reports. Older reports remain stored and can be included in an account export. | flat | flat | Showing your latest 50 reports. Older reports are still stored and can be included in an account export. |
| 34 | Resume saved. 14 skills identified. | flat | us |  |
| 35 | Something broke on our end, not yours. Saved reports aren’t affected. | us | no | Our bad. Something broke on our end. Saved reports aren’t affected. |
| 36 | We couldn’t tell whether this used one of your reports. Check My reports before running it again. | us | us |  |
| 37 | Please upload a PDF, DOCX, or TXT file. | no | no | Upload a PDF, DOCX, or TXT file. |
| 38 | Could not open checkout. Try again. If this continues, contact support. | flat | flat | Our bad. We couldn't open checkout. Try again. If this continues, contact support. |
| 39 | Keep the jobs you want to revisit. | flat | us |  |
| 40 | A recruiter with fifteen years in hiring wrote these criteria. AI applies them, the same way to every resume, and nobody reads yours but you. | us | us |  |
