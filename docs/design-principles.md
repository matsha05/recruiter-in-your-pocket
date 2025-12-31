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
- One signature moment per screen is required, everything else is restrained
- Teal brand accent (action)
- Gold for premium moments only
- Muted slate for UI chrome
- Shadows are subtle, not dramatic

### 5. The University Anti-Pattern
We are NOT a friendly university career center. We are a high-stakes partner.
- **Banned:** Flat vector illustrations, "Hi there!" voice, gamification badges.
- **Approved:** Data-driven visuals, precision microcopy, editorial tone.

### 6. Interaction Physics
| Type | Rule |
|---|---|
| Easing | `cubic-bezier(0.16, 1, 0.3, 1)`: snappy |
| Fast | `100ms` (micro) |
| Normal | `200ms` (UI) |
| Slow | `350ms` (reveals) |
| No bounce | No playful wobbles for structural UI |

Exception: Signature moments may use a single, low-amplitude overshoot spring. Only one per screen, tied to verdict, value, or conversion. Never use bounce on modals, sheets, navigation, or form controls.

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
| **SixSecondIcon** | `SixSecondIcon.tsx` | Timer Segment | Scanning state, InputPanel |
| **EmptyReportIcon** | `EmptyReportIcon.tsx` | Empty states | Reserved (text-first preferred) |
| **InsightSparkleIcon** | `InsightSparkleIcon.tsx` | North Star/Value | Pro Tip, Pricing, Coach notes |

#### Icon Design Rules
- All custom icons use `strokeWidth: 1.5` for consistency with Lucide utility icons
- ViewBox: `0 0 24 24` (standard)
- Fill: `none` (stroke-based)
- Custom icons support `className` and `size` props
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

### Article Tags (Category Pills)

| Content Type | Color | Example |
|--------------|-------|---------|
| **Research articles** | Neutral gray | `border-border bg-muted/50 text-muted-foreground` |
| **Guides/Playbooks** | Brand teal | `border-brand/20 bg-brand/10 text-brand` |

**Rules:**
- Always **UPPERCASE** with `tracking-widest`
- Font size: `text-[10px]`
- **Never use Gold** for content tags (reserved for unlock moments)

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

*V2.3 — Updated Dec 26, 2025 — Added flexibility for competitive features*
