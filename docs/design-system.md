# Recruiter in Your Pocket — Design System v2.0

## Overview
This file defines the tokens and components for the Recruiter in Your Pocket UI and PDF so Matt, and future collaborators can evolve the product consistently.

**Last Updated:** 2025-12-09 (Unified Design System Refactor)

## Design Tokens Reference

All design tokens are defined as CSS variables in `:root`. This document serves as the reference for what tokens exist and when to use them.

---

## Colors

### Brand Palette (Indigo)
The primary brand colors anchor the UI:

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--color-indigo-50` | `#EEF2FF` | — | Wash/alt backgrounds |
| `--color-indigo-100` | `#E0E7FF` | — | Subtle fills |
| `--color-indigo-500` | `#4F46E5` | `#6366F1` | Primary brand |
| `--color-indigo-600` | `#4338CA` | `#818CF8` | Brand strong/hover |

### Semantic Tokens
Use these tokens for all color decisions—they automatically adapt between light and dark modes:

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--brand` | `#4F46E5` | `#6366F1` | Primary CTA, active states |
| `--brand-strong` | `#4338CA` | `#818CF8` | Hover states, emphasis |
| `--text-primary` | `#111827` | `#E5E7EB` | Body text, headings |
| `--text-secondary` | `#4B5563` | `#9CA3AF` | Supporting text |
| `--text-link` | `#4338CA` | `#A5B4FC` | Links |
| `--bg-body` | `#F9FAFB` | `#020617` | Page background |
| `--bg-card` | `#FFFFFF` | `#020617` | Card surfaces |
| `--bg-card-alt` | `#EEF2FF` | `rgba(79,70,229,0.16)` | Highlighted cards, pills |
| `--bg-section-muted` | `#F5F3EF` | `#020617` | Warm section backgrounds |
| `--border-subtle` | `#E5E7EB` | `#1F2937` | Dividers, input borders |
| `--border-strong` | `#D1D5DB` | `#111827` | Emphasized borders |

### Status Colors
Status tokens are calibrated for contrast in each mode:

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--status-success` | `#2F7F5F` | `#4ADE80` | Positive states, scores 80+ |
| `--status-warning` | `#D97706` | `#FBBF24` | Caution, scores 70-79 |
| `--status-danger` | `#B91C1C` | `#F87171` | Errors, scores <70 |
| `--accent-warm` | `#F5B25C` | `#FBBF77` | Highlights, attention cards |

### Legacy Token Aliases
For backwards compatibility, old token names map to semantic tokens:
- `--accent` → `--brand`
- `--text-main` → `--text-primary`
- `--text-soft` → `--text-secondary`
- `--bg-page` → `--bg-body`
- `--success` → `--status-success`
- `--warning` → `--status-warning`
- `--error` → `--status-danger`

### Semantic Score Colors (5-Tier System)

These colors communicate score meaning at a glance. They are distinct from the brand accent and status colors because they serve a specific purpose: instantly conveying where a resume falls on the quality spectrum.

**Rationale:** A recruiter's 10-second scan requires immediate visual feedback. The 5-tier system maps to how recruiters actually bucket candidates:
- **Exceptional** candidates stand out immediately (top of pile)
- **Strong** candidates move forward confidently
- **Good** candidates are viable but need polish
- **Needs Work** candidates require significant revision
- **Risk** candidates would struggle to get callbacks

| Band | Score | Color | Hex | Usage |
|------|-------|-------|-----|-------|
| Exceptional | 90+ | Purple | `#8b5cf6` | Elite resumes that stand out in a recruiter skim |
| Strong | 85-89 | Blue | `#3b82f6` | Clear, confident, competitive for most roles |
| Good | 80-84 | Green | `var(--status-success)` | Solid baseline, may need sharpening |
| Needs Work | 70-79 | Yellow | `var(--status-warning)` | Story unclear, impact inconsistent |
| Risk | <70 | Red | `var(--status-danger)` | Recruiters will struggle to place level/strengths |

**Dark Mode:** All colors have dark mode overrides defined in `[data-theme="dark"]`.

---

## Typography

### Font Families
- `--font-display: "Plus Jakarta Sans", ...` - Display font (headings)
- `--font-body: "Manrope", ...` - Body font

