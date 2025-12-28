# Chrome Extension Preliminary Spec

**Agent:** Retention and Distribution Specialist  
**Date:** 2025-12-28  
**Purpose:** Define scope and requirements for #1 retention mechanism

---

## Executive Summary

The Chrome extension is the **#1 retention driver** across all successful competitors (Teal, Jobscan, Simplify). While it cannot ship in the 2-week sprint, this spec defines scope so it's ready to build immediately after launch.

**Target:** Week 3-4 post-launch MVP  
**Full Release:** Q1 2026

---

## 1. Why Chrome Extension is #1 Priority

### 1.1 Competitive Evidence

| Competitor | Extension? | Retention Role |
|:-----------|:-----------|:---------------|
| **Teal** | ✅ Yes | Primary — auto-saves jobs, always visible |
| **Jobscan** | ✅ Yes | Primary — quick JD scan from job boards |
| **Simplify** | ✅ Yes | Primary — autofill applications |
| **Huntr** | ✅ Yes | Primary — saves jobs to tracker |
| **RIYP** | ❌ No | Missing — version comparison only |

**Pattern:** Every successful Career OS/resume tool has a Chrome extension as their retention anchor.

### 1.2 Why It Matters for RIYP

| Dimension | Without Extension | With Extension |
|:----------|:------------------|:---------------|
| **Touchpoints** | User visits website | Extension visible on every job board |
| **Workflow fit** | Separate tool | Integrated into job search |
| **JD analysis** | Manual paste | One-click capture |
| **Return triggers** | Email only | Visual badge + notifications |
| **Retention D30** | Estimate: 10-15% | Estimate: 25-40% |

### 1.3 User JTBD Alignment

**Primary JTBD:** "Help me understand if this job is a good fit for my resume"

**Extension enables:**
1. "Clip this JD" while browsing LinkedIn/Indeed
2. "Quick match score" without leaving job board
3. "Save for later" to build application pipeline

---

## 2. MVP Scope (Week 3-4)

### 2.1 Core Features

| Feature | Priority | Description |
|:--------|:---------|:------------|
| **JD Capture** | P0 | One-click button to save job description from supported sites |
| **Quick Match** | P0 | Show match score against saved resume (cached) |
| **Link to Full Review** | P0 | "Get full analysis" link to web app |
| **Badge Counter** | P1 | Visual indicator of saved jobs |
| **Auth Sync** | P1 | Connect to existing RIYP account |

### 2.2 Supported Sites (MVP)

| Site | Job Board | Implementation |
|:-----|:----------|:---------------|
| LinkedIn | Jobs page | Content script selector |
| Indeed | Job detail page | Content script selector |
| Greenhouse | Application pages | Content script selector |
| Lever | Application pages | Content script selector |

### 2.3 Not in MVP

