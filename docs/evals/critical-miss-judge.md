# Critical Miss judge: running it and reading the results

The judge is an automated stand-in for Matt's blind pick. It asks the question his pick asks: of two reports on the same resume, which Critical Miss is the more important thing to fix first? It applies the [Critical Miss rubric](critical-miss-rubric.md), which cites a source for every criterion. Since November 1, 2026 it **gates prompt changes**, in place of Matt's blind pick: see [shipping-gate.md](../promptops/shipping-gate.md#critical-miss-judge-gates-prompt-changes).

Code: `web/lib/evals/judge/` (entry point `index.ts`). CLI: `web/scripts/run-judge.ts`. Calibration data: `tests/fixtures/judge/contrast-pairs.json`, `tests/fixtures/judge/count-calibration.json` and `tests/fixtures/results/blind-pick/`. Gate key: `tests/fixtures/judge/count-check-key.json`. Results: `tests/fixtures/results/judge/`.

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

- **compare** is the gate. Put production as the first file (X) and the candidate second (Y).
  - Each synthetic fixture with a shown production report is compared. The first non-FAIL report per fixture is used, in run order, as the blind pick did.
  - Each candidate report is also scored alone for the veto.
  - The [count checks](#count-checks) run on the candidate's labeled resumes. `--key <path>` (relative to the repository root) points at a different key.
  - It prints `GATE: PASS` or `GATE: FAIL` and exits nonzero on FAIL. A `--limit` run never passes and skips the count calls.
- **score** gives each fixture's Critical Misses an absolute score with a rationale.
- **calibrate** reruns the calibration sets. Add `--repeat 2` for test-retest, `--ids bp-05,cp-09` for a subset, or `--mode absolute` to score each side alone. `--set count` checks the count prompt against hand-labeled reports.
- **What a report shows.** By default each report shows what a reader sees as its Critical Misses: every fix flagged `critical: true`, up to three, or, for a report without flags (production `83b2a2d1`), only its first fix. `--max-misses <1-3>` overrides that for pairwise and absolute calls; `--max-misses 3` shows an unflagged report's first three fixes. The count checks always use the default.
- **self-preference** measures whether a judge favors Critical Misses written by its own model (`--author`, `--judges`).
- `--model gpt-6-astra` runs the stronger, pricier judge. It calibrated the same as Sol (39 of 40 pairs identical) at about 5.6 times the cost, so Sol is the default. The generator's model is refused.
- `--effort low|medium|high` changes the judge's reasoning effort, and `--seed` its sampling seed. Calibration ran at medium, so treat any other effort as uncalibrated.
- `compare` works on any two live_run files, whatever prompt or model produced them, since the judge sees only the reports.

**Only synthetic resumes are sent.** A run file's fixtures are filtered to those tagged `synthetic` with a `synth_` ID and path, and every other fixture is listed as skipped. Real-person smoke and golden fixtures never reach the judge. The guard is code (`isJudgeableFixture`), not a flag, and `npm run test:judge` checks it.

**Blindness.** The judge sees the resume, the review date, and each report's label, Verdict and Critical Miss(es). It never sees a prompt hash, model name, run ID or score, and `test:judge` checks the message for them. Report style can still give a side away, for example the production prompt's long "In the … bullet" headings.

## Count checks

Matt, November 1, 2026: "some resumes are truly horrible. i dont want to lie to people and say they have one critical miss if there are more." A Critical Miss is any problem that would cost an interview on its own. Every one is flagged, up to three, in priority order, with a "more than three" signal when true, and a strong resume isn't padded. The pairwise rubric rewards this (C8), and two checks in `compare` test it directly on fictional resumes labeled in advance:

- **Under-count.** Each bad resume has three labeled problems that would each cost an interview on its own. The candidate's Critical Misses must address at least two of the three, on every bad resume. One count call per resume sees the labeled problems and names the one each Critical Miss's fix addresses ("none" if it addresses none). A Critical Miss matches at most one problem, and two Critical Misses on the same problem count once.
  - A second, blind call rates the same Critical Misses without the key. A caught problem that it doesn't rate critical on its own is a **disputed label**: the pairwise half, which is blind too, may count it as padding.
  - The gate prints disputed labels as a warning, not a fail. Fix the key, or the prompt's wording of that fix.
- **Over-count.** A strong resume has no labeled problem. One blind count call (no key) rates each Critical Miss as critical on its own or not. Any Critical Miss after the first that isn't rated critical on its own is padding and fails, and so does a "more than three" signal. The first is always allowed, since every report names a top fix (C5).

Only flagged Critical Misses count. A labeled resume that is missing from the candidate run, withheld (FAIL), or not judged fails the gate, and so does a key that fails its checks.

**The key.** `tests/fixtures/judge/count-check-key.json` lists each labeled resume:

```json
{"version": 1, "written_by": "…", "date": "2026-11-01", "resumes": [
  {"fixture_id": "synth_cc_<role>_bad_1", "kind": "bad", "problems": [
    {"id": "P1", "problem": "The issue in one sentence, not the fix", "lines": ["the verbatim resume line it lives on"], "why": "why it would cost an interview on its own"},
    {"id": "P2", "…": "…"}, {"id": "P3", "…": "…"}]},
  {"fixture_id": "synth_cc_<role>_strong_1", "kind": "strong", "problems": [], "note": "why nothing here would cost an interview on its own"}]}
```

**Vet a key before gating on it** with `npm run eval:judge -- calibrate --set key`, which costs about $0.05. It shows each bad resume's three labeled problems to the blind count call as one report's Critical Misses. It lists any label the judge doesn't rate critical on its own, and exits nonzero if there is one. The loader also checks the key before any call:

- every resume is a registered synthetic fixture (`isJudgeableFixture`);
- each bad resume has exactly P1, P2 and P3, most important first, each on verbatim lines that no other problem shares, so one fix can't cover two;
- each strong resume has no problems;
- the key has at least 8 bad and 4 strong resumes.

**The signal.** A report that says there are more than three Critical Misses sets top-level `more_critical: true` (prompt v3 contract; the schema allows it only with three Critical Misses). The judge's view shows it as "The report also says this resume has more than three Critical Misses and shows the first three."

**Wording matters as much as the label.** A missing target role on a resume whose roles span unrelated fields can be critical on its own; the blind judge rated it so on two of the three labeled resumes. But a Critical Miss worded as "add a summary section" reads as the optional-section fix that the production prompt and C1 rank low ("Do not spend a top-three fix on an optional Summary, Skills, or Education section when improving a weak experience bullet would create more hiring signal"). The pairwise judge then calls it padding. Say what the reader can't tell, and ask for one line that names the direction.

**Reading the result.** The `GATE:` block prints one line per check. The markdown's "Count checks" table lists, for each Critical Miss, whether the judge rated it critical on its own and, on bad resumes, the labeled problem it matched. When a bad resume fails, compare its Critical Misses with the key: a miss on a real problem the key doesn't list shows as "none" but critical, which points at the key rather than the prompt.

## The severity check's gate

The severity check (`prompts/severity_check_v1.txt`, wave 3) runs after a resume report is written and validated. It adds up to two Critical Misses, or promotes Fix 2 or Fix 3, and production's prompt and first fix never change. So the preference bar does not apply, and its gate is:

- **Under-count:** every labeled bad resume flags at least 2 of its 3 labeled problems (the count check above);
- **Over-count:** no labeled strong resume gets an added Critical Miss or a "more than three" signal. This is stricter than `compare`, which allows an extra Critical Miss the blind call rates critical on its own;
- **Vetoes:** one absolute-mode call on every report the check extended. A veto counts against the check unless every unsupported claim it quotes is from the first fix or the Verdict, which production wrote;
- **No regressions on smoke and golden**, checked separately, report by report, against the same run without the check.

Run the check on saved reports, then the gate:

```bash
RIYP_ALLOW_PAID_EVALS=true node scripts/run-ts-test.cjs scripts/eval-severity-check.ts ../tests/fixtures/results/<production>_live_run.json --budget-usd 2 --label <name>
```

```bash
npm run eval:judge -- severity ../tests/fixtures/results/<timestamp>_severity_run.json
```

`eval-severity-check.ts` writes a run file whose reports are the ones a reader sees after the check, with each source report kept as `pre_severity_output` and the check's answer, latency and cost on each result. `--rescore <severity_run.json>` settles the saved answers again through the current validator at no cost.

## Reading a comparison

Each fixture is judged twice, once with each report shown first. The combined verdict is:

| Verdict | Meaning |
| --- | --- |
| **X clear** / **Y clear** | Both orders named the same side, and both called it clear. A named rule decides it: a veto, a concrete fact against a structural move, a vague ask against a specific one, an open gap against a minor line, or "Nothing critical" against a real issue. |
| **X slight** / **Y slight** | Both orders named the same side, and at least one called it a judgment call. Treat it as Matt's "Both are good though". |
| **no real difference** | Both orders said so, or **the orders disagreed**. Disagreement means the preference depended on which report came first, so it isn't counted. The table's "Orders" column shows which case it was. |

**Vetoes.** A veto means the judge found a statement in that report the resume doesn't support, and quoted it. Code keeps a veto only when the quote really appears in the report, so the judge can't veto a side for something it never said. A veto still needs a human look: the judge can misread a resume, and the quote check doesn't catch that. Open the JSON and read `orders[].vetoes`.

**What to look at first:**

1. The `GATE:` line. To pass, the candidate must be preferred on at least 80% of compared resumes (ties count against), with no veto on a candidate side, across at least 8 fully judged resumes. That is Matt's bar for his own November 1 pick. Both count checks must pass on every labeled resume.
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

- Calibration of `critical-miss-judge-v3`, and the v4 recalibration after the count decision: [summary](../../tests/fixtures/results/summary_critical_miss_judge_calibration_2026-11-01.md), with raw outputs in `tests/fixtures/results/judge/`. In short, for v3:
  - 5 of Matt's 6 decisive blind picks reproduced, and none clearly reversed, on both Sol and Astra.
  - 29 of the 30 contrast pairs right as written. The miss led to a rubric clarification.
  - Identical verdicts on every retest, including under a second seed.
  - No side-order flips on Sol.
  - Self-preference +0.00.
- **v4, after Matt's count decision** (prompt SHA `e1860dbf…`):
  - Matt's 6 decisive picks: 5 right in the first run, and 4 right plus 1 tie in a same-seed retest. Neither run clearly reversed Matt.
  - All 10 C8 pairs right with the fixed fixtures.
  - The count prompt was right on all 34 gate outcomes, 34 matches and 48 ratings, and repeated exactly.
  - The cost of the change: three of Matt's borderline items (bp-04, bp-08, bp-09), which v3 called slight and repeated exactly, now move between slight and a tie on retest.
  - Three other drafts did worse and were dropped.
- **In-sample.** The rubric was written from the same ten blind-pick items the judge was calibrated on, and the contrast pairs were written from the rubric. Agreement shows the judge applies Matt's stated rules consistently; it doesn't yet show it predicts his next pick. Matt chose to gate on the judge without a further blind pick of his own, so a gate result is the judge's call, not a check against him.
- **Ten items.** One unexplained disagreement moves agreement by 17 points on the six decisive picks.
- **Same family.** The judge (`gpt-6.1-sol`) and the generator (`gpt-6.1-terra`) are different models from the same vendor and generation, so shared blind spots are possible. The self-preference probe found Sol no more favorable to its own writing than Astra was, on ten items. A cross-vendor judge would need a key this repository doesn't have.
- **Changing the judge.** A change to `web/lib/evals/judge/prompt.ts` changes `judge_prompt_sha256` in every result. Rerun `calibrate --set all` and compare it against the recorded calibration before trusting results from the new version.
