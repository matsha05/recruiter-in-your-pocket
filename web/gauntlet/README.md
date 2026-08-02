# Gauntlet evidence loop

This operator-only loop tests whether the free report earns enough trust for the five-report offer. It reuses twelve existing synthetic fixtures. It does not copy customer resumes, create competitor accounts, make paid model calls, or treat a builder claim as a verdict.

## Current state

- `iteration-000-baseline.json` binds the deployed production baseline to full commit `181bf60ba636d4d461d0fc0b965f36120b296fb4`.
- `iteration-002.json` is the active pending record for branch `codex/gauntlet-iteration-002`.
- The candidate commit is intentionally unbound and marked `not_deployed` until the candidate is final.
- Iteration 001 was rejected. Its ledger, source snapshot, artifacts, judgments, published progress, and verdict are not inherited here.
- `artifacts/` contains only its allowlist. No iteration-002 evidence has been captured or committed.

Missing evidence stays `pending`. Malformed, unsafe, stale, substituted, or mismatched evidence fails closed. Only a complete, sealed, Git-anchored record with an independent passing critic verdict may pass.

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

## Workflow

1. Keep iteration 002 pending while product work is still changing.
2. Bind the final candidate commit and canonical source receipts. Do not label it deployed without separate deployment proof.
3. Run the commit-bound Gauntlet eval producer, then import its fresh synthetic-only source and emitted runner attestation. The producer binds the raw-run SHA, runner commit, provider response identities, timestamps, model, usage, and cost. Do not hand-author the attestation or reuse iteration-001 output.
4. Capture production and candidate presentations through the hermetic browser harness.
5. Prepare blind packets once, then collect independent judgments, source audits, public-reference assessments, and four current journeys.
6. Record the critic verdict. Mark the ledger complete only when every non-anchor gate passes, then seal the exact case and artifact trees.
7. Commit the evidence record. Create the anchor in the immediate next single-file commit and run strict validation.

Run from `web/`:

```bash
npm run gauntlet:validate -- --iteration=iteration-002
npm run gauntlet:status -- --iteration=iteration-002
npm run gauntlet:eval -- --attestation=/tmp/iteration-002-runner-attestation.json --budget-usd=5 --max-calls=100
npm run gauntlet:capture -- extract --source=<fresh-run.json> --receipt=<runner-attestation.json> --receipt-repository-path=web/gauntlet/runner-receipts/iteration-002.json --manifest=gauntlet/manifest.json --output=gauntlet/sources/iteration-002.json --receipt-output=gauntlet/runner-receipts/iteration-002.json --write
# Update iteration-002.json to collecting with the final candidate binding,
# then commit that ledger and the sanitized source before capturing.
npm run gauntlet:capture -- capture --repository-root=.. --manifest=gauntlet/manifest.json --iteration=iteration-002 --candidate-commit=<candidate-full-sha> --source-commit=<source-full-sha> --source-path=web/gauntlet/sources/iteration-002.json --output=gauntlet/artifacts/iteration-002 --write
npm run gauntlet:prepare -- --iteration=iteration-002
npm run gauntlet:anchor -- --iteration=iteration-002
npm run gauntlet:strict -- --iteration=iteration-002
npm run test:gauntlet
```

`gauntlet:strict` should exit nonzero while iteration 002 is pending. The hosted `/launch/gauntlet` page is intentionally a pending bootstrap surface only: it reads the tracked definition, uses the fail-closed launch-admin allowlist, carries `noindex, nofollow`, and returns no evidence if the definition cannot be validated. Collecting and completed evidence inspection stays local inside the protected repository and is never published as a progress artifact.
