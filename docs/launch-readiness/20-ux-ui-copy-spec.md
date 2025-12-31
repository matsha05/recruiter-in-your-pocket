# A3: UX, UI, and Copy Spec

**Agent:** A3 UX, UI, and Copy Lead  
**Date:** 2025-12-28  
**Purpose:** Specify premium product experience at polished bar

---

## 1. End-to-End Flow Specs

### 1.1 Primary Flow: Resume Review

```
Landing → Upload/Paste → Analysis (Loading) → Report → Paywall → Post-Purchase
```

#### State: Default (Landing)
| Element | Specification |
|:--------|:--------------|
| Hero | "See what recruiters see in 7.4 seconds" |
| Subhead | "Real feedback from a principal recruiter's perspective. No subscription. Pay when you need it." |
| CTA | "Get Your Free Review" (primary button) |
| Trust badges | 3-5 proof points visible above fold |

#### State: Input (Upload/Paste)
| Element | Specification |
|:--------|:--------------|
| Primary action | Text paste area (default visible) |
| Secondary action | PDF upload button |
| Helper text | "Paste your resume text or upload a PDF. We analyze the content, not the formatting." |
| Privacy reassurance | "Your resume text is processed and deleted immediately. Analysis results are saved if you create an account." |

#### State: Loading (Analysis)
| Element | Specification |
|:--------|:--------------|
| Progress indicator | Animated ring with stage labels |
| Stage messages | "Reading your resume...", "Analyzing from recruiter perspective...", "Identifying top fixes..." |
| Duration | 8-15 seconds typical |

#### State: Success (Report)
| Element | Specification |
|:--------|:--------------|
| Score dial | Large, centered, animated reveal |
| Score label | Band label below score (e.g., "Strong Foundation") |
| Score comment | 2-3 sentence explanation |
| Top Fixes | 3-5 prioritized actions with impact/effort labels |
| Sections | Summary → Strengths → Gaps → Rewrites → Next Steps |

#### State: Error
| Element | Specification |
|:--------|:--------------|
| Message | "We had trouble analyzing this resume. Try pasting the text directly or uploading a different file." |
| Action | "Try Again" button |
| Fallback | Contact support link |

#### State: Empty (No Input)
| Element | Specification |
|:--------|:--------------|
| CTA | "Paste your resume to get started" |
| Sample | Link to sample report (visible) |

#### State: Edge Cases
| Case | Handling |
|:-----|:---------|
| Very short resume (<100 words) | Warning: "This looks short. Make sure you've pasted the full resume." |
| Very long resume (>3000 words) | Accept but note: "This is longer than typical. We'll focus on the most impactful sections." |
| Non-resume content | Error: "This doesn't look like a resume. Try pasting professional experience content." |

---

## 2. Trust Moments

| Moment | Location | Implementation |
|:-------|:---------|:---------------|
| **Before upload** | Input panel | Privacy badge: "Resume text deleted after analysis. Results saved only if you have an account." |
| **During analysis** | Loading state | "Analyzing from recruiter perspective..." shows expertise |
| **Score reveal** | Report header | Subscore breakdown shows methodology |
| **Top fixes** | Report body | Impact/effort labels show thoughtfulness |
| **Pre-paywall** | After free value | "You've seen the full analysis. Pay to track improvements over time." |
| **Post-purchase** | Unlock moment | "You now have [X] reviews. Use them whenever you need." |

---

## 3. UI Hierarchy Rules

### Typography Scale
| Level | Use | Size | Weight |
|:------|:----|:-----|:-------|
| H1 | Page titles | 2.5rem | 700 |
| H2 | Section headers | 1.75rem | 600 |
| H3 | Subsection headers | 1.25rem | 600 |
| Body | Main content | 1rem | 400 |
| Small | Helper text, captions | 0.875rem | 400 |

### Spacing System
| Token | Value | Use |
|:------|:------|:----|
| `space-xs` | 0.25rem | Tight internal padding |
| `space-sm` | 0.5rem | Related elements |
| `space-md` | 1rem | Default padding |
| `space-lg` | 1.5rem | Section separation |
| `space-xl` | 2.5rem | Major section breaks |

### Density Rules
- **Desktop:** 3-column max, generous whitespace
- **Tablet:** 2-column, reduced margins
- **Mobile:** Single column, full-width cards

### Layout Constraints
- Max content width: 1200px
- Max text column: 65ch (for readability)
- Min tap target: 44x44px (mobile)

---

## 4. Component Inventory

### Existing Components (Verified)
| Component | Location | Status |
|:----------|:---------|:-------|
| ScoreDial | components/workspace/report/ | ✅ |
| TopFixes | components/workspace/report/ | ✅ |
| Rewrites | components/workspace/report/ | ✅ |
| PaywallModal | components/workspace/ | ✅ |
| HistorySidebar | components/workspace/ | ✅ |
| VersionComparison | components/workspace/ | ✅ |
| Pricing | components/landing/ | ✅ |
| Testimonials | components/landing/ | ✅ |

