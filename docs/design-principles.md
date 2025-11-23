# Recruiter in Your Pocket — Design North Star and Principles

## DESIGN NORTH STAR
Confident simplicity. The user sees their score and headline take instantly, then the next actions. Nothing extra.

Every UI and UX decision must increase:
- clarity,
- confident hierarchy,
- insight visibility,
- user momentum.

Exploration mode: prototype only small, reversible treatments (a score block variant, a single accent line placement). Remove anything that adds noise. Document keepers briefly.

Anything that introduces clutter, visual uncertainty, or extra chrome must be removed.

The product aesthetic is editorial and assertively minimal.
- Flat white/black surfaces with a single accent. No gradients, glows, neon, or “AI/gamer” styling.
- Typography: clean modern sans (Space Grotesk, Manrope, Inter, Satoshi). Two weights only (400/500 for body, 600/700 for headings).
- Signature motif: a thin left accent line on stack sections and headings.
- Spacing: moderate rhythm; breathe but do not sprawl.

Design and identity source of truth:
- docs/design-principles.md
- docs/vision.md

### BRAND IDENTITY

Recruiter in Your Pocket is:

> A personal recruiting studio for clarity, confidence, and craft.

The UI should feel like an elite recruiter’s report: sharp, deliberate, and free of ornament. Confidence comes from decisive hierarchy, not softness. The vision document (`docs/vision.md`) defines the product’s identity and core studio experience. All design decisions must stay aligned.

---

## DESIGN PRINCIPLES

### 1. Clarity above everything
Every screen reveals the score/headline and next moves in one second. No competing blocks. No decorative noise.

### 2. Confident hierarchy
Lead with the score pill and one-line summary. Use the left accent line to anchor sections. One column. No margin notes.

### 3. Insight made unmistakable
Scores, summaries, and stronger phrasing are visually prioritized. Nothing else competes.

### 4. Remove everything unnecessary
No extra borders, icons, or labels. Space is the primary separator; use a single accent line when needed.

### 5. Direct, simple language
Short sentences. Strong verbs. No corporate speak. Tone is a trusted recruiter, not a coach or hype voice.

### 6. Motion kept minimal
Only light hover states on controls. No entrance animations, spinners, or flourish.

### 7. Consistency builds trust
Spacing, typography, borders, and the accent line behave predictably across the app.

---

## EXPERIENCE PRINCIPLES

### 1. Deliver insight that feels earned
The “wow” is the accurate read and stronger wording, not visuals. Users feel seen because the content lands fast.

### 2. Build confidence through decisive clarity
The user should leave thinking: “I know how I read and exactly what to fix next.”

### 3. Surprise with value, not visuals
No visual tricks. The value is the signal, rewrites, and next steps.

### 4. Respect the user’s emotional state
Career decisions are stressful. Language stays steady and human. No hype.

### 5. Human, not corporate
Tone is a trusted recruiter: honest, concise, warm enough to land, never fluffy.

### 6. Meet the user where they are
Beginners get clarity. Experts get nuance. Everyone feels understood.

### 7. End every session with uplift
End on a clear next move so users feel momentum.

---

## SIGNATURE PATTERN

The two core studios follow a consistent pattern:

1. **Insight Stack**  
   A single column of clear sections (score, summary, strengths, gaps, rewrites, missing wins, next steps).  
   Each section has one obvious takeaway.

2. **Signature Accent**  
   A thin left accent line anchors section headings or cards. No margin notes.

Current architecture:
- Resume Review (live wedge)  
- Offer Studio (next pillar; planned/disabled in UI)  
- Interview Story Studio (future/backlog only if demand is real)  
- Outreach and other cold email rewrites are not core modes

This pattern must stay reusable as Offer ships and any future mode is proven.

The layout and tone should feel like a crafted report, not a dashboard.

---

## HOW TO APPLY THESE PRINCIPLES
- When adding UI: Does this increase clarity or calm?
- When presenting insight: Is the takeaway unmistakable?
- When writing copy: Can this be said more simply?
- When designing flow: What is the user feeling at this step?
- When choosing between designs: Pick the lowest cognitive load.
- When unsure: remove complexity.

---

## MANDATORY CODING GUIDELINES FOR IMPLEMENTATION
- Use minimal, grid-consistent structure.  
- Headings reinforce hierarchy, not decoration.  
- Line spacing must support readability.  
- Colors must be intentional and limited: white/black base, one accent.  
- Buttons must clearly show primary vs. secondary.  
- Insight containers must always be visually prioritized.  
- All design changes must be checked against the Design North Star.

### COLOR AND MOTION (DELIGHT WITHOUT NOISE)
- One accent only; no gradients, pastels, or multi-accent palettes.  
- Color is for signal, not decoration: score arrival micro-flash (<150ms), accent line intensifying on new insights, one metric/verb in a rewrite, and micro hovers/focus rings.  
- Never use color for backgrounds, blobs, celebrations, or illustrations.  
- Litmus: if removing the color breaks clarity, it was decorative noise—remove it.  
- Motion stays minimal: light hover/click feedback; no loops, confetti, or playful animations.

---

## CHANGE MANAGEMENT
When updating this file, Codex must:
1. Preserve structure.  
2. Preserve intent.  
3. Improve clarity.  
4. Reinforce the North Star.  
5. Add rules only if they increase clarity, calm, insight visibility, or confidence.

END OF DOCUMENT.
