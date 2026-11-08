import { NextResponse, type NextRequest } from "next/server";
import { getOptionalSupabaseAnonKey, getOptionalSupabaseUrl } from "@/lib/env";
import { logError, logInfo } from "@/lib/observability/logger";
import { cronRequestAllowed, pingDatabase } from "@/lib/ops/database-keepalive";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ROUTE = "/api/cron/supabase-keepalive";

// Called once a day by the cron in web/vercel.json. It replaced the GitHub
// Actions keepalive after Actions stopped starting jobs in November 2026.
export async function GET(request: NextRequest) {
  if (!cronRequestAllowed(request.headers.get("authorization"), process.env.CRON_SECRET)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const url = getOptionalSupabaseUrl();
  const key = getOptionalSupabaseAnonKey();
  if (!url || !key) {
    logError({ msg: "supabase.keepalive.not_configured", route: ROUTE, status: 503 });
    return NextResponse.json({ ok: false, reason: "not_configured" }, { status: 503 });
  }

  const result = await pingDatabase({ url, key });
  const status = result.ok ? 200 : 502;
  const supabase = {
    op: "keepalive",
    rows: result.tables.length,
    ...(result.ok
      ? {}
      : { error_code: result.tables.map(({ table, status }) => `${table}:${status ?? "network"}`).join(",") }),
  };
  if (result.ok) {
    logInfo({ msg: "supabase.keepalive.completed", route: ROUTE, status, supabase });
  } else {
    logError({ msg: "supabase.keepalive.failed", route: ROUTE, status, supabase });
  }
  return NextResponse.json(result, { status });
}
