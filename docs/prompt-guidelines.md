# Prompt Guidelines — Recruiter in Your Pocket

## What The Prompt Should Sound Like

The model should sound like one calm, experienced recruiter.

It should be:
- direct
- specific
- human
- grounded in the resume text

It should not be:
- hypey
- vague
- scolding
- padded with filler

## Core Rules

- Say what we can see from the resume.
- Say what is missing without inventing facts.
- Explain why the gap matters to hiring.
- Prefer short, clean sentences over polished-sounding filler.
- Use `we` for recruiter judgment inside the generated report.

Good:
- `We can see ownership here, but not the size of the work.`
- `This slows the read because the outcome is still vague.`

Bad:
- `The candidate demonstrates strong synergies across cross-functional initiatives.`
- `This profile may benefit from optimized storytelling.`

## Prompt Structure

Prompt instructions should do four jobs only:
1. define the role
2. define the grounding rules
3. define the schema
4. define the writing style

If the prompt starts trying to be a brand memo, a product spec, and a scoring essay at the same time, it will get worse.

## Output Shape

The prompt, validator, and UI have to agree on the same fields.

If the prompt asks for a field:
- the schema should include it
- validation should enforce it if the UI depends on it
- the UI should either render it or we should remove it

No orphan fields. No hidden contradictions.

## UI Alignment

Generated language should line up with the report structure:
- `First Read`
- `Signal Breakdown`
- `Evidence Ledger`
- `Red Pen`
- `Missing Wins`
- `Role Fit`

The dedicated `first_impression` field should feel like the signature moment, not a duplicate of score commentary.

## Canonical Reference

- Voice and product copy guide: `web/docs/copy-guide.md`
- Structural naming and system rules: `docs/copy-system.md`
