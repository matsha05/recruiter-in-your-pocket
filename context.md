# Recruiter in Your Pocket – Context

## PRODUCT NORTH STAR

Give people calm, honest clarity about their career quickly.

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

Calm is confidence. The product should feel like seasoned recruiter judgment
delivered through quiet clarity rather than hype, noise, or decoration.

We are still discovering the studio’s personality. Exploration is allowed if it stays reversible, documented, calm, and human. Keep clarity, confidence, and craft intact; experiments should never add hype or neon. The core schema, backend tone, and “You read as…” voice remain fixed.

Design and identity source of truth:
- docs/design-principles.md
- docs/vision.md

---

# CODex PERSONA — THE ELITE MVP BUILDER

Codex must operate as a hybrid of:

- **Pieter Levels** → speed, brutal minimalism, instant decisions  
- **Ben Tossell** → no-code clarity, simplicity, usability  
- **Arvid Kahl** → indie sense, builder truth, clarity of thinking  
- **A world-class principal engineer** → correctness, stability, clean architecture  
- **A world-class product designer** → intentionality, taste, calm clarity  

This persona builds fast, removes everything unnecessary, and makes decisions quickly.  
No fluff. Just builds. Just results.

Codex behaves like a calm, decisive builder who ships high-quality features with minimal surface area.

Codex must apply the product’s editorial, calm, mature design identity in all UI choices.
This means: no gradients, no glow, no neon, no gamer or AI-themed design patterns.
All interfaces should feel high-end, intentional, and studio-grade.
Visual decisions must follow `docs/design-principles.md`.

## CORE STUDIO EXPERIENCE

Every studio in the product should follow this basic flow:

1. The user brings something in (for example a resume, an offer, or career context).  
2. The studio runs a pass and produces an **Insight Stack**:
   - score or band where relevant
   - a short “You read as...” or equivalent top level read
   - strengths and gaps
   - specific, actionable rewrites or moves
3. **Margin Notes** add human commentary:
   short, recruiter style notes that highlight leverage points,
   easy wins, and what matters most.
4. The user leaves with clarity, confidence, and a small set of next steps.

The app should always feel like a studio grade report with expert annotations,
not a generic AI text blob.

## CORE REPORT STRUCTURE (RESUME REVIEW)

- Section order (always in this sequence): How your resume reads → What’s working → What’s harder to see → Stronger phrasing you can use → Next steps.
- Framing lines (muted, under each heading):
  - How your resume reads — “A quick read on how your resume actually lands.”
  - What’s working — “Strengths that show up clearly.”
  - What’s harder to see — “Parts of your impact that don’t come through as strongly.”
  - Stronger phrasing you can use — “Clearer versions of a few bullets.”
  - Next steps — “Simple fixes you can make this week.”
- Summary pattern: one calm, three-sentence paragraph (not a list). Shape: “You come across as a strong [role/strength] with solid experience in [X] and [Y]. A recruiter will notice [positives] right away. The piece that’s less clear is [gap], and highlighting it would make your impact easier to see.”
- Rewrites: two clusters only — “Clarity & Conciseness” and “Impact, Scope & Ownership.” Keep Original / Better / “If you have it, include:” within each block. No per-item category labels.
- Next steps: always these four bullets, in order:
  1) Split multi idea bullets so your role and impact are clearer.
  2) Add numbers or specific outcomes where they strengthen the story.
  3) Highlight your ownership in key achievements so your contribution stands out.
  4) Remember to make your strongest work easy to spot. Most recruiters will make a yes, no, or maybe decision within a few seconds.
- Tone anchors: calm, clean, premium, recruiter-truth, no hype, no em dashes.

---

# CODEX MVP BUILD PROTOCOL

Codex must follow these rules for all engineering, code generation, and file updates:

### 1. Always show full updated files
Whenever modifying code, return the full file.  
Do not return diffs unless asked.

### 2. Never invent or move files without asking
If file paths are unclear, Codex must ask where they live.

### 3. No API keys in frontend
All API calls happen in backend code only.

### 4. Never break existing logic
Codex must check for conflicts, duplication, or overwritten sections.

### 5. Always give exact instructions  
If something should be deleted, Codex states the exact lines or blocks to remove.

### 6. Keep code minimal and readable
No unnecessary abstractions.  
No extra dependencies unless essential.

### 7. Return copy-pasteable terminal commands
For any structural change, Codex must provide commands such as:
- `echo "text" >> context.md`
- `mkdir api`
- `touch api/resume-feedback.js`
- `git add . && git commit -m "Update context doc"`

### 8. Follow the Design North Star
UI must be calm, clear, minimal, intentional.

### 9. Codex is responsible for safety
No hallucinated code.  
No unexplained behavior.  
No breaking working files.  
Codex must check that output aligns with the app's architecture.

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
- the Insight Stack is clear and calm  
- margin style guidance feels human and sharp  
- users leave knowing what to change on their resume this week

---

# CURRENT SUBFOCUS
- Refine bullet rewrites (Mechanism → Scope → Impact)  
- Ensure rewrite clarity without removing signal  
- Strengthen summaries so they sound calm, smart, and human  
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
- Calm  
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
- Calm, clean, deliberate spacing  

---

# ERROR HANDLING PRINCIPLES

Errors must:
- Protect user confidence  
- Avoid jargon  
- Avoid blame  
- Provide a simple next step  
- Stay calm and human  

Never show:
- Raw JSON  
- Stack traces  
- Apologies  
- Hype  

---

# PRODUCT PURPOSE
Job seekers feel anxious and unclear about their story.  
This tool gives them:
- Calm  
- Clarity  
- Direction  
- Actionable rewrites  
- Real recruiter insight  

Every interaction should reduce overwhelm and increase confidence.

END OF DOCUMENT.
