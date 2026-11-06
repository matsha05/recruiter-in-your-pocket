# Voice judge calibration, heldout-2026-11-06

- Run: 2026-11-06T17:58:39.049Z
- Judge: `gpt-6.1-sol`, reasoning low, seed 20261106
- Prompt: `voice-judge-v3`, SHA-256 `e14a3ebf7dfd63937a186be14a921d72385e24d03473d615e73ce7caf83482be`
- Strings: 24; calls: 2; token-calculated spend: $0.0243

Labels: Claude (the copy-system session), by hand, against docs/copy-system.md, before any judge run on these lines.

| Measure | All lines | Held out (text not in the prompt) |
| --- | --- | --- |
| Judged | 24 of 24 | 24 |
| Exact agreement (us, flat, no) | 19 (79%) | 19 (79%) |
| Us or not | 20 (83%) | 20 (83%) |
| Cohen's kappa | 0.58 | 0.58 |

The call a gate depends on: of 4 lines labelled "no", the judge failed 3; of its 3 "no" verdicts, 3 were labelled "no".

Too kind (the judge passed a line the labels don't): 2. Too harsh (the judge failed a line the labels pass): 2.

## Every disagreement

| # | Line | Label | Judge | Judge's reason | Judge's rewrite | Label note |
| --- | --- | --- | --- | --- | --- | --- |
| 10 | We point to the line that already has one, and ask for the detail you left out. | us | flat | “Already has one” has no clear referent, so the reader has to work out what the line contains. | Let’s find the line that needs the detail you left out. | Says what we do, plainly |
| 16 | Maybe later | flat | us | “Maybe later” is an ordinary, clear way to defer an optional step. |  | Generic dismiss any product uses; fine |
| 21 | Opening checkout... | flat | us | “Opening checkout” gives the immediate status in literal terms. |  | Three dots where the house style uses … |
| 22 | Passes are paused for now | us | flat | “Passes are paused” is an indirect way to say the Job Search Pass is temporarily unavailable. | Job Search Pass is unavailable for now | Plain and honest |
| 23 | Get pass | no | flat | “Get pass” is clipped rather than conversational and omits the offer's full name. | Get Job Search Pass | A vague button where the glossary says 'Get 5 more reports · $29' |

## Every line

| # | Line | Label | Judge | Judge's rewrite |
| --- | --- | --- | --- | --- |
| 1 | Paste your resume | us | us |  |
| 2 | That email address doesn’t look right. Check it and try again. | us | us |  |
| 3 | No password. The code works once and expires soon. | us | us |  |
| 4 | Too many sign-in emails were sent. Wait before requesting another. | flat | flat | Too many sign-in emails went out. Wait before requesting another. |
| 5 | We sent an 8-digit code to {email} | us | us |  |
| 6 | Checkout canceled. Nothing was charged. | us | us |  |
| 7 | Full refund within 14 days: write to support from your checkout email. | us | us |  |
| 8 | Weighing other tools? | no | no | Compare other tools |
| 9 | Here’s the note Jordan never saw. | us | us |  |
| 10 | We point to the line that already has one, and ask for the detail you left out. | us | flat | Let’s find the line that needs the detail you left out. |
| 11 | Your best example stops right before the good part. | us | us |  |
| 12 | We’ll rewrite your line. Only from your facts. | us | us |  |
| 13 | Still working on your resume report. You can keep waiting, retry, or stop. | us | us |  |
| 14 | Keep this tab open. | us | us |  |
| 15 | Sign in to save | us | us |  |
| 16 | Maybe later | flat | us |  |
| 17 | Nothing here yet | flat | flat | No saved reports yet. |
| 18 | Your report history could not load. | no | no | Our bad. My reports didn't load. Try again. |
| 19 | Report deleted | us | us |  |
| 20 | We're gathering your account data for download. | us | us |  |
| 21 | Opening checkout... | flat | us |  |
| 22 | Passes are paused for now | us | flat | Job Search Pass is unavailable for now |
| 23 | Get pass | no | flat | Get Job Search Pass |
| 24 | Run Another | no | no | New report |
