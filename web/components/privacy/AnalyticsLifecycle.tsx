"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Analytics, watchAnalyticsConsent } from "@/lib/analytics";
import { getAnalyticsConsent, subscribeAnalyticsConsent } from "@/lib/analyticsConsent";

const surfaces: Record<string, string> = {
  "/": "home", "/pricing": "pricing", "/workspace": "workspace",
  "/sample-report": "sample_report", "/research": "research", "/resources": "resources", "/faq": "faq",
};

export function AnalyticsLifecycle() {
  const pathname = usePathname();
  useEffect(() => watchAnalyticsConsent(), []);
  useEffect(() => {
    let recorded = false;
    const record = () => {
      if (getAnalyticsConsent() !== "accepted") { recorded = false; return; }
      if (recorded) return;
      recorded = true;
      if (surfaces[pathname]) Analytics.track("page_viewed", { surface: surfaces[pathname] });
      if (pathname === "/sample-report") Analytics.sampleReportViewed();
    };
    record();
    return subscribeAnalyticsConsent(record);
  }, [pathname]);
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (pathname !== "/" || !(event.target instanceof Element)) return;
      const link = event.target.closest<HTMLAnchorElement>("a[data-analytics-cta]");
      if (!link) return;
      const destination = new URL(link.href, location.origin).pathname;
      if (destination !== "/workspace" && destination !== "/sample-report") return;
      Analytics.track("landing_cta_clicked", { cta: link.dataset.analyticsCta, destination });
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname]);
  return null;
}
