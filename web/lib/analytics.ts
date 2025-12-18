/**
 * Analytics Module
 * Professional Mixpanel implementation for SaaS conversion tracking
 * 
 * Capabilities:
 * - User identification with alias (links anonymous → logged-in)
 * - Super properties (attached to all events)
 * - User profile properties (for segmentation)
 * - Revenue tracking
 * - DNT compliance
 */

const TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;

let mixpanelInstance: any = null;
let initPromise: Promise<void> | null = null;
let currentUserId: string | null = null;

async function initMixpanel() {
  if (typeof window === "undefined") return;
  if (mixpanelInstance) return;
  if (!TOKEN) {
    console.warn("Analytics: NEXT_PUBLIC_MIXPANEL_TOKEN not set");
    return;
  }

  try {
    const mixpanel = (await import("mixpanel-browser")).default;
    mixpanel.init(TOKEN, {
      debug: process.env.NODE_ENV !== "production",
      track_pageview: true,
      persistence: "localStorage",
      ignore_dnt: false, // Respect DNT
      api_host: "https://api-js.mixpanel.com", // Direct API for better reliability
    });
    mixpanelInstance = mixpanel;

    // Set super properties that persist across all events
    mixpanel.register({
      app_version: "1.0.0",
      platform: "web",
    });
  } catch (e) {
    console.warn("Analytics: Failed to load mixpanel", e);
  }
}

function ensureInit(): Promise<void> {
  if (!initPromise) {
    initPromise = initMixpanel();
  }
  return initPromise;
}

function isDNT(): boolean {
  if (typeof navigator === "undefined") return false;
  return navigator.doNotTrack === "1" || (navigator as any).doNotTrack === "yes";
}

// ============================================
// CORE TRACKING
// ============================================

/**
 * Track an event with optional properties
 */
export function trackEvent(name: string, props: Record<string, any> = {}) {
  if (typeof window === "undefined") return;

  if (isDNT()) {
    console.log("[Analytics DNT]", name, props);
    return;
  }

  ensureInit().then(() => {
    if (mixpanelInstance) {
      mixpanelInstance.track(name, {
        ...props,
        timestamp: new Date().toISOString(),
      });
    } else {
      console.log("[Analytics Dev]", name, props);
    }
  });
}

// ============================================
// USER IDENTIFICATION
// ============================================

/**
 * Identify a user after login/signup
 * This links their anonymous activity to their user ID
 */
export function identifyUser(userId: string, traits?: {
  email?: string;
  name?: string;
  created_at?: string;
  plan?: string;
  credits_remaining?: number;
}) {
  if (typeof window === "undefined") return;
  if (isDNT()) return;

  ensureInit().then(() => {
    if (!mixpanelInstance) return;

    // Only alias if this is a new identification (prevents duplicate aliases)
    if (!currentUserId && userId) {
      // Alias links the anonymous distinct_id to the user's real ID
      mixpanelInstance.alias(userId);
    }

    // Identify the user going forward
    mixpanelInstance.identify(userId);
    currentUserId = userId;

    // Set user profile properties (for segmentation in Mixpanel)
    if (traits) {
      mixpanelInstance.people.set({
        $email: traits.email,
        $name: traits.name,
        $created: traits.created_at,
        plan: traits.plan,
        credits_remaining: traits.credits_remaining,
      });
    }

    console.log("[Analytics] User identified:", userId);
  });
}

/**
 * Update user properties (e.g., after plan change)
 */
export function setUserProperties(props: Record<string, any>) {
  if (typeof window === "undefined") return;
  if (isDNT()) return;

  ensureInit().then(() => {
    if (mixpanelInstance) {
      mixpanelInstance.people.set(props);
    }
  });
}

/**
 * Increment a numeric user property
 */
export function incrementUserProperty(prop: string, by: number = 1) {
  if (typeof window === "undefined") return;
  if (isDNT()) return;

  ensureInit().then(() => {
    if (mixpanelInstance) {
      mixpanelInstance.people.increment(prop, by);
    }
  });
}

/**
 * Reset analytics state on logout
 */
export function resetAnalytics() {
  if (typeof window === "undefined") return;

  ensureInit().then(() => {
    if (mixpanelInstance) {
      mixpanelInstance.reset();
      currentUserId = null;
      console.log("[Analytics] User reset");
    }
  });
}

// ============================================
// REVENUE TRACKING
// ============================================

/**
 * Track a revenue event (purchase)
 */
export function trackRevenue(amount: number, props?: {
  product?: string;
  credits?: number;
  currency?: string;
}) {
  if (typeof window === "undefined") return;
  if (isDNT()) return;

  ensureInit().then(() => {
    if (!mixpanelInstance) return;

    // Track the event
    mixpanelInstance.track("purchase_completed", {
      amount,
      currency: props?.currency || "USD",
      product: props?.product,
      credits: props?.credits,
    });

    // Track revenue on user profile
    mixpanelInstance.people.track_charge(amount, {
      product: props?.product,
    });

    // Increment total spend
    mixpanelInstance.people.increment("total_spend", amount);

    console.log("[Analytics] Revenue tracked:", amount);
  });
}

// ============================================
// SUPER PROPERTIES
// ============================================

/**
 * Set super properties (attached to all future events)
 */
export function setSuperProperties(props: Record<string, any>) {
  if (typeof window === "undefined") return;
  if (isDNT()) return;

  ensureInit().then(() => {
    if (mixpanelInstance) {
      mixpanelInstance.register(props);
    }
  });
}

// ============================================
// PRE-DEFINED EVENT HELPERS
// ============================================

export const Analytics = {
  // Funnel events
  resumeUploaded: (source: "landing" | "workspace") =>
    trackEvent("resume_uploaded", { source }),

  skimViewed: () =>
    trackEvent("skim_viewed"),

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

  // Auth events
  signupCompleted: (method: string) =>
    trackEvent("signup_completed", { method }),

  loginCompleted: (method: string) =>
    trackEvent("login_completed", { method }),

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
};
