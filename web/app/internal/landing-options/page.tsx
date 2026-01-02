"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { PocketMark } from "@/components/icons";

// Landing page variations
import { LandingBoldAuthority } from "@/components/landing-showcase/LandingBoldAuthority";
import { LandingUrgencyImpact } from "@/components/landing-showcase/LandingUrgencyImpact";
import { LandingDataDriven } from "@/components/landing-showcase/LandingDataDriven";
import { LandingImmersivePreview } from "@/components/landing-showcase/LandingImmersivePreview";
import { LandingGradientImpact } from "@/components/landing-showcase/LandingGradientImpact";
import { LandingModularConfidence } from "@/components/landing-showcase/LandingModularConfidence";

const landingPages = [
    {
        id: "bold-authority",
        name: "Bold Authority",
        description: "Professional & sophisticated. Stripe/Linear inspired with confident typography and clean hierarchy.",
        tags: ["Professional", "Clean", "Editorial"],
        component: LandingBoldAuthority,
    },
    {
        id: "urgency-impact",
        name: "Urgency & Impact",
        description: "Arc/Notion inspired. Emphasizes the 7.4-second countdown with dramatic contrast and bold statements.",
        tags: ["Bold", "Dramatic", "Time-focused"],
        component: LandingUrgencyImpact,
    },
    {
        id: "data-driven",
        name: "Data-Driven Trust",
        description: "Research-heavy approach. Stats prominent, recruiter credibility front and center, structured density.",
        tags: ["Research", "Stats", "Authority"],
        component: LandingDataDriven,
    },
];

export default function LandingOptionsPage() {
    const [selectedPage, setSelectedPage] = useState<string | null>(null);

    const selectedLanding = landingPages.find((p) => p.id === selectedPage);

    return (
        <div className="min-h-screen text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/95 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <PocketMark className="w-6 h-6 text-teal-400" />
                        <div>
                            <h1 className="text-lg font-medium tracking-tight">Landing Page Options</h1>
                            <p className="text-xs text-white/50">Internal design directory</p>
                        </div>
                    </div>
                    <div className="text-xs text-white/40 font-mono">
                        {landingPages.length} variations
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-10">
                {/* Grid of landing page cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {landingPages.map((page, index) => (
                        <motion.button
                            key={page.id}
                            onClick={() => setSelectedPage(page.id)}
                            className="group text-left p-6 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-teal-500/30 transition-all duration-300"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            {/* Preview placeholder */}
                            <div className="aspect-[16/10] rounded-lg bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/5 mb-4 overflow-hidden relative">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-xs text-white/30 font-mono uppercase tracking-widest">
                                        {String(index + 1).padStart(2, "0")}
                                    </span>
                                </div>
                                {/* Hover overlay */}
                                <div className="absolute inset-0 bg-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-sm text-teal-400 font-medium">Preview →</span>
                                </div>
                            </div>

                            {/* Card content */}
                            <div className="space-y-2">
                                <h3 className="text-base font-medium text-white group-hover:text-teal-400 transition-colors">
                                    {page.name}
                                </h3>
                                <p className="text-sm text-white/50 leading-relaxed">
                                    {page.description}
                                </p>
                                <div className="flex flex-wrap gap-1.5 pt-2">
                                    {page.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-white/40"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </div>

                {/* Instructions */}
                <div className="mt-12 text-center">
                    <p className="text-sm text-white/40">
                        Click any card to preview the full landing page. Use the navigation to compare variations.
                    </p>
                </div>
            </main>

            {/* Full-page preview modal */}
            <AnimatePresence>
                {selectedPage && selectedLanding && (
                    <motion.div
                        className="fixed inset-0 z-[100] bg-black"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Preview header */}
                        <div className="fixed top-0 left-0 right-0 z-[110] bg-black/90 backdrop-blur-md border-b border-white/10">
                            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setSelectedPage(null)}
                                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                    >
                                        <X className="w-5 h-5 text-white/70" />
                                    </button>
                                    <div>
                                        <h2 className="text-sm font-medium text-white">{selectedLanding.name}</h2>
                                        <p className="text-xs text-white/50">{selectedLanding.description}</p>
                                    </div>
                                </div>

                                {/* Navigation between pages */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            const currentIndex = landingPages.findIndex((p) => p.id === selectedPage);
                                            const prevIndex = (currentIndex - 1 + landingPages.length) % landingPages.length;
                                            setSelectedPage(landingPages[prevIndex].id);
                                        }}
                                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                    >
                                        <ChevronLeft className="w-5 h-5 text-white/70" />
                                    </button>
                                    <span className="text-xs text-white/50 font-mono min-w-[60px] text-center">
                                        {landingPages.findIndex((p) => p.id === selectedPage) + 1} / {landingPages.length}
                                    </span>
                                    <button
                                        onClick={() => {
                                            const currentIndex = landingPages.findIndex((p) => p.id === selectedPage);
                                            const nextIndex = (currentIndex + 1) % landingPages.length;
                                            setSelectedPage(landingPages[nextIndex].id);
                                        }}
                                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                    >
                                        <ChevronRight className="w-5 h-5 text-white/70" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Landing page content */}
                        <div className="pt-16 h-screen overflow-y-auto">
                            <selectedLanding.component />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
