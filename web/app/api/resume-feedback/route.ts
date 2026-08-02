import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { maybeCreateSupabaseServerClient } from "@/lib/supabase/serverClient";
import crypto from "crypto";
import {
  FREE_COOKIE,
  freeCookieOptions,
  getCurrentMonthKey,
  makeFreeCookie,
  parseFreeCookie
} from "@/lib/backend/freeCookie";
import { runJson } from "@/lib/llm/orchestrator";
import {
  buildResumeRepairMessages,
  isRepairableResumeResponseError,
} from "@/lib/llm/reportRepair";
import { buildResumeProviderMessages } from "@/lib/llm/resume-provider-messages";
import { resolveOpenAIModel } from "@/lib/llm/model-config";
import { loadPromptForMode } from "@/lib/backend/prompts";
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

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function nowIso() {
  return new Date().toISOString();
}

function hashResumeText(text: string) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function reportPersistenceError() {
  const error = new Error("We could not safely save this report. Your report credit was restored; please try again.") as Error & { code: string; httpStatus: number };
  error.code = "REPORT_PERSISTENCE_FAILED";
  error.httpStatus = 503;
  return error;
}

function buildReportTrustMetadata(payload: any) {
  const topFixes = Array.isArray(payload?.top_fixes) ? payload.top_fixes : [];
  const evidence = topFixes
    .map((fix: any) => ({
      fix: fix?.fix || "",
      confidence: fix?.confidence || "medium",
      impact_level: fix?.impact_level || "medium",
      effort: fix?.effort || "moderate",
      excerpt: typeof fix?.evidence === "string" ? fix.evidence : fix?.evidence?.excerpt || "",
      section: typeof fix?.evidence === "string" ? fix?.section_ref || "Resume" : fix?.evidence?.section || fix?.section_ref || "Resume"
    }))
    .filter((item: any) => item.fix || item.excerpt);

  const confidenceValues = evidence.map((item: any) => item.confidence);
  const confidence_band = confidenceValues.includes("low")
    ? "low"
    : confidenceValues.includes("medium")
      ? "medium"
      : evidence.length > 0
        ? "high"
        : null;

  return {
    evidence_json: evidence.length > 0 ? evidence : null,
    evidence_version: payload?.contract_version || "v2",
    evidence_summary: evidence.length > 0
      ? `${evidence.length} grounded fix${evidence.length === 1 ? "" : "es"} with ${confidence_band || "medium"} overall confidence.`
      : null,
    confidence_band
  };
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function resolveUserSavedJobId(
  supabase: NonNullable<Awaited<ReturnType<typeof maybeCreateSupabaseServerClient>>>,
  userId: string,
  value: string | null
) {
  if (!value || !UUID_PATTERN.test(value)) return null;

  const { data, error } = await supabase
    .from("saved_jobs")
    .select("id")
    .eq("id", value)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data?.id) return null;
  return data.id as string;
}

