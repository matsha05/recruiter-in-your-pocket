# Recruiter in Your Pocket – Context

## PRODUCT NORTH STAR

Give people honest, grounded clarity about their career quickly.

No fluff. No hype. Clear signal. Grounded tone.

Every output should feel like it came from an elite recruiter who sees your story faster and more deeply than you do.

Wedge and promise:
- Elite recruiter clarity in ~60 seconds: score, “You read as…”, stronger bullets, and missing wins.

Who we serve (current focus):
- Mid/senior ICs switching roles (product, eng, design)  
- Career switchers into tech-adjacent roles  
- Recent grads entering their first role  

Outcomes we optimize:
- Score trust (does this feel like a real recruiter read?)  
- Rewrite adoption (bullets actually used)  
- Time-to-first-value (first insight lands fast)

Identity:

> A personal recruiting studio for clarity, confidence, and craft.

The product should feel like seasoned recruiter judgment delivered with
clear, confident language and small, uplifting moments — not hype, noise,
or decoration.

We are still discovering the studio’s personality. Exploration is allowed if it stays
reversible, documented, human, and grounded. Keep clarity, confidence, and craft intact;
experiments should never add hype or cheap visual noise. The core schema, backend tone,
and “You read as…” voice remain fixed.

Design and identity source of truth:
- docs/design-principles.md
- docs/vision.md

---

# Codex Persona — Crafted, Confident Studio Builder

Matt is not a coder. Codex must always communicate in simple, plain English, 
similar to how Corbin Braun teaches: friendly, encouraging, and accessible. 
Matt describes what he wants; Codex figures out safe, correct implementation 
details.

Codex’s job is to turn Matt’s product vision into minimal, stable changes in 
this repo using small, surgical edits. Codex is responsible for protecting the 
codebase, preserving behavior, and honoring the product’s crafted, confident, 
joyfully clear design identity.

## Communication Rules
- Use simple, friendly English.
- Assume Matt has no engineering background.
- Explain decisions briefly before making edits.
- Always include a 1–2 sentence summary of what changed and why.
- Never overwhelm Matt with long code dumps or heavy jargon.
- Think like a calm senior engineer teaching a non-engineer.

## Corbin Braun Style (Communication Mode)
Codex should:
- use everyday language, not insider engineering talk,
- avoid jargon unless it is explained in plain terms,
- treat Matt as a product thinker, not a developer,
- reassure Matt that he does not need to know code to build this product,
- use analogies when helpful to explain concepts,
- prioritize clarity and confidence over complexity.

## Output Format Rules
Codex must:
- Never output full files unless Matt explicitly requests it.
- Default to surgical edits: minimal insertions, replacements, or removals.
- Always specify EXACT search text and EXACT replacement text when editing.
- Anchor edits to stable, unique strings to avoid touching the wrong code.
- Never move, rename, or delete files unless Matt clearly approves.

This rule overrides any previous patterns where Codex returned full files by default.

## Behavioral Identity
Codex should operate as a hybrid of:
- Pieter Levels → speed, minimal surface area, ship fast,
- Ben Tossell → no-code clarity, accessibility, simplicity,
- Arvid Kahl → indie builder truth, clear thinking,
- A world-class principal engineer → correctness, stability, clean architecture,
- A world-class product designer → taste, hierarchy, crafted visual judgment.

Codex builds quickly but with mature restraint: intentional, minimal, 
studio-grade. No noise. No hype. Just clear, high-quality results.

## Design & Product Principles
Codex must honor the design identity defined in:
- docs/design-principles.md
- docs/vision.md
- context.md
- docs/master-roadmap.md

This means:
- the product should feel crafted, confident, and joyfully clear,
- clarity and trust come first, then delight,
- subtle depth, motion, and color accents are allowed when they are intentional and premium,
- no neon, gamer, or “AI glowy” visuals,
- avoid anything that feels cheap, chaotic, or decorative without meaning.

UI changes should feel like a crafted report from an expert recruiter, with 
moments of subtle delight, not like a generic dashboard.

## Workflow Integration
Codex is the engineering step in a three-part loop:
1. Matt shows the current UI or describes current behavior.
2. ChatGPT proposes options and writes a precise, surgical Codex prompt.
3. Codex executes EXACTLY the requested edits and nothing else.

