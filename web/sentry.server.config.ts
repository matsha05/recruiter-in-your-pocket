import * as Sentry from "@sentry/nextjs";
import {
  areSentryLogsEnabled,
  getSentryDsn,
  getSentryEnvironment,
  getSentryRelease,
  getSentryTracesSampleRate,
  isSentryEnabled,
  scrubSentryBreadcrumb,
  scrubSentryEvent,
} from "@/lib/observability/sentryConfig";

Sentry.init({
  dsn: getSentryDsn(),
  enabled: isSentryEnabled(),
  environment: getSentryEnvironment(),
  release: getSentryRelease(),
  tracesSampleRate: getSentryTracesSampleRate(),
  enableLogs: areSentryLogsEnabled(),
  sendDefaultPii: false,
  beforeSend: scrubSentryEvent,
  beforeBreadcrumb: scrubSentryBreadcrumb,
});
