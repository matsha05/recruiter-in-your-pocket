import { NextResponse } from "next/server";
import { getRedisClient } from "@/lib/redis/client";
import { logInfo, logWarn } from "@/lib/observability/logger";
import { PUBLIC_PAGES } from "@/lib/seo/public-pages";
import { pagesToSubmit, submitToIndexNow, submittedAfter, type SubmittedPages } from "@/lib/seo/indexnow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUBMITTED_KEY = "seo:indexnow:submitted";

// Called once a day by the Vercel cron (web/vercel.json). It needs no secret:
// it only ever sends our own public URLs, and only the ones that changed since
// the last send, so a stray request finds nothing to do.
export async function GET() {
  if (process.env.VERCEL_ENV !== "production") {
    return NextResponse.json({ ok: true, submitted: 0, reason: "not_production" });
  }

  const redis = getRedisClient();
  if (!redis) {
    // Without the record of what was sent, every run would resend every page.
    logWarn({ msg: "indexnow.no_store", route: "/api/indexnow" });
    return NextResponse.json({ ok: false, submitted: 0, reason: "no_store" }, { status: 503 });
  }

  const submitted = (await redis.get<SubmittedPages>(SUBMITTED_KEY)) ?? {};
  const pages = pagesToSubmit(PUBLIC_PAGES, submitted);
  if (pages.length === 0) {
    return NextResponse.json({ ok: true, submitted: 0 });
  }

  const result = await submitToIndexNow(pages);
  if (!result.ok) {
    // Nothing is recorded, so tomorrow's run sends the same pages again.
    logWarn({ msg: "indexnow.submit_failed", route: "/api/indexnow", status: result.status ?? undefined });
    return NextResponse.json({ ok: false, submitted: 0, status: result.status }, { status: 502 });
  }

  await redis.set(SUBMITTED_KEY, submittedAfter(PUBLIC_PAGES));
  logInfo({ msg: "indexnow.submitted", route: "/api/indexnow", status: result.status });
  return NextResponse.json({ ok: true, submitted: pages.length, paths: pages.map((page) => page.path) });
}
