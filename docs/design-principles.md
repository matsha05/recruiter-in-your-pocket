# Recruiter in Your Pocket — Design Constitution V2.1
**Fraunces Authority. Teal Expertise. Honest Clarity.**

> [!NOTE]
> This document is the **implementation spec** for [design-philosophy.md](./design-philosophy.md), which is the canonical source of truth for *why* we make design decisions. This doc covers *how* to implement them.

---

## The Constitution

We are building a product that feels acquisition-worthy by elite teams (OpenAI, Notion, Stripe, Linear, Figma). This requires strict adherence to the following constitution.

### 1. Elite Flavor: The "Un-SaaS"
Avoid "marketing-site energy" (illustrations, cheerful mascots, bouncy animations).
Embrace "Studio energy" (Stripe, Linear, Notion).
- **Vibe:** Serious, premium, capable.
- **Visuals:** Depth through borders and spacing, not shadows.
- **Restraint:** Only use color for meaning.
- **Patterns:** Use proven UX patterns when they increase clarity, conversion, or growth. Style them with RIYP typography, density, and tone.

### 2. Typography Creates Authority
| Role | Font | Usage |
|---|---|---|
| **Display** | **Fraunces** (400 H1, 500 H2+) | Verdicts, headlines, scores |
| **Interface** | **Geist Sans** | Controls, body, labels |
| **Data** | **Geist Mono** | Metrics, captions |

### 3. Color Creates Meaning
| Token | Color | Usage |
|---|---|---|
| `--brand` | **Teal-600** (`#0D9488`) | Primary CTA, Score highlight, key data |
| `--accent` | Slate-700 (`#334155`) | UI chrome, secondary buttons |
| `--premium` | Amber-600 (`#D97706`) | Gold unlock moments ONLY (positive: upgrades, best value, premium features) |
| `--amber` | Amber-500 (`#F59E0B`) | Caution/warning callouts (Critical Miss, gaps, attention needed) |
| `--success` | Green-700 | Positive states |
| `--warning` | Yellow-600 | Form validation, soft warnings |
| `--error` | Rose-700 | Critical failures |

### 4. Quiet Power
Calm by default, decisive in the one moment that matters. 90 percent quiet, 10 percent dramatic, always tied to verdict, value, or conversion.
- Light editorial base by default, dark mode is fully supported
- Warm paper texture allowed only on marketing surfaces and kept subtle
- One signature moment per screen is preferred, not required. Utility screens can have none. Never more than one per screen.
- Teal brand accent (action)
- Gold for premium moments only
- Muted slate for UI chrome
- Shadows are subtle, not dramatic

### 5. Crafted Modernity
We are premium and intentional, not templated. This is where we allow advanced craft.
- Composition can be bold. Asymmetry and editorial layout are welcome when they improve clarity.
- Use modern techniques with restraint: variable font axes, layered grids, bespoke data viz, and micro-interaction choreography.
- Surprise comes from clarity and craft, not theatrics. No gimmicks, no mascots, no confetti.
- Consistency comes from type, tokens, spacing, and voice. Layout can vary.
- If a screen feels generic, change the structure first, not the decoration.

### 6. The University Anti-Pattern
We are NOT a friendly university career center. We are a high-stakes partner.
- **Banned:** Flat vector illustrations, "Hi there!" voice, gamification badges.
- **Approved:** Data-driven visuals, precision microcopy, editorial tone.

### 7. Interaction Grammar

Every component maps to one of 6 canonical interaction verbs. This creates a cohesive "language" across the app.

| Verb | Motion | States | RIYP Examples |
|------|--------|--------|---------------|
| **Reveal** | 320ms reveal | hidden → visible | Section expand, score dial animation |
| **Select** | 140ms select | default → selected | List row, checkbox, radio |
| **Commit** | 80ms press → 200ms swap | idle → pending → done | Apply rewrite, save job, mark addressed |
| **Navigate** | 200ms swap | current → next | Tab switch, route change |
| **Preview** | 320ms in / 140ms out | closed → peek | Evidence trace, Recruiter Lens definitions |
| **Reorder** | 200ms swap | idle → dragging → dropped | Action plan items |

If a component can't be described with these verbs, it's probably unnecessary chrome.

