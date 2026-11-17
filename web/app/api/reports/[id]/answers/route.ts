import { NextRequest, NextResponse } from "next/server";
import { hashForLogs, logWarn } from "@/lib/observability/logger";
import { rateLimitAsync } from "@/lib/security/rateLimit";
import { readJsonWithLimit } from "@/lib/security/requestBody";
import { isReportId, LINE_ANSWER_LIMITS, lineAnswerEntry, parseLineAnswersPatch, parseStoredLineAnswers } from "@/lib/reports/line-answers";
import { createSupabaseAdminClient } from "@/lib/supabase/adminClient";
import { createSupabaseServerClient } from "@/lib/supabase/serverClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(body: unknown, status: number) {
  const response = NextResponse.json(body, { status });
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}

/**
 * Keeps the answers under one Critical Miss, and the revised line, with the reader's saved report
 * (W3). Owner only: the reader's session proves the report is theirs; the service role does the write
 * because the reports table has no owner update policy, on purpose. The body never carries the resume.
 */
export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: reportId } = await context.params;
  if (!isReportId(reportId)) return json({ ok: false, errorCode: "INVALID_REPORT_ID", message: "Open the report again and try once more." }, 400);

  let body: unknown;
  try {
    body = await readJsonWithLimit(request, LINE_ANSWER_LIMITS.body);
  } catch {
    return json({ ok: false, errorCode: "INVALID_REQUEST", message: "That answer couldn't be read. Try again." }, 400);
  }
  const patch = parseLineAnswersPatch(body);
  if (!patch) return json({ ok: false, errorCode: "INVALID_REQUEST", message: "That answer couldn't be read. Try again." }, 400);

  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return json({ ok: false, errorCode: "AUTH_REQUIRED", message: "Sign in to keep your answers with this report." }, 401);

  const limit = await rateLimitAsync(`user:${hashForLogs(user.id)}:line-answers`, 120, 60 * 60 * 1000);
  if (!limit.ok) {
    const response = json({ ok: false, errorCode: "RATE_LIMITED", message: "Too many changes in a row. Try again in a minute." }, 429);
    response.headers.set("retry-after", String(Math.ceil(limit.resetMs / 1000)));
    return response;
  }

  // Ownership through the reader's own session (the owner-only select policy), then the write.
  const { data: owned, error: ownError } = await supabase
    .from("reports")
    .select("id")
    .eq("id", reportId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (ownError) {
    logWarn({ msg: "line_answers.ownership_failed", supabase: { table: "reports", op: "select", error_code: String(ownError.code || "unknown") } });
    return json({ ok: false, errorCode: "SAVE_FAILED", message: "We couldn't keep that answer. Try again." }, 500);
  }
  if (!owned) return json({ ok: false, errorCode: "REPORT_NOT_FOUND", message: "This report isn't in your account." }, 404);

  const admin = createSupabaseAdminClient();
  if (!admin) return json({ ok: false, errorCode: "SAVE_UNAVAILABLE", message: "Answers can't be kept right now. Your line still works here." }, 503);
  // One card is set inside a single UPDATE (migration 027). Reading the object, merging and writing it back lost
  // a card whenever two saves overlapped (live walk, November 17, 2026).
  const { data: stored, error } = await admin.rpc("set_report_line_answer", {
    p_report_id: reportId,
    p_user_id: user.id,
    p_fix_index: String(patch.fix_index),
    p_entry: lineAnswerEntry(patch),
  });
  if (error) {
    logWarn({ msg: "line_answers.store_failed", supabase: { table: "reports", op: "rpc", error_code: String(error.code || "unknown") } });
    return json({ ok: false, errorCode: "SAVE_FAILED", message: "We couldn't keep that answer. Try again." }, 500);
  }
  if (!stored) return json({ ok: false, errorCode: "REPORT_NOT_FOUND", message: "This report isn't in your account." }, 404);
  return json({ ok: true, lineAnswers: parseStoredLineAnswers(stored) || {} }, 200);
}
