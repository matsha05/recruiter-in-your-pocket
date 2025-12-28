# PromptOps Shipping Gate

**Last Updated:** 2025-12-28  
**Status:** ENFORCED

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
| Golden tier | `npm run eval:golden` | 0 FAILs |
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

1. Run baseline: `npm run eval:golden`
2. Note current pass/fail/warn counts

### After Modifying a Prompt

1. Run eval: `npm run eval:golden`
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

| Metric | V2 Baseline (2025-12-28) |
|--------|--------------------------|
| Golden fixtures | 17 |
| PASS | 1 |
| WARN | 15 |
| FAIL | 1 (E_BANNED_PHRASE) |
| Judge score | 9.1/10 (50-sample bulk run) |

Baseline files:
- `tests/fixtures/baselines/v2_baseline.json`
- `tests/fixtures/baselines/v2_baseline_summary.md`

---

## Future: CI Integration

When ready, add to GitHub Actions:

```yaml
# .github/workflows/promptops.yml
- name: Run PromptOps Eval
  run: npm run eval:golden
  env:
    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}

- name: Check for failures
  run: |
    if grep -q "❌ FAIL" tests/fixtures/results/summary_latest.md; then
      echo "PromptOps eval failed - blocking merge"
      exit 1
    fi
```

---

## Why This Matters

1. **Quality Protection** — Prevents regressions from reaching users
2. **Team Alignment** — Clear bar for prompt contributors
3. **Acquisition Readiness** — Proves engineering discipline around core IP
