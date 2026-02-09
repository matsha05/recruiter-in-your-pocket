"use client";

import { useState } from "react";
import Footer from "@/components/landing/Footer";
import { landingContent } from "@/components/landing/landingConfig";
import { HeroSection } from "@/components/landing/sections/HeroSection";
import { EvidenceSection } from "@/components/landing/sections/EvidenceSection";
import { ResearchSection } from "@/components/landing/sections/ResearchSection";
import { TrustSection } from "@/components/landing/sections/TrustSection";
import { PricingSection } from "@/components/landing/sections/PricingSection";
import { LandingSectionFrame } from "@/components/landing/sections/SectionPrimitives";
import { Analytics } from "@/lib/analytics";

export default function LandingContent() {
    const [checkoutLoading, setCheckoutLoading] = useState<"monthly" | "lifetime" | null>(null);

    async function handleCheckout(tier: "monthly" | "lifetime") {
        setCheckoutLoading(tier);
        try {
            Analytics.checkoutStarted(tier, tier === "monthly" ? 9 : 79);
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tier,
                    source: "landing",
                    idempotencyKey: crypto.randomUUID(),
                }),
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (e) {
            Analytics.track("checkout_start_failed", { source: "landing", tier });
            console.error(e);
        } finally {
            setCheckoutLoading(null);
        }
    }

    return (
        <div className="landing-page selection:bg-teal-500/20">
            <HeroSection
                content={landingContent.hero}
                onPrimaryCta={() => {
                    Analytics.track("landing_cta_clicked", {
                        cta: landingContent.hero.primaryCta.analyticsCta,
                        destination: landingContent.hero.primaryCta.analyticsDestination,
                    });
                }}
            />

            <LandingSectionFrame id="evidence" tone="mist" density="default" divider="bottom">
                <EvidenceSection content={landingContent.evidence} />
            </LandingSectionFrame>

            <LandingSectionFrame tone="paper" density="default" divider="bottom">
                <ResearchSection content={landingContent.research} />
            </LandingSectionFrame>

            <TrustSection content={landingContent.trust} />

            <PricingSection
                content={landingContent.pricing}
                loadingTier={checkoutLoading}
                onCheckout={handleCheckout}
                onFreeSelect={() => {
                    Analytics.track("landing_cta_clicked", {
                        cta: "pricing_run_free_review",
                        destination: "/workspace",
                    });
                    window.location.href = "/workspace";
                }}
            />

            <Footer />
        </div>
    );
}
