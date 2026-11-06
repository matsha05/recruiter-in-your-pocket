# The voice judge

A second reader for product copy, built November 6, 2026. It scores strings against the copy system (`docs/copy-system.md` §1 to §4) on a small rubric (names the subject, says what happens, Matt would say it, one aside at most, no tic) and proposes a rewrite for anything that isn't "us". Code: `web/lib/evals/voice-judge/`. Command: `npm run copy:judge` from `web/`.

It never runs in production. Every model call is paid and needs `RIYP_ALLOW_PAID_EVALS=true`; the spend ceiling (`--budget-usd`, at most $5) stops a run. `--dry-run` runs only the free pattern checks. The judge runs on `gpt-6.1-sol`, a different model from the report's generator, and refuses the generator's model.

```bash
npm run copy:judge -- file new-strings.json --dry-run
```

```bash
RIYP_ALLOW_PAID_EVALS=true npm run copy:judge -- file new-strings.json --budget-usd 0.5
```

A strings file is a JSON array of `{ "text": "...", "moment": "pricing", "kind": "jsx-text" }`; the moments are the inventory's.

## Calibration

The judge was checked against hand labels before anyone relied on it. Matt set the rating round aside and gave his own words instead (`docs/copy/calibration/matt-voice-2026-11-06.md`), so the labels are the copy-system session's, made by hand against the merged copy system before each set's first judge run. When Matt rates lines, his labels replace these.

Two sets, both real strings from the site:

- **The tuning set**, 40 lines (`calibration/set-2026-11-06.json`, labels `ratings-2026-11-06.json`). The prompt was changed twice in response to its disagreements.
- **The held-out set**, 24 lines (`calibration/heldout-2026-11-06.json`, labels `heldout-ratings-2026-11-06.json`), labelled before any run and never used to change the prompt. A unit test checks that none of its lines, or its distinctive phrases, are in the prompt. This is the honest number.

| Prompt | Set | Exact (us, flat, no) | Cohen's kappa | Lines labelled "no" that it failed | Its "no" verdicts that were right |
| --- | --- | --- | --- | --- | --- |
| v1 | tuning | 31 of 40 | 0.61 | 6 of 6 | 6 of 10 |
| v2 | tuning | 30 of 40 | 0.54 | 6 of 6 | 6 of 8 |
| v2 | held out | 20 of 24 | 0.67 | 4 of 4 | 4 of 5 |
| v3 | tuning | 31 of 40 | 0.58 | 6 of 6 | 6 of 7 |
| v3 | held out | 19 of 24 | 0.58 | 3 of 4 | 3 of 3 |

v3 is the shipped prompt. The differences between v2 and v3 are about one line, which is run-to-run noise at this size, so tuning stopped there. A kappa near 0.6 is moderate-to-substantial agreement; the LLM-as-judge literature puts strong judges near human-human agreement, and this one is close to that on the call that matters.

What the numbers say, in words:

- **It catches what a reader would feel.** Across both sets it failed 9 of the 10 lines labelled "no" (coined words, "please", Title Case on a button, a pitch asked as a question, "not X but Y" punch). The one it softened to "flat" was the "Get pass" button.
- **Most misses are on the soft line between "us" and "flat".** The judge is more lenient than the labels on cool, literal lines ("Keep the jobs you want to revisit.", "Resume saved. 14 skills identified."). Treat "flat" as "could be warmer", not as a failure.
- **One stable bias against Matt's voice.** It keeps failing the sign-in email's warm opening ("Pop it in and you're back on the other side of the desk."), reading the aside as noise in a security step, even after v3 says the opening line may be warm. When the judge and the read-aloud disagree about an aside Matt approved, the read-aloud wins (copy system §7, step 5).
- **It reads strings out of context.** "We point to the line that already has one" is clear on the homepage, after "Show the result instead."; alone, the judge can't tell what "one" is. Judge a screen's strings together when the order matters.

What changed between versions, all from the tuning set's disagreements:

- v2: asides where people pause are the voice and must not be edited out; a line beside a button need not repeat it; ownership in an error is not a joke; "flat" covers stiff, passive and swap-test lines.
- v3: a specific figure about a named thing ("244 applicants") is not an invented statistic; a sign-in email's opening may be warm.

Every run's full record (each line, the label, the verdict, the reason and the rewrite) is beside this file: `calibration-v1-2026-11-06.*`, `calibration-v2-*`, `calibration-v3-*`.

## Spend

Recorded in `docs/promptops/shipping-gate.md`, "Voice judge".
