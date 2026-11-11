# PromptOps Shipping Gate

**Last Updated:** 2026-11-10
**Status:** ENFORCED; bounded model proof passes, hosted release gates remain separate

---

## The Rule

> **Prompt changes cannot ship to production unless the eval harness passes.**

This is a non-negotiable quality gate that protects the core value of RIYP: reliable, evidence-backed analysis.

### Current v3 readiness reconciliation — November 10

The active `resume_v3` prompt is `15dff271…`. Its November 7 `upgrades3` records have now been replayed without new provider calls: all 59 report-producing records pass the current production validator, using four original saved repairs. The oversized sixtieth request is refused before a call. Of those reports, 28 resume-only scenarios across 28 unique resumes match pre-existing calibration fixtures by exact source bytes; all 28 pass the unchanged score ranges and worklist checks. Thirty-one uncalibrated or posting-variant reports stay outside the readiness denominator; their source/copy checks retain two no-blank warnings.

The prior 24 PASS / 4 WARN / 0 FAIL replay is retained. The four warnings were mechanical detector false positives on repeated factual role titles and parallel grammatical openers with distinct continuations. Narrow detector corrections preserve paired controls for genuinely repeated questions, conditions, advice and full sentences. Prompts, source outputs, score ranges and the runtime threshold (at least eight cases, 90% PASS, zero FAIL) are unchanged.

The current runtime bundle now identifies this source-backed v3 cohort instead of the October 31 v2 cohort. This is a bounded saved-output replay, not a fresh full golden/smoke suite or a hosted journey pass. The [current summary](../../tests/fixtures/results/summary_latest_live.md) discloses every included case, excluded case, warning, source hash and validator/check fingerprint; [the October 31 summary](../../tests/fixtures/results/summary_historical_2026-10-31.md) remains historical. `node web/scripts/run-ts-test.cjs web/tests/worklist-readiness-replay.test.ts` reproduces the full receipt and fails on any source/validator error, including cases outside the calibrated denominator. Exact final-candidate checks and the hosted customer journey remain separate release requirements.

---

## The copy rule (November 6, 2026)

> **New or changed user-facing copy goes through the copy system before a PR.**

The reference is [`docs/copy-system.md`](../copy-system.md): the voice chart, tone by moment, the "this, not that" pairs, the tics, the glossary and the review procedure (§7). Before a PR that adds or changes a string a reader sees:

1. `npm run copy:inventory` from `web/`, and commit the updated tables. The PR's diff of `docs/copy/inventory/` is the list of what changed.
2. `npm run copy:check`: the inventory is current, no string trips a pattern check that isn't in the known baseline (`docs/copy/lint-baseline.json`), and the voice judge's tests pass. Free; it runs in the launch gate.
3. The voice judge on the new strings: write them to a strings file and run `RIYP_ALLOW_PAID_EVALS=true npm run copy:judge -- file <strings.json> --budget-usd 0.5`. A "no" is fixed or argued in the PR; a "flat" is a prompt to read the line aloud again, not a failure. Record the run's spend under "Voice judge" below.
4. The read-aloud and the questions in §7. When the judge and the read-aloud disagree, the read-aloud wins, and a line Matt approved is never rewritten on the judge's word.
5. Brand-level lines (the homepage, founder facts, a new aside on pricing or a report ending, the dial) go to Matt through the question UI.

The report's model-written words are outside this rule: they change only through the prompt gate below.

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

### Voice judge (product copy; local, never gates prompt changes)

Built November 6, 2026 for the copy system (`docs/copy-system.md`). `npm run copy:judge` from `web/` scores product copy against the voice chart, the tone by moment and the tic list, and proposes a rewrite for each string that isn't "us". It judges the interface, emails and public pages, never the model's report prose, and it never runs in production. Every call needs `RIYP_ALLOW_PAID_EVALS=true`; `--budget-usd` (at most $5) is the ceiling for a run, and `--dry-run` runs the free pattern checks with no call. It runs on `gpt-6.1-sol` and refuses the generator's model. How it works and how to read it: [docs/copy/judge/README.md](../copy/judge/README.md).

Calibration of prompt `voice-judge-v4` (SHA-256 `17027da35aa907af2d118f6b947a454a9c27f7f80707ad882ada8424cf9914a1`; v3 plus the fifth band in its glossary, with the same verdicts) against hand labels made before each set's first run (the copy-system session's; Matt set the rating round aside and gave his own words, which are the prompt's examples):

