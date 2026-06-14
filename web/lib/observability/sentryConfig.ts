import type { Breadcrumb, ErrorEvent } from "@sentry/core";
import { scrubPiiFromObject } from "@/lib/observability/pii";

const DEFAULT_SENTRY_DSN =
  "https://e6b56bddbde9a76bcff473128fee1660@o4510598789988352.ingest.us.sentry.io/4510598790774784";

const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);
const FALSE_VALUES = new Set(["0", "false", "no", "off"]);

function parseBoolean(value: string | undefined, defaultValue: boolean) {
  if (!value) return defaultValue;
  const normalized = value.trim().toLowerCase();
  if (TRUE_VALUES.has(normalized)) return true;
  if (FALSE_VALUES.has(normalized)) return false;
  return defaultValue;
}

function isNonLocalUrl(value: string | undefined) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return !["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  } catch {
    return false;
  }
}

function getNumberEnv(...keys: string[]) {
  for (const key of keys) {
    const value = process.env[key];
    if (!value) continue;
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

export function isProductionObservabilityRuntime() {
  return (
    process.env.VERCEL_ENV === "production" ||
    isNonLocalUrl(process.env.NEXT_PUBLIC_APP_URL)
  );
}

export function getSentryDsn() {
  return (
    process.env.SENTRY_DSN ||
    process.env.NEXT_PUBLIC_SENTRY_DSN ||
    DEFAULT_SENTRY_DSN
  );
}

export function isSentryEnabled() {
  return parseBoolean(
    process.env.SENTRY_ENABLED || process.env.NEXT_PUBLIC_ENABLE_SENTRY,
    isProductionObservabilityRuntime()
  );
}

export function areSentryLogsEnabled() {
  return (
    isSentryEnabled() &&
    parseBoolean(
      process.env.SENTRY_ENABLE_LOGS || process.env.NEXT_PUBLIC_SENTRY_ENABLE_LOGS,
      false
    )
  );
}

export function getSentryTracesSampleRate() {
  const configured = getNumberEnv(
    "SENTRY_TRACES_SAMPLE_RATE",
    "NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE"
  );
  const fallback = isProductionObservabilityRuntime() ? 0.1 : 0;
  const sampleRate = configured ?? fallback;
  return Math.min(Math.max(sampleRate, 0), 1);
}

export function getSentryEnvironment() {
  return (
    process.env.SENTRY_ENVIRONMENT ||
    process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ||
    process.env.VERCEL_ENV ||
    process.env.NODE_ENV ||
    "development"
  );
}

export function getSentryRelease() {
  return process.env.SENTRY_RELEASE || process.env.VERCEL_GIT_COMMIT_SHA || undefined;
}

function scrubHeaders(headers: Record<string, string>) {
  const safeHeaders = { ...headers };
  for (const key of Object.keys(safeHeaders)) {
    const lowerKey = key.toLowerCase();
    if (lowerKey === "authorization" || lowerKey === "cookie" || lowerKey === "set-cookie") {
      delete safeHeaders[key];
    }
  }
  return safeHeaders;
}

export function scrubSentryEvent(event: ErrorEvent): ErrorEvent {
  if (event.request?.data) {
    event.request.data = scrubPiiFromObject(event.request.data);
  }

  if (event.request?.headers) {
    event.request.headers = scrubHeaders(event.request.headers);
  }

  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.map(scrubSentryBreadcrumb);
  }

  if (event.extra) {
    event.extra = scrubPiiFromObject(event.extra) as ErrorEvent["extra"];
  }

  return event;
}

export function scrubSentryBreadcrumb(breadcrumb: Breadcrumb): Breadcrumb {
  if (breadcrumb.data) {
    breadcrumb.data = scrubPiiFromObject(breadcrumb.data) as Breadcrumb["data"];
  }
  return breadcrumb;
}
