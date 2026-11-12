# The gap card stops reciting: November 12, 2026

## What was wrong

When a resume has time nothing accounts for, the report writes a card about it. On nearly every such card the note was the same sentence:

> If you took care of a family member, name that; if you took a career break, say what you did during it. Include freelance or consulting work only if it was real.

The prompt told the model to offer "the honest options that could fit … without reciting this list", then spelled the list out in detail, and the model recited it. The evaluation harness flags a repeated clause as `W_MECHANICAL_COPY`, and this one sentence was most of that warning.

Across the 22 saved live runs of November 11 and 12 before this change (122 reports), the warning fired 15 times:

| What was flagged | Count |
| --- | --- |
| The recited gap sentence ("if you took… if you took…", "if you were… if you were…") | 7 |
| A gap note that repeats "you've been" while listing the same options | 3 |
| A two-part question repeating its stem ("did you work… did you work") | 3 |
| Other (a deliberate parallel; one question repeated across two cards) | 2 |

Ten of the fifteen were the gap card.

## The change

**The prompt, one instruction in `web/prompts/resume_v3.txt`.** The gap card's example line already carries the options in its blank ("[what you did: caregiving, a career break, study, travel, freelance work if real]"), so the note no longer offers them. It says what the gap does to this person's resume, in one or two sentences, and leaves what to write to the example and the question. The honesty limits stay: never suggest calling the time something it wasn't, and a sabbatical only when the resume shows chosen time off.

Two drafts were thrown away on the way. The first replaced the list with "one plain, true line for that time answers it", and the model recited that instead, on every card. The second said an honest answer "reads better than no answer", with the same result. The instruction that worked gives the note a job and no sentence to borrow.

**The check, `web/lib/evals/checks.ts`.** A two-part question repeats its stem by grammar: "Which agencies did you work with, and what did you work on together?" The repeated-clause check now excuses a question's stem ("did you", "what did you", and one following word), only in a field that ends in a question mark. A repeated clause that isn't the stem is still flagged in a question, and the recited gap sentence is still flagged; both are tested.

## What was run

All on gpt-6.1-terra through the production path. Nothing else was running on the machine during the last three.

| Run | Result | Spend |
| --- | --- | --- |
| Six gap resumes from the worklist set, two runs each, on each of the three drafts | Read by hand; the first two drafts recited a new sentence | $0.42 |
| Golden tier (23 fixtures), final prompt, one run | 22 pass, 1 warning, 0 failures. No score-drift warning | $0.35 |
| The ten synthetic fixtures, final prompt, two runs | 9 pass, 1 warning, 0 failures, twice | $0.25 |

In those 43 reports `W_MECHANICAL_COPY` fired once, on a card whose question repeats a sentence from its own note: a different defect, left for its own look. The other two warnings are `W_SPECIFICITY_LOW` on a summary and an objective rewritten from the resume's own facts, which the check excuses for a card labelled exactly "Summary" or "Headline" and not for "Summary, sentence 1" or "Objective".

Total: about $1.00.

## The notes now

Every gap note from the three final runs, nineteen in all. No two are the same.

| Fixture | The note |
| --- | --- |
| `sales_strong_foundation_mark_sherrod_1` | A recruiter can see your sales progression through Workday, but can’t tell what came after it. That question competes with the results near the top of your resume. |
| `synth_software_engineer_mid_strong_1` | Your resume explains the time through April 2024. After that, a recruiter has to guess what happened before your return to software engineering. |
| `synth_sales_executive_mid_foundation_1` | A recruiter will look for what happened after BrightWave before getting to the sales work. Your resume doesn't account for that time. |
| `synth_hr_manager_director_foundation_1` | A recruiter has to ask what you've been doing since BrightWave instead of focusing on your HR work. Your resume doesn't account for that time. |
| `synth_finance_analyst_senior_weak_1` | A recruiter reaches the end of your Linton role and has to ask what happened next before they can place your recent finance experience. |
| `synth_operations_manager_entry_weak_1` | A recruiter looking at your operations experience has to pause over the unaccounted-for time after Greenfield. That silence is long alongside the work listed before it. |
| `synth_product_manager_entry_elite_1` | A recruiter can see the product work through NovaSense, but can't tell what came after it. That question may take attention away from the features you delivered. |
| `synth_software_engineer_mid_strong_1` | Your summary says you've returned to the workforce, but a recruiter can't tell when or in what role. The caregiving entry explains the earlier pause; the time after it is still open. |
| `synth_sales_executive_mid_foundation_1` | A recruiter looking at your BrightWave sales work will also notice that the resume stops at August 2023. The time since then is unaccounted for. |
| `synth_hr_manager_director_foundation_1` | A recruiter has to ask what you've been doing since BrightWave before they can place your recent HR experience. |
| `synth_finance_analyst_senior_weak_1` | A recruiter reaches the end of the Linton role and has to ask what happened next before returning to your finance work. The resume doesn't explain that time. |
| `synth_operations_manager_entry_weak_1` | The time after Greenfield is longer than any single job listed here. A recruiter is likely to pause over what happened next rather than focus on your operations work. |
| `synth_product_manager_entry_elite_1` | A recruiter can see the product work at NovaSense and BrightLeaf, but can't tell what you've been doing since the internship ended. The dates raise a question before the recruiter can consider how that work fits today. |
| `synth_software_engineer_mid_strong_1` | Your caregiving entry accounts for the time through April 2024. After that, a recruiter has to ask about the timeline instead of staying with your engineering work. |
| `synth_sales_executive_mid_foundation_1` | A recruiter reaches the end of the BrightWave role and has no account of the time since. That question can take attention away from your sales work. |
| `synth_hr_manager_director_foundation_1` | A recruiter has no account of the time after BrightWave. That question can pull attention away from your earlier HR management work. |
| `synth_finance_analyst_senior_weak_1` | Your finance career stops at Linton, so a recruiter is left asking what happened next rather than reading your work there. |
| `synth_operations_manager_entry_weak_1` | A recruiter reaches the end of the Greenfield role and has no account of the time since. That question can pull attention away from your operations and campus work. |
| `synth_product_manager_entry_elite_1` | A recruiter has to stop and ask what happened after the NovaSense internship instead of staying with your product results. Your earlier roles show a clear product path, but the resume leaves the next chapter open. |

## What it doesn't show

- No judge scored these. The claim is narrow: the recited sentence is gone and the notes differ. Whether a note that describes the gap helps a person more than one that lists their options is a product judgment, made here on the grounds that the card's example line already lists them.
- The warm line "taking care of a family member is a real line" no longer reaches the note. It survives in the blank's label. If people with caregiving gaps read the new note as colder, that is the place to look.
- The bundled release evidence is the single golden run above, the first on the final prompt.