### Font Sizes
- `--fs-hero: 52px` - Hero title
- `--fs-h1: 26px` - Heading 1 (section titles)
- `--fs-h2: 21px` - Heading 2
- `--fs-h3: 17px` - Heading 3
- `--fs-body: 15px` - Body text
- `--fs-label: 14px` - Labels
- `--fs-small: 13px` - Small text
- `--fs-xs: 12px` - Extra small
- `--fs-tiny: 11px` - Tiny text
- `--fs-base: 16px` - Base size
- `--fs-lg: 18px` - Large
- `--fs-xl: 20px` - Extra large
- `--fs-2xl: 22px` - 2x large
- `--fs-3xl: 32px` - 3x large
- `--fs-dial: 48px` - Score dial size

### Line Heights
- `--lh-very-tight: 1.1` - Very tight line height
- `--lh-tight: 1.15` - Tight line height
- `--lh-snug: 1.2` - Snug line height
- `--lh-cozy: 1.25` - Cozy line height
- `--lh-medium: 1.4` - Medium line height
- `--lh-normal: 1.5` - Normal line height
- `--lh-custom: 1.55` - Custom line height
- `--lh-relaxed: 1.6` - Relaxed line height
- `--lh-loose: 1.65` - Loose line height
- `--lh-extra-loose: 1.7` - Extra loose line height

### Typography Guidelines
- **Display (Headings):** Plus Jakarta Sans
  - Hero: Tight tracking (-0.02em), weight 800
  - Section Headers: Slight negative tracking, weight 700-800
- **Body:** Manrope
  - Regular text: Weight 400/500, clean and approachable
  - UI Labels: Weight 600 for clarity

---

## Spacing

Use spacing variables for all padding, margin, and gap values.

### Spacing Scale
- `--space-micro: 2px` - Micro spacing
- `--space-xxs: 4px` - Extra extra small
- `--space-xs: 6px` - Extra small
- `--space-tight: 8px` - Tight spacing
- `--space-tight-alt: 9px` - Tight alternative
- `--space-sm: 10px` - Small
- `--space-sm-alt: 12px` - Small alternative
- `--space-md: 15px` - Medium
- `--space-md-alt: 16px` - Medium alternative
- `--space-md-lg: 18px` - Medium-large
- `--space-lg: 20px` - Large
- `--space-lg-alt: 22px` - Large alternative
- `--space-xl: 30px` - Extra large
- `--space-xl-alt: 24px` - Extra large alternative
- `--space-2xl: 40px` - 2x large
- `--space-3xl: 32px` - 3x large
- `--space-xxl: 50px` - Extra extra large
- `--stack-gap: 16px` - Standard vertical gap for stacked sections (e.g., report sections)
- `--stack-gap: 16px` - Stack section gap

---

## Border Radius

Use radius variables for all border-radius values.

### Radius Scale
- `--radius-xs: 6px` - Extra small radius
- `--radius-sm: 8px` - Small radius
- `--radius-md: 10px` - Medium radius (buttons)
- `--radius-input: 12px` - Input radius
- `--radius-lg: 14px` - Large radius (cards)
- `--radius-xl: 16px` - Extra large radius
- `--radius-card: 18px` - Card radius
- `--radius-2xl: 20px` - 2x large radius
- `--radius-3xl: 22px` - 3x large radius
- `--radius-pill: 999px` - Pill radius (fully rounded)

### Radius Guidelines
- Buttons: `--radius-md` (10px) or `--radius-input` (12px)
- Cards: `--radius-card` (18px) or `--radius-lg` (14px)
- Inputs: `--radius-input` (12px)
- Pills: `--radius-pill` (999px)

---

## Shadows

Use shadow variables for consistent elevation and depth.

### Shadow Variables
- `--shadow-soft: 0 18px 30px rgba(15, 23, 42, 0.06)` - Soft shadow (general use)
- `--shadow-card: 0 10px 24px rgba(15, 23, 42, 0.08)` - Card shadow
- `--shadow-button: 0 4px 14px rgba(28, 78, 216, 0.25)` - Button shadow
- `--shadow-button-hover: 0 6px 18px rgba(23, 60, 169, 0.27)` - Button hover shadow
- `--shadow-modal: 0 18px 45px rgba(15, 23, 42, 0.12)` - Modal shadow
- `--shadow-hero: 0 16px 32px rgba(15, 23, 42, 0.08)` - Hero shadow

**Dark Mode:** All shadows have darker variants for dark mode.

