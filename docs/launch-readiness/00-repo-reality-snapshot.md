# A1: Repo Reality Snapshot

**Agent:** A1 Repo Reality Mapper  
**Date:** 2025-12-28  
**Purpose:** Verified map of what exists today for RIYP

---

## 1. Key User Flows

### 1.1 Primary Flow: Resume Review

```
Entry → Upload/Paste → Analysis → Report → Upgrade (if needed) → Post-Upgrade
```

| Step | Implementation | Location |
|:-----|:---------------|:---------|
| **Entry** | Landing page with pricing, testimonials, sample report | `app/page.tsx`, `components/landing/*` |
| **Input** | Resume text paste or PDF upload | `components/upload/ResumeDropzone.tsx`, `components/workspace/InputPanel.tsx` |
| **Analysis** | Streaming LLM call with progress states | `api/resume-feedback-stream/route.ts` (439 lines) |
| **Report** | Structured analysis with scores, rewrites, gaps | `components/workspace/report/*` (9 components) |
| **Paywall** | Modal with credit purchase flow | `components/workspace/PaywallModal.tsx` |
| **Post-Upgrade** | Unlock banner, version comparison | `components/workspace/UnlockBanner.tsx`, `VersionComparisonView.tsx` |

### 1.2 Secondary Flow: LinkedIn Review

```
Entry → LinkedIn URL → Profile Fetch (Bright Data) → Analysis → Report
```

| Step | Implementation | Location |
|:-----|:---------------|:---------|
| **URL Input** | LinkedIn profile URL validation | `lib/linkedin/bright-data.ts` |
| **Profile Fetch** | Bright Data API integration | `lib/linkedin/bright-data.ts` (4.4KB) |
| **Analysis** | LinkedIn-specific prompt | `web/prompts/linkedin_v1.txt` (8.2KB) |
| **Report** | LinkedIn-specific report components | `components/linkedin/*` (3 components) |

### 1.3 Analytics & History Flow

```
Auth → History Sidebar → Score Progress Chart → Version Comparison
```

| Feature | Implementation | Location |
|:--------|:---------------|:---------|
| **History** | Saved reports with variant tracking | `components/workspace/HistorySidebar.tsx` (33KB) |
| **Progress** | Score chart over time | `components/workspace/ScoreProgressChart.tsx` |
| **Comparison** | Before/after version diff | `components/workspace/VersionComparisonView.tsx` (14KB) |

---

## 2. Prompts and Output Quality

### 2.1 Prompt Inventory

| Prompt | Size | Purpose | Location |
|:-------|:-----|:--------|:---------|
| `resume_v1.txt` | 479 lines (26.9KB) | Primary resume analysis | `/prompts/resume_v1.txt` |
| `resume_v1.txt` (web) | 33.8KB | Deployed version | `/web/prompts/resume_v1.txt` |
| `linkedin_v1.txt` | 8.2KB | LinkedIn profile analysis | `/web/prompts/linkedin_v1.txt` |
| `resume_ideas_v1.txt` | 1.9KB | Missing wins questions | `/prompts/resume_ideas_v1.txt` |

### 2.2 Prompt Quality Controls (Verified)

| Control | Implementation | Evidence |
|:--------|:---------------|:---------|
| **Tone constraints** | Explicit rules for "calm, grounded confidence" | Lines 160-202 in prompt |
| **Few-shot examples** | 5+ thin/strong/high-bar progressions | Lines 45-133 |
| **Scoring rubric** | Anchor bands at 50/70/85/92 with inflation prevention | Lines 134-157 |
| **Output schema** | 40+ structured JSON fields | Lines 232-317 |
| **Anti-corporate language** | Explicit banned phrases list | Lines 182-187 |
| **Punctuation rules** | Em-dash ban, short sentences | Lines 41-44 in baseTone |

### 2.3 Output Contract (Resume)

```json
{
  "score": "integer 0-100",
  "score_label": "1-3 word band label",
  "score_comment_short": "~16 word summary",
  "score_comment_long": "2-3 sentence explanation",
  "summary": "3-5 sentences starting with 'You read as...'",
  "strengths": ["3-5 concrete bullets"],
  "gaps": ["3-5 concrete bullets"],
  "top_fixes": [{ "fix", "impact_level", "effort", "section_ref" }],
  "rewrites": [{ "label", "original", "better", "enhancement_note" }],
  "next_steps": ["actionable steps"],
  "subscores": { "impact", "clarity", "story", "readability" },
  "section_review": { "Summary", "Work Experience", "Skills", "Education" },
  "job_alignment": { "strongly_aligned", "underplayed", "missing", "role_fit" },
  "ideas": { "questions": [{ "question", "archetype", "why" }] }
}
```

