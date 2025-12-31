# Design System V2.1 — Technical Specifications

> [!NOTE]
> This is the **technical implementation reference**. For design decisions, see [design-philosophy.md](./design-philosophy.md) (source of truth) and [design-principles.md](./design-principles.md) (patterns & rules).

*Last Updated: Dec 19, 2025*

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

| Token | Value |
|---|---|
| `--radius` | `4px` |
| `--radius-sm` | `2px` |
| `--radius-lg` | `8px` |
| `shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.04)` |

---

## 4. Motion

| Token | Value |
|---|---|
| `--ease` | `cubic-bezier(0.16, 1, 0.3, 1)` |
| `--duration-fast` | `100ms` |
| `--duration-normal` | `200ms` |
| `--duration-slow` | `350ms` |

**Animatable properties:** `opacity`, `transform`, `background-color` only.
**Reduced motion:** Respects `prefers-reduced-motion` globally.

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

*See also: `design-principles.md` for brand guidelines, `research-ui-contract.md` for diagram specs.*