### 8. Interaction Physics

| Type | Rule |
|---|---|
| Easing | `cubic-bezier(0.16, 1, 0.3, 1)`: snappy |
| Press | `80ms` — input acknowledgement |
| Hover | `90ms in / 160ms out` — asymmetric for calm |
| Select | `140ms` — selection highlight |
| Swap | `200ms` — tabs, accordions, content changes |
| Reveal | `320ms` — panels, section reveals |
| Hero | `420ms` — verdict only (signature moment) |
| No bounce | No playful wobbles for structural UI |

Exception: Signature moments may use a single, low-amplitude overshoot spring. Only one per screen, tied to verdict, value, or conversion. Never use bounce on modals, sheets, navigation, or form controls.

### 9. Layer Model

Every overlay belongs to exactly one layer type with consistent behavior.

| Layer | Focus | Dismiss | Scroll | Examples |
|-------|-------|---------|--------|----------|
| **Tooltip** | None | Auto on mouse leave | Closes | Hint text, abbreviation definitions |
| **Popover** | Trapped | Outside click, Esc | Blocks | Dropdown menus, color pickers |
| **Peek** | None | Outside click, Esc | Preserves page | Evidence panel, Recruiter Lens |
| **Sheet/Modal** | Trapped | Outside click (optional), Esc | Blocks | Settings, upload, confirmation |
| **Critical** | Trapped | Explicit action only | Blocks | Delete confirm, cancel subscription |

**Rules:**
- Esc always closes topmost layer
- Focus always returns to invoker on close
- Single portal root for z-index management

### 10. The 12-State Rule

Every interactive component must define these states. Missing states = perceived cheapness.

| # | State | Required For |
|---|-------|--------------|
| 1 | `default` | All |
| 2 | `hover` | All |
| 3 | `active` (pressed) | All |
| 4 | `focus-visible` | All |
| 5 | `disabled` | All |
| 6 | `loading` | Buttons, forms |
| 7 | `selected` | Lists, toggles, checkboxes |
| 8 | `selected+hover` | Selectable elements |
| 9 | `selected+focus` | Selectable elements |
| 10 | `error` | Inputs, forms |
| 11 | `read-only` | Inputs |
| 12 | `pending` | Optimistic UI (before server confirms) |

**Component Finish Pass Gate:** No component ships without states 1-6 defined. States 7-12 as applicable.

### 11. Craft Laws

These patterns separate 9/10 from 10/10. They are what makes users say "this feels expensive."

#### Motion Presets (RIYP Craft Library)

**Easing Curves:**
```ts
export const ease = {
  snappy:   [0.16, 1, 0.3, 1],    // Default (current)
  micro:    [0.2, 0.9, 0.2, 1],   // Ultra fast micro feedback
  outCubic: [0.33, 1, 0.68, 1],   // Crisp out for panels/peeks
  inOut:    [0.65, 0, 0.35, 1],   // Calm for layout shifts
};

export const dur = {
  micro:  90,   // hover + press feedback
  fast:   140,  // selection highlight, small toggles
  normal: 200,  // tabs, accordions, list expansion
  reveal: 320,  // section reveals, peek panel open
  hero:   420,  // verdict reveal only (signature moment)
};
```

**Spring Physics (signature moments only):**
```ts
export const spring = {
  verdict: { type: "spring", stiffness: 520, damping: 48, mass: 0.9 },
  snap:    { type: "spring", stiffness: 700, damping: 55, mass: 0.7 },
};
```

#### Latency Staging Contract

All interactions follow a staged timing model. Never animate more than 2 layers at once.

| Stage | Timing | Purpose |
|-------|--------|---------|
| **Layer 1: Confirm** | 0-90ms | Input registered (pressed/selected state) |
| **Layer 2: Content** | 140-200ms | Swap, expand, collapse |
| **Layer 3: Detail** | 280-320ms | Secondary text, helper, metadata |

**Rule:** Never make the user wait to see that the click "worked."

#### Peek Panel (Arc Pattern)

Non-destructive overlay for evidence, citations, definitions. Opens anchored to clicked element.

**Behavior:**
- Dismiss: click outside, Esc
- No global page dim unless destructive action
- Never steals scroll position

