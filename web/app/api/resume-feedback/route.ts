import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { maybeCreateSupabaseServerClient } from "@/lib/supabase/serverClient";
import {
  ANONYMOUS_ID_COOKIE,
  FREE_COOKIE,
  ensureAnonymousIdentity,
  freeCookieOptions,
  getCurrentMonthKey,
  makeFreeCookie,
  parseAnonymousIdentityCookie,
  parseFreeCookie
} from "@/lib/backend/freeCookie";
import {
  anonymousNetworkHashFromRequest,
  attachAnonymousIdentityCookie,
  hashAnonymousIdentity,
} from "@/lib/billing/anonymousIdentity";
import { runJson } from "@/lib/llm/orchestrator";
import { buildResumeProviderMessages } from "@/lib/llm/resume-provider-messages";
import { resolveOpenAIModel } from "@/lib/llm/model-config";
import { loadPromptForMode } from "@/lib/backend/prompts";
import {
  validateResumeFeedbackRequest,
  validateCaseResumePayload,
  validateCaseInterviewPayload,
  validateCaseNegotiationPayload,
  validateResumeIdeasPayload,
} from "@/lib/backend/validation";
import { hashForLogs, logError, logInfo, logWarn } from "@/lib/observability/logger";
import { getRequestId, routeLabel } from "@/lib/observability/requestContext";
import { captureOperationalError } from "@/lib/observability/operations";
import { classifyReportFailure, latencyBucketFor, recordLaunchSignal, recordStageTiming } from "@/lib/observability/launchSignals";
import { createSupabaseAdminClient } from "@/lib/supabase/adminClient";
import { rateLimitAsync } from "@/lib/security/rateLimit";
import { readJsonWithLimit } from "@/lib/security/requestBody";
import { resolveEffectiveJobDescription } from "@/lib/security/effectiveJobDescription";
import { isDevelopmentPaywallBypassEnabled } from "@/lib/billing/access";
import { generationOperationDigest, requireAuthenticatedGenerationOperationId } from "@/lib/billing/generationOperation";
import { loadOwnedTrustedReport, resolveUserSavedJobId } from "@/lib/reports/generated-report-store";
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
import { severityCheckReport } from "@/lib/reports/severity-check-report";
import { withScreenerText } from "@/lib/reports/screener-text";
import { resumePromptVersion, resumeSchemaVersion } from "@/lib/reports/report-shape";
import { validateResumeStreamOutput } from "@/lib/llm/validateResumeStreamOutput";
import { requireAnonymousReportRecoveryId } from "@/lib/reports/anonymous-report-recovery-requirement";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Worst case: main call 90 s, a repair call, the severity check and persistence.
export const maxDuration = 300;

