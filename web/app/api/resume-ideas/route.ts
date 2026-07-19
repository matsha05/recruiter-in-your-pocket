import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { runJson } from "@/lib/llm/orchestrator";
import { resolveOpenAIModel } from "@/lib/llm/model-config";
import { JSON_INSTRUCTION, baseTone, loadPromptForMode } from "@/lib/backend/prompts";
import { validateResumeIdeasPayload, validateResumeIdeasRequest } from "@/lib/backend/validation";
import { hashForLogs, logError, logInfo, logWarn } from "@/lib/observability/logger";
import { getRequestId, routeLabel } from "@/lib/observability/requestContext";
import { rateLimitAsync } from "@/lib/security/rateLimit";
import { readJsonWithLimit } from "@/lib/security/requestBody";
import { maybeCreateSupabaseServerClient } from "@/lib/supabase/serverClient";
import { createSupabaseAdminClient } from "@/lib/supabase/adminClient";
import {
  FREE_COOKIE,
  freeCookieOptions,
  getCurrentMonthKey,
  makeFreeCookie,
  parseFreeCookie,
} from "@/lib/backend/freeCookie";
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

export async function POST(request: Request) {
  const request_id = getRequestId(request);
  const { method, path } = routeLabel(request);
  const route = `${method} ${path}`;
  const startedAt = Date.now();
  let accessReservation: GenerationAccessReservation | null = null;
  let reservationAdmin: GenerationAccessRpcClient | null = null;
  let user_id: string | undefined;
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
    const validation = validateResumeIdeasRequest(body);
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

    const { text } = validation.value;
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
    user_id = user?.id ? hashForLogs(user.id) : undefined;

    const cookieStore = await cookies();
    const freeParsed = parseFreeCookie(cookieStore.get(FREE_COOKIE)?.value);
    const freeMeta = freeParsed || {
      used: 0,
      last_free_ts: null,
      reset_month: getCurrentMonthKey(),
      needs_reset: true,
    };
    const bypass = isDevelopmentPaywallBypassEnabled();

    accessReservation = await reserveGenerationAccess({
      userId: user?.id || null,
      admin,
      reportKind: "resume_ideas",
      bypass,
      freeMeta,
      anonymousIdentityHash: hashForLogs(ip),
    });

    if (accessReservation.access === "preview") {
      const res = NextResponse.json(
        {
          ok: false,
          errorCode: "PAYWALL_REQUIRED",
          message: "You've used your free report. Paid access adds more reports, saved history, and export.",
        },
        { status: 402 }
      );
      res.headers.set("x-request-id", request_id);
      return res;
    }

    const systemPrompt = `${baseTone}\n\n${await loadPromptForMode("resume_ideas")}`;
    const userPrompt = `Here is the user's resume text. Read it closely, infer their primary role/discipline and level, and follow the system instructions to surface overlooked achievements that fit their background.

USER INPUT:
${text}`;

    const model = resolveOpenAIModel("resume_ideas");
    await markGenerationProviderCallStarted(accessReservation);
    const { parsed } = await runJson<any>({
      ctx: { request_id, route, user_id },
      task: "resume_ideas",
      mode: "resume_ideas",
      model,
      prompt_version: "resume_ideas_v1",
      schema_version: "ideas_v1",
      messages: [
        { role: "system", content: JSON_INSTRUCTION },
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    });

    const payload = validateResumeIdeasPayload(parsed);
    await commitGenerationAccess(accessReservation, admin);
    const res = NextResponse.json({ ok: true, data: payload });
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
      outcome: "success"
    });
    return res;
  } catch (err: any) {
    if (accessReservation) {
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
            : err?.message || "I had trouble pulling those questions. Try again in a moment.";
    logError({
      msg: "http.request.completed",
      request_id,
      route,
      method,
      path,
      status,
      latency_ms: Date.now() - startedAt,
      outcome: status === 400 ? "validation_error" : "internal_error",
      err: { name: err?.name || "Error", message: err?.message || message, code: String(code), stack: err?.stack }
    });
    const res = NextResponse.json({ ok: false, errorCode: code, message }, { status });
    res.headers.set("x-request-id", request_id);
    return res;
  }
}
