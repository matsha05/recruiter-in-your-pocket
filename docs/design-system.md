# Design System V2.1 — Technical Specifications

*Last Updated: Dec 16, 2025*

---

## 1. Typography

| Role | Font | Variable | Weight |
|---|---|---|---|
| **Display** | Fraunces | `var(--font-display)` | 400 (H1), 500 (H2+) |
| **Body** | Geist Sans | `var(--font-body)` | 400, 500 |
| **Mono** | Geist Mono | `var(--font-mono)` | 400 |

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

| Icon | Purpose |
|---|---|
| `PocketMark` | Brand mark (headers, favicon) |
| `Wordmark` | Path-based "pocket" wordmark |
| `PrincipalRecruiterIcon` | Recruiter persona |
| `SixSecondIcon` | "6 seconds" concept |
| `TransformArrowIcon` | Before/After rewrite |
| `EmptyReportIcon` | Empty states (reserved) |
| `InsightSparkleIcon` | AI insights, tips |

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