---

## Motion

Use motion variables for transitions and animations.

### Motion Variables
- `--motion-duration-short: 200ms` - Short duration
- `--motion-duration-medium: 300ms` - Medium duration
- `--motion-ease-premium: cubic-bezier(0.16, 1, 0.3, 1)` - Premium easing
- `--ease-smooth: cubic-bezier(0.21, 0.74, 0.23, 0.99)` - Smooth easing for buttons and interactions

### Motion Guidelines
- Score reveal: uses `@keyframes score-in` (opacity + translateY + scale)
- Button hover: 160ms transitions with `--ease-smooth`
- Tab/row hover: 140ms transitions
- Always respect `prefers-reduced-motion` media query

---

## Focus States

All interactive elements use consistent focus states for accessibility.

### Focus Variables
- `--focus-outline-color: #A5B4FC` (dark: `#818CF8`)
- `--focus-outline-width: 2px`
- `--focus-outline-offset: 3px`
- `--focus-shadow: 0 0 0 2px rgba(79, 70, 229, 0.16)` (dark: `rgba(129, 140, 248, 0.3)`)

### Focus Pattern
All interactive elements should use:
```css
:focus-visible {
  outline: var(--focus-outline-width) solid var(--focus-outline-color);
  outline-offset: var(--focus-outline-offset);
  box-shadow: var(--focus-shadow);
}
```

**Note:** Focus states are automatically adjusted for dark mode.

---

## Icon Sizes

- `--icon-size-sm: 8px` - Small icon
- `--icon-size-md: 16px` - Medium icon (default)

---

## Accent Width

- `--accent-width: 2px` - Standard accent line width
- `--accent-width-strong: 6px` - Strong accent line width

---

## Component Classes

### Buttons

| Class | Usage | Styling |
|-------|-------|---------|
| `.btn-primary` | Main CTAs, run buttons | Brand background, white text, pill radius, glow shadow on hover |
| `.btn-secondary` | Secondary actions | Card background, border, pill radius, subtle hover |
| `.btn-ghost` | Tertiary actions | Transparent, subtle hover fill |

**Button states:**
- `:hover` — `translateY(-1px)`, intensified shadow
- `:active` — `translateY(0)`, reduced shadow  
- `:focus-visible` — outline ring with shadow

### Report Components

| Class | Usage |
|-------|-------|
| `.report-score-card` | Overall score container with card styling |
| `.score-main` | Large score number with animation |
| `.score-pill` | Subscore badges (Impact, Clarity, etc.) |
| `.score-range--excellent` | 90+ score labels |
| `.score-range--good` | 80-89 score labels |
| `.score-range--needs-work` | 70-79 score labels |
| `.score-range--risk` | <70 score labels |
| `.card-positive` | "What is working" items (green left border) |
| `.card-attention` | "What is missing" items (warm left border) |
| `.fix-row` | Top fixes list items with hover |

### Badges

| Class | Usage |
|-------|-------|
| `.badge-impact-high` | High impact indicator (green) |
| `.badge-impact-medium` | Medium impact indicator (warm) |
| `.badge-effort` | Effort level indicator (neutral) |
| `.badge-flag` | Pricing flags ("Most popular", "Best value") |

### Navigation Tabs

| Class | Usage |
|-------|-------|
| `.tablist` | Tab container |
| `.tab` | Individual tab button |
| `.tab--active` | Active tab with underline indicator |

### Alerts

| Class | Usage |
|-------|-------|
| `.alert-soft` | Gentle warning (warm border/background) |

### Layout

| Class | Usage |
|-------|-------|
| `.section-muted` | Apply `--bg-section-muted` background |

## Usage Guidelines

### General Principles
1. **Always use design tokens** - Never hardcode spacing, colors, typography, or radius values
2. **Use reusable classes** - Prefer existing classes over custom CSS when possible
3. **Maintain consistency** - Follow established patterns for similar components
4. **Accessibility first** - Always include proper focus states using the focus pattern

### Common Patterns

#### Adding Spacing
```css
/* ✅ Good - Use variables */
padding: var(--space-lg) var(--space-md-alt);
margin-bottom: var(--space-xl);
gap: var(--space-sm);

/* ❌ Bad - Hardcoded values */
padding: 20px 16px;
margin-bottom: 30px;
gap: 10px;
```

