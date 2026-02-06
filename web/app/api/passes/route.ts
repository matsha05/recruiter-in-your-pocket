import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/serverClient";

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
      .select("id, tier, uses_remaining, expires_at, created_at, checkout_session_id, price_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ ok: false, message: "Failed to fetch passes" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, passes: data || [] });
  } catch (err: any) {
    console.error("[passes] Error:", err?.message);
    return NextResponse.json({ ok: false, message: err?.message || "Failed to fetch passes" }, { status: 500 });
  }
}
