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

// Regex patterns for PII detection in string values
export const PII_PATTERNS = {
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
export function containsForbiddenKeys(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  if (Array.isArray(value)) return value.some(containsForbiddenKeys);

  for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
    // Direct key match
    if (FORBIDDEN_KEYS.has(key)) return true;

    // Case-insensitive partial matches for common PII fields
    const lowerKey = key.toLowerCase();
    if (
      lowerKey.includes("email") ||
      lowerKey.includes("phone") ||
      lowerKey.includes("ssn") ||
      lowerKey.includes("resume") ||
      lowerKey.includes("password") ||
      lowerKey.includes("secret") ||
      lowerKey.includes("token")
    ) {
      return true;
    }

    // Recursively check nested objects
    if (containsForbiddenKeys(v)) return true;
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
export function scrubPiiFromObject(obj: unknown): unknown {
  if (!obj) return obj;

  if (typeof obj === "string") {
    return scrubPiiFromString(obj);
  }

  if (typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map(scrubPiiFromObject);
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase();

    // Replace forbidden keys entirely
    if (
      FORBIDDEN_KEYS.has(key) ||
      lowerKey.includes("resume") ||
      lowerKey.includes("email") ||
      lowerKey.includes("phone") ||
      lowerKey.includes("password") ||
      lowerKey.includes("token") ||
      lowerKey.includes("secret")
    ) {
      result[key] = "[REDACTED]";
    } else {
      result[key] = scrubPiiFromObject(value);
    }
  }

  return result;
}

/**
 * Get the list of forbidden keys for documentation
 */
export function getForbiddenKeysList(): string[] {
  return Array.from(FORBIDDEN_KEYS).sort();
}
