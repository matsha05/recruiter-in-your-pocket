export type AuthContext = "default" | "report" | "settings" | "paywall";

export const AUTH_COPY: Record<AuthContext, { headline: string; subtext: string }> = {
  default: {
    headline: "Welcome back",
    subtext: "Sign in to access your reports and history."
  },
  report: {
    headline: "Save this report",
    subtext: "Keep this report and track improvements over time."
  },
  settings: {
    headline: "Manage your account",
    subtext: "Access billing, receipts, and saved reports."
  },
  paywall: {
    headline: "Use your credits",
    subtext: "Your purchases are linked to your account."
  }
};

export function getAuthCopy(context: AuthContext) {
  return AUTH_COPY[context] || AUTH_COPY.default;
}
