import { NextResponse } from "next/server";
import { paidJourneyHealth } from "@/lib/launch/paidJourneyHealth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** 503 while purchases or new reports are switched off; /api/status shows the same state to visitors. */
export async function GET() {
  const health = paidJourneyHealth();
  return NextResponse.json(health, {
    status: health.ok ? 200 : 503,
    headers: { "cache-control": "no-store" },
  });
}
