# Voice judge calibration, heldout-2026-11-06

- Run: 2026-11-06T17:57:09.781Z
- Judge: `gpt-6.1-sol`, reasoning low, seed 20261106
- Prompt: `voice-judge-v2`, SHA-256 `c893b230f5d42281b57114b037c2f7958e1758efb07def3934f8b9188189dde7`
- Strings: 24; calls: 2; token-calculated spend: $0.0211

Labels: Claude (the copy-system session), by hand, against docs/copy-system.md, before any judge run on these lines.

| Measure | All lines | Held out (text not in the prompt) |
| --- | --- | --- |
| Judged | 24 of 24 | 24 |
| Exact agreement (us, flat, no) | 20 (83%) | 20 (83%) |
| Us or not | 20 (83%) | 20 (83%) |
| Cohen's kappa | 0.67 | 0.67 |

Too kind (the judge passed a line the labels don't): 2. Too harsh (the judge failed a line the labels pass): 2.

## Every disagreement

| # | Line | Label | Judge | Judge's reason | Judge's rewrite | Label note |
| --- | --- | --- | --- | --- | --- | --- |
| 10 | We point to the line that already has one, and ask for the detail you left out. | us | flat | “Already has one” has no clear referent, so the reader has to work out what the line contains. | Let’s look at your line and ask for the detail you left out. | Says what we do, plainly |
| 16 | Maybe later | flat | us | “Maybe later” is a natural, unmistakable control for declining for now. |  | Generic dismiss any product uses; fine |
| 21 | Opening checkout... | flat | us | “Opening checkout” is a literal status for the purchase step. |  | Three dots where the house style uses … |
| 22 | Passes are paused for now | us | no | “Passes are paused” shortens the offer's name and leaves its availability unclear. | The Job Search Pass isn't available right now | Plain and honest |

## Every line

| # | Line | Label | Judge | Judge's rewrite |
| --- | --- | --- | --- | --- |
| 1 | Paste your resume | us | us |  |
| 2 | That email address doesn’t look right. Check it and try again. | us | us |  |
| 3 | No password. The code works once and expires soon. | us | us |  |
| 4 | Too many sign-in emails were sent. Wait before requesting another. | flat | flat | Too many sign-in emails went out. Wait before you request another. |
| 5 | We sent an 8-digit code to {email} | us | us |  |
| 6 | Checkout canceled. Nothing was charged. | us | us |  |
| 7 | Full refund within 14 days: write to support from your checkout email. | us | us |  |
| 8 | Weighing other tools? | no | no | Compare other tools |
| 9 | Here’s the note Jordan never saw. | us | us |  |
| 10 | We point to the line that already has one, and ask for the detail you left out. | us | flat | Let’s look at your line and ask for the detail you left out. |
| 11 | Your best example stops right before the good part. | us | us |  |
| 12 | We’ll rewrite your line. Only from your facts. | us | us |  |
| 13 | Still working on your resume report. You can keep waiting, retry, or stop. | us | us |  |
| 14 | Keep this tab open. | us | us |  |
| 15 | Sign in to save | us | us |  |
| 16 | Maybe later | flat | us |  |
| 17 | Nothing here yet | flat | flat | Your saved reports will show up here. |
| 18 | Your report history could not load. | no | no | We couldn't load My reports. Try again. |
| 19 | Report deleted | us | us |  |
| 20 | We're gathering your account data for download. | us | us |  |
| 21 | Opening checkout... | flat | us |  |
| 22 | Passes are paused for now | us | no | The Job Search Pass isn't available right now |
| 23 | Get pass | no | no | Get Job Search Pass |
| 24 | Run Another | no | no | New report |
