# A4: Backend Architecture and Reliability Spec

**Agent:** A4 Backend Architecture and Reliability Lead  
**Date:** 2025-12-28  
**Purpose:** Ensure system is resilient, secure, observable, and scalable

---

## 1. Current State (Verified)

### Existing Infrastructure
| Component | Implementation | Status |
|:----------|:---------------|:-------|
| **Error tracking** | Sentry | ✅ Deployed |
| **Rate limiting** | Upstash Redis | ✅ Deployed |
| **Background jobs** | Inngest | ✅ Deployed |
| **Logging** | Custom logger | ✅ Basic |
| **Validation** | Zod schemas | ✅ Strong |
| **PII detection** | lib/observability/pii.ts | ✅ Basic |
| **Request body limits** | lib/security/requestBody.ts | ✅ Present |

### Current Gaps
| Gap | Risk | Priority |
|:----|:-----|:---------|
| No timeout handling on LLM calls | Silent failures | P1 |
| No retry logic for transient errors | Lost requests | P2 |
| Limited structured logging | Debug difficulty | P2 |
| No request ID tracing | Hard to correlate logs | P2 |

---

## 2. Required API Changes

### 2.1 Streaming Endpoints Enhancement

**Affected Routes:**
- `api/resume-feedback-stream/route.ts`
- `api/linkedin-feedback-stream/route.ts`

**Required Changes:**

| Change | Rationale | Priority |
|:-------|:----------|:---------|
| Add timeout wrapper (60s) | Prevent hung connections | P1 |
| Add request ID to all logs | Enable tracing | P2 |
| Structure error responses consistently | Client-side handling | P2 |

**Timeout Implementation:**
```typescript
// lib/backend/timeout.ts
export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  errorMessage: string
): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(errorMessage)), ms)
  );
  return Promise.race([promise, timeout]);
}
```

### 2.2 Validation Changes (None Required)

Current Zod schemas at `lib/validation/schemas.ts` are comprehensive:
- `ResumeFeedbackRequestSchema` — input validation
- `ResumeFeedbackResponseSchema` — LLM output validation
- `CheckoutRequestSchema` — payment flow validation

No changes needed for 2-week sprint.

---

## 3. Data Model Changes

### 3.1 Current Schema (Verified)

**Location:** `web/database/schema.sql`

| Table | Purpose | Status |
|:------|:--------|:-------|
| `cases` | User job search context | ✅ Exists |
| `artifacts` | Resume versions, reports (JSONB) | ✅ Exists |
| `passes` | Payment/credit tracking | ✅ Exists (inferred) |
| `reports` | Saved analysis results | ✅ Exists (inferred) |

### 3.2 Proposed Changes (P2)

**For eval harness tracking:**
```sql
-- Optional: Track eval runs for quality system
CREATE TABLE eval_runs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  prompt_version TEXT NOT NULL,
  passed BOOLEAN NOT NULL,
  failed_cases JSONB DEFAULT '[]'::jsonb,
  metrics JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Deferrable:** Not required for launch. Build when eval harness is mature.

---

## 4. Background Jobs (Inngest)

### 4.1 Current State

**Location:** `lib/inngest/`, `api/inngest/route.ts`

Inngest is configured but specific job definitions need verification.

### 4.2 Recommended Jobs (P2)

| Job | Trigger | Purpose |
|:----|:--------|:--------|
| `report.generate.async` | Large resume submitted | Handle slow analyses without timeout |
| `eval.run.scheduled` | Daily/weekly cron | Run calibration dataset checks |
| `retention.email.send` | User inactive 7 days | Send warm return email |

**Not required for launch.** Current streaming approach works for typical latencies.

---

## 5. Rate Limiting

### 5.1 Current State (Verified)

**Location:** `lib/security/rateLimit.ts`

```typescript
// Rate limiting via Upstash Redis
import { rateLimit } from "@/lib/security/rateLimit";
```

### 5.2 Recommended Limits

| Endpoint | Limit | Window | Rationale |
|:---------|:------|:-------|:----------|
| `resume-feedback-stream` | 10 req | 1 min | Prevent abuse |
| `linkedin-feedback-stream` | 10 req | 1 min | Prevent Bright Data overuse |
| `checkout` | 5 req | 1 min | Prevent spam |
| `export-pdf` | 20 req | 1 min | Lower risk |
| `analytics` | 30 req | 1 min | Read-only |

**Verify current limits match recommendations.** Adjust if too permissive.

---

## 6. Caching Strategy

### 6.1 Current State

Redis available via Upstash. Current caching status: **Unknown**.

### 6.2 Recommended Caching (P2)

| Resource | Cache Duration | Rationale |
|:---------|:---------------|:----------|
| Prompt file content | Until redeploy | Already cached in `promptCache` Map |
| User session/pass status | 5 min | Reduce DB calls |
| Analytics summary | 10 min | Read-heavy, compute-expensive |

**Not blocking for launch.** Current performance is acceptable.

---

## 7. Observability

### 7.1 Current Logging

**Location:** `lib/observability/logger.ts`

```typescript
// Current structured logging
export function logError(message: string, context?: object): void
export function logInfo(message: string, context?: object): void
```

### 7.2 Enhancement: Request Context

**Proposed:** Add request ID to all API routes

```typescript
// lib/observability/requestContext.ts
import { headers } from "next/headers";
import { v4 as uuidv4 } from "uuid";