- Full resume editing
- Auto-fill applications (Simplify's domain)
- Job tracking/CRM features (Huntr's domain)
- LinkedIn profile editing
- Mobile extension (not possible on Chrome mobile)

---

## 3. Technical Architecture

### 3.1 Extension Components

```
┌─────────────────────────────────────────────────────┐
│ Chrome Extension                                     │
├─────────────────────────────────────────────────────┤
│  Popup UI                                            │
│  ├── Quick match score display                      │
│  ├── "Get full analysis" CTA                        │
│  └── Recent saved jobs list                         │
├─────────────────────────────────────────────────────┤
│  Content Scripts                                     │
│  ├── linkedin.com/jobs/* — JD capture button        │
│  ├── indeed.com/*       — JD capture button         │
│  └── greenhouse.io/*    — JD capture button         │
├─────────────────────────────────────────────────────┤
│  Background Service Worker                           │
│  ├── Auth sync with web app                         │
│  ├── API calls to RIYP backend                      │
│  └── Badge update logic                              │
└─────────────────────────────────────────────────────┘
```

### 3.2 API Requirements

**New endpoints needed:**

| Endpoint | Method | Purpose |
|:---------|:-------|:--------|
| `/api/extension/capture-jd` | POST | Save captured JD text |
| `/api/extension/quick-match` | POST | Return match score against cached resume |
| `/api/extension/saved-jobs` | GET | List saved JDs for user |
| `/api/extension/auth-status` | GET | Check auth state for extension |

### 3.3 Data Flow

```
1. User on LinkedIn job page
2. Extension detects job page, shows "Capture" button
3. User clicks "Capture"
4. Content script extracts JD text + metadata
5. Background script sends to /api/extension/capture-jd
6. API returns quick match score (if resume cached)
7. Popup shows score + "Get full analysis" link
```

---

## 4. UX Specification

### 4.1 Popup States

**Default (No Jobs Saved)**
```
┌─────────────────────────────────┐
│ ◉ Recruiter in Your Pocket      │
├─────────────────────────────────┤
│                                 │
│  📋 No jobs saved yet           │
│                                 │
│  Open a job posting and click   │
│  "Capture JD" to get started.   │
│                                 │
│  [Open RIYP Studio →]           │
│                                 │
└─────────────────────────────────┘
```

**Default (Jobs Saved)**
```
┌─────────────────────────────────┐
│ ◉ Recruiter in Your Pocket      │
├─────────────────────────────────┤
│  Recent Jobs (3)                │
├─────────────────────────────────┤
│  85% Senior PM • Stripe         │
│  72% Product Manager • Meta     │
│  68% Principal PM • Airbnb      │
├─────────────────────────────────┤
│  [View All] [Open Studio →]     │
└─────────────────────────────────┘
```

**On Job Page (JD Detected)**
```
┌─────────────────────────────────┐
│ ◉ Recruiter in Your Pocket      │
├─────────────────────────────────┤
│                                 │
│  Job detected: Senior PM        │
│  Company: Stripe                │
│                                 │
│  [Capture & Score]              │
│                                 │
│  Quick score against your       │
│  saved resume.                  │
│                                 │
└─────────────────────────────────┘
```

### 4.2 Content Script Button

**Placement:** Floating button in corner of job description container

**Style:** 
- Small, unobtrusive (40x40px)
- RIYP brand color on hover
- Tooltip: "Capture JD for RIYP"

---

## 5. Development Roadmap

### Phase 1: MVP (Week 3-4 Post-Launch)
- [ ] Basic popup UI
- [ ] Content scripts for LinkedIn + Indeed
- [ ] JD capture endpoint
- [ ] Quick match scoring (uses cached resume)
- [ ] Chrome Web Store submission

### Phase 2: Enhancements (Month 2)
- [ ] Greenhouse + Lever support
- [ ] Job tracking list in popup
- [ ] Badge counter for unreviewed matches
- [ ] Push notification for good matches

### Phase 3: Full Integration (Q1 2026)
- [ ] Resume version selection in popup
- [ ] Detailed match breakdown
- [ ] "Apply with confidence" workflow
- [ ] Analytics dashboard for job search

---

## 6. Success Metrics

| Metric | Target | Why It Matters |
|:-------|:-------|:---------------|
| **Install rate** | 30% of paid users | Validates interest |
| **Weekly active** | 50% of installs | Validates stickiness |
| **Jobs captured/user/week** | 3+ | Shows workflow integration |
| **D7 retention (extension users)** | 40%+ | Extension impact on retention |
| **D30 retention (extension users)** | 25%+ | Long-term habit formation |

---

## 7. Risks and Mitigations

| Risk | Impact | Mitigation |
|:-----|:-------|:-----------|
| Chrome Web Store rejection | Blocks launch | Follow guidelines strictly, submit early for review |
| LinkedIn blocks content script | Partial functionality | Design fallback for manual paste |
| Low install rate | Weak retention | Promote in post-purchase email, in-app banner |
| Scope creep | Delays MVP | Stick to MVP features, defer enhancements |

---

## 8. Integration with Retention Loop

### How Extension Supports Weekly Return

```
Week 1: User installs extension after paid review
Week 2: User browses jobs, captures 5 JDs, sees match scores
Week 3: Extension badge shows "2 good matches" → clicks to review
Week 4: Returns to improve resume for specific role
```

**Extension is the trigger surface** that brings users back without email.

---

## 9. Implementation Priority

| Week | Milestone | Deliverable |
|:-----|:----------|:------------|
| Week 3 | Extension scaffold | Popup UI, content scripts shell |
| Week 4 | Core functionality | JD capture, quick match, auth sync |
| Week 5 | Polish + submission | Chrome Web Store ready |
| Week 6 | Launch + iterate | Monitor installs, fix issues |

---

*Generated by Retention and Distribution Specialist — 2025-12-28*
