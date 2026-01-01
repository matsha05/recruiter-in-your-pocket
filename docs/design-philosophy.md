# Recruiter in Your Pocket — Design Philosophy

> **"The interview starts before you apply."**

---

## The Core Belief

Every time someone opens your resume, they're making a decision about you in seconds — before you ever get a chance to speak. Most candidates never know *how* they're being evaluated. We change that.

RIYP exists to give job seekers the perspective shift they've never had: **see what they see, then change it.**

---

## What We're Not

| They Are | We're Not |
|----------|-----------|
| AI wrappers with no character | We have a point of view and voice |
| College career centers | We speak to professionals, not students |
| Generic template factories | Every insight is specific to *your* resume |
| Advice from people who've never hired | Our methodology comes from real hiring decisions |

---

## The Emotional Hierarchy

When someone finishes using RIYP, they should feel:

1. **Armed** — "I have weapons I didn't have before"
2. **Empowered** — "I can fix this myself now"
3. **Confident** — "I know what they're looking for"
4. **Relieved** — "I'm not guessing anymore"
5. **Seen** — "Someone understood my situation"

We lead with *armament*, not comfort. This is a tool for competing, not just feeling good.

---

## The Voice

**RIYP speaks like your best friend who's done thousands of interviews** — someone who knows the inside game and wants you to win.

- **Warm but direct.** We don't hedge. "This bullet is weak" not "This could potentially be stronger."
- **Expert but accessible.** We've done the research so you don't have to doubt.
- **On your side.** We're rooting for you, not grading you.

We are NOT:
- Cold editors red-penning your grammar
- Corporate HR-speak
- Anxious productivity gurus

---

## The 5 Design Principles

### 1. Editorial Authority
**Reference: Medium, Arc**

Headlines are confident. Typography has personality. Every word earns its place. We're not a dashboard — we're a document that respects your time.

- Fraunces for display (authority)
- Geist for body (precision)
- Maximum two weights per typeface
- Color only where it carries meaning

### 2. Raycast Density
**Reference: Raycast, Linear**

Every pixel earns its place. Information is dense but never cramped. Power-user confidence without overwhelming newcomers.

- Tight spacing, generous negative space
- No decorative elements that don't inform
- Data speaks for itself
- Monospace for numbers and labels

### 3. Alive, Not Static
**Reference: Loom, Pitch**

Micro-animations on hover. Presentation-quality transitions. The interface responds to you — it's not a static page.

- Motion respects `prefers-reduced-motion`
- Transitions are snappy (200ms default, 350ms for reveals)
- Animation teaches (shows what happened, where things went)
- No motion for motion's sake

### 4. Quiet Power
**Reference: Superhuman, Craft, Bear Notes**

Calm by default, decisive in the one moment that matters. 90 percent quiet, 10 percent dramatic, always tied to verdict, value, or conversion.

- Light editorial base by default, dark mode is fully supported
- Warm paper texture allowed only on marketing surfaces and kept subtle
- One signature moment per screen is preferred, not required. Utility screens can have none. Never more than one per screen.
- Teal brand accent (action)
- Gold for premium moments only
- Muted slate for UI chrome
- Shadows are subtle, not dramatic
- Surprise comes from clarity and craft, not theatrics

### 5. Invisible Perfection
**Reference: Bear Notes, Things 3**

A writer's tool with a designer's eye. Complexity is hidden. The surface is simple; the depth is earned.

- No tutorials needed
- Progressive disclosure
- Components are systematic, not one-offs
- Craft is in the details people feel but don't notice

---

## The Signature Moments

These are the experiences that define RIYP:

1. **The 7.4-Second Verdict** — The first thing you see is how a recruiter sees you. Not a score, a *judgment*.

2. **The Red Pen Reveal** — Tap to see the before/after. Interactive, satisfying, actionable.

3. **The Subscore Confidence** — Four dimensions, color-coded. You know exactly where to focus.

4. **The Evidence Trace** — When we cite facts or research, we show sources. When we apply recruiter judgment, we label it.

---

## Permissible Delight

Delight in RIYP is **competence made visible**:

- A Peek preview that opens instantly and closes cleanly
- A verdict reveal that counts up once, with restrained spring
- A submenu that never collapses accidentally
- A command palette that learns intent (recent commands, role-aware)
- An optimistic "Applied" state with Undo, instead of a spinner

**The Rule:** No confetti. No playful bounce. Delight is "I feel in control."

---

## Sterile vs Memorable

**Sterile happens when:**
- Everything is evenly weighted
- Nothing has a point of view
- Motion is absent or generic
- Copy is polite instead of decisive

**Memorable comes from:**
- **Editorial hierarchy** — Fraunces used decisively, not everywhere
- **Verdict-driven structure** — Strong judgment moment, then evidence
- **Microcopy with spine** — "This bullet is weak because..."
- **Interaction certainty** — The UI never hesitates or surprises

---

## Design System Summary

| Token | Value | Usage |
|-------|-------|-------|
| `--brand` | Teal-600 | Primary CTAs, links, active states |
| `--premium` | Gold/Amber | Unlock moments, upsell, special |
| `--success` | Green-700 | Strong scores (85+) |
| `--destructive` | Rose-700 | Weak scores (<70), errors |
| `--radius` | 4px | All corners, always |
| `--duration-normal` | 200ms | Standard transitions |
| `--duration-slow` | 350ms | Reveals, entrances |
| `font-display` | Fraunces | Headlines, scores, verdicts |
| `font-sans` | Geist | Body, UI, labels |

---

## The Magazine Test

If RIYP were featured in a design publication, the headline would be:

> **"The resume tool that finally respects both candidates and design"**

And the subhead:

> *How one product proves that 'career tools' don't have to look like career tools.*

---

## Living Document

This philosophy should be referenced when:
- Making component decisions ("Does this feel like Bear Notes?")
- Writing copy ("Would our hiring manager friend say this?")
- Choosing what to build ("Does this arm people or just inform them?")

Last updated: December 2025
