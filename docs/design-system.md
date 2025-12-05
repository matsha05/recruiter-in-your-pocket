# Recruiter in Your Pocket — Design System v1.2

## Overview
This file defines the tokens and components for the Recruiter in Your Pocket UI and PDF so Matt, and future collaborators can evolve the product consistently.

**Last Updated:** 2025-01-27 (Phase 3 Refactoring Complete)

## Design Tokens Reference

All design tokens are defined as CSS variables in `:root`. This document serves as the reference for what tokens exist and when to use them.

---

## Colors

### Backgrounds
- `--bg-page: #FDFDFC` - Page background (Warm Stone)
- `--bg-panel: #ffffff` - Panel background
- `--bg-card: #ffffff` - Card background
- `--wash: #FAF9F6` - Wash background (Warm Wash)
- `--surface-tint: #F3F4F6` - Surface tint background

### Borders
- `--border-subtle: #d7dae3` - Subtle border color
- `--border-strong: #c6cbd6` - Strong border color

### Accents (Deep Indigo)
- `--accent: #3341A6` - Default accent color
- `--accent-dark: #26328C` - Dark accent variant
- `--accent-strong: #1E2A78` - Strong accent variant
- `--accent-wash: #EEF0FA` - Accent wash background
- `--accent-boost: #3341A6` - Accent boost color
- `--accent-soft: color-mix(...)` - Soft accent tint for subtle fills/gradients (light: mix with white; dark: mix with #1A1C20)

### Text Colors
- `--text-main: var(--ink-900)` - Primary text color
- `--text-soft: var(--slate-700)` - Soft text color
- `--text-muted: var(--slate-500)` - Muted text color
- `--ink-900: #0F172A` - Primary text (dark)
- `--slate-700: #334155` - Soft text
- `--slate-500: #64748B` - Muted text

### Status Colors
- `--success: #15803d` - Success color
- `--success-dark: #047857` - Dark success
- `--success-light: #22c55e` - Light success
- `--error: #b91c1c` - Error color
- `--error-dark: #7f1d1d` - Dark error
- `--error-light: #fca5a5` - Light error
- `--error-bg: rgba(185, 28, 28, 0.08)` - Error background
- `--warning: #d97706` - Warning color
- `--warning-dark: #92400e` - Dark warning

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
- `--fs-dial: 36px` - Score dial size

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

### Motion Guidelines
- Signature report reveal: opacity 0 → 1 and translateY(8px) → 0; ~240ms; easing `--motion-ease-premium`; disabled under `prefers-reduced-motion`
- Guideline: no other major motions; small hover transitions only
- Always respect `prefers-reduced-motion` media query

---

## Focus States

All interactive elements use consistent focus states for accessibility.

### Focus Variables
- `--focus-outline-color: #A5B4FC` - Focus outline color (light blue)
- `--focus-outline-width: 2px` - Focus outline width
- `--focus-outline-offset: 3px` - Focus outline offset
- `--focus-shadow: 0 0 0 2px rgba(28, 78, 216, 0.16)` - Focus shadow ring

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

## Reusable Classes

Use these classes for consistent component patterns throughout the application.

### Stack Section Pattern
- `.stack-section` - Container for report sections with consistent spacing
- `.stack-heading` - Section heading with consistent typography
- `.stack-subline` - Section subtitle/description
- `.stack-accent-line` - Left accent line for visual hierarchy

**When to use:** All Insight Stack report sections should use this pattern for consistency.

### Button Components
- `.btn-primary` - Primary action button
  - Accent background, white text
  - Radius: `var(--radius-input)` (12px)
  - Premium shadow with hover lift
  - Focus-visible ring using accent mix
- `.btn-secondary` - Secondary action button
  - Outline style with subtle shadow
  - Hover strengthens border and lifts slightly
  - Focus-visible ring consistent with primary
- `.ghost-button` - Subtle ghost button
  - Minimal styling, subtle background
  - Used for less prominent actions

**When to use:**
- Primary actions: `.btn-primary`
- Secondary actions: `.btn-secondary`
- Tertiary actions: `.ghost-button`

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
