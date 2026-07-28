import "server-only";

const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);

/**
 * Experimental server routes stay fail-closed unless a server-only flag is
 * deliberately enabled. Do not use NEXT_PUBLIC_* variables for these gates.
 */
export function isResumeIdeasApiEnabled(
  env: Record<string, string | undefined> = process.env,
) {
  return TRUE_VALUES.has(
    String(env.RIYP_ENABLE_RESUME_IDEAS_API || "").trim().toLowerCase(),
  );
}

export function areNewPurchasesDisabled(
  env: Record<string, string | undefined> = process.env,
) {
  return TRUE_VALUES.has(
    String(env.RIYP_DISABLE_NEW_PURCHASES || "").trim().toLowerCase(),
  );
}
