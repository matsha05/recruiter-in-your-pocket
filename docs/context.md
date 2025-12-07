# Recruiter in Your Pocket – Context

**Last Updated:** December 2025

## PRODUCT NORTH STAR

Give people honest, grounded clarity about their career quickly.

No fluff. No hype. Clear signal. Grounded tone.

Every output should feel like it came from an elite recruiter who sees your story faster and more deeply than you do.

---

## IDENTITY

> A personal recruiting studio for clarity, confidence, and craft.

The product should feel like seasoned recruiter judgment delivered with clear, confident language and small, uplifting moments—not hype, noise, or decoration.

**Core promise:** Elite recruiter clarity in ~60 seconds: score, "You read as…", stronger bullets, and missing wins.

**Differentiation:** Recruiter lens over ATS fear. We don't scare people about "beating the bots." We help them understand how they actually read to a hiring human.

---

## WHO WE SERVE

- Mid/senior ICs switching roles (product, eng, design)
- Career switchers into tech-adjacent roles
- Recent grads entering their first role
- Anyone who wants honest, specific feedback on their resume

The product works across all backgrounds: tech, non-tech, creative, nonprofit, legal, pastoral, frontline.

---

## OUTCOMES WE OPTIMIZE

- **Score trust:** Does this feel like a real recruiter read?
- **Rewrite adoption:** Bullets actually used
- **Time-to-first-value:** First insight lands fast
- **Confidence lift:** User leaves feeling better, not worse

---

## CURRENT STATE (December 2025)

### What's Live
- Resume Studio (full Insight Stack)
- PDF export
- Free run limits (2 reports, cookie-based)
- Email + code authentication
- Sessions and passes stored in Postgres

### What's Wired But Not Connected
- Stripe payments (checkout flow exists, needs real API keys)

### What's Missing (Launch Blockers)
1. **Working Stripe payments** — connect real API keys, test checkout
2. **Report history** — store analyses, show past runs to logged-in users
3. **Cohesive logged-in experience** — tie free runs to user, not browser cookie

---

## CURRENT FOCUS

**Phase: Pre-Launch Polish**

Priority order:
1. Finish Stripe integration
2. Build report history (store + display)
3. Create cohesive logged-in experience
4. One pass through landing page clarity
5. Soft launch to 20-30 real users

---

## PRODUCT ARCHITECTURE

### Core Studios

**Resume Studio (live)**
Read a resume, score it, explain how the candidate reads, strengthen bullets, and surface missing wins.

**Offer Studio (planned, parked until after launch)**
Help users understand the quality of an offer, identify leverage points, and plan realistic negotiation moves.

### Future/Backlog (only if data proves demand)
- LinkedIn Profile Studio
- Interview Story Studio
- Trajectory Studio
- JD Matching (resume vs specific job description)
- Job Tracker

---

## CORE REPORT STRUCTURE

Section order:
1. Score + top-level read
2. How your resume reads (summary)
3. What's working (strengths)
4. What's harder to see (gaps)
5. Stronger phrasing you can use (rewrites)
6. Missing Wins (ideas)
7. Next Steps

Each section has a single, clear purpose. The summary is a three-sentence paragraph: "You come across as…", "A recruiter will notice…", "What's less obvious is…"

Tone anchors: crafted, confident, premium, recruiter-truth, no hype.

---

## REWRITE ENGINE PHILOSOPHY

Rewrites must:
- Use Mechanism → Scope → Impact
- Be one sentence when possible
- Increase business clarity
- Preserve nouns (companies, tools, metrics)
- Never invent details
- Work across all backgrounds
- Avoid fluff and HR language
- Produce crisp, strong bullets

Enhancement notes begin with "If you have it, include:" and reference the rewritten bullet with one optional metric or context.

---

## ACCESS MODEL

### Free Tier (always free)
- 2 free full reports per browser (grace buffer)
- Unlimited Clarity Scores after free runs used

### Paid Tiers
- **24-Hour Fix Pass:** Unlimited full reports for 24 hours
- **30-Day Campaign Pass:** Unlimited full reports for 30 days

Passes are email-bound, cross-device. Pass timer starts after first post-purchase analysis, not at checkout.

---

## DESIGN SOURCE OF TRUTH

- `docs/design-principles.md`
- `docs/vision.md`

Identity traits: crafted, confident, joyfully clear.

---

## CODEX PERSONA

Matt is not a coder. Codex must always communicate in simple, plain English. Matt describes what he wants; Codex figures out safe, correct implementation details.

Codex's job: turn product vision into minimal, stable changes using small, surgical edits. Protect the codebase, preserve behavior, honor the design identity.

Communication rules:
- Use simple, friendly English
- Assume no engineering background
- Explain decisions briefly before making edits
- Never overwhelm with code dumps or jargon

---

## ERROR HANDLING

Errors must:
- Protect user confidence
- Avoid jargon
- Avoid blame
- Provide a simple next step
- Stay steady and human

Never show raw JSON, stack traces, apologies, or hype.

---

## PRODUCT PURPOSE

Job seekers feel anxious and unclear about their story. This tool gives them:
- Grounding
- Clarity
- Direction
- Actionable rewrites
- Real recruiter insight

Every interaction should reduce overwhelm and increase confidence.
