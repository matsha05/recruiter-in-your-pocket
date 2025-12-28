# PromptOps Eval Harness (Gate B)

This harness exists to make prompt engineering scalable and defensible.

Instead of manually reviewing lots of resumes, we:

1. run batch analyses on a fixed dataset,
2. score outputs automatically with hard gates + warnings,
3. surface only regressions and suspicious cases for human review.

The goal is to review deltas, not resumes.

---

## What this does

### Core behaviors

* Runs tiered suites (smoke, golden, bulk)
* Enforces an output contract (schema + required sections)
* Enforces evidence discipline (must cite resume excerpts)
* Compares results to a committed baseline
* Produces a readable regression report:

  * FAIL = ship blocked (E_ codes)
  * WARN = review recommended (W_ codes)
  * PASS = clean

### Why this matters

This is our PromptOps moat:

* we can iterate fast without output regressions
* we can prove quality discipline to ourselves and to buyers
* we can ship changes with confidence

---

## File layout

```
tests/
  fixtures/
    calibration.json
    results/
      .gitignore
      baseline_v1.json          # committed baseline
      summary_latest.md         # committed or copied artifact
      {timestamp}_run.json      # gitignored run output
  resumes/
    smoke/
    golden/
    bulk/

web/
  lib/evals/
    types.ts
    checks.ts
    report.ts
    runner.ts
  scripts/
    run-eval.ts
```

### What is committed vs ignored

Committed:

* `tests/fixtures/results/baseline_*.json`
* `tests/fixtures/calibration.json`
* small markdown summaries if desired (`summary_latest.md`)

Ignored:

* per-run JSON outputs (`*_run.json`)
* any large debug artifacts

---

## Status logic

* **FAIL**: any `E_` code present
* **WARN**: any `W_` code present and no `E_` codes
* **PASS**: no `E_` or `W_` codes

In reports we separate:

* **Blocking failures** (E codes)
* **Warnings** (W codes)

---

## Failure taxonomy

### Errors (ship blockers)

| Code | Description |
|:-----|:------------|
| `E_SCHEMA` | Output fails Zod validation |
| `E_CONTRACT_VERSION_MISMATCH` | Missing/incorrect `contract_version` |
| `E_MISSING_REQUIRED_SECTION` | Missing required section(s) or `top_fixes.length < 3` |
| `E_EMPTY_REQUIRED_FIELD` | Any required string field is empty |
| `E_NO_EVIDENCE` | Zero evidence excerpts in top fixes |
| `E_EVIDENCE_TOO_LONG` | Evidence excerpt exceeds 200 chars |
| `E_BANNED_PHRASE` | Matches banned phrase list |
| `E_SCORE_EXTREME` | Absolute drift > 12 points vs baseline |

### Warnings (review recommended)

| Code | Description |
|:-----|:------------|
| `W_SCORE_DRIFT` | Absolute drift 5–12 points vs baseline |
| `W_SUBSCORE_DRIFT` | Subscores drift > ±10 vs baseline |
| `W_EVIDENCE_PARAPHRASE` | Evidence excerpt not verbatim match |
| `W_SUMMARY_STRUCTURE` | Missing role-level signal OR strength OR gap |
| `W_SPECIFICITY_LOW` | Top fixes lack concrete tokens |
| `W_DISCOURAGED_PHRASE` | Matches discouraged phrase list |

---

## CLI usage

### Scripts

```bash
npm run eval:dry-run    # Parse fixtures only
npm run eval:smoke      # Fast sanity check (5 fixtures)
npm run eval:golden     # Full anchor validation (20-40 fixtures)
npm run eval:bulk       # Weekly stress test (200+ fixtures)
```

### Key flags

| Flag | Default | Description |
|:-----|:--------|:------------|
| `--tier` | golden | smoke / golden / bulk |
| `--baseline` | none | Path to baseline JSON |
| `--budget-usd` | 5.00 | Hard cost cap |
| `--max-calls` | 100 | Max API calls |
| `--concurrency` | 3 | Parallel requests |
| `--dry-run` | false | No API calls |

### Examples

```bash
# Dry run
npm run eval:dry-run

# Smoke
npm run eval:smoke

# Golden vs baseline
npm run eval:golden -- --baseline tests/fixtures/results/baseline_v1.json

# Bulk weekly run
npm run eval:bulk -- --baseline tests/fixtures/results/baseline_v1.json
```

---

## Workflow: shipping a new prompt version

1. **Validate fixtures parse**
   ```bash
   npm run eval:dry-run
   ```

2. **Run smoke suite**
   ```bash
   npm run eval:smoke
   ```

3. **Run golden suite vs baseline**
   ```bash
   npm run eval:golden -- --baseline tests/fixtures/results/baseline_v1.json
   ```

4. **Review the report**
   ```bash
   cat tests/fixtures/results/summary_latest.md
   ```

5. **Decide**: If clean, deploy. If warnings, review flagged cases.

6. **Bless baseline** (only when intended): Update baseline file deliberately.

---

## Cost guardrails

| Tier | Fixtures | Est. Cost |
|:-----|:---------|:----------|
| smoke | 5 | $0.05-0.15 |
| golden | 20-40 | $0.25-1.20 |
| bulk | 200+ | $2-8 |

Runner aborts if `--budget-usd` exceeded or `--max-calls` reached.

---

## Adding new fixtures

1. Place resume in correct tier directory: `tests/resumes/{smoke,golden,bulk}/`
2. Add entry to `calibration.json` with tier, expected score range, tags
3. Run smoke and golden to verify behavior
