import "server-only";

import { GenerationAccessError } from "../billing/generationAccess";
import type { GenerationAccessReservation, GenerationPassSnapshot } from "../billing/generationAccessTypes";
import { passIncludesPostingReads } from "../billing/entitlements";
import { containsBoundedSourceExcerpt } from "../llm/source-fidelity";
import { QUOTED_KINDS, isWorklistReport } from "../llm/worklist-schema";
import { rateLimitAsync } from "../security/rateLimit";
import { lookupOwnedTrustedReport } from "./generated-report-store";
import { POSTING_READS_PER_DAY } from "./posting-read-terms";
import { isLinkedInReport } from "./report-document";

const DAY_MS = 24 * 60 * 60 * 1000;

function refused(code: string, message: string, httpStatus: number) {
  return new GenerationAccessError(code, message, httpStatus, false);
}

/** The lines a saved worklist report quotes from its resume: what ties a posting read to the resume it was written on. */
export function quotedLinesOf(report: unknown): string[] {
  if (!isWorklistReport(report)) return [];
  return report.cards.filter((card) => QUOTED_KINDS.has(card.kind)).map((card) => card.line).filter(Boolean);
}

/**
 * Whether the text sent is the resume a saved report was written on: every line that report quotes is still
 * on it. A revised resume fails this, and is a new report. A report that quotes nothing can't vouch for any text.
 */
export function isSameResume(report: unknown, text: string) {
  const quoted = quotedLinesOf(report);
  return quoted.length > 0 && quoted.every((line) => containsBoundedSourceExcerpt(text, line));
}

async function activePassFor(admin: any, userId: string): Promise<GenerationPassSnapshot | null> {
  if (!admin) return null;
  const { data, error } = await admin
    .from("passes")
    .select("id, tier, expires_at, uses_remaining, created_at, revoked_at")
    .eq("user_id", userId)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(10);
  if (error) throw refused("ACCESS_DEPENDENCY_UNAVAILABLE", "We couldn't check your pass just now. Nothing was used. Try again in a minute.", 503);
  // The pass's term decides, not its report count: a pass with no reports left still includes posting reads.
  return ((data || []) as GenerationPassSnapshot[]).find((pass) => passIncludesPostingReads(pass)) || null;
}

/**
 * Reading a resume against a posting, included with the Job Search Pass (Matt's product call, Nov 10, 2026: a
 * person applies to many more jobs than a pass has reports, so the posting read can't be the thing they ration).
 * It runs without a reservation and spends no report, like the ask-first rebuild. What it needs instead: a
 * signed-in person with a pass still in its term (its reports may all be spent), a resume report of theirs, that report's quoted lines still on the text
 * they sent (so a new or revised resume is a report, not a posting read), a posting, and fewer than the day's
 * posting reads. A refusal says why and spends nothing; it never falls through to spending a report unasked.
 */
export async function reservePostingRead(input: {
  reportId: string;
  text: string;
  hasPosting: boolean;
  userId: string | null;
  admin: unknown;
}): Promise<GenerationAccessReservation> {
  if (!input.userId) throw refused("POSTING_READ_SIGN_IN", "Sign in to read this resume against a posting with your pass. Nothing was used.", 401);
  if (!input.hasPosting) throw refused("POSTING_READ_NO_POSTING", "Paste the job posting first. Nothing was used.", 400);

  const pass = await activePassFor(input.admin, input.userId);
  if (!pass) throw refused("POSTING_READ_NO_PASS", "Reading against a posting without using a report comes with the Job Search Pass. Nothing was used.", 402);

  let source: unknown = null;
  try {
    const lookup = await lookupOwnedTrustedReport(input.admin, input.userId, input.reportId);
    source = lookup.status === "found" ? lookup.report : null;
  } catch {
    source = null;
  }
  if (!source || isLinkedInReport(source)) {
    throw refused("POSTING_READ_SOURCE_UNKNOWN", "We couldn't find the resume report this posting read belongs to. Nothing was used.", 403);
  }
  if (!isSameResume(source, input.text)) {
    throw refused("POSTING_READ_RESUME_CHANGED", "This resume isn't the one that report was written on, so it needs a report of its own. Nothing was used.", 409);
  }
  // Only a read that is about to run counts against the day; a refusal above counts for nothing.
  const limit = await rateLimitAsync(`user:${input.userId}:posting-read`, POSTING_READS_PER_DAY, DAY_MS);
  if (!limit.ok) {
    throw refused("POSTING_READ_RATE_LIMITED", `That's today's ${POSTING_READS_PER_DAY} posting reads on your pass. They start again tomorrow. Nothing was used.`, 429);
  }

  return {
    access: "full",
    accessTier: "pass_full",
    entitlementKind: "posting_read",
    reservationId: null,
    userId: input.userId,
    activePass: pass,
    freeUsesRemaining: 0,
    anonymousCookieMeta: null,
    anonymousIdentityHash: null,
    anonymousMonthKey: null,
  };
}
