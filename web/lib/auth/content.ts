export type AuthContext = "default" | "report" | "settings" | "paywall" | "history" | "extension";

const AUTH_COPY: Record<AuthContext, { headline: string; subtext: string }> = {
  default: {
    headline: "Pick up where you left off",
    subtext: "Sign in to open your saved reports and account settings."
  },
  report: {
    headline: "Save this report",
    subtext: "Sign in to keep this report with your account."
  },
  settings: {
    headline: "Your account settings",
    subtext: "Sign in to manage your profile, export your data, or delete your account."
  },
  paywall: {
    headline: "Sign in to use your pass",
    subtext: "Sign in to use your pass or save a new purchase to your account."
  },
  history: {
    headline: "Your saved reports",
    subtext: "Sign in to return to a report or compare your revisions."
  },
  extension: {
    headline: "Sync saved jobs across devices",
    subtext: "Sign in to access your saved jobs on other devices."
  }
};

export function getAuthCopy(
  context: AuthContext,
  { billingEnabled = false, extensionEnabled = false }: {
    billingEnabled?: boolean;
    extensionEnabled?: boolean;
  } = {},
) {
  if (context === "extension" && !extensionEnabled) return AUTH_COPY.default;
  if (context === "paywall" && !billingEnabled) return AUTH_COPY.default;
  if (context === "settings" && billingEnabled) {
    return {
      headline: "Your account and billing",
      subtext: "Sign in to find receipts, restore a purchase, or manage your account.",
    };
  }
  if (context === "default" && extensionEnabled) {
    return {
      ...AUTH_COPY.default,
      subtext: "Sign in to open your saved reports, jobs, and account settings.",
    };
  }
  return AUTH_COPY[context] || AUTH_COPY.default;
}
