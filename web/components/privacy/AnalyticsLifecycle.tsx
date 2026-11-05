"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Analytics, noteVisitEntry, watchAnalyticsConsent } from "@/lib/analytics";
import { getAnalyticsConsent, subscribeAnalyticsConsent } from "@/lib/analyticsConsent";
import { comparisonSlug, ctaClick, PAGE_SURFACES, researchArticleSlug } from "@/lib/analyticsSurfaces";

export function AnalyticsLifecycle() {
  const pathname = usePathname();
  useEffect(() => {
    // The landing address and referrer are only readable on the first page; later navigation drops them.
    noteVisitEntry(location.search, document.referrer, location.hostname);
    return watchAnalyticsConsent();
  }, []);
  useEffect(() => {
    let recorded = false;
    const record = () => {
      if (getAnalyticsConsent() !== "accepted") { recorded = false; return; }
      if (recorded) return;
      recorded = true;
      if (PAGE_SURFACES[pathname]) Analytics.track("page_viewed", { surface: PAGE_SURFACES[pathname] });
      if (pathname === "/sample-report") Analytics.sampleReportViewed();
      const slug = researchArticleSlug(pathname);
      if (slug) Analytics.researchArticleViewed(slug);
      const comparison = comparisonSlug(pathname);
      if (comparison) Analytics.comparisonViewed(comparison);
    };
    record();
    return subscribeAnalyticsConsent(record);
  }, [pathname]);
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest<HTMLAnchorElement>("a[data-analytics-cta]");
      if (!link) return;
      const click = ctaClick(pathname, link.dataset.analyticsCta, new URL(link.href, location.origin).pathname);
      if (click) Analytics.track("landing_cta_clicked", click);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname]);
  return null;
}
