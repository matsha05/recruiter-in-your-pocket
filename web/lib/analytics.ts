const TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;

let mixpanelInstance: any = null;
let initPromise: Promise<void> | null = null;

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
      persistence: "localStorage"
    });
    mixpanelInstance = mixpanel;
  } catch (e) {
    console.warn("Analytics: Failed to load mixpanel", e);
  }
}

export function trackEvent(name: string, props: Record<string, any> = {}) {
  if (typeof window === "undefined") return; // Client only

  // Respect DNT
  const dnt = navigator.doNotTrack === "1" || (navigator as any).doNotTrack === "yes";
  if (dnt) {
    console.log("[Analytics DNT]", name, props);
    return;
  }

  // Lazy init
  if (!initPromise) {
    initPromise = initMixpanel();
  }

  initPromise.then(() => {
    if (mixpanelInstance) {
      mixpanelInstance.track(name, props);
    } else {
      console.log("[Analytics Dev]", name, props);
    }
  });
}




