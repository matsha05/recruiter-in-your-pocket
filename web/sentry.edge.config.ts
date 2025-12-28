// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

// PII patterns to detect and scrub from error events
const PII_PATTERNS = [
  /\b\d{3}-\d{2}-\d{4}\b/g,           // SSN
  /\b\d{3}[.\-\s]?\d{3}[.\-\s]?\d{4}\b/g, // Phone numbers
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
];

// Keys that should never appear in Sentry events
const FORBIDDEN_KEYS = new Set([
  'resumeText', 'resume_text', 'text',
  'jobDescription', 'job_description_text', 'pdfText',
  'email', 'phone', 'ssn', 'name', 'firstName', 'lastName',
  'authorization', 'cookie', 'cookies',
  'report_json', 'report', 'content'
]);

function scrubPiiFromString(str: string): string {
  let result = str;
  for (const pattern of PII_PATTERNS) {
    result = result.replace(pattern, '[REDACTED]');
  }
  // Truncate long strings that might contain resume content
  if (result.length > 500) {
    result = result.substring(0, 500) + '...[TRUNCATED]';
  }
  return result;
}

function scrubPiiFromObject(obj: unknown): unknown {
  if (!obj || typeof obj !== 'object') {
    if (typeof obj === 'string') {
      return scrubPiiFromString(obj);
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(scrubPiiFromObject);
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    // Skip forbidden keys entirely
    if (FORBIDDEN_KEYS.has(key) || key.toLowerCase().includes('resume') || key.toLowerCase().includes('email')) {
      result[key] = '[REDACTED]';
    } else {
      result[key] = scrubPiiFromObject(value);
    }
  }
  return result;
}

Sentry.init({
  dsn: "https://e6b56bddbde9a76bcff473128fee1660@o4510598789988352.ingest.us.sentry.io/4510598790774784",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // DISABLED: Do not send default PII (RT-010, RT-012)
  sendDefaultPii: false,

  // Scrub PII from all events before sending
  beforeSend(event) {
    // Scrub request body if present
    if (event.request?.data) {
      event.request.data = scrubPiiFromObject(event.request.data) as Record<string, string>;
    }

    // Scrub request headers (remove auth tokens)
    if (event.request?.headers) {
      const headers = { ...event.request.headers };
      delete headers['authorization'];
      delete headers['cookie'];
      event.request.headers = headers;
    }

    // Scrub breadcrumb data
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map(breadcrumb => ({
        ...breadcrumb,
        data: breadcrumb.data ? scrubPiiFromObject(breadcrumb.data) as Record<string, unknown> : undefined
      }));
    }

    // Scrub extra context
    if (event.extra) {
      event.extra = scrubPiiFromObject(event.extra) as Record<string, unknown>;
    }

    return event;
  },

  // Also scrub breadcrumbs as they're added
  beforeBreadcrumb(breadcrumb) {
    if (breadcrumb.data) {
      breadcrumb.data = scrubPiiFromObject(breadcrumb.data) as Record<string, unknown>;
    }
    return breadcrumb;
  }
});
