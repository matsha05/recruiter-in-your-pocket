# Design System V2.2 — Technical Specifications

> [!NOTE]
> This is the **technical implementation reference**. For design decisions, see [design-philosophy.md](./design-philosophy.md) (source of truth) and [design-principles.md](./design-principles.md) (patterns & rules).

*Last Updated: January 2026 — V2.2 "Modern Editorial"*

---

## 1. Typography

| Role | Font | Variable | Weight |
|---|---|---|---|
| **Display** | Fraunces | `var(--font-display)` | 400 (H1), 500 (H2+) |
| **Body** | Geist Sans | `var(--font-body)` | 400, 500 |
| **Mono** | Geist Mono | `var(--font-mono)` | 400 |

### Type Scale (V2 Utilities)
These map to the typography utilities in `web/app/globals.css`.

| Utility | Size | Line Height | Usage |
|---|---|---|---|
| `text-label` | `0.6875rem` (11px) | `leading-none` | Uppercase labels, tags |
| `text-caption` | `0.8125rem` (13px) | `leading-normal` | Captions, helper text |
| `text-body` | `0.9375rem` (15px) | `leading-relaxed` | Default body copy |
| `text-memo` | `15px` | `leading-relaxed` | Long-form analysis, emphasis blocks |
| `text-headline` | `2rem` (32px) | `1.2` | Section titles |
| `text-metric` | `2.5rem` (40px) | `1` | Scores and metrics |
| `text-verdict` | `3.5rem` (56px) | `1.05` | Verdicts only |

### Density Targets
- App surfaces default to 13-15px body and metadata. Use `text-body`, `text-caption`, and `text-label` for dense UI.
- Avoid `text-lg` and above inside dense app surfaces. Reserve larger sizes for hero statements and report verdicts.
- If a screen feels airy, step down one type size before adding extra spacing.

---

## 2. Colors

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--background` | `#FAFAFA` | `#111111` | Page |
| `--foreground` | `#111111` | `#EEEEEE` | Text |
| `--muted` | `#6B7280` | `#9CA3AF` | Secondary |
| `--border` | `rgba(0,0,0,0.08)` | `rgba(255,255,255,0.10)` | Dividers |
| **`--brand`** | `#0D9488` | `#2DD4BF` | **Primary CTA, Score** |
| `--accent` | `#334155` | `#94A3B8` | UI chrome |
| `--premium` | `#D97706` | `#FBBF24` | Gold unlock only |
| `--success` | Green-700 | Green-400 | Positive states, scores 85+ |
| `--warning` | Yellow-600 | Yellow-400 | Caution states |
| `--error` | Rose-700 | Rose-400 | Critical failures, scores <70 |

---

## 3. Radius & Shadows

| Token | Value | Usage |
|---|---|---|
| `--radius` | `4px` | App surfaces (buttons, inputs, dense cards) |
| `--radius-sm` | `2px` | Badges, small chips |
| `--radius-lg` | `8px` | Modals |
| `--radius-xl` | `12px` | **Marketing cards, hero panels** |
| `shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.04)` | Subtle lift (optional) |
| `shadow-overlay` | `0 10px 30px rgba(0,0,0,0.08)` | Overlays only (peek, popover, modal) |
| `.card-marketing` | Soft slate shadow (light mode only) | Marketing/landing pages |

**Rule:** Base surfaces use borders only, not shadows. Marketing surfaces use `.card-marketing` for soft lift in light mode. Overlay surfaces get `shadow-overlay`.

---

## 4. Motion

### Semantic Duration Roles
| Role | Value | Usage |
|---|---|---|
| `press` | `80ms` | Input acknowledgement |
| `hoverIn` | `90ms` | Hover on |
| `hoverOut` | `160ms` | Hover off (slower = calm) |
| `select` | `140ms` | Selection highlight |
| `swap` | `200ms` | Tabs, accordions, content changes |
| `reveal` | `320ms` | Panels, section reveals |
| `hero` | `420ms` | Verdict reveal only |

### CSS Tokens (globals.css)
| Token | Value |
|---|---|
| `--ease` | `cubic-bezier(0.16, 1, 0.3, 1)` |
| `--duration-fast` | `100ms` |
| `--duration-normal` | `200ms` |
| `--duration-slow` | `350ms` |

**Animatable properties:** `opacity`, `transform`, `background-color` only.
**Reduced motion:** Respects `prefers-reduced-motion` globally.

---

## 4a. Skeleton Policy

Skeletons prevent layout shift and signal quality.

**Rules:**
- Skeleton must match final layout dimensions 1:1
- No spinners except inside tiny buttons
- If you know the shape, skeleton. If you don't, staged reveal.

**Staged Reveal Choreography:**
| Time | Action |
|------|--------|
| 0ms | Show scanning state + step counter |
| 200ms | Show skeleton blocks |
| 320ms | Fade in first real block (opacity only) |
| +80ms | Fade next block, continue |

---

## 4b. Performance Budgets

These are hard requirements, not goals.

| Interaction | Budget |
|-------------|--------|
| Press feedback (visual) | <80ms |
| Hover response | <90ms |
| Route shell visible | <200ms |
| Analysis progress indicator | <200ms from start |
| Reflow on hover | **Never** |

---

## 5. States

| State | Rule |
|---|---|
| Hover | Lighten 10% |
| Active | Darken 10% |
| Disabled | `opacity-50`, `pointer-events-none` |
| Focus | `.focus-ring` utility (Slate ring, 2px offset) |

---

## 6. Loading States

