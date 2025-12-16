# Design System Technical Specifications: "Luminous Studio"

**Version 3.0 (Elite Identity)**
*Last Updated: Dec 15, 2025*

This document defines the technical implementation standards for the "Elite Studio" aesthetic. These values are the source of truth for all frontend engineering.

## 1. Typography System

We use a "Luminous Authority" contrast model.

### Fonts
| Role | Font Family | Variable | Intent |
|------|-------------|----------|--------|
| **Editorial** | **Newsreader** | `var(--font-display)` | Authority, main headlines, "The Verdict". |
| **Interface** | **Geist Sans** | `var(--font-body)` | Utility, controls, labels, body text. |
| **Data** | **Geist Mono** | `var(--font-mono)` | Scores, code, technical metrics. |

### Typesetting Rules
| Element | Class | Tracking | Leading | Font |
|---------|-------|----------|---------|------|
| **Hero Heading** | `.text-hero` | `-0.02em` | `1.1` | Newsreader (Display) |
| **Section Title** | `.text-title` | `-0.01em` | `1.2` | Newsreader (Display) |
| **Body (Long)** | `.text-reading` | `0em` | `1.6` | Geist Sans |
| **Label/Meta** | `.text-label` | `0.05em` | `1` | Geist Sans (Uppercase often) |
| **The Score** | `.text-score` | `-0.03em` | `1` | Geist Mono |

---

## 2. Color System: "Ink & Light"

We use strictly defined semantic colors. Avoid raw hex values.

### Palette HSL
| Semantic Token | Tailwind | Verified Value | Description |
|----------------|----------|----------------|-------------|
| **Premium / Hero** | `--gold` | `43 96% 64%` | **Luminous Gold**. High saturation active state. |
| **Success / Valid** | `--moss` | `160 84% 39%` | **Technical Teal**. Not "tree green". |
| **Warning / Fix** | `--amber` | `25 90% 55%` | **Dirty Orange**. Traffic light yellow-orange. |
| **Error / Critical** | `--rose` | `350 89% 60%` | **Soft Crimson**. Serious but not screaming. |
| **Ink (Text)** | `--foreground` | `0 0% 9%` | **Off-Black**. Sharp contrast against paper. |

### Backgrounds
- **Paper:** `--background` (White / #050505)
- **Subtle:** `--secondary` (Gray-50 / Gray-900)
- **Glass:** Backdrops use `backdrop-blur-md` with alpha backgrounds.

---

## 3. Depth System: "Luminous Borders"

We typically avoid heavy shadows in favor of "Alpha Borders" (white/10% or black/5%).

### Depth Classes
| Utility | CSS Logic | Usage |
|---------|-----------|-------|
| `.studio-panel` | `border border-black/5 bg-surface shadow-sm` | Cards, Report Sections. |
| `.studio-glass` | `border border-white/10 bg-white/50 backdrop-blur` | Sticky Headers, Toast Messages. |
| `.studio-shimmer` | `linear-gradient` animation | Loading states, Premium buttons. |

---

## 4. Animation Physics: "Snap"

All interactivity should feel immediate and crisp.

### Physics Config
```javascript
export const TRANSITION_SNAP = {
    type: "spring",
    stiffness: 400,
    damping: 30
};

export const TRANSITION_REVEAL = {
    duration: 0.6,
    ease: [0.22, 1, 0.36, 1] // "Cinematic Ease"
};
```

---

## 5. Trust Signals

Trust must be visible but secondary.
- **Lock Icon:** Use `w-3 h-3` (tiny).
- **Placement:** Footer or micro-copy under buttons.
- **Copy:** "Encrypted", "Auto-deleted", "No training".
