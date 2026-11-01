# Critical Miss: before and after (plan items 1.3 and 1.9)

Date: 2026-11-01. Model: `gpt-6.1-terra`, medium reasoning, 8,000-token ceiling, high-reasoning repair (the production configuration). Every number below comes from a saved live run replayed through validation candidate `0766adc18e3dca9781feeb8b8970ab909644d7a2`, so before and after use the same validator and the same eval harness.

## What changed

- **1.3.** The Critical Miss is "the one thing to fix first" (D2). The prompt checks, in order:
  1. An end date with nothing later.
  2. An unclear target role.
  3. A title that the bullets don't support.
  4. A strong result buried low on the page.

  Only then does it fall back to the line a recruiter reads first. The Verdict, takeaway, biggest-gap example and summary question point at the same issue. The reason uses recruiter reasoning for the role. A resume with nothing consequential says "nothing needs fixing first", and its one refinement is marked `impact_level: "low"`.
- **1.9.** In the prompt only: `fix` is a 7 to 12 word imperative headline, and the location and conditions move to `why`.
- **Validator.** Seven classes of false rejection or dropped heading were found during these runs, each fixed with paired fabrication controls (`11a7a021`, `64b12217`). They withheld grounded reports on the current production prompt too.

## Result

| Check | Before: prompt `83b2a2d1` | v1 `fd692fcf` | v2 `a711fd79` | Final golden `55bee48b` |
|:--|:--|:--|:--|:--|
| Generations | 10 synthetic × 3 | 10 synthetic × 3 | 10 synthetic × 3 | all 23 golden × 1 |
| PASS / WARN / FAIL | 25 / 3 / 2 | 27 / 3 / 0 | 28 / 2 / 0 | 22 / 1 / 0 |
| Critical Miss structural | 2 of 28 | 19 of 30 | 19 of 30 | 11 of 23 |
| Structural issue flagged, Critical Miss a line edit | 14 | 2 | 0 | 1 |
| Verdict and Critical Miss disagree | 15 | 2 | 1 | 1 |
| Verdict raises no concern over a Critical Miss | 8 | 0 | 0 | 2 |
| Nothing critical | 0 | 6 | 6 | 5 |
| Model's first fix dropped by validation | 0 | 3 | 1 | 2 |
| Fix headings over 12 words | 81 of 81 (longest 27) | 0 of 62 | 0 of 79 (longest 11) | 0 of 56 (longest 10) |
| Headings that open with a location / carry a condition | 77 / 9 | 0 / 0 | 0 / 0 | 0 / 0 |
| Keep/fix collisions, as generated → shown | 6 → 0 | 5 → 0 | 10 → 0 | 8 → 0 |

Smoke (3 fixtures, final prompt): 2 PASS, 1 WARN, 0 FAIL. The Critical Miss is structural in 1 of 3, with no disagreement and no skipped structural issue.

The final golden run generated 20 PASS, 1 WARN, 2 FAIL on the clean candidate `1ddcc7b5`. Both failures were validator false rejections ("practice" against "Practicing", and a reason that said "without assuming a conflict occurred"), and both are fixed in `64b12217`. The unchanged outputs replay as 22 PASS, 1 WARN, 0 FAIL.

### Kinds of Critical Miss after the change

- **Dates** (6 of 23 golden): "Say what you've done since August 2023." The reason names the date line and says nothing later is listed, without computing or guessing the gap.
- **Buried result** (4 of 23): "Move the 107-hire training result ahead of the council description."
- **Direction** (1 of 23): an elite resume whose headline is broader than the record.
- **Nothing critical** (5 of 23, all scoring 91–95): "Nothing needs fixing first", plus one optional refinement.
- **Line edits** (12 of 23, including four optional refinements on nothing-critical reports): now headlines such as "Name a product or infrastructure project you directed."

### Examples

| Fixture | Before | After |
|:--|:--|:--|
| Sales executive, ends Aug 2023 | "In the BrightWave account-support bullet, specify which account tasks you handled and what you contributed to proposals or presentations." | "Say what you have done since August 2023." |
| Data scientist, 92 | "In the hospital readmissions bullet, identify the patient group and comparison used to assess the 15% reduction, if you can verify them." | Verdict: "…so nothing needs fixing first." Refinement: "Explain how the reported readmission reduction was assessed." |
| UX design manager | "In the UX budget and vendor contracts bullet, add the budget size and one spending or vendor decision you made, if you can verify them." | Two of three runs lead with the opening bullet's resourcing decisions; one moves the buried 15% retention result up. |

