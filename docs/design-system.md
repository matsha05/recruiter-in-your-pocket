# Design System Technical Specifications

**Version 2.0 ("God Tier" Foundation)**
*Last Updated: Dec 14, 2025*

This document defines the technical implementation standards for the "Studio" aesthetic. These values are the source of truth for all frontend engineering.

## 1. Typography System ("Swiss Editorial")

We use a "Human vs Machine" contrast model.

### Fonts
| Role | Font Family | Variable | Intent |
|------|-------------|----------|--------|
| **UI / Body** | **Geist Sans** | `var(--font-geist-sans)` | Technical precision, high legibility, "Machine" voice. |
| **Editorial** | **Newsreader** | `var(--font-newsreader)` | Warmth, authority, "Human" recruiter voice. |

### Typesetting Rules
We enforce strict tracking and leading. Do not rely on default Tailwind classes alone.

| Element | Class | Tracking | Leading | Intent |
|---------|-------|----------|---------|--------|
| **Headings (H1-H3)** | `.text-display` | `-0.03em` | `1.1` | The "Linear" look. Tight and graphic. |
| **Body (Longform)** | `.text-body-pro` | `0em` | `1.6` | Easy reading for reports. |
| **Eyebrows / Labels** | `.text-eyebrow` | `0.12em` | `1` | Technical metadata labels. Uppercase. |

---

## 2. Animation Physics ("Tactile Spring")

All interactivity is driven by **Framer Motion spring physics**. We do not use CSS transitions for geometry.

### Standard Curves
Defined in `@/lib/animation.ts`.

**1. Button Press (`BUTTON_TAP`)**
*   **Scale**: `0.97`
*   **Physics**: `stiffness: 400`, `damping: 15`
*   *Feel*: Snappy, responsive, immediate return.

**2. Page Transitions (`FADE_IN_UP`)**
*   **Motion**: `y: 10px -> 0px`, `opacity: 0 -> 1`
*   **Curve**: `ease: [0.32, 0.72, 0, 1]`
*   *Feel*: Subtle elegant entry. No hard cuts.

---

## 3. Semantic Color System (Studio Tuned)

We map semantic intent to specific verified HSL values.

### The Problem: Gold vs Amber Collision
In standard palettes, "Warning" (Orange) and "Premium" (Gold) often collide. We have tuned them to be distinct.

### Verified Palette
| Semantic Token | Alias | HSL Value | Description |
|----------------|-------|-----------|-------------|
| **Premium / Hero** | `--gold` | `45 95% 50%` | **Metallic Yellow**. High saturation. Distinct from orange. |
| **Warning / Caution** | `--amber` | `25 90% 55%` | **Dirty Orange**. Traffic light color. Distinct from gold. |
| **Success / Valid** | `--moss` | `160 84% 39%` | **Technical Teal**. Not "grass green". |
| **Error / Destructive** | `--rose` | `350 89% 60%` | **Soft Crimson**. Not "fire engine red". |

### Dark Mode
*   **Background**: `hsl(0 0% 2%)` (Approx `#050505`) - Deep OLED black, not gray.

---

## 4. Component Standards

### Buttons
All buttons must be wrapped in `motion.button` (unless `asChild`).
*   **Primary**: Solid background, white text.
*   **Studio**: Black background (White in dark mode), high contrast.

### Empty States (Drop Zones)
*   Must be interactive and "alive".
*   Use `Newsreader Italic` for the invitation text.
*   Use `sparkles` or subtle motion to suggest magic.
