# Recruiter in Your Pocket — Design Principles

> Implementation guide for [`design-philosophy.md`](./design-philosophy.md)

This document covers how the product should look, move, and sound in practice.

## 1. Core Anchors

- Design principle: `Helpful can be joyful.`
- Tone anchor: `The smartest friend in hiring. Clear, confident, and genuinely helpful.`

If a design decision makes the product feel colder, more generic, or more corporate, it is probably wrong.

## 2. Visual Posture

RIYP should feel premium through restraint.

- Light editorial base by default
- Open layouts over stacked card grids
- Borders and spacing over heavy shadow
- A few well-placed color accents over decorative treatments
- No page-scale glossy gradients or startup glow effects

Small moments of character are welcome. They should feel pleasant and intentional, not ornamental.

## 3. Typography

| Role | Font | Usage |
|---|---|---|
| Display | Sentient | Headlines, verdicts, key moments |
| Interface | Satoshi | Body copy, controls, labels |
| Data | Satoshi with tabular numerics | Scores, metrics, metadata |

Rules:

- Let typography create authority before adding visual treatment
- Use fewer weights, not more
- Keep headings compressed and decisive
- Let body copy feel easy to read, never dense for sport

## 4. Color And Surfaces

| Token | Usage |
|---|---|
| `--brand` | Primary CTA, links, active states |
| `--premium` | Premium moments only |
| `--success` | Positive states |
| `--warning` | Soft warnings and caution |
| `--destructive` | Errors and critical problems |

Rules:

- Use color to guide attention, not to fill space
- Prefer paper, mist, and quiet neutral surfaces
- Gold is for premium moments, not general warmth
- Teal should feel precise and fresh, not loud

## 5. Layout Rhythm

The product should feel structured, not boxed in.

- Most pages should read as sections and rails, not card piles
- Use dividers, pacing, and long rows before introducing new containers
- Keep one focal point near the top of important pages
- Avoid multiple competing hero moments
- If a page feels heavy, remove surfaces before removing information

## 6. Motion

Motion should make the UI feel alive and confident, never playful.

Timing:

- `90ms` for hover and press feedback
- `140ms` for small selection changes
- `200ms` for swaps and state changes
- `320ms` for reveals
- `420ms` only for true signature moments

Rules:

- Motion teaches, confirms, and reassures
- No bounce on structural UI
- Respect `prefers-reduced-motion`
- Never animate decoration just because the screen feels flat

## 7. Voice In The UI

Design and copy are one system.

The UI should sound:

- warm
- sharp
- bright
- helpful
- natural

It should not sound:

- corporate
- AI-generic
- salesy
- stiff
- over-branded

## 8. Naming Rules

- Default product noun: `report`
- Default action verb: `get`
- Use `recruiter` language naturally, not as coined shorthand

Prefer:

- `Get your report`
- `See what stands out first`
- `What a recruiter may notice first`

Avoid:

- `review` as the main product noun
- `analysis` as the main product noun
- `the read`
- `get the recruiter read`
- `signal model` in top-level UI copy

## 9. Surface Rules

### Homepage

- strongest point of view
- quickest tension
- most memorable lines

### In-app

- calmer than marketing
- more orienting
- less performance, more help

### Report

- specific
- fair
- actionable
- non-shaming

### Research and methodology

- grounded and readable
- slightly more explanatory
- never academic for its own sake

### Pricing, auth, empty states, and errors

- shortest and plainest surfaces
- low drama
- high trust

## 10. Character Rules

RIYP should feel alive, not boring.

That means:

- protect one or two lines with real shape on important pages
- vary sentence rhythm
- let observations feel noticed, not generated
- keep delight emotionally light

It does not mean:

- jokes everywhere
- social-brand banter
- forced cleverness
- writing every sentence like a tagline

## 11. Component Finish

Every interactive component must define these states when relevant:

- default
- hover
- active
- focus-visible
- disabled
- loading
- selected
- error
- pending

Missing states make the product feel cheaper than the typography and copy imply.

## 12. Final Gut Check

Before shipping a screen, ask:

1. Does this feel helpful and alive, or just polished?
2. Is the strongest idea obvious fast?
3. Are we using structure, not decoration, to create confidence?
4. Does the copy sound like a real person with judgment said it?
5. Does this feel like RIYP, or like a generic product with nicer fonts?

Last updated: March 2026
