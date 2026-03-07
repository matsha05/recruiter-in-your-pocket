import { NextResponse } from "next/server";
import { getLaunchReadinessSnapshot } from "@/lib/launch/readiness";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const snapshot = await getLaunchReadinessSnapshot();
    return NextResponse.json(snapshot, { status: snapshot.ok ? 200 : 500 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, goNoGo: false, message: err?.message || "Not ready", checks: [], gates: [], blockers: [] }, { status: 500 });
  }
}
