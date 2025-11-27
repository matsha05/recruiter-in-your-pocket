This is the working checklist for turning the app from a good MVP into a premium, studio-grade product. master-roadmap.md stays the high-level source of truth; todo.md is the execution view for builders.

## Phase 1 – Signature Report (Insight Stack)
Goal: A single-column, editorial, premium report page that feels intentional and readable end to end.

Layout & structure
- [ ] Make the Recruiter feedback area a single-column Insight Stack (no inner scroll boxes).
- [ ] Enforce section order: Score + top read → How your resume reads → What’s working → What’s harder to see → Stronger phrasing → Missing Wins → Next steps.
- [ ] Ensure this order and layout work on both desktop and mobile.

Visual signature
- [ ] Add a thin left accent spine that anchors the report sections.
- [ ] Tighten vertical spacing between sections so it reads like an editorial page.
- [ ] Apply a consistent heading style for all stack headings.

Micro-interactions
- [ ] Add subtle hover/focus states to primary buttons (Get feedback, Export PDF, Copy, Missing Wins trigger).
- [ ] Respect prefers-reduced-motion for any transitions.

UX checks
- [ ] Verify that sample resume, paywall, Missing Wins, copy, and export still work exactly as before.
- [ ] Manually test desktop and mobile for reading flow (no “card in a landing page” feeling).

## Phase 2 – Export & Copy (Report Portability)
Goal: Make the report travel well as PDF and structured text.
- [ ] Add print CSS so browser print/PDF output mirrors on-screen report (section order, headings, spacing, accent spine).
- [ ] Ensure the existing Export PDF action uses this styling.
- [ ] Add a “Copy with headings” option that preserves section order and labels.
- [ ] Add a small inline hint near export about sharing with mentors/recruiters.

## Phase 3 – Tiny Design System
Goal: Codify spacing, type, and accent decisions so Codex and Matt stay consistent.
- [ ] Define CSS variables for spacing (e.g., --space-xs/sm/md/lg/xl).
- [ ] Define CSS variables for typography (e.g., --type-body, --type-heading, --type-label).
- [ ] Define CSS variables for accent color and radius.
- [ ] Introduce reusable classes: .stack-section, .stack-heading, .stack-accent-line.
- [ ] Refactor existing report markup to use these classes where appropriate.
- [ ] Confirm focus states and contrast meet accessibility guidance.

## Phase 4 – Hardening (First Slice)
Goal: Make failures predictable and observable without changing product behavior.
- [ ] Review current JSON schema validation for resume feedback responses.
- [ ] Ensure we fail closed on invalid JSON unless USE_MOCK_OPENAI is explicitly set.
- [ ] Add structured error envelopes (code + message) for the frontend.
- [ ] Log OpenAI latency and parse failures with reqId in the backend.
- [ ] Confirm request body size caps are enforced for resume input.

## Parking Lot – Later Phases
- Hero and trust polish.
- Light UX instrumentation (paste, run, copy, export).
- Session history / saved runs.
- Offer Studio and future modes.
