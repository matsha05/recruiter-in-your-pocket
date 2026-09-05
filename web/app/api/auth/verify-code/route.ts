import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerAction } from "@/lib/supabase/serverClient";
import { getRequestId, routeLabel } from "@/lib/observability/requestContext";
import { hashForLogs, logError, logInfo, logWarn } from "@/lib/observability/logger";
import { rateLimitAsync } from "@/lib/security/rateLimit";
import { readJsonWithLimit } from "@/lib/security/requestBody";

export async function POST(request: NextRequest) {
    const request_id = getRequestId(request);
    const { method, path } = routeLabel(request);
    const route = `${method} ${path}`;
    const startedAt = Date.now();
    logInfo({ msg: "http.request.started", request_id, route, method, path });

    try {
        const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
        const rl = await rateLimitAsync(`ip:${hashForLogs(ip)}:${path}`, 15, 60_000);
        if (!rl.ok) {
            const res = NextResponse.json({ ok: false, message: "Too many attempts. Try again shortly." }, { status: 429 });
            res.headers.set("x-request-id", request_id);
            res.headers.set("retry-after", String(Math.ceil(rl.resetMs / 1000)));
            logWarn({ msg: "http.request.completed", request_id, route, method, path, status: 429, latency_ms: Date.now() - startedAt, outcome: "rate_limited" });
            return res;
        }

        const body = await readJsonWithLimit<any>(request, 16 * 1024);
        const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
        const code = typeof body?.code === "string" ? body.code.trim() : "";

        if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{8}$/.test(code)) {
            const res = NextResponse.json(
                { ok: false, message: "Enter your email address and sign-in code." },
                { status: 400 }
            );
            res.headers.set("x-request-id", request_id);
            logInfo({ msg: "http.request.completed", request_id, route, method, path, status: 400, latency_ms: Date.now() - startedAt, outcome: "validation_error" });
            return res;
        }

        const emailLimit = await rateLimitAsync(`email:${hashForLogs(email)}:${path}`, 8, 10 * 60_000);
        if (!emailLimit.ok) {
            const res = NextResponse.json({ ok: false, message: "Too many code attempts. Request a new code and try again later." }, { status: 429 });
            res.headers.set("x-request-id", request_id);
            res.headers.set("retry-after", String(Math.ceil(emailLimit.resetMs / 1000)));
            logWarn({ msg: "http.request.completed", request_id, route, method, path, status: 429, latency_ms: Date.now() - startedAt, outcome: "rate_limited" });
            return res;
        }

        const supabase = await createSupabaseServerAction();

        // Verify OTP code
        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token: code,
            type: "email"
        });

        if (error) {
            logError({
                msg: "auth.verify_code.failed",
                request_id,
                route,
                method,
                path,
                outcome: "provider_error",
                err: { name: "SupabaseError", message: error.message }
            });
            const res = NextResponse.json({ ok: false, message: "That code was not accepted. Check the latest email or request a new code." }, { status: 400 });
            res.headers.set("x-request-id", request_id);
            return res;
        }

        if (!data.user) {
            const res = NextResponse.json(
                { ok: false, message: "Could not complete sign-in. Try again." },
                { status: 400 }
            );
            res.headers.set("x-request-id", request_id);
            logInfo({ msg: "http.request.completed", request_id, route, method, path, status: 400, latency_ms: Date.now() - startedAt, outcome: "validation_error" });
            return res;
        }

        // Return user info
        const res = NextResponse.json({
            ok: true,
            user: {
                id: data.user.id,
                email: data.user.email,
                firstName: data.user.user_metadata?.first_name || null
            }
        });
        res.headers.set("x-request-id", request_id);
        logInfo({ msg: "http.request.completed", request_id, route, method, path, status: 200, latency_ms: Date.now() - startedAt, outcome: "success", user_id: data.user.id });
        return res;
    } catch (error) {
        logError({
            msg: "http.request.completed",
            request_id,
            route,
            method,
            path,
            status: 500,
            latency_ms: Date.now() - startedAt,
            outcome: "internal_error",
            err: { name: (error as any)?.name || "Error", message: (error as any)?.message || "Failed to verify code", stack: (error as any)?.stack }
        });
        const res = NextResponse.json(
            { ok: false, message: "Could not check your sign-in code. Try again." },
            { status: 500 }
        );
        res.headers.set("x-request-id", request_id);
        return res;
    }
}
