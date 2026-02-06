import type { ReportData } from "@/components/workspace/report/ReportTypes";

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const URL_RE = /\bhttps?:\/\/[^\s]+/gi;
const WWW_RE = /\bwww\.[^\s]+/gi;
const LINKEDIN_RE = /\blinkedin\.com\/[^\s]+/gi;
const PHONE_RE = /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}/g;

export function redactText(input: string): string {
  if (!input) return input;
  return input
    .replace(EMAIL_RE, "[redacted email]")
    .replace(LINKEDIN_RE, "[redacted link]")
    .replace(URL_RE, "[redacted link]")
    .replace(WWW_RE, "[redacted link]")
    .replace(PHONE_RE, "[redacted phone]");
}

function redactValue<T>(value: T): T {
  if (typeof value === "string") {
    return redactText(value) as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => redactValue(item)) as T;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, any>).map(([key, val]) => [
      key,
      redactValue(val)
    ]);
    return Object.fromEntries(entries) as T;
  }
  return value;
}

export function redactReport(report: ReportData): ReportData {
  return redactValue(report);
}