export async function POST(request: Request) {
  const request_id = getRequestId(request);
  const { method, path } = routeLabel(request);
  const route = `${method} ${path}`;
  const startedAt = Date.now();
  let accessReservation: GenerationAccessReservation | null = null;
  let reservationCommitted = false;
  let reservationAdmin: GenerationAccessRpcClient | null = null;
  logInfo({ msg: "http.request.started", request_id, route, method, path });

  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rl = await rateLimitAsync(`ip:${hashForLogs(ip)}:${path}`, 20, 60_000);
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
    const requestedSavedJobId = typeof body?.savedJobId === "string" ? body.savedJobId : null;
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
    const effectiveJobDescription = resolveEffectiveJobDescription(jobDescription);

    const supabase = await maybeCreateSupabaseServerClient();
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
    const user = userData.data.user || null;
    const user_id = user?.id ? hashForLogs(user.id) : undefined;
    const savedJobId = user && supabase
      ? await resolveUserSavedJobId(supabase, user.id, requestedSavedJobId)
      : null;

    // Determine access
    const cookieStore = await cookies();
    const freeParsed = parseFreeCookie(cookieStore.get(FREE_COOKIE)?.value);
    const freeMeta =
      freeParsed || { used: 0, last_free_ts: null, reset_month: getCurrentMonthKey(), needs_reset: true };

    const bypass = isDevelopmentPaywallBypassEnabled();
    accessReservation = await reserveGenerationAccess({
      userId: user?.id || null,
      admin,
      reportKind: mode === "resume_ideas" ? "resume_ideas" : "resume_feedback",
      bypass,
      freeMeta,
      anonymousIdentityHash: hashForLogs(ip),
    });

    const activePass = accessReservation.activePass;
    const freeUsesRemaining = accessReservation.freeUsesRemaining;
    const accessTier = accessReservation.accessTier;
    const access = accessReservation.access;

    if (access === "preview") {
      return NextResponse.json(
        {
          ok: false,
          errorCode: "PAYWALL_REQUIRED",
          message: "You've used your free report. Paid access adds more reports, saved history, and export.",
          free_uses_remaining: 0,
          free_uses_left: 0,
          access_tier: "preview"
        },
        { status: 402 }
      );
    }

    const model = resolveOpenAIModel(mode);
    const { messages, sanitization: sanitizedInput } = buildResumeProviderMessages({
      mode,
      systemPrompt: await loadPromptForMode(mode),
      text,
      effectiveJobDescription,
    });
    const sanitizedJobDescription = effectiveJobDescription.sanitization;
    if (sanitizedInput.injectionDetected || sanitizedJobDescription?.injectionDetected) {
      logWarn({
        msg: "security.prompt_injection_detected",
        request_id,
        route,
        user_id,
        security: {
          injection_detected: true,
          patterns_matched: [
            ...sanitizedInput.detectedPatterns,
            ...(sanitizedJobDescription?.detectedPatterns || []),
          ],
          json_injection: sanitizedInput.hadJsonInjection || Boolean(sanitizedJobDescription?.hadJsonInjection),
        },
      });
    }
    await markGenerationProviderCallStarted(accessReservation);
    const initialRun = await runJson<any>({
      ctx: { request_id, user_id, route },
      task: mode === "resume_ideas" ? "resume_ideas" : "resume_feedback",
      mode,
      model,
      prompt_version: mode === "resume_ideas" ? "resume_ideas_v1" : "resume_v2",
      schema_version: mode === "resume_ideas" ? "ideas_v1" : "report_v1",
      messages
    });
    const parsedJson = initialRun.parsed;

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
      try {
        payload = validateResumeModelPayload(parsedJson, text, effectiveJobDescription.validationOptions);
        payload = ensureLayoutAndContentFields(payload);
      } catch (err: any) {
        if (mode !== "resume" || !isRepairableResumeResponseError(err)) throw err;

        logWarn({
          msg: "llm.response.repair_started",
          request_id,
          route,
          user_id,
          err: { name: err?.name || "ValidationError", message: err?.message || "Response validation failed" }
        });
        const repaired = await runJson<any>({
          ctx: { request_id, user_id, route },
          task: "resume_feedback",
          mode: "resume",
          model,
          prompt_version: "resume_v2_repair",
          schema_version: "report_v1",
          messages: buildResumeRepairMessages(messages, initialRun.raw, err),
        });
        payload = validateResumeModelPayload(repaired.parsed, text, effectiveJobDescription.validationOptions);
        payload = ensureLayoutAndContentFields(payload);
        logInfo({ msg: "llm.response.repair_completed", request_id, route, user_id });
      }
    }

    // Save report if user is logged in and mode is resume
    let reportId: string | null = null;
    if (user && supabase && mode === "resume") {
      const resumeHash = hashResumeText(text);
      let preview = text.slice(0, 200).trim();
      const lastSpace = preview.lastIndexOf(" ");
      if (lastSpace > 150) preview = preview.slice(0, lastSpace) + "...";
      else if (text.length > 200) preview += "...";

      reportId = crypto.randomUUID();

      const { error: reportInsertError } = await supabase.from("reports").insert({
        id: reportId,
        user_id: user.id,
        resume_hash: resumeHash,
        score: payload.score,
        score_label: payload.score_label || null,
        report_json: payload,
        ...buildReportTrustMetadata(payload),
        ...(savedJobId ? { saved_job_id: savedJobId } : {}),
        resume_preview: preview,
        job_description_text: effectiveJobDescription.persistenceText,
        target_role: payload.job_alignment?.role_fit?.best_fit_roles?.[0] || null,
        created_at: nowIso()
      });
      if (reportInsertError) {
        reportId = null;
        logError({
          msg: "report.persistence_failed",
          request_id,
          route,
          user_id,
          outcome: "provider_error",
          err: { name: "ReportPersistenceError", message: "Report insert failed", code: String(reportInsertError.code || "REPORT_INSERT_FAILED") }
        });
        throw reportPersistenceError();
      }
      if (savedJobId) {
        const { error: jobUpdateError } = await supabase
          .from("saved_jobs")
          .update({ latest_report_id: reportId, updated_at: nowIso() })
          .eq("id", savedJobId)
          .eq("user_id", user.id);
        if (jobUpdateError) {
          logWarn({
            msg: "saved_job.report_link_failed",
            request_id,
            route,
            user_id,
            outcome: "provider_error",
            err: { name: "SavedJobUpdateError", message: "Saved job link update failed", code: String(jobUpdateError.code || "SAVED_JOB_UPDATE_FAILED") }
          });
        }
      }
    }

    // Commit only after a signed-in report is durably saved. If the commit
    // fails, remove that uncharged report before returning an error.
    try {
      await commitGenerationAccess(accessReservation, admin);
      reservationCommitted = true;
    } catch (commitError) {
      if (reportId && user && supabase) {
        const { error: rollbackError } = await supabase
          .from("reports")
          .delete()
          .eq("id", reportId)
          .eq("user_id", user.id);
        if (rollbackError) {
          logError({
            msg: "report.rollback_failed",
            request_id,
            route,
            user_id,
            outcome: "internal_error",
            err: { name: "ReportRollbackError", message: "Report rollback failed", code: String(rollbackError.code || "REPORT_ROLLBACK_FAILED") }
          });
        }
        reportId = null;
      }
      throw commitError;
    }

    const newFreeUsed = accessReservation.anonymousCookieMeta?.used
      ?? (accessTier === "free_full" || (user && freeUsesRemaining === 0) ? 1 : freeMeta.used || 0);
    const newFreeRemaining = freeUsesRemaining;

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
      has_job_description: effectiveJobDescription.hasValue,
      data: payload
    };

    const res = NextResponse.json(responseBody);
    res.headers.set("x-request-id", request_id);

    if (accessReservation.anonymousCookieMeta) {
      res.cookies.set(
        FREE_COOKIE,
        makeFreeCookie(accessReservation.anonymousCookieMeta),
        freeCookieOptions()
      );
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
    if (accessReservation && !reservationCommitted) {
      try {
        await releaseGenerationAccess(
          accessReservation,
          reservationAdmin,
          releaseReasonForError(err)
        );
      } catch (releaseErr: any) {
        logError({
          msg: "billing.access_release_failed",
          request_id,
          route,
          outcome: "internal_error",
          err: {
            name: releaseErr?.name || "GenerationAccessError",
            message: releaseErr?.message || "Access release failed",
            code: String(releaseErr?.code || "ACCESS_RELEASE_FAILED"),
          },
        });
      }
    }

    const status = err?.httpStatus || 500;
    const code = err?.code || "INTERNAL_SERVER_ERROR";

    if (
      status >= 500 &&
      code !== "GENERATION_PAUSED" &&
      code !== "GENERATION_BUDGET_EXHAUSTED"
    ) {
      captureOperationalError(err, {
        operation: "generation.resume_feedback",
        tags: { error_code: String(code) },
      });
    }

    const message =
      code === "OPENAI_TIMEOUT"
        ? "This is taking longer than usual. Try again in a moment."
        : code === "OPENAI_NETWORK_ERROR"
          ? "Connection hiccup. Try again in a moment."
          : code === "OPENAI_RESPONSE_PARSE_ERROR" ||
            code === "OPENAI_RESPONSE_NOT_JSON"
            ? "I couldn't read the response cleanly. Try again."
            : code === "OPENAI_RESPONSE_SHAPE_INVALID"
              ? "The report did not pass its evidence check. Your report credit was restored; please try again."
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
