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
import { logError, logInfo, logWarn, hashForLogs } from "@/lib/observability/logger";
import { getRequestId, routeLabel } from "@/lib/observability/requestContext";
import { createSupabaseAdminClient } from "@/lib/supabase/adminClient";
import { rateLimit } from "@/lib/security/rateLimit";
import { readJsonWithLimit } from "@/lib/security/requestBody";
import { parseLinkedInText } from "@/lib/linkedin/pdf-parser";
import { fetchLinkedInProfile, isValidLinkedInUrl, isBrightDataConfigured } from "@/lib/linkedin/bright-data";
import type { LinkedInProfile } from "@/types/linkedin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function nowIso() {
    return new Date().toISOString();
}

async function getActivePass(supabase: any, userId: string) {
    const { data, error } = await supabase
        .from("passes")
        .select("id, tier, expires_at, uses_remaining, created_at")
        .eq("user_id", userId)
        .gt("expires_at", nowIso())
        .gt("uses_remaining", 0)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
    if (error) throw error;
    return data || null;
}

function getBypassPaywall(): boolean {
    return String(process.env.BYPASS_PAYWALL || "").toLowerCase() === "true";
}

/**
 * Format LinkedIn profile as text for LLM analysis
 */
function formatProfileForAnalysis(profile: LinkedInProfile): string {
    let text = `LINKEDIN PROFILE ANALYSIS\n\n`;

    text += `NAME: ${profile.name}\n`;
    text += `HEADLINE: ${profile.headline}\n`;
    if (profile.location) text += `LOCATION: ${profile.location}\n`;
    text += `\n`;

    // Visual elements (from URL scrape only)
    if (profile.source === 'url') {
        text += `VISUAL ELEMENTS:\n`;
        text += `- Photo: ${profile.hasPhoto ? 'Present' : 'Missing'}\n`;
        text += `- Banner: ${profile.hasBanner ? 'Present' : 'Missing'}\n`;
        if (profile.connectionCount) text += `- Connections: ${profile.connectionCount}\n`;
        text += `\n`;
    } else {
        text += `VISUAL ELEMENTS: Not available (PDF upload)\n\n`;
    }

    // About section
    text += `ABOUT SECTION:\n`;
    if (profile.about) {
        text += profile.about + '\n';
    } else {
        text += `(No About section found)\n`;
    }
    text += `\n`;

    // Experience
    text += `EXPERIENCE:\n`;
    if (profile.experience.length > 0) {
        for (const exp of profile.experience) {
            text += `\n${exp.title} at ${exp.company}`;
            if (exp.duration) text += ` (${exp.duration})`;
            if (exp.isCurrent) text += ` [CURRENT]`;
            text += `\n`;
            if (exp.description) {
                text += `${exp.description}\n`;
            }
        }
    } else {
        text += `(No experience found)\n`;
    }
    text += `\n`;

    // Education
    text += `EDUCATION:\n`;
    if (profile.education.length > 0) {
        for (const edu of profile.education) {
            text += `${edu.school}`;
            if (edu.degree) text += ` - ${edu.degree}`;
            if (edu.field) text += `, ${edu.field}`;
            if (edu.dates) text += ` (${edu.dates})`;
            text += `\n`;
        }
    } else {
        text += `(No education found)\n`;
    }
    text += `\n`;

    // Skills
    text += `SKILLS:\n`;
    if (profile.skills.length > 0) {
        text += profile.skills.join(', ') + '\n';
    } else {
        text += `(No skills listed)\n`;
    }
    text += `\n`;

    // Certifications
    if (profile.certifications.length > 0) {
        text += `CERTIFICATIONS:\n`;
        text += profile.certifications.join(', ') + '\n';
    }

    return text;
}

