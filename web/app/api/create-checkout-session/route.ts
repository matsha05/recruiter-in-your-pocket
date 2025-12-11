import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/serverClient";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export async function POST(request: Request) {
  // Guard: require API_BASE to be set
  if (!API_BASE) {
    console.error("[create-checkout-session] NEXT_PUBLIC_API_BASE not set");
    return NextResponse.json(
      { ok: false, message: "Server configuration error. Contact support." },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();

    // Get Supabase session to extract access token
    const supabase = await createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) {
      return NextResponse.json(
        { ok: false, message: "Please sign in to continue to checkout." },
        { status: 401 }
      );
    }

    const res = await fetch(`${API_BASE}/api/create-checkout-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Pass Supabase access token as Bearer token
        "Authorization": `Bearer ${session.access_token}`,
        // Also forward cookies as fallback
        Cookie: request.headers.get("cookie") || ""
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("[create-checkout-session] Proxy error:", err?.message);
    return NextResponse.json(
      { ok: false, message: err?.message || "Checkout failed" },
      { status: 500 }
    );
  }
}
