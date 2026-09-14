export const ANALYTICS_CONSENT_KEY = "riyp:analytics-consent:v1";
export const ANALYTICS_CONSENT_EVENT = "riyp:analytics-consent-changed";
export const PRIVACY_OPEN_EVENT = "riyp:privacy-open";
export type AnalyticsChoice = "accepted" | "declined";
export type ConsentState = AnalyticsChoice | "unknown" | "blocked";

let memoryChoice: AnalyticsChoice | undefined;

export function browserBlocksAnalytics(): boolean {
  if (typeof navigator === "undefined") return false;
  return navigator.doNotTrack === "1" || navigator.doNotTrack === "yes"
    || (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
}

export function getAnalyticsConsent(): ConsentState {
  if (typeof window === "undefined") return "unknown";
  if (browserBlocksAnalytics()) return "blocked";
  // Reads can succeed while writes fail (for example, a full storage quota).
  // The visitor's latest explicit choice must override a stale persisted one.
  if (memoryChoice !== undefined) return memoryChoice;
  try {
    const choice = localStorage.getItem(ANALYTICS_CONSENT_KEY);
    return choice === "accepted" || choice === "declined" ? choice : "unknown";
  } catch {
    return memoryChoice ?? "unknown";
  }
}

export function setAnalyticsConsent(choice: AnalyticsChoice) {
  if (typeof window === "undefined") return;
  const next = browserBlocksAnalytics() ? "declined" : choice;
  try {
    localStorage.setItem(ANALYTICS_CONSENT_KEY, next);
    memoryChoice = undefined;
  } catch {
    memoryChoice = next;
    // Removing stale acceptance also fails closed on the next page load and
    // signals withdrawal to other tabs when removals still work.
    try { localStorage.removeItem(ANALYTICS_CONSENT_KEY); } catch { /* Storage is unavailable. */ }
  }
  window.dispatchEvent(new Event(ANALYTICS_CONSENT_EVENT));
}

export function subscribeAnalyticsConsent(callback: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === ANALYTICS_CONSENT_KEY || event.key === null) {
      memoryChoice = undefined;
      callback();
    }
  };
  window.addEventListener(ANALYTICS_CONSENT_EVENT, callback);
  window.addEventListener("storage", onStorage);
  // Recheck browser signals when returning to this tab.
  window.addEventListener("focus", callback);
  return () => {
    window.removeEventListener(ANALYTICS_CONSENT_EVENT, callback);
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("focus", callback);
  };
}
