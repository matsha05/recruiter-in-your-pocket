import { NextResponse } from "next/server";
import crypto from "crypto";
import { createSupabaseServerClient } from "@/lib/supabase/serverClient";
import { createSupabaseAdminClient } from "@/lib/supabase/adminClient";
import { inngest } from "@/lib/inngest/client";
import { buildAccountExportPayload } from "@/lib/backend/accountExport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EXPORT_TTL_DAYS = 7;
const EXPORT_LOOKBACK_LIMIT = 10;

type ExportJobStatus = "pending" | "running" | "completed" | "failed" | "expired";

function addDays(now: Date, days: number): string {
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
}

function serializeJob(job: any) {
  return {
    id: job.id,
    status: job.status as ExportJobStatus,
    format: job.format || "json",
    requested_at: job.requested_at || job.created_at,
    started_at: job.started_at || null,
    completed_at: job.completed_at || null,
    expires_at: job.expires_at || null,
    error_message: job.error_message || null,
  };
}

async function runInlineExportJob(admin: any, jobId: string, user: any) {
  await admin
    .from("account_export_jobs")
    .update({
      status: "running",
      started_at: new Date().toISOString(),
      error_message: null,
    })
    .eq("id", jobId)
    .eq("user_id", user.id);

  try {
    const payload = await buildAccountExportPayload(admin, user);
    await admin
      .from("account_export_jobs")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        expires_at: addDays(new Date(), EXPORT_TTL_DAYS),
        result_json: payload,
        error_message: null,
      })
      .eq("id", jobId)
      .eq("user_id", user.id);
  } catch (err: any) {
    await admin
      .from("account_export_jobs")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
        error_message: err?.message || "Export failed",
      })
      .eq("id", jobId)
      .eq("user_id", user.id);
    throw err;
  }
}

export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    if (!user?.id) {
      return NextResponse.json({ ok: false, message: "Please log in first." }, { status: 401 });
    }

    const admin = createSupabaseAdminClient();
    if (!admin) {
      return NextResponse.json({ ok: false, message: "Export is temporarily unavailable." }, { status: 500 });
    }

    const jobId = crypto.randomUUID();
    const nowIso = new Date().toISOString();

    const { error: insertError } = await admin.from("account_export_jobs").insert({
      id: jobId,
      user_id: user.id,
      status: "pending",
      format: "json",
      requested_at: nowIso,
      created_at: nowIso,
      updated_at: nowIso,
    });

    if (insertError) {
      return NextResponse.json({ ok: false, message: "Could not create export job." }, { status: 500 });
    }

    try {
      await inngest.send({
        name: "account/export.requested",
        data: {
          jobId,
          userId: user.id,
          userEmail: user.email || null,
        },
      });
    } catch {
      // Fallback keeps export functional when Inngest is unavailable locally.
      await runInlineExportJob(admin, jobId, user);
    }

    const { data: job } = await admin
      .from("account_export_jobs")
      .select("id, status, format, requested_at, started_at, completed_at, expires_at, error_message")
      .eq("id", jobId)
      .eq("user_id", user.id)
      .maybeSingle();

    return NextResponse.json(
      {
        ok: true,
        job: job ? serializeJob(job) : { id: jobId, status: "pending", format: "json" },
      },
      { status: 202 }
    );
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: err?.message || "Export request failed." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    if (!user?.id) {
      return NextResponse.json({ ok: false, message: "Please log in first." }, { status: 401 });
    }

    const admin = createSupabaseAdminClient();
    if (!admin) {
      return NextResponse.json({ ok: false, message: "Export is temporarily unavailable." }, { status: 500 });
    }

    const url = new URL(request.url);
    const jobId = url.searchParams.get("jobId");
    const download = url.searchParams.get("download") === "1";

    if (!jobId) {
      const { data: jobs, error } = await admin
        .from("account_export_jobs")
        .select("id, status, format, requested_at, started_at, completed_at, expires_at, error_message")
        .eq("user_id", user.id)
        .order("requested_at", { ascending: false })
        .limit(EXPORT_LOOKBACK_LIMIT);

      if (error) {
        return NextResponse.json({ ok: false, message: "Failed to load export jobs." }, { status: 500 });
      }

      return NextResponse.json({
        ok: true,
        jobs: (jobs || []).map(serializeJob),
      });
    }

    const { data: job, error } = await admin
      .from("account_export_jobs")
      .select("id, status, format, requested_at, started_at, completed_at, expires_at, error_message, result_json")
      .eq("id", jobId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ ok: false, message: "Failed to load export job." }, { status: 500 });
    }
    if (!job) {
      return NextResponse.json({ ok: false, message: "Export job not found." }, { status: 404 });
    }

    if (!download) {
      return NextResponse.json({ ok: true, job: serializeJob(job) });
    }

    if (job.status !== "completed") {
      return NextResponse.json(
        { ok: false, message: "Export is not ready yet.", job: serializeJob(job) },
        { status: 409 }
      );
    }

    if (!job.result_json) {
      return NextResponse.json(
        { ok: false, message: "Export completed without downloadable content.", job: serializeJob(job) },
        { status: 500 }
      );
    }

    const filename = `riyp-account-export-${new Date().toISOString().slice(0, 10)}.json`;
    return new NextResponse(JSON.stringify(job.result_json, null, 2), {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "content-disposition": `attachment; filename=\"${filename}\"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: err?.message || "Export failed." }, { status: 500 });
  }
}
