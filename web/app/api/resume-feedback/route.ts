import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { maybeCreateSupabaseServerClient } from "@/lib/supabase/serverClient";
import {
  ANONYMOUS_ID_COOKIE,
  FREE_COOKIE,
  ensureAnonymousIdentity,
  freeCookieOptions,
  getCurrentMonthKey,
  makeFreeCookie,
  parseFreeCookie
} from "@/lib/backend/freeCookie";
import {
  anonymousNetworkHashFromRequest,
  attachAnonymousIdentityCookie,
  hashAnonymousIdentity,
} from "@/lib/billing/anonymousIdentity";
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
import { resolveUserSavedJobId } from "@/lib/reports/generated-report-store";
import {
  assertGenerationAccessDependencies,
  assertGenerationAuthLookup,
  commitGenerationAccess,
  markGenerationProviderCallStarted,
  reserveGenerationAccess,
  type GenerationAccessReservation,
  type GenerationAccessRpcClient,
} from "@/lib/billing/generationAccess";
import { appendFailureDisposition, generationFailureCompletion, logGenerationReleaseFailure, settleGenerationFailure } from "@/lib/billing/generationFailure";
import { persistGeneratedReport } from "@/lib/reports/generated-report-store";
import { makeValidatedReportReceipt } from "@/lib/reports/report-receipt";
import { finalizeAuthenticatedGeneratedReport } from "@/lib/reports/finalize-generated-report";
import { finalizeAnonymousGeneratedReport } from "@/lib/reports/finalize-anonymous-generated-report";
import { isAnonymousRecoveryId } from "@/lib/reports/anonymous-report-recovery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const request_id = getRequestId(request);
  const { method, path } = routeLabel(request);
  const route = `${method} ${path}`;
  const startedAt = Date.now();
  let accessReservation: GenerationAccessReservation | null = null;
  let reservationCommitted = false;
  let reservationAdmin: GenerationAccessRpcClient | null = null;
  logInfo({ msg: "http.request.started", request_id, route, method, path });
  const cookieStore = await cookies();
  const anonymousIdentity = ensureAnonymousIdentity(
    cookieStore.get(ANONYMOUS_ID_COOKIE)?.value
  );
  const respond = <T extends NextResponse>(response: T) =>
    attachAnonymousIdentityCookie(response, anonymousIdentity.cookieValue);
  const anonymousShadowHash = anonymousNetworkHashFromRequest(request);

  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || `request:${request_id}`;
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
      return respond(res);
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
      return respond(res);
    }

    const { text, mode, jobDescription } = validation.value;
    const requestedRecoveryId = isAnonymousRecoveryId(body?.recovery_id)
      ? body.recovery_id.toLowerCase()
      : crypto.randomUUID();
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
      anonymousIdentityHash: user
        ? null
        : hashAnonymousIdentity(anonymousIdentity.identity),
      anonymousShadowHash: user ? null : anonymousShadowHash,
    });

    const activePass = accessReservation.activePass;
    const freeUsesRemaining = accessReservation.freeUsesRemaining;
    const accessTier = accessReservation.accessTier;
    const access = accessReservation.access;

    if (access === "preview") {
      return respond(NextResponse.json(
        {
          ok: false,
          errorCode: "PAYWALL_REQUIRED",
          message: "You've used your free report. Paid access adds more reports, saved history, and export.",
          free_uses_remaining: 0,
          free_uses_left: 0,
          access_tier: "preview"
        },
        { status: 402 }
      ));
    }

    const model = resolveOpenAIModel(mode);
    const { messages, sanitization: sanitizedInput } = buildResumeProviderMessages({
      mode,
      systemPrompt: await loadPromptForMode(mode),
      text,
      effectiveJobDescription,
    });
    const canonicalResumeText = sanitizedInput.sanitizedText;
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
      messages,
      signal: request.signal,
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
        payload = validateResumeModelPayload(parsedJson, canonicalResumeText, effectiveJobDescription.validationOptions);
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
          signal: request.signal,
        });
        payload = validateResumeModelPayload(repaired.parsed, canonicalResumeText, effectiveJobDescription.validationOptions);
        payload = ensureLayoutAndContentFields(payload);
        logInfo({ msg: "llm.response.repair_completed", request_id, route, user_id });
      }
    }

    let reportId: string | null = null;
    let anonymousRecovery: Awaited<ReturnType<typeof finalizeAnonymousGeneratedReport>> | null = null;
    if (user && mode === "resume" && accessReservation.entitlementKind !== "bypass") {
      if (!admin) throw new Error("Report finalization is unavailable.");
      const finalized = await finalizeAuthenticatedGeneratedReport({
        admin,
        reservation: accessReservation,
        userId: user.id,
        payload,
        resumeText: canonicalResumeText,
        savedJobId,
        jobDescriptionText: effectiveJobDescription.persistenceText,
      });
      reportId = finalized.reportId;
      reservationCommitted = true;
    } else if (mode === "resume" && accessReservation.entitlementKind === "anonymous_free") {
      anonymousRecovery = await finalizeAnonymousGeneratedReport({
        reservation: accessReservation,
        payload,
        resumeText: canonicalResumeText,
        recoveryId: requestedRecoveryId,
      });
      reservationCommitted = true;
    } else {
      if (user && mode === "resume" && accessReservation.entitlementKind === "bypass") {
        if (!admin) throw new Error("Report persistence is unavailable.");
        reportId = await persistGeneratedReport({
          supabase: admin,
          userId: user.id,
          payload,
          resumeText: canonicalResumeText,
          savedJobId,
          jobDescriptionText: effectiveJobDescription.persistenceText,
          context: { request_id, route, user_id },
        });
      }
      await commitGenerationAccess(accessReservation, admin);
      reservationCommitted = true;
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
      report_receipt: anonymousRecovery
        ? null
        : (reportId ? null : makeValidatedReportReceipt(payload)),
      recovery_id: anonymousRecovery?.recovery_id ?? null,
      has_job_description: effectiveJobDescription.hasValue,
      data: anonymousRecovery?.report ?? payload
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
    return respond(res);
  } catch (err: any) {
    const disposition = await settleGenerationFailure({
      reservation: accessReservation,
      admin: reservationAdmin,
      error: err,
      attemptConsumed: reservationCommitted,
    });
    logGenerationReleaseFailure(disposition, { request_id, route });

    const completion = generationFailureCompletion(err);
    const status = completion.status;
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

    const baseMessage =
      code === "OPENAI_TIMEOUT"
        ? "This is taking longer than usual. Try again in a moment."
        : code === "OPENAI_NETWORK_ERROR"
          ? "Connection hiccup. Try again in a moment."
          : code === "OPENAI_RESPONSE_PARSE_ERROR" ||
            code === "OPENAI_RESPONSE_NOT_JSON"
            ? "I couldn't read the response cleanly. Try again."
            : code === "OPENAI_RESPONSE_SHAPE_INVALID"
              ? "The report did not pass its evidence check."
            : err?.message || "I had trouble reading your resume just now. Try again in a moment.";
    const message = appendFailureDisposition(baseMessage, disposition);

    logError({
      msg: "http.request.completed",
      request_id,
      route,
      method,
      path,
      status,
      latency_ms: Date.now() - startedAt,
      outcome: completion.outcome,
      err: { name: err?.name || "Error", message: err?.message || message, code: String(code), stack: err?.stack }
    });
    const res = NextResponse.json({
      ok: false,
      errorCode: code,
      message,
      attempt_consumed: disposition.attemptConsumed,
      attempt_disposition: disposition.attemptDisposition,
      credit_restored: disposition.creditRestored,
    }, { status });
    res.headers.set("x-request-id", request_id);
    if (disposition.anonymousCookieMeta) {
      res.cookies.set(FREE_COOKIE, makeFreeCookie(disposition.anonymousCookieMeta), freeCookieOptions());
    }
    return respond(res);
  }
}
