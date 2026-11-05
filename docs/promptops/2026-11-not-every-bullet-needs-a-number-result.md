# Result: not every good bullet needs a number (November 5, 2026)

The proposal is [`proposals/2026-11-not-every-bullet-needs-a-number.md`](proposals/2026-11-not-every-bullet-needs-a-number.md). It was run as two separate candidates through the judge gate in [`shipping-gate.md`](shipping-gate.md), within the $50 cap Matt set on November 5 ($47.45 remaining at the start), with synthetic resumes only and the OpenAI key alone.

**Decision: ship nothing.** Both candidates reach the replay counts the proposal set, and neither is preferred by the Critical Miss judge. Candidate A passes the severity check's own gate but loses, clearly and in both side orders, on three of the four resumes where it changes the report. Candidate B is preferred on 2 of 22 resumes and production on 7. The judge's reason is the same on nearly every loss: under its count rule (C8), the absence of scale or a result anywhere in the latest role is a problem that would cost an interview on its own, and a report that stops naming it under-counts. The judge stands in for Matt's blind pick, and Matt's own notes point the same way ("Budget size is a tangible thing to grasp onto, it helps the recruiter understand the scale"). The proposal's premise, that a recruiter would not ask an intern or a duty-only latest role for scale, is not what the gate rewards. Spend: $3.74 measured against a $3.67 estimate and a $12 stop line. The prompts in `web/prompts/` are unchanged.

## The two candidates

Every other line of both prompts is byte-identical to production. Production hashes (of the trimmed text, as the runtime records them): resume `83b2a2d1`, severity `f1bb4571`.

### Candidate A: the severity prompt's `no_evidence_latest_role` definition (`ac4bb5a1`)

Line 11 of `web/prompts/severity_check_v1.txt`. The mid-career sentence is production's, unchanged; the rest is new.

```diff
-- no_evidence_latest_role: the latest role in the field this person wants shows no size and no result anywhere in its main work: no team, caseload, accounts, customers, budget or volume they personally run, and no measurable result. Unrelated current work is never this problem.
+- no_evidence_latest_role: the latest role in the field this person wants shows no size and no result anywhere in its main work: no team, caseload, accounts, customers, budget or volume they personally run, and no measurable result. On a mid-career role that is the problem as stated, and the fix asks for the measure that defines this kind of role, such as food cost for a kitchen manager, caseload for a social worker, or the book for an account manager. An internship or a first role is read differently: it is not this problem when its bullets name a deliverable they made, a problem they resolved, a decision they made, or a named counterpart or audience they worked with, because a reader does not expect an intern to have run a team, a budget, or a volume, and a figure is one kind of evidence there, not the standard. When an internship or a first role names none of those either, it is this problem, and its fix asks for one named deliverable, resolved problem, or decision from that role, never for a headcount, an audience size, a volume, or a measurable result. Unrelated current work is never this problem.
```

A first draft of this candidate (`d9d8ab5e`, receipts `summary_severity_bullet_number_candidateA_r83b2a2d1_sd9d8ab5e_run{1,2}.md`) also rewrote the mid-career bar to "nothing a reader can hold", listing a named deliverable, a resolved problem, a decision or a counterpart as evidence for every role. On two passes it fired `no_evidence_latest_role` on 1 of the 7 keyed bad resumes where the key says it should (production: 5 of 7) and on none of the golden resumes: a duty line such as "Sent weekly status emails to stakeholders" names a counterpart, so a duty-only mid-career role no longer qualified. That contradicts the proposal, which keeps the rule for a mid-career role, so no judge call was spent on it ($0.10 for the two passes) and it was replaced by the candidate above.

### Candidate B: the resume prompt's rule 10 and VOICE line (`e09ca912`)

Lines 23 and 45 of `web/prompts/resume_v2.txt`; the additions are the final sentences of each.

```diff
-- In first_impression, summary, or strengths, react once to a fact the resume has earned. Say why a result is useful, worth keeping, or changes the read. Keep it brief and specific. Do not turn it into praise or a catchphrase.
+- In first_impression, summary, or strengths, react once to a fact the resume has earned. Say why a result is useful, worth keeping, or changes the read. Keep it brief and specific. Do not turn it into praise or a catchphrase. A fact is earned when the page shows the work behind it. A bare figure is not: a team size, a budget, or a volume over bullets that never say what that team did, who reported to whom, or what came of it is a claim a recruiter would ask about, so put the question in a gap or a fix instead of keeping it.
```

