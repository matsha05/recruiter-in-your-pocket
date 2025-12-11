"use client";

import { useState } from "react";
import { useAuth } from "../providers/AuthProvider";
import Header from "../landing/Header";
import Hero from "../landing/Hero";
import ValueStrip from "../landing/ValueStrip";
import Testimonials from "../landing/Testimonials";
import CompareStrip from "../landing/CompareStrip";
import ATSEducation from "../landing/ATSEducation";
import Pricing from "../landing/Pricing";
import Footer from "../landing/Footer";
import AuthModal from "../shared/AuthModal";
import PaywallModal from "../workspace/PaywallModal";

export default function LandingClient() {
    const { user, signOut, refreshUser } = useAuth();
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [isPaywallOpen, setIsPaywallOpen] = useState(false);
    const [selectedTier, setSelectedTier] = useState<"24h" | "30d">("24h");

    const handleSelectTier = (tier: "24h" | "30d") => {
        setSelectedTier(tier);
        setIsPaywallOpen(true);
    };

    const handleAuthSuccess = async () => {
        await refreshUser();
        setIsAuthOpen(false);
    };

    return (
        <div className="min-h-screen bg-body">
            <Header
                user={user ? { email: user.email || undefined, firstName: user.firstName || undefined } : null}
                onSignIn={() => setIsAuthOpen(true)}
                onSignOut={signOut}
            />
            <Hero />
            <ValueStrip />
            <Testimonials />

            {/* Muted content band: Compare + ATS Education */}
            <CompareStrip />
            <ATSEducation />

            <Pricing onSelectTier={handleSelectTier} />
            <Footer />

            {/* Auth Modal */}
            <AuthModal
                isOpen={isAuthOpen}
                onClose={() => setIsAuthOpen(false)}
                onSuccess={handleAuthSuccess}
            />

            {/* Paywall Modal */}
            <PaywallModal
                isOpen={isPaywallOpen}
                onClose={() => setIsPaywallOpen(false)}
                freeUsesRemaining={2}
                onSuccess={() => {
                    setIsPaywallOpen(false);
                }}
            />
        </div>
    );
}
