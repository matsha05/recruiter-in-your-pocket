"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, AlertCircle, CheckCircle2, XCircle, Zap } from "lucide-react";
import { PocketMark } from "@/components/icons";

/**
 * Landing Page: The Scan
 * - Animated F-pattern eye scan visualization
 * - Real-time problem detection overlay
 * - Smooth Spring-based cursor tracking
 * - Premium dark theme with accent pops
 */

// Mouse-following spotlight effect
function Spotlight() {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
    const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

    return (
        <motion.div
            className="pointer-events-none fixed inset-0 z-30 opacity-50"
            style={{
                background: useTransform(
                    [springX, springY],
                    ([x, y]) => `radial-gradient(600px circle at ${x}px ${y}px, rgba(16, 185, 129, 0.06), transparent 40%)`
                ),
            }}
        />
    );
}

// Animated resume with scanning overlay
function ResumeScanner() {
    const [scanComplete, setScanComplete] = useState(false);
    const [currentIssue, setCurrentIssue] = useState(-1);
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const issues = [
        { y: 15, label: "Weak opening", severity: "critical" },
        { y: 35, label: "No metrics", severity: "warning" },
        { y: 55, label: "Generic phrases", severity: "warning" },
        { y: 75, label: "Missing keywords", severity: "critical" },
    ];

    useEffect(() => {
        if (!isInView) return;

        const timers = [
            setTimeout(() => setCurrentIssue(0), 1000),
            setTimeout(() => setCurrentIssue(1), 2000),
            setTimeout(() => setCurrentIssue(2), 3000),
            setTimeout(() => setCurrentIssue(3), 4000),
            setTimeout(() => setScanComplete(true), 5000),
        ];

        return () => timers.forEach(clearTimeout);
    }, [isInView]);

    return (
        <div ref={ref} className="relative max-w-lg mx-auto">
            {/* Resume container */}
            <motion.div
                className="relative bg-white rounded-2xl shadow-2xl overflow-hidden"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
                {/* Resume content skeleton */}
                <div className="p-8 space-y-6">
                    {/* Name */}
                    <div className="space-y-2">
                        <div className="h-8 bg-gray-800 rounded-lg w-48" />
                        <div className="h-4 bg-gray-300 rounded w-32" />
                    </div>

                    {/* Experience section */}
                    <div className="space-y-3">
                        <div className="h-5 bg-gray-700 rounded w-28" />
                        <div className="space-y-2 pl-4 border-l-2 border-gray-200">
                            <div className="h-3 bg-gray-200 rounded w-full" />
                            <div className="h-3 bg-gray-200 rounded w-[90%]" />
                            <div className="h-3 bg-gray-200 rounded w-[85%]" />
                        </div>
                    </div>

                    {/* Another section */}
                    <div className="space-y-3">
                        <div className="h-5 bg-gray-700 rounded w-24" />
                        <div className="space-y-2 pl-4 border-l-2 border-gray-200">
                            <div className="h-3 bg-gray-200 rounded w-full" />
                            <div className="h-3 bg-gray-200 rounded w-[95%]" />
                            <div className="h-3 bg-gray-200 rounded w-[80%]" />
                        </div>
                    </div>

                    {/* Skills */}
                    <div className="space-y-3">
                        <div className="h-5 bg-gray-700 rounded w-20" />
                        <div className="flex flex-wrap gap-2">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-6 bg-gray-100 rounded-full w-16" />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Scanning line */}
                {!scanComplete && isInView && (
                    <motion.div
                        className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent"
                        initial={{ top: "0%" }}
                        animate={{ top: "100%" }}
                        transition={{ duration: 4, ease: "linear" }}
                    />
                )}

                {/* Issue markers */}
                {issues.map((issue, i) => (
                    <motion.div
                        key={issue.label}
                        className="absolute left-0 right-0 flex items-center justify-end pr-4"
                        style={{ top: `${issue.y}%` }}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{
                            opacity: currentIssue >= i ? 1 : 0,
                            x: currentIssue >= i ? 0 : 20,
                        }}
                        transition={{ duration: 0.3 }}
                    >
                        <div
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${issue.severity === "critical"
                                    ? "bg-red-500 text-white"
                                    : "bg-amber-500 text-black"
                                }`}
                        >
                            {issue.severity === "critical" ? (
                                <XCircle className="w-3.5 h-3.5" />
                            ) : (
                                <AlertCircle className="w-3.5 h-3.5" />
                            )}
                            {issue.label}
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* F-pattern overlay hint */}
            <div className="absolute inset-0 pointer-events-none">
                <motion.div
                    className="absolute w-full h-[2px] bg-emerald-500/30"
                    style={{ top: "15%" }}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                />
                <motion.div
                    className="absolute w-[70%] h-[2px] bg-emerald-500/20"
                    style={{ top: "35%" }}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.7, duration: 0.8 }}
                />
                <motion.div
                    className="absolute w-[40%] h-[2px] bg-emerald-500/10"
                    style={{ top: "55%" }}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.9, duration: 0.8 }}
                />
            </div>

            {/* Scan complete verdict */}
            {scanComplete && (
                <motion.div
                    className="absolute -bottom-20 left-0 right-0 flex justify-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="px-6 py-3 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-medium shadow-lg shadow-red-500/25">
                        4 issues found · Verdict: Needs Work
                    </div>
                </motion.div>
            )}
        </div>
    );
}

// Floating feature pill
function FeaturePill({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
    return (
        <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.5 }}
        >
            {children}
        </motion.div>
    );
}

export function LandingTheScan() {
    return (
        <div className="min-h-screen bg-[#0c0c0c] text-white relative">
            <Spotlight />

            {/* Navigation */}
            <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0c0c0c]/80 backdrop-blur-xl">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <PocketMark className="w-7 h-7 text-emerald-400" />
                        <span className="font-semibold">RIYP</span>
                    </div>
                    <button className="px-5 py-2.5 bg-emerald-500 text-black font-medium rounded-full hover:bg-emerald-400 transition-colors">
                        Get Started
                    </button>
                </div>
            </nav>

            {/* Hero */}
            <section className="px-6 py-32">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="flex items-center justify-center gap-3 mb-8">
                            <FeaturePill>
                                <Zap className="w-4 h-4 text-emerald-400" />
                                Based on eye-tracking research
                            </FeaturePill>
                        </div>

                        <h1 className="text-5xl md:text-8xl font-bold tracking-tight leading-[0.9] mb-8">
                            See the scan.<br />
                            <span className="text-emerald-400">Fix the gaps.</span>
                        </h1>

                        <p className="text-xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed">
                            Recruiters follow predictable patterns. They look at specific areas for specific things.
                            Find out what they're seeing on yours.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button className="group flex items-center gap-2 px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-white/90 transition-colors">
                                Scan My Resume
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <span className="text-sm text-white/40">Free · 60 seconds</span>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Scanner Demo */}
            <section className="px-6 py-32 relative">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        className="text-center mb-20"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Watch the scan happen</h2>
                        <p className="text-white/50">Problems appear as they would to a recruiter</p>
                    </motion.div>

                    <ResumeScanner />
                </div>
            </section>

            {/* What we find */}
            <section className="px-6 py-32 bg-gradient-to-b from-transparent to-emerald-950/20">
                <div className="max-w-5xl mx-auto">
                    <motion.h2
                        className="text-3xl md:text-4xl font-bold text-center mb-16"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        What you'll discover
                    </motion.h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: AlertCircle,
                                title: "The 7-Second Verdict",
                                description: "The raw first impression a recruiter forms. No filters, no kindness.",
                                color: "text-emerald-400",
                            },
                            {
                                icon: XCircle,
                                title: "Critical Misses",
                                description: "Specific lines and sections that are actively hurting your chances.",
                                color: "text-red-400",
                            },
                            {
                                icon: CheckCircle2,
                                title: "Exact Fixes",
                                description: "Word-for-word replacement text. Just copy, paste, and improve.",
                                color: "text-emerald-400",
                            },
                        ].map((feature, i) => (
                            <motion.div
                                key={feature.title}
                                className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <feature.icon className={`w-8 h-8 ${feature.color} mb-4`} />
                                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                                <p className="text-white/50 leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="px-6 py-32">
                <div className="max-w-3xl mx-auto">
                    <motion.div
                        className="text-center p-16 rounded-3xl bg-gradient-to-b from-emerald-500/10 to-transparent border border-emerald-500/20"
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">
                            Stop guessing.
                        </h2>
                        <p className="text-white/50 text-lg mb-10">
                            Know exactly what recruiters see - and how to fix it.
                        </p>
                        <button className="group inline-flex items-center gap-2 px-10 py-5 bg-emerald-500 text-black font-semibold text-lg rounded-full hover:bg-emerald-400 transition-colors">
                            Get Your Verdict
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <div className="mt-6 text-sm text-white/40">Free · 60 seconds · No signup</div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="px-6 py-12 border-t border-white/5">
                <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-white/40">
                    <div className="flex items-center gap-2">
                        <PocketMark className="w-5 h-5 text-emerald-400" />
                        <span>© 2026 RIYP</span>
                    </div>
                    <div>Based on 14 peer-reviewed studies</div>
                </div>
            </footer>
        </div>
    );
}
