# Report Voice Refinement - July 28, 2026

**Status:** Release candidate and live quality proof complete
**Production model changed:** Yes, to `gpt-5.6-luna`
**Production deployment:** Authorized with this main-branch release

## Product call

The report should sound like a good recruiter talking through one real resume: specific, candid, respectful, and occasionally warm when the evidence earns it. It should not sound like a scorecard narrator, a line editor, or a template filling in "strength / gap / consequence" slots.

The refined contract now:

- opens with the fact that most changes the read rather than a mandatory stock phrase;
- lets warmth come from a real result, progression, or unusual detail;
- gives the first impression, summary, strengths, gaps, and fixes distinct jobs;
- rejects evaluator language such as "cited bullet," "role-level signal," and "material gap";
- avoids duplicated clauses, sentences, and mechanically appended gap language;
- keeps recommendations grounded in the supplied resume and uses placeholders only for facts the user must provide.

## Fresh Luna evidence

Source run: `tests/fixtures/results/2026-07-28T20-51-41-424Z_live_run.json`

- Model: `gpt-5.6-luna`
- Reasoning: low
- Corpus: 23 golden fixtures
- Run ID: `eval_1785271781375`
- Cost: $0.287278
- Returned usage: 165,324 input tokens, 45,114 output tokens, 1,511 reasoning tokens
- Result: **22 pass, 1 warn, 0 fail (95.7%)**
- Resume prompt SHA-256: `dcfecbf6ad919950f69d6a12d8e0db3a46d3268a836c22771cbd5b425312a950`
- Resume-ideas prompt SHA-256: `6d90925e63aae15476712f92af5ffbdf4e684feec413711e14d6dba7201b6fc7`

The only warning was score variance on the finance-controller fixture: 66 against an expected 70-80. There were no copy, specificity, grounding, schema, source-drift, safety, or blocking failures.

Total voice-refinement eval spend, including bounded spot checks, diagnostic runs, and the final candidate-bound proof: **$2.088653**.

## Human read

The resulting reports are materially more human without becoming soft or promotional. Examples include:

- "The clean SOC 2 Type II report for 2020 is the one result that moves beyond a task list."
- "The growth figure is memorable, but the missing timeframe and method prevent a recruiter from judging your pace and contribution."
- "The practical question is how much financial and facilities authority you held."
- "The clearest value here is dependable retail service under volume."

Weak resumes still receive a direct read. Strong resumes receive recognition tied to actual evidence rather than generic praise.

## Verification

- LLM response-contract tests: pass
- Backend and prompt-asset contract tests: pass
- ESLint: pass with zero warnings
- Next.js production build: pass
- Golden-corpus exact-response replay: 23/23 pass
- `git diff --check`: pass

## Remaining release step

Verify Vercel reports this main-branch release ready on the production alias. The release configuration and bundled readiness evidence bind Luna to the exact prompt hashes above.
