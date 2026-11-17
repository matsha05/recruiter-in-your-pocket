# The role list: directions, not the titles a person moved past

November 17, 2026. Prompt: `web/prompts/resume_v3.txt`, the FIT paragraph's `roles` sentence. Code: `fitListRoles` in `web/lib/reports/worklist-presentation.ts`, used by the report and the PDF.

## What was wrong

On the live check of November 13 a branch manager of five years got "Branch Manager, Assistant Branch Manager, Personal Banker" under **Roles to consider**. Those are her own earlier titles, each more junior than the last. Under that label they read as advice to step back.

The rule asked for "one to four role titles copied exactly from the resume", the first being the job the resume was read for, and said nothing about the rest. So the model filled the list from the resume's own job history. Across the 3,661 saved reads without a posting in `docs/audits`, 71% list two or more titles. Nearly every second title is the person's previous job on the same ladder: "Senior Financial Analyst, FP&A / Financial Analyst", "Account Executive / Sales Development Representative", "Mechanical Engineer II / Mechanical Engineer I", "Staff Accountant / Accounts Payable Clerk".

## The change

**Prompt.** After the first title, the model adds one only when the resume points a second way at the level the person works at now. The new text gives two examples of a real second direction, the headline's title when the latest role has another and the second field of someone who has worked in two. It never adds a title the person was promoted out of or has moved past: "nobody is considering the job they left behind". It also says that one title is a complete list. Nothing else in the prompt changed.

**Report and PDF.** The first title is the job the report was read for, which the first pass already names ("Which job is this for?"). A list of one would repeat it, so it is left out; the section keeps its note. Two or more titles are shown as before. A LinkedIn profile review keeps its list whatever its length, because there the list is the titles on the profile.

## Evaluation

Twenty-two synthetic resumes (`manifest.json`): twenty without a posting, chosen for ladders, career changes, gaps and side work, plus two with a posting. Each was read twice on the candidate prompt (`outputs/`) and twice on the shipped prompt the same day (`outputs-shipped/`). Spend: $0.99 in 94 calls, synthetic resumes only.

| Without a posting, 40 reads each | One title | Two | Three | Four |
| --- | --- | --- | --- | --- |
| Shipped prompt | 7 | 26 | 6 | 1 |
| Candidate | 37 | 3 | 0 | 0 |

The three two-title lists left are real second directions:

- "Shift Supervisor / Freelance Web Developer", twice, for a retail supervisor with dated web work on the side.
- "IT support specialist / junior systems role" once, for a recent graduate whose headline names both.

Every listed title was found word for word in the resume or posting, on both prompts.

- **With a posting:** the posting's title stays second, as before ("Data Analyst / Registered Nurse, Medical-Surgical Unit (Nights)").
- **Scores:** unchanged within the reread spread. The candidate averaged 0.48 points below the shipped prompt on the same day, and the largest per-resume difference of means was 6.0, on the branch manager whose two shipped reads were 77 and 77 and candidate reads 68 and 74. That resume read 68 on the live site on November 13 and averaged 73.6 over seven earlier reads, so the spread is the resume's, not the rule's.
- **Notes:** the fit note no longer names earlier jobs as places to go.

A few candidate lists name a field rather than a title:

- "Elementary teacher", from the headline, once out of two reads.
- "operations supervisor", from the military resume's own objective line.

Both are copied from the resume, as the rule asks.

## Release evidence

The prompt hash changes, so the bundled evidence is regenerated on the combined prompt (this change and the three-card band line from the other session) with the ten synthetic golden fixtures. See `docs/promptops/shipping-gate.md`.
