import { NextRequest, NextResponse } from "next/server";
import {
  ANONYMOUS_ID_COOKIE,
  getCurrentMonthKey,
  parseAnonymousIdentityCookie,
} from "@/lib/backend/freeCookie";
import {
  anonymousNetworkHashFromRequest,
  hashAnonymousIdentity,
} from "@/lib/billing/anonymousIdentity";
import { hashForLogs, logWarn } from "@/lib/observability/logger";
import { createSupabaseAdminClient } from "@/lib/supabase/adminClient";
import { createSupabaseServerClient, maybeCreateSupabaseServerClient } from "@/lib/supabase/serverClient";
import { readJsonWithLimit } from "@/lib/security/requestBody";
import { getConfiguredAppUrl } from "@/lib/runtime/appUrl";
import {
  lookupOwnedTrustedReport,
  ownedStoredReportExists,
  persistReceiptValidatedReport,
} from "@/lib/reports/generated-report-store";
import { validatedReportReceiptClaim } from "@/lib/reports/report-receipt";
import {
  inspectAnonymousReportRecovery,
  loadAnonymousReportClaimTombstone,
  replaceAnonymousReportRecoveryWithClaimTombstone,
  type AnonymousReportClaimLookup,
} from "@/lib/reports/anonymous-report-claim-tombstone";
import {
  AnonymousReportRecoveryError,
  isAnonymousRecoveryId,
  loadAnonymousReportRecovery,
  type AnonymousReportRecoveryEnvelope,
} from "@/lib/reports/anonymous-report-recovery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function privateJson(body: unknown, status = 200) {
  const response = NextResponse.json(body, { status });
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("Pragma", "no-cache");
  return response;
}

function requestBinding(request: NextRequest) {
  const identity = parseAnonymousIdentityCookie(
    request.cookies.get(ANONYMOUS_ID_COOKIE)?.value
  );
  return identity ? {
    identityHash: hashAnonymousIdentity(identity),
  } : null;
}

function expectedOrigin(request: NextRequest) {
  // Authorization uses trusted deployment configuration, never forwarded host headers.
  const configured = process.env.VERCEL_ENV === "preview"
    ? getConfiguredAppUrl()
    : process.env.NEXT_PUBLIC_APP_URL;
  if (configured) {
    try {
      return new URL(configured).origin;
    } catch {
      return null;
    }
  }
  if (process.env.NEXT_PUBLIC_APP_URL) return null;
  return process.env.NODE_ENV === "production" ? null : request.nextUrl.origin;
}

function isSameOriginMutation(request: NextRequest) {
  const origin = request.headers.get("origin");
  const expected = expectedOrigin(request);
  return Boolean(origin && expected && origin === expected);
}

// Terminal: the recovery id is not bound to this browser identity. The browser
// clears its marker and stops polling.
function recoveryNotFound() {
  return privateJson({
    ok: false,
    errorCode: "RECOVERY_NOT_FOUND",
    message: "This completed report is not available for this browser identity.",
  }, 404);
}

// Not terminal: a hold is in flight for this identity, or nothing is stored
// yet. The browser keeps its marker and polls on its bounded schedule.
function recoveryPending(recoveryId: string, reason: "generating" | "unknown") {
  return privateJson({
    ok: false,
    recovery_id: recoveryId,
    status: "pending",
    reason,
  }, 202);
}

// Terminal: the report existed for this browser and will not come back here,
// because it was saved to an account or its recovery window closed.
function recoveryGone(errorCode: "RECOVERY_CLAIMED" | "RECOVERY_EXPIRED") {
  return privateJson({
    ok: false,
    errorCode,
    message: errorCode === "RECOVERY_CLAIMED"
      ? "This report has already been saved to an account."
      : "This browser can no longer bring that report back.",
  }, 410);
}

