import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerAction } from "@/lib/supabase/serverClient";

export async function POST(request: NextRequest) {
    try {
        const { email, code } = await request.json();

        if (!email || !code) {
            return NextResponse.json(
                { ok: false, message: "Email and code are required" },
                { status: 400 }
            );
        }

        const supabase = await createSupabaseServerAction();

        // Verify OTP code
        const { data, error } = await supabase.auth.verifyOtp({
            email: email.trim(),
            token: code.trim(),
            type: "email"
        });

        if (error) {
            console.error("Supabase verify error:", error);
            return NextResponse.json(
                { ok: false, message: error.message },
                { status: 400 }
            );
        }

        if (!data.user) {
            return NextResponse.json(
                { ok: false, message: "Verification failed" },
                { status: 400 }
            );
        }

        // Return user info
        return NextResponse.json({
            ok: true,
            user: {
                id: data.user.id,
                email: data.user.email,
                firstName: data.user.user_metadata?.first_name || null
            }
        });
    } catch (error) {
        console.error("Verify code error:", error);
        return NextResponse.json(
            { ok: false, message: "Failed to verify code" },
            { status: 500 }
        );
    }
}
