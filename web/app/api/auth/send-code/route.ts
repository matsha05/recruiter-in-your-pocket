import { NextRequest, NextResponse } from "next/server";
import { AuthEmailDeliveryError, sendAuthOtpEmail } from "@/lib/auth/otpEmail";
import { createSupabaseAdminClient } from "@/lib/supabase/adminClient";
import { getRequestId, routeLabel } from "@/lib/observability/requestContext";
import { captureOperationalError } from "@/lib/observability/operations";
import { hashForLogs, logError, logInfo, logWarn } from "@/lib/observability/logger";
import { rateLimitAsync } from "@/lib/security/rateLimit";
import { readJsonWithLimit } from "@/lib/security/requestBody";
import { isValidAuthEmail, normalizeAuthEmail } from "@/lib/auth/utils";

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
        const email = normalizeAuthEmail(body?.email);
        if (!isValidAuthEmail(email)) {
            const res = NextResponse.json(
                { ok: false, message: "Please enter a valid email address" },
                { status: 400 }
            );
            res.headers.set("x-request-id", request_id);
            logInfo({ msg: "http.request.completed", request_id, route, method, path, status: 400, latency_ms: Date.now() - startedAt, outcome: "validation_error" });
            return res;
        }

        const emailLimit = await rateLimitAsync(`email:${hashForLogs(email)}:${path}`, 3, 10 * 60_000);
        if (!emailLimit.ok) {
            const res = NextResponse.json({ ok: false, message: "Too many attempts for this email. Try again later." }, { status: 429 });
            res.headers.set("x-request-id", request_id);
            res.headers.set("retry-after", String(Math.ceil(emailLimit.resetMs / 1000)));
            logWarn({ msg: "http.request.completed", request_id, route, method, path, status: 429, latency_ms: Date.now() - startedAt, outcome: "rate_limited" });
            return res;
        }

        const admin = createSupabaseAdminClient();
        if (!admin) {
            throw new AuthEmailDeliveryError("auth_provider");
        }

        try {
            // Generate the Supabase-verifiable OTP and deliver it through our
            // own mail provider. This keeps the customer contract independent
            // of hosted email-template behavior.
            await sendAuthOtpEmail(admin, email);
        } catch (error) {
            const code = error instanceof AuthEmailDeliveryError ? error.code : "provider_error";
            captureOperationalError(error, {
                operation: "auth.send_code",
                tags: { error_code: code }
            });
            logError({
                msg: "auth.send_code.failed",
                request_id,
                route,
                method,
                path,
                outcome: "provider_error",
                err: { name: "AuthEmailDeliveryError", message: code }
            });
            const res = NextResponse.json(
                {
                    ok: false,
                    message: "Could not send code. Try again shortly.",
                    errorCode: code
                },
                { status: 503 }
            );
            res.headers.set("x-request-id", request_id);
            return res;
        }

        const res = NextResponse.json({ ok: true, message: "Code sent", mode: "otp" });
        res.headers.set("x-request-id", request_id);
        logInfo({ msg: "http.request.completed", request_id, route, method, path, status: 200, latency_ms: Date.now() - startedAt, outcome: "success" });
        return res;
    } catch (error) {
        captureOperationalError(error, { operation: "auth.send_code.unhandled" });
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