| Pattern | Implementation |
|---|---|
| **Skeleton** | `<Skeleton />` component: `bg-[var(--skeleton)]`, `animate-pulse` |
| **Empty State** | Text-first, Fraunces headline, no icons |
| **Analysis Theater** | `AnalysisScanning.tsx` with recruiter-language phases |

---

## 7. Custom Icons

Location: `/web/components/icons/`

| Icon | Purpose | Usage |
|---|---|---|
| `PocketMark` | Brand mark | Headers, Favicon |
| `Wordmark` | Path-based "pocket" wordmark | Brand applications |
| `PrincipalRecruiterIcon` | Authority/Expert Profile | 01. First Impression header |
| `SignalRadarIcon` | Data Visualization | 02. Signal Analysis header |
| `TransformArrowIcon` | Editorial Quill | 03. The Red Pen header |
| `HiddenGemIcon` | Discovery/Treasure | 04. Missing Wins header |
| `RoleTargetIcon` | Role Fit Target | 05. Where You Compete header |
| `SixSecondIcon` | Timer Segment | Scanning state, InputPanel |
| `EmptyReportIcon` | Empty states (reserved) | Text-first preferred |
| `InsightSparkleIcon` | North Star/Value | Premium features, Coach notes |

### Design Rules
- **Stroke:** `1.5px` (unified)
- **ViewBox:** `0 0 24 24` (standard)
- **Fill:** `none` (stroke-based)
- **Color:** `currentColor` (inherits from parent)

### Report Section Header Format
```
[Icon w-4 text-brand] [Number]. [Title]    [Optional Badge]
```

### Color Standards
| Context | Token |
|---------|-------|
| Section header icons | `text-brand` (Teal) |
| Premium/Upgrade CTAs | `text-premium` (Gold) |
| Muted/Disabled | `text-muted-foreground` |

---

## 8. Z-Index Scale

| Level | Value | Usage |
|---|---|---|
| Sticky | `10` | Headers |
| Dropdown | `20` | Menus |
| Modal | `30` | Dialogs |
| Toast | `40` | Notifications |

---

## 9. Responsive

| Breakpoint | Width |
|---|---|
| `sm` | 640px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1280px |

**Max widths:** 768px (prose), 1200px (app).
**Touch targets:** 44px minimum on mobile.

---

## 10. Evidence and Citations

Evidence should feel editorial, not UI chrome.
Scope: citations are required on research articles, reports, and study detail pages. Index or navigation surfaces should avoid factual claims; do not add citation markers or sources lists to hubs.

### Citation Marker
- Inline superscript link after the claim.
- Font: Geist Mono, `text-[10px]`, `text-muted-foreground`, `align-super`.
- Interaction: hover or focus shows a popover with title, source, year, and link. On mobile, tap scrolls to Sources.
- Do not use citation markers on index surfaces.

Example:
```tsx
<p>
  Recruiters decide in seconds.<sup><a href="#source-1">1</a></sup>
</p>
```

### Sources List
- Ordered list at the end of the report or research surface.
- Format: `1. Title - Publisher (Year).`
- Links point to the exact evidence. Follow `docs/source-quality.md`.

### Evidence Labels
If the claim is recruiter judgment or an internal heuristic:
- Label inline as `Recruiter Lens` or `Internal signal`
- Do not attach a citation marker

---

## 11. Accessibility

- Use the `focus-ring` utility for custom interactive components.
- Icon-only buttons require `aria-label`.
- Popovers and tooltips must be keyboard accessible and dismissible.
- Do not remove outlines unless replaced with an equivalent focus style.

---

## 12. Finish Pass (Required)

- Hierarchy: one primary and one secondary per screen. Everything else is supporting.
- Spacing rhythm: align to a 4px grid and keep consistent vertical cadence.
- Type: display for headlines, mono only for data. Avoid oversized body text in dense UI.
- States: hover, focus, active, disabled, loading are all defined.
- Motion: use `--ease` and duration tokens. No infinite motion.
- Pixel: align baselines, icons, and borders to avoid jitter.

---

## 13. Animated Icons (V2.2)

Package: `lucide-animated` (selectively imported)

| Icon | Trigger | Usage |
|------|---------|-------|
| `CloudUploadAnimated` | On file drop | ResumeDropzone success |
| `FileCheckAnimated` | On complete | Analysis complete toast |
| `CheckAnimated` | On success | Form submissions, confirmations |
| `SettingsAnimated` | On hover | Settings button (appbar) |

**Rules:**
- Only animate on meaningful state transitions, not idle states
- 1-2 animated icons per screen maximum
- Static fallback for `prefers-reduced-motion`

---

## 14. Modern Editorial Utilities (V2.2)

These utilities implement the "Modern Editorial" aesthetic: soft borders, rounded cards, confident typography.

| Utility | Usage |
|---------|-------|
| `.card-marketing` | Landing/marketing cards with `rounded-xl` and soft shadow |
| `.card-interactive` | Adds brand-tinted hover state to cards |
| `.text-label-mono` | `10px` uppercase monospace labels |
| `.text-hero-responsive` | Responsive hero headline (5xl → 7xl) |
| `.bg-surface-inverted` | Dark section backgrounds (testimonials) |

### Border Philosophy

V2.2 uses **soft slate borders** instead of black-at-opacity:
- Light mode: `border-border` → Slate-200 (#E2E8F0)
- Dark mode: `border-border` → Slate-700 (#334155)

This creates a warmer, more approachable feel while maintaining editorial authority through typography and content density.

---

*See also: `design-principles.md` for brand guidelines, `research-ui-contract.md` for research page rules, `diagram-visual-spec.md` for research diagram implementation.*