```diff
-    Conversely, respect the ownership the resume does state. Active verbs such as "closed", "managed", or "delivered" attribute that work to the resume owner. Do not invent uncertainty about whether it belongs to someone else; ask how they did it only if that would add useful detail. Treat shared credit as unclear only when the source actually suggests shared or team results.
+    Conversely, respect the ownership the resume does state. Active verbs such as "closed", "managed", or "delivered" attribute that work to the resume owner. Do not invent uncertainty about whether it belongs to someone else; ask how they did it only if that would add useful detail. Treat shared credit as unclear only when the source actually suggests shared or team results. Ownership is not support: a figure with nothing behind it anywhere on the page, such as "Led a team of 40" over bullets that never say what the team did, who reported to the person, or what came of it, stays attributed to them, but it is a question for them ("What did the team of 40 do, and who reported to you?"), not a strength to keep, and the role's level should not be read from the figure alone. A figure the page supports with the work around it is still worth keeping, and say why.
```

## How it was run

Corpus: the golden tier's 10 synthetic fixtures plus the 12 labeled count-check resumes (8 bad, 4 strong), 22 in all. The 13 real-person golden fixtures and the 3 smoke fixtures were not sent, per the synthetic-only condition on the cap; the October 31 proof set the same precedent.

1. **P**: production resume prompt on all 22, once (`summary_bullet_number_production_r83b2a2d1_golden_synthetic.md`, `..._count_check.md`): 22 PASS, 0 WARN, 0 FAIL.
2. **P_sev**: the production severity prompt over P's reports (`summary_severity_bullet_number_production_r83b2a2d1_sf1bb4571.md`). The resume reports are held fixed for candidate A so only the severity prompt differs.
3. **A**: candidate A's severity prompt over the same P reports, two passes (`summary_severity_bullet_number_candidateA_r83b2a2d1_sac4bb5a1_run{1,2}.md`); run 1 judged.
4. **B**: candidate B's resume prompt on all 22, twice (`summary_bullet_number_candidateB_re09ca912_golden_synthetic_x2.md`, `..._count_check_x2.md`), then the production severity prompt over its reports (`summary_severity_bullet_number_candidateB_re09ca912_sf1bb4571.md`), so the judge sees what a reader sees and the count checks can pass. The compare takes the first shown report per fixture.
5. The judge (`gpt-6.1-sol`, `critical-miss-judge-v4`, prompt `e1860dbf`, medium, seed 20261101): `compare` production against each candidate; the severity check's own gate (`severity`) on candidate A, and on production under the same code for comparison. Receipts in `tests/fixtures/results/judge/`, named `bullet-number-*`.
6. The five replay-count cases (b10, b11, b39, h2 twice each; h6 three times) through the production path with the live judgment run's runner, once per candidate: outputs and ledgers under [`2026-11-not-every-bullet-needs-a-number/A/`](2026-11-not-every-bullet-needs-a-number/A/) and [`B/`](2026-11-not-every-bullet-needs-a-number/B/), read with `npm run replay:live-judgment -- --dir <folder> --check-saved` (all 22 replay as shipped) and counted by the rule below.

The per-run eval JSONs are gitignored as always; the summaries, the judge receipts and the replay-case outputs are the record.

## Candidate A: the judge

The shipping gate defines a separate gate for the severity check, because its answer never changes the first fix: under-count, over-count and absolute-mode vetoes, with no preference bar. Candidate A passes it. The proposal named the `compare` gate's `GATE: PASS` as the bar, so that was run too.

| Check | Candidate A (`ac4bb5a1`) | Production (`f1bb4571`), same code, same reports |
| --- | --- | --- |
| Severity gate | **PASS**. Under-count 8 of 8; over-count 4 of 4; vetoes 0 in 13 extended reports | PASS. 8 of 8; 4 of 4; 0 in 13 |
| Not gated: added Critical Misses outside the key the blind count call rates critical on their own | 2 of 7 | 3 of 9 |
| `no_evidence_latest_role` on the 7 keyed bad resumes whose key lists it | run 1: 4 (sales rep as Fix 2, admin, accountant, project coordinator); run 2: the same plus the recent grad as Fix 2 | 5 (those four and the recent grad, with a post-count ask) |
| `compare` against production | **GATE: FAIL**: preferred 1 of 22; production 3 (all clear, both orders); no real difference 18; vetoes 0; both count checks pass | |

Receipts: `judge/2026-11-05T23-16-57-256Z_severity_bullet-number-A-sac4bb5a1-on-r83b2a2d1.md`, `judge/2026-11-05T23-19-53-332Z_severity_bullet-number-production-sf1bb4571-on-r83b2a2d1.md`, `judge/2026-11-05T23-19-47-534Z_compare_bullet-number-A-r83b2a2d1-sf1bb4571-vs-sac4bb5a1.md`.

