import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerAction } from "@/lib/supabase/serverClient";

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email || typeof email !== "string") {
            return NextResponse.json(
                { ok: false, message: "Email is required" },
                { status: 400 }
            );
        }

        const supabase = await createSupabaseServerAction();

        // Send OTP email via Supabase Auth (6-digit code, not magic link)
        const { error } = await supabase.auth.signInWithOtp({
            email: email.trim(),
            options: {
                shouldCreateUser: true,
                // Don't send magic link, just the code
                emailRedirectTo: undefined,
            }
        });

        if (error) {
            console.error("Supabase OTP error:", error);
            return NextResponse.json(
                { ok: false, message: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json({ ok: true, message: "Code sent" });
    } catch (error) {
        console.error("Send code error:", error);
        return NextResponse.json(
            { ok: false, message: "Failed to send code" },
            { status: 500 }
        );
    }
}