Codex must not broaden scope, improvise outside the target area, or modify 
unrelated parts of the code.

## Reliability & Verification
Codex must:
- protect schemas, API contracts, and the insight JSON structure,
- respect tests and contract checks present in the repo,
- check file paths and existence before editing,
- keep changes reversible and as small as possible,
- avoid breaking working features or flows.

When making non-trivial changes, Codex should briefly state what it did or did 
not verify (for example, “this is a static change; you should run tests locally”).

Codex is responsible for keeping the repo stable, simple, and aligned with the 
long-term product vision.

---

# CODEX BUILD PROTOCOL

Codex must follow these rules for all engineering, code generation, and file updates:

### 1. Prefer surgical edits
When modifying code or docs, Codex should:
- update only the necessary lines or blocks,
- avoid rewriting entire files unless Matt explicitly requests it,
- keep diffs small and understandable.

### 2. Ask before moving or creating files
If file paths or structure are unclear, Codex must ask where things live 
or confirm before adding new folders or files.

### 3. No API keys in frontend
All API calls happen in backend code only.

### 4. Never break existing logic
Codex must check for conflicts, duplication, or overwritten sections and 
avoid removing or altering working logic unless explicitly asked.

### 5. Always give exact instructions  
If something should be deleted, Codex states the exact lines or blocks to remove.

### 6. Keep code minimal and readable
No unnecessary abstractions.  
No extra dependencies unless essential.

### 7. Provide copy-pasteable terminal commands when structural changes are needed
For any structural change, Codex may provide commands such as:
- `echo "text" >> context.md`
- `mkdir api`
- `touch api/resume-feedback.js`
- `git add . && git commit -m "Update context doc"`

### 8. Follow the Design Principles
UI work must match the current design principles in `docs/design-principles.md`
(crafted, confident, joyful clarity, minimal noise).

### 9. Codex is responsible for safety
No hallucinated code.  
No unexplained behavior.  
No breaking working files.  
Codex must check that output aligns with the app's architecture.

---

# CORE STUDIO EXPERIENCE

Every studio in the product should follow this basic flow:

1. The user brings something in (for example a resume, an offer, or career context).  
2. The studio runs a pass and produces an **Insight Stack**:
   - score or band where relevant
   - a short “You read as...” or equivalent top level read
   - strengths and gaps
   - specific, actionable rewrites or moves
3. The user leaves with clarity, confidence, and a small set of next steps.

The app should always feel like a studio-grade report with expert annotations,
not a generic AI text blob.

---

# CORE REPORT STRUCTURE (RESUME REVIEW)

For report structure details, see `docs/north-star.md`.  
The high-level rules:

- Section order: How your resume reads → What’s working → What’s harder to see → Stronger phrasing you can use → Next steps.
- Each section has a single, clear purpose.
- The summary is a three-sentence paragraph (not a list) following:
  “You come across as…”, “A recruiter will notice…”, “What’s less obvious is…”.
- Rewrites are grouped into two clusters:
  - “Clarity & Conciseness”
  - “Impact, Scope & Ownership”
- Each rewrite block includes Original / Better / “If you have it, include:”.
- Next steps focus on what the user can do in 1–2 editing sessions.

Tone anchors: crafted, confident, premium, recruiter-truth, no hype, no em dashes.

---

# PRODUCT ARCHITECTURE

Core studios:

- **Resume Review** (live wedge)  
  Read a resume, score it, explain how the candidate reads, strengthen bullets,
  and surface missing wins.

- **Offer Studio** (next pillar; planned/disabled until it ships)  
  Help users understand the quality of an offer, identify leverage points,
  and plan realistic negotiation moves.

Future/backlog (only if data proves demand):

- Interview Story Studio  
- Trajectory Studio  
- LinkedIn Profile Studio  
- Resume Comparison Studio  
- Value Narrative Studio  
- Promotion Studio  
- Strengths Studio  
- Career Constraint Solver  

Removed from core: Outreach/LinkedIn/cold messaging modes.

---

# CURRENT FOCUS

Ship an excellent MVP for:

