import "server-only";

import type { RebuildRequest } from "../backend/validation";
import { GenerationAccessError } from "../billing/generationAccess";
import type { GenerationAccessReservation } from "../billing/generationAccessTypes";
import { canonicalSourceIdentity, containsBoundedSourceExcerpt } from "../llm/source-fidelity";
import { rateLimitAsync } from "../security/rateLimit";
import { isAnonymousRecoveryId, loadAnonymousReportRecovery } from "./anonymous-report-recovery";
import { lookupOwnedTrustedReport } from "./generated-report-store";
import { ASK_FIRST_REBUILDS_PER_DAY, askFirstOffered, isAskFirstEnabled } from "./ask-first";

const DAY_MS = 24 * 60 * 60 * 1000;

function refused(code: string, message: string, httpStatus: number) {
  return new GenerationAccessError(code, message, httpStatus, false);
}

function firstFixExcerpt(report: unknown) {
  const fixes = (report as { top_fixes?: Array<{ evidence?: string | { excerpt?: string } }> } | null)?.top_fixes;
  const first = Array.isArray(fixes) ? fixes[0] : undefined;
  return canonicalSourceIdentity(typeof first?.evidence === "string" ? first.evidence : first?.evidence?.excerpt || "");
}

/**
 * The second read of a not-ready page (ask-first) runs without a reservation: it spends no free report
 * and no pass credit. What it needs instead: a first report this visitor can open (their saved report,
 * or their anonymous report's recovery), that report on the bottom rung, the first report's marked
 * line still on the page they sent, and fewer than the day's rebuilds for this identity.
 */
export async function reserveRebuild(input: {
  rebuild: RebuildRequest;
  text: string;
  userId: string | null;
  admin: unknown;
  anonymousIdentityHash: string | null;
}): Promise<GenerationAccessReservation> {
  if (!isAskFirstEnabled()) throw refused("REBUILD_UNAVAILABLE", "Writing the report from your answers isn't available right now. Your first report is unchanged.", 503);
  const identity = input.userId ? `user:${input.userId}` : input.anonymousIdentityHash ? `anon:${input.anonymousIdentityHash}` : null;
  if (!identity) throw refused("REBUILD_SOURCE_UNKNOWN", "We couldn't find the report this is written from. Your first report is unchanged.", 403);

  let source: unknown = null;
  try {
    if (input.userId && input.rebuild.reportId) {
      const lookup = await lookupOwnedTrustedReport(input.admin, input.userId, input.rebuild.reportId);
      source = lookup.status === "found" ? lookup.report : null;
    } else if (!input.userId && input.anonymousIdentityHash && isAnonymousRecoveryId(input.rebuild.recoveryId)) {
      const recovery = await loadAnonymousReportRecovery({ recoveryId: input.rebuild.recoveryId, identityHash: input.anonymousIdentityHash });
      source = recovery?.report ?? null;
    }
  } catch {
    source = null;
  }
  if (!source) throw refused("REBUILD_SOURCE_UNKNOWN", "We couldn't find the report this is written from. Your first report is unchanged.", 403);
  if (!askFirstOffered(source as Parameters<typeof askFirstOffered>[0])) {
    throw refused("REBUILD_NOT_OFFERED", "This report doesn't take a second read from answers. Your first report is unchanged.", 403);
  }
  const excerpt = firstFixExcerpt(source);
  if (!excerpt || !containsBoundedSourceExcerpt(input.text, excerpt)) {
    throw refused("REBUILD_SOURCE_MISMATCH", "That resume doesn't have the lines the first report quotes. Your first report is unchanged.", 400);
  }
  // Only a rebuild that is about to run counts against the day; a refusal above spends nothing.
  const limit = await rateLimitAsync(`${identity}:ask-first-rebuild`, ASK_FIRST_REBUILDS_PER_DAY, DAY_MS);
  if (!limit.ok) throw refused("REBUILD_RATE_LIMITED", "That's the day's limit for reports written from answers. Your first report is unchanged.", 429);

  return {
    access: "full",
    accessTier: "free_full",
    entitlementKind: "rebuild",
    reservationId: null,
    userId: input.userId,
    activePass: null,
    freeUsesRemaining: 0,
    anonymousCookieMeta: null,
    anonymousIdentityHash: null,
    anonymousMonthKey: null,
  };
}