#### Typography
```css
/* ✅ Good - Use typography variables */
font-size: var(--fs-h1);
line-height: var(--lh-snug);
font-family: var(--font-display);

/* ❌ Bad - Hardcoded values */
font-size: 26px;
line-height: 1.2;
font-family: "Plus Jakarta Sans", sans-serif;
```

#### Focus States
```css
/* ✅ Good - Use focus variables */
:focus-visible {
  outline: var(--focus-outline-width) solid var(--focus-outline-color);
  outline-offset: var(--focus-outline-offset);
  box-shadow: var(--focus-shadow);
}
```

#### Shadows
```css
/* ✅ Good - Use shadow variables */
box-shadow: var(--shadow-card);
box-shadow: var(--shadow-button);

/* ❌ Bad - Hardcoded shadows */
box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
```

## Layout & Interaction Patterns

### Two-Column Workspace Layout
**Pattern:** `.tool-layout` uses a two-column grid (input | output) that creates distinct workspaces.

**Rationale:**
- Separates input (resume text) from output (feedback report) as distinct mental spaces
- Balanced columns create visual equilibrium and prevent one side from dominating
- On mobile/tablet (<1024px), collapses to single column for readability
- Supports focus mode (see below) for distraction-free reading

**Implementation:**
- Grid: `grid-template-columns: 1fr 1fr` with `gap: var(--space-2xl)`
- Input column: `.card-input` with min-height for visual balance
- Output column: `.report-wrapper` contains the full Insight Stack
- Responsive: Single column below 1024px

**Note:** The landing page (`index.html`) tool-layout is hidden. Resume input now happens in the dedicated `/workspace`.

### Application Routes
- `/` - Marketing landing page (hero, preview, pricing)
- `/workspace` - Dedicated resume analysis workspace
- `/terms` - Terms of Service
- `/privacy` - Privacy Policy

### Focus Mode
**Pattern:** Toggle that hides input panel and centers the report for distraction-free reading.

**Rationale:**
- After generating feedback, users need to read and absorb the report
- Input panel becomes visual noise once feedback is generated
- Centering the report (max-width: 960px) creates a crafted reading experience
- "Back to editor" allows quick return to input for iteration

**Implementation:**
- Toggle button: "Focus on report" / "Back to editor"
- CSS: `.tool-layout` becomes single column, `.card-input` hidden, `.card-output` centered
- Auto-triggers after successful feedback generation
- Preserves scroll position and report state

### Issue Breakdown Navigation
**Pattern:** Interactive panel below score dial showing prioritized improvement areas with clickable navigation.

**Rationale:**
- Breaks down feedback into scannable categories (Impact & Results, Clarity & Conciseness, Focus & Craft)
- Visual bars with counts show where most improvements are needed
- Clickable bars jump to relevant sections in the report
- Provides quick orientation: "Where should I focus first?"

**Implementation:**
- `.issue-breakdown` with `.issue-bar` components
- Each bar shows label + count (e.g., "3 top suggestions")
- Fill animation indicates relative priority
- Click handler scrolls to corresponding section in Insight Stack
- Hidden until feedback is generated, then fades in

### Rewrite Comparison Pattern
**Pattern:** Two-column layout (Original | Better) for before/after bullet comparisons.

**Rationale:**
- Side-by-side comparison makes improvements immediately obvious
- Left column shows original (muted) for context
- Right column shows improved version (accented) with checkmark
- Visual hierarchy guides eye to the "Better" version
- Enhancement notes below provide additional context

**Implementation:**
- `.rewrite-columns` grid with two equal columns
- `.rewrite-column.right` has accent line and checkmark indicator
- Hover states provide subtle feedback
- Mobile: Stacks vertically for readability
- Each `.rewrite-block` is a card with padding and subtle shadow

### Skeleton Loading Pattern
**Pattern:** Loading skeleton that mirrors the final report structure with accent lines.

**Rationale:**
- Reduces perceived wait time by showing structure immediately
- Matches final layout so transition feels seamless
- Accent lines in skeleton maintain visual continuity
- Pulse animation indicates active loading without being distracting

**Implementation:**
- `.results-skeleton` uses same `.stack-section` structure as final report
- Skeleton headings, sublines, and content lines match final dimensions
- Accent lines use reduced opacity (0.4) to indicate loading state
- Smooth fade-out when real content appears