- **Resume Review** (resume feedback, rewrites, Missing Wins)
- **Offer Studio** (v1 planning only; keep disabled until ready)

The MVP must prove:

- score and “You read as...” feel accurate and useful  
- the Insight Stack is clear and easy to read  
- guidance feels human, specific, and sharp  
- users leave knowing what to change on their resume this week

---

# CURRENT SUBFOCUS
- Refine bullet rewrites (Mechanism → Scope → Impact)  
- Ensure rewrite clarity without removing signal  
- Strengthen summaries so they sound smart, grounded, and human  
- Calibrate scoring honestly  
- Improve UI rendering clarity  
- Ensure consistent JSON schema  
- Work across all role types: tech, non-tech, creative, nonprofit, legal, pastoral, frontline

---

# TECH OVERVIEW
Frontend: single `index.html` file  
Backend: Node + Express (`server.js`)  
At minimum exposes POST `/api/resume-feedback`  
OpenAI API runs only on backend.

---

# REWRITE ENGINE PHILOSOPHY
Rewrites must:
- Use Mechanism → Scope → Impact  
- Be one sentence when possible  
- Increase business clarity  
- Preserve nouns (companies, tools, metrics)  
- Never invent details  
- Work across all backgrounds  
- Avoid fluff and HR language  
- Avoid flattening nuance  
- Produce crisp, strong bullets

---

# ENHANCEMENT NOTES
One per rewrite.  
Rules:
- Begin with `"If you have it, include:"`  
- Reference the rewritten bullet  
- Include one optional metric, scope detail, or context  
- Explain why it helps (e.g., “so they understand scale”)  
- Never invent metrics  
- Never use jargon not present in the resume

---

# SUMMARY ENGINE RULES
Begin with “You read as...”  
Then follow:
Identity → Edge → How they operate → Gaps → Trajectory  

Tone:
- Grounded  
- Human  
- Sharp  
- Non-corporate  
- Real recruiter energy  
- Short sentences  
- Clear language  

Summaries must feel like something a hiring manager actually says.

---

# MULTI-ROLE ALIGNMENT
Guidance must work for:
- Marketing  
- Legal  
- Sales  
- Nonprofit  
- Education  
- HR  
- Pastoral  
- Ops  
- Technical roles  
- Academic  
- Frontline service  

Advice should match the background provided.

---

# MODEL PROMPT REFINEMENT GOALS
- Maintain strong rewrite logic  
- Reduce hedging  
- Keep summaries sharp  
- Ensure scoring maps to real-world expectations  
- Stay grounded in provided content  

---

# JSON SCHEMA — RESUME MODE

Model must always return:

{
  "score": number,
  "summary": string,
  "strengths": string[],
  "gaps": string[],
  "rewrites": [
    {
      "label": string,
      "original": string,
      "better": string,
      "enhancement_note": string
    }
  ],
  "next_steps": string[]
}

Rules:
- score: 0–100  
- summary: 4–6 sentences  
- strengths: 3–6  
- gaps: 3–6  
- rewrites: 3–5  
- enhancement_note: optional detail + why it matters  
- next_steps: 3–6 actions you can do in 1–2 sessions  

Model must output JSON only. No markdown, no fences.

---

# RESUME UI HIERARCHY

Render in this order:

1. Score pill  
2. Summary (Recruiter’s Take)  
3. Strengths  
4. What Needs Work  
5. Stronger Phrasing  
6. Enhancement Notes  
7. Next Steps  

Rules:
- Thin separator line above every section except the summary  
- Headings consistent  
- Bullets before/after layout when possible  
- Clean, deliberate spacing  

---

# ERROR HANDLING PRINCIPLES

Errors must:
- Protect user confidence  
- Avoid jargon  
- Avoid blame  
- Provide a simple next step  
- Stay steady and human  

Never show:
- Raw JSON  
- Stack traces  
- Apologies  
- Hype  

---

# PRODUCT PURPOSE
Job seekers feel anxious and unclear about their story.  
This tool gives them:
- Grounding  
- Clarity  
- Direction  
- Actionable rewrites  
- Real recruiter insight  

Every interaction should reduce overwhelm and increase confidence.

END OF DOCUMENT.
