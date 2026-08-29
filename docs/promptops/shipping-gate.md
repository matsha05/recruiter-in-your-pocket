# PromptOps Shipping Gate

**Last Updated:** 2026-08-10
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

- Run: `eval_1786231390293_replay`
- Model: `gpt-5.6-luna`, low reasoning
- Corpus: all 23 stored golden resumes
- Result: 22 PASS, 1 WARN, 0 FAIL (95.7%)
- Validation: saved outputs from the authorized live run replayed through the current candidate validator
- Token-calculated source-run API cost: $0.576062 across 45 calls
- Resume prompt SHA-256: `fd910eea3d1a4ebd7c4ae3f0419d6b36f6d799d08c8e52b8a7625dffb964236a`
- Resume-ideas prompt SHA-256: `6d90925e63aae15476712f92af5ffbdf4e684feec413711e14d6dba7201b6fc7`
- Decision: the current candidate clears the quality gate with one non-blocking repeated-wording warning

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
