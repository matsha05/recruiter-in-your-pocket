import crypto from "crypto";

const RECEIPT_TTL_MS = 24 * 60 * 60 * 1000;

function signingSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is required for report receipt signing");
  return secret;
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${stableJson(entry)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function signature(report: unknown, expiresAt: string) {
  return crypto.createHmac("sha256", signingSecret())
    .update(`${expiresAt}.${stableJson(report)}`)
    .digest("hex");
}

export function makeValidatedReportReceipt(report: unknown) {
  const expiresAt = String(Date.now() + RECEIPT_TTL_MS);
  return `${expiresAt}.${signature(report, expiresAt)}`;
}

export function verifyValidatedReportReceipt(report: unknown, receipt: unknown) {
  if (typeof receipt !== "string") return false;
  const [expiresAt, supplied] = receipt.split(".");
  if (!expiresAt || !supplied || Number(expiresAt) < Date.now()) return false;
  const expected = signature(report, expiresAt);
  try {
    return crypto.timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
  } catch {
    return false;
  }
}
