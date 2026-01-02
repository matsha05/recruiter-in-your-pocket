# Research Diagram Visual Specification v2.0

> **Purpose**: Define the definitive visual DNA for all research diagrams—premium, modern, cohesive.
>
> **Perspective**: Written from the lens of Figma's top designer, world-class vibe coder, and AI/product design lead.
>
> This extends `research-ui-contract.md` with specific implementation patterns.

---

## The Vision

Our research diagrams should make people stop and say: *"Wait, did a team of elite engineers and designers actually build this for a side project?"*

We're competing visually with **Linear**, **Stripe**, **Vercel**, and **Figma** documentation. Our diagrams should feel like **product design artifacts**—not blog graphics, not PowerPoint exports, not wireframes.

---

## The RIYP Diagram DNA

| Trait | Description |
|-------|-------------|
| **Layered Composition** | Data overlays on contextual backgrounds—never flat boxes on white |
| **Intentional Motion** | Entrance animations that teach and delight, not decorate |
| **Premium Depth** | Soft shadows, gradients, blur that creates dimensionality |
| **Linear-Grade Chrome** | 10-12px corners, refined borders, glassmorphism accents |
| **Cohesive Color** | Teal brand emphasis, warm heatmap scales, neutral structure |
| **Dark Mode Native** | Every diagram must look stunning in both modes |

---

## Modern Design Principles Applied

| Trend | How We Apply It |
|-------|-----------------|
| **Immersive 3D** | Subtle depth through layering, shadows, perspective hints |
| **Motion Storytelling** | Animated paths that trace behavior, staggered reveals that build narrative |
| **Atmospheric Gradients** | Soft color transitions inside figures for sophistication |
| **Micro-interactions** | Hover states, pulse effects on interactive elements |
| **Content-Focused** | Data leads, design supports—never decoration for its own sake |

---

## Constraint Revisions

> **Goal**: Remove blockers while maintaining editorial integrity.

| Original Constraint | Revision |
|---------------------|----------|
| "No glassmorphism at page level" | ✓ **Glassmorphism allowed inside figures** for status badges, overlays |
| "Shadows: a single soft shadow" | ✓ **Multi-layer shadows allowed** when they create depth hierarchy |
| "Motion resolves to static" | ✓ **Subtle ambient motion allowed** (pulsing dots, not infinite shimmer) |
| "One signature moment per article" | ✓ **Up to 2 premium diagrams per article** can have signature animation |
| "Strokes: 1px or 1.5px" | ✓ **Variable stroke weights** (2-4px for emphasis paths, 1.5px for structure) |

### What Remains Unchanged

- No infinite loops or distraction-creating shimmer
- Motion must respect `prefers-reduced-motion`
- Premium/Gold color still reserved for product CTAs
- All claims require citations
- Figures must resolve to a readable state

---

## The Illustration Style Guide

### Core Principles

1. **Conceptual, Not Decorative** — Every visual encodes meaning
2. **Crafted, Not Clip-Art** — Custom-built in code, not stock assets
3. **Contextual Anchors** — Show data ON something (resume skeleton, device frame, document)
4. **Brand Color Discipline** — Teal for emphasis, neutrals for structure, heat scales for intensity

### Visual Attributes

| Attribute | Specification |
|-----------|---------------|
| **Line weight** | 1.5px structure, 3-4px emphasis paths |
| **Corner radius** | 10-12px (figure containers), 4px (internal elements) |
| **Gradients** | Allowed for fills, overlays, and animated paths |
| **Shadows** | Soft, layered: `shadow-2xl shadow-slate-200/50 dark:shadow-none` |
| **Blur** | Backdrop blur for glass overlays: `backdrop-blur-sm` |
| **Color ratio** | 85% neutral (slate/gray), 15% brand accent |

### What We Never Do

- Stock illustrations or generic icons as focal points
- Flat single-color boxes without depth
- Wireframe-quality layouts in production
- Labels without visual relationship to the data
- Animations without purpose

---

## Container Standards

### Premium Figure Wrapper

```tsx
<figure className="w-full max-w-[420px] mx-auto my-12 group select-none">
  <div className="relative w-full aspect-[1/1.4] bg-white dark:bg-card 
                  border border-border/40 rounded-xl overflow-hidden 
                  shadow-2xl shadow-slate-200/50 dark:shadow-none 
                  transition-all duration-500 hover:shadow-xl">
    {/* Layered content */}
  </div>
  <figcaption className="mt-4 space-y-1">
    <span className="block riyp-figure-kicker">Fig. N — Title</span>
    <span className="block text-sm text-foreground/80 font-medium">Description</span>
  </figcaption>
</figure>
```

### Standardized Widths

| Type | Max Width | Use Case |
|------|-----------|----------|
| Document overlay | `420px` | Heatmaps, scan patterns |
| Wide comparison | `520px` | Before/after, flows |
| Interactive calculator | `640px` | Sliders, inputs |

---

## Motion Grammar

### Required: Entrance Animation

Every diagram animates in on scroll:

```tsx
<motion.div
  initial={{ opacity: 0, y: 24 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
  viewport={{ once: true }}
>
```

### Motion Budget

| Animation | Duration | Use Case |
|-----------|----------|----------|
| Container entrance | 600-800ms | All diagrams |
| Staggered children | 100-150ms each | Multi-element diagrams |
| Path draw (SVG) | 2-3s | Flow lines, F-pattern |
| Heatmap fade | 1-1.5s | Intensity overlays |
| Pulse (ambient) | 2s infinite | Status dots (subtle only) |

---

## Visual Layers Architecture

Premium diagrams have 2-3 distinct layers:

```
┌─────────────────────────────────────┐
│  Layer 3: Chrome & Badges           │
│  (status indicators, labels)        │
├─────────────────────────────────────┤
│  Layer 2: Data Overlay              │
│  (heatmap, paths, highlights)       │
├─────────────────────────────────────┤
│  Layer 1: Contextual Background     │
│  (resume skeleton, document shape)  │
└─────────────────────────────────────┘
```

---

## Diagram Archetypes

### Type A: Document Overlay
*Heatmaps, scan patterns, attention flows*

Requirements: Resume skeleton as base, animated data overlay, status badge.

### Type B: Comparison Flow
*Before/after, LinkedIn vs Resume*

Requirements: Two distinct zones, connecting element, staggered animation.

### Type C: Funnel/Stack
*Conversion rates, hierarchies*

Requirements: Layered elements with depth, animated build-up on scroll.

### Type D: Calculator/Interactive
*Personalized data tools*

Requirements: Smooth input controls, animated output visualization.

### Type E: Framework/Process
*STAR method, stages, pipelines*

Requirements: Connected cards/steps, flow arrows, staggered reveal.

---

## Quality Checklist

Before shipping any diagram:

- [ ] Uses `framer-motion` entrance animation
- [ ] Has visible depth (shadow OR gradient OR layering)
- [ ] Includes proper `figcaption` with number and title
- [ ] Stunning in both light and dark mode
- [ ] Fits standardized max-width for type
- [ ] Status badge if interactive/animated
- [ ] Motion resolves to readable state
- [ ] Would pass the "would Linear ship this?" test

---

*v2.0 — Jan 2026*
