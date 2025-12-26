import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/serverClient";

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
      .select("id, score, score_label, resume_preview, name, created_at")
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
      name: r.name || undefined
    }));

    return NextResponse.json({ ok: true, reports });
  } catch (error) {
    console.error("API /reports error:", error);
    return NextResponse.json({ ok: false, reports: [] }, { status: 500 });
  }
}
