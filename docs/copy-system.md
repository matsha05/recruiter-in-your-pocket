# Copy System V1.0

Last updated: 2026-02-07
Owner: Product + Design
Scope: Marketing pages, app UI, trust and billing copy, error states

## 1. Voice Definition

Primary voice:
- Trusted recruiter friend.
- Warm, direct, specific.
- Technical when useful, never performative.

What we sound like:
- "Here is what a recruiter sees."
- "Here is why it matters."
- "Here is what to change next."

What we do not sound like:
- Generic AI assistant.
- Corporate policy document.
- Hype-heavy direct response ad copy.

## 2. Tone by State

| Product state | Tone target | Rules |
|---|---|---|
| Marketing hero | Clear and decisive | One claim, one mechanism, one CTA |
| Product guidance | Direct and practical | Evidence first, recommendation second |
| Error states | Calm and actionable | What happened, what to do now, fallback path |
| Pricing and billing | Precise and explicit | Boundaries and controls over persuasion |
| Trust, privacy, security | Plain-language first | Summary first, legal detail one click away |
| Legal pages | Accurate and readable | No product hype, no vague promises |

## 3. Structure Rule

Every core section follows this order:
1. Outcome headline.
2. Mechanism sentence.
3. One concrete proof point.
4. One clear CTA.

## 4. Copy Budget

| Surface | Budget |
|---|---|
| Hero headline | Max 2 lines |
| Hero support copy | Max 2 sentences |
| Section intro | Max 2 sentences |
| Card description | 1 line, optional second detail line |
| CTA | 2-5 words |
| Error message | 1 sentence + 1 next step sentence |

If copy exceeds budget, simplify before adding visuals.

## 5. Terminology Guardrails

Use:
- `review`, `report`, `rewrite`, `evidence`, `fit`, `impact`, `clarity`, `readability`, `hiring team`, `recruiter read`

Avoid:
- `operator-style`, `first-pass filter`, `growth loop`, `funnel`, `unlock velocity`, `AI-powered excellence`, `no-risk`

Word mapping:
- `analysis` -> `review` (user-facing)
- `artifact` -> `report preview`
- `run` (vague) -> `start review` or `review resume`

## 6. Claims and Proof

Rules:
- Each meaningful claim must have one nearby proof or source.
- Do not stack multiple stats in one block.
- No unsourced superlatives.
- No "guaranteed interviews" style promises.

Allowed claim pattern:
- Claim: "Recruiters decide quickly."
- Proof: one cited data point, close to claim.
- Action: "Place your strongest quantified outcome in the top third."

## 7. CTA System

Primary CTA:
- Outcome-led and plain.
- Examples: `Start free review`, `Review my resume`.

Secondary CTA:
- Clarifying action.
- Examples: `See methodology`, `View pricing details`.

Avoid:
- `Try now`, `Unlock now`, `Crush your interview`.

## 8. Free vs Paid Boundary Rule

Every pricing surface must state, in the same viewport:
1. What is free now.
2. What paid adds.
3. How billing control works.

Required sentence pattern:
- "Your first full review is free."
- "Paid plans add repeated role-specific reviews, deeper rewrites, and saved history."

## 9. Error and Recovery Template

Template:
1. What happened: "Could not verify that code."
2. Next step: "Request a new code and try again."
3. Fallback: "Still stuck? Contact support."

Never use:
- Vague copy ("Something went wrong.")
- Blame language.
- Internal system terms.

## 10. Trust Copy Template

Trust blocks must answer:
1. What data is used.
2. Why it is used.
3. How long it is retained.
4. Who controls deletion.
5. How billing is handled.

Required style:
- Plain sentence structure.
- Verbs over nouns.
- No legal hedging in summary text.

## 11. QA Checklist

Before shipping copy:
1. Does each section have one clear headline and one clear CTA?
2. Are there any invented recruiter terms?
3. Is each major claim paired with proof or source?
4. Is free vs paid boundary explicit?
5. Are error states actionable in one read?
6. Is trust copy readable without legal context?
7. Does the page scan cleanly on mobile without long text walls?

Any "no" blocks release.

## 12. Route-Level Copy Intent

| Route | Primary job | Secondary job | Max tone intensity |
|---|---|---|---|
| `/` | Explain value in one pass | Build trust fast | medium |
| `/pricing` | Clarify free vs paid boundary | Reduce purchase anxiety | medium |
| `/research` | Teach and prove | Route users to action | low |
| `/guides` | Give practical scripts | Route to tools/review flow | medium |
| `/faq` | Resolve objections quickly | Link to policy/support | low |
| `/trust` `/security` `/privacy` `/terms` | State operational truth | Provide controls and recourse | low |

Rule:
- If a line sounds better for an ad than a recruiter conversation, cut it.

## 13. Recruiter Lexicon

Preferred terms:
- `screen`, `shortlist`, `hiring loop`, `scope`, `outcomes`, `role fit`, `evidence`, `rewrite`

Avoid in user-facing copy:
- `funnel`, `growth loop`, `velocity unlock`, `first-pass filter`, `operator style`

Replace patterns:
- "optimize your narrative architecture" -> "show clearer impact"
- "unlock interview outcomes" -> "improve your odds of getting interviews"
- "high-leverage intervention" -> "high-impact edit"

## 14. Microcopy Patterns

CTA patterns:
- Primary: verb + outcome (`Start free review`, `Review my resume`)
- Secondary: verb + context (`See methodology`, `View billing controls`)

Error patterns:
- "Could not send code. Try again in 30 seconds."
- "Payment confirmed, but access is still updating. We will keep retrying."
- "Could not load report history. Refresh or open Billing to restore access."

Trust patterns:
- "Reports are saved only when you choose account features."
- "Delete account removes reports and usage history from our app database."
- "Stripe handles payment details. We do not store full card numbers."

## 15. Redline Rules (Ship Blockers)

Reject copy if any of these appear:
1. invented recruiter terminology
2. unsourced performance superlatives
3. conflicting free/paid or retention claims across routes
4. paragraphs >3 sentences on mobile-first sections
5. CTA labels without explicit user outcome
