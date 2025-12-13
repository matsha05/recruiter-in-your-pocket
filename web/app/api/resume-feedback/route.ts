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
import { callOpenAIChat, extractJsonFromText } from "@/lib/backend/openai";
import { JSON_INSTRUCTION, baseTone, loadPromptForMode } from "@/lib/backend/prompts";
import {
  ensureLayoutAndContentFields,
  validateResumeFeedbackRequest,
  validateResumeIdeasPayload,
  validateResumeModelPayload
} from "@/lib/backend/validation";

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
  try {
    let body: any = null;
    try {
      body = await request.json();
    } catch {
      body = null;
    }
    const validation = validateResumeFeedbackRequest(body);
    if (!validation.ok || !validation.value) {
      return NextResponse.json(
        {
          ok: false,
          errorCode: "VALIDATION_ERROR",
          message: validation.message,
          details: { fieldErrors: validation.fieldErrors || {} }
        },
        { status: 400 }
      );
    }

    const { text, mode, jobDescription } = validation.value;
    const hasJobDescription = Boolean(jobDescription && jobDescription.length > 50);

    // Supabase is optional for anonymous usage of the workspace.
    // If it's not configured locally, treat the user as anonymous and skip pass checks/report saving.
    const supabase = await maybeCreateSupabaseServerClient();
    const userData = supabase ? await supabase.auth.getUser() : { data: { user: null } };
    const user = userData.data.user || null;

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

    let userPrompt = `Here is the user's input. Use the system instructions to respond.

USER RESUME:
${text}`;
    if (hasJobDescription && jobDescription) {
      userPrompt += `

JOB DESCRIPTION (for alignment analysis):
${jobDescription}`;
    }

    const data = await callOpenAIChat(
      [
        { role: "system", content: JSON_INSTRUCTION },
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      mode
    );

    const rawContent = data?.choices?.[0]?.message?.content;
    const parsedJson = extractJsonFromText(rawContent);

    let payload: any;
    if (mode === "resume_ideas") payload = validateResumeIdeasPayload(parsedJson);
    else payload = validateResumeModelPayload(parsedJson);

    if (mode !== "resume_ideas") payload = ensureLayoutAndContentFields(payload);

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

    const res = NextResponse.json(responseBody);

    // Persist free-run cookie if we incremented, or if cookie was missing/invalid/month-reset.
    if (!bypass && !activePass && (shouldIncrementFree || !freeParsed || freeMeta.needs_reset)) {
      const newMeta = {
        used: newFreeUsed,
        last_free_ts: shouldIncrementFree ? nowIso() : freeMeta.last_free_ts || null,
        reset_month: getCurrentMonthKey()
      };
      res.cookies.set(FREE_COOKIE, makeFreeCookie(newMeta), freeCookieOptions());
    }

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

    return NextResponse.json({ ok: false, errorCode: code, message }, { status });
  }
}


