"use client";

import { Analytics } from "@vercel/analytics/next";
import { getAnalyticsConsent } from "@/lib/analyticsConsent";
import { allowsPageStatistics, scrubPageUrl } from "@/lib/pageStatistics";

/** Vercel's cookieless page statistics, honoring Privacy choices and browser opt-outs. */
export function PageStatistics() {
    return (
        <Analytics
            beforeSend={(event) => {
                // Read the choice on every event so a withdrawal stops statistics immediately.
                if (!allowsPageStatistics(getAnalyticsConsent())) return null;
                return { ...event, url: scrubPageUrl(event.url) };
            }}
        />
    );
}
