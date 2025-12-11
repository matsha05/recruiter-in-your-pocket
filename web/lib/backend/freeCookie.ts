import crypto from "crypto";

export const FREE_COOKIE = "rip_free_meta";
export const FREE_RUN_LIMIT = 2;
const FREE_COOKIE_DAYS = 365;

type FreeMeta = {
  used: number;
  last_free_ts: string | null;
  reset_month?: string;
};

export type ParsedFreeMeta = FreeMeta & {
  reset_month: string;
  needs_reset: boolean;
};

function requireSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is required for free-run cookie signing");
  return secret;
}

function signToken(token: string): string {
  const secret = requireSessionSecret();
  return crypto.createHmac("sha256", secret).update(token).digest("hex");
}

export function getCurrentMonthKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

/**
 * Create a signed free-run metadata cookie value
 * Format: base64(JSON({ used, last_free_ts, reset_month })).signature
 */
export function makeFreeCookie(meta: FreeMeta): string {
  const payload = JSON.stringify(meta);
  const encoded = Buffer.from(payload).toString("base64");
  const signature = signToken(encoded);
  return `${encoded}.${signature}`;
}

/**
 * Parse and verify signed cookie.
 * Includes monthly reset logic.
 */
export function parseFreeCookie(raw: string | undefined | null): ParsedFreeMeta | null {
  if (!raw || typeof raw !== "string") return null;
  const [encoded, signature] = raw.split(".");
  if (!encoded || !signature) return null;

  const expected = signToken(encoded);
  try {
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  } catch {
    return null;
  }

  try {
    const payload = Buffer.from(encoded, "base64").toString("utf8");
    const meta = JSON.parse(payload) as FreeMeta;
    if (typeof meta.used !== "number" || meta.used < 0) return null;

    const currentMonth = getCurrentMonthKey();
    const storedMonth = meta.reset_month || null;

    if (storedMonth !== currentMonth) {
      return {
        used: 0,
        last_free_ts: null,
        reset_month: currentMonth,
        needs_reset: true
      };
    }

    return {
      used: meta.used,
      last_free_ts: typeof meta.last_free_ts === "string" ? meta.last_free_ts : null,
      reset_month: currentMonth,
      needs_reset: false
    };
  } catch {
    return null;
  }
}

export function freeCookieOptions() {
  const maxAgeMs = FREE_COOKIE_DAYS * 24 * 60 * 60 * 1000;
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: maxAgeMs,
    path: "/"
  };
}

