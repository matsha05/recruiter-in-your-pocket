# Recruiter in Your Pocket — Brand Implementation Plan

Last updated: 2026-03-21
Owner: Product + Design
Status: Repo-grounded implementation priorities

This document translates the approved visual system into concrete repo actions.

## 1. Audit Summary

The repo has a strong foundation.
The problem is not the soul of the brand.
The problem is expression drift.

### Foundation Strengths

- Design philosophy is strong and specific.
- Copy doctrine is unusually good.
- Research remains a real moat.
- The recruiter-first wedge already exists in product architecture.

### Main Problems

1. Public surfaces still lean on editorial language and warm-paper atmosphere.
2. The hero distributes attention too evenly across too many proof systems.
3. Naming still drifts between `report`, `review`, `Studio`, and `workspace`.
4. Shared chrome carries too much boutique personality.
5. The color system is strong, but its live usage is warmer and softer than the new direction.

## 2. Source-Of-Truth Changes

### Update The Docs

Rewrite and keep aligned:
- `docs/brand-system.md`
- `docs/visual-direction.md`
- `docs/homepage-story-arc.md`
- `docs/brand-implementation-plan.md`
- `.impeccable.md`

These must all say the same thing:
- composed bold, not light editorial
- recruiter intelligence, not editorial wrapper
- clarity first
- visible but disciplined teal
- proof warmth only where context calls for it

## 3. Live Surface Priorities

### Priority 1: Shared Chrome

#### `web/components/layout/SiteHeader.tsx`

Change:
- remove `Editor's Desk` framing from comments and posture
- reduce equal-weight top-level navigation competition
- keep the primary CTA strong and direct
- make the chrome feel like product authority, not editorial wrapper

#### `web/components/landing/Footer.tsx`

Change:
- retire novelty pocket-note behavior as a primary brand move
- keep the footer calm, useful, and mature
- let personality come through phrasing and tone, not desk gimmicks

#### `web/lib/navigation.ts`

Change:
- subordinate secondary destinations
- keep `Research` visible
- reduce signals that RIYP is a broad ecosystem before the wedge is established

### Priority 2: Naming Cleanup

#### `web/components/workspace/WorkspaceHeader.tsx`

Change:
- `New Review` becomes `New Report`
- reduce `The Studio` as a dominant label
- make `report` the clearest public noun

### Priority 3: Homepage

#### `web/components/landing/landingConfig.ts`

Change:
- move `7.4 seconds` out of the hero headline and into proof
- make the hero copy more headline-led and mechanism-driven
- add explicit transformation content to the evidence system
- keep research as support, not the lead melody

#### `web/components/landing/sections/HeroSection.tsx`

Change:
- reduce competing above-the-fold proof clusters
- make the headline dominate
- convert hero proof into one narrow strip
- make the artifact a supporting glimpse rather than a co-headline

#### `web/components/landing/HeroReportArtifact.tsx`

Change:
- make the artifact feel more exact, less decorative
- emphasize verdict, friction, rewrite, and evidence in that order
- improve contrast, borders, and sequencing so it reads like a real product object

#### `web/components/landing/sections/EvidenceSection.tsx`

Change:
- turn this into the homepage’s transformation engine
- make the before/after moment obvious
- explain the mechanism without turning it into a feature grid

#### `web/components/landing/sections/ResearchSection.tsx`

Change:
- keep it supportive
- reduce editorial dominance
- present research as proof of the product, not parallel content strategy

#### `web/components/landing/sections/TrustSection.tsx`

Change:
- make trust feel matter-of-fact, not dramatic
- reduce testimonial dominance if it competes with control language
- keep the section reassuring, exact, and adult

### Priority 4: Tokens And Atmosphere

#### `web/app/globals.css`

Change:
- cool down the live neutrals
- introduce more explicit `Ink + Mineral` behavior
- keep teal visible but disciplined
- add a narrow brass premium note
- reserve paper tones for proof surfaces
- make landing sections feel more layered and exact, less warm by default

## 4. Naming Rules

Use:
- `report`
- `free report`
- `saved reports`
- `what a recruiter sees first`

Use carefully:
- `workspace`
- `studio`

Avoid as primary public nouns:
- `review`
- `analysis`
- `artifact`

## 5. Color And Atmosphere Rules

Core mode:
- cool neutrals
- quiet white
- teal emphasis
- no paper-led climate

Proof mode:
- paper support tone
- calmer editorial spacing
- evidence-forward accents

Premium mode:
- aged brass only where monetization or paid state is explicit

## 6. Typography Rules

- Serif is selective and decisive
- Sans does most of the work
- The hero gets its personality from typography and composition first
- Supporting copy stays highly readable
- Labels should feel evidentiary, not ornamental

## 7. Motion Rules

Use signature motion for:
- artifact reveal
- transformation moments
- scoring or weighting sequences

Avoid:
- ambient motion for its own sake
- flourishes that exist only to feel designed

## 8. Implementation Sequence

1. Align source-of-truth docs and `.impeccable.md`
2. Update global tokens and shared chrome
3. Rework hero and transformation sections
4. Rebalance research, trust, and pricing atmosphere
5. Run desktop and mobile visual QA

## 9. Acceptance Criteria

The implementation is correct when:
- the homepage is led by the headline, not by stats
- the transformation section is the most memorable proof moment after the hero
- trust feels calmer and more exact than the current version
- the site looks less editorial by default
- the palette feels cooler, sharper, and more branded without becoming louder
- raise the quality of interaction feedback in upload, report, and evidence areas
- remove motion that compensates for weak composition

## 9. What To Archive

Archive or de-emphasize patterns that push the brand in the wrong direction:

- overly warm editorial landing variants
- dramatic timer-first landing concepts
- playful or luxury-coded experiments
- variants that over-index on stats before the product object

Not because they are bad experiments.
Because a world-class brand needs convergence.

## 10. Suggested Rollout Sequence

### Phase 1: Canonicalize The Brand

Ship:
- `docs/brand-system.md`
- `docs/visual-direction.md`
- `docs/homepage-story-arc.md`
- this implementation plan

### Phase 2: Clean Shared Chrome

Change:
- header language
- footer personality
- public navigation emphasis
- app naming collisions

### Phase 3: Refine Homepage

Change:
- hero composition
- artifact dominance
- research support role
- trust sequencing
- visual temperature from top to bottom

### Phase 4: Refine Workspace And Report

Change:
- product density
- motion quality
- naming consistency
- evidence emphasis

### Phase 5: Rebuild Visual Baselines

After the direction stabilizes:
- regenerate screenshots
- re-audit accessibility and contrast
- lock the design language more tightly into runtime tokens and docs

## 11. Success Criteria

The brand direction is working when:

- the homepage feels singular instead of exploratory
- the workspace feels like an instrument, not a dashboard
- research feels like a proof layer, not the whole brand
- warm personality survives without whimsy
- `report` becomes the obvious noun everywhere
- the product feels more expensive, exact, and trustworthy without becoming colder
- shared chrome no longer communicates "editorial concept" before it communicates product confidence

## 12. Failure Conditions

The system is drifting if:

- public surfaces keep using "Editor's Desk" as an identity crutch
- warm paper remains the dominant atmosphere on every page
- `7.4 seconds` is still carrying the whole brand story
- product actions still say `review` while docs say `report`
- the strongest object on the homepage is not the report itself
