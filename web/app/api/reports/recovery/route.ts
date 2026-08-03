import { NextRequest, NextResponse } from "next/server";
import { ANONYMOUS_ID_COOKIE, parseAnonymousIdentityCookie } from "@/lib/backend/freeCookie";
import { hashAnonymousIdentity } from "@/lib/billing/anonymousIdentity";
import { createSupabaseAdminClient } from "@/lib/supabase/adminClient";
import { createSupabaseServerClient, maybeCreateSupabaseServerClient } from "@/lib/supabase/serverClient";
import { readJsonWithLimit } from "@/lib/security/requestBody";
import {
  lookupOwnedTrustedReport,
  ownedStoredReportExists,
  persistReceiptValidatedReport,
} from "@/lib/reports/generated-report-store";
import { validatedReportReceiptClaim } from "@/lib/reports/report-receipt";
import {
  loadAnonymousReportClaimTombstone,
  replaceAnonymousReportRecoveryWithClaimTombstone,
  type AnonymousReportClaimLookup,
} from "@/lib/reports/anonymous-report-claim-tombstone";
import {
  AnonymousReportRecoveryError,
  isAnonymousRecoveryId,
  loadAnonymousReportRecovery,
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
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  if (configured) {
    try {
      return new URL(configured).origin;
    } catch {
      return null;
    }
  }
  return process.env.NODE_ENV === "production" ? null : request.nextUrl.origin;
}

function isSameOriginMutation(request: NextRequest) {
  const origin = request.headers.get("origin");
  const expected = expectedOrigin(request);
  return Boolean(origin && expected && origin === expected);
}

function recoveryNotFound() {
  return privateJson({
    ok: false,
    errorCode: "RECOVERY_NOT_FOUND",
    message: "This completed report is not available for this browser identity.",
  }, 404);
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
    const recovery = await loadAnonymousReportRecovery({
      recoveryId,
      ...binding,
    });
    if (!recovery) return recoveryNotFound();
    return privateJson({
      ok: true,
      recovery_id: recovery.recovery_id,
      expiresAt: recovery.expires_at,
      report: recovery.report,
    });
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
        message: "Please sign in before saving this recovered report.",
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

    const reportId = await persistReceiptValidatedReport({
      admin,
      userId: user.id,
      payload: recovery.report,
      receiptHash: receiptClaim.receiptHash,
      receiptExpiresAt: receiptClaim.expiresAt,
      resumeHash: recovery.resume_hash,
      createdAt: recovery.created_at,
    });
    const replacement = await replaceAnonymousReportRecoveryWithClaimTombstone({
      envelope: recovery,
      userId: user.id,
      reportId,
    });
    if (replacement === "conflict") {
      const racedClaim = await loadAnonymousReportClaimTombstone(claimBinding);
      if (racedClaim) return await claimedResponse(racedClaim, recoveryId, admin, user.id);
      throw new AnonymousReportRecoveryError();
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
