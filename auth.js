const crypto = require("crypto");
const SESSION_COOKIE = "rip_session";
const SESSION_TTL_DAYS = 30;

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

module.exports = {
  SESSION_COOKIE,
  SESSION_TTL_DAYS,
  makeSessionCookie,
  parseSessionCookie,
  cookieOptions
};