### New Components Needed
| Component | Purpose | Priority |
|:----------|:--------|:---------|
| ConfidenceBadge | Show High/Medium/Low confidence on fixes | **P0** |
| EvidenceTooltip | Show resume quote supporting fix | **P1** |
| ProgressBar | Resume health progress tracker | P3 |
| WarmReturnBanner | Welcome back message for returning users | P3 |

### ConfidenceBadge Acceptance Criteria (P0)

| Criterion | Requirement |
|:----------|:------------|
| Visual | ● High (green), ○ Medium (amber), △ Low (gray) |
| Tooltip | Explains meaning on hover: "Strong evidence" / "Some context missing" / "Limited evidence" |
| Medium behavior | Includes prompt: "Add scope: team size, revenue, users, latency, etc." |
| Low behavior | Uses hedged language: "If applicable..." or "Consider..." |

### EvidenceTooltip Acceptance Criteria (P1)

| Criterion | Requirement |
|:----------|:------------|
| Default | 1-line excerpt with truncation + highlight |
| Expanded | Click expands to popover with full excerpt |
| Section label | Shows source: "From: Summary" / "From: Experience" / "From: Skills" |
| No evidence | Falls back gracefully: "Based on overall resume structure" |

---

## 5. Accessibility Baseline

| Requirement | Standard | Implementation |
|:------------|:---------|:---------------|
| Keyboard navigation | Full tab order | All interactive elements focusable |
| Focus indicators | Visible ring | `focus-visible` outline on all buttons |
| Color contrast | WCAG AA (4.5:1) | Verified in design system |
| Screen reader | Semantic HTML | Proper heading hierarchy, ARIA labels |
| Motion | Reduced motion | `prefers-reduced-motion` respected |

---

## 6. Premium Cues Checklist

| Cue | Current Status | Enhancement |
|:----|:---------------|:------------|
| Smooth animations | ✅ Present | Consider micro-interactions on score reveal |
| Consistent typography | ✅ Present | — |
| Generous whitespace | ✅ Present | — |
| Thoughtful loading states | ✅ Present | Add personality to stage messages |
| Error messages with character | ⚪ Basic | Rewrite in brand voice |
| Transitions between states | ✅ Present | — |
| Score dial animation | ✅ Present | — |
| Copy-to-clipboard | ✅ Present | — |

---

## 7. Signature Moment: SM1 Evidence-Backed Recruiter Lens

### Chosen Signature Moment: SM1

**What:** A crisp "Top 3 Fixes" summary where each fix:
1. Cites exact resume evidence ("Your summary says...")
2. Includes confidence indicator (High/Medium)
3. Explains impact in one sentence

### UI States

#### Default State
```
┌─────────────────────────────────────────────────────┐
│ Top 3 Fixes                                    [?]  │
├─────────────────────────────────────────────────────┤
│ 1. Add scope to your lead bullet         ● High    │
│    "Managed team" → how many people?               │
│    Impact: Recruiters see scale instantly          │
│                                           [Copy]   │
├─────────────────────────────────────────────────────┤
│ 2. Quantify your top achievement         ● High    │
│    "Improved performance" → by how much?           │
│    Impact: Numbers stand out in 7.4-second scan │
│                                           [Copy]   │
├─────────────────────────────────────────────────────┤
│ 3. Clarify your current role level       ○ Medium  │
│    Role title suggests senior, bullets don't       │
│    Impact: Reduces confusion about seniority       │
│                                           [Copy]   │
└─────────────────────────────────────────────────────┘
```

#### Loading State
```
┌─────────────────────────────────────────────────────┐
│ Top 3 Fixes                                         │
├─────────────────────────────────────────────────────┤
│ ████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│ Identifying highest-impact improvements...          │
└─────────────────────────────────────────────────────┘
```

#### Error State
```
┌─────────────────────────────────────────────────────┐
│ Top 3 Fixes                                         │
├─────────────────────────────────────────────────────┤
│ We couldn't identify specific fixes for this        │
│ resume. The content may be too short or unclear.   │
│                                                     │
│ [Try uploading a more complete version]            │
└─────────────────────────────────────────────────────┘
```

### Copy for Signature Moment

| Element | Copy |
|:--------|:-----|
| Section header | "Top 3 Fixes" |
| Confidence High | ● High |
| Confidence Medium | ○ Medium |
| Evidence format | "[Your resume says] '...' → [what's missing]" |
| Impact format | "Impact: [one sentence benefit]" |
| Helper tooltip | "We're confident about fixes marked High. Medium fixes depend on your specific situation." |