**Motion:**
```ts
const peekVariants = {
  initial: { opacity: 0, scale: 0.985, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit:    { opacity: 0, scale: 0.99, y: 4 },
};
// Entry: 320ms ease.snappy | Exit: 140ms ease.outCubic
```

**Layout:** Max 420px desktop, 100vw bottom sheet mobile. Border: 1px var(--border). Shadow: `0 10px 30px rgba(0,0,0,0.08)`.

#### Command Palette (Cmd+K)

Central command surface for pro users. This is the highest-leverage craft pattern.

- Opens with Cmd+K globally
- Shows: action name, description (optional), shortcut hint (Geist Mono 11px)
- Supports: section jumps, quick actions, recent commands
- Context-aware: actions change based on current surface

**Minimum scope:**
- "Run 6-second scan"
- "Jump to: Red Pen"
- "Toggle: show only critical misses"
- "Export: ATS version"

#### Submenu Safe Area (Linear Pattern)

Nested menus must include a triangular "safe zone" so cursor movement from parent to child doesn't accidentally close the menu.

**Parameters:**
- Sample rate: 16ms
- Close delay: 250ms
- Max buffer: 5 mouse positions

#### Three-State List Selection (Raycast Pattern)

Every list row has 3 distinct states. Hover timing is asymmetric (slower out = calm).

| State | Visual | Timing |
|-------|--------|--------|
| **Hover** | `bg-muted/40` | In: 90ms, Out: 140ms |
| **Active (keyboard)** | `bg-muted/60` + 2px left brand hairline | 90ms |
| **Pressed** | `bg-muted/70` (no scale) | 90ms |

#### Optimistic UI + Undo (Superhuman Pattern)

For actions like "Apply rewrite":
1. Immediately apply visually
2. Show inline "Applied" state
3. On failure: rollback with inline error + Undo option

#### Pixel-Jitter Audit

No element should move on hover except opacity and background. No reflow on load. Skeletons must match final layout exactly.

#### Bottom Action Rail (Raycast Pattern)

Persistent bar at bottom of report pages:
- Left: current section name (dense)
- Center: "Cmd+K" shortcut hint
- Right: primary next action ("Apply fixes," "Export")
- Toasts appear inside this bar, not floating

---

## Visual Language

### Radius
- **Default:** `4px` everywhere
- **Small (badges):** `2px`
- **Large (modals):** `8px`

### Shadows
- **Only:** `shadow-sm` (`0 1px 2px 0 rgb(0 0 0 / 0.04)`)
- **No heavy shadows.** Depth via borders and background contrast.

### Iconography

**The Problem:** Lucide is npm install-able by anyone. Every YC startup, every indie SaaS, every bootstrapped product uses Lucide. Stock icons are the design equivalent of system fonts—functional, but they scream "template."

**The Standard:** Elite products (OpenAI, Notion, Stripe, Linear) use stock icons for **utility chrome only** and invest in **custom glyphs for signature moments**.

#### Utility Icons (Lucide OK)
- Navigation: Home, Settings, Menu, ChevronDown
- Actions: Plus, Edit, Trash, Download, Send
- Feedback: Check, X, AlertCircle, Loader
- **Rules:** `strokeWidth: 1.5`, outline only, never filled

#### Custom Signature Icons (IMPLEMENTED)
Location: `/web/components/icons/`

| Icon | File | Purpose | Usage |
|------|------|---------|-------|
| **PocketMark** | `PocketMark.tsx` | Brand mark | Headers, Favicon |
| **Wordmark** | `Wordmark.tsx` | Path-based "pocket" wordmark | Brand applications |
| **PrincipalRecruiterIcon** | `PrincipalRecruiterIcon.tsx` | Authority/Expert Profile | 01. First Impression header |
| **SignalRadarIcon** | `SignalRadarIcon.tsx` | Data Visualization | 02. Signal Analysis header |
| **TransformArrowIcon** | `TransformArrowIcon.tsx` | Editorial Quill | 03. The Red Pen header |
| **HiddenGemIcon** | `HiddenGemIcon.tsx` | Discovery/Treasure | 04. Missing Wins header |
| **RoleTargetIcon** | `RoleTargetIcon.tsx` | Role Fit Target | 05. Where You Compete header |
| **SixSecondIcon** | `SixSecondIcon.tsx` | Timer Segment | Scanning state, InputPanel |
| **EmptyReportIcon** | `EmptyReportIcon.tsx` | Empty states | Reserved (text-first preferred) |
| **InsightSparkleIcon** | `InsightSparkleIcon.tsx` | North Star/Value | Pro Tip, Pricing, Coach notes |

