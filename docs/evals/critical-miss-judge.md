# Critical Miss judge: running it and reading the results

The judge is an automated stand-in for Matt's blind pick. It asks the question his pick asks: of two reports on the same resume, which Critical Miss is the more important thing to fix first? It applies the [Critical Miss rubric](critical-miss-rubric.md), which cites a source for every criterion. Its results are reported, not gated (see [shipping-gate.md](../promptops/shipping-gate.md#critical-miss-judge-reported-not-gated)).

Code: `web/lib/evals/judge/`. CLI: `web/scripts/run-judge.ts`. Calibration data: `tests/fixtures/judge/contrast-pairs.json` and `tests/fixtures/results/blind-pick/`. Results: `tests/fixtures/results/judge/`.

## Running it

Every command is a paid call to `gpt-6.1-sol` and needs `OPENAI_API_KEY`. Each command stops at its spend ceiling (`--budget-usd`, default $1). Run from `web/`.

```bash
npm run eval:judge -- compare ../tests/fixtures/results/<production>_live_run.json ../tests/fixtures/results/<candidate>_live_run.json
```

```bash
npm run eval:judge -- score ../tests/fixtures/results/<candidate>_live_run.json
```

```bash
npm run eval:judge -- calibrate --set all
```

- **compare** judges each fixture that has a shown report in both runs. It takes the first non-FAIL report per fixture, in run order, as the blind pick did. Put production as the first file (X) and the candidate second (Y).
- **score** gives one Critical Miss per fixture an absolute score with a rationale.
- **calibrate** reruns the calibration sets. Add `--repeat 2` for test-retest, `--ids bp-05,cp-09` for a subset, or `--mode absolute` to score each side alone.
- `--max-misses 3` judges up to three Critical Misses per report, for a contract that returns more than one. The default is 1, which is what the production report shows.
- `--effort low|medium|high` changes the judge's reasoning effort. Calibration ran at medium, so treat any other setting as uncalibrated.

**Only synthetic resumes are sent.** A run file's fixtures are filtered to those tagged `synthetic` with a `synth_` ID and path, and every other fixture is listed as skipped. Real-person smoke and golden fixtures never reach the judge. The guard is code (`isJudgeableFixture`), not a flag, and `npm run test:judge` checks it.

**Blindness.** The judge sees the resume, the review date, and each report's label, Verdict and Critical Miss(es). It never sees a prompt hash, model name, run ID or score, and `test:judge` checks the message for them. Report style can still give a side away, for example the production prompt's long "In the … bullet" headings.

## Reading a comparison

Each fixture is judged twice, once with each report shown first. The combined verdict is:

| Verdict | Meaning |
| --- | --- |
| **X clear** / **Y clear** | Both orders named the same side, and both called it clear. A named rule decides it: a veto, a concrete fact against a structural move, a vague ask against a specific one, an open gap against a minor line, or "Nothing critical" against a real issue. |
| **X slight** / **Y slight** | Both orders named the same side, and at least one called it a judgment call. Treat it as Matt's "Both are good though". |
| **no real difference** | Both orders said so, or **the orders disagreed**. Disagreement means the preference depended on which report came first, so it isn't counted. The table's "Orders" column shows which case it was. |

**Vetoes.** A veto means the judge found a statement in that report the resume doesn't support, and quoted it. Code keeps a veto only when the quote really appears in the report, so the judge can't veto a side for something it never said. A veto still needs a human look: the judge can misread a resume, and the quote check doesn't catch that. Open the JSON and read `orders[].vetoes`.

**What to look at first:**

1. Any **clear** preference for production over the candidate. On calibration, the judge never made a clear pick against Matt; a clear loss is the strongest signal it gives.
2. Vetoes on the candidate side.
3. The X/Y tally, with ties counted separately. Matt's own bar for the November 1 prompt was the new side preferred in 8 of 10, with "no difference" counting against it.

## Reading an absolute score

Each criterion is scored 1–5 with a note citing the resume; `right_thing_first` is the overall judgment, forced to 1 on a veto.

- **Stakes** (C1, C5): whether this is the most important thing on this resume's first read.
- **Fact** (C2): whether it asks for a tangible missing fact rather than a rearrangement.
- **Specific** (C3): whether it names the line and the exact detail to add.
- **Consequence** (C6) and **Honest** (C7).
- **Gap** (C4): scored only when the resume has an open gap or the fix is about one.

Absolute scores are for spotting bad Critical Misses (vetoes, low stakes, vague asks) in a single run. To decide between two prompts, use **compare**: the pairwise verdict is what the calibration tested against Matt's picks.

## How far to trust it

- Calibration of `critical-miss-judge-v3`: [summary](../../tests/fixtures/results/summary_critical_miss_judge_calibration_2026-11-01.md), with raw outputs in `tests/fixtures/results/judge/`. In short: 5 of Matt's 6 decisive blind picks reproduced and none clearly reversed; 25 of 25 contrast pairs right; identical verdicts on every retest and under a second seed; no side-order flips.
- **In-sample.** The rubric was written from the same ten blind-pick items the judge was calibrated on, and the contrast pairs were written from the rubric. Agreement shows the judge applies Matt's stated rules consistently; it doesn't yet show it predicts his next pick. Prompt v3's blind pick, judged by Matt and by the judge before anyone sees his answers, is the first held-out test.
- **Ten items.** One unexplained disagreement moves agreement by 17 points on the six decisive picks.
- **Same family.** The judge (`gpt-6.1-sol`) and the generator (`gpt-6.1-terra`) are different models from the same vendor and generation, so shared blind spots are possible. A cross-vendor judge would need a key this repository doesn't have.
- **Changing the judge.** A change to `web/lib/evals/judge/prompt.ts` changes `judge_prompt_sha256` in every result. Rerun `calibrate --set all` and compare it against the recorded calibration before trusting results from the new version.
