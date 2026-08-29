import crypto from "node:crypto";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

export function requireAuthenticatedGenerationOperationId(input: {
  mode: string;
  userId?: string | null;
  bypass: boolean;
  operationId?: unknown;
}) {
  if (input.mode !== "resume" || !input.userId || input.bypass) return null;
  if (typeof input.operationId === "string" && UUID_PATTERN.test(input.operationId)) {
    return input.operationId.toLowerCase();
  }
  const error = new Error(
    "This browser could not store the operation reference required for a signed-in report. Allow site storage, then try again.",
  ) as Error & { code: string; httpStatus: number; accessConsumed: boolean };
  error.code = "RECOVERY_STORAGE_REQUIRED";
  error.httpStatus = 409;
  error.accessConsumed = false;
  throw error;
}

export function generationOperationDigest(input: {
  mode: string;
  text: string;
  jobDescription?: string | null;
  savedJobId?: string | null;
}) {
  return crypto.createHash("sha256").update(JSON.stringify({
    mode: input.mode,
    text: input.text,
    jobDescription: input.jobDescription || null,
    savedJobId: input.savedJobId || null,
  })).digest("hex");
}
