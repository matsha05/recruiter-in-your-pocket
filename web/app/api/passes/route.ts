import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/serverClient";
import { logError } from "@/lib/observability/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("passes")
      .select("id, tier, uses_remaining, expires_at, created_at, checkout_session_id, price_id, revoked_at, revocation_reason")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ ok: false, message: "Failed to fetch passes" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, passes: data || [] });
  } catch (err: any) {
    logError({
      msg: "billing.passes_failed",
      outcome: "internal_error",
      err: { name: err?.name || "Error", message: err?.message || "Failed to fetch passes", code: err?.code },
    });
    return NextResponse.json({ ok: false, message: err?.message || "Failed to fetch passes" }, { status: 500 });
  }
}