---

## 8. Copy Pack

### Landing Page

**Hero:**
> See what recruiters see in 7.4 seconds

**Subhead:**
> Real feedback from a principal recruiter's perspective. No subscription. Pay when you need it.

**CTA:**
> Get Your Free Review

**3 Bullets:**
1. "Recruiter-grade analysis, not ATS keyword stuffing"
2. "Specific fixes, not generic advice"
3. "Pay $9 once. No subscription. Credits never expire."

---

### Upload/Input

**Placeholder:**
> Paste your resume text here...

**Helper text:**
> Make sure to include your full work experience. We analyze content, not formatting.

**PDF upload:**
> Or upload a PDF

---

### Loading/Progress

| Stage | Message |
|:------|:--------|
| 1 | "Reading your resume..." |
| 2 | "Analyzing from recruiter perspective..." |
| 3 | "Identifying what stands out in 7.4 seconds..." |
| 4 | "Prioritizing your top fixes..." |

---

### Report Sections

| Section | Header | Helper |
|:--------|:-------|:-------|
| Score | "Your Resume Score" | "Based on how a recruiter would read this in 7.4 seconds" |
| Summary | "What Recruiters See" | "The story your resume tells at first glance" |
| Strengths | "What's Working" | "These elements are already strong" |
| Gaps | "What's Getting in the Way" | "These patterns are reducing clarity" |
| Top Fixes | "Top 3 Fixes" | "Start here—these have the biggest impact" |
| Rewrites | "Red Pen Rewrites" | "Before and after suggestions" |
| Next Steps | "Your Action Plan" | "Complete these in your next focused session" |

---

### Paywall

**Header:**
> You've seen the full analysis.

**Body:**
> Pay once to unlock version tracking, score history, and additional reviews. No subscription—credits never expire.

**Plan names:**
| Tier | Name | Price |
|:-----|:-----|:------|
| Single | One Review | $9 |
| Pack | 5 Reviews | $29 |

**CTA:**
> Unlock [Plan Name]

---

### Error Messages

| Error | Message |
|:------|:--------|
| Empty input | "Paste your resume so I can review it." |
| Too short | "This looks short. Make sure you've pasted the full resume." |
| Parse failure | "I couldn't read this file. Try pasting the text directly." |
| Server error | "Something went wrong on our end. Try again in a moment." |
| Rate limit | "You're moving fast! Give me a moment and try again." |

---

### Post-Purchase

**Unlock banner:**
> You now have [X] reviews. Use them whenever you need.

**Toast:**
> Review unlocked! Your credits never expire.

---

### Trust and Privacy

**Privacy badge (input panel):**
> Resume text deleted after analysis. Results saved only with account.

**Privacy badge (landing footer):**
> Encrypted • Deleted after analysis • Never trains AI

**Methodology link:**
> How we analyze resumes →

**Trust statement:**
> "Recruiter-grade analysis backed by a calibrated scoring system"

