/** Explicit-consent, schema-bounded product analytics. */
import { sanitizeAnalyticsEvent } from "./analyticsPolicy";
import { getAnalyticsConsent, subscribeAnalyticsConsent } from "./analyticsConsent";

const TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
const ANALYTICS_ENABLED = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true";
let mixpanelInstance: typeof import("mixpanel-browser").default | null = null;
let initPromise: Promise<void> | null = null;
let currentUserId: string | null = null;
let consentRevision = 0;
let sessionRevision = 0;
let sdkEnabled = false;

function canTrack() {
  return typeof window !== "undefined" && ANALYTICS_ENABLED && Boolean(TOKEN)
    && getAnalyticsConsent() === "accepted";
}

function clearAnalyticsStorage() {
  if (!TOKEN) return;
  try {
    for (const key of Object.keys(localStorage)) {
      if (key === `mp_${TOKEN}_mixpanel` || key.startsWith(`__mpq_${TOKEN}_`)) localStorage.removeItem(key);
    }
  } catch { /* Storage can be unavailable in a private browser. */ }
}

/** Install once at the app root, including cross-tab revocation. */
export function watchAnalyticsConsent() {
  let previous = getAnalyticsConsent();
  const sync = () => {
    const next = getAnalyticsConsent();
    if (next !== previous) { consentRevision++; previous = next; }
    if (!canTrack()) {
      if (mixpanelInstance && sdkEnabled) {
        // Clears queued events and stops senders without sending a profile deletion.
        mixpanelInstance.opt_out_tracking({ delete_user: false });
        sdkEnabled = false;
        currentUserId = null;
      }
      clearAnalyticsStorage();
    }
  };
  sync();
  return subscribeAnalyticsConsent(sync);
}

async function initMixpanel() {
  if (!canTrack()) return;
  if (!mixpanelInstance) {
    const mixpanel = (await import("mixpanel-browser")).default;
    // Consent can change while the SDK chunk is loading.
    if (!canTrack()) return;
    mixpanel.init(TOKEN!, {
      debug: false,
      track_pageview: false,
      autocapture: false,
      record_sessions_percent: 0,
      persistence: "localStorage",
      ignore_dnt: false,
      ip: false,
      save_referrer: false,
      stop_utm_persistence: true,
      skip_first_touch_marketing: true,
      // The SDK adds marketing/search fields even with automatic capture off.
      property_blacklist: [
        "$current_url", "$referrer", "$referring_domain", "$initial_referrer", "$initial_referring_domain", "mp_keyword", "$search_engine",
        "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "utm_id", "utm_source_platform", "utm_campaign_id", "utm_creative_format", "utm_marketing_tactic",
        "dclid", "fbclid", "gclid", "ko_click_id", "li_fat_id", "msclkid", "sccid", "ttclid", "twclid", "wbraid",
      ],
      api_host: "https://api-js.mixpanel.com",
    });
    mixpanelInstance = mixpanel;
    sdkEnabled = true;
    // A previous visit may have left the SDK opt-out marker. RIYP's explicit
    // consent is authoritative; clearing the marker sends no $opt_in event.
    mixpanel.clear_opt_in_out_tracking();
    mixpanel.register({ app_version: "1.0.0", platform: "web" });
  } else if (!sdkEnabled) {
    mixpanelInstance.clear_opt_in_out_tracking();
    mixpanelInstance.reset();
    mixpanelInstance.register({ app_version: "1.0.0", platform: "web" });
    sdkEnabled = true;
  }
}

async function withAnalytics(action: (sdk: NonNullable<typeof mixpanelInstance>) => void, accountScoped = false) {
  if (!canTrack()) return;
  const revision = consentRevision;
  const session = sessionRevision;
  try {
    if (!initPromise) initPromise = initMixpanel().finally(() => { initPromise = null; });
    await initPromise;
    // Never replay actions from before a change of consent.
    if (canTrack() && revision === consentRevision && (!accountScoped || session === sessionRevision) && mixpanelInstance && sdkEnabled) action(mixpanelInstance);
  } catch {
    // Optional telemetry must not interrupt the product or log private values.
  }
}

