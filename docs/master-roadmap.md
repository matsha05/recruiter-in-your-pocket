# Recruiter in Your Pocket – Master Roadmap

**Last Updated:** December 2025

---

## North Star

- Give people crafted, honest clarity about their career quickly.
- Feel like an elite recruiter studio—a premium crafted instrument.
- Every session should produce one "holy shit, that actually helped" moment.
- Look and feel like something built by someone with taste.

---

## Launch Blockers

These must be complete before soft launch:

### 1. Working Payments
- Connect real Stripe API keys
- Test checkout flow end-to-end
- Verify pass activation and expiration

### 2. Report History
- Add `reports` table to store analyses
- Link reports to user accounts
- Show past runs in a history view
- Enable reopening past reports

### 3. Cohesive Login Experience
- Email + code auth working
- Free runs tied to user (not browser cookie)
- Pass status visible when logged in
- Session persistence across devices

---

## Current State (December 2025)

### Done
- Resume Studio (full Insight Stack)
- PDF export with premium layout
- Free run limits (2 reports)
- Email + code authentication scaffolding
- Sessions and passes stored in Postgres
- Design system and tokens
- Logging and error handling

### In Progress
- Stripe integration (wired, needs real keys)
- Report history (not yet started)

---

## Post-Launch Roadmap

Only after soft launch and user feedback.

### Phase 1: Iterate on Core
- Polish based on real user friction
- Improve prompt quality if needed
- Fix UX issues discovered in testing

### Phase 2: Expand Surface
Options (prioritize based on user pull):
- **Comprehensive rewrites** — all bullets, not just samples
- **JD matching** — resume vs specific job description
- **Format scoring** — visual/layout feedback

### Phase 3: New Studios
- **Offer Studio** — negotiation clarity and leverage
- **LinkedIn Profile Studio** — same Insight Stack for LinkedIn

### Phase 4: Retention Features
- **Job tracker** — pipeline stages, notes, resume versions
- **Score evolution** — longitudinal insights over time

---

## Parked Ideas

### Differentiators to Consider Post-Launch
Worth building when core is proven:
- **Recruiter Skim View** — animated first-impression simulation showing what recruiters see in 6-10 seconds
- **Defensibility Check** — flags claims that might be hard to back up in interviews
- **Narrative Blueprint** — help users define their core career story before generating anything
- **Outreach Studio** — cold outreach and referral messaging (better than cover letters)

### Backlog (only if user demand proves it)
- Interview Story Studio
- Trajectory Studio
- LinkedIn Profile Studio (post Offer Studio)
- Resume Comparison
- Portfolio Integration

### Intentionally NOT Building
- Cover letter generator (outdated, low-value; referrals and outreach are better)
- Chrome extension (only relevant if we build job tracker)
- Auto-apply / automation (antithetical to quality-focused approach)

---

## Parked Features

Features considered but intentionally deferred. May revisit based on user signal.

### Report History Enhancements (Post-Launch)
- **Pagination/infinite scroll**: Currently shows last 20 reports (sufficient for ~6 months of weekly job searching)
- **Search & filter**: Filter by score range or date
- **Score comparison indicator**: "↑ 4 points from last analysis" badge when viewing reports
- **Delete reports**: Individual report deletion
- **Trend visualization**: Line chart or sparkline showing score evolution
- **Batch export**: Download all reports as PDFs in one go
- **Report comparison**: Side-by-side view of two resume versions

**Rationale**: Core history feature is complete and launch-ready. These are nice-to-haves that should be prioritized based on actual user behavior and requests.

---

## Execution Philosophy

- Ship in thin slices that improve the core experience
- Taste > features
- Craft > noise
- Clarity > cleverness
- Real user value > roadmap checkboxes

Every change must move the user closer to:
> "I understand my story and know exactly what to do next."

---

## Decision Framework

Before adding anything:
1. Is this a launch blocker? If yes, do it now.
2. Is this polish for existing features? If yes, prioritize it.
3. Is this a new feature? Wait for user signal.
4. Is this speculative? Park it.

First impressions matter. Launch when the core is genuinely great, not when the feature list is long.
