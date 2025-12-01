# Recruiter in Your Pocket — Design System v1.1

## Overview
This file defines the tokens and components for the Recruiter in Your Pocket UI and PDF so Codex, Matt, and future collaborators can evolve the product consistently.

## Colors
- **Backgrounds**
  - Page: Warm Stone `#FDFDFC`
  - Wash: Warm Wash `#FAF9F6`
  - Surface Tint: `#F3F4F6`
  - Panel/Card: `#ffffff`

- **Accents (Deep Indigo)**
  - Accent (Default): `#3341A6`
  - Accent Dark: `#26328C`
  - Accent Strong: `#1E2A78`
  - Accent Wash: `#EEF0FA`

- **Ink & Neutral**
  - Ink 900: `#0F172A` (Primary Text)
  - Slate 700: `#334155` (Soft Text)
  - Slate 500: `#64748B` (Muted Text)

## Typography
- **Display (Headings):** Plus Jakarta Sans
  - Hero: Tight tracking (-0.02em), weight 800.
  - Section Headers: Slight negative tracking, weight 700-800.
- **Body:** Manrope
  - Regular text: Weight 400/500, clean and approachable.
  - UI Labels: Weight 600 for clarity.

## Spacing & Radii
- Spacing tokens: 4, 8, 12, 16, 24, 32, 40 (px).
- Card radius: 12px (panels/cards use 12–18px; PDF mirrors 12px).
- Button radius: 12px.

## Shadows
- Card shadow: `0 8px 24px rgba(15,23,42,0.08)`.
- Button primary shadow: rest `0 10px 22px color-mix(in srgb, var(--accent) 18%, transparent)`; hover `0 12px 26px color-mix(in srgb, var(--accent) 22%, transparent)`.
- Textarea inset shadow: subtle inset border with light inner shadow; avoid heavy glow.

## Motion
- Signature report reveal: opacity 0 → 1 and translateY(8px) → 0; ~240ms; easing cubic-bezier(0.16, 1, 0.3, 1); disabled under `prefers-reduced-motion`.
- Guideline: no other major motions; small hover transitions only.

## Components
- `.btn-primary`: accent background, white text, 12px radius, premium shadow, hover darkens accent and lifts by 1–2px; focus-visible ring using accent mix.
- `.btn-secondary`: muted/outline neutral, subtle shadow, hover strengthens border and slight lift; focus-visible ring consistent with primary.
- Report spine/section wrapper: single-column stack with accent spine on the left; each section spaced like a chapter with Heading L + subline; used in UI and PDF.
- CTA rail basics: clustered primary/secondary actions in hero and results; consistent spacing (8–12px gaps), aligns with button tokens.
