import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/serverClient";
import { logError } from "@/lib/observability/logger";
import { parseTrustedStoredReport } from "@/lib/reports/report-trust";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: reportId } = await context.params;

    if (!reportId || typeof reportId !== "string" || reportId.length < 10) {
      return NextResponse.json(
        { ok: false, errorCode: "INVALID_REPORT_ID", message: "Invalid report ID.", report: null },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      return NextResponse.json(
        { ok: false, errorCode: "AUTH_REQUIRED", message: "Please log in to view this report.", report: null },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from("reports")
      .select("report_json, evidence_version, evidence_json, job_description_text, target_role, resume_variant")
      .eq("id", reportId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { ok: false, errorCode: "FETCH_REPORT_FAILED", message: "Could not load this report. Please try again.", report: null },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { ok: false, errorCode: "REPORT_NOT_FOUND", message: "Report not found or you don't have access to it.", report: null },
        { status: 404 }
      );
    }

    const trustedReport = parseTrustedStoredReport(
      data.report_json,
      data.evidence_version,
      data.evidence_json,
      user.id,
    );
    if (!trustedReport) {
      return NextResponse.json(
        { ok: false, errorCode: "UNTRUSTED_REPORT", message: "This report must be rerun before it can be displayed.", report: null },
        { status: 409 },
      );
    }

    return NextResponse.json({
      ok: true,
      report: { ...trustedReport, report_id: reportId },
      jdPreview: data.job_description_text?.slice(0, 200) || null,
      targetRole: data.target_role || null,
      resumeVariant: data.resume_variant || null
    });
  } catch (error: any) {
    logError({ msg: "reports.detail_failed", outcome: "internal_error", err: { name: error?.name || "Error", message: error?.message || "Failed to fetch report", code: error?.code } });
    return NextResponse.json({ ok: false, report: null, message: "Failed to fetch report" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: reportId } = await context.params;

    if (!reportId || typeof reportId !== "string" || reportId.length < 10) {
      return NextResponse.json(
        { ok: false, errorCode: "INVALID_REPORT_ID", message: "Invalid report ID." },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      return NextResponse.json(
        { ok: false, errorCode: "AUTH_REQUIRED", message: "Please log in to delete this report." },
        { status: 401 }
      );
    }

    // First verify the report exists and belongs to this user
    const { data: existingReport, error: fetchError } = await supabase
      .from("reports")
      .select("id")
      .eq("id", reportId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (fetchError) {
      logError({
        msg: "reports.delete_ownership_check_failed",
        outcome: "provider_error",
        supabase: { table: "reports", op: "select", error_code: String(fetchError.code || "DELETE_FETCH_FAILED") },
        err: { name: "SupabaseError", message: "Report ownership check failed", code: String(fetchError.code || "DELETE_FETCH_FAILED") },
      });
      return NextResponse.json(
        { ok: false, errorCode: "DELETE_FAILED", message: "Could not verify report ownership." },
        { status: 500 }
      );
    }

    if (!existingReport) {
      return NextResponse.json(
        { ok: false, errorCode: "REPORT_NOT_FOUND", message: "Report not found or you don't have permission to delete it." },
        { status: 404 }
      );
    }

    // Now delete the report
    const { error: deleteError } = await supabase
      .from("reports")
      .delete()
      .eq("id", reportId)
      .eq("user_id", user.id);

    if (deleteError) {
      logError({
        msg: "reports.delete_failed",
        outcome: "provider_error",
        supabase: { table: "reports", op: "delete", error_code: String(deleteError.code || "DELETE_FAILED") },
        err: { name: "SupabaseError", message: "Report delete failed", code: String(deleteError.code || "DELETE_FAILED") },
      });
      return NextResponse.json(
        { ok: false, errorCode: "DELETE_FAILED", message: "Could not delete this report." },
        { status: 500 }
      );
    }

    // Verify it's actually gone
    const { data: stillExists } = await supabase
      .from("reports")
      .select("id")
      .eq("id", reportId)
      .maybeSingle();

    if (stillExists) {
      logError({
        msg: "reports.delete_verification_failed",
        outcome: "internal_error",
        supabase: { table: "reports", op: "delete", error_code: "DELETE_VERIFICATION_FAILED" },
        err: { name: "ReportDeleteError", message: "Report still existed after deletion", code: "DELETE_VERIFICATION_FAILED" },
      });
      return NextResponse.json(
        { ok: false, errorCode: "DELETE_FAILED", message: "Delete appeared to succeed but report still exists. Check RLS policies." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, message: "Report deleted." });
  } catch (error: any) {
    logError({ msg: "reports.delete_failed", outcome: "internal_error", err: { name: error?.name || "Error", message: error?.message || "Failed to delete report", code: error?.code } });
    return NextResponse.json({ ok: false, message: "Failed to delete report" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: reportId } = await context.params;

    if (!reportId || typeof reportId !== "string" || reportId.length < 10) {
      return NextResponse.json(
        { ok: false, errorCode: "INVALID_REPORT_ID", message: "Invalid report ID." },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      return NextResponse.json(
        { ok: false, errorCode: "AUTH_REQUIRED", message: "Please log in to rename this report." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, resume_variant } = body;

    // Build update payload
    const updates: Record<string, any> = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.length > 100) {
        return NextResponse.json(
          { ok: false, errorCode: "INVALID_NAME", message: "Name must be a string under 100 characters." },
          { status: 400 }
        );
      }
      updates.name = name.trim() || null;
    }

    if (resume_variant !== undefined) {
      if (typeof resume_variant !== "string" || resume_variant.length > 50) {
        return NextResponse.json(
          { ok: false, errorCode: "INVALID_VARIANT", message: "Variant must be a string under 50 characters." },
          { status: 400 }
        );
      }
      updates.resume_variant = resume_variant.trim() || null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { ok: false, errorCode: "NO_UPDATES", message: "No valid fields to update." },
        { status: 400 }
      );
    }

    // Update only if user owns this report
    const { error } = await supabase
      .from("reports")
      .update(updates)
      .eq("id", reportId)
      .eq("user_id", user.id);

    if (error) {
      logError({
        msg: "reports.update_failed",
        outcome: "provider_error",
        supabase: { table: "reports", op: "update", error_code: String(error.code || "UPDATE_FAILED") },
        err: { name: "SupabaseError", message: "Report update failed", code: String(error.code || "UPDATE_FAILED") },
      });
      return NextResponse.json(
        { ok: false, errorCode: "UPDATE_FAILED", message: "Could not update this report." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, message: "Report updated." });
  } catch (error: any) {
    logError({ msg: "reports.update_failed", outcome: "internal_error", err: { name: error?.name || "Error", message: error?.message || "Failed to update report", code: error?.code } });
    return NextResponse.json({ ok: false, message: "Failed to rename report" }, { status: 500 });
  }
}