function trackEvent(name: string, props: Record<string, unknown> = {}) {
  const approved = sanitizeAnalyticsEvent(name, props);
  if (!approved) return;
  void withAnalytics(sdk => sdk.track(approved.name, approved.properties));
}

export function identifyUser(userId: string, traits?: {
  created_at?: string;
  plan?: string;
  credits_remaining?: number;
}) {
  void withAnalytics(sdk => {
    if (!currentUserId && userId) sdk.alias(userId);
    sdk.identify(userId);
    currentUserId = userId;
    if (traits) {
      const profile = { $created: traits.created_at, plan: traits.plan, credits_remaining: traits.credits_remaining };
      const defined = Object.fromEntries(Object.entries(profile).filter(([, value]) => value !== undefined));
      if (Object.keys(defined).length) sdk.people.set(defined);
    }
  }, true);
}

function incrementUserProperty(prop: string, by = 1) {
  void withAnalytics(sdk => sdk.people.increment(prop, by), true);
}

export function resetAnalytics() {
  // Pending account operations must not restore the previous account after a
  // reset. Public page views can still record when initial auth resolves empty.
  sessionRevision++;
  currentUserId = null;
  // Logging out must not load an SDK just to reset it.
  if (mixpanelInstance && sdkEnabled && canTrack()) mixpanelInstance.reset();
}

function trackRevenue(amount: number, props?: { product?: string; credits?: number; currency?: string }) {
  const approved = sanitizeAnalyticsEvent("purchase_completed", { amount, currency: props?.currency || "USD", product: props?.product, credits: props?.credits });
  if (!approved || typeof approved.properties.amount !== "number") return;
  void withAnalytics(sdk => {
    sdk.track(approved.name, approved.properties);
    sdk.people.track_charge(amount, { product: approved.properties.product });
    sdk.people.increment("total_spend", amount);
  }, true);
}

export const Analytics = {
  // Funnel events
  resumeUploaded: (source: "landing" | "workspace") =>
    trackEvent("resume_uploaded", { source }),

  reportStarted: (hasJobDescription: boolean) =>
    trackEvent("report_started", { has_jd: hasJobDescription }),

  reportCompleted: (score: number) => {
    trackEvent("report_completed", { score });
    incrementUserProperty("reports_generated");
  },

  // Conversion events
  paywallViewed: (reason: string) =>
    trackEvent("paywall_viewed", { reason }),

  checkoutStarted: (product: string, amount: number) =>
    trackEvent("checkout_started", { product, amount }),

  purchaseCompleted: (amount: number, product: string, credits: number) =>
    trackRevenue(amount, { product, credits }),

  // Post-purchase experience events
  paywallCtaClicked: (section: string) =>
    trackEvent("paywall_cta_clicked", { section }),

  unlockConfirmCompleted: (status: "success" | "error", latencyMs: number) =>
    trackEvent("unlock_confirm_completed", { status, latency_ms: latencyMs }),

  unlockUiRevealed: (section: string, ttsnMs: number) =>
    trackEvent("unlock_ui_revealed", { section, ttsn_ms: ttsnMs }),

  unlockContextMissing: () =>
    trackEvent("unlock_context_missing"),

  // Auth events
  signupCompleted: (method: string) =>
    trackEvent("signup_completed", { method }),

  loginCompleted: (method: string) =>
    trackEvent("login_completed", { method }),

  authGateViewed: (reason: string) =>
    trackEvent("auth_gate_viewed", { reason }),

  // Engagement events
  sampleReportViewed: () =>
    trackEvent("sample_report_viewed"),

  researchArticleViewed: (slug: string) =>
    trackEvent("research_article_viewed", { slug }),

  faqViewed: () =>
    trackEvent("faq_viewed"),

  pdfExported: () => {
    trackEvent("pdf_exported");
    incrementUserProperty("pdfs_exported");
  },

  // LinkedIn events
  linkedInReviewStarted: (source: "pdf" | "url") =>
    trackEvent("linkedin_review_started", { source }),

  linkedInReviewCompleted: (score: number) => {
    trackEvent("linkedin_review_completed", { score });
    incrementUserProperty("linkedin_reviews_generated");
  },

  // Generic track for one-off events
  track: (eventName: string, props?: Record<string, any>) =>
    trackEvent(eventName, props || {}),
};
