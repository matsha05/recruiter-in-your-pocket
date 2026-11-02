# PromptOps Shipping Gate

**Last Updated:** 2026-11-01
**Status:** ENFORCED; bounded model proof passes, hosted release gates remain separate

---

## The Rule

> **Prompt changes cannot ship to production unless the eval harness passes.**

This is a non-negotiable quality gate that protects the core value of RIYP: reliable, evidence-backed analysis.

---

## Passing Criteria

Before any prompt modification can be merged or deployed:

### Must Pass

| Check | Command | Threshold |
|-------|---------|-----------|
| Smoke tier | `npm run eval:smoke` | 0 FAILs |
| Golden tier | `npm run eval:golden -- --baseline ../tests/fixtures/baselines/v2_baseline.json` | 0 FAILs |
| Schema validation | Automatic | All outputs must pass Zod schema |
| Critical Miss judge | `npm run eval:judge -- compare <production run> <candidate run>` | `GATE: PASS`: candidate preferred on at least 80% of resumes (ties count against), 0 candidate vetoes, and both count checks pass on every labeled resume ([details](#critical-miss-judge-gates-prompt-changes)) |

### Should Monitor

| Check | Threshold | Action if Breached |
|-------|-----------|-------------------|
| WARN count | < 30% of fixtures | Investigate, document decision |
| Score drift | ±5 points from baseline | Review and justify |
| Judge score (retired whole-report judge; historical only) | n/a | Replaced by the Critical Miss judge below |

### Report integrity (reported, not gated)

Grounding and schema checks can pass while a report contradicts itself. Every eval and saved-output replay therefore also measures the validated report the way a customer reads it, both as generated and after the deterministic post-generation pass (`web/lib/reports/report-integrity.ts`) that the web report and the PDF share:

- rewrites;
- keep/fix collisions on one resume line;
- repeated observations;
- field-slot mapping (for example, "What to add" must hold questions, not the reason);
- Critical Miss category (line edit, or structural: dates, direction, level, buried result) and whether the report says nothing is critical (its only Critical Miss marked `impact_level: "low"`);
- Verdict/Critical Miss agreement, including whether the Verdict's concern names another fix's line or a different kind of issue;
- whether validation dropped the model's first fix, so a later fix became the Critical Miss;
- fix headings: length, and whether they open with a location or carry a condition;
- score test-retest, when a fixture ran more than once (`--repeat <n>`, or `scripts/replay-live-eval.ts` with several saved runs).

These numbers do not change PASS/WARN/FAIL.

Baseline for resume prompt `83b2a2d1`, from a zero-cost replay of the four saved runs: [summary_integrity_baseline_2026-11-01.md](../../tests/fixtures/results/summary_integrity_baseline_2026-11-01.md).

- 0 rewrites in 13 reports.
- 7 keep/fix collisions, 0 after the pass.
- 71 repeated observations, 0 after the pass.
- Every Critical Miss is a single-line edit; 7 reports flag a structural issue the Critical Miss skips.
- The Verdict and Critical Miss disagree in 6 reports.
- The operations fixture scored 60, 58, 60, 58 across retests.

Matching is lexical (stemmed, distinctive shared words), so these counts are the pass's own view. A strength that names two lines with little shared wording can slip through; there is one known case in the operations reruns. Judge prompt item 1.3 on these numbers together with Matt's blind read.

Critical Miss prompt `55bee48b` (items 1.3 and 1.9, **not shipped**), measured against fresh runs of `83b2a2d1` with the same harness and validator: [summary_critical_miss_before_after_2026-11-01.md](../../tests/fixtures/results/summary_critical_miss_before_after_2026-11-01.md). On 10 synthetic fixtures × 3:

- The Critical Miss is structural in 19 of 30 reports, up from 2 of 28.
- Reports that flag a structural issue the Critical Miss skips: 14 before, 0 after.
- Verdict and Critical Miss disagree in 15 reports before, 1 after.
- Fix headings over 12 words: 81 of 81 before, 0 of 79 after.
- The widest score retest range is 3 points, down from 4.

These counts improved, but Matt's blind pick did not. Details are under "Critical Miss prompt attempt" below. The next attempt is gated by the Critical Miss judge (below), which takes the place of his pick; these counts are still reported.

### Critical Miss judge (gates prompt changes)

Matt decided on November 1, 2026 that the Critical Miss judge gates prompt changes, in place of his own blind pick. The bar matches the one he set for that pick.

An automated judge (`npm run eval:judge`, `web/lib/evals/judge/`) asks the question Matt's blind pick asks: of two reports on the same synthetic resume, which Critical Miss is the more important thing to fix first? It applies the [Critical Miss rubric](../evals/critical-miss-rubric.md) on `gpt-6.1-sol`, a different model from the `gpt-6.1-terra` generator. It runs each comparison in both side orders and counts disagreement as a tie. It sends only synthetic fixtures. It replaces the earlier whole-report judge, whose 9.1/10 was uncalibrated and near the ceiling. How to run and read it: [critical-miss-judge.md](../evals/critical-miss-judge.md).

**The bar.** Run `compare` with production as the first live_run file and the candidate second, both from fresh runs on the same golden fixtures and labeled resumes. Run it without `--limit` or `--max-misses`, so each report shows what a reader sees as its Critical Misses: every flagged one, or an unflagged report's first fix. It prints `GATE: PASS` or `GATE: FAIL` and exits nonzero on FAIL. To pass:

- the candidate is preferred, clear or slight, on **at least 80%** of compared resumes, with ties and production preferences counting against it;
- the absolute-mode veto fires on **zero** candidate sides;
- at least 8 synthetic resumes are compared (the launch bar's minimum fixture count), and every one is fully judged. A resume where the candidate has no shown report, or the judge errored, fails the gate;
- **under-count:** on every labeled bad resume, the candidate's flagged Critical Misses address at least 2 of its 3 labeled problems;
- **over-count:** on every labeled strong resume, each Critical Miss after the first is one the judge rates critical on its own, and the report doesn't claim more than three.

Matt added the count checks later on November 1: "some resumes are truly horrible. i dont want to lie to people and say they have one critical miss if there are more." A Critical Miss is any problem that would cost an interview on its own. Every one is flagged, up to three, in priority order, with a "more than three" signal when true, and strong resumes aren't padded. The labeled resumes (at least 8 bad and 4 strong, all fictional) and their key are in `tests/fixtures/judge/count-check-key.json`, so the candidate run must include them. How the checks work: [count checks](../evals/critical-miss-judge.md#count-checks).

The 0-FAIL smoke and golden gate above still applies.

Calibration of judge `critical-miss-judge-v3` ([summary](../../tests/fixtures/results/summary_critical_miss_judge_calibration_2026-11-01.md)):

- Matt's blind pick: 5 of his 6 decisive picks reproduced, and none clearly reversed. The one miss is a slight preference on the item he marked "Both are good though".
- 29 of 30 fictional contrast pairs right as written, each isolating one rubric rule. The miss (identical fixes with different whys) was resolved in the rubric following Matt's "Same critical miss" note.
- Same verdicts on every calibration retest, including under a different seed; 0 of 104 pair-runs changed with side order. In a repeat `compare` of the same live runs, 8 of 9 verdicts repeated, and one borderline resume became a tie. A result within one resume of the bar is worth a second run.
- `gpt-6-astra` calibrated the same (39 of 40 pairs identical) at about 5.6 times the cost. Self-preference was +0.00.
- On the two live runs behind the blind pick, it preferred production 6 to 2 with 1 tie, the same direction as Matt's 5 to 1. Under this bar, that candidate (`55bee48b`) prints `GATE: FAIL` (2 of 10 preferred), as it failed Matt's pick.

Recalibration of judge `critical-miss-judge-v4` after the count decision ([summary](../../tests/fixtures/results/summary_critical_miss_judge_calibration_2026-11-01.md#judge-v4-the-count-decision)):

- **C8 is now scoped.** It no longer reads "the same bar" as "as important as the first", the rule under which prompt v3.3 flagged one Critical Miss on all 40 judge resumes. A real second or third Critical Miss now wins over stopping, and padding still loses: all 10 C8 contrast pairs are right.
- **Matt's 6 decisive picks:** 5 right, then 4 right plus a tie on a same-seed retest. Neither run clearly reversed Matt.
- **Less steady than v3:** three of Matt's borderline items, which v3 called slight, now move between slight and a tie. A gate result within one resume of the bar is worth a second run, more so than before.
- **Count prompt:** every gate outcome, match and rating on the hand-labeled set came out as labeled, and each retest repeated exactly. The prompt session's key passes the loader's checks.

These numbers are in-sample: the rubric was refined on the same ten items Matt picked. A change to the judge prompt changes `judge_prompt_sha256` and needs a fresh `calibrate --set all` (and `--set count`) before its verdicts count.

---

## Workflow

### Before Modifying a Prompt

1. Run baseline: `npm run eval:golden -- --baseline ../tests/fixtures/baselines/v2_baseline.json`
2. Note current pass/fail/warn counts

### After Modifying a Prompt

1. Run eval: `npm run eval:golden -- --baseline ../tests/fixtures/baselines/v2_baseline.json`
2. Compare to baseline
3. If FAILs introduced → **DO NOT SHIP**
4. If WARNs increase significantly → document justification
5. Run `npm run eval:judge -- compare <production run> <candidate run>` from `web/`. If it prints `GATE: FAIL` → **DO NOT SHIP**

### Documenting Exceptions

If shipping with known WARNs, add a comment to the PR:

```
## PromptOps Review

- Golden eval: 0 FAIL, 15 WARN
- Baseline comparison: +2 WARNs (W_SPECIFICITY_LOW on new fixtures)
- Justification: New fixtures are edge cases, WARNs are acceptable
- Approver: [name]
```

---

## Baseline Reference

| Metric | Current corpus / historical baseline |
|--------|-------------------------------------|
| Golden fixtures in current corpus | 23 |
| Latest candidate validation | 10 PASS, 0 WARN, 0 FAIL; saved-output replay |
| Current evaluated subset | 10 synthetic golden fixtures; 13 stored golden fixtures not newly generated |
| Historical V2 baseline run (2025-12-28) | 17 fixtures |
| Historical PASS | 1 |
| Historical WARN | 15 |
| Historical FAIL | 1 (E_BANNED_PHRASE) |
| Historical judge score (retired whole-report judge) | 9.1/10 (50-sample bulk run) |

Baseline files:
- `tests/fixtures/baselines/v2_baseline.json`
- `tests/fixtures/baselines/v2_baseline_summary.md`

The immutable current evidence is recorded in `tests/fixtures/results/summary_latest_live.md` and bundled into hosted readiness. Any prompt or launch-model change requires a fresh explicitly budgeted live run and candidate validation.

## Launch Tie-In

Before any live launch decision, and only after model spend is approved:

1. Run `RIYP_ALLOW_PAID_EVALS=true npm run launch:gate:strict`
2. Confirm the strict gate ran live smoke and golden evals
3. Treat any prompt FAIL as an automatic no-go

### Current bounded launch proof — October 31

The resume prompt changed after the October 30 proof, so the same ten synthetic fixtures were regenerated live on `gpt-6.1-terra` (run `eval_1793463473819`, Matt-approved spend, $0.22727880 token-calculated). The original **9 PASS, 0 WARN, 1 FAIL** is retained. The failure exposed three validator false rejections (the seniority read "entry-level", a sentence-initial "Using" read as part of a product name, and the advice modal "would"), each fixed with paired fabrication controls. The unchanged outputs replay as **10 PASS, 0 WARN, 0 FAIL** through candidate `09f0b89e3c361f1cc2dcfe5ffaa4ea02eb2d901d`, bound to source JSON SHA-256 `da5212325f26a0ad3183372e44c83fb59c3a8754bacbe0c240ef6fe3255cc257`. Two fresh Operations runs on that candidate passed; an intermediate fresh run that exposed the third false rejection is recorded as a failure. Details: [current summary](../../tests/fixtures/results/summary_latest_live.md).

The November 1 validator fixes (`11a7a021`, `64b12217`) leave this prompt's outcomes unchanged. Its 43 saved outputs replay with the same 41 PASS and 2 FAIL, and none newly fails. Both withheld reports still fail on classes the fixes don't cover: [summary](../../tests/fixtures/results/summary_validator_fixes_on_production_prompt_2026-11-01.md).

### Critical Miss prompt attempt — November 1 (not shipped)

The prompt for items 1.3 and 1.9 (`55bee48b`, committed as `1ddcc7b5`) passed the automated gate and failed Matt's blind pick, so it was reverted.

**Automated gate.** On `gpt-6.1-terra`:

- Smoke `eval_1793560728771`: 2 PASS, 1 WARN, 0 FAIL.
- Golden `eval_1793560808592`: 20 PASS, 1 WARN, 2 FAIL as generated. Both failures were validator false rejections, fixed in `64b12217`. The golden outputs replay as 22 PASS, 1 WARN, 0 FAIL ([summary](../../tests/fixtures/results/summary_critical_miss_final_golden_2026-11-01.md)).
- Before/after counts: [summary_critical_miss_before_after_2026-11-01.md](../../tests/fixtures/results/summary_critical_miss_before_after_2026-11-01.md).
- Spend: $2.33166865.

**Blind pick.** [items](../../tests/fixtures/results/blind-pick/items.json), [key](../../tests/fixtures/results/blind-pick/key.json), [result](../../tests/fixtures/results/blind-pick/result.json).

- Ten synthetic resumes, each judged on old vs new.
- The bar, set by Matt in advance: the new Critical Miss preferred in at least 8 of 10.
- Result: **new 1, old 5, no difference 4**, 0 vetoes. Fail.
- Old preferred: the UX manager (budget size over moving the 15% retention result up), software engineer, project manager, sales executive, and marketing VP (over the new "Nothing critical").
- New preferred: the HR manager's end date with nothing after it.
- No difference: data scientist, finance analyst, product manager, operations assistant.

**Matt's notes, verbatim:**

- UX manager: "Budget size is a tangible thing to grasp onto, it helps the recruiter understand the scale."
- Project manager: "Both are good though".
- HR manager: "It's critical for sure if there is no more relevant work. This may be be a missing part of the product brain where if there isn't recent work we really need to give them advice abotu how to talk about that, or how to fill in worthy projects there. look into that."
- Finance analyst: "Same critical miss it looks like. Both are critical. Vague stuff".
- Product manager: "Same issue".
- Marketing VP: "Both critical and missing details. I think we should have multiple critical misses if they exist...."

**What carries forward:**

- Kept: the validator fixes and the eval harness checks.
- Reverted: the prompt, with items 1.3 and 1.9 together.
- Open product questions: whether "Nothing critical" should exist, and whether a report can carry more than one Critical Miss.
- Next attempt: a gap needs advice on what to say or which real projects to add, not only "say what you've done since".

### Previous bounded launch proof — October 30 (historical)

The unchanged original ten-fixture `gpt-6.1-terra` run `eval_1793394208092` replays as **10 PASS, 0 WARN, 0 FAIL** through candidate `f9d3903813c2449b205ec39baec9f344650006e5`. Its original **9 PASS, 0 WARN, 1 FAIL** and all provider outputs remain retained; the sole final rejection was corrected by adding the editorial noun “description” to the existing assessment vocabulary with paired fabrication controls. No report prose or selected output was replaced. The replay is bound to source JSON SHA-256 `b6e20c5669bbeb80b7b612993339a6a38a8c033813e2bb60a2502fab4bb41111`.

Within Matt’s approved testing budget, this proof uses ten synthetic golden fixtures to keep customer and real-person resume fixtures out of the model calls. The prompts and runtime readiness bar remain unchanged: at least eight fixtures, at least 90% PASS, zero FAIL. The other 13 stored golden fixtures were not freshly generated. Medium reasoning, an 8,000-token per-call ceiling and bounded high-reasoning repair match the launch configuration.

A separate fresh Operations run `eval_1793395105340` on that corrected candidate passed (one fixture, two calls, $0.03118420 token-calculated). Four separately receipted streaming cases on `92e45a0` cover with/without-job route behavior; their same raw provider outputs also pass offline replay on the corrected candidate. They are not additional golden fixtures or the standard smoke-tier suite. This chosen proof does not claim `launch:gate:strict` ran. Exact-commit CI and the complete hosted customer journey still determine the release decision.

The parseable [current summary](../../tests/fixtures/results/summary_latest_live.md) records generation/replay candidates, hashes, original failure, costs and the separate targeted confirmation. Any report-behavior change requires validation against the new candidate; any prompt or launch-model change reopens the live quality gate.

### Historical September 4 evidence — Terra 5.6

- Run: `eval_1788577888513_targeted_cohort_replay`
- Model: `gpt-5.6-terra`, medium reasoning, 8,000 completion tokens per call; bounded high-reasoning repair
- Corpus: all 23 stored golden resumes
- Result: 22 PASS, 1 WARN, 0 FAIL (95.7%)
- Validation: saved-output replay of the full live run with five designated fixtures replaced by their latest targeted live outputs. Original failures and source receipts are retained; no report prose was manually edited.
- Source cohort SHA-256: `245686e38edf51014b54412f47e4c9d4ff6e3c235739190e4cc8d11413399d35`
- Budget: Matt authorized $10 total. The final smoke receipt and token-calculated campaign cost are retained in `tests/fixtures/results/summary_historical_2026-09-04.md`.
- Resume prompt SHA-256: `67c7257730ac5b53f3465454d7bc6831e83f07d50255435e7cafbc09d1f8fa86`
- Resume-ideas prompt SHA-256: `6d90925e63aae15476712f92af5ffbdf4e684feec413711e14d6dba7201b6fc7`
- Decision at that time: the September 4 candidate cleared the quality gate with one non-blocking repeated teacher-role warning. All 23 selected reports received a separate source-by-source copy review.

The September 4 release used the bounded live evaluations and separately recorded final smoke replay, followed by the standard zero-spend launch gate and exact-commit CI. For that release, the strict command was not rerun because it would have repeated paid work outside the remaining authorized allocation. This replay is not described as a fresh full-batch pass. The original full run returned 14 PASS, 1 WARN and 8 FAIL before validation corrections and the targeted replacements. Repair instructions were refined during those replacements; the initial model and prompt stayed fixed.

The validator now preserves specific advice instead of replacing it with stock prose. Paired regressions protect section presence, metric qualifiers, source relationships and the reproduced factual presuppositions. These bounded checks do not establish universal accuracy for future generated reports. Minor wording limitations remain documented in the independent review; automated passage alone is not an editorial verdict.

The runtime withholds invalid drafts, attempts one bounded repair, and restores report access if the replacement still fails. Any prompt or launch-model change reopens this gate. Older GPT-4o mini and GPT-5 Nano runs remain historical evidence, not the current release bar.

---

## Future: CI Integration

CI should continue to run the dry-run and preflight checks. Live golden evals remain part of the strict launch gate and should run in protected environments with `OPENAI_API_KEY`.

```yaml
# .github/workflows/promptops.yml
- name: Run PromptOps Eval
  run: npm run eval:golden
  env:
    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
    RIYP_ALLOW_PAID_EVALS: "true"

- name: Check for failures
  run: |
    if grep -q "❌ FAIL" tests/fixtures/results/summary_latest_live.md; then
      echo "PromptOps eval failed - blocking merge"
      exit 1
    fi
```

---

## Why This Matters

1. **Quality Protection** — Prevents regressions from reaching users
2. **Team Alignment** — Clear bar for prompt contributors
3. **Acquisition Readiness** — Proves engineering discipline around core IP
