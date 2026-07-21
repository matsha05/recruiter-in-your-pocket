# PromptOps Shipping Gate

**Last Updated:** 2026-07-20
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
| Golden fixtures in current corpus | 20 |
| Historical V2 baseline run (2025-12-28) | 17 fixtures |
| Historical PASS | 1 |
| Historical WARN | 15 |
| Historical FAIL | 1 (E_BANNED_PHRASE) |
| Historical judge score | 9.1/10 (50-sample bulk run) |

Baseline files:
- `tests/fixtures/baselines/v2_baseline.json`
- `tests/fixtures/baselines/v2_baseline_summary.md`

Before the next prompt release, cut a refreshed baseline that covers the full 20-fixture golden corpus.

## Launch Tie-In

Before any live launch decision, and only after model spend is approved:

1. Run `RIYP_ALLOW_PAID_EVALS=true npm run launch:gate:strict`
2. Confirm the strict gate ran live smoke and golden evals
3. Treat any prompt FAIL as an automatic no-go

### Latest live evidence

- Run: `eval_1784470075604`
- Model: `gpt-4o-mini`
- Corpus: 8 stored synthetic golden resumes
- Superseded result: 0 PASS, 1 WARN, 7 FAIL
- Final pinned GPT-5 nano result: 8 PASS, 0 WARN, 0 FAIL (`eval_1784502145848`)
- Token-calculated API cost: $0.009 across 9 calls
- Decision: prompt and model gate passes for the pinned release candidate

The earlier GPT-4o mini run exposed evidence paraphrasing, requests for facts already present, and unsupported causal outcomes. Those defects were hardened in the prompt and runtime, then the live gate was rerun on the pinned launch model. The runtime also withholds invalid drafts, attempts one bounded repair, and restores the report credit if the replacement still fails. Any prompt or launch-model change reopens this gate.

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
