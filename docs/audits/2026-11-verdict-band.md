# A verdict's reaction stays inside its band

November 17, 2026. Code: `verdictAboveBand` and the soft issue in `web/lib/llm/worklist-validator.ts`, and the kept-draft path in `web/lib/llm/validateResumeStreamOutput.ts`. No prompt change.

## What was seen

On the live walk, a posting read scored 68 (Needs more context) and its verdict said "I'd want to talk with you". The band right above it on the page says the recruiter "finishes, hesitates, and moves on unless the pile is thin". The prompt already allows that reaction only from Mostly clear (70) up.

## How often

It's rare. Among the 1,073 distinct saved verdicts in `docs/audits`, none of the 420 below 70 says the recruiter would move the page forward or talk. At 70 and above, 71 do, which is allowed.

A new set of eight synthetic cases just under the line (`manifest.json`) was each read five times on the shipped prompt (`outputs/shipped/`, $0.49). Of the 36 reads below 70, every verdict says "I'd hesitate" or "I'd pass". The live case's own pair (Patricia, Riverbend) scored 74 and 76 in two of its five reads, saying "I'd move this forward", which is right for Mostly clear. That points to the live slip being a draft that wrote the reaction for a mid-70s page and the number for a high-60s one.

The one live case against 456 reads below 70 is roughly 1 in 450 on what's measured, and the measurement can't resolve it better than that. A prompt change was not made: nothing measurable to move, and every prompt change risks the rest of the report.

## The change

- **The rule.** On a score below 70, a verdict that says "I'd want to talk", "I'd move this forward" (or "it", "you", "your resume"), "I'd write to you" or "I'd reach out" is a validation issue. The phrase test flags none of the 420 saved verdicts below 70; "I'd hesitate to move this forward" and "I wouldn't move this forward" never match.
- **One repair.** The issue sends the report back once, with the instruction to keep the score and rewrite the verdict.
- **The draft stands if the repair fails.** The issue is marked soft. If the repair fails for any reason and every fault in the first draft was soft, the first draft is delivered as written (`llm.response.repair_kept_draft`, signal `riyp.report.repair` = `kept_draft`). A wording slip never turns into a lost report.

## Checked

- **Unit tests** (`web/tests/verdict-band.test.ts`): the phrase and its negatives; the soft flag; a draft with a fault of its own isn't soft; the repair's verdict is delivered with the score kept; a failed repair keeps the draft; Mostly clear sends nothing back.
- **The real model.** The live slip was put on the three Riverbend drafts that scored 67 and 68, then sent through the real repair (about $0.06). All three came back with the score unchanged and a verdict that hesitates, for example: "I'd hesitate until I knew what you've done since December 2024 and more about your compliance work." Each repair took 27 to 37 seconds and rewrote the cards, as every repair does.
