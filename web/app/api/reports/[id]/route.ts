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
      .select("report_json")
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

    return NextResponse.json({ ok: true, report: data.report_json });
  } catch (error) {
    console.error("API /reports/[id] error:", error);
    return NextResponse.json({ ok: false, report: null, message: "Failed to fetch report" }, { status: 500 });
  }
}
