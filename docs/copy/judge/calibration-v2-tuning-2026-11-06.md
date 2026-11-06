# Voice judge calibration, set-2026-11-06

- Run: 2026-11-06T17:56:56.274Z
- Judge: `gpt-6.1-sol`, reasoning low, seed 20261106
- Prompt: `voice-judge-v2`, SHA-256 `c893b230f5d42281b57114b037c2f7958e1758efb07def3934f8b9188189dde7`
- Strings: 40; calls: 4; token-calculated spend: $0.0485

Labels: Claude (the copy-system session), by hand, against docs/copy-system.md as merged in PR 83, before the judge ran.

| Measure | All lines | Held out (text not in the prompt) |
| --- | --- | --- |
| Judged | 40 of 40 | 40 |
| Exact agreement (us, flat, no) | 30 (75%) | 30 (75%) |
| Us or not | 30 (75%) | 30 (75%) |
| Cohen's kappa | 0.54 | 0.54 |

Too kind (the judge passed a line the labels don't): 7. Too harsh (the judge failed a line the labels pass): 3.

## Every disagreement

| # | Line | Label | Judge | Judge's reason | Judge's rewrite | Label note |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Eighteen got called back. The other 226 have no idea why the recruiter passed. | us | no | “Eighteen” and “226” present hiring figures without a source. | When a recruiter passes, you often don’t get a reason. | A sourced hiring truth in plain words; Matt's November 4 homepage line |
| 8 | Paste the job posting here… | flat | us | “Paste the job posting here” tells the reader exactly what to enter. |  | A placeholder that restates the field; fine for its job |
| 9 | Choose a PDF or DOCX under 4 MB. | flat | us | “Choose a PDF or DOCX under 4 MB” gives the file types and size limit directly. |  | Literal and right, but cold where Matt would say why |
| 13 | Left blank for now. A recruiter will have the same question, and they won’t call to ask it. | flat | us | “A recruiter will have the same question” gives a direct reason to fill in the missing detail. |  | Dry and a little scolding; Matt's answer 10 is warmer ('That's fine… you need a story') |
| 17 | Send it. Then read it against the posting you’re going for. | flat | us | “Read it against the posting you’re going for” is a specific, conversational next step. |  | Fine, but cooler than Matt on a strong resume: no praise, no reason |
| 20 | The Job Search Pass is for what comes next: checking your revision, or tailoring your resume to another job. | flat | us | “Checking your revision, or tailoring your resume to another job” names concrete uses for the Job Search Pass. |  | Colon construction and a slightly sales tone; correct |
| 25 | Paid. One step left. | flat | us | “Paid. One step left.” plainly confirms payment and sets the expectation that there’s one more step. |  | Clear, but clipped fragments where one sentence would be warmer |
| 26 | Your code’s here. Pop it in and you’re back on the other side of the desk. | us | no | “Back on the other side of the desk” adds a playful metaphor to a security step that needs plain instructions. | Your code’s here. Enter it to sign in. | The one warm line in the email |
| 35 | Something broke on our end, not yours. Saved reports aren’t affected. | us | flat | “On our end, not yours” owns the problem appropriately, but the error gives no next step. | Something broke on our end, not yours. Saved reports aren’t affected. Try again. | Owns it plainly, which is Matt's error voice |
| 39 | Keep the jobs you want to revisit. | flat | us | “Keep the jobs you want to revisit” gives a plain, useful reason to save a job. |  | Fine and literal; any job tracker could say it |

## Every line

| # | Line | Label | Judge | Judge's rewrite |
| --- | --- | --- | --- | --- |
| 1 | Eighteen got called back. The other 226 have no idea why the recruiter passed. | us | no | When a recruiter passes, you often don’t get a reason. |
| 2 | Not forty tips. Every line a recruiter trips on, in the order they hit it. | no | no | Every line a recruiter trips on, in the order they read it. |
| 3 | No ATS score. No interview odds. Just what reads clearly and what doesn’t. | no | no | See what reads clearly and what doesn’t. The report doesn’t include an ATS score or interview odds. |
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
| 22 | A writer, a keyword scanner, a builder, and a recruiter’s read are different purchases, and the read is the one that decides: | no | no | A writer, a keyword scanner, a builder, and a recruiter’s review are different purchases. The recruiter decides whether to move forward. |
| 23 | Want another read? | no | no | Get another report |
| 24 | You’re in. Five more reads. | us | us |  |
| 25 | Paid. One step left. | flat | us |  |
| 26 | Your code’s here. Pop it in and you’re back on the other side of the desk. | us | no | Your code’s here. Enter it to sign in. |
| 27 | Didn’t ask for this? Ignore it. No one gets in without the code, and we’ll never ask you for it. | us | us |  |
| 28 | That code was not accepted. Check the latest email or request a new code. | flat | flat | That code didn’t work. Check the latest email or request a new code. |
| 29 | Sign in and it’ll be in My reports. | us | us |  |
| 30 | Skip it, and this browser can still bring the report back for up to 24 hours. It won’t be saved to My reports. | us | us |  |
| 31 | What keeps tripping recruiters up, and what keeps landing. | no | no | What recruiters keep finding unclear in your resume, and what’s working. |
| 32 | Run a report and save it. Your next version will have something honest to measure against. | us | us |  |
| 33 | Showing your latest 50 reports. Older reports remain stored and can be included in an account export. | flat | flat | Showing your latest 50 reports. Older reports are still saved and can be included in an account export. |
| 34 | Resume saved. 14 skills identified. | flat | flat | Resume saved. We found 14 skills. |
| 35 | Something broke on our end, not yours. Saved reports aren’t affected. | us | flat | Something broke on our end, not yours. Saved reports aren’t affected. Try again. |
| 36 | We couldn’t tell whether this used one of your reports. Check My reports before running it again. | us | us |  |
| 37 | Please upload a PDF, DOCX, or TXT file. | no | no | Upload a PDF, DOCX, or TXT file. |
| 38 | Could not open checkout. Try again. If this continues, contact support. | flat | flat | Our bad. Checkout didn't open. Try again. If this continues, contact support. |
| 39 | Keep the jobs you want to revisit. | flat | us |  |
| 40 | A recruiter with fifteen years in hiring wrote these criteria. AI applies them, the same way to every resume, and nobody reads yours but you. | us | us |  |
