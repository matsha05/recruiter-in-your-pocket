import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { maybeCreateSupabaseServerClient } from "@/lib/supabase/serverClient";
import {
    ANONYMOUS_ID_COOKIE,
    FREE_COOKIE,
    ensureAnonymousIdentity,
    getCurrentMonthKey,
    parseFreeCookie
} from "@/lib/backend/freeCookie";
import {
    anonymousNetworkHashFromRequest,
    attachAnonymousIdentityCookie,
    hashAnonymousIdentity,
} from "@/lib/billing/anonymousIdentity";
import { streamJson } from "@/lib/llm/orchestrator";
import {
    increaseReasoningEffort,
    resolveReasoningEffortForMode,
} from "@/lib/llm/model-config";
import { prepareResumeStreamPrompt } from "@/lib/llm/resumeStreamPrompt";
import { validateResumeStreamOutput } from "@/lib/llm/validateResumeStreamOutput";
import { validateResumeFeedbackRequest } from "@/lib/backend/validation";
import { hashForLogs, logError, logInfo, logWarn } from "@/lib/observability/logger";
import { getRequestId, routeLabel } from "@/lib/observability/requestContext";
import { captureOperationalError } from "@/lib/observability/operations";
import { createSupabaseAdminClient } from "@/lib/supabase/adminClient";
import { rateLimitAsync } from "@/lib/security/rateLimit";
import { readJsonWithLimit } from "@/lib/security/requestBody";
import { isDevelopmentPaywallBypassEnabled } from "@/lib/billing/access";
import { withGenerationAccessOutcome } from "@/lib/billing/generationFailureCopy";
import {
    generationStreamHeaders,
    singleGenerationStreamEvent,
} from "@/lib/billing/generationRouteResponse";
import {
    assertGenerationAccessDependencies,
    assertGenerationAuthLookup,
    commitGenerationAccess,
    markGenerationProviderCallStarted,
    releaseGenerationAccess,
    releaseReasonForError,
    reserveGenerationAccess,
    type GenerationAccessReservation,
    type GenerationAccessRpcClient,
} from "@/lib/billing/generationAccess";
import {
    persistGeneratedResumeReport,
    resolveUserSavedJobId,
    rollbackGeneratedResumeReport,
} from "@/lib/reports/resumeGenerationPersistence";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
    const request_id = getRequestId(request);
    const { method, path } = routeLabel(request);
    const route = `${method} ${path}`;
    const startedAt = Date.now();
    logInfo({ msg: "http.request.started", request_id, route, method, path });
    const cookieStore = await cookies();
    const anonymousIdentity = ensureAnonymousIdentity(
        cookieStore.get(ANONYMOUS_ID_COOKIE)?.value
    );
    const respond = <T extends NextResponse>(response: T) =>
        attachAnonymousIdentityCookie(response, anonymousIdentity.cookieValue);
    const anonymousShadowHash = anonymousNetworkHashFromRequest(request);
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || `request:${request_id}`;
    const rl = await rateLimitAsync(`ip:${hashForLogs(ip)}:${path}`, 20, 60_000);
    if (!rl.ok) {
        const res = NextResponse.json(
            { ok: false, errorCode: "RATE_LIMITED", message: "Too many requests. Try again shortly." },
            { status: 429 }
        );
        res.headers.set("x-request-id", request_id);
        res.headers.set("retry-after", String(Math.ceil(rl.resetMs / 1000)));
        logWarn({
            msg: "http.request.completed",
            request_id,
            route,
            method,
            path,
            status: 429,
            latency_ms: Date.now() - startedAt,
            outcome: "rate_limited"
        });
        return respond(res);
    }
    let body: any = null;
    try {
        body = await readJsonWithLimit<any>(request, 128 * 1024);
    } catch (err: any) {
        const status = err?.httpStatus || 400;
        const res = NextResponse.json({ ok: false, errorCode: err?.code || "INVALID_REQUEST", message: err?.message || "Invalid request" }, { status });
        res.headers.set("x-request-id", request_id);
        logInfo({
            msg: "http.request.completed",
            request_id,
            route,
            method,
            path,
            status,
            latency_ms: Date.now() - startedAt,
            outcome: status === 413 ? "validation_error" : "validation_error"
        });
        return respond(res);
    }
    const validation = validateResumeFeedbackRequest(body);
    if (!validation.ok || !validation.value) {
        logInfo({
            msg: "http.request.completed",
            request_id,
            route,
            method,
            path,
            status: 400,
            latency_ms: Date.now() - startedAt,
            outcome: "validation_error"
        });
        return respond(singleGenerationStreamEvent(request_id, {
            type: "error",
            errorCode: "VALIDATION_ERROR",
            message: withGenerationAccessOutcome(
                validation.message || "The report request could not be read. Please check it and try again.",
                false,
            ),
            access_consumed: false,
        }));
    }

    const { text, mode, jobDescription } = validation.value;
    const requestedSavedJobId = typeof body?.savedJobId === "string" ? body.savedJobId : null;
    let supabase: Awaited<ReturnType<typeof maybeCreateSupabaseServerClient>> = null;
    let user: any = null;
    let savedJobId: string | null = null;
    let accessReservation: GenerationAccessReservation | null = null;
    let reservationAdmin: GenerationAccessRpcClient | null = null;
    let bypass = false;
    let user_id: string | undefined;

    try {
        supabase = await maybeCreateSupabaseServerClient();
        const admin = createSupabaseAdminClient();
        reservationAdmin = admin;
        assertGenerationAccessDependencies({
            authClientAvailable: Boolean(supabase),
            adminClientAvailable: Boolean(admin),
        });

        const userData = supabase
            ? await supabase.auth.getUser()
            : { data: { user: null }, error: null };
        assertGenerationAuthLookup("error" in userData ? userData.error : null);
        user = userData.data.user || null;
        user_id = user?.id ? hashForLogs(user.id) : undefined;
        savedJobId = user && supabase
            ? await resolveUserSavedJobId(supabase, user.id, requestedSavedJobId)
            : null;

        const freeParsed = parseFreeCookie(cookieStore.get(FREE_COOKIE)?.value);
        const freeMeta = freeParsed || {
            used: 0,
            last_free_ts: null,
            reset_month: getCurrentMonthKey(),
            needs_reset: true,
        };

        bypass = isDevelopmentPaywallBypassEnabled();
        accessReservation = await reserveGenerationAccess({
            userId: user?.id || null,
            admin,
            reportKind: mode === "resume_ideas" ? "resume_ideas" : "resume_feedback",
            bypass,
            freeMeta,
            anonymousIdentityHash: user
                ? null
                : hashAnonymousIdentity(anonymousIdentity.identity),
            anonymousShadowHash: user ? null : anonymousShadowHash,
        });

        if (accessReservation.access === "preview") {
            logInfo({
                msg: "http.request.completed",
                request_id,
                route,
                method,
                path,
                status: 402,
                latency_ms: Date.now() - startedAt,
                outcome: "provider_error",
                user_id,
            });
            return respond(singleGenerationStreamEvent(request_id, {
                type: "error",
                errorCode: "PAYWALL_REQUIRED",
                message: "You've used your free report. Paid access adds more reports, saved history, and export.",
                access_consumed: false,
            }));
        }
    } catch (err: any) {
        const code = err?.code || "ACCESS_DEPENDENCY_UNAVAILABLE";
        const message = withGenerationAccessOutcome(
            err?.message || "Report access is temporarily unavailable. Please try again in a moment.",
            false,
        );
        logError({
            msg: "http.request.completed",
            request_id,
            route,
            method,
            path,
            status: err?.httpStatus || 503,
            latency_ms: Date.now() - startedAt,
            outcome: "internal_error",
            err: { name: err?.name || "GenerationAccessError", message, code: String(code) },
        });
        return respond(singleGenerationStreamEvent(request_id, {
            type: "error",
            errorCode: code,
            message,
            access_consumed: false,
        }));
    }
    if (!accessReservation) {
        return respond(singleGenerationStreamEvent(request_id, {
            type: "error",
            errorCode: "ACCESS_RESERVATION_FAILED",
            message: withGenerationAccessOutcome(
                "Report access could not be reserved. Please try again.",
                false,
            ),
            access_consumed: false,
        }));
    }

    const grantedReservation = accessReservation;
    const access = grantedReservation.access;
    const accessTier = grantedReservation.accessTier;
    const activePass = grantedReservation.activePass;
    const freeUsesRemaining = grantedReservation.freeUsesRemaining;

    // Access is fully resolved before ReadableStream.start. The shared ledger
    // holds concurrent anonymous attempts; /api/free-status syncs the signed
    // cookie only after a successful commit.
    const encoder = new TextEncoder();
    let accumulatedJson = "";
    let reservationCommitted = false;
    let clientDisconnected = false;
    let reportId: string | null = null;
    let rollbackSavedReport: (() => Promise<void>) | null = null;
    const throwIfClientDisconnected = () => {
        if (!clientDisconnected) return;
        const error = new Error("Report generation was canceled.");
        error.name = "AbortError";
        throw error;
    };

    const stream = new ReadableStream({
        async start(controller) {
            try {
                // Send initial metadata
                controller.enqueue(encoder.encode(JSON.stringify({
                    type: "meta",
                    request_id,
                    access,
                    access_tier: accessTier,
                    user: user ? { email: user.email } : null,
                    bypass
                }) + "\n"));

                const { messages, model } = await prepareResumeStreamPrompt({
                    text,
                    mode,
                    jobDescription,
                    requestId: request_id,
                    route,
                    userIdForLogs: user_id,
                });
                const validatedChunks: string[] = [];
                await markGenerationProviderCallStarted(grantedReservation);
                const maxIncompleteRetries = 1;
                for (let streamAttempt = 0; streamAttempt <= maxIncompleteRetries; streamAttempt++) {
                    try {
                        for await (const ev of streamJson({
                            ctx: { request_id, user_id, route },
                            task: mode === "resume_ideas" ? "resume_ideas" : "resume_feedback",
                            mode,
                            model,
                            prompt_version: mode === "resume_ideas" ? "resume_ideas_v1" : "resume_v2",
                            schema_version: mode === "resume_ideas" ? "ideas_v1" : "report_v1",
                            messages,
                            reasoning_effort: streamAttempt > 0
                                ? increaseReasoningEffort(resolveReasoningEffortForMode(mode, model))
                                : undefined,
                        })) {
                            throwIfClientDisconnected();
                            if (ev.type === "chunk") {
                                accumulatedJson += ev.content;
                                validatedChunks.push(ev.content);
                            }
                        }
                        break;
                    } catch (streamError: any) {
                        if (streamError?.code !== "OPENAI_RESPONSE_INCOMPLETE" || streamAttempt >= maxIncompleteRetries) {
                            throw streamError;
                        }
                        accumulatedJson = "";
                        validatedChunks.length = 0;
                        logWarn({
                            msg: "llm.stream.incomplete_retry",
                            request_id,
                            route,
                            user_id,
                            llm: { model },
                        });
                    }
                }
                throwIfClientDisconnected();

                const validated = await validateResumeStreamOutput({
                    raw: accumulatedJson,
                    text,
                    mode,
                    model,
                    messages,
                    requestId: request_id,
                    route,
                    userIdForLogs: user_id,
                });
                const payload = validated.payload;
                if (validated.replacementRaw) {
                    accumulatedJson = validated.replacementRaw;
                    validatedChunks.length = 0;
                    validatedChunks.push(validated.replacementRaw);
                }
                throwIfClientDisconnected();

                if (user && supabase && mode === "resume") {
                    reportId = await persistGeneratedResumeReport({
                        supabase,
                        userId: user.id,
                        resumeText: text,
                        jobDescription,
                        savedJobId,
                        payload,
                        context: {
                            requestId: request_id,
                            route,
                            userIdForLogs: user_id,
                        },
                    });
                    rollbackSavedReport = () => rollbackGeneratedResumeReport({
                        supabase: supabase!,
                        userId: user.id,
                        reportId: reportId!,
                        context: {
                            requestId: request_id,
                            route,
                            userIdForLogs: user_id,
                        },
                    });
                }

                // A canceled response remains releasable until validation and
                // signed-in persistence complete. Commit then becomes final.
                throwIfClientDisconnected();
                await commitGenerationAccess(grantedReservation, reservationAdmin);
                reservationCommitted = true;

                const newFreeUsed = grantedReservation.anonymousCookieMeta?.used
                    ?? (accessTier === "free_full" || (user && freeUsesRemaining === 0) ? 1 : 0);
                const newFreeRemaining = freeUsesRemaining;

                // Model content is buffered until it has passed the complete
                // response contract and the entitlement is committed. This
                // prevents a caller from receiving useful output and then
                // forcing a delivery error that refunds the same credit.
                for (const content of validatedChunks) {
                    controller.enqueue(encoder.encode(JSON.stringify({ type: "chunk", content }) + "\n"));
                }

                // Send the final complete message
                controller.enqueue(encoder.encode(JSON.stringify({
                    type: "complete",
                    ok: true,
                    data: payload,
                    report_id: reportId,
                    free_run_index: newFreeUsed,
                    free_uses_remaining: bypass || activePass ? freeUsesRemaining : newFreeRemaining
                }) + "\n"));

                controller.close();
                logInfo({
                    msg: "http.request.completed",
                    request_id,
                    route,
                    method,
                    path,
                    status: 200,
                    latency_ms: Date.now() - startedAt,
                    outcome: "success",
                    user_id
                });

            } catch (err: any) {
                let accessConsumed: boolean | null = reservationCommitted;
                if (!reservationCommitted) {
                    try {
                        const release = await releaseGenerationAccess(
                            grantedReservation,
                            reservationAdmin,
                            releaseReasonForError(err)
                        );
                        accessConsumed = release.accessConsumed;
                    } catch (releaseErr: any) {
                        accessConsumed = null;
                        logError({
                            msg: "billing.access_release_failed",
                            request_id,
                            route,
                            user_id,
                            outcome: "internal_error",
                            err: {
                                name: releaseErr?.name || "GenerationAccessError",
                                message: releaseErr?.message || "Access release failed",
                                code: String(releaseErr?.code || "ACCESS_RELEASE_FAILED"),
                            },
                        });
                    }
                }
                if (accessConsumed === false && rollbackSavedReport) {
                    try {
                        await rollbackSavedReport();
                        reportId = null;
                    } catch (rollbackError: any) {
                        accessConsumed = null;
                        logError({
                            msg: "report.rollback_failed",
                            request_id,
                            route,
                            user_id,
                            outcome: "internal_error",
                            err: {
                                name: rollbackError?.name || "ReportRollbackError",
                                message: rollbackError?.message || "Report rollback failed",
                                code: String(rollbackError?.code || "REPORT_ROLLBACK_FAILED"),
                            },
                        });
                    }
                }

                const code = err?.code || "INTERNAL_SERVER_ERROR";
                if (code !== "GENERATION_PAUSED" && code !== "GENERATION_BUDGET_EXHAUSTED") {
                    captureOperationalError(err, {
                        operation: "generation.resume_feedback_stream",
                        tags: { error_code: String(code) },
                    });
                }
                const message = code === "OPENAI_TIMEOUT"
                    ? "This is taking longer than usual. Try again in a moment."
                    : code === "OPENAI_NETWORK_ERROR"
                        ? "Connection hiccup. Try again in a moment."
                        : err?.message || "Something went wrong. Please try again.";
                const honestMessage = withGenerationAccessOutcome(message, accessConsumed);

                try {
                    controller.enqueue(encoder.encode(JSON.stringify({
                        type: "error",
                        errorCode: code,
                        message: honestMessage,
                        access_consumed: accessConsumed,
                    }) + "\n"));
                    controller.close();
                } catch {
                    // The client already closed the stream. The entitlement
                    // release above remains the authoritative cleanup.
                }

                logError({
                    msg: "http.request.completed",
                    request_id,
                    route,
                    method,
                    path,
                    status: 500,
                    latency_ms: Date.now() - startedAt,
                    outcome: "internal_error",
                    err: { name: err?.name || "Error", message: err?.message || message, code: String(code), stack: err?.stack }
                });
            }
        },
        cancel() {
            clientDisconnected = true;
        },
    });

    return respond(new NextResponse(stream, {
        headers: generationStreamHeaders(request_id),
    }));
}
