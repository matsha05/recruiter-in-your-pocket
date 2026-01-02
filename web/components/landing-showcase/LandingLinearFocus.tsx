"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Check, Zap, Target, FileText } from "lucide-react";
import { PocketMark } from "@/components/icons";

/**
 * Landing Page: Linear Focus
 * Inspiration: Linear.app
 * - Dark mode, translucent panels
 * - Clean, focused, no clutter
 * - Subtle animations
 */

function CountUp({ end, suffix = "", decimals = 0 }: { end: number; suffix?: string; decimals?: number }) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (!isInView) return;
        let start = 0;
        const increment = end / 120;
        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(decimals > 0 ? parseFloat(start.toFixed(decimals)) : Math.floor(start));
            }
        }, 1000 / 60);
        return () => clearInterval(timer);
    }, [isInView, end, decimals]);

    return <span ref={ref}>{decimals > 0 ? count.toFixed(decimals) : count}{suffix}</span>;
}

export function LandingLinearFocus() {
    return (
        <div className="min-h-screen bg-[#09090b] text-white selection:bg-indigo-500/30">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-xl">
                <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2">
                            <PocketMark className="w-5 h-5 text-indigo-400" />
                            <span className="font-medium">RIYP</span>
                        </div>
                        <div className="hidden md:flex items-center gap-6 text-sm text-white/70">
                            <a href="#features" className="hover:text-white transition-colors">Features</a>
                            <a href="#method" className="hover:text-white transition-colors">Method</a>
                        </div>
                    </div>
                    <button className="text-sm font-medium px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors">
                        Get started
                    </button>
                </div>
            </nav>

            {/* Hero */}
            <section className="px-6 py-24">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm mb-8">
                            <Zap className="w-4 h-4" />
                            Built for focus
                        </div>

                        <h1 className="text-white text-4xl md:text-6xl font-semibold leading-tight mb-6 tracking-tight">
                            Resume analysis that<br />
                            <span className="text-indigo-400">actually helps</span>
                        </h1>

                        <p className="text-lg text-white/70 max-w-xl mx-auto mb-10">
                            See what recruiters see in 7.4 seconds. Get the verdict, find the critical miss, fix it.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button className="group inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-colors">
                                Analyze your resume
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <span className="text-sm text-white/70">Free · 60 seconds</span>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[
                                { value: 7.4, suffix: "s", decimals: 1, label: "Scan time" },
                                { value: 14, label: "Studies" },
                                { value: 75, suffix: "%", label: "Quick reject" },
                                { value: 3, suffix: "x", label: "More callbacks" },
                            ].map((stat, i) => (
                                <div key={stat.label} className="text-center">
                                    <div className="text-2xl font-semibold text-indigo-400 mb-1">
                                        <CountUp end={stat.value} suffix={stat.suffix || ""} decimals={stat.decimals || 0} />
                                    </div>
                                    <div className="text-xs text-white/70">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="px-6 py-24">
                <div className="max-w-4xl mx-auto">
                    <div className="space-y-4">
                        {[
                            {
                                icon: Zap,
                                title: "7-Second Verdict",
                                description: "The unfiltered first impression. What they think, feel, decide. No filter.",
                            },
                            {
                                icon: Target,
                                title: "Critical Miss",
                                description: "The single most damaging gap in your resume. Find it, fix it.",
                            },
                            {
                                icon: FileText,
                                title: "Red Pen Rewrites",
                                description: "Exact replacement text for every weak passage. Copy and paste.",
                            },
                        ].map((feature, i) => (
                            <motion.div
                                key={feature.title}
                                className="flex items-start gap-4 p-6 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors"
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                                    <feature.icon className="w-5 h-5 text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="text-white font-medium mb-1">{feature.title}</h3>
                                    <p className="text-sm text-white/70">{feature.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Method */}
            <section id="method" className="px-6 py-24 bg-white/[0.01]">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-white text-2xl font-semibold mb-4">Built on research</h2>
                    <p className="text-white/70 mb-8">
                        Our methodology is grounded in 14 peer-reviewed studies on recruiter behavior,
                        eye-tracking research, and hiring outcomes.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-white/70">
                        <span className="px-3 py-1 rounded-full bg-white/5">TheLadders Study</span>
                        <span className="px-3 py-1 rounded-full bg-white/5">NBER Research</span>
                        <span className="px-3 py-1 rounded-full bg-white/5">Stanford HCI</span>
                        <span className="px-3 py-1 rounded-full bg-white/5">+11 more</span>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="px-6 py-24">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-white text-3xl font-semibold mb-6">Ready to see the truth?</h2>
                    <button className="group inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-colors">
                        Get your verdict
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <p className="text-sm text-white/70 mt-4">Free · No signup · Private</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="px-6 py-6 border-t border-white/5">
                <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-white/70">
                    <div className="flex items-center gap-2">
                        <PocketMark className="w-4 h-4 text-indigo-400" />
                        <span>© 2026 RIYP</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span>Encrypted</span>
                        <span>Auto-deleted</span>
                        <span>Private</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
