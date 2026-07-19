/**
 * PII Protection Module
 * 
 * Detects and blocks PII from:
 * - Application logs
 * - Error payloads
 * - Analytics events
 * - Sentry breadcrumbs
 * 
 * RT-010, RT-012: No PII in logs, error payloads, analytics, or Sentry
 */

// Keys that should NEVER appear in any log or external service
export const FORBIDDEN_KEYS = new Set([
  // Resume content
  "resumeText",
  "resume_text",
  "text",
  "pdfText",
  "pdf_text",
  "content",

  // Job description content
  "jobDescription",
  "job_description_text",
  "jd_text",

  // Personal identifiers
  "email",
  "phone",
  "ssn",
  "socialSecurityNumber",
  "social_security_number",
  "name",
  "firstName",
  "first_name",
  "lastName",
  "last_name",
  "fullName",
  "full_name",
  "address",
  "street",
  "city",
  "state",
  "zipCode",
  "zip_code",
  "zip",

  // Report data (could contain resume content)
  "report",
  "report_json",
  "reportJson",

  // Auth tokens
  "authorization",
  "cookie",
  "cookies",
  "token",
  "accessToken",
  "access_token",
  "refreshToken",
  "refresh_token",
  "sessionToken",
  "session_token",
  "apiKey",
  "api_key",
  "password",
  "secret"
]);

const FORBIDDEN_KEY_PATTERN = /(email|phone|ssn|resume|password|secret|token)/;
const FORBIDDEN_KEYS_LOWER = new Set(
  Array.from(FORBIDDEN_KEYS, (key) => key.toLowerCase())
);

// These fields collide with intentionally broad PII key rules, but are safe
// only at these exact structured-log paths and with these narrow value types.
// Do not add generic key-name exceptions here.
const SAFE_TELEMETRY_FIELDS: Record<string, (value: unknown) => boolean> = {
  "llm.tokens_in": (value) => Number.isSafeInteger(value) && Number(value) >= 0,
  "llm.tokens_out": (value) => Number.isSafeInteger(value) && Number(value) >= 0,
  "err.name": (value) =>
    typeof value === "string" &&
    /^(?:Error|[A-Za-z][A-Za-z0-9_.:-]{0,63}(?:Error|Exception))$/.test(value),
};

function isSafeTelemetryField(path: string[], value: unknown): boolean {
  const validator = SAFE_TELEMETRY_FIELDS[path.join(".").toLowerCase()];
  return validator ? validator(value) : false;
}

function isForbiddenKey(key: string): boolean {
  const lowerKey = key.toLowerCase();
  return FORBIDDEN_KEYS_LOWER.has(lowerKey) || FORBIDDEN_KEY_PATTERN.test(lowerKey);
}

// Regex patterns for PII detection in string values
const PII_PATTERNS = {
  // SSN: 123-45-6789
  ssn: /\b\d{3}-\d{2}-\d{4}\b/,

  // US Phone: (123) 456-7890, 123-456-7890, 123.456.7890, 1234567890
  phone: /(\(\d{3}\)\s?|\d{3}[-.\s]?)\d{3}[-.\s]?\d{4}/,

  // Email
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,

  // Zip code (standalone 5-digit or 5+4)
  zipCode: /\b\d{5}(-\d{4})?\b/,
};

/**
 * Check if an object contains any keys from the forbidden list
 * Used by logger to block entire log entries with PII
 */
export function containsForbiddenKeys(value: unknown, path: string[] = []): boolean {
  if (!value || typeof value !== "object") return false;
  if (Array.isArray(value)) {
    return value.some((item, index) => containsForbiddenKeys(item, [...path, String(index)]));
  }

  for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
    const fieldPath = [...path, key];

    // Safe telemetry exceptions are path- and type-specific. A `name` field
    // anywhere except err.name, for example, remains forbidden.
    if (isSafeTelemetryField(fieldPath, v)) continue;

    if (isForbiddenKey(key)) return true;

    // Recursively check nested objects
    if (containsForbiddenKeys(v, fieldPath)) return true;
  }

  return false;
}

/**
 * Check if a string contains PII patterns
 */
export function containsPiiPatterns(str: string): boolean {
  if (!str || typeof str !== "string") return false;

  for (const pattern of Object.values(PII_PATTERNS)) {
    if (pattern.test(str)) return true;
  }

  return false;
}

/**
 * Scrub PII from a string by replacing patterns with [REDACTED]
 */
export function scrubPiiFromString(str: string): string {
  if (!str || typeof str !== "string") return str;

  let result = str;

  // Replace SSN
  result = result.replace(/\b\d{3}-\d{2}-\d{4}\b/g, "[REDACTED-SSN]");

  // Replace phone numbers
  result = result.replace(/\b(\(\d{3}\)\s*|\d{3}[-.\s]?)\d{3}[-.\s]?\d{4}\b/g, "[REDACTED-PHONE]");

  // Replace email addresses
  result = result.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi, "[REDACTED-EMAIL]");

  return result;
}

/**
 * Recursively scrub PII from an object
 * Used for external service payloads (analytics, Sentry)
 */
export function scrubPiiFromObject(obj: unknown, path: string[] = []): unknown {
  if (!obj) return obj;

  if (typeof obj === "string") {
    return scrubPiiFromString(obj);
  }

  if (typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map((item, index) => scrubPiiFromObject(item, [...path, String(index)]));
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const fieldPath = [...path, key];

    if (isSafeTelemetryField(fieldPath, value)) {
      result[key] = value;
    } else if (isForbiddenKey(key)) {
      // Replace forbidden keys entirely.
      result[key] = "[REDACTED]";
    } else {
      result[key] = scrubPiiFromObject(value, fieldPath);
    }
  }

  return result;
}

/**
 * Get the list of forbidden keys for documentation
 */
function getForbiddenKeysList(): string[] {
  return Array.from(FORBIDDEN_KEYS).sort();
}
