# Critical Miss judge: running it and reading the results

The judge is an automated stand-in for Matt's blind pick. It asks the question his pick asks: of two reports on the same resume, which Critical Miss is the more important thing to fix first? It applies the [Critical Miss rubric](critical-miss-rubric.md), which cites a source for every criterion. Since November 1, 2026 it **gates prompt changes**, in place of Matt's blind pick: see [shipping-gate.md](../promptops/shipping-gate.md#critical-miss-judge-gates-prompt-changes).

Code: `web/lib/evals/judge/` (entry point `index.ts`). CLI: `web/scripts/run-judge.ts`. Calibration data: `tests/fixtures/judge/contrast-pairs.json` and `tests/fixtures/results/blind-pick/`. Results: `tests/fixtures/results/judge/`.

## What it replaced, and what it deliberately isn't

**The old whole-report judge is retired.** `web/lib/evals/judge.ts` scored whole reports on evidence, actionability, tone and "methodology" with `gpt-4o-mini`. Its code is now this module, and its rubric is gone, for four reasons:

1. It wasn't calibrated to Matt's judgment.
2. Its scores sat near the ceiling (9.1/10 on its last bulk run), so it couldn't separate a good prompt from a worse one.
3. Its methodology dimension scored against the 7.4-second reading model, which the research library now treats as vendor data, not a rule.
4. It sent every fixture to the judge model, including real people's resumes, and its spend wasn't counted in the run budget.

Evidence and tone are already measured without a model, by the production validator and the report-integrity checks. Its two callers now use the Critical Miss judge:

- `npm run eval -- --with-judge` records an absolute Critical Miss score in each fixture's `judge_result`, for synthetic fixtures and shown (non-FAIL) reports only. The judge's spend counts toward the run's `--budget-usd`.
- `npm run eval:bulk-analyze` scores Critical Misses only for `--source synthetic`. For HuggingFace and other sources, the judge is off.

The model is fixed in `lib/evals/judge/client.ts`. `OPENAI_JUDGE_MODEL` is no longer read and was removed from the env examples.

**It is not the gauntlet.** The retired gauntlet (`web/gauntlet/`, ended by Matt on August 10, 2026 because its token and review cost outweighed its usefulness) bound 12 blind A/B cases to receipts, seals, critic verdicts and journey captures. This judge keeps one idea from its blind-judgment template, a blind A, B or tie with a rationale, and nothing else. It is a CLI that gates two runs in about a minute for about $0.19. Keep it that way: an added check should be a criterion in the rubric, not a new evidence chain.

## Running it

Every command makes paid calls (to `gpt-6.1-sol` by default) and needs `OPENAI_API_KEY`. Each command stops at its spend ceiling (`--budget-usd`, default $1). Run from `web/`; from the repository root, `npm run eval:judge -- …` routes to `web/`, and file paths are relative to `web/`.

```bash
npm run eval:judge -- compare ../tests/fixtures/results/<production>_live_run.json ../tests/fixtures/results/<candidate>_live_run.json
```

```bash
npm run eval:judge -- score ../tests/fixtures/results/<candidate>_live_run.json
```

```bash
npm run eval:judge -- calibrate --set all
```

- **compare** is the gate. Put production as the first file (X) and the candidate second (Y). Each synthetic fixture with a shown production report is compared; the first non-FAIL report per fixture is used, in run order, as the blind pick did. Each candidate Critical Miss is also scored alone for the veto. It prints `GATE: PASS` or `GATE: FAIL` and exits nonzero on FAIL. A `--limit` run never passes.
- **score** gives one Critical Miss per fixture an absolute score with a rationale.
- **calibrate** reruns the calibration sets. Add `--repeat 2` for test-retest, `--ids bp-05,cp-09` for a subset, or `--mode absolute` to score each side alone.
- `--max-misses 3` judges up to three Critical Misses per report, for a contract that returns more than one. The default is 1, which is what the production report shows.
- **self-preference** measures whether a judge favors Critical Misses written by its own model (`--author`, `--judges`).
- `--model gpt-6-astra` runs the stronger, pricier judge. It calibrated the same as Sol (39 of 40 pairs identical) at about 5.6 times the cost, so Sol is the default. The generator's model is refused.
- `--effort low|medium|high` changes the judge's reasoning effort, and `--seed` its sampling seed. Calibration ran at medium, so treat any other effort as uncalibrated.
- `compare` works on any two live_run files, whatever prompt or model produced them, since the judge sees only the reports.

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

1. The `GATE:` line. To pass, the candidate must be preferred on at least 80% of compared resumes (ties count against), with no veto on a candidate side, across at least 8 fully judged resumes. That is Matt's bar for his own November 1 pick.
2. Any **clear** preference for production. On calibration, the judge never made a clear pick against Matt; a clear loss is the strongest signal it gives.
3. Vetoes on the candidate side, in the "Candidate alone" column, and their quoted claims in the JSON.

## Reading an absolute score

Each criterion is scored 1–5 with a note citing the resume; `right_thing_first` is the overall judgment, forced to 1 on a veto.

- **Stakes** (C1, C5): whether this is the most important thing on this resume's first read.
- **Fact** (C2): whether it asks for a tangible missing fact rather than a rearrangement.
- **Specific** (C3): whether it names the line and the exact detail to add.
- **Consequence** (C6) and **Honest** (C7).
- **Gap** (C4): scored only when the resume has an open gap or the fix is about one.

Absolute scores are for spotting bad Critical Misses (vetoes, low stakes, vague asks) in a single run. To decide between two prompts, use **compare**: the pairwise verdict is what the calibration tested against Matt's picks.

## How far to trust it

- Calibration of `critical-miss-judge-v3`: [summary](../../tests/fixtures/results/summary_critical_miss_judge_calibration_2026-11-01.md), with raw outputs in `tests/fixtures/results/judge/`. In short:
  - 5 of Matt's 6 decisive blind picks reproduced, and none clearly reversed, on both Sol and Astra.
  - 29 of the 30 contrast pairs right as written. The miss led to a rubric clarification.
  - Identical verdicts on every retest, including under a second seed.
  - No side-order flips on Sol.
  - Self-preference +0.00.
- **In-sample.** The rubric was written from the same ten blind-pick items the judge was calibrated on, and the contrast pairs were written from the rubric. Agreement shows the judge applies Matt's stated rules consistently; it doesn't yet show it predicts his next pick. Matt chose to gate on the judge without a further blind pick of his own, so a gate result is the judge's call, not a check against him.
- **Ten items.** One unexplained disagreement moves agreement by 17 points on the six decisive picks.
- **Same family.** The judge (`gpt-6.1-sol`) and the generator (`gpt-6.1-terra`) are different models from the same vendor and generation, so shared blind spots are possible. The self-preference probe found Sol no more favorable to its own writing than Astra was, on ten items. A cross-vendor judge would need a key this repository doesn't have.
- **Changing the judge.** A change to `web/lib/evals/judge/prompt.ts` changes `judge_prompt_sha256` in every result. Rerun `calibrate --set all` and compare it against the recorded calibration before trusting results from the new version.
