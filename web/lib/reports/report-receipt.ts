import crypto from "crypto";

export const RECEIPT_TTL_MS = 24 * 60 * 60 * 1000;

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

function signature(report: unknown, receiptPayload: string) {
  return crypto.createHmac("sha256", signingSecret())
    .update(`anonymous-report-v1\n${receiptPayload}\n${stableJson(report)}`)
    .digest("hex");
}

export function makeValidatedReportReceipt(report: unknown, now = Date.now()) {
  const expiresAt = String(now + RECEIPT_TTL_MS);
  const nonce = crypto.randomBytes(16).toString("base64url");
  const receiptPayload = `${expiresAt}-${nonce}`;
  return `${receiptPayload}.${signature(report, receiptPayload)}`;
}

export function validatedReportReceiptClaim(report: unknown, receipt: unknown, now = Date.now()) {
  if (typeof receipt !== "string") return null;
  const segments = receipt.split(".");
  if (segments.length !== 2) return null;
  const [receiptPayload, supplied] = segments;
  const payloadMatch = receiptPayload.match(/^(\d{13})-([A-Za-z0-9_-]{22})$/u);
  const expiresAtMs = Number(payloadMatch?.[1]);
  if (
    !payloadMatch
    || !Number.isSafeInteger(expiresAtMs)
    || expiresAtMs <= now
    || expiresAtMs > now + RECEIPT_TTL_MS
    || !/^[a-f0-9]{64}$/u.test(supplied)
  ) return null;
  const expected = signature(report, receiptPayload);
  try {
    if (!crypto.timingSafeEqual(Buffer.from(supplied, "hex"), Buffer.from(expected, "hex"))) return null;
  } catch {
    return null;
  }
  return {
    receiptHash: crypto.createHash("sha256").update(receipt).digest("hex"),
    expiresAt: new Date(expiresAtMs).toISOString(),
  };
}

export function verifyValidatedReportReceipt(report: unknown, receipt: unknown) {
  return Boolean(validatedReportReceiptClaim(report, receipt));
}

export function validatedReportReceiptHash(report: unknown, receipt: unknown) {
  return validatedReportReceiptClaim(report, receipt)?.receiptHash || null;
}
