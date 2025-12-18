import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerAction } from "@/lib/supabase/serverClient";
import { getRequestId, routeLabel } from "@/lib/observability/requestContext";
import { hashForLogs, logError, logInfo } from "@/lib/observability/logger";
import { rateLimit } from "@/lib/security/rateLimit";
import { readJsonWithLimit } from "@/lib/security/requestBody";

export async function POST(request: NextRequest) {
    const request_id = getRequestId(request);
    const { method, path } = routeLabel(request);
    const route = `${method} ${path}`;
    const startedAt = Date.now();
    logInfo({ msg: "http.request.started", request_id, route, method, path });

    try {
        const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
        const rl = rateLimit(`ip:${hashForLogs(ip)}:${path}`, 5, 60_000);
        if (!rl.ok) {
            const res = NextResponse.json({ ok: false, message: "Too many attempts. Try again shortly." }, { status: 429 });
            res.headers.set("x-request-id", request_id);
            res.headers.set("retry-after", String(Math.ceil(rl.resetMs / 1000)));
            logInfo({ msg: "http.request.completed", request_id, route, method, path, status: 429, latency_ms: Date.now() - startedAt, outcome: "rate_limited" });
            return res;
        }

        const body = await readJsonWithLimit<any>(request, 16 * 1024);
        const email = body?.email;

        if (!email || typeof email !== "string") {
            const res = NextResponse.json(
                { ok: false, message: "Email is required" },
                { status: 400 }
            );
            res.headers.set("x-request-id", request_id);
            logInfo({ msg: "http.request.completed", request_id, route, method, path, status: 400, latency_ms: Date.now() - startedAt, outcome: "validation_error" });
            return res;
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
            // Avoid leaking account existence or provider internals.
            logError({
                msg: "auth.send_code.failed",
                request_id,
                route,
                method,
                path,
                outcome: "provider_error",
                err: { name: "SupabaseError", message: error.message }
            });
            const res = NextResponse.json({ ok: false, message: "Could not send code. Try again shortly." }, { status: 400 });
            res.headers.set("x-request-id", request_id);
            return res;
        }

        const res = NextResponse.json({ ok: true, message: "Code sent" });
        res.headers.set("x-request-id", request_id);
        logInfo({ msg: "http.request.completed", request_id, route, method, path, status: 200, latency_ms: Date.now() - startedAt, outcome: "success" });
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
            err: { name: (error as any)?.name || "Error", message: (error as any)?.message || "Failed to send code", stack: (error as any)?.stack }
        });
        const res = NextResponse.json(
            { ok: false, message: "Failed to send code" },
            { status: 500 }
        );
        res.headers.set("x-request-id", request_id);
        return res;
    }
}
