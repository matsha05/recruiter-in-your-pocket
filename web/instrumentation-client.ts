// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { launchFlags } from "@/lib/launch/flags";
import { getAnalyticsConsent } from "@/lib/analyticsConsent";
import { browserTraceSampleRate } from "@/lib/observability/browserTracesSampler";
import {
  areSentryLogsEnabled,
  getSentryDsn,
  getSentryEnvironment,
  getSentryKeyRouteTracesSampleRate,
  getSentryRelease,
  getSentryTracesSampleRate,
  isSentryEnabled,
  scrubSentryBreadcrumb,
  scrubSentryEvent,
} from "@/lib/observability/sentryConfig";

const baseTracesSampleRate = getSentryTracesSampleRate();
const keyRouteTracesSampleRate = getSentryKeyRouteTracesSampleRate();

Sentry.init({
  dsn: getSentryDsn(),
  enabled: isSentryEnabled(),
  environment: getSentryEnvironment(),
  release: getSentryRelease(),

  // next.config.mjs inlines RIYP_BUNDLE_ERROR_REPLAY at build time. It must stay
  // in this condition, not in a variable, so webpack sees the constant and drops
  // the Replay recorder from every page when the replay flag is unset. The runtime
  // flag still decides whether a build that includes Replay records anything.
  integrations: process.env.RIYP_BUNDLE_ERROR_REPLAY === "1" && isSentryEnabled() && launchFlags.errorReplay
    ? [Sentry.replayIntegration()]
    : [],

  tracesSampler: ({ name, attributes, parentSampled }) => {
    const op = attributes?.["sentry.op"];
    return browserTraceSampleRate({
      op: typeof op === "string" ? op : undefined,
      name,
      currentPathname: window.location.pathname,
      consent: getAnalyticsConsent(),
      baseRate: baseTracesSampleRate,
      keyRouteRate: keyRouteTracesSampleRate,
      parentSampled,
    });
  },
  enableLogs: areSentryLogsEnabled(),

  // Define how likely Replay events are sampled.
  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: launchFlags.errorReplay ? 0.1 : 0,

  // Define how likely Replay events are sampled when an error occurs.
  replaysOnErrorSampleRate: launchFlags.errorReplay ? 1.0 : 0,

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: false,
  beforeSend: scrubSentryEvent,
  beforeBreadcrumb: scrubSentryBreadcrumb,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