export async function POST(request: Request) {
    const request_id = getRequestId(request);
    const { method, path } = routeLabel(request);
    const route = `${method} ${path}`;
    const startedAt = Date.now();
    logInfo({ msg: "http.request.started", request_id, route, method, path, feature: "linkedin" });

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rl = rateLimit(`ip:${hashForLogs(ip)}:${path}`, 20, 60_000);
    if (!rl.ok) {
        const res = NextResponse.json(
            { ok: false, errorCode: "RATE_LIMITED", message: "Too many requests. Try again shortly." },
            { status: 429 }
        );
        res.headers.set("x-request-id", request_id);
        res.headers.set("retry-after", String(Math.ceil(rl.resetMs / 1000)));
        return res;
    }

    let body: any = null;
    try {
        body = await readJsonWithLimit<any>(request, 256 * 1024); // Larger for PDF text
    } catch (err: any) {
        const status = err?.httpStatus || 400;
        const res = NextResponse.json({ ok: false, errorCode: err?.code || "INVALID_REQUEST", message: err?.message || "Invalid request" }, { status });
        res.headers.set("x-request-id", request_id);
        return res;
    }

    const encoder = new TextEncoder();
    let accumulatedJson = "";

    const stream = new ReadableStream({
        async start(controller) {
            try {
                // Validate input
                const { profileUrl, pdfText, source } = body || {};

                if (!source || (source !== 'url' && source !== 'pdf')) {
                    controller.enqueue(encoder.encode(JSON.stringify({
                        type: "error",
                        errorCode: "VALIDATION_ERROR",
                        message: "Invalid source type. Expected 'url' or 'pdf'."
                    }) + "\n"));
                    controller.close();
                    return;
                }

                if (source === 'url' && !profileUrl) {
                    controller.enqueue(encoder.encode(JSON.stringify({
                        type: "error",
                        errorCode: "VALIDATION_ERROR",
                        message: "LinkedIn URL is required."
                    }) + "\n"));
                    controller.close();
                    return;
                }

                if (source === 'pdf' && !pdfText) {
                    controller.enqueue(encoder.encode(JSON.stringify({
                        type: "error",
                        errorCode: "VALIDATION_ERROR",
                        message: "PDF text is required."
                    }) + "\n"));
                    controller.close();
                    return;
                }

                // Access control check (same as resume)
                const supabase = await maybeCreateSupabaseServerClient();
                const userData = supabase ? await supabase.auth.getUser() : { data: { user: null } };
                const user = userData.data.user || null;
                const user_id = user?.id;

                const cookieStore = await cookies();
                const freeParsed = parseFreeCookie(cookieStore.get(FREE_COOKIE)?.value);
                const freeMeta = freeParsed || { used: 0, last_free_ts: null, reset_month: getCurrentMonthKey(), needs_reset: true };

                const bypass = getBypassPaywall();
                const activePass = user && supabase ? await getActivePass(supabase, user.id) : null;

                let freeUsesRemaining = 0;
                let userUsageRecord: { free_report_used_at: string | null } | null = null;

                if (user && supabase) {
                    const { data: usageData } = await supabase
                        .from('user_usage')
                        .select('free_report_used_at')
                        .eq('user_id', user.id)
                        .maybeSingle();

                    userUsageRecord = usageData;
                    freeUsesRemaining = (!usageData || !usageData.free_report_used_at) ? 1 : 0;
                } else {
                    const freeUsed = freeMeta.used || 0;
                    freeUsesRemaining = Math.max(0, FREE_RUN_LIMIT - freeUsed);
                }

                const accessTier = bypass ? "pass_full" : activePass ? "pass_full" : freeUsesRemaining > 0 ? "free_full" : "preview";
                const access = accessTier === "preview" ? "preview" : "full";

                if (access === "preview") {
                    controller.enqueue(encoder.encode(JSON.stringify({
                        type: "error",
                        errorCode: "PAYWALL_REQUIRED",
                        message: "You've used your free review. Upgrade to continue."
                    }) + "\n"));
                    controller.close();
                    return;
                }

                // Get LinkedIn profile
                let profile: LinkedInProfile | null = null;

                if (source === 'url') {
                    // Validate URL format
                    if (!isValidLinkedInUrl(profileUrl)) {
                        controller.enqueue(encoder.encode(JSON.stringify({
                            type: "error",
                            errorCode: "INVALID_URL",
                            message: "Please enter a valid LinkedIn profile URL (e.g., linkedin.com/in/yourname)"
                        }) + "\n"));
                        controller.close();
                        return;
                    }

                    // Try Bright Data if configured
                    if (isBrightDataConfigured()) {
                        profile = await fetchLinkedInProfile(profileUrl);
                    }

                    // If Bright Data failed or not configured, return fallback message
                    if (!profile) {
                        controller.enqueue(encoder.encode(JSON.stringify({
                            type: "error",
                            errorCode: "SCRAPE_UNAVAILABLE",
                            message: "URL fetching is not available yet. Please upload your LinkedIn PDF instead.",
                            fallback: "pdf"
                        }) + "\n"));
                        controller.close();
                        return;
                    }
                } else {
                    // Parse PDF text
                    profile = parseLinkedInText(pdfText);
                }

                if (!profile || !profile.headline) {
                    controller.enqueue(encoder.encode(JSON.stringify({
                        type: "error",
                        errorCode: "PARSE_ERROR",
                        message: "We couldn't parse your LinkedIn profile. Please make sure you uploaded a valid LinkedIn PDF export."
                    }) + "\n"));
                    controller.close();
                    return;
                }

                // Send meta event with profile info
                controller.enqueue(encoder.encode(JSON.stringify({
                    type: "meta",
                    profile: {
                        name: profile.name,
                        headline: profile.headline,
                        source: profile.source,
                    }
                }) + "\n"));

                // Format profile for LLM
                const profileText = formatProfileForAnalysis(profile);

                // Load LinkedIn prompt
                const systemPrompt = await loadPromptForMode("linkedin");
                const fullPrompt = `${systemPrompt}\n\n${baseTone}\n\n${JSON_INSTRUCTION}`;

                // Stream LLM response
                logInfo({ msg: "linkedin.analysis.started", request_id, user_id, source: profile.source });

                for await (const chunk of streamJson({
                    systemPrompt: fullPrompt,
                    userContent: profileText,
                    model: "gpt-4o",
                    temperature: 0.3,
                })) {
                    accumulatedJson += chunk;
                    controller.enqueue(encoder.encode(JSON.stringify({
                        type: "chunk",
                        content: chunk
                    }) + "\n"));
                }

                // Parse final JSON
                let parsedJson = null;
                try {
                    parsedJson = JSON.parse(accumulatedJson);
                } catch {
                    // Try to extract JSON
                    parsedJson = extractJsonFromText(accumulatedJson);
                }

                if (!parsedJson) {
                    controller.enqueue(encoder.encode(JSON.stringify({
                        type: "error",
                        errorCode: "JSON_PARSE_ERROR",
                        message: "Failed to parse LinkedIn analysis response."
                    }) + "\n"));
                    controller.close();
                    return;
                }

                // Track usage (same as resume)
                const shouldIncrementFree = accessTier === "free_full";
                const shouldDecrementPass = accessTier === "pass_full" && activePass && !bypass;
                const newFreeUsed = shouldIncrementFree ? (freeMeta.used || 0) + 1 : freeMeta.used || 0;

                // Send complete event
                controller.enqueue(encoder.encode(JSON.stringify({
                    type: "complete",
                    data: parsedJson,
                    profile: profile,
                    access,
                    accessTier,
                    free_uses_remaining: user ? freeUsesRemaining - (shouldIncrementFree ? 1 : 0) : FREE_RUN_LIMIT - newFreeUsed,
                    free_run_index: newFreeUsed,
                }) + "\n"));

                // Persist usage
                if (shouldIncrementFree && user && supabase) {
                    // Update database for logged-in users
                    const adminSupabase = createSupabaseAdminClient();
                    await adminSupabase
                        .from('user_usage')
                        .upsert({
                            user_id: user.id,
                            free_report_used_at: nowIso(),
                            updated_at: nowIso(),
                        }, { onConflict: 'user_id' });
                } else if (shouldIncrementFree && !user) {
                    // Update cookie for anonymous users
                    const newCookie = makeFreeCookie(newFreeUsed, Date.now());
                    cookieStore.set(FREE_COOKIE, newCookie, freeCookieOptions);
                }

                if (shouldDecrementPass && activePass) {
                    const adminSupabase = createSupabaseAdminClient();
                    await adminSupabase
                        .from('passes')
                        .update({ uses_remaining: activePass.uses_remaining - 1 })
                        .eq('id', activePass.id);
                }

                logInfo({
                    msg: "linkedin.analysis.completed",
                    request_id,
                    user_id,
                    source: profile.source,
                    score: parsedJson?.score,
                    latency_ms: Date.now() - startedAt,
                });

                controller.close();

            } catch (error: any) {
                logError({
                    msg: "linkedin.analysis.error",
                    request_id,
                    error: error?.message || "Unknown error",
                });
                controller.enqueue(encoder.encode(JSON.stringify({
                    type: "error",
                    errorCode: "INTERNAL_ERROR",
                    message: "An error occurred while analyzing your LinkedIn profile."
                }) + "\n"));
                controller.close();
            }
        }
    });

    const res = new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Request-Id": request_id,
        },
    });

    return res;
}
