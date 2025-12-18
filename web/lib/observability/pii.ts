const FORBIDDEN_KEYS = new Set([
  "email",
  "name",
  "firstName",
  "lastName",
  "text",
  "resumeText",
  "resume_text",
  "jobDescription",
  "job_description_text",
  "report",
  "report_json",
  "authorization",
  "cookie",
  "cookies"
]);

export function containsForbiddenKeys(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  if (Array.isArray(value)) return value.some(containsForbiddenKeys);
  for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
    if (FORBIDDEN_KEYS.has(key)) return true;
    if (key.toLowerCase().includes("email")) return true;
    if (containsForbiddenKeys(v)) return true;
  }
  return false;
}
