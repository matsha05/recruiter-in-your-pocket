import type { AuthContext } from "@/lib/auth/content";

export function normalizeAuthContext(from: string | null): AuthContext {
  if (from === "report" || from === "settings" || from === "paywall") return from;
  return "default";
}

export function safeAuthRedirect(nextParam: string | null, fallback: string) {
  if (nextParam && nextParam.startsWith("/")) return nextParam;
  return fallback;
}
