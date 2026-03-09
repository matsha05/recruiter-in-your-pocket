import { NextResponse } from "next/server";
import { getLaunchReadinessSnapshot } from "@/lib/launch/readiness";
import { createSupabaseServerClient } from "@/lib/supabase/serverClient";
import { shouldProtectInternalLaunchSurfaceForRequest } from "@/lib/launch/access";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    if (shouldProtectInternalLaunchSurfaceForRequest(request)) {
      const supabase = await createSupabaseServerClient();
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        return NextResponse.json(
          { ok: false, goNoGo: false, message: "Internal launch readiness is restricted." },
          { status: 401 }
        );
      }
    }

    const snapshot = await getLaunchReadinessSnapshot();
    return NextResponse.json(snapshot, { status: snapshot.ok ? 200 : 500 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, goNoGo: false, message: err?.message || "Not ready", checks: [], gates: [], blockers: [] }, { status: 500 });
  }
}
