export const ACCOUNT_EXPORT_TTL_DAYS = 7;

export type AccountExportJobLike = {
  status?: unknown;
  expires_at?: unknown;
  result_json?: unknown;
};

type SupabaseAdminLike = {
  from(table: string): any;
};

export type AccountExportAccessState = "ready" | "not_ready" | "missing" | "expired";

export function accountExportExpiresAt(now: Date = new Date()): string {
  return new Date(now.getTime() + ACCOUNT_EXPORT_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();
}

/**
 * Completed exports fail closed when their expiry is absent or malformed. A
 * completed payload must have a valid, future expiry before it can be served.
 */
export function isAccountExportExpired(
  job: AccountExportJobLike,
  now: Date = new Date()
): boolean {
  if (job.status === "expired") return true;
  if (job.status !== "completed") return false;
  if (typeof job.expires_at !== "string" || !job.expires_at.trim()) return true;

  const expiresAtMs = Date.parse(job.expires_at);
  return !Number.isFinite(expiresAtMs) || expiresAtMs <= now.getTime();
}

export function resolveAccountExportAccess(
  job: AccountExportJobLike,
  now: Date = new Date()
): AccountExportAccessState {
  if (isAccountExportExpired(job, now)) return "expired";
  if (job.status !== "completed") return "not_ready";
  if (job.result_json === null || job.result_json === undefined) return "missing";
  return "ready";
}

export function accountExportExpirationPatch(now: Date = new Date()) {
  return {
    status: "expired" as const,
    result_json: null,
    file_path: null,
    file_url: null,
    updated_at: now.toISOString(),
  };
}

/**
 * Removes expired export payloads while retaining non-sensitive job metadata
 * so Settings can explain that the download has expired. A user id scopes
 * request-time cleanup; the scheduled job intentionally cleans every user.
 */
export async function expireAccountExportResults(
  admin: SupabaseAdminLike,
  options: { now?: Date; userId?: string } = {}
): Promise<number> {
  const now = options.now || new Date();
  const patch = accountExportExpirationPatch(now);

  let elapsedQuery = admin
    .from("account_export_jobs")
    .update(patch, { count: "exact" })
    .lte("expires_at", now.toISOString())
    .neq("status", "expired");
  if (options.userId) elapsedQuery = elapsedQuery.eq("user_id", options.userId);

  const elapsedResult = await elapsedQuery;
  if (elapsedResult.error) {
    throw new Error("Export retention enforcement failed");
  }

  // A completed export without a valid TTL must never become an indefinite
  // download. Completion writes result_json and expires_at atomically, so this
  // targets malformed or legacy rows rather than in-flight work.
  let missingExpiryQuery = admin
    .from("account_export_jobs")
    .update(patch, { count: "exact" })
    .eq("status", "completed")
    .is("expires_at", null);
  if (options.userId) missingExpiryQuery = missingExpiryQuery.eq("user_id", options.userId);

  const missingExpiryResult = await missingExpiryQuery;
  if (missingExpiryResult.error) {
    throw new Error("Export retention enforcement failed");
  }

  return Number(elapsedResult.count || 0) + Number(missingExpiryResult.count || 0);
}
