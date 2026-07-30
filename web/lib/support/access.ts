import "server-only";

type SupportAccessEnvironment = Record<string, string | undefined>;

function configuredOperatorEmails(env: SupportAccessEnvironment) {
  return new Set(
    String(env.RIYP_SUPPORT_OPERATOR_EMAILS || "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter((email) => /^[^\s@]+@[^\s@]+$/.test(email))
  );
}

export function hasConfiguredSupportOperators(
  env: SupportAccessEnvironment = process.env
) {
  return configuredOperatorEmails(env).size > 0;
}

/**
 * Support replies are a privileged server-side action. An absent allowlist is
 * intentionally a deny-all configuration so a new deployment cannot expose
 * the composer by accident.
 */
export function canAccessSupportReply(
  email: string | null | undefined,
  env: SupportAccessEnvironment = process.env
) {
  if (!email) return false;
  const operators = configuredOperatorEmails(env);
  return operators.size > 0 && operators.has(email.trim().toLowerCase());
}
