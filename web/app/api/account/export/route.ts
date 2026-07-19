import { NextResponse } from "next/server";
import crypto from "crypto";
import { createSupabaseServerClient } from "@/lib/supabase/serverClient";
import { createSupabaseAdminClient } from "@/lib/supabase/adminClient";
import { inngest } from "@/lib/inngest/client";
import { buildAccountExportPayload } from "@/lib/backend/accountExport";
import {
  accountExportExpiresAt,
  expireAccountExportResults,
  resolveAccountExportAccess,
} from "@/lib/backend/accountExportRetention";
import { hashForLogs, logError } from "@/lib/observability/logger";
import { rateLimitAsync } from "@/lib/security/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EXPORT_LOOKBACK_LIMIT = 10;
const EXPORT_CREATE_LIMIT = 3;
const EXPORT_CREATE_WINDOW_MS = 60 * 60 * 1000;
const EXPORT_READ_LIMIT = 120;
const EXPORT_READ_WINDOW_MS = 10 * 60 * 1000;

type ExportJobStatus = "pending" | "running" | "completed" | "failed" | "expired";

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

async function enforceExportRateLimit(userId: string, action: "create" | "read") {
  const isCreate = action === "create";
  return rateLimitAsync(
    `user:${hashForLogs(userId)}:account-export:${action}`,
    isCreate ? EXPORT_CREATE_LIMIT : EXPORT_READ_LIMIT,
    isCreate ? EXPORT_CREATE_WINDOW_MS : EXPORT_READ_WINDOW_MS
  );
}

function rateLimitedResponse(resetMs: number) {
  const response = NextResponse.json(
    { ok: false, errorCode: "RATE_LIMITED", message: "Too many export requests. Try again shortly." },
    { status: 429 }
  );
  response.headers.set("retry-after", String(Math.ceil(resetMs / 1000)));
  return response;
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
        expires_at: accountExportExpiresAt(),
        result_json: payload,
        error_message: null,
      })
      .eq("id", jobId)
      .eq("user_id", user.id);
  } catch (err: any) {
    logError({
      msg: "account.export.inline_failed",
      user_id: user.id,
      outcome: "internal_error",
      err: {
        name: err?.name || "ExportError",
        message: err?.message || "Export generation failed",
      },
    });
    await admin
      .from("account_export_jobs")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
        error_message: "Export generation failed",
      })
      .eq("id", jobId)
      .eq("user_id", user.id);
    throw err;
  }
}

export async function POST(_request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    if (!user?.id) {
      return NextResponse.json({ ok: false, message: "Please log in first." }, { status: 401 });
    }

    const rateLimit = await enforceExportRateLimit(user.id, "create");
    if (!rateLimit.ok) return rateLimitedResponse(rateLimit.resetMs);

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
  } catch {
    return NextResponse.json({ ok: false, message: "Export request failed." }, { status: 500 });
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

    const rateLimit = await enforceExportRateLimit(user.id, "read");
    if (!rateLimit.ok) return rateLimitedResponse(rateLimit.resetMs);

    const admin = createSupabaseAdminClient();
    if (!admin) {
      return NextResponse.json({ ok: false, message: "Export is temporarily unavailable." }, { status: 500 });
    }

    // Enforce retention on every authenticated read as a backstop to the
    // scheduled cleanup. If cleanup cannot be confirmed, no export is served.
    await expireAccountExportResults(admin, { userId: user.id });

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

    const access = resolveAccountExportAccess(job);
    if (access === "expired") {
      return NextResponse.json(
        { ok: false, errorCode: "EXPORT_EXPIRED", message: "This export has expired. Request a new one.", job: serializeJob(job) },
        { status: 410 }
      );
    }

    if (access === "not_ready") {
      return NextResponse.json(
        { ok: false, message: "Export is not ready yet.", job: serializeJob(job) },
        { status: 409 }
      );
    }

    if (access === "missing") {
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
        "cache-control": "private, no-store, max-age=0",
      },
    });
  } catch {
    return NextResponse.json({ ok: false, message: "Export failed." }, { status: 500 });
  }
}
