# Gauntlet evidence loop (retired)

Matt ended this operator-only loop on August 10, 2026 because its token and review cost outweighed its usefulness. Iteration 002 is retired without a candidate binding, evidence capture, critic verdict, seal, or quality claim.

## Current state

- `iteration-000-baseline.json` binds the deployed production baseline to full commit `181bf60ba636d4d461d0fc0b965f36120b296fb4`.
- `iteration-002.json` is the final retired record. It is not pending work and must not be represented as a pass.
- The candidate commit remains intentionally unbound and marked `not_deployed` because the run stopped before capture.
- Iteration 001 was rejected. Its ledger, source snapshot, artifacts, judgments, published progress, and verdict are not inherited here.
- `artifacts/` contains only its allowlist. No iteration-002 evidence has been captured or committed.

Missing evidence remains absent. The later 23-case PromptOps result is separate evidence and is not relabeled as a Gauntlet result.

## Pass contract

- All 12 cases have production and candidate artifacts bound to real full Git commits, models, the canonical resume prompt, and the report renderer.
- Every output binds the source fixture, report JSON, rendered text, screenshot, runtime closure, dependency tree, and capture-server identity.
- The candidate wins at least 9 of 12 blinded comparisons for trust, specificity, and actionability.
- The candidate meets or beats the inspected public-reference bar on at least 9 of 12 assessments per dimension.
- Automated report checks and human source audits cover all 12 candidate outputs with zero invented facts.
- Four fresh, hash-bound desktop and mobile journeys complete with zero critical failures.
- The independent critic says pass, the artifact-tree seal matches, and a later single-file anchor commit pins the evidence commit.

## Tracked layout

```text
manifest.json
iterations/iteration-000-baseline.json
iterations/iteration-002.json
templates/*.example.json
artifacts/.gitignore
artifacts/iteration-002/                 # empty until fresh evidence is captured
```

Evidence may eventually contain paired outputs and screenshots, blind packets and mappings, judgments, source audits, public-reference assessments, and journey receipts. The artifact allowlist accepts only that iteration-002 shape. Staging directories, eval dumps, customer data, and unrelated files stay ignored.

## Historical tooling

The harness remains in the repository so the stopped record stays inspectable. `gauntlet:validate`, `gauntlet:status`, and the protected `/launch/gauntlet` page report the retired state. `gauntlet:strict` remains nonzero because no pass was earned, and `gauntlet:eval` refuses to make paid calls while the active iteration is retired.
