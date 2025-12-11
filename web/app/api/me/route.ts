import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/serverClient";

export async function GET() {
    try {
        const supabase = await createSupabaseServerClient();

        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ ok: true, user: null });
        }

        // Optionally fetch user profile data from your own table
        // const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();

        return NextResponse.json({
            ok: true,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.user_metadata?.first_name || null
            }
        });
    } catch (error) {
        console.error("Get user error:", error);
        return NextResponse.json(
            { ok: false, user: null },
            { status: 500 }
        );
    }
}
