# Proposal: not every good bullet needs a number

Status: proposed, not run. November 5, 2026. From [the judgment wave](../../audits/2026-11-judgment-wave.md), which fixed the validator and the severity merge in code and left this as the one item that needs the prompt.

## What the saved outputs show

The live judgment run ([audit](../../audits/2026-11-live-judgment.md), saved outputs under `docs/audits/2026-11-live-judgment/outputs/`) shows the report prizing figures over other evidence in three places.

1. **The severity check asks interns for scale.** Its `no_evidence_latest_role` rule reads every latest role the same way: "no team, caseload, accounts, customers, budget or volume they personally run, and no measurable result." On the three student resumes it fired 6 of 6 times:
   - b10 IT support graduate, both runs: "In the Chattahoochee County Schools internship, add how many tickets or laptops you personally handled, if you can verify it."
   - b11 recent graduate, run 1: "In the Badger State Credit Union role, add the newsletter's audience size or a measurable result from your contribution, if you can verify it."
   - b39 new graduate Daniel, run 1: "In the Cardinal Health internship, add the size of the Agile team you worked on or a measurable result of a feature you developed, if you can verify it."; run 2: "add how many users your work served or a measurable result, if you can verify it."
   The resume prompt's own first fix on each of these asked the better question: name a feature and what it let users do (b39), name the kinds of issues you handled (b10), name the information the dashboard tracked and what the marketing team used it to examine (h2).
2. **A figure with nothing behind it is praised.** "Led a team of 40" over duty bullets (h6) was kept in 3 of 3 runs: "Leading a team of 40 is worth keeping near the top because it shows the size of your management responsibility." Role fit read management level from it. A recruiter would ask what the forty did and who reported to whom. Rule 10 of the resume prompt ("respect the ownership the resume does state") and the VOICE line ("react once to a fact the resume has earned") produce this; nothing in the validators can tell a bare figure from a supported one, and nothing should: that is a judgment.
3. **The role's defining measure is asked for rarely, and other evidence is discounted.** The head-to-head comparison (PR 64) saw the report pass over a line about being the hiring contact for a chief security officer, a fact a recruiter can hold, while asking for figures elsewhere. In the live run nobody asked the kitchen manager about food cost or labor, or the warehouse supervisor about orders per night; the caseload and the driver count were asked, never first.

## The rule

A bullet carries evidence when it names something a recruiter can hold and check: a decision, a named deliverable, a problem resolved, a named counterpart or audience, a tool used on a named task, or a figure. A figure is one kind of evidence, not the standard. The ask for a number belongs where the role's defining measure is missing (food cost for a kitchen manager, caseload for a social worker, drivers for a dispatcher, the book for an account manager), not on every bullet and not on an intern's first role. A bare figure with nothing on the page behind it is a claim to question before it is a strength to keep.

## Where it would live

Two prompt edits, each gated:

1. `web/prompts/severity_check_v1.txt`, the `no_evidence_latest_role` definition: name the kinds of evidence that count (a named deliverable, a resolved problem, a decision, a named counterpart), and exempt an internship or first role from the size-and-result bar when one of those is present. Keep the rule for a mid-career latest role with none of them.
2. `web/prompts/resume_v2.txt`, rule 10 and the VOICE line: a figure with no supporting detail anywhere on the page is a question for the person ("What did the team of 40 do, and who reported to you?"), not a keep; keep praising figures the page supports.

Neither edit is in this wave's PR. A prompt change ships only through the judge gate.

## Eval plan (the judge gate, `docs/promptops/shipping-gate.md`)

- Candidates: the two prompt edits above, run separately so each can pass or fail on its own.
- Corpus: the golden set (`npm run eval:golden`) and the six hole resumes from the live run, two runs each against production.
- Cost: the live run measured $0.011 to $0.019 per shipped report with its severity call; about $6 to $8 for both candidates, budget $10 of the remaining cap (about $47.45 as of November 5). `RIYP_ALLOW_PAID_EVALS=true` on each command, the OpenAI key alone from the main checkout's `web/.env.local`, synthetic resumes only.
- Pass: the Critical Miss judge's `GATE: PASS` (candidate preferred on at least 80% of resumes, zero candidate vetoes, both count checks on every labeled resume), and three counts read from the saved outputs with the replay harness (`npm run replay:live-judgment`):
  - intern-scale asks on b10, b11, b39 and h2: 6 of 6 today, target 0 of 8;
  - "Led a team of 40" kept as a strength on h6: 3 of 3 today, target 0 of 3, with the question present;
  - the under-count check unchanged: `no_evidence_latest_role` still fires on the count-check resumes whose key says it should.
- Receipt: the run summary and spend in `tests/fixtures/results/`, named with both prompt hashes, and a line in the shipping gate.
- If the first candidate passes and the second does not, ship the first alone.
