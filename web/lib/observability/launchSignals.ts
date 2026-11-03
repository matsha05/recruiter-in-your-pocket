import "server-only";

import * as Sentry from "@sentry/nextjs";
import { after } from "next/server";
import { logInfo } from "./logger";

/**
 * Launch signals: unsampled counters for the paid journey, sent to Sentry
 * metrics so they outlive Vercel's short log retention. See
 * docs/launch-readiness/monitoring.md for the queries and alerts built on them.
 *
 * Like product analytics, the schema is closed: unknown names, attributes and
 * values are dropped. Nothing here identifies a visitor, account, report,
 * checkout session or email, and the counters are operational aggregates
 * (like error monitoring), so they do not depend on the Privacy choices
 * analytics setting.
 */
const ERROR_CODE = /^[A-Z][A-Z0-9_]{2,63}$/;

export const LAUNCH_SIGNALS = {
  "riyp.report.outcome": {
    outcome: ["completed", "failed"],
    failure: ["none", "validation", "timeout", "provider", "canceled", "paused", "precondition", "access", "persistence", "other"],
    error_code: ERROR_CODE,
    mode: ["resume", "resume_ideas", "case_resume", "case_interview", "case_negotiation", "linkedin"],
    viewer: ["anonymous", "signed_in"],
    has_jd: ["yes", "no"],
    endpoint: ["stream", "json"],
    // Seconds from the request's arrival to its outcome, bucketed; the only production record of the wait.
    latency_bucket: ["lt30", "30to60", "60to120", "gt120"],
  },
  "riyp.report.repair": {
    result: ["started", "completed", "failed"],
  },
  "riyp.free_gate.check": {
    result: ["allowed", "blocked", "identity_retry"],
    reason: ["none", "cookie", "identity", "network", "hold", "account", "unknown"],
    first_attempt: ["yes", "no", "unknown"],
    viewer: ["anonymous", "signed_in"],
  },
  // "Was this the right thing to fix first?" on the Critical Miss (plan item 2.6).
  "riyp.report.critical_miss_feedback": {
    answer: ["right", "wrong"],
    note: ["yes", "no"],
    viewer: ["anonymous", "signed_in"],
  },
  // The guarded polish of a revised line: the polished line shown, a fallback to the literal line, or an error.
  "riyp.revise.outcome": {
    outcome: ["polished", "fallback", "error"],
    reason: [
      "polished", "unchanged", "empty", "too_long", "new_number", "new_name", "new_word", "dropped_fact",
      "dropped_answer", "dropped_word", "form", "guard", "timeout", "provider", "disabled", "rate_limited", "no_context", "invalid",
    ],
    viewer: ["anonymous", "signed_in"],
  },
  // The severity check after a resume report: further Critical Misses shipped, none found, the report
  // shipped as written because the additions failed validation, or the check itself failed.
  "riyp.severity.outcome": {
    outcome: ["added", "none", "fallback", "error"],
    reason: ["added", "promoted", "none", "validation", "first_fix_changed", "timeout", "provider"],
    critical: ["1", "2", "3"],
    more: ["yes", "no"],
    endpoint: ["stream", "json"],
  },
  "riyp.checkout.step": {
    step: [
      "checkout_started",
      "checkout_failed",
      "purchases_disabled",
      "payment_settled",
      "payment_pending",
      "entitlement_granted",
      "entitlement_blocked",
      "fulfillment_failed",
      "confirm_unlocked",
      "confirm_incomplete",
      "confirm_failed",
      "restore_restored",
      "restore_already_active",
      "restore_none",
      "restore_failed",
    ],
    source: ["landing", "pricing", "paywall", "settings", "workspace", "unknown"],
  },
} as const satisfies Record<string, Record<string, readonly string[] | RegExp>>;

export type LaunchSignalName = keyof typeof LAUNCH_SIGNALS;
type AttributeValue<Rule> = Rule extends readonly (infer Value)[] ? Value : string;
export type LaunchSignalAttributes<Name extends LaunchSignalName> = {
  [Key in keyof (typeof LAUNCH_SIGNALS)[Name]]?: AttributeValue<(typeof LAUNCH_SIGNALS)[Name][Key]>;
};

export function sanitizeLaunchSignal(
  name: string,
  attributes: Record<string, unknown> = {},
): { name: LaunchSignalName; attributes: Record<string, string> } | null {
  if (!Object.prototype.hasOwnProperty.call(LAUNCH_SIGNALS, name)) return null;
  const schema = LAUNCH_SIGNALS[name as LaunchSignalName] as Record<string, readonly string[] | RegExp>;
  const sanitized: Record<string, string> = {};
  for (const [key, value] of Object.entries(attributes)) {
    const rule = schema[key];
    if (!rule || typeof value !== "string") continue;
    if (rule instanceof RegExp ? rule.test(value) : rule.includes(value)) sanitized[key] = value;
  }
  return { name: name as LaunchSignalName, attributes: sanitized };
}