The 18 ties are the resumes where the candidate's severity answer was the same as production's; a severity-only change cannot reach 80% by construction, which is why the gate document gives this check its own gate. What decides it is the four resumes that differ:

- **Production preferred, clear in both orders:** the count-check recent grad (b11's resume), the entry-level operations assistant, and the senior finance analyst. The judge's reason on all three is C8: production additionally flags that the latest role shows no scale or result anywhere, and the candidate stops doing so. On the recent grad: "Its specific request for a verifiable post count or measurable result on '- Posted on the credit union's social media accounts' supplies a concrete way to establish scope, rather than merely polishing wording." On the finance analyst, whose latest role reads "Duties included analyzing budget data and forecasting trends": "Asking for a verifiable budget size addresses an independently consequential problem for a senior finance analyst."
- **Candidate preferred, clear:** the count-check operations manager, where the candidate's pass happened to flag the director headline mismatch and production's did not. That is run-to-run variation in the severity check, not the changed rule; both passes of the candidate flagged it, production's single pass did not.

So the change does what the proposal asked and the judge counts it as a loss where it bites, including on the intern resume it was written for.

## Candidate B: the judge

`compare` production (after the production severity check) against candidate B (after the same check): **GATE: FAIL**.

- Candidate preferred: 2 of 22 (9%; bar 80%). Production preferred 7 (3 clear, 4 slight). No real difference 13 (side orders disagreed in 1). Vetoes: 0 on either side.
- Under-count 8 of 8; over-count 4 of 4. Warning, not a fail: the blind judge rates the admin generalist's P2 not critical on its own (the same warning appears for candidate A and in earlier gates; it is the key's label, not the prompt).
- Receipt: `judge/2026-11-05T23-28-40-668Z_compare_bullet-number-B-r83b2a2d1-vs-re09ca912-sf1bb4571.md`.

Where production won and why, in the judge's words:

- Three slight losses on strong resumes (data scientist, UX director, product manager) are first-fix placement: the candidate's first fix moved off the figure-bearing central bullet onto a supporting one. UX director: production "strengthens a more consequential management responsibility: '- Own the UX budget and vendor contracts ...'"; the candidate "instead expands '- Mentor junior designers ...', a supporting duty". Data scientist: the candidate "targets an older supporting project". This is the change working as written and the judge preferring the figure-bearing line (C1).
- Two clear losses (sales executive, finance analyst) and one slight (sales rep) turn on whether the shown Critical Misses include the latest role's missing scale and the headline mismatch; the severity prompt was production's on both sides, so these are variation in the severity check's answer between the two runs, not the resume prompt. The clear loss on the project coordinator is the same: the candidate's run led with the gap and the severity check did not add the headline mismatch.
- The two clear wins (operations manager, staff accountant) are the mirror image: the candidate's run flagged the headline mismatch and production's did not.

Net of the severity-check noise, the resume-prompt change itself is what the three slight losses measure, and it loses. The judge does not record a case where questioning a bare figure was preferred, because no golden or count-check resume carries one; the h6 resume, which does, is a replay-count case and is not in the judged corpus.

Golden and count-check runs under B: 42 PASS, 1 WARN, 1 FAIL in 44 reports. The WARN is `W_MECHANICAL_COPY` ("the finance process" repeated in a fix). The FAIL is one of the two physical therapist runs, refused after repair for "unsupported narrative facts: giving, beyond, treatment" in "You built a return-to-run program that 85 patients completed in 2025, giving a reviewer a concrete example of work beyond individual treatment": the ordinary-word refusal class the judgment wave catalogued, with "treatment" an inflection of the resume's "Treat" that the six-letter root rule does not reach. The other run of that fixture passed and was judged. Score test-retest range across the 22 fixtures: 0 to 3 points. The golden set's 0-FAIL rule holds (10 of 10, twice); the FAIL is on the count-check set.

## The three replay counts

