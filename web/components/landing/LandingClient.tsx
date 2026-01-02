"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, Shield, Trash2 } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ResumeDropzone } from "@/components/upload/ResumeDropzone";
import Footer from "@/components/landing/Footer";
import { SampleReportPreview } from "@/components/landing/SampleReportPreview";
import { BackedByResearch } from "@/components/landing/BackedByResearch";
import { Pricing } from "@/components/landing/Pricing";
import { Testimonials } from "@/components/landing/Testimonials";
import { Analytics } from "@/lib/analytics";

/**
 * Landing Page v2 - Awwwards-grade Premium
 * 
 * Upgrades:
 * - Hero with subtle brand gradient
 * - LinkedIn button as styled pill
 * - Trust badges with pill backgrounds
 * - Signature moment animations
 */

export default function LandingClient() {
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleFileSelect = async (file: File) => {
        setIsProcessing(true);
        Analytics.resumeUploaded("landing");

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/parse-resume", {
                method: "POST",
                body: formData
            });

            if (!res.ok) throw new Error("Failed to parse");

            const data = await res.json();

            if (data.ok && data.text) {
                sessionStorage.setItem("pending_resume_text", data.text);
                sessionStorage.setItem("pending_auto_run", "true");
            }

            router.push("/workspace");
        } catch (err) {
            console.error(err);
            router.push("/workspace");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-brand/20">
            <SiteHeader />

            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Hero Section with Gradient */}
                <section className="relative px-6 py-12 lg:py-20 overflow-hidden">
                    {/* Subtle radial gradient background */}
                    <div
                        className="absolute inset-0 bg-gradient-to-br from-brand/[0.03] via-transparent to-violet-500/[0.02] pointer-events-none"
                        aria-hidden="true"
                    />
                    {/* Subtle top-right glow */}
                    <div
                        className="absolute -top-24 -right-24 w-96 h-96 bg-brand/[0.05] rounded-full blur-3xl pointer-events-none"
                        aria-hidden="true"
                    />

                    <div className="relative w-full max-w-6xl mx-auto grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-start">
                        {/* Left: Copy */}
                        <motion.div
                            className="space-y-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                                Recruiter First Impression
                            </div>
                            <h1 className="text-hero text-5xl md:text-6xl lg:text-7xl text-primary">
                                See what recruiters see.
                            </h1>
                            <p className="text-xl text-muted-foreground max-w-md">
                                7.4 seconds. That&apos;s your window. We show what they notice first, then how to fix it.
                            </p>
                            <div className="text-sm text-muted-foreground">
                                <Link
                                    href="/research/how-recruiters-read"
                                    className="inline-flex items-center gap-1.5 underline underline-offset-4 decoration-border hover:decoration-brand hover:text-brand transition-colors"
                                >
                                    See the research behind the 7.4-second scan
                                </Link>
                            </div>

                            {/* Trust Badges - Elevated */}
                            <div className="flex flex-wrap items-center gap-2 pt-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 border border-border/40 text-[11px] font-medium text-muted-foreground">
                                    <Lock className="w-3 h-3 text-brand" />
                                    Encrypted
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 border border-border/40 text-[11px] font-medium text-muted-foreground">
                                    <Trash2 className="w-3 h-3" />
                                    Auto-deleted in 24h
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 border border-border/40 text-[11px] font-medium text-muted-foreground">
                                    <Shield className="w-3 h-3" />
                                    Never trains AI
                                </span>
                            </div>
                        </motion.div>

                        {/* Right: Preview + Upload */}
                        <motion.div
                            className="space-y-5"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.15 }}
                        >
                            <SampleReportPreview />
                            <ResumeDropzone onFileSelect={handleFileSelect} isProcessing={isProcessing} />

                            {/* LinkedIn Button - Premium Pill */}
                            <Link
                                href="/workspace?mode=linkedin"
                                className="group inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#0077B5]/10 border border-[#0077B5]/20 text-sm font-medium text-[#0077B5] hover:bg-[#0077B5]/20 hover:border-[#0077B5]/40 transition-all"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                                Review LinkedIn Profile
                                <span className="text-[#0077B5]/60 group-hover:translate-x-0.5 transition-transform">→</span>
                            </Link>
                        </motion.div>
                    </div>
                </section>

                {/* Proof Section */}
                <BackedByResearch />

                {/* Social Proof Section */}
                <Testimonials />

                {/* Pricing Section */}
                <Pricing />
            </main>

            <Footer />
        </div>
    );
}