/** Sends buffered metrics before Vercel freezes the function. */
function flushAfterResponse() {
  try {
    after(() => Sentry.flush(2000));
  } catch {
    // Outside a request scope (scripts, tests): the SDK's timer flushes instead.
  }
}

export function recordLaunchSignal<Name extends LaunchSignalName>(
  name: Name,
  attributes: LaunchSignalAttributes<Name>,
) {
  const approved = sanitizeLaunchSignal(name, attributes as Record<string, unknown>);
  if (!approved) return;
  try {
    Sentry.metrics.count(approved.name, 1, { attributes: approved.attributes });
    flushAfterResponse();
  } catch {
    // Monitoring must never interrupt a report or a purchase.
  }
  // "name" is a blocked log key, so the record names the metric instead.
  logInfo({ msg: "launch.signal", signal: { metric: approved.name, attributes: approved.attributes } });
}

export type ReportFailureKind = (typeof LAUNCH_SIGNALS)["riyp.report.outcome"]["failure"][number];
export type ReportLatencyBucket = (typeof LAUNCH_SIGNALS)["riyp.report.outcome"]["latency_bucket"][number];

/** The wait as a closed bucket, measured from the route's start to its outcome. */
export function latencyBucketFor(startedAt: number, now: number = Date.now()): ReportLatencyBucket {
  const seconds = Math.max(0, now - startedAt) / 1000;
  if (seconds < 30) return "lt30";
  if (seconds < 60) return "30to60";
  if (seconds < 120) return "60to120";
  return "gt120";
}

/**
 * Groups generation error codes into the failure kinds the alerts watch, in
 * the same order as releaseReasonForError. "validation" is a report withheld
 * because the model's output failed its checks, including after repair.
 * "precondition" is a request refused before any access was reserved, such as
 * a browser that blocks the storage anonymous report recovery needs.
 */
export function classifyReportFailure(error: { code?: unknown; name?: unknown } | null | undefined): ReportFailureKind {
  const code = typeof error?.code === "string" ? error.code : "";
  if (code === "CLIENT_CANCELED" || code === "CLIENT_DISCONNECTED") return "canceled";
  if (code === "OPENAI_TIMEOUT") return "timeout";
  if (code.startsWith("OPENAI_RESPONSE_")) return "validation";
  if (code.startsWith("OPENAI_")) return "provider";
  if (code === "GENERATION_PAUSED" || code === "GENERATION_BUDGET_EXHAUSTED") return "paused";
  // The daily cap's own storage missing or down refuses every report: an outage, alerted like Redis or Supabase.
  if (code === "GENERATION_BUDGET_UNAVAILABLE") return "access";
  if (code === "RECOVERY_STORAGE_REQUIRED") return "precondition";
  if (code.startsWith("ACCESS_") || code.startsWith("GENERATION_")) return "access";
  if (code.startsWith("REPORT_")) return "persistence";
  if (error?.name === "AbortError") return "canceled";
  return "other";
}

type CheckoutStep = (typeof LAUNCH_SIGNALS)["riyp.checkout.step"]["step"][number];

/** The return-page confirmation outcome; pending polls are not counted. */
export function confirmStepFor(status: number, body: { state?: unknown } | null): CheckoutStep | null {
  if (status >= 500) return "confirm_failed";
  if (body?.state === "unlocked") return "confirm_unlocked";
  if (body?.state === "not_paid" || body?.state === "checkout_incomplete") return "confirm_incomplete";
  return null;
}

/** The restore outcome for a signed-in buyer; sign-in and rate limits are not counted. */
export function restoreStepFor(
  status: number,
  body: { restored?: unknown; active_after?: unknown } | null,
): CheckoutStep | null {
  if (status >= 500) return "restore_failed";
  if (status !== 200) return null;
  if (Number(body?.restored) > 0) return "restore_restored";
  if (Number(body?.active_after) > 0) return "restore_already_active";
  return "restore_none";
}

/** Records the step a billing route's JSON response represents. */
export async function recordCheckoutResponse(
  response: Response,
  stepFor: (status: number, body: any) => CheckoutStep | null,
) {
  let body: unknown = null;
  try {
    body = await response.clone().json();
  } catch {
    body = null;
  }
  const step = stepFor(response.status, body as any);
  if (step) recordLaunchSignal("riyp.checkout.step", { step, source: "unknown" });
}
