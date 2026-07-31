# Gauntlet evaluation loop

This operator-only loop evaluates whether the free review earns enough trust for the five-review offer. It reuses twelve existing synthetic/golden fixtures; it does not copy customer resumes, create competitor accounts, or make paid model calls.

The tracked files under `iterations/` are the inspection ledger. Evidence is ignored by default; the narrow `artifacts/.gitignore` allowlist permits only the sealed synthetic-only `iteration-001` shape needed by the hosted operator page. A completed ledger is valid only while its case-set hash, complete artifact-tree hash, previous-ledger hash, and Git-backed evidence anchor all match.

## What counts as a pass

- All 12 cases have candidate and production artifacts bound to real full Git commits, models, the canonical resume prompt, and a canonical report renderer.
- Every output carries verified fixture, report, rendered-text, and screenshot receipts.
- The candidate wins at least 9 of 12 blinded comparisons for each of trust, specificity, and actionability.
- The candidate meets or beats the inspected Teal/Jobscan public-reference bar on at least 9 of 12 structured assessments per dimension.
- Existing automated report checks complete for all 12 candidate outputs with no contract or source-integrity failure.
- Human source audits cover all 12 candidate outputs with zero invented facts.
- Four fresh, hash-bound desktop/mobile journeys complete with zero critical failures.
- The independent critic says pass, every gate is complete, and the evidence tree matches both its completion seal and immutable Git anchor.

Missing evidence is `pending`. Invalid, unsafe, stale, or mutated evidence is `fail`. A ledger marked `complete` fails if any required gate is not actually complete.

## Immutable iteration ledger

Each tracked `iterations/<safe-id>.json` record contains:

- builder change and claim;
- critic verdict, rationale, and remaining gap;
- exact candidate and production repository receipts;
- a hash link to the immediately preceding ledger;
- a completion seal over the case set and the entire artifact tree.

Iteration and case IDs are strict lowercase path components. Readers reject traversal, symbolic links, unknown IDs, missing commits, dirty current-candidate prompt/renderer files, and noncanonical repository paths. Historical records are selectable on `/launch/gauntlet`; selection is read-only and never changes the active iteration.

Every complete record also has `anchors/<safe-id>.json`. The evidence commit contains the final ledger and every artifact. The anchor is created from that commit and added in the immediate next commit, whose entire diff must be exactly that one newly added regular anchor file and no other path. Strict verification requires the current ledger and artifact bytes to match their exact Git blobs, the current anchor bytes to match the blob from the commit that first introduced the anchor, and that introduction commit's sole parent to be the named evidence commit. Rewriting evidence and recomputing seals, chain links, and later anchor files therefore remains invalid. As with any repository-local receipt, rewriting the repository's entire published history is outside this mechanism's trust boundary; retain the anchored commits on the protected remote.

The real tracked baseline remains `iteration-000-baseline`: one honest pending record with zero output pairs or verdicts. The test suite builds two complete iterations only in temporary, explicitly test-only directories and removes them after validation.

## Evidence layout

```text
outputs/candidate/<case-id>.json
outputs/production/<case-id>.json
presentations/candidate/<case-id>.png
presentations/production/<case-id>.png
packets/<case-id>.json
packets/assets/<case-id>-A.png
packets/assets/<case-id>-B.png
operator/mapping.json
judgments/<case-id>.json
source-audits/<case-id>.json
reference-assessments/<case-id>.json
journeys/<journey-id>.json
journeys/evidence/<journey-id>-<kind>.<ext>
```

Output schema v2 keeps generation and presentation provenance separate. It binds:

- the actual generation timestamp, run ID, model, canonical trimmed prompt SHA-256, fixture ID, and report SHA-256;
- a committed `web/gauntlet/sources/*.json` sanitized-output receipt containing exactly the 12 manifest cases, all synthetic and passing, with no extra/private results;
- a real, independently hash-bound source commit containing the sanitized receipt; packaging may occur after an older renderer commit, so no false ancestry relationship is asserted;
- a separate renderer commit plus renderer Git-blob receipt and later capture timestamp;
- a fixture content SHA-256 without persisting its repository path in the artifact;
- canonical report JSON SHA-256;
- visible presentation text SHA-256;
- contained screenshot path and byte SHA-256.

Blind mappings and judgments repeat the exact candidate and production artifact, generation source, canonical prompt, report, fixture, renderer, visible-text, and screenshot hashes. Replacing either output, changing A/B labels, or changing a packet/screenshot makes the old judgment disappear and turns evidence integrity red.

Journey schema v2 requires the exact candidate commit and journey-definition hash, a matching desktop/mobile viewport label, application entry/final paths, passed or failed steps with evidence, and contained hash-verified screenshot, DOM, console, and interaction files. A completed record accepts only journeys captured between iteration creation and sealing, no more than 48 hours before the seal.

The operator page reveals candidate/production identity only after the selected case has a current blind judgment. It renders only the hash-bound visible presentation text; it never renders the raw report payload, source resume text, or fixture filesystem paths.

## Workflow

1. Add a new tracked ledger whose `previous` receipt matches the latest ledger. Do not edit a completed predecessor.
2. Commit the sanitized synthetic-only 12-result source, then bind candidate and origin/main baseline renderers to real repository commits and canonical prompt/renderer receipts. A renderer baseline is not called deployed unless deployment is separately verified.
3. Import all 12 v2 output pairs and screenshots with their historical generation and later presentation receipts kept distinct.
4. Run `gauntlet:prepare` once. Packet preparation stages files first and refuses to replace an existing mapping.
5. Add blind judgments, source audits, public-reference assessments, and four journey receipts.
6. Record the critic verdict, compute the artifact-tree seal, and mark the ledger complete only when every non-anchor gate passes.
7. Commit the final ledger and complete artifact tree as the evidence commit.
8. Run `gauntlet:anchor` once. Commit only the new anchor record in the immediate next commit; do not amend either commit or change evidence between them.
9. Run strict validation. Any mutation after review, sealing, or anchoring exits nonzero.

Blank, non-evidentiary shapes live in `templates/`. They are deliberately invalid until every placeholder is replaced.

## Commands

Run from `web/`:

```bash
npm run gauntlet:validate -- --iteration=<iteration-id>
npm run gauntlet:prepare -- --iteration=<iteration-id>
npm run gauntlet:anchor -- --iteration=<iteration-id>
npm run gauntlet:status -- --iteration=<iteration-id>
npm run gauntlet:strict -- --iteration=<iteration-id>
npm run test:gauntlet
```

`gauntlet:anchor` uses the current `HEAD` as the evidence commit and refuses to replace an existing anchor. `gauntlet:strict` exits nonzero for pending, failing, unanchored, stale, or mutated records. `next.config.mjs` explicitly traces `gauntlet/**/*` into the `/launch/gauntlet` server bundle so tracked evidence survives production packaging. A packaged host without `.git` may render an incomplete record as explicitly unverified and pending, but can never verify or pass a completed record; strict verification belongs in the protected repository. On non-local hosts `/launch/gauntlet` uses the same fail-closed admin allowlist as `/launch` and remains `noindex, nofollow`.
