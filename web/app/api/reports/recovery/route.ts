import { NextRequest, NextResponse } from "next/server";
import { ANONYMOUS_ID_COOKIE, parseAnonymousIdentityCookie } from "@/lib/backend/freeCookie";
import { hashAnonymousIdentity } from "@/lib/billing/anonymousIdentity";
import { createSupabaseAdminClient } from "@/lib/supabase/adminClient";
import { createSupabaseServerClient } from "@/lib/supabase/serverClient";
import { readJsonWithLimit } from "@/lib/security/requestBody";
import { persistReceiptValidatedReport } from "@/lib/reports/generated-report-store";
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

function claimedResponse(
  claim: AnonymousReportClaimLookup,
  recoveryId: string
) {
  return claim.status === "owned"
    ? privateJson({ ok: true, reportId: claim.reportId, recovery_id: recoveryId })
    : privateJson({
      ok: false,
      errorCode: "REPORT_RECEIPT_CONSUMED",
      message: "This recovered report has already been saved to an account.",
    }, 409);
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
    if (existingClaim) return claimedResponse(existingClaim, recoveryId);
    const recovery = await loadAnonymousReportRecovery({ recoveryId, ...binding });
    if (!recovery) {
      const racedClaim = await loadAnonymousReportClaimTombstone(claimBinding);
      return racedClaim ? claimedResponse(racedClaim, recoveryId) : recoveryNotFound();
    }
    const receiptClaim = validatedReportReceiptClaim(
      recovery.report,
      recovery.report_receipt
    );
    if (!receiptClaim) return recoveryNotFound();

    const reportId = await persistReceiptValidatedReport({
      admin: createSupabaseAdminClient(),
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
      if (racedClaim) return claimedResponse(racedClaim, recoveryId);
      throw new AnonymousReportRecoveryError();
    }
    return privateJson({ ok: true, reportId, recovery_id: recoveryId });
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
