import type { AuthContext } from "@/lib/auth/content";

const AUTH_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeAuthEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function isValidAuthEmail(value: unknown) {
  const email = normalizeAuthEmail(value);
  return email.length > 0 && email.length <= 254 && AUTH_EMAIL_PATTERN.test(email);
}

export function normalizeAuthContext(from: string | null): AuthContext {
  if (from === "report" || from === "settings" || from === "paywall" || from === "history" || from === "extension") return from;
  if (from === "reports") return "history";
  if (from === "purchase") return "paywall";
  return "default";
}

export function safeAuthRedirect(nextParam: string | null, fallback: string) {
  if (!nextParam || !nextParam.startsWith("/") || nextParam.startsWith("//") || nextParam.includes("\\")) {
    return fallback;
  }

  try {
    const decoded = decodeURIComponent(nextParam);
    if (!decoded.startsWith("/") || decoded.startsWith("//") || decoded.includes("\\")) {
      return fallback;
    }

    const base = "https://auth-redirect.local";
    const parsed = new URL(nextParam, base);
    if (parsed.origin !== base) return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}