function firstRpcRecord(data: unknown): Record<string, unknown> | null {
  const value = Array.isArray(data) ? data[0] : data;
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

async function authenticatedOperationStatus(recoveryId: string) {
  const supabase = await maybeCreateSupabaseServerClient();
  if (!supabase) return null;
  const { data, error: authError } = await supabase.auth.getUser();
  if (authError) {
    const authFailure = authError as { name?: unknown; code?: unknown };
    const sessionMissing = authFailure.name === "AuthSessionMissingError"
      || String(authFailure.code || "").toLowerCase() === "auth_session_missing";
    if (sessionMissing) return null;
    return privateJson({
      ok: false,
      errorCode: "OPERATION_STATUS_UNAVAILABLE",
      message: "Report recovery is temporarily unavailable.",
    }, 503);
  }
  const user = data.user;
  if (!user) return null;
  const admin = createSupabaseAdminClient();
  if (!admin) return privateJson({
    ok: false,
    errorCode: "OPERATION_STATUS_UNAVAILABLE",
    message: "Report recovery is temporarily unavailable.",
  }, 503);
  const statusRpc = await admin.rpc("get_generation_operation_status", {
    p_user_id: user.id,
    p_operation_id: recoveryId,
  });
  if (statusRpc.error) return privateJson({
    ok: false,
    errorCode: "OPERATION_STATUS_UNAVAILABLE",
    message: "Report recovery is temporarily unavailable.",
  }, 503);
  const status = firstRpcRecord(statusRpc.data);
  if (!status || typeof status.found !== "boolean") return privateJson({
    ok: false,
    errorCode: "OPERATION_STATUS_UNAVAILABLE",
    message: "Report recovery is temporarily unavailable.",
  }, 503);
  if (!status.found) return null;
  if (status.operation_state === "pending") return privateJson({
    ok: false,
    operation_id: recoveryId,
    status: "pending",
  }, 202);
  if (status.operation_state === "committed" && typeof status.report_id === "string") {
    const report = await lookupOwnedTrustedReport(admin, user.id, status.report_id);
    if (report.status === "missing") return privateJson({
      ok: false,
      errorCode: "RECOVERED_REPORT_GONE",
      message: "This completed report is no longer in your account.",
    }, 410);
    if (report.status === "unavailable") return privateJson({
      ok: false,
      errorCode: "OPERATION_STATUS_UNAVAILABLE",
      message: "Report recovery is temporarily unavailable.",
    }, 503);
    return privateJson({
      ok: true,
      operation_id: recoveryId,
      recovery_id: recoveryId,
      reportId: status.report_id,
      report: report.report,
    });
  }
  return privateJson({
    ok: false,
    errorCode: status.operation_state === "gone" ? "RECOVERED_REPORT_GONE" : "GENERATION_OPERATION_TERMINAL",
    message: "This report operation no longer has a recoverable result.",
  }, 410);
}

async function claimedResponse(
  claim: AnonymousReportClaimLookup,
  recoveryId: string,
  admin: any,
  userId: string,
) {
  if (claim.status !== "owned") return privateJson({
      ok: false,
      errorCode: "REPORT_RECEIPT_CONSUMED",
      message: "This recovered report has already been saved to an account.",
    }, 409);
  if (await ownedStoredReportExists(admin, userId, claim.reportId)) {
    return privateJson({ ok: true, reportId: claim.reportId, recovery_id: recoveryId });
  }
  return privateJson({
    ok: false,
    errorCode: "RECOVERED_REPORT_GONE",
    message: "This recovered report is no longer in your account.",
  }, 410);
}

async function tombstoneAfterClaim(
  recovery: AnonymousReportRecoveryEnvelope,
  userId: string,
  reportId: string,
): Promise<"created" | "idempotent" | "conflict" | "deferred"> {
  try {
    const replacement = await replaceAnonymousReportRecoveryWithClaimTombstone({
      envelope: recovery,
      userId,
      reportId,
    });
    if (replacement === "conflict") {
      logWarn({
        msg: "recovery.claim.tombstone_conflict",
        route: "POST /api/reports/recovery",
        user_id: hashForLogs(userId),
      });
    }
    return replacement;
  } catch (error) {
    if (!(error instanceof AnonymousReportRecoveryError)) throw error;
    // The account already holds the report (step 1). The envelope stays until
    // a retry tombstones it or its TTL ends.
    logWarn({
      msg: "recovery.claim.tombstone_deferred",
      route: "POST /api/reports/recovery",
      user_id: hashForLogs(userId),
      err: { name: error.name, message: error.message, code: error.code },
    });
    return "deferred";
  }
}

export async function GET(request: NextRequest) {
  const recoveryId = request.nextUrl.searchParams.get("recovery_id");
  if (!isAnonymousRecoveryId(recoveryId)) {
    return privateJson({
      ok: false,
      errorCode: "INVALID_RECOVERY_ID",
      message: "A valid recovery ID is required.",
    }, 400);
  }
  let operationStatus: NextResponse | null;
  try {
    operationStatus = await authenticatedOperationStatus(recoveryId);
  } catch {
    operationStatus = privateJson({
      ok: false,
      errorCode: "OPERATION_STATUS_UNAVAILABLE",
      message: "Report recovery is temporarily unavailable.",
    }, 503);
  }
  if (operationStatus) return operationStatus;
  const binding = requestBinding(request);
  if (!binding) return recoveryNotFound();
  try {
    const lookup = await inspectAnonymousReportRecovery({
      recoveryId,
      identityHash: binding.identityHash,
      shadowHash: anonymousNetworkHashFromRequest(request),
      monthKey: getCurrentMonthKey(),
    });
    switch (lookup.state) {
      case "found":
        return privateJson({
          ok: true,
          recovery_id: lookup.envelope.recovery_id,
          expiresAt: lookup.envelope.expires_at,
          report: lookup.envelope.report,
        });
      case "pending":
        return recoveryPending(recoveryId, lookup.reason);
      case "claimed":
        return recoveryGone("RECOVERY_CLAIMED");
      case "expired":
        return recoveryGone("RECOVERY_EXPIRED");
      default:
        return recoveryNotFound();
    }
  } catch (error) {
    const unavailable = error instanceof AnonymousReportRecoveryError;
    return privateJson({
      ok: false,
      errorCode: unavailable ? error.code : "RECOVERY_FAILED",
      message: "Report recovery is temporarily unavailable.",
    }, 503);
  }
}

export async function POST(request: NextRequest) {
  if (!isSameOriginMutation(request)) {
    return privateJson({
      ok: false,
      errorCode: "INVALID_ORIGIN",
      message: "This recovery claim was not accepted.",
    }, 403);
  }
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) {
      return privateJson({
        ok: false,
        errorCode: "AUTH_REQUIRED",
        message: "Sign in to save this recovered report.",
      }, 401);
    }
    const admin = createSupabaseAdminClient();

    const body = await readJsonWithLimit<unknown>(request, 4 * 1024);
    if (
      !body || typeof body !== "object" || Array.isArray(body)
      || Object.keys(body).length !== 1
      || !isAnonymousRecoveryId((body as Record<string, unknown>).recovery_id)
    ) {
      return privateJson({
        ok: false,
        errorCode: "INVALID_RECOVERY_ID",
        message: "Only a valid recovery ID may be claimed.",
      }, 400);
    }
    const recoveryId = (body as { recovery_id: string }).recovery_id;
    const binding = requestBinding(request);
    if (!binding) return recoveryNotFound();
    const claimBinding = { recoveryId, ...binding, userId: user.id };
    const existingClaim = await loadAnonymousReportClaimTombstone(claimBinding);
    if (existingClaim) return await claimedResponse(existingClaim, recoveryId, admin, user.id);
    const recovery = await loadAnonymousReportRecovery({ recoveryId, ...binding });
    if (!recovery) {
      const racedClaim = await loadAnonymousReportClaimTombstone(claimBinding);
      return racedClaim ? await claimedResponse(racedClaim, recoveryId, admin, user.id) : recoveryNotFound();
    }
    const receiptClaim = validatedReportReceiptClaim(
      recovery.report,
      recovery.report_receipt
    );
    if (!receiptClaim) return recoveryNotFound();

    // Claim order, and why a failure between the two writes converges:
    // 1. Postgres `claim_anonymous_report_receipt` is the owner record and the
    //    only write that matters. It is idempotent per receipt: the same
    //    account gets the same report id back on a retry, another account
    //    gets "consumed".
    // 2. The Redis tombstone replaces the envelope so this browser stops
    //    serving a report that now lives in an account. It is derived from
    //    step 1, so if it fails or the envelope is gone the claim is still
    //    complete: answer with the saved report. The next retry runs step 1
    //    (idempotent) and step 2 again; otherwise the envelope's own TTL
    //    closes the window.
    const reportId = await persistReceiptValidatedReport({
      admin,
      userId: user.id,
      payload: recovery.report,
      receiptHash: receiptClaim.receiptHash,
      receiptExpiresAt: receiptClaim.expiresAt,
      resumeHash: recovery.resume_hash,
      createdAt: recovery.created_at,
    });
    const replacement = await tombstoneAfterClaim(recovery, user.id, reportId);
    if (replacement === "conflict") {
      const racedClaim = await loadAnonymousReportClaimTombstone(claimBinding);
      if (racedClaim) return await claimedResponse(racedClaim, recoveryId, admin, user.id);
    }
    return await claimedResponse({ status: "owned", reportId }, recoveryId, admin, user.id);
  } catch (error: any) {
    const consumed = error?.code === "REPORT_RECEIPT_CONSUMED";
    const unavailable = error instanceof AnonymousReportRecoveryError;
    return privateJson({
      ok: false,
      errorCode: consumed
        ? "REPORT_RECEIPT_CONSUMED"
        : unavailable ? error.code : "RECOVERY_CLAIM_FAILED",
      message: consumed
        ? "This recovered report has already been saved to an account."
        : "The recovered report could not be saved safely.",
    }, consumed ? 409 : 503);
  }
}
