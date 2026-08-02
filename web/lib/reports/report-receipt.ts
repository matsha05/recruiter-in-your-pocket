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

function signature(report: unknown, receiptPayload: string) {
  return crypto.createHmac("sha256", signingSecret())
    .update(`anonymous-report-v1\n${receiptPayload}\n${stableJson(report)}`)
    .digest("hex");
}

export function makeValidatedReportReceipt(report: unknown) {
  const expiresAt = String(Date.now() + RECEIPT_TTL_MS);
  const nonce = crypto.randomBytes(16).toString("base64url");
  const receiptPayload = `${expiresAt}-${nonce}`;
  return `${receiptPayload}.${signature(report, receiptPayload)}`;
}

export function verifyValidatedReportReceipt(report: unknown, receipt: unknown) {
  if (typeof receipt !== "string") return false;
  const segments = receipt.split(".");
  if (segments.length !== 2) return false;
  const [receiptPayload, supplied] = segments;
  const payloadMatch = receiptPayload.match(/^(\d{13})-([A-Za-z0-9_-]{22})$/u);
  if (!payloadMatch || Number(payloadMatch[1]) < Date.now() || !/^[a-f0-9]{64}$/u.test(supplied)) return false;
  const expected = signature(report, receiptPayload);
  try {
    return crypto.timingSafeEqual(Buffer.from(supplied, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

export function validatedReportReceiptHash(report: unknown, receipt: unknown) {
  if (!verifyValidatedReportReceipt(report, receipt)) return null;
  return crypto.createHash("sha256").update(receipt as string).digest("hex");
}
