import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { maybeCreateSupabaseServerClient } from "@/lib/supabase/serverClient";
import crypto from "crypto";
import {
    FREE_COOKIE,
    FREE_RUN_LIMIT,
    freeCookieOptions,
    getCurrentMonthKey,
    makeFreeCookie,
    parseFreeCookie
} from "@/lib/backend/freeCookie";
import { streamJson } from "@/lib/llm/orchestrator";
import { extractJsonFromText } from "@/lib/backend/openai";
import { JSON_INSTRUCTION, baseTone, loadPromptForMode } from "@/lib/backend/prompts";
import {
    ensureLayoutAndContentFields,
    validateResumeFeedbackRequest,
    validateResumeModelPayload,
    validateCaseResumePayload,
    validateCaseInterviewPayload,
    validateCaseNegotiationPayload
} from "@/lib/backend/validation";
import { hashForLogs, logError, logInfo, logWarn } from "@/lib/observability/logger";
import { getRequestId, routeLabel } from "@/lib/observability/requestContext";
import { createSupabaseAdminClient } from "@/lib/supabase/adminClient";
import { rateLimit } from "@/lib/security/rateLimit";
import { readJsonWithLimit } from "@/lib/security/requestBody";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Force recompile check

function nowIso() {
    return new Date().toISOString();
}

function hashResumeText(text: string) {
    return crypto.createHash("sha256").update(text).digest("hex");
}

async function getActivePass(supabase: any, userId: string) {
    const { data, error } = await supabase
        .from("passes")
        .select("id, tier, expires_at, created_at")
        .eq("user_id", userId)
        .gt("expires_at", nowIso())
        .order("expires_at", { ascending: false })
        .limit(1)
        .maybeSingle();
    if (error) throw error;
    return data || null;
}

function getBypassPaywall(): boolean {
    return String(process.env.BYPASS_PAYWALL || "").toLowerCase() === "true";
}

