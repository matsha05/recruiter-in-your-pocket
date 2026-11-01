# Validator fixes on the production prompt (83b2a2d1)

Date: 2026-11-01. No model calls.

This replays the production prompt's saved outputs through two validators:

- **Old:** origin/main `446fd41`.
- **Fixed:** `11a7a021` and `64b12217`.

The outputs are:

- 30 fresh generations, run `eval_1793553133997`: 10 synthetic golden fixtures × 3, `gpt-6.1-terra`.
- The 13 validated reports from the October 31 runs (`web/tests/fixtures/report-integrity/live-outputs-83b2a2d1.json`).

| Validator | Pass | Fail | Narrative-audit issues |
|:--|:--|:--|:--|
| Old (`446fd41`) | 41 of 43 | 2 | 5, in 2 reports |
| Fixed | 41 of 43 | 2 | 3, in the same 2 reports |

- **No regression.** No output that passed the old validator fails the fixed one.
- **No rescue.** The fixes clear 2 of the 5 false issues in the two withheld reports, but each report still fails on a class the fixes don't cover:

| Report | Cleared by the fixes | Still failing |
|:--|:--|:--|
| `synth_data_scientist_senior_elite_1`, run 2 | "The mix of delivery and mentoring fits the senior and team-lead titles shown." | The question "What led you to decide to integrate GPU-accelerated models into the FinEdge fraud pipeline?" is flagged as an unresolved relationship binding |
| `synth_project_manager_vp_strong_1`, run 3 | "This could add detail about your role without assuming priorities conflicted." | "That detail is worth keeping because it shows which groups you brought together." refers back to the previous sentence. "multidisciplinary" doesn't match the resume's "multi-disciplinary" |

Both withheld reports are the repaired drafts; the first drafts were not saved. The fixed classes are prompt-independent. They were found on the Critical Miss prompt's outputs, where they withheld 1 or 2 reports per run, and two of them also appear in the production prompt's outputs above. On this sample, though, they do not change any production pass or fail outcome.

To stop withholding these two reports, the validator needs three more fixes:

1. Match hyphenated and joined spellings of the same word.
2. Ground a question's "decide to integrate" relationship against the resume line it asks about.
3. Handle a summary sentence that refers back to the previous one.

The third can't be done by word matching without letting invented claims through.

Paired fabrication controls for every fix pass: `npm run test:source-fidelity`, `npm run test:llm-contract`, `npm run test:release-integrity`.
