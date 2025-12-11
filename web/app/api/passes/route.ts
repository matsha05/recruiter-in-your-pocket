import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/serverClient";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export async function GET(request: Request) {
    try {
        // Get authenticated user
        const supabase = await createSupabaseServerClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
            return NextResponse.json(
                { ok: false, message: "Not authenticated" },
                { status: 401 }
            );
        }

        // Fetch passes from backend
        const res = await fetch(`${API_BASE}/api/passes`, {
            headers: {
                "Authorization": `Bearer ${session.access_token}`,
                "Cookie": request.headers.get("cookie") || ""
            }
        });

        if (!res.ok) {
            // Return empty array if backend doesn't have passes endpoint yet
            return NextResponse.json({ ok: true, passes: [] });
        }

        const data = await res.json();
        return NextResponse.json(data);

    } catch (err: any) {
        console.error("[passes] Error:", err?.message);
        return NextResponse.json(
            { ok: false, message: err?.message || "Failed to fetch passes" },
            { status: 500 }
        );
    }
}