> **Note:** All privacy copy must align with the [Data Handling Truth Table in spec-freeze-v1.md](file:///Users/matsha05/Desktop/dev/recruiter-in-your-pocket/docs/launch-readiness/spec-freeze-v1.md). Do not claim "never stored" unless literally true.

---

## 9. RIYP UI/UX Polish Checklist (Acceptance Criteria)

This is the authoritative checklist for UI/UX polish. All items must pass acceptance criteria before launch.

---

### 1. Landing Hero Clarity (10-Second Test)

| Criterion | Acceptance |
|:----------|:-----------|
| Above fold visibility | On desktop, hero + subhead + primary CTA + 3 proof points visible without scrolling |
| Subhead message | Communicates: recruiter lens, no subscription, pay when needed |

---

### 2. Trust Points Above Fold

| Criterion | Acceptance |
|:----------|:-----------|
| Replace generic badges | 3 compact proof tiles (label + one sentence + link) |
| Example labels | "Recruiter Lens rubric," "Credits never expire," "Deletable anytime" |

---

### 3. Input Default and PDF Prominence

| Criterion | Acceptance |
|:----------|:-----------|
| Paste-first default | Paste area is default visible |
| PDF co-equal | PDF upload button is visually co-equal (not secondary link) |
| Helper text | Explicitly says "we analyze content, not formatting" |

---

### 4. Privacy Messaging is Precise (Single Source of Truth)

| Criterion | Acceptance |
|:----------|:-----------|
| No false claims | Remove "never stored permanently" and "we don't store your resume" unless literally true |
| Aligned language | Privacy copy matches [Data Handling Truth Table in spec-freeze-v1.md](file:///Users/matsha05/Desktop/dev/recruiter-in-your-pocket/docs/launch-readiness/spec-freeze-v1.md) |
| Deletion promise | "Delete anytime" if supported, with link to Settings |

---

### 5. First-Run Guidance Inside Workspace

| Criterion | Acceptance |
|:----------|:-----------|
| Empty state guidance | 3-step guidance: "Paste resume," "Add target job," "Get Top 3 Fixes" |
| Sample link | Link to sample report visible in empty state |

---

### 6. Edge Case Handling Feels Premium

| Criterion | Acceptance |
|:----------|:-----------|
| Short resume (<100 words) | Warning includes next-best action: "Paste full work experience section" |
| Long resume (>3000 words) | Explains what will be prioritized and why |

---

### 7. Loading State is Calm, Truthful, Never Infinite

| Criterion | Acceptance |
|:----------|:-----------|
| Stage labels | Shown throughout analysis |
| Fallback | "Still working..." after 10-15 seconds |
| Escape hatch | "Switch to paste for faster results" when PDF parsing is slow |

---

### 8. Score Reveal is Premium and Explains Meaning

| Criterion | Acceptance |
|:----------|:-----------|
| Score dial | Reveals with brief label and 2-3 sentence interpretation |
| Rubric mapping | Score label maps to a defined rubric band (not generic) |
| 7.4-second frame | Tied to "7.4-second recruiter scan" narrative |

---

### 9. Report IA Forces "First 10 Seconds" Narrative

| Criterion | Acceptance |
|:----------|:-----------|
| Default visible order | 1. SM1 Top 3 Fixes, 2. What Recruiters See, 3. Next Steps |
| Progressive disclosure | Everything else is collapsible |

---

### 10. SM1 is Truly Complete

| Criterion | Acceptance |
|:----------|:-----------|
| Each Top Fix shows | Title, confidence indicator, evidence snippet, impact sentence, copy button |
| Component priority | ConfidenceBadge (P0) and EvidenceTooltip (P1) are required, not optional |

---

### 11. Define Confidence Semantics and Behavior

| Criterion | Acceptance |
|:----------|:-----------|
| Tooltip copy | "High" = evidence present, "Medium" = missing key context |
| Medium prompt | Includes "missing info" prompt: "Add scope: team size, revenue, users, latency, etc." |

---

### 12. EvidenceTooltip Uses Premium Excerpt Pattern

| Criterion | Acceptance |
|:----------|:-----------|
| Default | Max 1-line excerpt with truncation and highlight |
| Expanded | Click expands to popover with full excerpt and section label |

---

### 13. Impact/Effort Labels Are Consistent

| Criterion | Acceptance |
|:----------|:-----------|
| Fixed vocabulary | Impact: High/Med/Low, Effort: 5 min/15 min/30 min |
| Meaning | At least one sentence describes impact in recruiter terms |

---

### 14. Error States Are Specific and Protect Trust

| Criterion | Acceptance |
|:----------|:-----------|
| Error classes | Parse failure, timeout, rate limit, server error — each has unique copy |
| Credit statement | Each error states whether credits were consumed |
| Next action | Each includes clear next action |

---

### 15. Rate Limit Tone is Premium, Not Jokey

| Criterion | Acceptance |
|:----------|:-----------|
| Remove | "You're moving fast!" |
| Replace with | "We're processing a lot right now. Try again in 30 seconds." + retry guidance |

---

### 16. Pre-Paywall Value Summary is Explicit

| Criterion | Acceptance |
|:----------|:-----------|
| What they got | Shows Top 3 Fixes summary |
| What paying unlocks | History, version tracking, more reviews |
| Reassurance | "Credits never expire," support link, refund policy if applicable |

---

### 17. Paywall Plan Naming and Pricing Clarity

| Criterion | Acceptance |
|:----------|:-----------|
| Plan display | Name + price + what it includes |
| Consistent units | "One review" vs "5 reviews" |
| Dynamic CTA | "Unlock One Review" / "Unlock 5 Reviews" |

---

### 18. Post-Purchase Unlock Moment Feels Premium

| Criterion | Acceptance |
|:----------|:-----------|
| Unlock banner | Exists with credit count |
| Next action | "Run your next review," "Save this version," or "Compare versions" |

---

### 19. Accessibility Baseline is Enforced

| Criterion | Acceptance |
|:----------|:-----------|
| Keyboard accessible | All interactive elements with `focus-visible` rings |
| Reduced motion | Score dial and transitions respect `prefers-reduced-motion` |

---

### 20. Premium Cues QA Pass (Week 4 Deliverable)

| Check | Acceptance |
|:------|:-----------|
| Micro-interactions | Exist on score reveal |
| State transitions | No layout jumps |
| Loading copy | Consistent across all loading states |
| Error copy | In brand voice |
| Spacing/typography | Match hierarchy rules defined in Section 3 |

---

*Generated by A3 UX/UI/Copy Lead — 2025-12-28 (v2)*