| Set | Exact (us, flat, no) | Cohen's kappa | Labelled "no" that it failed | Its "no" that were right |
| --- | --- | --- | --- | --- |
| Tuning, 40 lines | 31 of 40 | 0.58 | 6 of 6 | 6 of 7 |
| Held out, 24 lines, never used to change the prompt | 19 of 24 | 0.58 | 3 of 4 | 3 of 3 |

Known biases: more lenient than the labels on cool, literal lines; it keeps editing out the sign-in email's warm opening, an aside Matt approved. When the judge and the read-aloud disagree, the read-aloud wins. A change to the judge prompt changes its SHA and needs a fresh `calibrate` on both sets before its verdicts count.

Spend (token-calculated, synthetic product strings only; the copy-judge cap is $5):

| Run | Strings | Calls | Spend |
| --- | --- | --- | --- |
| Calibration v1, tuning set | 40 | 4 | $0.0506 |
| Calibration v2, tuning and held-out sets | 64 | 6 | $0.0696 |
| Calibration v3, tuning and held-out sets | 64 | 6 | $0.0738 |
| Calibration v4, tuning and held-out sets | 64 | 6 | $0.0712 |
| First-seen routes of the inventory (prompt v3), for the rewrites | 1,357 | 68 | $1.1866 |
| The rewritten lines, before the rewrite PR (prompt v4) | 42 | 4 | $0.0411 |
| The launch gate's threshold check, once, before the gate PR (held-out set: kappa 0.52, 3 of 4 "no" caught) | 24 | 2 | $0.0341 |
| The second pass's rewritten lines | 70 | 6 | $0.0675 |
| Total | | | $1.5945 |

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

### Not every good bullet needs a number — November 5 (not shipped)

Two candidates from [the proposal](proposals/2026-11-not-every-bullet-needs-a-number.md), each run alone against production on the 10 synthetic golden fixtures plus the 12 labeled count-check resumes, judged by `critical-miss-judge-v4` after the severity check: [result](2026-11-not-every-bullet-needs-a-number-result.md).

- Candidate A, the severity prompt's `no_evidence_latest_role` definition (`ac4bb5a1` against `f1bb4571`): severity gate PASS (8 of 8, 4 of 4, 0 vetoes); `compare` GATE: FAIL, preferred 1 of 22, production clear on the three resumes where the rule stopped firing (the recent grad, the operations assistant, the finance analyst). Intern-scale asks 0 of 8 (was 6 of 6).
- Candidate B, the resume prompt's rule 10 and VOICE line (`e09ca912` against `83b2a2d1`): GATE: FAIL, preferred 2 of 22, production 7, 0 vetoes, both count checks pass. "Led a team of 40" kept 0 of 3 with the question present 3 of 3 (was 3 of 3 kept).
- Spend $3.7366 (estimate $3.67; stop line $12). Receipts: `tests/fixtures/results/summary_*bullet_number*.md`, `tests/fixtures/results/judge/*bullet-number*`. Neither prompt changed.

### The worklist report, Matt's voice — November 6 (prompt `0a19c3ee`)

The report's prompt follows the copy system Matt settled on November 6 (PR 83: `docs/copy-system.md` §1 and §4, `docs/voice-and-tone.md` "Matt in his own words"). Record: `docs/audits/2026-11-worklist-run.md`, passes 6 to 8.

- Changed: How you write (warm and a little bit coach; the problem, then the way out walked together; praise with its reason; one exclamation point at most, on a win; acknowledge, never diagnose; no slang; Matt's own lines), the write-up (zoom out first: the story and the one takeaway for the whole resume, Matt's note on pass 7; "it's common" before a weak resume's problem; on a strong resume, praise first and, when true, that the resume isn't what stands between them and a call back), the gap note (Matt: "career break sabbatical only if true"), and "the page" and "rung" out of the person's report. Unchanged: the schema, the grounding principles, the bands' thresholds and anchors, the Ready to send rule, the employer rule, the validator, every other prompt.
- Live set, pass 8: 49 of 49 shipped, 0 repaired, 0 never shipped, 0 band-rule violations; mean score 76.0 against 76.3 on `70e795a1`. "The page", "this page" and "rung" in reports: 0 (was 11 uses in 8 reports). Exclamation points: 12 reports, one each, all on Clear and specific or Ready to send write-ups, none in a critique.
- Golden synthetic 10: 6 PASS, 4 WARN, 0 FAIL (score drift on the weak fixtures and the entry-level PM, as in passes 3 to 5; one repeated clause; one example with no blank). The smoke tier holds real people's resumes and was not sent; the synthetic golden set stands in for it, as in passes 3 to 5.
- Gate: the counts above, the unit contracts (`test:llm-contract`, `test:report-integrity`, `test:sample-report`, `test:pdf-export`, prompt assets) on the candidate, and Matt reading the five in the Report Lab beside their pass 5 versions: "Ship it" (question UI, November 6).
- Spend $1.62 for three passes (runner $1.22, golden $0.38, the sample $0.02) under the $5 set for this change; about $39.03 of the $50 cap remains.

