import "server-only";

import { logInfo, logWarn } from "../observability/logger";
import { recordLaunchSignal } from "../observability/launchSignals";
import { isSeverityCheckEnabled, isSeverityCheckEnabledForWorklist } from "./severity-check";
import { isWorklistReport } from "../llm/worklist-schema";
import { applySeverityCheck, type SeverityOutcome } from "./severity-check-service";

/**
 * The report routes' entry to the severity check: off unless RIYP_SEVERITY_CHECK allows it, resume
 * reports only, and never fatal. Records riyp.severity.outcome and logs the check's latency and cost.
 */
export async function severityCheckReport(input: {
  payload: any;
  mode: string;
  resumeText: string;
  validationOptions?: { forceGrounding?: boolean; jobDescription?: string };
  signal?: AbortSignal;
  endpoint: "stream" | "json";
  ctx: { request_id: string; route: string; user_id?: string };
  /** Called once, right before the second model call, so the wait screen can show it. */
  onStage?: (stage: "severity") => void;
}): Promise<{ payload: any; outcome: SeverityOutcome | null }> {
  if (input.mode !== "resume" || !isSeverityCheckEnabled()) return { payload: input.payload, outcome: null };
  if (isWorklistReport(input.payload) && !isSeverityCheckEnabledForWorklist()) return { payload: input.payload, outcome: null };
  input.onStage?.("severity");
  const outcome = await applySeverityCheck({
    payload: input.payload,
    resumeText: input.resumeText,
    validationOptions: input.validationOptions,
    signal: input.signal,
  });
  recordLaunchSignal("riyp.severity.outcome", {
    outcome: outcome.outcome,
    reason: outcome.reason,
    critical: String(Math.min(3, Math.max(1, outcome.critical_count))) as "1" | "2" | "3",
    more: outcome.more_critical ? "yes" : "no",
    endpoint: input.endpoint,
  });
  const log = outcome.outcome === "error" || outcome.outcome === "fallback" ? logWarn : logInfo;
  log({
    msg: `llm.severity_check.${outcome.outcome}`,
    request_id: input.ctx.request_id,
    route: input.ctx.route,
    user_id: input.ctx.user_id,
    latency_ms: outcome.latency_ms,
    outcome: outcome.outcome === "error" ? (outcome.reason === "timeout" ? "timeout" : "provider_error") : "success",
    llm: {
      task: "severity_check",
      model: outcome.model,
      prompt_version: outcome.prompt_version,
      latency_ms: outcome.call_latency_ms,
      cost_estimate_usd: outcome.cost_usd,
    },
    severity: {
      reason: outcome.reason,
      critical_count: outcome.critical_count,
      added: outcome.added,
      led: outcome.led,
      promoted: outcome.promoted.length,
      validation_attempts: outcome.validation_attempts,
    },
  });
  return { payload: outcome.payload, outcome };
}