export async function POST(request: Request) {
    const request_id = getRequestId(request);
    const { method, path } = routeLabel(request);
    const route = `${method} ${path}`;
    const startedAt = Date.now();
    logInfo({ msg: "http.request.started", request_id, route, method, path });

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rl = rateLimit(`ip:${hashForLogs(ip)}:${path}`, 20, 60_000);
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

    // Create encoder for streaming response
    const encoder = new TextEncoder();

    // Track accumulated JSON for final validation
    let accumulatedJson = "";

    const stream = new ReadableStream({
        async start(controller) {
            try {
                const validation = validateResumeFeedbackRequest(body);
                if (!validation.ok || !validation.value) {
                    controller.enqueue(encoder.encode(JSON.stringify({
                        type: "error",
                        errorCode: "VALIDATION_ERROR",
                        message: validation.message
                    }) + "\n"));
                    controller.close();
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
                    return;
                }

                const { text, mode, jobDescription } = validation.value;
                const hasJobDescription = Boolean(jobDescription && jobDescription.length > 50);

                // Access control check
                const supabase = await maybeCreateSupabaseServerClient();
                const userData = supabase ? await supabase.auth.getUser() : { data: { user: null } };
                const user = userData.data.user || null;
                const user_id = user?.id;

                const cookieStore = await cookies();
                const freeParsed = parseFreeCookie(cookieStore.get(FREE_COOKIE)?.value);
                const freeMeta = freeParsed || { used: 0, last_free_ts: null, reset_month: getCurrentMonthKey(), needs_reset: true };

                const bypass = getBypassPaywall();
                const activePass = user && supabase ? await getActivePass(supabase, user.id) : null;
                const freeUsed = freeMeta.used || 0;
                const freeUsesRemaining = Math.max(0, FREE_RUN_LIMIT - freeUsed);

                const accessTier = bypass ? "pass_full" : activePass ? "pass_full" : freeUsesRemaining > 0 ? "free_full" : "preview";
                const access = accessTier === "preview" ? "preview" : "full";

                if (access === "preview") {
                    controller.enqueue(encoder.encode(JSON.stringify({
                        type: "error",
                        errorCode: "PAYWALL_REQUIRED",
                        message: "You've used your free full reports. Upgrade to keep going."
                    }) + "\n"));
                    controller.close();
                    logInfo({
                        msg: "http.request.completed",
                        request_id,
                        route,
                        method,
                        path,
                        status: 402,
                        latency_ms: Date.now() - startedAt,
                        outcome: "provider_error",
                        user_id
                    });
                    return;
                }

                // Send initial metadata
                controller.enqueue(encoder.encode(JSON.stringify({
                    type: "meta",
                    request_id,
                    access,
                    access_tier: accessTier,
                    user: user ? { email: user.email } : null,
                    bypass
                }) + "\n"));

                // Build prompts
                let systemPrompt = await loadPromptForMode(mode);
                if (mode === "resume_ideas") {
                    systemPrompt = `${baseTone}\n\n${systemPrompt}`;
                }

                if (hasJobDescription) {
                    systemPrompt += `\n\nJOB-SPECIFIC ALIGNMENT (ADDITIONAL CONTEXT)\n\nThe user has provided a specific job description. In your job_alignment response, pay special attention to:\n- How well the resume aligns with THIS specific job's requirements\n- Themes in the job description that the resume demonstrates (strongly_aligned)\n- Themes in the job description that are present but underemphasized (underplayed)\n- Critical requirements from the job description that are missing (missing)\n\nThe user wants to know: \"Am I a fit for THIS role, and what should I emphasize or add?\"\n`;
                }

                let userPrompt = "";
                if (mode === "case_interview") {
                    userPrompt = `CONTEXT (Role & Question):\n${jobDescription || "No specific context provided."}\n\nTRANSCRIPT (Candidate Answer):\n${text}`;
                } else if (mode === "case_negotiation") {
                    // For negotiation, 'text' contains offer details (JSON string or formatted text)
                    // 'jobDescription' contains Context + User Goals
                    userPrompt = `CONTEXT (Role & Goals):\n${jobDescription || "No specific context."}\n\nOFFER DETAILS:\n${text}`;
                } else {
                    userPrompt = `Here is the user's input. Use the system instructions to respond.\n\nUSER RESUME:\n${text}`;
                    if (hasJobDescription && jobDescription) {
                        userPrompt += `\n\nJOB DESCRIPTION (for alignment analysis):\n${jobDescription}`;
                    }
                }

                // Stream the OpenAI response
                const messages = [
                    { role: "system" as const, content: JSON_INSTRUCTION },
                    { role: "system" as const, content: systemPrompt },
                    { role: "user" as const, content: userPrompt }
                ];

                const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
                for await (const ev of streamJson({
                    ctx: { request_id, user_id, route },
                    task: mode === "resume_ideas" ? "resume_ideas" : "resume_feedback",
                    mode,
                    model,
                    prompt_version: mode === "resume_ideas" ? "resume_ideas_v1" : "resume_v1",
                    schema_version: mode === "resume_ideas" ? "ideas_v1" : "report_v1",
                    messages
                })) {
                    if (ev.type === "chunk") {
                        accumulatedJson += ev.content;
                        controller.enqueue(encoder.encode(JSON.stringify({ type: "chunk", content: ev.content }) + "\n"));
                    }
                }

                // Parse and validate the complete JSON
                let payload: any;
                try {
                    const parsedJson = extractJsonFromText(accumulatedJson);

                    if (mode === "case_resume") {
                        payload = validateCaseResumePayload(parsedJson);
                    } else if (mode === "case_interview") {
                        payload = validateCaseInterviewPayload(parsedJson);
                    } else if (mode === "case_negotiation") {
                        payload = validateCaseNegotiationPayload(parsedJson);
                    } else {
                        // Original legacy modes
                        payload = validateResumeModelPayload(parsedJson);
                        payload = ensureLayoutAndContentFields(payload);
                    }
                } catch (err: any) {
                    controller.enqueue(encoder.encode(JSON.stringify({
                        type: "error",
                        errorCode: "OPENAI_RESPONSE_PARSE_ERROR",
                        message: "Could not parse the response. Please try again."
                    }) + "\n"));
                    controller.close();
                    return;
                }

                // Handle free run counting and report saving
                const shouldIncrementFree = !bypass && !activePass && freeUsed < FREE_RUN_LIMIT;
                const newFreeUsed = shouldIncrementFree ? freeUsed + 1 : freeUsed;
                const newFreeRemaining = Math.max(0, FREE_RUN_LIMIT - newFreeUsed);

                let reportId: string | null = null;
                if (user && supabase && mode === "resume") {
                    try {
                        const resumeHash = hashResumeText(text);
                        let preview = text.slice(0, 200).trim();
                        const lastSpace = preview.lastIndexOf(" ");
                        if (lastSpace > 150) preview = preview.slice(0, lastSpace) + "...";
                        else if (text.length > 200) preview += "...";

                        reportId = crypto.randomUUID();

                        await supabase.from("reports").insert({
                            id: reportId,
                            user_id: user.id,
                            resume_hash: resumeHash,
                            score: payload.score,
                            score_label: payload.score_label || null,
                            report_json: payload,
                            resume_preview: preview,
                            created_at: nowIso()
                        });
                    } catch {
                        reportId = null;
                    }
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

                // CONSUME SINGLE USE PASS
                // If the user used a 'single_use' pass, we must expire it now that the report is generated.
                if (activePass && activePass.tier === "single_use") {
                    try {
                        const admin = createSupabaseAdminClient();
                        if (!admin) throw new Error("Supabase admin client not configured");

                        // Set expires_at to NOW, effectively killing the pass
                        await admin
                            .from("passes")
                            .update({ expires_at: new Date().toISOString() })
                            .eq("id", activePass.id);

                        console.log(`[stream] Consumed single_use pass: ${activePass.id}`);
                    } catch (passErr) {
                        console.error("[stream] Failed to consume pass:", passErr);
                    }
                }

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
                const code = err?.code || "INTERNAL_SERVER_ERROR";
                const message = code === "OPENAI_TIMEOUT"
                    ? "This is taking longer than usual. Try again in a moment."
                    : code === "OPENAI_NETWORK_ERROR"
                        ? "Connection hiccup. Try again in a moment."
                        : err?.message || "Something went wrong. Please try again.";

                controller.enqueue(encoder.encode(JSON.stringify({
                    type: "error",
                    errorCode: code,
                    message
                }) + "\n"));
                controller.close();

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

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "x-request-id": request_id
        }
    });
}
