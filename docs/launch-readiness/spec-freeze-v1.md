# RIYP Spec Freeze v1.0

**Version:** 1.0  
**Date:** 2025-12-28  
**Timeline:** 3 Months to Launch (End of March 2026)  
**Status:** LOCKED

---

## A. North Star Initiative

### Problem Statement
Job seekers receive inconsistent, generic feedback from AI resume tools, leading to distrust and wasted effort. RIYP must prove its "Recruiter Lens" produces reliable, evidence-backed analysis that users can trust and act on.

### Target User
Active job seeker with 3-10 years experience, applying to competitive roles, skeptical of AI tools after bad experiences with generic advice.

### Emotional JTBD
> "Show me exactly what's wrong with my resume, prove it with evidence, and give me specific fixes I can do today. Don't BS me like every other AI tool."

---

## B. Program Gates

### Gate A: Trust and Abuse Gate
**Deadline:** End of Week 1  
**Requirement:** ALL must pass before ANY new feature work begins

**Pass/Fail Criteria:**

| Bundle | Items | Acceptance Test |
|:-------|:------|:----------------|
| **P0 Bundle 1: Prompt Injection Resistance** | RT-001, RT-002 | Malicious resume/job content cannot override instructions or change output schema. Injection attempts cause safe behavior. Structured output remains valid. |
| **P0 Bundle 2: PII Boundary and Logging** | RT-010, RT-012 | No PII in logs, error payloads, analytics, or Sentry breadcrumbs. Automated test or red-team replay passes. "Never log" fields list is documented and enforced. |
| **P0 Bundle 3: Data Retention Truth** | RT-011 | Spec defines what is stored and for how long. Deletion controls exist. Privacy copy matches actual storage behavior. |
| **P0 Bundle 4: Payment Correctness** | RT-013, RT-014 | Webhook replay does not double-credit or double-charge. Unlock state is consistent under retries. Event log proves idempotency. |
| **P0 Bundle 5: Timeout and Billing Integrity** | RT-017, RT-023 | Timeouts degrade gracefully with clear UI states. Credits are not consumed on timeout or schema-failing completion. Streaming never leaves UI stuck. |

**Gate A Sign-off:** [ ] Pass / [ ] Fail — Owner: __________ Date: __________

---

### Gate B: Quality Gate
**Deadline:** End of Week 2  
**Requirement:** ALL must pass before product is "launch-ready"

| Criterion | Acceptance Test |
|:----------|:----------------|
| Eval harness runs locally | `npm run eval` passes with minimum 20 golden cases |
| Output contract validation | Zod schema + completeness checks (all arrays populated, score 0-100) |
| Shipping gate exists | Documented rule: "prompt changes cannot ship unless eval thresholds pass" |
| Confidence scoring in UI | SM1 displays confidence indicators (High/Medium/Low) |

**Gate B Sign-off:** [ ] Pass / [ ] Fail — Owner: __________ Date: __________

---

### Gate C: Web Store Gate
**Deadline:** Before Chrome Web Store submission (Week 8)  
**Requirement:** ALL must pass before submission

| Criterion | Acceptance Test |
|:----------|:----------------|
| Least-privilege permissions | Permissions documented and justified (no unnecessary access) |
| Privacy policy alignment | Data handling disclosures match actual behavior |
| Fallback plan exists | Beta via unpacked extension documented |

**Fallback Beta Plan:**
If Chrome Web Store approval is delayed:
1. Distribute via Chrome Developer Mode (unpacked extension)
2. Target: 20-50 beta users recruited from paid customers via email
3. Installation guide: Settings → Extensions → Developer Mode → Load Unpacked
4. Feedback collection: In-app form + email survey
5. Duration: Until Web Store approval (max 2 weeks)

**Gate C Sign-off:** [ ] Pass / [ ] Fail — Owner: __________ Date: __________

---

## C. Data Handling Truth Table

### What We Store

