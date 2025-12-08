const crypto = require("crypto");
const SESSION_COOKIE = "rip_session";
const SESSION_TTL_DAYS = 30;
const FREE_COOKIE = "rip_free_meta";
const FREE_COOKIE_DAYS = 365;
const FREE_RUN_LIMIT = 2;

function requireSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is required for session signing");
  }
  return secret;
}

function signToken(token) {
  const secret = requireSessionSecret();
  return crypto.createHmac("sha256", secret).update(token).digest("hex");
}

function makeSessionCookie(token) {
  const signature = signToken(token);
  return `${token}.${signature}`;
}

function parseSessionCookie(raw) {
  if (!raw || typeof raw !== "string") return null;
  const [token, signature] = raw.split(".");
  if (!token || !signature) return null;
  const expected = signToken(token);
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null;
  }
  return token;
}

/**
 * Create a signed free-run metadata cookie value
 * Format: base64(JSON({ used: number, last_free_ts: string })).signature
 */
function makeFreeCookie(meta) {
  const payload = JSON.stringify(meta);
  const encoded = Buffer.from(payload).toString("base64");
  const signature = signToken(encoded);
  return `${encoded}.${signature}`;
}

/**
 * Get current month key for reset tracking (format: "2024-01")
 */
function getCurrentMonthKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

/**
 * Parse and verify a signed free-run metadata cookie
 * Returns { used: number, last_free_ts: string, reset_month: string, needs_reset: boolean } or null if invalid
 * 
 * Monthly reset logic: if the stored reset_month differs from current month,
 * the uses are considered reset (needs_reset will be true)
 */
function parseFreeCookie(raw) {
  if (!raw || typeof raw !== "string") return null;
  const [encoded, signature] = raw.split(".");
  if (!encoded || !signature) return null;

  const expected = signToken(encoded);
  try {
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return null;
    }
  } catch {
    return null;
  }

  try {
    const payload = Buffer.from(encoded, "base64").toString("utf8");
    const meta = JSON.parse(payload);
    if (typeof meta.used !== "number" || meta.used < 0) return null;

    // Monthly reset check
    const currentMonth = getCurrentMonthKey();
    const storedMonth = meta.reset_month || null;

    if (storedMonth !== currentMonth) {
      // Month changed - reset uses
      return {
        used: 0,
        last_free_ts: null,
        reset_month: currentMonth,
        needs_reset: true
      };
    }

    return {
      ...meta,
      reset_month: currentMonth,
      needs_reset: false
    };
  } catch {
    return null;
  }
}

function cookieOptions() {
  const maxAgeMs = SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: maxAgeMs,
    path: "/"
  };
}

function freeCookieOptions() {
  const maxAgeMs = FREE_COOKIE_DAYS * 24 * 60 * 60 * 1000;
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: maxAgeMs,
    path: "/"
  };
}

module.exports = {
  SESSION_COOKIE,
  SESSION_TTL_DAYS,
  FREE_COOKIE,
  FREE_COOKIE_DAYS,
  FREE_RUN_LIMIT,
  makeSessionCookie,
  parseSessionCookie,
  makeFreeCookie,
  parseFreeCookie,
  cookieOptions,
  freeCookieOptions,
  getCurrentMonthKey
};



