import { NextRequest, NextResponse } from "next/server";
import { ANONYMOUS_ID_COOKIE, parseAnonymousIdentityCookie } from "@/lib/backend/freeCookie";
import { hashAnonymousIdentity } from "@/lib/billing/anonymousIdentity";
import { canonicalSourceIdentity, containsBoundedSourceExcerpt } from "@/lib/llm/source-fidelity";
import { REVISE_LINE_PROMPT_VERSION } from "@/lib/llm/revise-line-model";
import { recordLaunchSignal, type LaunchSignalAttributes } from "@/lib/observability/launchSignals";
import { hashForLogs, logInfo } from "@/lib/observability/logger";
import { isGenerationPaused } from "@/lib/operations/generationBudget";
import { isAnonymousRecoveryId, loadAnonymousReportRecovery } from "@/lib/reports/anonymous-report-recovery";
import { lookupOwnedTrustedReport } from "@/lib/reports/generated-report-store";
import { POLISH_LIMITS } from "@/lib/reports/revised-line-polish";
import { polishRevisedLine } from "@/lib/reports/revised-line-polish-service";
import { rateLimitAsync } from "@/lib/security/rateLimit";
import { readJsonWithLimit } from "@/lib/security/requestBody";
import { createSupabaseAdminClient } from "@/lib/supabase/adminClient";
import { maybeCreateSupabaseServerClient } from "@/lib/supabase/serverClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

type Outcome = NonNullable<LaunchSignalAttributes<"riyp.revise.outcome">["reason"]>;

/**
 * The guarded polish of a revised line (Matt, Nov 1). The browser already shows the candidate's literal
 * line; this only ever offers a smoother one that passed the guard. Every refusal, failure or timeout
 * answers 200 with `line: null`, so the literal line simply stays.
 */
function answer(line: string | null, outcome: "polished" | "fallback" | "error", reason: Outcome, viewer: "anonymous" | "signed_in") {
  recordLaunchSignal("riyp.revise.outcome", { outcome, reason, viewer });
  const response = NextResponse.json({ ok: true, line }, { status: 200 });
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}

function text(value: unknown, max: number) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().replace(/\s+/gu, " ");
  return trimmed && trimmed.length <= max ? trimmed : null;
}

function fixExcerpts(report: unknown) {
  const fixes = (report as { top_fixes?: Array<{ evidence?: string | { excerpt?: string } }> } | null)?.top_fixes;
  return (Array.isArray(fixes) ? fixes : []).map((fix) => canonicalSourceIdentity(
    typeof fix?.evidence === "string" ? fix.evidence : fix?.evidence?.excerpt || "",
  )).filter(Boolean);
}

export async function POST(request: NextRequest) {
  const supabase = await maybeCreateSupabaseServerClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;
  const viewer = user ? "signed_in" : "anonymous";
  if (isGenerationPaused()) return answer(null, "fallback", "disabled", viewer);

  let body: Record<string, unknown>;
  try {
    body = await readJsonWithLimit<Record<string, unknown>>(request, 8 * 1024);
  } catch {
    return answer(null, "fallback", "invalid", viewer);
  }
  const excerpt = text(body?.excerpt, POLISH_LIMITS.excerpt);
  const line = text(body?.line, POLISH_LIMITS.line);
  const rawAnswers = Array.isArray(body?.answers) ? body.answers : [];
  const answers = rawAnswers.map((value) => text(value, POLISH_LIMITS.answer));
  const context = (body?.context && typeof body.context === "object" ? body.context : {}) as Record<string, unknown>;
  if (!excerpt || !line || answers.length === 0 || answers.length > POLISH_LIMITS.answers || answers.some((value) => !value)) {
    return answer(null, "fallback", "invalid", viewer);
  }
  // The line must be the quoted line or the resume line that holds it.
  const canonicalExcerpt = canonicalSourceIdentity(excerpt);
  if (canonicalSourceIdentity(line) !== canonicalExcerpt && !containsBoundedSourceExcerpt(line, canonicalExcerpt)) {
    return answer(null, "fallback", "invalid", viewer);
  }

  const anonymous = parseAnonymousIdentityCookie(request.cookies.get(ANONYMOUS_ID_COOKIE)?.value);
  const identity = user ? `user:${hashForLogs(user.id)}` : anonymous ? `anon:${hashForLogs(anonymous.id)}` : null;
  if (!identity) return answer(null, "fallback", "no_context", viewer);
  const limit = await rateLimitAsync(`${identity}:revise-line`, 30, 60 * 60 * 1000);
  if (!limit.ok) return answer(null, "fallback", "rate_limited", viewer);

  // Only a line from a report this visitor can open: their saved report, or their anonymous report's recovery.
  let report: unknown = null;
  try {
    const reportId = typeof context.reportId === "string" ? context.reportId : "";
    const recoveryId = typeof context.recoveryId === "string" ? context.recoveryId : "";
    if (user && UUID.test(reportId)) {
      const lookup = await lookupOwnedTrustedReport(createSupabaseAdminClient(), user.id, reportId);
      report = lookup.status === "found" ? lookup.report : null;
    } else if (anonymous && isAnonymousRecoveryId(recoveryId)) {
      const recovery = await loadAnonymousReportRecovery({ recoveryId, identityHash: hashAnonymousIdentity(anonymous) });
      report = recovery?.report ?? null;
    }
  } catch {
    report = null;
  }
  if (!report || !fixExcerpts(report).includes(canonicalExcerpt)) return answer(null, "fallback", "no_context", viewer);

  const result = await polishRevisedLine({ line, answers: answers as string[], signal: request.signal });
  logInfo({
    msg: `revise_line.${result.outcome}`,
    outcome: result.outcome === "error" ? (result.reason === "timeout" ? "timeout" : "provider_error") : "success",
    llm: { task: "revise_line", prompt_version: REVISE_LINE_PROMPT_VERSION, model: "model" in result ? result.model : undefined },
  });
  return answer(result.line, result.outcome, result.reason, viewer);
}
