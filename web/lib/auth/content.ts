export type AuthContext = "default" | "report" | "settings" | "paywall" | "history" | "extension" | "free_report";

export type AuthCopy = { headline: string };

// One headline per reason to sign in. The form explains itself; nothing sits under the headline.
const AUTH_COPY: Record<AuthContext, AuthCopy> = {
  default: { headline: "Sign in" },
  report: { headline: "Save this report" },
  settings: { headline: "Your account settings" },
  paywall: { headline: "Sign in to use your pass" },
  history: { headline: "Your saved reports" },
  extension: { headline: "Sync saved jobs across devices" },
  free_report: { headline: "Get your free report" },
};

const SETTINGS_WITH_BILLING: AuthCopy = { headline: "Your account and billing" };

export function getAuthCopy(
  context: AuthContext,
  { billingEnabled = false, extensionEnabled = false }: {
    billingEnabled?: boolean;
    extensionEnabled?: boolean;
  } = {},
): AuthCopy {
  if (context === "extension" && !extensionEnabled) return AUTH_COPY.default;
  if (context === "paywall" && !billingEnabled) return AUTH_COPY.default;
  if (context === "settings" && billingEnabled) return SETTINGS_WITH_BILLING;
  return AUTH_COPY[context] || AUTH_COPY.default;
}
