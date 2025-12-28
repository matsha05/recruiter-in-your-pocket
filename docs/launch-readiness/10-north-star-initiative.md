# A2: North Star Initiative

**Agent:** A2 Product Strategy and Wedge Owner  
**Date:** 2025-12-28  
**Purpose:** Choose the highest-leverage problem to solve in 2-week sprint

---

## Chosen North Star: "PromptOps Quality Moat"

**One-Sentence Problem Statement:**  
RIYP cannot detect, prevent, or measure quality regressions in its core AI output, leaving the product's primary value proposition vulnerable to silent degradation.

---

## Target User and Context

**Primary User:** Active job seeker who has already received one free review  
**Context:** Returning to RIYP to refine resume before applying to a specific role  
**Trigger:** New job posting, upcoming application deadline, or score they want to improve

**Who this is NOT for (in this sprint):**
- First-time visitors (onboarding is already strong)
- Chrome extension users (roadmap for Q1 2026)
- Negotiation users (future expansion)

---

## Emotional JTBD

> "I need to trust that the advice I'm getting is actually good. I've been burned by generic AI tools before. Show me this is different."

**Underlying fears:**
1. "Is this score real or random?"
2. "Will the advice actually help me get interviews?"
3. "Am I wasting $9 on AI slop?"

**Desired emotional state:**
1. "I can see exactly why my resume scored this way"
2. "The fixes are specific to MY resume, not generic advice"
3. "I trust this because I understand how it works"

---

## Why This Wins vs. Competitors

| Dimension | RIYP (Current) | Jobscan | Teal | Resume Worded |
|:----------|:---------------|:--------|:-----|:--------------|
| Recruiter perspective | ✅ Unique | ❌ ATS focus | ❌ ATS focus | ⚪ Partial |
| Scoring methodology | ✅ Strong prompt | ⚪ Mechanical | ⚪ Vague | ⚪ Fixed criteria |
| Quality system | ❌ **Missing** | Unknown | Unknown | Unknown |
| Confidence transparency | ❌ **Missing** | ❌ | ❌ | ❌ |

**The gap:** No competitor visibly demonstrates how their scoring works _or_ that quality is systematically measured. RIYP can be first-to-market with a quality system that:
1. Prevents embarrassing regressions
2. Creates defensible IP for acquisition
3. Builds user trust through transparency

**Source:** `/docs/competitive-intelligence/sections/quality-and-reliability.md`

---

## The "Aha Moment" (Under 30 Seconds)

**Current aha moment:** "Oh shit, my resume was burying the lead."

**Enhanced aha moment (with quality moat):**

> "Here's exactly what drove your score. These three fixes would raise it by 8-12 points. We're 91% confident in this assessment."

**Why this matters:**
- Adds explainability to the emotional impact
- Confidence score builds trust
- Specific point improvement creates actionable urgency

**Signature Moment (SM1): Evidence-Backed Recruiter Lens Summary**
- Top 3 Fixes with:
  - Exact evidence from resume ("Line 3 of your summary says...")
  - Confidence score (High/Medium)
  - One-sentence impact ("This fix would improve readability in first scan")

---

## Retention Loop Hypothesis

**Weekly reason to return:** Job market changes, new applications, resume variants

**Mechanism:**
1. **Trigger:** Email after 7 days: "Your resume score is 72. The job market has shifted—here's what's changed."
2. **Value:** Show market context (roles trending up, new keywords emerging)
3. **Action:** "Run a quick check against this week's top roles"

**Why this works (vs. current state):**
- Current: No systematic return trigger
- Enhanced: Context-based return that feels helpful, not spammy
- Pattern source: Duolingo's "Warm Return" + Strava's "Return Trigger"

**What makes returning BETTER than first-time:**
- Score history shows progress
- Version comparison shows improvements
- Returning user sees: "Since your last review, you've improved 8 points. Here's what's next."

---

## Success Metrics Definitions

### Activation (Day 0)
| Metric | Definition | Target |
|:-------|:-----------|:-------|
| First review completed | User uploads resume and receives full report | 80% of visitors |
| Report engagement | User scrolls to "Top Fixes" section | 90% of completed reviews |
| Aha moment signal | Time on score summary > 10 seconds | 70% of reviews |

### Conversion (Day 0-7)
| Metric | Definition | Target |
|:-------|:-----------|:-------|
| Free → Paid | User purchases any credit pack | 10-15% |
| Second review | Paid user runs a second analysis | 60% of paid users |

### Retention (Day 7+)
| Metric | Definition | Target |
|:-------|:-----------|:-------|
| D7 return | User returns within 7 days | 25% |
| D30 return | User returns within 30 days | 15% |
| Version tracking | User runs comparison on multiple versions | 30% of paid users |

### Quality (Ongoing)
| Metric | Definition | Target |
|:-------|:-----------|:-------|
| Score stability | Same resume produces score ±3 points across runs | 95% of cases |
| Eval pass rate | Calibration dataset passes all checks | 100% before deploy |
| Regression detection | Prompt change flagged before shipping | 100% of changes |

---

## What We Will NOT Do (Anti-Scope)

### Out of Scope for 2-Week Sprint

1. **Chrome extension** — Roadmap for Q1 2026
2. **Negotiation module** — Future expansion (Month 3-4)
3. **Auto-apply features** — Not our wedge
4. **Job tracking/CRM** — Different JTBD
5. **AI resume generation** — Anti-pattern for our positioning
6. **A/B testing infrastructure** — Complexity without urgent need
7. **Mobile app** — Web-first for now
8. **LinkedIn profile editing** — Review only, not generation

### Explicitly Deferred

1. **Confidence scoring in output** — P2, after eval harness is stable
2. **Recruiter eye-scan visualization** — P3, nice-to-have polish
3. **Market trend emails** — P2, retention enhancement
4. **Chrome extension MVP** — P1 but post-launch

---

## Strategic Defaults (When Ambiguous)

When facing trade-offs or unclear priorities, default to:

1. **PromptOps moat first** — Quality system > new features
2. **Explainability over mystery** — Show why, not just what
3. **Retention over acquisition** — Paid users who return > new free users
4. **Precision over coverage** — Deep quality on resume/linkedin > new tracks

---

*Generated by A2 Product Strategy — 2025-12-28*