| Data Type | Stored? | Where | Retention | Deletion Behavior |
|:----------|:--------|:------|:----------|:------------------|
| **Raw resume text** | NO | Never persisted | N/A | Never stored |
| **Resume preview** | YES | `reports.resume_preview` | With report | First 200 chars for version identification |
| **Job descriptions (for alignment)** | YES | `reports.job_description_text` | With report | Deleted with reports |
| **Job descriptions (extension)** | YES | `saved_jobs` table | Until user deletes | User can delete individual jobs or all data |
| **Analysis results (reports)** | YES | `reports` table (JSONB) | Indefinite | User can delete via account settings |
| **Score history** | YES | `reports` table | Indefinite | Deleted with reports |
| **Cached resume hash** | YES | `reports.resume_hash` | With report | For version comparison, not raw text |
| **User email** | YES | `users` table | Until account deleted | Account deletion removes all |
| **Payment records** | YES | Stripe + `passes` table | Required for billing | Cannot delete (legal requirement) |

### What We Never Store

- Raw resume text (processed in memory only)
- Raw LinkedIn profile content
- SSN, phone numbers, addresses (not extracted)

### What We Never Log

| Field | Enforcement |
|:------|:------------|
| `resumeText` | Never passed to logger |
| `jobDescription` (raw) | Never passed to logger |
| `email` | Logged as hash only |
| Request/response bodies containing PII | Stripped in Sentry `beforeSend` |

### User Deletion Flow

1. User initiates deletion in Settings
2. Backend deletes: all `reports`, all `saved_jobs`, all `artifacts`, user record
3. Backend retains: anonymized payment records (Stripe requirement)
4. Confirmation email sent
5. Deletion completes within 24 hours

---

## D. Signature Moment: SM1 Evidence-Backed Recruiter Lens

### Specification

**What:** Top 3 Fixes with exact resume evidence, confidence indicator, and one-sentence impact.

### Confidence Scoring (Core to SM1 — Not Optional)

| Level | Definition | UI Behavior |
|:------|:-----------|:------------|
| **High** | Strong evidence from resume, clear improvement path | ● High badge, standard display |
| **Medium** | Some evidence, outcome depends on context | ○ Medium badge, note: "depends on your situation" |
| **Low** | Limited evidence, uncertain recommendation | △ Low badge, soften language, ask for missing info |

**When Confidence is Low:**
- Fix wording uses hedging: "If applicable..." or "Consider..."
- Show prompt: "We couldn't find enough detail. Add more about [X] for a stronger recommendation."
- Do NOT display absolute claims

### UI Structure
```
┌─────────────────────────────────────────────────────┐
│ Top 3 Fixes                                         │
├─────────────────────────────────────────────────────┤
│ 1. Add scope to your lead bullet         ● High    │
│    "Managed team" → how many people?               │
│    Impact: Recruiters need scale to judge seniority│
│                                           [Copy]   │
└─────────────────────────────────────────────────────┘
```

### Measurability

| Metric | Definition | Event Name | Target |
|:-------|:-----------|:-----------|:-------|
| **Activation** | Fixes rendered to user | `sm1_fixes_rendered` | — |
| **Success** | User copies at least one fix | `sm1_fix_copied` | 15-25% of activated |

**Event Instrumentation:**

| Event | Trigger | Code Location | Status |
|:------|:--------|:--------------|:-------|
| `sm1_fixes_rendered` | TopFixes component mounts with data | `TopFixes.tsx` useEffect | ⚪ Add in Week 3 |
| `sm1_fix_copied` | Copy button clicked | `TopFixes.tsx` onClick | ⚪ Add in Week 3 |
| `sm1_confidence_shown` | Confidence badge renders | `ConfidenceBadge.tsx` | ⚪ Add in Week 4 |

**How to Verify:** After Week 4, grep for `Analytics.track('sm1_` in `components/workspace/report/`.

---

## E. Chrome Extension Scope (Anti-Sprawl)

### V1 Scope: Single Wedge Only

