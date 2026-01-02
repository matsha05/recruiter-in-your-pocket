"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { PocketMark } from "@/components/icons";

/**
 * Landing Page: Stripe Gradient
 * Inspiration: Stripe.com
 * - Animated purple/teal gradients
 * - Clean developer-friendly aesthetic
 * - Minimal but impactful
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

export function LandingStripeGradient() {
    return (
        <div className="min-h-screen bg-[#0a0b0d] text-white selection:bg-purple-500/30 overflow-hidden">
            {/* Animated gradient background */}
            <div className="fixed inset-0 z-0">
                <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-purple-600/30 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
                <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: "2s" }} />
            </div>

            {/* Navigation */}
            <nav className="relative z-50 border-b border-white/5 bg-[#0a0b0d]/80 backdrop-blur-xl">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <PocketMark className="w-6 h-6 text-purple-400" />
                        <span className="font-semibold">RIYP</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <a href="#how" className="text-sm text-white/60 hover:text-white transition-colors">How it works</a>
                        <button className="text-sm font-medium px-4 py-2 rounded-full bg-white text-black hover:bg-gray-100 transition-colors">
                            Get started →
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="relative z-10 px-6 py-32">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-white text-5xl md:text-7xl font-bold leading-tight mb-8">
                            Resume analysis<br />
                            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                                for ambitious people
                            </span>
                        </h1>

                        <p className="text-xl text-white/60 max-w-2xl mx-auto mb-12">
                            See exactly what recruiters see in the first 7.4 seconds. Get actionable insights backed by peer-reviewed research.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black font-medium hover:bg-gray-100 transition-colors">
                                Get your verdict
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <span className="text-sm text-white/60">Free · No signup required</span>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Stats */}
            <section className="relative z-10 px-6 py-24">
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8 text-center">
                        {[
                            { value: 7.4, suffix: "s", decimals: 1, label: "Avg. scan time" },
                            { value: 14, label: "Research studies" },
                            { value: 75, suffix: "%", label: "Rejected quickly" },
                            { value: 3, suffix: "x", label: "More callbacks" },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                                    <CountUp end={stat.value} suffix={stat.suffix || ""} decimals={stat.decimals || 0} />
                                </div>
                                <div className="text-sm text-white/60">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="how" className="relative z-10 px-6 py-24">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-white text-3xl md:text-4xl font-bold mb-4">What you get</h2>
                        <p className="text-white/70">Three insights that matter</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                title: "7-Second Verdict",
                                description: "The unfiltered first impression. What a recruiter thinks, feels, and decides.",
                            },
                            {
                                title: "Critical Miss",
                                description: "The single most impactful gap. Often invisible to you, always visible to them.",
                            },
                            {
                                title: "Red Pen Rewrites",
                                description: "Exact replacements for every weak line. Copy, paste, done.",
                            },
                        ].map((feature, i) => (
                            <motion.div
                                key={feature.title}
                                className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <h3 className="text-white text-xl font-semibold mb-3">{feature.title}</h3>
                                <p className="text-white/70">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="relative z-10 px-6 py-32">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-white text-4xl md:text-5xl font-bold mb-8">
                        Ready to see the truth?
                    </h2>
                    <button className="group inline-flex items-center gap-2 px-10 py-5 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-medium text-lg hover:opacity-90 transition-opacity">
                        Get your verdict now
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <p className="text-white/70 mt-6">Free · 60 seconds · Private</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 px-6 py-8 border-t border-white/5">
                <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-white/70">
                    <div className="flex items-center gap-2">
                        <PocketMark className="w-4 h-4 text-purple-400" />
                        <span>© 2026 RIYP</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <span>Encrypted</span>
                        <span>Auto-deleted</span>
                        <span>Never trains AI</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
