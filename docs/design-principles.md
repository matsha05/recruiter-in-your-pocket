# Recruiter in Your Pocket — Design North Star and Principles

## DESIGN NORTH STAR
Clear, calming design that makes meaningful insight unmistakable and uplifting.

Every UI and UX decision must increase:
- clarity,
- calm,
- insight visibility,
- user confidence.

Exploration mode: we can prototype small, contained experiments (a score block treatment, a single card motif, a subtle accent) as long as they stay calm, human, and reversible. No hype, no neon. If an experiment adds noise, remove it. Document experiments briefly so we can keep what earns its place.

Anything that introduces noise, uncertainty, or visual clutter must be removed.

The product aesthetic is editorial, mature, and calm. 
Use flat color surfaces, minimal accents, subtle strokes, and generous spacing.
Avoid all gradients, neon accents, outer glows, and gamer or AI-themed styling.
The visual style should feel like a refined design studio, not a dashboard.
- Typography must feel intentional, premium, and editorial.
- Use a refined sans-serif family suitable for calm, high-end interfaces.
- Examples include Space Grotesk, Inter, Manrope, Satoshi — but the system may
recommend alternatives as long as they match the aesthetic and design principles.
- Calm ≠ bland. A single warm accent and one subtle signature motif (a thin underline, a faint vertical bar, a soft texture) are allowed if they increase hierarchy and stay quiet.

Design and identity source of truth:
- docs/design-principles.md
- docs/vision.md

### BRAND IDENTITY

Recruiter in Your Pocket is:

> A personal recruiting studio for clarity, confidence, and craft.

The UI should feel like a studio grade report created by an elite recruiter:
calm, intentional, and confident.

Calm in this product does not mean passive or bland.
Calm means confident.
The interface should feel like a world class recruiter who knows exactly what matters,
has nothing to prove, and offers clarity without noise.
This is expertise expressed as stillness.
The vision document (`docs/vision.md`) defines the product’s identity, signature interaction pattern, and core studio experience. All design decisions must remain aligned with it.

---

## DESIGN PRINCIPLES

### 1. Clarity above everything
Every screen should reveal what matters in one second.  
No clutter. No competing blocks. No decorative noise.

### 2. Calm by design
Use space, rhythm, hierarchy, and intentional gaps to lower cognitive load.  
The interface should feel unhurried and breathable.

### 3. Insight made unmistakable
Scores, summaries, and rewritten bullets must stand out instantly.  
Nothing should compete with the main takeaway.

### 4. Remove everything unnecessary
Borders, labels, icons, colors, lines, or steps are removed unless they directly help understanding.

### 5. Direct, simple language
Short sentences. Strong verbs. No filler. No corporate speak.

### 6. Motion as guidance
Only use animation to guide the eye or clarify state changes.  
Never use ornamental motion or distracting transitions.

### 7. Consistency builds trust
Spacing, typography, borders, shadows, and patterns must behave predictably across the entire app.

---

## EXPERIENCE PRINCIPLES

### 1. Deliver insight that feels delightful to receive
The product should create a “holy wow…this really sees me” moment.  
Delight comes from clarity, accuracy, and resonance.

### 2. Build confidence through clarity
The user should leave thinking:  
“I know what to do next, and I know I can do it.”

### 3. Surprise with value, not noise
The wow is the insight itself — not visual tricks or crowded screens.

### 4. Respect the user’s emotional state
Career decisions are stressful.  
Language must be calm, supportive, and grounded.

### 5. Human, not corporate
Tone should feel like a world-class recruiter giving honest, useful guidance.  
Warm, confident, concise.

### 6. Meet the user where they are
Beginners get clarity.  
Experts get nuance.  
Everyone feels understood.

### 7. End every session with uplift
The final emotional note should be positive:  
“I’m better off than I was a minute ago.”

---

## SIGNATURE PATTERN

All modes in the product should follow a consistent studio pattern:

1. **Insight Stack**  
   A vertical stack of clear sections (score, summary, strengths, gaps, rewrites, missing wins, etc.).  
   Each section is a calm card with one obvious takeaway.

2. **Margin Notes**  
   Short, human notes that sit beside or near key sections.  
   They read like a recruiter’s annotations in the margin and provide
   context, emphasis, or “this is what really matters” guidance.

This pattern must be reusable across future modes:
- Resume Studio  
- Offer Studio  
- Interview Studio  
- and other career modes

The layout, spacing, and tone should always feel like a studio report, not a generic dashboard.

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
- Colors must be intentional and limited.  
- Buttons must clearly show primary vs. secondary.  
- Insight containers must always be visually prioritized.  
- All design changes must be checked against the Design North Star.

---

## CHANGE MANAGEMENT
When updating this file, Codex must:
1. Preserve structure.  
2. Preserve intent.  
3. Improve clarity.  
4. Reinforce the North Star.  
5. Add rules only if they increase clarity, calm, insight visibility, or confidence.

END OF DOCUMENT.