#### Icon Design Rules
- All custom icons use `strokeWidth: 1.5` for consistency with Lucide utility icons
- ViewBox: `0 0 24 24` (standard)
- Fill: `none` (stroke-based)
- Custom icons support `className` and `size` props
- Signature moments use custom icons. Do not use Lucide in report headers or TOCs.
- **Never use** Lucide `Sparkles` — use `InsightSparkleIcon` instead
- **Never use** generic User/Eye icons for recruiter persona — use `PrincipalRecruiterIcon`

#### Report Section Header Format
All report sections use identical chrome:
```
[Icon w-4 text-brand] [Number]. [Title]    [Optional Badge]
```

```tsx
<h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
    <SignalRadarIcon className="w-4 h-4 text-brand" />
    02. Signal Analysis
</h2>
```

#### Icon Color Standards
| Context | Token |
|---------|-------|
| Section header icons | `text-brand` (Teal) |
| Premium/Upgrade CTAs | `text-premium` (Gold) |
| Muted/Disabled | `text-muted-foreground` |

### Navigation Patterns

| Context | Pattern | Example |
|---------|---------|---------|
| **Back to parent** | `<ArrowLeft>` icon + text | `<ArrowLeft className="w-4 h-4" /> Back to Home` |
| **Mobile header** | Icon button only | `<ArrowLeft className="w-5 h-5" />` |
| **Modal dismiss** | X icon, top-right | Lucide `X` |

**Rules:**
- Always use Lucide `ArrowLeft`, never text arrows (`←`)
- Text follows icon with `gap-2` spacing
- **Sentence case** (not uppercase)
- Color: `text-muted-foreground hover:text-foreground`
- Exception: Research hub and research articles use a text-only back label to preserve editorial tone. Follow `docs/research-ui-contract.md`.

### Article Tags (Category Pills)

| Content Type | Color | Example |
|--------------|-------|---------|
| **Research articles** | Neutral gray | `border-border bg-muted/50 text-muted-foreground` |
| **Guides/Playbooks** | Brand teal | `border-brand/20 bg-brand/10 text-brand` |

**Rules:**
- Always **UPPERCASE** with `tracking-widest`
- Font size: `text-[10px]`
- **Never use Gold** for content tags (reserved for unlock moments)

> **Note:** Guides use a different layout than Research (full-width, no sidebar). See `diagram-visual-spec.md` § "Guide-Specific Patterns".

---

## Report Section Patterns

### Subscore Color Thresholds
Signal Analysis subscores use semantic colors based on score value:

| Score Range | Token | Meaning |
|-------------|-------|---------|
| **85+** | `text-success` (Green) | Strong signal |
| **70–84** | `text-premium` (Gold) | Solid foundation |
| **<70** | `text-destructive` (Red) | Needs work |

**Implementation:** Color applies to numbers only, not backgrounds. Cards remain neutral (`bg-secondary/20`).

### Subscore Hierarchy
**Story is the most important subscore.** Order: Story → Impact → Clarity → Readability.

The methodology tooltip explains:
- **Story** — "What narrative are you telling? This is the most important signal."
- **Impact, Clarity, Readability** — "Supporting dimensions that strengthen your story."

### List Hierarchy (Working/Missing)
- All items have **equal visual weight** (`text-muted-foreground`)
- No colored backgrounds on list items
- Headers: "Working" (neutral), "Missing" (gold text)

### The Red Pen Pattern
- **Hero rewrite:** Interactive tap-to-reveal, clean white card
- **Body font only** — no monospace for rewrites (jarring)
- **Collapsed list:** Show 2 rewrites by default, "Show X more" to expand
- **Coaching notes:** Inline text, not separate boxes

### Report Footer CTA States

