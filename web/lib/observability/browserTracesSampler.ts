import type { ConsentState } from "../analyticsConsent";
import { allowsPageStatistics } from "../pageStatistics";

// Pages a paying customer passes through. A 10% sample left these with one to
// five Web Vitals readings a month, too few for a p75 or an alert.
const KEY_JOURNEY_ROUTES = [
  /^\/$/,
  /^\/workspace(?:\/|$)/,
  /^\/reports(?:\/|$)/,
  /^\/pricing\/?$/,
  /^\/auth(?:\/|$)/,
  /^\/purchase(?:\/|$)/,
  /^\/sample-report\/?$/,
];

export function isKeyJourneyRoute(pathname: string) {
  return KEY_JOURNEY_ROUTES.some((pattern) => pattern.test(pathname));
}

/**
 * Browser trace sampling, which is what carries real-user LCP, INP and CLS to
 * Sentry. It follows the page-statistics rule: nothing after an explicit
 * decline or a browser opt-out. Pageloads and navigations use their own
 * route; interactions use the page they happen on.
 */
export function browserTraceSampleRate(input: {
  op?: string;
  name?: string;
  currentPathname?: string;
  consent: ConsentState;
  baseRate: number;
  keyRouteRate: number;
  parentSampled?: boolean;
}): number {
  if (!allowsPageStatistics(input.consent)) return 0;
  const routing = input.op === "pageload" || input.op === "navigation";
  const pathname = routing ? input.name : input.currentPathname;
  if (pathname && isKeyJourneyRoute(pathname)) return input.keyRouteRate;
  if (input.parentSampled !== undefined) return input.parentSampled ? 1 : 0;
  return input.baseRate;
}
