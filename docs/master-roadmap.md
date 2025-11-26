# Recruiter in Your Pocket – Master Roadmap

Last updated: 2025-11-23  
Owner: Matt

This doc is the single source of truth for what it means to move from MVP to a real, trustworthy product that people pay for and keep using.

North star:

- Give people crafted, honest clarity about their career quickly.
- Feel like an elite recruiter studio, not an AI toy.
- Every session should create at least one "ok wow, that truly helped" moment.

The items below are ordered by impact on trust, revenue, and real world usefulness.

---

## Tier 0 – Trust, onboarding, and clarity (Done)

These are the blockers that keep strangers from pasting their resume. Fixing these comes before everything else.

### T0.1 Data handling and trust surface (Done)

- Add a visible "How we handle your data" section or popover.
- Explain what happens before and after "Get feedback":
  - Text is stored locally in the browser until you click.
  - On click it is sent to our backend, processed, and not stored long term.
  - No use for training or sharing.
- Link to a simple Privacy and Terms page, even if they are minimal at first.
- Rewrite or remove anonymous testimonials that feel fake. Use real ones or keep it clean.
- Hide Offer Studio in the UI until it is genuinely ready.

### T0.2 First time experience and sample resume (Done)

- Add a "Try a sample resume" button that fills the textarea with an anonymized example.
- Make it clear what the product does in one short line under the hero:
  - Example: "Paste your resume and get a recruiter grade read in under a minute."
- Make the main CTA path obvious:
  - Paste or use sample.
  - Click "Get feedback".
  - See score, summary, strengths, gaps, rewrites, and next steps.

### T0.3 Score meaning and output framing (Done)

- Add a short explanation of what the score means.
- Connect the score and tooltip to clear bands, not vibes.
- Make it obvious that the goal is clarity and signal, not judgment.

---

## Tier 1 – Revenue foundations

These items move the product from "interesting MVP" to "real product people pay for".

### T1.1 Paid wedge (monetization) (Done)

Goal: First user can pay and get immediate value from paying.

- Meter free runs, for example 1 to 2 free runs per browser.
- After the free limit, show a focused paywall:
  - What they get if they upgrade (unlimited runs, saved reports, better export).
  - Simple pricing.
  - Clear, calm copy.
- Integrate Stripe Checkout and capture email.
- Tie entitlements to:
  - Unlimited runs.
  - Saved reports or session history.
- Make the entire flow feel simple, honest, and safe.

Definition of done: A real user can paste a resume, run 1 or 2 times, hit a paywall, pay, and then keep using the product with clear benefits.

### T1.2 Scoring calibration you can defend (Done)

Goal: A score that another recruiter would agree with.

- Define a rubric for 70, 85, 95 and similar bands.
- Build a calibration set of 20 to 30 resumes across roles:
  - Tech, non tech, nonprofit, education, sales, legal, pastoral, frontline.
- Store expected bands for each test resume.
- Run batch tests and tune prompts until:
  - 70 vs 85 vs 95 feels consistent and honest.
- Update score tooltip and copy so it matches the rubric.
- Document in plain English what each band means for users.

### T1.3 Rewrites that feel elite across backgrounds

Goal: Rewrites that consistently feel better than what users can write alone.

- Expand test resumes to include:
  - Teacher, pastor, lawyer, marketer, sales, nonprofit, engineering, design, new grads.
- Enforce the Mechanism → Scope → Impact pattern in rewrites.
- Keep the two main clusters only:
  - Clarity and Conciseness.
  - Impact, Scope, and Ownership.
- Add tests that assert:
  - Number of rewrites.
  - Shape and structure of the JSON.
  - No hallucinated facts.
- Ensure enhancement notes follow the "If you have it, include..." pattern and never invent data.

---

## Tier 2 – Reliability and observability

Reliability and insight into failures are required once you charge money.

### T2.1 Reliability hardening

- Enforce JSON schema end to end for model responses.
- Tighten timeout and retry behavior for OpenAI.
- Remove silent fallbacks where possible:
  - Only use mocks when the model output is clearly unusable.
- Make error messages calm and human:
  - Explain what happened in simple language.
  - Suggest next steps.
- Log all critical errors with:
  - Request ID.
  - Error code.
  - Relevant metadata.

### T2.2 Funnel instrumentation

- Track the funnel:
  - Paste.
  - Run.
  - Copy or export.
  - Paywall view.
  - Payment.
- Track operational metrics:
  - OpenAI latency.
  - Error rate.
  - Parse failures.
- Use simple analytics first. Clarity beats complexity.

### T2.3 Missing Wins productionization

- For the "Missing wins" flow:
  - Prefer the live OpenAI ideas response.
  - Fall back to a generic set only on parse or shape failures.
  - Cap to 3 sharp, tailored questions per run.
- Align the "Missing wins" copy to the rest of the product:
  - Clear hierarchy.
  - Very simple instructions on how to turn answers into bullets.
- Add tests for the ideas JSON schema.

---

## Tier 3 – UI alignment and experience

The UI should feel like a studio grade report, not a landing page.

### T3.1 Align visuals to the design north star

- Remove heavy gradients and glow where they compete with content.
- Keep a single premium accent and the left accent line as the visual signature.
- Enforce a single column Insight Stack in the results:
  - Score.
  - Summary ("How your resume reads").
  - Strengths.
  - Gaps.
  - Stronger phrasing.
  - Enhancement notes.
  - Next steps.
- Tighten spacing and dividers so sections scan clearly.
- Improve readability of strengths and gaps lists:
  - Each item should name a concrete signal like scope, decision, or outcome, not vague praise.

### T3.2 Export and share polish

- Add proper print and PDF styling that mirrors the on screen report.
- Implement "Copy with headings" so users can paste into docs, email, or Notion with structure intact.
- Make sure exported content keeps:
  - Section order.
  - Section labels.
  - Bullet hierarchy.

### T3.3 Session history and saved runs

- Store local session history with timestamps and mode.
- Let users reopen previous runs without reprocessing:
  - Especially helpful once paid.
- Consider a simple "star" or "mark as best pass" option so users can keep their strongest run.

---

## Tier 4 – Future modes and platform

These are important, but only after resume review feels rock solid and monetized.

### T4.1 Offer Studio staging

- Keep Offer Studio hidden or clearly disabled in the UI until it is ready.
- In the backend and prompts:
  - Define the Offer Studio JSON schema.
  - Write and refine the prompt.
  - Add contract tests.
- Gate Offer Studio behind a feature flag for controlled pilots.

### T4.2 CI and release readiness

- Add regression tests for:
  - JSON schema contracts.
  - Validation of endpoints with mock OpenAI.
  - Basic frontend rendering.
- Set up a simple staging to production deploy path.
- Keep the deploy process small and predictable.

---

## Execution notes

- Always ship in thin slices that improve a real user moment.
- When in doubt, choose the change that increases trust, clarity, or honesty.
- If a task does not help users feel clearer, more grounded, or more confident, cut or delay it.