export async function POST(request: Request) {
  const request_id = getRequestId(request);
  const { method, path } = routeLabel(request);
  const route = `${method} ${path}`;
  const startedAt = Date.now();
  let accessReservation: GenerationAccessReservation | null = null;
  let reservationCommitted = false;
  let reservationAdmin: GenerationAccessRpcClient | null = null;
  let requestedOperationId: string | null = null;
  let authenticatedOperationId: string | null = null;
  // The same counter the stream route sends, with endpoint "json"; the wait is bucketed from startedAt.
  const reportSignal: { mode?: any; viewer: "anonymous" | "signed_in"; has_jd: "yes" | "no" } = { viewer: "anonymous", has_jd: "no" };
  logInfo({ msg: "http.request.started", request_id, route, method, path });
  const cookieStore = await cookies();
  const anonymousIdentityCookie = cookieStore.get(ANONYMOUS_ID_COOKIE)?.value;
  const hadAnonymousIdentity = Boolean(parseAnonymousIdentityCookie(anonymousIdentityCookie));
  const anonymousIdentity = ensureAnonymousIdentity(anonymousIdentityCookie);
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
    requestedOperationId = typeof body?.operation_id === "string" ? body.operation_id : null;
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
    const effectiveJobDescription = resolveEffectiveJobDescription(jobDescription);
    reportSignal.mode = mode;
    reportSignal.has_jd = effectiveJobDescription.hasValue ? "yes" : "no";

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
    reportSignal.viewer = user ? "signed_in" : "anonymous";
    const user_id = user?.id ? hashForLogs(user.id) : undefined;
    const savedJobId = user && supabase
      ? await resolveUserSavedJobId(supabase, user.id, requestedSavedJobId)
      : null;

    // Determine access
    const freeParsed = parseFreeCookie(cookieStore.get(FREE_COOKIE)?.value);
    const freeMeta =
      freeParsed || { used: 0, last_free_ts: null, reset_month: getCurrentMonthKey(), needs_reset: true };

    const bypass = isDevelopmentPaywallBypassEnabled();
    const requestedRecoveryId = requireAnonymousReportRecoveryId({
      mode, userId: user?.id || null, bypass, recoveryId: body?.recovery_id,
    });
    if (mode === "resume" && !user && !bypass && !hadAnonymousIdentity) {
      return respond(NextResponse.json({
        ok: false,
        errorCode: "ANONYMOUS_IDENTITY_REQUIRED",
        message: "Your browser is ready. Try creating your report again.",
        attempt_consumed: false,
        attempt_disposition: "restored",
      }, { status: 409 }));
    }
    authenticatedOperationId = requireAuthenticatedGenerationOperationId({
      mode, userId: user?.id, bypass, operationId: requestedOperationId,
    });
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
      operationId: authenticatedOperationId,
      requestDigest: user && mode === "resume" ? generationOperationDigest({
        mode, text, jobDescription, savedJobId: requestedSavedJobId,
      }) : null,
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
          message: "You've used your free report. The Job Search Pass is five more reports, good for 90 days.",
          free_uses_remaining: 0,
          free_uses_left: 0,
          access_tier: "preview"
        },
        { status: 402 }
      ));
    }

    authenticatedOperationId = accessReservation.operationId === authenticatedOperationId
      ? authenticatedOperationId
      : null;
    if (user && accessReservation.recoveredReportId) {
      // This operation is already durably committed. A recovery/readback error
      // must never enter the release/refund path for its consumed entitlement.
      reservationCommitted = true;
      const recoveredReport = await loadOwnedTrustedReport(
        admin, user.id, accessReservation.recoveredReportId,
      );
      return respond(NextResponse.json({
        ok: true,
        access,
        access_tier: accessTier,
        active_pass: activePass,
        user: { email: user.email },
        free_uses_remaining: freeUsesRemaining,
        report_id: accessReservation.recoveredReportId,
        report_receipt: null,
        recovery_id: null,
        operation_id: authenticatedOperationId,
        has_job_description: effectiveJobDescription.hasValue,
        data: recoveredReport,
      }));
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
      prompt_version: mode === "resume_ideas" ? "resume_ideas_v1" : resumePromptVersion(),
      schema_version: mode === "resume_ideas" ? "ideas_v1" : resumeSchemaVersion(),
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
      // The same validator and one bounded repair as the stream route (worklist or Critical Miss contract).
      const validated = await validateResumeStreamOutput({
        raw: initialRun.raw,
        text: canonicalResumeText,
        mode,
        model,
        messages,
        requestId: request_id,
        route,
        userIdForLogs: user_id,
        validationOptions: effectiveJobDescription.validationOptions,
        signal: request.signal,
      });
      payload = validated.payload;
      // Further Critical Misses, when RIYP_SEVERITY_CHECK is on. Any failure keeps the report as validated.
      const severity = await severityCheckReport({
        payload,
        mode,
        resumeText: canonicalResumeText,
        validationOptions: effectiveJobDescription.validationOptions,
        signal: request.signal,
        endpoint: "json",
        ctx: { request_id, route, user_id },
      });
      // Lines written to screening software, found in the text as sent, before the sanitizer redacted them.
      payload = withScreenerText(severity.payload, text, jobDescription);
      if (severity.outcome) {
        const call = severity.outcome.call_latency_ms ?? severity.outcome.latency_ms;
        recordStageTiming("severity_call", call, { endpoint: "json", outcome: severity.outcome.outcome === "error" ? "failed" : "ok", viewer: reportSignal.viewer });
        recordStageTiming("severity_merge", Math.max(0, severity.outcome.latency_ms - call), { endpoint: "json", outcome: "ok", viewer: reportSignal.viewer });
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
      if (!requestedRecoveryId) throw new Error("Anonymous report recovery was not established.");
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
      operation_id: authenticatedOperationId,
      has_job_description: effectiveJobDescription.hasValue,
      data: anonymousRecovery?.report ?? payload
    };

    const res = NextResponse.json(responseBody);
    res.headers.set("x-request-id", request_id);
    recordLaunchSignal("riyp.report.outcome", {
      ...reportSignal, endpoint: "json", outcome: "completed", failure: "none", latency_bucket: latencyBucketFor(startedAt),
    });
    recordStageTiming("total", Date.now() - startedAt, { endpoint: "json", outcome: "ok", viewer: reportSignal.viewer });

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
    // A pending operation is a retry still in flight, not an outcome.
    if (code !== "GENERATION_OPERATION_PENDING") {
      recordLaunchSignal("riyp.report.outcome", {
        ...reportSignal,
        endpoint: "json",
        outcome: "failed",
        failure: classifyReportFailure(err),
        error_code: String(code),
        latency_bucket: latencyBucketFor(startedAt),
      });
      recordStageTiming("total", Date.now() - startedAt, { endpoint: "json", outcome: "failed", viewer: reportSignal.viewer });
    }

    if (
      status >= 500 &&
      code !== "GENERATION_PAUSED" &&
      code !== "GENERATION_BUDGET_EXHAUSTED"
    ) {
      captureOperationalError(err, {
        operation: "generation.resume_feedback",
        tags: { error_code: String(code), ...(typeof err?.reason === "string" ? { reason: err.reason } : {}) },
      });
    }

    const baseMessage =
      code === "OPENAI_TIMEOUT"
        ? "This is taking longer than usual. Try again in a moment."
        : code === "OPENAI_NETWORK_ERROR"
          ? "Connection hiccup. Try again in a moment."
          : code === "OPENAI_RESPONSE_PARSE_ERROR" ||
            code === "OPENAI_RESPONSE_NOT_JSON"
            ? "We couldn't read the report that came back. Try again."
            : code === "OPENAI_RESPONSE_SHAPE_INVALID"
              ? "We couldn’t finish this report on our side. Your resume wasn’t the problem."
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
      operation_id: code === "GENERATION_OPERATION_TERMINAL"
        ? requestedOperationId
        : accessReservation?.operationId ?? null,
    }, { status });
    res.headers.set("x-request-id", request_id);
    if (disposition.anonymousCookieMeta) {
      res.cookies.set(FREE_COOKIE, makeFreeCookie(disposition.anonymousCookieMeta), freeCookieOptions());
    }
    return respond(res);
  }
}
