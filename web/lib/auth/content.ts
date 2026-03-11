export type AuthContext = "default" | "report" | "settings" | "paywall" | "history" | "extension";

export const AUTH_COPY: Record<AuthContext, { headline: string; subtext: string }> = {
  default: {
    headline: "Pick up where you left off",
    subtext: "Use secure sign-in to reach your reports, history, and saved job context."
  },
  report: {
    headline: "Save this report",
    subtext: "Sign in to save this report to the right account and compare later versions."
  },
  settings: {
    headline: "Manage billing and account controls",
    subtext: "Use one secure sign-in to reach receipts, restore access, and account settings."
  },
  paywall: {
    headline: "Use the access you already paid for",
    subtext: "Purchases, credits, and restores stay tied to your signed-in account."
  },
  history: {
    headline: "Open your saved history",
    subtext: "Sign in to open saved reports, compare versions, and keep everything in one place."
  },
  extension: {
    headline: "Sync saved jobs across devices",
    subtext: "Sign in only if you want your extension history and studio history to stay in sync."
  }
};

export function getAuthCopy(context: AuthContext) {
  return AUTH_COPY[context] || AUTH_COPY.default;
}
