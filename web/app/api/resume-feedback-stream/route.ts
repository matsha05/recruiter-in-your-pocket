import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { maybeCreateSupabaseServerClient } from "@/lib/supabase/serverClient";
import {
    FREE_COOKIE,
    freeCookieOptions,
    getCurrentMonthKey,
    makeFreeCookie,
    parseFreeCookie
} from "@/lib/backend/freeCookie";
import { runJson, streamJson } from "@/lib/llm/orchestrator";
import {
    buildResumeRepairMessages,
    isRepairableResumeResponseError,
} from "@/lib/llm/reportRepair";
import { buildResumeProviderMessages } from "@/lib/llm/resume-provider-messages";
import {
    increaseReasoningEffort,
    resolveOpenAIModel,
    resolveReasoningEffortForMode,
} from "@/lib/llm/model-config";
import { extractJsonFromText } from "@/lib/backend/openai";
import { loadPromptForMode } from "@/lib/backend/prompts";
import {
    ensureLayoutAndContentFields,
    validateResumeFeedbackRequest,
    validateResumeModelPayload,
    validateResumeIdeasPayload,
    validateCaseResumePayload,
    validateCaseInterviewPayload,
    validateCaseNegotiationPayload
} from "@/lib/backend/validation";
import { hashForLogs, logError, logInfo, logWarn } from "@/lib/observability/logger";
import { getRequestId, routeLabel } from "@/lib/observability/requestContext";
import { captureOperationalError } from "@/lib/observability/operations";
import { createSupabaseAdminClient } from "@/lib/supabase/adminClient";
import { rateLimitAsync } from "@/lib/security/rateLimit";
import { readJsonWithLimit } from "@/lib/security/requestBody";
import { resolveEffectiveJobDescription } from "@/lib/security/effectiveJobDescription";
import { isDevelopmentPaywallBypassEnabled } from "@/lib/billing/access";
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
import { persistGeneratedReport, resolveUserSavedJobId, rollbackGeneratedReport } from "@/lib/reports/generated-report-store";
import { logDetectedPromptInjection } from "@/lib/observability/resume-stream-security";
import { singleStreamEventResponse, streamHeaders } from "@/lib/backend/stream-response";
import { makeValidatedReportReceipt } from "@/lib/reports/report-receipt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
    const request_id = getRequestId(request);
    const { method, path } = routeLabel(request);
    const route = `${method} ${path}`;
    const startedAt = Date.now();
    logInfo({ msg: "http.request.started", request_id, route, method, path });

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
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
        return res;
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
        return res;
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
        return singleStreamEventResponse(request_id, {
            type: "error",
            errorCode: "VALIDATION_ERROR",
            message: validation.message,
        });
    }

    const { text, mode, jobDescription } = validation.value;
    const effectiveJobDescription = resolveEffectiveJobDescription(jobDescription);
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

        const cookieStore = await cookies();
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
            anonymousIdentityHash: hashForLogs(ip),
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
            return singleStreamEventResponse(request_id, {
                type: "error",
                errorCode: "PAYWALL_REQUIRED",
                message: "You've used your free report. Paid access adds more reports, saved history, and export.",
            });
        }
    } catch (err: any) {
        const code = err?.code || "ACCESS_DEPENDENCY_UNAVAILABLE";
        const message = err?.message || "Report access is temporarily unavailable. Please try again in a moment.";
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
        return singleStreamEventResponse(request_id, { type: "error", errorCode: code, message });
    }

    if (!accessReservation) {
        return singleStreamEventResponse(request_id, {
            type: "error",
            errorCode: "ACCESS_RESERVATION_FAILED",
            message: "Report access could not be reserved. Please try again.",
        });
    }

    const grantedReservation = accessReservation;
    const access = grantedReservation.access;
    const accessTier = grantedReservation.accessTier;
    const activePass = grantedReservation.activePass;
    const freeUsesRemaining = grantedReservation.freeUsesRemaining;

    // Access is fully resolved before ReadableStream.start. This lets the
    // signed anonymous hold cookie be attached to the actual Response.
    const encoder = new TextEncoder();
    let accumulatedJson = "";
    let reservationCommitted = false;

    const stream = new ReadableStream({
        async start(controller) {
            try {
                const { messages, sanitization: sanitizedResume } = buildResumeProviderMessages({
                    mode,
                    systemPrompt: await loadPromptForMode(mode),
                    text,
                    effectiveJobDescription,
                });
                const sanitizedJobDesc = effectiveJobDescription.sanitization;

                logDetectedPromptInjection({
                    request_id, route, resume: sanitizedResume, jobDescription: sanitizedJobDesc,
                });

                // Send initial metadata
                controller.enqueue(encoder.encode(JSON.stringify({
                    type: "meta",
                    request_id,
                    access,
                    access_tier: accessTier,
                    user: user ? { email: user.email } : null,
                    has_job_description: effectiveJobDescription.hasValue,
                    bypass
                }) + "\n"));

                const model = resolveOpenAIModel(mode);
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
                            if (ev.type === "chunk") {
                                accumulatedJson += ev.content;
                            }
                        }
                        break;
                    } catch (streamError: any) {
                        if (streamError?.code !== "OPENAI_RESPONSE_INCOMPLETE" || streamAttempt >= maxIncompleteRetries) {
                            throw streamError;
                        }
                        accumulatedJson = "";
                        logWarn({
                            msg: "llm.stream.incomplete_retry",
                            request_id,
                            route,
                            user_id,
                            llm: { model },
                        });
                    }
                }

                // Parse and validate the complete JSON
                let payload: any;
                try {
                    const parsedJson = extractJsonFromText(accumulatedJson);

                    if (mode === "resume_ideas") {
                        payload = validateResumeIdeasPayload(parsedJson);
                    } else if (mode === "case_resume") {
                        payload = validateCaseResumePayload(parsedJson);
                    } else if (mode === "case_interview") {
                        payload = validateCaseInterviewPayload(parsedJson);
                    } else if (mode === "case_negotiation") {
                        payload = validateCaseNegotiationPayload(parsedJson);
                    } else {
                        // Original legacy modes
                        payload = validateResumeModelPayload(parsedJson, text, effectiveJobDescription.validationOptions);
                        payload = ensureLayoutAndContentFields(payload);
                    }
                } catch (err: any) {
                    if (mode === "resume" && isRepairableResumeResponseError(err)) {
                        logWarn({
                            msg: "llm.response.repair_started",
                            request_id,
                            route,
                            user_id,
                            http: { body_bytes: accumulatedJson?.length || 0 },
                            err: { name: err?.name || "ValidationError", message: err?.message || "Response validation failed" }
                        });

                        try {
                            const repaired = await runJson<any>({
                                ctx: { request_id, user_id, route },
                                task: "resume_feedback",
                                mode: "resume",
                                model,
                                prompt_version: "resume_v2_repair",
                                schema_version: "report_v1",
                                messages: buildResumeRepairMessages(messages, accumulatedJson, err),
                            });
                            payload = validateResumeModelPayload(repaired.parsed, text, effectiveJobDescription.validationOptions);
                            payload = ensureLayoutAndContentFields(payload);
                            accumulatedJson = repaired.raw;
                            logInfo({ msg: "llm.response.repair_completed", request_id, route, user_id });
                        } catch (repairErr: any) {
                            logError({
                                msg: "llm.response.repair_failed",
                                request_id,
                                route,
                                user_id,
                                err: {
                                    name: repairErr?.name || "ValidationError",
                                    message: repairErr?.message || "Response repair failed",
                                    code: repairErr?.code,
                                }
                            });
                            const validationError = new Error("The report did not pass its evidence check. Your report credit was restored; please try again.") as Error & { code: string };
                            validationError.code = "OPENAI_RESPONSE_SHAPE_INVALID";
                            throw validationError;
                        }
                    } else {
                        logError({
                            msg: "llm.response.validation_failed",
                            request_id,
                            route,
                            user_id,
                            http: { body_bytes: accumulatedJson?.length || 0 },
                            err: { name: err?.name || "ValidationError", message: err?.message || "Response validation failed" }
                        });
                        const validationError = new Error("Could not parse the response. Please try again.") as Error & { code: string };
                        validationError.code = "OPENAI_RESPONSE_PARSE_ERROR";
                        throw validationError;
                    }
                }

                let reportId: string | null = null;
                if (user && supabase && mode === "resume") {
                    reportId = await persistGeneratedReport({
                        supabase,
                        userId: user.id,
                        payload,
                        resumeText: text,
                        savedJobId,
                        jobDescriptionText: effectiveJobDescription.persistenceText,
                        context: { request_id, route, user_id },
                    });
                }

                try {
                    await commitGenerationAccess(grantedReservation, reservationAdmin);
                    reservationCommitted = true;
                } catch (commitError) {
                    if (reportId && user && supabase) {
                        await rollbackGeneratedReport({
                            supabase, userId: user.id, reportId, context: { request_id, route, user_id },
                        });
                        reportId = null;
                    }
                    throw commitError;
                }

                const newFreeUsed = grantedReservation.anonymousCookieMeta?.used
                    ?? (accessTier === "free_full" || (user && freeUsesRemaining === 0) ? 1 : 0);
                const newFreeRemaining = freeUsesRemaining;

                // Send the final complete message
                controller.enqueue(encoder.encode(JSON.stringify({
                    type: "complete",
                    ok: true,
                    data: payload,
                    report_id: reportId,
                    report_receipt: reportId ? null : makeValidatedReportReceipt(payload),
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
                if (!reservationCommitted) {
                    try {
                        await releaseGenerationAccess(
                            grantedReservation,
                            reservationAdmin,
                            releaseReasonForError(err)
                        );
                    } catch (releaseErr: any) {
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

                try {
                    controller.enqueue(encoder.encode(JSON.stringify({
                        type: "error",
                        errorCode: code,
                        message
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
        }
    });

    const response = new NextResponse(stream, {
        headers: streamHeaders(request_id),
    });

    if (grantedReservation.anonymousCookieMeta) {
        response.cookies.set(
            FREE_COOKIE,
            makeFreeCookie(grantedReservation.anonymousCookieMeta),
            freeCookieOptions()
        );
    }

    return response;
}