| Decision | Selection | Rationale |
|:---------|:----------|:----------|
| **Page context** | LinkedIn job detail page (`linkedin.com/jobs/view/*`) | Highest user traffic, most structured DOM |
| **V1 output** | Quick match score (0-100) + Top 3 fixes summary | Minimal but valuable |
| **V1 CTA** | "Get Full Analysis →" (link to web app) | Drive to monetized flow |

### NOT in V1 Scope (Anti-Sprawl)

| Item | Status | Condition to Add |
|:-----|:-------|:-----------------|
| Indeed support | Conditional | Add in Week 6 only if LinkedIn is stable AND Gate C passes |
| Greenhouse/Lever | Deferred | Month 3+ only if extension has >100 installs |
| Job saving/tracking | Never for MVP | Different product |
| Full analysis in popup | Never | Always link to web |
| Rewrite editing in popup | Never | Complexity explosion |

### Retention Hypothesis and Metric

**Hypothesis:** Users who install the extension and capture ≥3 JDs in Week 1 will have 2x higher D30 retention than non-extension users.

**Primary Metric:** D30 retention rate segmented by extension install

| Metric | Numerator | Denominator |
|:-------|:----------|:------------|
| Extension D30 retention | Users with extension who return in 30 days | Users who installed extension |
| Control D30 retention | Users without extension who return in 30 days | Users who did not install extension |

**Tracking Events:**

| Event | Trigger | Properties |
|:------|:--------|:-----------|
| `extension_installed` | Extension first opened | `user_id`, `timestamp` |
| `jd_captured` | JD saved from content script | `user_id`, `source` |
| `quick_match_viewed` | Match score shown in popup | `user_id`, `score` |
| `full_analysis_clicked` | CTA clicked | `user_id`, `job_id` |

---

## F. UI/UX Polish Gates (Summary)