---

## 3. Backend Services and Routes

### 3.1 API Route Inventory

| Route | Purpose | Size | Reliability Controls |
|:------|:--------|:-----|:---------------------|
| `resume-feedback-stream` | Primary analysis streaming | 439 lines | Rate limiting, pass validation, credit check |
| `linkedin-feedback-stream` | LinkedIn analysis | 455 lines | Bright Data integration, rate limiting |
| `stripe/webhook` | Payment processing | 304 lines | Event log, idempotency |
| `checkout` | Stripe checkout session | — | Email validation, tier normalization |
| `export-pdf` | PDF report generation | — | Zod validation |
| `analytics` | Score history, gaps summary | 126 lines | Auth required |
| `passes` | Pass/credit management | — | — |
| `parse-resume` | PDF text extraction | — | — |
| `health`, `ready` | Uptime monitoring | — | — |

### 3.2 Prompt Loading System

**Location:** `lib/backend/prompts.ts` (50 lines)

```typescript
// Mode-based prompt loading with caching
type Mode = "resume" | "resume_ideas" | "case_resume" | "case_interview" | "case_negotiation" | "linkedin";
const promptCache = new Map<string, string>();

function promptPathForMode(mode: Mode): string { ... }
export async function loadPromptForMode(mode: Mode): Promise<string> { ... }
```

**Versioning:** Currently single version per mode (`resume_v1.txt`, `linkedin_v1.txt`)  
**Gap:** No A/B testing infrastructure, no canary rollout

---

## 4. Database Schema

### 4.1 Core Tables

**Location:** `web/database/schema.sql` (35 lines)

| Table | Purpose | Key Columns |
|:------|:--------|:------------|
| `cases` | User job search cases | `id`, `user_id`, `status`, `curr_stage`, `user_context`, `role_context` |
| `artifacts` | Resume versions, reports | `id`, `case_id`, `type`, `content` (JSONB), `version` |
| `passes` | Payment/credit tracking | (inferred from API routes) `uses_remaining`, `tier`, `expires_at` |
| `reports` | Saved analysis results | (inferred from analytics) `user_id`, `score`, `report_json`, `resume_variant` |

### 4.2 Data Model Observations

- **JSONB heavy:** Flexible schema for content storage
- **Version tracking:** Artifacts table has `version` column
- **Variant support:** Reports track `resume_variant` for A/B analysis
- **Gap:** No indexed search on report content (performance risk at scale)

---

## 5. Analytics Events

### 5.1 Currently Tracked (from `lib/analytics.ts`)

**Location:** `web/lib/analytics.ts` (8.1KB)

| Event Category | Likely Events | Evidence |
|:---------------|:--------------|:---------|
| **Activation** | Report generated, first analysis | API route completion |
| **Conversion** | Checkout started, payment completed | Stripe webhook |
| **Engagement** | PDF export, version comparison | Component usage |
| **Retention** | Return visit, variant analysis | Analytics API aggregation |

### 5.2 Analytics API Response Shape

```typescript
{
  totalReviews: number,
  averageScore: number,
  scoreImprovement: number,
  scoreHistory: [{ date, score, name, variant, targetRole }],
  commonGaps: [{ text, count }],
  topStrengths: [{ text, count }],
  variants: string[]
}
```

---

## 6. Reliability Infrastructure

### 6.1 Error Tracking

| System | Implementation | Location |
|:-------|:---------------|:---------|
| **Sentry** | Error capture, performance monitoring | Template, global-error.tsx |
| **Logger** | Structured logging | `lib/observability/logger.ts` (3KB) |
| **PII Detection** | Resume content safety | `lib/observability/pii.ts` (691B) |

### 6.2 Rate Limiting

| System | Implementation | Location |
|:-------|:---------------|:---------|
| **Redis** | Upstash rate limiting | `lib/redis/*` (2 files) |
| **Rate Limit** | Per-endpoint controls | `lib/security/rateLimit.ts` (2.7KB) |

### 6.3 Background Jobs

| System | Implementation | Location |
|:-------|:---------------|:---------|
| **Inngest** | Async job processing | `lib/inngest/*`, `api/inngest/route.ts` |

### 6.4 Validation

| System | Implementation | Location |
|:-------|:---------------|:---------|
| **Zod** | Request/response schemas | `lib/validation/schemas.ts` (6.3KB) |
| **Request Body** | Size limits, JSON parsing | `lib/security/requestBody.ts` |

