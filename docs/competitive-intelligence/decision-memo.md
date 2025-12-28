# Decision Memo: RIYP Competitive Strategy

**One-Page Summary for Executive Decision-Making**
**Date:** 2025-12-27

---

## Verdict: READY TO SHIP

**Confidence:** HIGH (with two P1 caveats)

RIYP has a defensible position in a crowded market. The "Recruiter Lens" wedge is unique, the credit-based pricing addresses real user pain, and the prompt engineering is sophisticated. **Ship it.**

---

## Top 5 Risks

| # | Risk | Severity | Mitigation |
|:--|:-----|:---------|:-----------|
| 1 | **No eval harness** — can't detect quality regressions | High | Build calibration dataset + eval script (2 weeks) |
| 2 | **No Chrome extension** — missing retention driver | High | Roadmap for Q1 2026 (already planned) |
| 3 | **Positioning copy-able** — competitors could follow | Medium | Accelerate user growth to build brand moat |
| 4 | **No recurring revenue** — credit model limits predictability | Medium | Consider subscription add-on (later) |
| 5 | **Score drift risk** — GPT updates may shift output | Medium | Calibration dataset anchors quality |

---

## Top 5 Opportunities

| # | Opportunity | Impact | Effort | When |
|:--|:------------|:-------|:-------|:-----|
| 1 | **Product Hunt launch** — validation + social proof | High | Low | Week 1 |
| 2 | **Quality system** — eval harness + calibration | High | Medium (2 wks) | Week 2-3 |
| 3 | **Retention triggers** — email/push re-engagement | High | Medium (2 wks) | Week 3-4 |
| 4 | **Chrome extension** — process-layer presence | High | Medium (2-4 wks) | Month 2 |
| 5 | **Negotiation module** — high-ROI expansion | Medium | High (4-8 wks) | Month 3-4 |

---

## The One Thing to Decide

### Question: Should we build the quality eval system before or after launch?

| Option | Argument For | Argument Against |
|:-------|:-------------|:-----------------|
| **Before launch** | Prevents embarrassing quality issues; creates acquisition-ready story | Delays launch by 1-2 weeks |
| **After launch** | Ship faster; learn from real user feedback | Risk of score inconsistencies; harder to fix later |

### Recommendation: AFTER LAUNCH (with commitment)

**Why:**
1. Current prompt quality is already strong (587 lines, tested)
2. Real user feedback is more valuable than synthetic tests
3. Launch momentum matters for Product Hunt timing

**Commitment:**
- Ship quality eval system in Week 2-3 post-launch
- Assign as P1 priority immediately after launch stabilization

---

## What to Do This Week

### Immediate (Days 1-3)
1. ✅ Confirm Product Hunt launch date
2. ✅ Verify pricing page clarity ("$9 once, not $9/month")
3. ✅ Add "credits never expire" messaging (if not present)
4. ⬜ Review sample report for first-impression quality

### Pre-Launch (Days 4-7)
1. ⬜ Set up basic analytics for conversion tracking
2. ⬜ Prepare launch assets (screenshots, GIF, description)
3. ⬜ Queue retention email sequence (D1, D3, D7)

### Post-Launch (Week 1)
1. ⬜ Monitor first 50 reviews for quality issues
2. ⬜ Collect qualitative feedback (what surprised users?)
3. ⬜ Start calibration dataset from real reviews

---

## Where We Win

| Dimension | RIYP vs. Market Leader |
|:----------|:-----------------------|
| **Price** | $9 once vs. Jobscan $50/month |
| **Perspective** | Recruiter judgment vs. ATS parsing |
| **Model** | Credit-based vs. subscription |
| **Quality** | Editorial voice vs. robotic output |
| **Focus** | Review expertise vs. feature sprawl |

**Positioning summary:** "The recruiter-grade resume review that costs less than lunch."

---

## Where We Must Improve

| Gap | Priority | Timeline |
|:----|:---------|:---------|
| Chrome extension (retention) | P1 | Q1 2026 |
| Quality eval system (defensibility) | P1 | Week 2-3 |
| Mobile optimization | P2 | Ongoing |
| Retention email sequence | P2 | Week 1 |
| Negotiation module (expansion) | P3 | Month 3-4 |

---

## Success Metrics (Week 1-2)

| Metric | Target | Why This Matters |
|:-------|:-------|:-----------------|
| **Reviews completed** | 500+ | Volume validates product-market fit |
| **Conversion rate** | 10-15% free→paid | Shows willingness to pay |
| **NPS score** | 40+ | Strong = word of mouth potential |
| **Refund rate** | <5% | Low = quality concerns addressed |
| **Qualitative feedback** | "Oh wow" moments | Emotional validation |

---

## Final Call

**SHIP IT.** The product is strong. The positioning is unique. The market timing is right.

Build the quality eval system in Week 2-3 to cement the moat.

---

*Prepared by: Competitive Intelligence Synthesis (8-agent analysis)*
*Reviewed: 2025-12-27*