Counted by `count-replays.py` (in the PR's scratch, reproduced here as a rule): an **intern-scale ask** is a shipped Critical Miss, or a `no_evidence_latest_role` item in the severity answer, on b10, b11, b39 or h2 whose fix asks how many, the number or size of, a volume, an audience size, a headcount, or a measurable result. **Kept as a strength** on h6 is the Verdict, one-line read or a strength that names the team of 40 and keeps, praises or reads scale from it. **Question present** is a fix, gap, question or biggest-gap example that names the team of 40 and asks what it did or who reported. On the live run's saved outputs the rule reproduces the proposal's numbers exactly (6 of 6; 3 of 3 kept, 0 of 3 question).

| Count | Today (saved outputs) | Target | Candidate A | Candidate B |
| --- | --- | --- | --- | --- |
| Intern-scale asks on b10, b11, b39, h2 | 6 of 6 shipped (h2 never shipped) | 0 of 8 | **0 of 8** (`no_evidence_latest_role` fired once, on b11 run 2, as Fix 2: "In the newsletter bullet, specify what you prepared or coordinated and identify a piece you contributed") | 8 of 8 (the severity prompt is production's; h2 now ships and fires too: "add how many survey records you cleaned") |
| "Led a team of 40" kept as a strength on h6 | 3 of 3 | 0 of 3, with the question present | 2 of 3 kept; question 2 of 3 (the resume prompt is production's) | **0 of 3 kept; question 3 of 3**: "What work did the team of 40 handle, and who reported directly to you?"; Fix 1 in two runs: "In the Operations Manager team bullet, explain what the team of 40 did and who reported directly to you." |
| Under-count on the count-check resumes | 8 of 8 | unchanged | 8 of 8 (gate and compare) | 8 of 8 |

Both candidates meet their counts. The counts measure whether the change happens; the judge measures whether the report is better for it, and says no.

## Spend

Estimated before the first call (`estimate` in the PR): $3.67 expected, $7.93 worst case, stop line $12. Measured, token-priced:

| Step | Measured |
| --- | --- |
| P: production resume prompt, 22 reports | $0.4013 |
| P_sev: production severity on P | $0.0724 |
| A first draft (`d9d8ab5e`), two severity passes | $0.1000 |
| A (`ac4bb5a1`), two severity passes | $0.1054 |
| B: candidate resume prompt, 44 reports | $0.6833 |
| B_sev: production severity on B | $0.1343 |
| Judge: severity gate on A | $0.2717 |
| Judge: severity gate on production (comparison) | $0.2627 |
| Judge: compare production vs A | $0.5987 |
| Judge: compare production vs B | $0.6803 |
| Replay-count cases, A (11 runs) | $0.2109 |
| Replay-count cases, B (11 runs) | $0.2155 |
| **Total** | **$3.7366** |

About $43.71 of the $50 cap remains.

## What this says, and what it does not

- The judge's rubric, calibrated to Matt's picks and his count decision, treats a latest role with no scale and no result as an interview-costing problem on its own, for interns too. A prompt that asks interns for a deliverable instead of a count will keep losing under that rubric until the rubric says otherwise. That is a product call for Matt, not a prompt edit: if he agrees with the proposal's premise, the Critical Miss rubric (C8 and the count key's P2 on the recent grad) would need to change first, and the judge recalibrated.
- Candidate B's own effect, questioning a bare figure, was exercised only on h6, where it did what the proposal asked in 3 of 3 runs. The judged corpus has no bare figure, so the judge measured only the side effect: on strong resumes the first fix drifts off the figure-bearing central bullet. A narrower edit that leaves rule 10 alone and touches only the VOICE line might avoid that; it was not run.
- The severity check's answer varies between runs on the headline-mismatch and gap kinds (it did on four of the nine non-tie resumes in the B compare). A compare of two resume prompts after the severity check carries that noise; a compare before it would lose the count checks. Running the severity check twice per side and judging the agreement is one way to cut it, at about twice the severity spend.
- One pass of each gate. The gate document notes a result within one resume of the bar is worth a second run; neither candidate is within one resume.

## Verification

From `web/` on the final tree, prompts unchanged (resume `83b2a2d1`, severity `f1bb4571`):

- `./node_modules/.bin/tsc --noEmit -p .`: clean.
- `npm run lint`: clean.
- `npm run test:backend-contracts` (includes the prompt-assets test): passed.
- `npm run test:llm-contract` (includes `tests/live-judgment-replay.test.ts`, which pins the judgment wave's after numbers): passed.
- `npm run test:release-integrity`: passed; the gauntlet build-trace test skipped itself because no production build was made here.
- `npm run replay:live-judgment -- --compare ../docs/audits/2026-11-judgment-wave/replay-before.json` on the saved outputs: 87 shipped from the first draft, 14 after repair, 0 never shipped, 0 repaired drafts refused, 11 runs led by a structural miss, the judgment wave's after numbers exactly.
- The replay-case outputs under `A/` and `B/` replay through the harness as shipped, 11 of 11 each.

GitHub Actions is billing-blocked, so this is local verification only.