export function getRequestId(): string {
  const headersList = headers();
  return headersList.get("x-request-id") || uuidv4();
}
```

**Usage in routes:**
```typescript
const requestId = getRequestId();
logInfo("Analysis started", { requestId, resumeLength: text.length });
```

### 7.3 Key Metrics to Track

| Metric | Type | Purpose |
|:-------|:-----|:--------|
| `analysis.duration_ms` | Histogram | Monitor LLM latency |
| `analysis.score` | Gauge | Score distribution tracking |
| `checkout.success` | Counter | Conversion tracking |
| `error.rate` | Counter | Overall health |

**Implementation:** Use Sentry's performance monitoring or add custom metrics.

---

## 8. Security and Privacy

### 8.1 Current Controls (Verified)

| Control | Implementation | Status |
|:--------|:---------------|:-------|
| PII detection | `lib/observability/pii.ts` | ✅ Basic |
| Request body limits | `lib/security/requestBody.ts` | ✅ Present |
| Zod validation | `lib/validation/schemas.ts` | ✅ Strong |
| Stripe webhook verification | `api/stripe/webhook/route.ts` | ✅ Present |

### 8.2 PII Boundaries

| Data Type | Collection | Storage | Logging |
|:----------|:-----------|:--------|:--------|
| Resume text | Processed | Transient (not persisted) | Never logged |
| Email | Collected at checkout | Stored with user | Logged (hashed) |
| Scores/reports | Generated | Stored in DB | Logged (no content) |
| Payment info | Handled by Stripe | Never touches our servers | Never logged |

### 8.3 Retention Policy

| Data | Retention | Rationale |
|:-----|:----------|:----------|
| Resume text | Processing only | Privacy—not stored |
| Reports | Indefinite (user data) | User value |
| Logs | 30 days | Standard practice |
| Analytics events | 1 year | Business intelligence |

---

## 9. Error Handling Standards

### 9.1 Error Response Shape

```typescript
interface APIError {
  ok: false;
  errorCode: string;         // Machine-readable
  message: string;           // User-facing
  requestId?: string;        // For support
  retryable?: boolean;       // Can user retry?
}
```

### 9.2 Standard Error Codes

| Code | HTTP Status | User Message |
|:-----|:------------|:-------------|
| `VALIDATION_ERROR` | 400 | "Something in your request needs a tweak." |
| `AUTH_REQUIRED` | 401 | "Please log in to continue." |
| `RATE_LIMITED` | 429 | "You're moving fast! Try again in a moment." |
| `ANALYSIS_FAILED` | 500 | "We had trouble analyzing this. Try again in a moment." |
| `TIMEOUT` | 504 | "This took longer than expected. Please try again." |

---

## 10. Launch Readiness Checklist (Backend)

### P0 (Must Have)
- [x] Sentry error tracking deployed
- [x] Rate limiting on core endpoints
- [x] Stripe webhook handling with event log
- [x] Zod validation on all inputs
- [ ] Timeout wrapper on streaming endpoints (ADD)

### P1 (Should Have)
- [ ] Request ID tracing in logs
- [ ] Structured error responses with codes
- [ ] Health check endpoints responding correctly

### P2 (Nice to Have)
- [ ] Eval run tracking table
- [ ] Background job for async analysis
- [ ] Enhanced caching layer

---

*Generated by A4 Backend Reliability Lead — 2025-12-28*
