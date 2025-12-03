# Recruiter in Your Pocket – Master Roadmap

Last updated: 2025-11-26  
Owner: Matt  
Source of truth for how this product becomes premium, delightful, and studio-grade — not an AI toy.

North star:

- Give people crafted, honest clarity about their career quickly.  
- Feel like an elite recruiter studio — a premium crafted instrument.  
- Every session should produce one “holy shit, that actually helped” moment.  
- Look and feel like something built by someone with taste.

The roadmap below lists work in the order that most increases trust, delight, and product legitimacy.

---

## Tier 0 – Foundations (Done)

Goal: Make strangers comfortable pasting a resume and running the tool.

### T0.1 Data handling (Done)

Visible, honest, simple data-handling explanation.

### T0.2 First-time path clarity (Done)

“Try a sample resume”, clear hero, and obvious CTA flow.

### T0.3 Score framing (Done)

Score tooltip, meaning, and tone aligned to rubric.

---

## Tier 1 – Signature Report (THIS IS NOW THE HEART OF EVERYTHING)

Goal: Create a single, premium, crafted report view that feels intentional, crafted, and non-boring — the moment people remember.

### T1.1 Single-column Insight Stack

Full-screen report after running feedback.  
Strict section order (per vision docs):

- Score + top-level read
- How your resume reads
- What’s working
- What’s harder to see
- Stronger phrasing you can use
- Missing Wins
- Next Steps

No scroll boxes. The page scrolls with magazine-like flow.  
Desktop + mobile behave identically in structure.

### T1.2 Signature accent & rhythm

Left accent spine (thin line) across entire report.  
Clear vertical spacing rhythm (design tokens).  
Premium type scale: modern, crafted, confident — not generic SaaS.

### T1.3 Micro-interactions (delight without noise)

Subtle hover/focus states.  
Soft transitions for interactive elements (reduced-motion safe).  
Interactive affordances (cursor, feedback on hover, etc.).  
No neon, no AI-glow, no dashboard patterns.

### T1.4 Not boring

Keep it sharp and crafted — more Apple crafted than calm newspaper.  
One accent color used with intention.  
Use spacing, typography, and structure to delight, not noise.

Definition of Done:  
A user pastes a resume, clicks “Get feedback,” and the resulting screen looks like a premium studio report — confident, distinctive, and impossible to confuse with a template.

---

## Tier 2 – Portability & Shareability (Make the report travel)

Goal: Give users artifacts they want to share with mentors, interviewers, and colleagues.

### T2.1 Print & PDF parity

PDF/print layout identical to the on-screen report.  
Section labels, spacing rhythm, accent line, bullets — all preserved.

### T2.2 Copy with headings

Structured copy-out that retains Insight Stack order.

### T2.3 Gentle sharing cues

One small line near export:  
“Tip: Export this as a PDF when sharing with a mentor or recruiter.”

Definition of Done:  
Users can send the report, and the artifact sells the product for you.

---

## Tier 3 – Tiny Design System (Just enough to enforce taste)

Goal: Protect the product’s visual identity from entropy and ensure Codex stays consistent.

### T3.1 Design tokens

- --space-* spacing scale  
- --type-* typography scale  
- --accent  
- --radius  
- print tokens (--type-print-*)

### T3.2 Structural classes

- .stack-section  
- .stack-heading  
- .stack-accent-line

### T3.3 Accessibility baked in

Consistent focus states.  
Contrast checked once then codified.  
prefers-reduced-motion supported globally.

Definition of Done:  
The UI stays consistent over time, and Codex can safely build new components without drifting into “template” energy.

---

## Tier 4 – Hardening & Observability (Invisible but essential)

Goal: Behave like real software now that the product looks premium.

### T4.1 Robust backend behavior

JSON schema fail-closed (no silent fallbacks unless USE_MOCK_OPENAI).  
Structured error envelopes.  
Request body size caps.  
OpenAI timeout + retry tuning.  
No ghost errors.

### T4.2 Logging & metrics

Log:  
- reqId  
- latency  
- parse failures  
- model error codes  

Minimal counters for key operational metrics.

### T4.3 Prompt versioning

Simple folder structure for prompt history.

Definition of Done:  
If something goes wrong, you know exactly what and why.

---

## Tier 5 – Hero & Trust Surface Polish

Goal: The hero should support the experience, not distract or feel like a template.

### T5.1 Hero cleanup

Tightened spacing + type.  
Keep atmosphere gradients (0.08–0.12 opacity) that support premium feel. Remove noise (effects that compete with content).

### T5.2 Primary path dominance

Make the path “paste → run” absolutely obvious.

### T5.3 Trust cues

Data-handling visible and credible.  
Optionally: “How scoring works” microline or tooltip.

Definition of Done:  
A first-time visitor understands what it does, why it’s trustworthy, and how to start — without feeling marketed to.

---

## Tier 6 – UX Instrumentation (Lightweight, after layout stabilizes)

Goal: Understand how real users move through the core flows.

### T6.1 Key moment tracking

- resume_pasted  
- run_clicked  
- copy_clicked  
- export_clicked

### T6.2 Optionally track

- Missing Wins opens  
- Paywall impressions (if/when reintroduced)

Minimal JS; no SDKs.

---

## Tier 7 – Paid Product, Saved Reports, Platform Work

Goal: Only after the core is premium and delightful.

### T7.1 Entitlements, paywall hardening

Server-side validation.  
Stripe webhook integration.  
Unlimited runs enforcement.  
Saved-run retrieval.

### T7.2 Session history

Local saved runs with timestamps.  
“Reopen strongest pass”.

### T7.3 Offer Studio / Interview Studio / Future Modes

Behind flags until ready.  
Align with the Insight Stack pattern.

---

## Execution Philosophy

Ship in thin slices that improve the core experience  
Taste > features  
Craft > noise  
Clarity > cleverness  
Real user value > roadmap checkboxes

Every change must move the user closer to:  
“I understand my story and know exactly what to do next.”
