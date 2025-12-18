import { NextResponse } from "next/server";
import { cookies } from "next/headers";
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
import { runJson } from "@/lib/llm/orchestrator";
import { JSON_INSTRUCTION, baseTone, loadPromptForMode } from "@/lib/backend/prompts";
import {
  ensureLayoutAndContentFields,
  validateResumeFeedbackRequest,
  validateCaseResumePayload,
  validateCaseInterviewPayload,
  validateCaseNegotiationPayload,
  validateResumeIdeasPayload,
  validateResumeModelPayload
} from "@/lib/backend/validation";
import { hashForLogs, logError, logInfo, logWarn } from "@/lib/observability/logger";
import { getRequestId, routeLabel } from "@/lib/observability/requestContext";
import { createSupabaseAdminClient } from "@/lib/supabase/adminClient";
import { rateLimit } from "@/lib/security/rateLimit";
import { readJsonWithLimit } from "@/lib/security/requestBody";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function nowIso() {
  return new Date().toISOString();
}

function hashResumeText(text: string) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

async function getActivePass(supabase: NonNullable<Awaited<ReturnType<typeof maybeCreateSupabaseServerClient>>>, userId: string) {
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

  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rl = rateLimit(`ip:${hashForLogs(ip)}:${path}`, 20, 60_000);
    if (!rl.ok) {
      const res = NextResponse.json({ ok: false, errorCode: "RATE_LIMITED", message: "Too many requests. Try again shortly." }, { status: 429 });
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

    const body = await readJsonWithLimit<any>(request, 128 * 1024);
    const validation = validateResumeFeedbackRequest(body);
    if (!validation.ok || !validation.value) {
      const res = NextResponse.json(
        {
          ok: false,
          errorCode: "VALIDATION_ERROR",
          message: validation.message,
          details: { fieldErrors: validation.fieldErrors || {} }
        },
        { status: 400 }
      );
      res.headers.set("x-request-id", request_id);
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
      return res;
    }

    const { text, mode, jobDescription } = validation.value;
    const hasJobDescription = Boolean(jobDescription && jobDescription.length > 50);

    // Supabase is optional for anonymous usage of the workspace.
    // If it's not configured locally, treat the user as anonymous and skip pass checks/report saving.
    const supabase = await maybeCreateSupabaseServerClient();
    const userData = supabase ? await supabase.auth.getUser() : { data: { user: null } };
    const user = userData.data.user || null;
    const user_id = user?.id;

    // Determine access
    const cookieStore = await cookies();
    const freeParsed = parseFreeCookie(cookieStore.get(FREE_COOKIE)?.value);
    const freeMeta =
      freeParsed || { used: 0, last_free_ts: null, reset_month: getCurrentMonthKey(), needs_reset: true };

    const bypass = getBypassPaywall();
    const activePass = user && supabase ? await getActivePass(supabase, user.id) : null;
    const freeUsed = freeMeta.used || 0;
    const freeUsesRemaining = Math.max(0, FREE_RUN_LIMIT - freeUsed);

    const accessTier = bypass ? "pass_full" : activePass ? "pass_full" : freeUsesRemaining > 0 ? "free_full" : "preview";
    const access = accessTier === "preview" ? "preview" : "full";

    if (access === "preview") {
      return NextResponse.json(
        {
          ok: false,
          errorCode: "PAYWALL_REQUIRED",
          message: "You've used your free full reports. Upgrade to keep going.",
          free_uses_remaining: 0,
          free_uses_left: 0,
          access_tier: "preview"
        },
        { status: 402 }
      );
    }

    // Build system prompt
    let systemPrompt = await loadPromptForMode(mode);
    if (mode === "resume_ideas") {
      systemPrompt = `${baseTone}\n\n${systemPrompt}`;
    }

    if (hasJobDescription) {
      systemPrompt += `

JOB-SPECIFIC ALIGNMENT (ADDITIONAL CONTEXT)

The user has provided a specific job description. In your job_alignment response, pay special attention to:
- How well the resume aligns with THIS specific job's requirements
- Themes in the job description that the resume demonstrates (strongly_aligned)
- Themes in the job description that are present but underemphasized (underplayed)
- Critical requirements from the job description that are missing (missing)

The user wants to know: "Am I a fit for THIS role, and what should I emphasize or add?"
`;
    }

    let userPrompt = "";

    if (mode === "case_interview") {
      userPrompt = `CONTEXT (Role & Question):
${jobDescription || "No specific context provided."}

TRANSCRIPT (Candidate Answer):
${text}`;
    } else if (mode === "case_negotiation") {
      userPrompt = `CONTEXT (Role & Goals):
${jobDescription || "No specific context."}

OFFER DETAILS:
${text}`;
    } else {
      userPrompt = `Here is the user's input. Use the system instructions to respond.

USER RESUME:
${text}`;
      if (hasJobDescription && jobDescription) {
        userPrompt += `

JOB DESCRIPTION (for alignment analysis):
${jobDescription}`;
      }
    }

    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    const { parsed: parsedJson } = await runJson<any>({
      ctx: { request_id, user_id, route },
      task: mode === "resume_ideas" ? "resume_ideas" : "resume_feedback",
      mode,
      model,
      prompt_version: mode === "resume_ideas" ? "resume_ideas_v1" : "resume_v1",
      schema_version: mode === "resume_ideas" ? "ideas_v1" : "report_v1",
      messages: [
        { role: "system", content: JSON_INSTRUCTION },
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    });

    let payload: any;
    if (mode === "resume_ideas") {
      payload = validateResumeIdeasPayload(parsedJson);
    } else if (mode === "case_resume") {
      payload = validateCaseResumePayload(parsedJson);
    } else if (mode === "case_interview") {
      payload = validateCaseInterviewPayload(parsedJson);
    } else if (mode === "case_negotiation") {
      payload = validateCaseNegotiationPayload(parsedJson);
    } else {
      payload = validateResumeModelPayload(parsedJson);
      payload = ensureLayoutAndContentFields(payload);
    }

    // Increment free run counter only when using free tier (no pass) and not bypassing
    const shouldIncrementFree = !bypass && !activePass && freeUsed < FREE_RUN_LIMIT;
    const newFreeUsed = shouldIncrementFree ? freeUsed + 1 : freeUsed;
    const newFreeRemaining = Math.max(0, FREE_RUN_LIMIT - newFreeUsed);

    // Save report if user is logged in and mode is resume
    let reportId: string | null = null;
    if (user && supabase && mode === "resume") {
      try {
        const resumeHash = hashResumeText(text);
        let preview = text.slice(0, 200).trim();
        const lastSpace = preview.lastIndexOf(" ");
        if (lastSpace > 150) preview = preview.slice(0, lastSpace) + "...";
        else if (text.length > 200) preview += "...";

        reportId = crypto.randomUUID();

        const { error } = await supabase.from("reports").insert({
          id: reportId,
          user_id: user.id,
          resume_hash: resumeHash,
          score: payload.score,
          score_label: payload.score_label || null,
          report_json: payload,
          resume_preview: preview,
          created_at: nowIso()
        });
        if (error) reportId = null;
      } catch (e) {
        // Don't fail if report saving fails
        reportId = null;
      }
    }

    const responseBody = {
      ok: true,
      access,
      access_tier: accessTier,
      active_pass: activePass,
      user: user ? { email: user.email } : null,
      bypass: bypass ? true : false,
      free_run_index: newFreeUsed,
      free_uses_remaining: bypass || activePass ? freeUsesRemaining : newFreeRemaining,
      free_uses_left: bypass || activePass ? freeUsesRemaining : newFreeRemaining,
      report_id: reportId,
      data: payload
    };

    // Consume single-use pass consistently (non-stream path).
    if (activePass && activePass.tier === "single_use" && user) {
      try {
        const admin = createSupabaseAdminClient();
        if (admin) {
          await admin.from("passes").update({ expires_at: nowIso() }).eq("id", activePass.id);
        }
      } catch {
        // Do not fail response if pass consumption fails.
      }
    }

    const res = NextResponse.json(responseBody);
    res.headers.set("x-request-id", request_id);

    // Persist free-run cookie if we incremented, or if cookie was missing/invalid/month-reset.
    if (!bypass && !activePass && (shouldIncrementFree || !freeParsed || freeMeta.needs_reset)) {
      const newMeta = {
        used: newFreeUsed,
        last_free_ts: shouldIncrementFree ? nowIso() : freeMeta.last_free_ts || null,
        reset_month: getCurrentMonthKey()
      };
      res.cookies.set(FREE_COOKIE, makeFreeCookie(newMeta), freeCookieOptions());
    }

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
    return res;
  } catch (err: any) {
    const status = err?.httpStatus || 500;
    const code = err?.code || "INTERNAL_SERVER_ERROR";

    const message =
      code === "OPENAI_TIMEOUT"
        ? "This is taking longer than usual. Try again in a moment."
        : code === "OPENAI_NETWORK_ERROR"
          ? "Connection hiccup. Try again in a moment."
          : code === "OPENAI_RESPONSE_PARSE_ERROR" ||
            code === "OPENAI_RESPONSE_SHAPE_INVALID" ||
            code === "OPENAI_RESPONSE_NOT_JSON"
            ? "I couldn't read the response cleanly. Try again."
            : err?.message || "I had trouble reading your resume just now. Try again in a moment.";

    logError({
      msg: "http.request.completed",
      request_id,
      route,
      method,
      path,
      status,
      latency_ms: Date.now() - startedAt,
      outcome: status === 400 ? "validation_error" : status === 402 ? "provider_error" : "internal_error",
      err: { name: err?.name || "Error", message: err?.message || message, code: String(code), stack: err?.stack }
    });
    const res = NextResponse.json({ ok: false, errorCode: code, message }, { status });
    res.headers.set("x-request-id", request_id);
    return res;
  }
}
