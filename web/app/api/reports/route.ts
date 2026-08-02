import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/serverClient";
import { readJsonWithLimit } from "@/lib/security/requestBody";
import { isLaunchFlagEnabled } from "@/lib/launch/flags";
import { logError } from "@/lib/observability/logger";
import { ResumeFeedbackResponseSchema } from "@/lib/validation/schemas";
import { verifyValidatedReportReceipt } from "@/lib/reports/report-receipt";
import { persistReceiptValidatedReport } from "@/lib/reports/generated-report-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      return NextResponse.json(
        { ok: false, errorCode: "AUTH_REQUIRED", message: "Please log in to view your report history." },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const limit = Math.min(Number(url.searchParams.get("limit") || 20), 50);

    const { data, error } = await supabase
      .from("reports")
      .select("id, score, score_label, resume_preview, name, target_role, resume_variant, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json(
        { ok: false, errorCode: "FETCH_REPORTS_FAILED", message: "Could not load your report history. Please try again." },
        { status: 500 }
      );
    }

    const reports = (data || []).map((r: any) => ({
      id: r.id,
      createdAt: r.created_at,
      score: r.score,
      scoreLabel: r.score_label || undefined,
      resumeSnippet: r.resume_preview || undefined,
      name: r.name || undefined,
      targetRole: r.target_role || undefined,
      resumeVariant: r.resume_variant || undefined
    }));

    return NextResponse.json({ ok: true, reports });
  } catch (error: any) {
    logError({
      msg: "reports.list_failed",
      outcome: "internal_error",
      err: { name: error?.name || "Error", message: error?.message || "Failed to list reports", code: error?.code },
    });
    return NextResponse.json({ ok: false, reports: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: userData } = await supabase.auth.getUser();
    const sessionUser = userData.user;

    if (!sessionUser) {
      const flagMessage = isLaunchFlagEnabled("guestReportSave")
        ? "Please sign in to verify ownership before saving this report."
        : "Report saving is available after sign-in.";

      return NextResponse.json(
        { ok: false, errorCode: "AUTH_REQUIRED", message: flagMessage },
        { status: 401 }
      );
    }

    const body = await readJsonWithLimit<any>(request, 256 * 1024);
    const submitted = body?.report;
    if (!submitted || typeof submitted !== "object") {
      return NextResponse.json({ ok: false, errorCode: "INVALID_REPORT", message: "Report payload is required." }, { status: 400 });
    }
    const { report_receipt: receipt, ...reportWithoutReceipt } = submitted;
    const parsed = ResumeFeedbackResponseSchema.safeParse(reportWithoutReceipt);
    if (!parsed.success || !verifyValidatedReportReceipt(parsed.data, receipt)) {
      return NextResponse.json(
        { ok: false, errorCode: "UNTRUSTED_REPORT", message: "This report cannot be verified. Rerun it while signed in." },
        { status: 409 },
      );
    }
    const reportId = await persistReceiptValidatedReport({ supabase, userId: sessionUser.id, payload: parsed.data });
    return NextResponse.json({ ok: true, reportId });
  } catch (error: any) {
    logError({
      msg: "reports.save_failed",
      outcome: "internal_error",
      err: { name: error?.name || "Error", message: error?.message || "Failed to save report", code: error?.code },
    });
    return NextResponse.json(
      { ok: false, message: error?.message || "Failed to save report" },
      { status: 500 }
    );
  }
}
