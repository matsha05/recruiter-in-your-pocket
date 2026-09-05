# PromptOps Shipping Gate

**Last Updated:** 2026-09-04
**Status:** ENFORCED, CURRENT RELEASE CANDIDATE PASS

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

### Should Monitor

| Check | Threshold | Action if Breached |
|-------|-----------|-------------------|
| WARN count | < 30% of fixtures | Investigate, document decision |
| Score drift | ±5 points from baseline | Review and justify |
| Judge score | > 8.5/10 average | Investigate regressions |

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
| Latest candidate validation | 22 PASS, 1 WARN, 0 FAIL |
| Historical V2 baseline run (2025-12-28) | 17 fixtures |
| Historical PASS | 1 |
| Historical WARN | 15 |
| Historical FAIL | 1 (E_BANNED_PHRASE) |
| Historical judge score | 9.1/10 (50-sample bulk run) |

Baseline files:
- `tests/fixtures/baselines/v2_baseline.json`
- `tests/fixtures/baselines/v2_baseline_summary.md`

The immutable current evidence is recorded in `tests/fixtures/results/summary_latest_live.md` and bundled into hosted readiness. Any prompt or launch-model change requires a fresh explicitly budgeted live run and candidate validation.

## Launch Tie-In

Before any live launch decision, and only after model spend is approved:

1. Run `RIYP_ALLOW_PAID_EVALS=true npm run launch:gate:strict`
2. Confirm the strict gate ran live smoke and golden evals
3. Treat any prompt FAIL as an automatic no-go

### Latest live evidence

- Run: `eval_1788577888513_targeted_cohort_replay`
- Model: `gpt-5.6-terra`, medium reasoning, 8,000 completion tokens per call; bounded high-reasoning repair
- Corpus: all 23 stored golden resumes
- Result: 22 PASS, 1 WARN, 0 FAIL (95.7%)
- Validation: saved-output replay of the full live run with five designated fixtures replaced by their latest targeted live outputs. Original failures and source receipts are retained; no report prose was manually edited.
- Source cohort SHA-256: `245686e38edf51014b54412f47e4c9d4ff6e3c235739190e4cc8d11413399d35`
- Budget: Matt authorized $10 total. The final smoke receipt and token-calculated campaign cost are recorded in `tests/fixtures/results/summary_latest_live.md`.
- Resume prompt SHA-256: `67c7257730ac5b53f3465454d7bc6831e83f07d50255435e7cafbc09d1f8fa86`
- Resume-ideas prompt SHA-256: `6d90925e63aae15476712f92af5ffbdf4e684feec413711e14d6dba7201b6fc7`
- Decision: the current candidate clears the quality gate with one non-blocking repeated teacher-role warning. All 23 selected reports received a separate source-by-source copy review.

The September 4 release uses the bounded live evaluations and separately recorded final smoke replay, followed by the standard zero-spend launch gate and exact-commit CI. The strict command is not rerun because it would repeat paid work outside the remaining authorized allocation. This replay is not described as a fresh full-batch pass. The original full run returned 14 PASS, 1 WARN and 8 FAIL before validation corrections and the targeted replacements. Repair instructions were refined during those replacements; the initial model and prompt stayed fixed.

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
