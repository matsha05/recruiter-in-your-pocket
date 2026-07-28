import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createSupabaseServerClient } from "@/lib/supabase/serverClient";
import { readJsonWithLimit } from "@/lib/security/requestBody";
import { isLaunchFlagEnabled } from "@/lib/launch/flags";
import { logError } from "@/lib/observability/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function nowIso() {
  return new Date().toISOString();
}

function buildResumePreview(report: any): string {
  const source = String(
    report?.summary || report?.score_comment_short || report?.score_comment_long || "Resume report"
  ).trim();

  if (!source) return "Resume report";

  if (source.length <= 200) return source;
  const preview = source.slice(0, 200);
  const lastSpace = preview.lastIndexOf(" ");
  return `${preview.slice(0, lastSpace > 120 ? lastSpace : 200)}...`;
}

function buildReportTrustMetadata(report: any) {
  const topFixes = Array.isArray(report?.top_fixes) ? report.top_fixes : [];
  const evidence = topFixes
    .map((fix: any) => ({
      fix: fix?.fix || "",
      confidence: fix?.confidence || "medium",
      impact_level: fix?.impact_level || "medium",
      effort: fix?.effort || "moderate",
      excerpt: typeof fix?.evidence === "string" ? fix.evidence : fix?.evidence?.excerpt || "",
      section: typeof fix?.evidence === "string" ? fix?.section_ref || "Resume" : fix?.evidence?.section || fix?.section_ref || "Resume"
    }))
    .filter((item: any) => item.fix || item.excerpt);

  const confidenceValues = evidence.map((item: any) => item.confidence);
  const confidence_band = confidenceValues.includes("low")
    ? "low"
    : confidenceValues.includes("medium")
      ? "medium"
      : evidence.length > 0
        ? "high"
        : null;

  return {
    evidence_json: evidence.length > 0 ? evidence : null,
    evidence_version: report?.contract_version || "v2",
    evidence_summary: evidence.length > 0
      ? `${evidence.length} grounded fix${evidence.length === 1 ? "" : "es"} with ${confidence_band || "medium"} overall confidence.`
      : null,
    confidence_band
  };
}

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
    const body = await readJsonWithLimit<any>(request, 256 * 1024);
    const report = body?.report;

    if (!report || typeof report !== "object") {
      return NextResponse.json(
        { ok: false, errorCode: "INVALID_REPORT", message: "Report payload is required." },
        { status: 400 }
      );
    }

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

    const reportId = crypto.randomUUID();
    const serialized = JSON.stringify(report);
    const reportHash = crypto.createHash("sha256").update(serialized).digest("hex");

    const payload = {
      id: reportId,
      user_id: sessionUser.id,
      resume_hash: reportHash,
      score: Number(report?.score || 0),
      score_label: typeof report?.score_label === "string" ? report.score_label : null,
      report_json: report,
      ...buildReportTrustMetadata(report),
      resume_preview: buildResumePreview(report),
      target_role: report?.job_alignment?.role_fit?.best_fit_roles?.[0] || null,
      created_at: nowIso()
    };

    const { error } = await supabase.from("reports").insert(payload);
    if (error) {
      logError({
        msg: "reports.save_failed",
        outcome: "provider_error",
        supabase: { table: "reports", op: "insert", error_code: String(error.code || "SAVE_FAILED") },
        err: { name: "SupabaseError", message: "Report insert failed", code: String(error.code || "SAVE_FAILED") },
      });
      return NextResponse.json(
        { ok: false, errorCode: "SAVE_FAILED", message: "Could not save this report right now." },
        { status: 500 }
      );
    }

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
