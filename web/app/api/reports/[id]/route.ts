import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/serverClient";

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
      .select("report_json, job_description_text, target_role, resume_variant")
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

    return NextResponse.json({
      ok: true,
      report: data.report_json,
      jdPreview: data.job_description_text?.slice(0, 200) || null,
      targetRole: data.target_role || null,
      resumeVariant: data.resume_variant || null
    });
  } catch (error) {
    console.error("API /reports/[id] error:", error);
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

    // Delete only if user owns this report
    const { error } = await supabase
      .from("reports")
      .delete()
      .eq("id", reportId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Delete report error:", error);
      return NextResponse.json(
        { ok: false, errorCode: "DELETE_FAILED", message: "Could not delete this report." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, message: "Report deleted." });
  } catch (error) {
    console.error("API DELETE /reports/[id] error:", error);
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
      console.error("Update report error:", error);
      return NextResponse.json(
        { ok: false, errorCode: "UPDATE_FAILED", message: "Could not update this report." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, message: "Report updated." });
  } catch (error) {
    console.error("API PATCH /reports/[id] error:", error);
    return NextResponse.json({ ok: false, message: "Failed to rename report" }, { status: 500 });
  }
}
