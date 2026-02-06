import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createSupabaseServerClient } from "@/lib/supabase/serverClient";
import { createSupabaseAdminClient } from "@/lib/supabase/adminClient";
import { readJsonWithLimit } from "@/lib/security/requestBody";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function findUserIdByEmail(admin: any, email: string): Promise<string | null> {
  const perPage = 200;

  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error || !data?.users?.length) break;

    const existing = data.users.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());
    if (existing?.id) return existing.id;

    if (data.users.length < perPage) break;
  }

  return null;
}

async function findOrCreateUserIdByEmail(email: string): Promise<string> {
  const admin = createSupabaseAdminClient();
  if (!admin) {
    throw new Error("Database admin client not configured");
  }

  const existing = await findUserIdByEmail(admin, email);
  if (existing) return existing;

  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    email_confirm: true
  });

  if (!error && created?.user?.id) {
    return created.user.id;
  }

  const fallback = await findUserIdByEmail(admin, email);
  if (fallback) return fallback;

  throw new Error(error?.message || "Could not create account for report save");
}

function nowIso() {
  return new Date().toISOString();
}

function buildResumePreview(report: any): string {
  const source = String(
    report?.summary || report?.score_comment_short || report?.score_comment_long || "Resume review"
  ).trim();

  if (!source) return "Resume review";

  if (source.length <= 200) return source;
  const preview = source.slice(0, 200);
  const lastSpace = preview.lastIndexOf(" ");
  return `${preview.slice(0, lastSpace > 120 ? lastSpace : 200)}...`;
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
  } catch (error) {
    console.error("API /reports error:", error);
    return NextResponse.json({ ok: false, reports: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await readJsonWithLimit<any>(request, 256 * 1024);
    const report = body?.report;
    const emailInput = body?.email;

    if (!report || typeof report !== "object") {
      return NextResponse.json(
        { ok: false, errorCode: "INVALID_REPORT", message: "Report payload is required." },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    const { data: userData } = await supabase.auth.getUser();
    const sessionUser = userData.user;

    let userId: string | null = sessionUser?.id || null;

    if (!userId) {
      if (!emailInput || typeof emailInput !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.trim())) {
        return NextResponse.json(
          { ok: false, errorCode: "EMAIL_REQUIRED", message: "A valid email is required to save this report." },
          { status: 400 }
        );
      }

      userId = await findOrCreateUserIdByEmail(emailInput.trim().toLowerCase());
    }

    const reportId = crypto.randomUUID();
    const serialized = JSON.stringify(report);
    const reportHash = crypto.createHash("sha256").update(serialized).digest("hex");

    const payload = {
      id: reportId,
      user_id: userId,
      resume_hash: reportHash,
      score: Number(report?.score || 0),
      score_label: typeof report?.score_label === "string" ? report.score_label : null,
      report_json: report,
      resume_preview: buildResumePreview(report),
      target_role: report?.job_alignment?.role_fit?.best_fit_roles?.[0] || null,
      created_at: nowIso()
    };

    const admin = createSupabaseAdminClient();
    const dbClient = admin || supabase;

    const { error } = await dbClient.from("reports").insert(payload);
    if (error) {
      console.error("Save report failed:", error);
      return NextResponse.json(
        { ok: false, errorCode: "SAVE_FAILED", message: "Could not save this report right now." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, reportId });
  } catch (error: any) {
    console.error("API POST /reports error:", error);
    return NextResponse.json(
      { ok: false, message: error?.message || "Failed to save report" },
      { status: 500 }
    );
  }
}
