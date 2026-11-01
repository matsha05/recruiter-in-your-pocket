import { NextRequest, NextResponse } from "next/server";
import { ANONYMOUS_ID_COOKIE, parseAnonymousIdentityCookie } from "@/lib/backend/freeCookie";
import { recordLaunchSignal } from "@/lib/observability/launchSignals";
import { hashForLogs, logWarn } from "@/lib/observability/logger";
import { rateLimitAsync } from "@/lib/security/rateLimit";
import { readJsonWithLimit } from "@/lib/security/requestBody";
import { parseReportFeedback } from "@/lib/reports/report-feedback";
import { createSupabaseAdminClient } from "@/lib/supabase/adminClient";
import { maybeCreateSupabaseServerClient } from "@/lib/supabase/serverClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(body: unknown, status: number) {
  const response = NextResponse.json(body, { status });
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}

/**
 * "Was this the right thing to fix first?" (plan item 2.6). The yes/no is always
 * counted as a launch signal; the full answer is kept in report_feedback for the
 * eval set. A note that can't be kept is reported as a failure, so the reader
 * isn't told it was sent.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await readJsonWithLimit(request, 8 * 1024);
  } catch {
    return json({ ok: false, errorCode: "INVALID_REQUEST" }, 400);
  }
  const feedback = parseReportFeedback(body);
  if (!feedback) return json({ ok: false, errorCode: "INVALID_REQUEST" }, 400);

  const supabase = await maybeCreateSupabaseServerClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;
  const anonymous = parseAnonymousIdentityCookie(request.cookies.get(ANONYMOUS_ID_COOKIE)?.value);
  const requester = user ? `user:${hashForLogs(user.id)}` : anonymous ? `anon:${hashForLogs(anonymous.id)}` : "anon:none";
  const limit = await rateLimitAsync(`${requester}:report-feedback`, 20, 60 * 60 * 1000);
  if (!limit.ok) {
    const response = json({ ok: false, errorCode: "RATE_LIMITED" }, 429);
    response.headers.set("retry-after", String(Math.ceil(limit.resetMs / 1000)));
    return response;
  }

  recordLaunchSignal("riyp.report.critical_miss_feedback", {
    answer: feedback.right ? "right" : "wrong",
    note: feedback.note ? "yes" : "no",
    viewer: user ? "signed_in" : "anonymous",
  });

  try {
    const admin = createSupabaseAdminClient();
    if (!admin) throw Object.assign(new Error("Storage is not configured"), { code: "NO_ADMIN_CLIENT" });
    const { error } = await admin.from("report_feedback").insert({
      user_id: user?.id ?? null,
      report_id: feedback.reportId ?? null,
      critical_miss: feedback.criticalMiss,
      answer: feedback.right ? "right" : "wrong",
      note: feedback.note ?? null,
    });
    if (error) throw error;
  } catch (error) {
    logWarn({ msg: "report_feedback.store_failed", supabase: { table: "report_feedback", op: "insert", error_code: (error as { code?: string })?.code ?? "unknown" } });
    // The answer was still counted; only a written note would be lost.
    if (feedback.note) return json({ ok: false, errorCode: "FEEDBACK_UNAVAILABLE" }, 503);
  }
  return json({ ok: true }, 200);
}
