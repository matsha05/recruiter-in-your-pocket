import { NextResponse } from "next/server";
import { createSupabaseServerAction } from "@/lib/supabase/serverClient";

export async function POST() {
    try {
        const supabase = await createSupabaseServerAction();

        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error("Sign out error:", error);
            return NextResponse.json(
                { ok: false, message: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Sign out error:", error);
        return NextResponse.json(
            { ok: false, message: "Failed to sign out" },
            { status: 500 }
        );
    }
}
