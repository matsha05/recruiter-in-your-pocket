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
- Centering the report (max-width: 960px) creates an editorial reading experience
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
