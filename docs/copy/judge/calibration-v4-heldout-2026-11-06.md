# Voice judge calibration, heldout-2026-11-06

- Run: 2026-11-06T18:03:02.906Z
- Judge: `gpt-6.1-sol`, reasoning low, seed 20261106
- Prompt: `voice-judge-v4`, SHA-256 `17027da35aa907af2d118f6b947a454a9c27f7f80707ad882ada8424cf9914a1`
- Strings: 24; calls: 2; token-calculated spend: $0.0220

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
| 10 | We point to the line that already has one, and ask for the detail you left out. | us | flat | “The line that already has one” leaves the reader guessing what “one” refers to. | Let’s find the detail you left out of your resume. | Says what we do, plainly |
| 16 | Maybe later | flat | us | “Maybe later” is a familiar, plain control for deferring the account step. |  | Generic dismiss any product uses; fine |
| 21 | Opening checkout... | flat | us | “Opening checkout” states what is happening without adding sales language. |  | Three dots where the house style uses … |
| 22 | Passes are paused for now | us | flat | “Passes are paused” shortens the offer's name and leaves unclear whether purchasing or using it is paused. | Job Search Pass purchases are paused for now | Plain and honest |
| 23 | Get pass | no | flat | “Get pass” names the purchase action but drops the offer's name, Job Search Pass. | Get Job Search Pass | A vague button where the glossary says 'Get 5 more reports · $29' |

## Every line

| # | Line | Label | Judge | Judge's rewrite |
| --- | --- | --- | --- | --- |
| 1 | Paste your resume | us | us |  |
| 2 | That email address doesn’t look right. Check it and try again. | us | us |  |
| 3 | No password. The code works once and expires soon. | us | us |  |
| 4 | Too many sign-in emails were sent. Wait before requesting another. | flat | flat | Too many sign-in emails have gone out. Wait before requesting another. |
| 5 | We sent an 8-digit code to {email} | us | us |  |
| 6 | Checkout canceled. Nothing was charged. | us | us |  |
| 7 | Full refund within 14 days: write to support from your checkout email. | us | us |  |
| 8 | Weighing other tools? | no | no | Compare other tools |
| 9 | Here’s the note Jordan never saw. | us | us |  |
| 10 | We point to the line that already has one, and ask for the detail you left out. | us | flat | Let’s find the detail you left out of your resume. |
| 11 | Your best example stops right before the good part. | us | us |  |
| 12 | We’ll rewrite your line. Only from your facts. | us | us |  |
| 13 | Still working on your resume report. You can keep waiting, retry, or stop. | us | us |  |
| 14 | Keep this tab open. | us | us |  |
| 15 | Sign in to save | us | us |  |
| 16 | Maybe later | flat | us |  |
| 17 | Nothing here yet | flat | flat | No reports saved yet. |
| 18 | Your report history could not load. | no | no | We couldn't load My reports. Try again. |
| 19 | Report deleted | us | us |  |
| 20 | We're gathering your account data for download. | us | us |  |
| 21 | Opening checkout... | flat | us |  |
| 22 | Passes are paused for now | us | flat | Job Search Pass purchases are paused for now |
| 23 | Get pass | no | flat | Get Job Search Pass |
| 24 | Run Another | no | no | New report |
