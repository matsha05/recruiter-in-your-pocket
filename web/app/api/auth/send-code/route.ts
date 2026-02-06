import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerAction } from "@/lib/supabase/serverClient";
import { getRequestId, routeLabel } from "@/lib/observability/requestContext";
import { hashForLogs, logError, logInfo, logWarn } from "@/lib/observability/logger";
import { rateLimitAsync } from "@/lib/security/rateLimit";
import { readJsonWithLimit } from "@/lib/security/requestBody";

type AuthDeliveryMode = "otp" | "magic_link";

function normalizeMode(input: unknown): AuthDeliveryMode {
    if (typeof input !== "string") return "otp";
    const trimmed = input.trim().toLowerCase();
    return trimmed === "magic_link" ? "magic_link" : "otp";
}

function getBaseUrl() {
    if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return "http://localhost:3000";
}

function inferErrorCode(message: string): { code: string; hint?: string } {
    const lowered = message.toLowerCase();
    if (lowered.includes("otp") && lowered.includes("disabled")) {
        return { code: "otp_disabled", hint: "Email codes are disabled for this project." };
    }
    if (lowered.includes("smtp") || lowered.includes("email provider")) {
        return { code: "email_provider", hint: "Email delivery is not configured." };
    }
    if (lowered.includes("rate") && lowered.includes("limit")) {
        return { code: "rate_limited", hint: "Too many attempts. Try again shortly." };
    }
    return { code: "provider_error" };
}

export async function POST(request: NextRequest) {
    const request_id = getRequestId(request);
    const { method, path } = routeLabel(request);
    const route = `${method} ${path}`;
    const startedAt = Date.now();
    logInfo({ msg: "http.request.started", request_id, route, method, path });

    try {
        const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
        const rl = await rateLimitAsync(`ip:${hashForLogs(ip)}:${path}`, 5, 60_000);
        if (!rl.ok) {
            const res = NextResponse.json({ ok: false, message: "Too many attempts. Try again shortly." }, { status: 429 });
            res.headers.set("x-request-id", request_id);
            res.headers.set("retry-after", String(Math.ceil(rl.resetMs / 1000)));
            logWarn({ msg: "http.request.completed", request_id, route, method, path, status: 429, latency_ms: Date.now() - startedAt, outcome: "rate_limited" });
            return res;
        }

        const body = await readJsonWithLimit<any>(request, 16 * 1024);
        const email = body?.email;
        const mode = normalizeMode(body?.mode);
        const nextParam = typeof body?.next === "string" && body.next.startsWith("/") ? body.next : "/workspace";

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
        const emailRedirectTo = mode === "magic_link"
            ? `${getBaseUrl()}/auth/callback?next=${encodeURIComponent(nextParam)}`
            : undefined;

        // Send OTP email via Supabase Auth (8-digit code) or magic link fallback
        const { error } = await supabase.auth.signInWithOtp({
            email: email.trim(),
            options: {
                shouldCreateUser: true,
                emailRedirectTo
            }
        });

        if (error) {
            // Avoid leaking account existence or provider internals.
            const normalized = inferErrorCode(error.message || "provider_error");
            logError({
                msg: "auth.send_code.failed",
                request_id,
                route,
                method,
                path,
                outcome: "provider_error",
                err: { name: "SupabaseError", message: error.message }
            });
            const res = NextResponse.json(
                {
                    ok: false,
                    message: "Could not send code. Try again shortly.",
                    errorCode: normalized.code,
                    hint: normalized.hint
                },
                { status: 400 }
            );
            res.headers.set("x-request-id", request_id);
            return res;
        }

        const res = NextResponse.json({ ok: true, message: mode === "magic_link" ? "Link sent" : "Code sent", mode });
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