| Context | CTA | Button Color |
|---------|-----|--------------|
| **Sample report** | "That's the full picture." → **Run Your Free Report →** | `bg-brand` (Teal) |
| **Real report, has credits** | "That's the full picture." → **+ Run Another** | `bg-brand` (Teal) |
| **Real report, exhausted** | "You've used your free reports." → **✨ Unlock Unlimited** | `bg-premium` (Gold) |

---

## Evidence and Citations

We do not assert facts without a source.
- Factual or research claims require a citation marker and a source entry.
- Recruiter judgment and heuristics must be labeled as such, not disguised as research.
- Use the citation pattern in `docs/design-system.md`. Avoid badges and decorative chips.
- Source quality follows `docs/source-quality.md` for research content and should be Tier 1 or Tier 2 for product copy.

---

## Messaging: "See What They See"

**One-Liner:** `See what they see.`
**Hero:** `In 7.4 seconds, a recruiter has already decided. This is what they saw.`
**Tone:** Confident expert, not cheerful coach.

---

## Bending the Rules

> [!IMPORTANT]
> **Design principles are guidelines, not prison.** They exist to prevent accidental drift into low-quality patterns, not to block competitive features.
> If a rule blocks clarity, conversion, or growth, bend it and document the reason in the change description.

### When to Bend
- **Competitive necessity:** If Teal, Jobscan, or Resume Worded have a feature that users expect, we may need to add it even if it doesn't perfectly fit our aesthetic.
- **Acquisition readiness:** If a feature increases our value to potential acquirers (analytics, dashboards, data exports), we build it.
- **User demand:** If 3+ users request the same thing post-launch, we seriously consider it.
- **Clarity or conversion:** If it makes the next action obvious or materially improves activation, we bend.

### When NOT to Bend
- **Never sacrifice quality:** A bent rule still needs premium execution. No half-baked features.
- **Never lose identity:** We remain the "Recruiter Lens" expert, not a generic job-search OS.
- **Never copy blindly:** Competitors have features we won't build (auto-apply, job boards) because they're not our wedge.

### The Litmus Test
Before bending a rule, ask:
1. Does this make us **more competitive** in our category?
2. Does this make us **more acquisition-ready**?
3. Does this improve **clarity or conversion** for the target user?
4. Can we execute this **at our quality bar**?

If all four are YES, bend the rule.

---

## Defaults (Not Absolutes)

The following are **defaults**, not hard bans. Bend with justification:

| Default | When to Bend |
|:---|:---|
| "Reports by default, dashboards when they prove progress" | If a dashboard increases retention, clarity, or trust |
| "No gamification" | If tasteful progress visualization (not badges/confetti) improves UX |
| "No social features" | If shareable report links or referrals drive growth |

---

## Allowed Patterns (Non-Exhaustive)

These are allowed when they improve clarity or conversion and are styled with RIYP density and tone. Research pages still follow `docs/research-ui-contract.md`.

| Pattern | Purpose | Constraints |
|:---|:---|:---|
| Primary and secondary CTAs | Action hierarchy | One primary per view, no gimmick copy |
| Pricing cards | Decision clarity | One highlighted tier, no visual noise |
| Modals and sheets | Focused tasks | Tight motion, no bounce on entry |
| Tabs and segmented controls | Mode switching | 3-5 options max, clear labels |
| Tables and lists | History and tracking | Dense, scannable, no decorative chrome |
| Cards as containers | Group related content | Border and spacing only, no heavy shadow |
| Filters and chips | Scoping and search | Factual labels, no playful badges |
| Progress indicators | Show real state | Only real progress, no fake momentum |
| Empty states | Onboarding clarity | Text-first, single CTA |
| Toasts and inline alerts | Error and success feedback | Actionable, honest, no fluff |
| Dashboards | Progress and trust | Only when they prove improvement over time |

---

## Accessibility (Required)

- Text contrast meets WCAG 2.1 AA. Do not rely on color alone to convey meaning.
- Every interactive element is keyboard accessible and has a visible focus state.
- Respect `prefers-reduced-motion` and avoid continuous motion or parallax.
- Touch targets are at least 44px.
- Errors are explicit, actionable, and do not disappear on blur.

---

*V2.3 — Updated Dec 26, 2025 — Added flexibility for competitive features*