### The worklist report, the fifth band — November 6 (prompt `70e795a1`)

Matt read the five in the Report Lab, asked for a deep pass on the visuals and then the typography, said "lets ship it" (PR 78 and PR 79 merged November 6, the flag on for everyone, PR 80 for the report's own copy), and asked for a higher fifth band. The proposal he approved: `docs/promptops/proposals/2026-11-fifth-band.md`; the record: `docs/audits/2026-11-worklist-run.md`, pass 5.

- "Ready to send" from 93, earned only when no line needs work; "Clear and specific" 85 to 92; a page with nothing to fix never under 90; the employer lift never into the top band. The prompt carries the rule and the validator enforces it (one repair), so the band and the list can't disagree on a shipped report.
- Live set rerun on the new prompt: 49 of 49 shipped, 1 repaired (a clean page scored 85, repaired to 90), 0 never shipped, 0 rule violations after validation; 2 pages land on Ready to send (the strong PM at 96, the FP&A analyst at 95), 4 pages have nothing to fix (90 to 96). Mean score change against the previous pass on the same 49 cases: -0.9.
- Golden synthetic 10: 7 PASS, 3 WARN (the same score drifts as passes 3 and 4), 0 FAIL.
- Spend $0.67; the wave's total $3.06 of the $12 planned; stop line $15.
- Gate: the counts above, the report spec set on the production build (80 passed, 1 skipped, 1 known v2 failure), the red-team journeys, and Matt reading the two pages that land on Ready to send (Report Lab fixtures `worklist-strong` and `worklist-ready`).

### The worklist report, resume prompt v3 — November 6 (built behind a flag; shipped November 6, see above)

The report shape Matt chose on November 5 (`docs/design/2026-11-worklist-report/`): score and rung, the recruiter's write-up, one card per line that needs work, no Critical Miss. Prompt `web/prompts/resume_v3.txt` (`705c2997`; `18e7e9ff` before the surface's outside critique asked for shorter blank labels and dated examples), contract `v3` (`web/lib/llm/worklist-schema.ts`), validator `web/lib/llm/worklist-validator.ts`. It writes the report unless `RIYP_WORKLIST_REPORT=0` (the default flipped with the surface PR); `resume_v2.txt` (`83b2a2d1`) is unchanged and still the validator for every report saved before it. Record: [2026-11-worklist-run.md](../audits/2026-11-worklist-run.md).

- Golden synthetic 10: 4 PASS, 6 WARN, 0 FAIL. Count-check 12: 11 PASS, 1 WARN, 0 FAIL. The warnings are score drift against v2's expected ranges from the fourth rung and the dated read, and one example without a blank; justified in the record.
- Live set, 50 runs on the shipped prompt: 49 reports, 1 request refused before the call (the 15-page CV), 1 draft repaired (a retired phrase), 0 never shipped. Replaying every saved draft through the final validator gives the same counts.
- The severity check added a card to 1 of 96 worklist reports across the two passes it ran on, so it is off for worklist reports unless `RIYP_SEVERITY_CHECK=1`.
- The Critical Miss judge cannot score this shape; the worklist's judge question is drafted in `docs/evals/worklist-rubric.md`. This wave is gated on the counts above plus Matt reading five reports (a bad, a thin, a strong, a mismatch, a top-tier employer) and saying yes.
- Spend $2.39 (runner $1.51, eval harness $0.86, the sample $0.02) of the $12 planned; stop line $15. Synthetic resumes only; the smoke tier's real resumes were not sent.

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