## Score test-retest (same 10 fixtures, 3 runs each)

| Fixture | Before | After (v2) |
|:--|:--|:--|
| synth_data_scientist_senior_elite_1 | 92, 92, 92 | 94, 95, 94 |
| synth_marketing_manager_vp_elite_1 | 88, 88, 90 | 91, 88, 89 |
| synth_software_engineer_mid_strong_1 | 84, 83, 83 | 84, 83, 84 |
| synth_ux_designer_director_strong_1 | 82, 84, 82 | 81, 84, 82 |
| synth_sales_executive_mid_foundation_1 | 58, 58, 58 | 57, 58, 57 |
| synth_hr_manager_director_foundation_1 | 58, 59, 62 | 58, 57, 58 |
| synth_finance_analyst_senior_weak_1 | 58, 59, 58 | 58, 57, 58 |
| synth_operations_manager_entry_weak_1 | 58, 58, 58 | 58, 58, 58 |
| synth_project_manager_vp_strong_1 | 84, 84, 84 | 84, 84, 85 |
| synth_product_manager_entry_elite_1 | 86, 86, 86 | 88, 86, 86 |

The largest range is 3 points after (4 before). Mean drift is within 2.3 points for every fixture; the largest is the data scientist (+2.3). v1 tied "nothing critical" to the 90–99 band and lifted the marketing VP to 92–94. v2 decouples the two ("this check never moves the score"), and the VP returned to 88–91. Two golden scores sit just outside their expected range but inside the harness tolerance and pass: the finance controller at 68 (70–80) and the ministry leader at 84 (68–82). Earlier proofs did not run those fixtures on this model, so no comparison is available.

## Spend (Matt approved up to $20)

| Run | Prompt | Generations | Calls | Cost |
|:--|:--|:--|:--|:--|
| `eval_1793553133997` before | `83b2a2d1` | 30 | 43 | $0.64038115 |
| `eval_1793553816681` v1 | `fd692fcf` | 30 | 38 | $0.53955720 |
| `eval_1793555238116` v2 | `a711fd79` | 24 of 30 (6 cut off by an app restart before any call) | 32 | $0.47035305 |
| `eval_1793560274286` v2, the 6 missing | `a711fd79` | 6 | 8 | $0.14014625 |
| `eval_1793560728771` smoke | `55bee48b` | 3 | 4 | $0.08897125 |
| `eval_1793560808592` golden | `55bee48b` | 23 | 30 | $0.45225975 |
| **Total** | | 116 | 155 | **$2.33166865** |

One attempt was refused by the harness's call ceiling before any spend. Replays cost nothing.

## How to read these numbers

- The harness matches wording, so its labels are its own view. This pass widened it to read the new phrasing: "nothing later is listed", "ahead of", "activity since Oct. 2023", "may be missed". The before column is re-scored with the same harness, so its counts differ from the earlier baseline (`summary_integrity_baseline_2026-11-01.md`: 13 reports, 6 disagreements, 7 skipped structural issues).
- The ten synthetic fixtures over-represent ended roles: six of ten end in 2023 or 2024 with nothing later. That is why the dates check dominates in the synthetic runs.

## Not done or not verified

- Plan 1.3's own bar, Matt's blind pick on about 30 resumes, has not been run.
- **Nothing critical still sits under a "Critical Miss" label.** The UI shows the optional refinement under that label. The prompt signals it with `impact_level: "low"` and a Verdict that says nothing needs fixing first. A UI state that reads this signal is still to build. The schema still requires at least one fix.
- **Dates can't weigh recency.** Production sends the model no current date, so a role that ended last month gets the same dates Critical Miss as one that ended years ago.
- **Remaining drops.** In two final-golden reports, a repaired draft opened its first fix with "Choose" or "Address". Validation dropped it, so a later fix shows as the Critical Miss. Both reports only reached repair because of the false rejections fixed in `64b12217`.
- **Remaining false rejections (old-prompt outputs only).** Two classes from the current production prompt are not fixed:
  - a summary sentence that points back at the previous one ("which groups you brought together");
  - a question flagged as an unresolved relationship binding.

  Neither recurred in 86 generations on the new prompt.
- **Small wording habit.** The dates reason often ends "…if applicable".