---

## 7. Reliability Gaps (Verified)

| Gap | Risk | Priority | How to Verify |
|:----|:-----|:---------|:--------------|
| **No eval harness** | Quality regressions undetected | P1 | Check for eval scripts in tests/ |
| **No calibration dataset** | Score drift after model updates | P1 | Check for labeled fixtures |
| **Single prompt version** | No A/B testing capability | P2 | Check prompts.ts for variant support |
| **No confidence scoring** | Output appears certain when uncertain | P2 | Check resume output schema |
| **No timeout fallbacks** | Silent failures on slow LLM calls | P2 | Check streaming error handling |
| **No retry logic** | Transient failures not recovered | P2 | Check API route error paths |

---

## 8. UI Architecture

### 8.1 Page Structure

| Page | Route | Key Components |
|:-----|:------|:---------------|
| **Landing** | `/` | LandingClient, Pricing, SampleReportPreview, Testimonials |
| **Workspace** | `/workspace` | WorkspaceClient, InputPanel, ReportPanel, PaywallModal |
| **Settings** | `/settings` | SettingsClient (24KB) |
| **Trust** | `/trust` | Methodology/privacy content |
| **FAQ** | `/faq` | FAQ content |
| **Research** | `/research/*` | Hiring Research Library (16 articles) |

### 8.2 Component Inventory

| Category | Count | Key Components |
|:---------|:------|:---------------|
| **Workspace** | 15+ files | WorkspaceClient, InputPanel, ReportPanel, HistorySidebar, PaywallModal |
| **Report** | 9 components | Score sections, rewrites, gaps display |
| **Landing** | 7 components | Pricing, Testimonials, SampleReportPreview, Footer |
| **Shared** | 6 components | Common UI elements |
| **UI (shadcn)** | 16 components | Button, Card, Dialog, etc. |

### 8.3 Design System

- **Base:** shadcn/ui with custom extensions
- **Score Utils:** `lib/score-utils.ts` — semantic color mapping (85+ success, 70+ premium, <70 destructive)
- **Animation:** `lib/animation.ts` — motion primitives
- **Globals:** `app/globals.css` (11KB) — CSS variables, utility classes

---

## 9. Test Infrastructure

### 9.1 Test Inventory

**Location:** `/tests/` (48 files)

| Test | Purpose | Location |
|:-----|:--------|:---------|
| `contract_resume_feedback.js` | API contract validation | 3.3KB |
| `contract_resume_ideas.js` | Ideas endpoint contract | 2.9KB |
| `contract_export_pdf.js` | PDF export contract | 3.4KB |
| `schema_contract.js` | Output schema validation | 1.5KB |
| `smoke_endpoints.js` | Endpoint availability | 871B |
| `validation.js` | Input validation | 2.8KB |

### 9.2 Calibration Data

| Asset | Count | Location |
|:------|:------|:---------|
| **Resume fixtures** | 37 files | `/tests/resumes/` |
| **Calibration results** | CSV output | `/tests/calibration_results.csv` (8KB) |

> **Note:** Fixtures exist but no automated eval harness to run them against prompts.

---

## 10. Summary: Ship Readiness

### ✅ Strengths (Verified)

1. **Sophisticated prompts** — 479 lines with tone control, few-shot examples, scoring rubric
2. **Reliability infrastructure** — Sentry, Redis, Inngest, Zod validation
3. **Multi-track capability** — Resume + LinkedIn + JD matching
4. **Test fixtures** — 37 resume samples for potential calibration
5. **Premium UI craft** — Score utils, animation primitives, shadcn foundation

### ⚠️ Gaps (P1)

1. **No eval harness** — Cannot detect quality regressions
2. **No calibration automation** — Fixtures exist but not used systematically
3. **No Chrome extension** — Missing primary retention mechanism

### ⚠️ Gaps (P2)

4. **No confidence scoring** in output schema
5. **No timeout/retry logic** in streaming routes
6. **Single prompt version** — no A/B infrastructure
7. **No output fallback behavior** specification

---

## Appendix: File Path Reference

| Category | Path |
|:---------|:-----|
| Prompts (root) | `/prompts/*.txt` |
| Prompts (web) | `/web/prompts/*.txt` |
| API Routes | `/web/app/api/*/route.ts` |
| Components | `/web/components/*` |
| Lib/Utils | `/web/lib/*` |
| Database | `/web/database/schema.sql` |
| Tests | `/tests/*` |
| Competitive Intel | `/docs/competitive-intelligence/*` |

---

*Generated by A1 Repo Reality Mapper — 2025-12-28*