The authoritative 20-item polish checklist with full acceptance criteria is in [20-ux-ui-copy-spec.md Section 9](file:///Users/matsha05/Desktop/dev/recruiter-in-your-pocket/docs/launch-readiness/20-ux-ui-copy-spec.md).

### Non-Negotiable Shipping Gates

These 5 items are **ship-blockers** — product cannot launch without them:

1. **SM1 includes Confidence + Evidence + Impact** and is visible without scrolling on desktop
2. **Privacy copy matches Data Handling Truth Table** (no "never stored" claims unless literally true)
3. **Loading states are calm, truthful, and never infinite** (exit path exists after 60s)
4. **Error states are specific and state whether credits were consumed**
5. **Report hierarchy defaults to Top 3 Fixes first** with progressive disclosure for everything else

### Component Priority (Updated)

| Component | Priority | Rationale |
|:----------|:---------|:----------|
| ConfidenceBadge | **P0** | Required for SM1 signature moment |
| EvidenceTooltip | **P1** | Required for SM1 evidence pattern |
| WarmReturnBanner | P3 | Nice-to-have for retention |

### Acceptance Criteria Summary

See [A3 Section 4](file:///Users/matsha05/Desktop/dev/recruiter-in-your-pocket/docs/launch-readiness/20-ux-ui-copy-spec.md) for ConfidenceBadge and EvidenceTooltip acceptance criteria.

---

## G. Success Metrics (KPIs)

### Activation

| Metric | Numerator | Denominator | Target | Event |
|:-------|:----------|:------------|:-------|:------|
| First review completion | Users who complete first review | Users who start input (paste/upload) | 80% | `analysis_completed` / `input_started` |
| SM1 engagement | Users who scroll to Top Fixes | Users who complete review | 90% | `sm1_fixes_rendered` / `analysis_completed` |

### Conversion

| Metric | Numerator | Denominator | Target | Event |
|:-------|:----------|:------------|:-------|:------|
| Paywall conversion | Users who purchase | Users who see paywall | 10-15% | `purchase_completed` / `paywall_shown` |
| Second review | Paid users who run second review | Paid users | 60% | `analysis_completed` (count ≥2) / `purchase_completed` |

### Retention

| Metric | Numerator | Denominator | Target | Event |
|:-------|:----------|:------------|:-------|:------|
| D7 return | Users who return within 7 days | Users who activated (first review) | 25% | `session_start` (D7) / `analysis_completed` (D0) |
| D30 return | Users who return within 30 days | Users who activated | 15% (no extension), 25% (with extension) | Same |

### Quality

| Metric | Numerator | Denominator | Target | Event |
|:-------|:----------|:------------|:-------|:------|
| Score stability | Runs within ±3 points | Total runs of same resume | 95% | Manual eval |
| Eval pass rate | Fixtures passing | Total fixtures | 100% | `npm run eval` |

---

## H. Scope

### In Scope (3-Month Timeline)

| Month | Deliverables |
|:------|:-------------|
| **Month 1** | Gate A (P0 bundles), Gate B (quality), SM1 with confidence, Methodology v1, UI polish, extension prototype |
| **Month 2** | Chrome extension v1 (LinkedIn only), retention emails, Gate C, Web Store submission |
| **Month 3** | Extension launch, proof assets finalized, Product Hunt |

### Out of Scope

- Negotiation module (Month 4+)
- Mobile app
- AI resume generation (anti-wedge)
- Auto-apply features
- Job tracking CRM
- Indeed extension support (conditional on LinkedIn stability)

---

## I. Proof Assets Timeline

| Week | Deliverable |
|:-----|:------------|
| Week 2 | Methodology v1 outline, Privacy promise draft |
| Week 3 | Public-safe sample output with annotations |
| Week 4 | **Methodology v1 published** (even if short) |
| Week 10 | Methodology expanded and polished |

See [proof-assets.md](file:///Users/matsha05/Desktop/dev/recruiter-in-your-pocket/docs/launch-readiness/proof-assets.md) for full deliverable specs.

---

## J. Backend and Data Plan

### API Routes (Current)

| Route | Purpose | Reliability |
|:------|:--------|:------------|
| `resume-feedback-stream` | Primary analysis | Timeout wrapper required (P0 Bundle 5) |
| `linkedin-feedback-stream` | LinkedIn analysis | Timeout wrapper required (P0 Bundle 5) |
| `stripe/webhook` | Payment processing | Idempotency required (P0 Bundle 4) |

### New Routes (Extension)

| Route | Purpose | Timeline |
|:------|:--------|:---------|
| `/api/extension/capture-jd` | Save JD from extension | Week 5 |
| `/api/extension/quick-match` | Quick match score | Week 5 |

---

## K. PromptOps and Quality Moat

See [40-promptops-quality-spec.md](file:///Users/matsha05/Desktop/dev/recruiter-in-your-pocket/docs/launch-readiness/40-promptops-quality-spec.md) for:
- Prompt versioning strategy
- Output contract schema
- Rubric calibration
- Gold/fail output examples

---

## L. Launch Readiness Checklist

### Week 1 Complete (Gate A)
- [ ] P0 Bundle 1: Prompt injection passes acceptance tests
- [ ] P0 Bundle 2: PII boundary passes acceptance tests
- [ ] P0 Bundle 3: Data retention truth documented and verified
- [ ] P0 Bundle 4: Payment correctness passes acceptance tests
- [ ] P0 Bundle 5: Timeout/billing integrity passes acceptance tests

### Week 2 Complete (Gate B)
- [ ] Eval harness runs with 20+ golden cases
- [ ] Output contract validation exists
- [ ] Shipping gate documented
- [ ] Confidence scoring visible in SM1

### Week 4 Complete
- [ ] SM1 fully implemented with confidence badges
- [ ] UI polish checklist complete
- [ ] Methodology v1 published
- [ ] Extension prototype internal

### Week 8 Complete (Gate C)
- [ ] Extension permissions justified
- [ ] Privacy policy aligned
- [ ] Fallback beta plan ready
- [ ] Chrome Web Store submitted

### Week 12 Complete (Launch)
- [ ] Extension live
- [ ] Proof assets published
- [ ] Product Hunt executed

---

*Spec Freeze v1.0 — Locked 2025-12-28*  
*Next review: End of Month 1*
