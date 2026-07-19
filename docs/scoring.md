# First-read score contract

Last updated: 2026-07-11

Status: Canonical product contract

The first-read score summarizes how clearly one resume communicates on a quick recruiter-style review. It is a document score, not a person score. It does not estimate interview probability, offer probability, ATS ranking, career potential, or job performance.

The written finding comes first in the report because it tells the user what the reviewer understood, what remains unclear, and what to change. The score stays visible as a compact summary and comparison aid.

## What contributes to the score

Every resume report includes four diagnostic dimensions:

1. **Story**
   - Can a reader follow the roles, progression, and intended direction?
2. **Impact**
   - Does the resume show what changed because of the work, including useful scope or outcomes?
3. **Clarity**
   - Are the candidate's role, ownership, and claims specific enough to evaluate?
4. **Readability**
   - Can a reader find the experience and evidence that matter without unnecessary effort?

These dimensions organize the evidence behind the review. The overall score is a calibrated whole-document judgment, not a mechanical average of four numbers. Context can make one missing fact more consequential than several small strengths.

Do not publish percentage weights unless the runtime calculates the score from those exact weights. Today it does not.

## Canonical bands

| Score | Public label | Meaning |
|---|---|---|
| 85-99 | Clear and specific | The story, ownership, results, and structure are consistently easy to understand. |
| 70-84 | Mostly clear | Most of the document is understandable, with a few important details missing or buried. |
| 0-69 | Needs more context | Several parts of the document are difficult to evaluate. Start with the first recommended change. |

The runtime never displays 100. Scores near a boundary should use the lower score when the evidence is mixed.

## Display contract

- User-facing name: `First-read score`
- Lead with the written takeaway, but keep the number and band visible in the first report viewport.
- Derive the public band from the numeric score. Do not display a free-form model label.
- Show the four diagnostic dimensions near the score.
- Every recommended change must point to a resume excerpt or name the missing fact.
- Use the same bands in the report, history, sample data, PDF export, Methodology, and Research.

## Claims we may make

- The score summarizes this resume review.
- It helps show where to start and compare revisions of the same resume.
- The report explains what drove it.

## Claims we may not make

- The score predicts interviews, offers, or hiring outcomes.
- The score represents an ATS score or universal recruiter verdict.
- A higher score proves that one candidate is better than another.
- A small score difference is meaningful without looking at the written evidence.

## Current and future fields

- `score`: current first-read score displayed in the UI.
- `content_score`: compatibility field; currently mirrors the content-focused score.
- `subscores`: Story, Impact, Clarity, and Readability diagnostics.
- `layout_score`: reserved for a separately validated visual-layout model. It is not part of the public overall score today.
- `layout_band` and `layout_notes`: reserved compatibility fields.

Any future deterministic rollup or layout contribution requires calibration against a larger reviewed set, a migration plan for saved reports, updated PromptOps baselines, and synchronized changes to this document and every public explanation.
