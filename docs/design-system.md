# Recruiter in Your Pocket — Design System v1.1

## Overview
This file defines the tokens and components for the Recruiter in Your Pocket UI and PDF so Codex, Matt, and future collaborators can evolve the product consistently.

## Colors
- Accent Blue 700: `#1C4ED8`
- Accent Blue 800: `#173CA9`
- Accent Blue 100: `#EFF6FF`
- Ink 900: `#0F172A`
- Slate 700: `#334155`
- Slate 500: `#64748B`
- Wash: `#F8FAFC`

## Typography
- Heading XL (hero): display family, tight tracking, ~42px desktop / ~36px mobile, line-height ~1.1–1.15, weight 800.
- Heading L (section headers): display family, ~22–28px, letter spacing slight negative, line-height ~1.25, weight 700–800.
- Body: Manrope, ~15–17px, line-height ~1.6.
- Small / Tip: ~12–13px, line-height ~1.5, used for helper text and meta.

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
