"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Terminal, Command, ChevronRight } from "lucide-react";
import { PocketMark } from "@/components/icons";

/**
 * Landing Page: Raycast Dark
 * Inspiration: Raycast.com
 * - Terminal aesthetic, keyboard-first
 * - Dark mode, monospace
 * - Developer productivity focused
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

export function LandingRaycastDark() {
    return (
        <div className="min-h-screen bg-[#0c0c0c] text-white selection:bg-orange-500/30 font-mono">
            {/* Subtle glow */}
            <div className="fixed inset-0 z-0 overflow-hidden">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-orange-500/5 rounded-full blur-[100px]" />
            </div>

            {/* Navigation */}
            <nav className="relative z-50 border-b border-white/5">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
                            <Terminal className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-medium">riyp</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/60">
                        <Command className="w-3 h-3" />
                        <span>K</span>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="relative z-10 px-6 py-24">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs mb-8">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                            resume-analyzer v1.0
                        </div>

                        <h1 className="text-white text-4xl md:text-6xl font-bold leading-tight mb-6 tracking-tight">
                            <span className="text-white/60">$</span> analyze<br />
                            <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                                --reveal-truth
                            </span>
                        </h1>

                        <p className="text-lg text-white/70 max-w-xl mx-auto mb-10 font-sans">
                            See what recruiters see in 7.4 seconds. Get actionable output.
                        </p>

                        <div className="flex items-center justify-center gap-4">
                            <button className="group inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 text-white font-sans font-medium hover:opacity-90 transition-opacity">
                                Run analysis
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <span className="text-sm text-white/70 font-sans">Free · 60s</span>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Terminal Output Preview */}
            <section className="relative z-10 px-6 py-12">
                <div className="max-w-2xl mx-auto">
                    <motion.div
                        className="rounded-xl bg-black border border-white/10 overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        {/* Terminal header */}
                        <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/10">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                            </div>
                            <span className="text-xs text-white/60 ml-2">riyp — analysis output</span>
                        </div>

                        {/* Terminal content */}
                        <div className="p-6 text-sm space-y-4">
                            <div>
                                <span className="text-white/60">❯</span> <span className="text-orange-400">riyp analyze</span> resume.pdf
                            </div>
                            <div className="text-white/60">
                                <span className="text-green-400">✓</span> Processing...
                            </div>
                            <div className="pl-4 border-l-2 border-orange-500/30 space-y-2">
                                <div>
                                    <span className="text-orange-400">verdict:</span> <span className="text-white">"Strong tech skills, but..."</span>
                                </div>
                                <div>
                                    <span className="text-yellow-400">critical_miss:</span> <span className="text-white">"No quantified impact"</span>
                                </div>
                                <div>
                                    <span className="text-pink-400">score:</span> <span className="text-white">67/100</span>
                                </div>
                            </div>
                            <div className="text-white/60">
                                Analysis complete in <span className="text-green-400">2.3s</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Stats */}
            <section className="relative z-10 px-6 py-24">
                <div className="max-w-4xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8 text-center font-sans">
                        {[
                            { value: 7.4, suffix: "s", decimals: 1, label: "scan_time" },
                            { value: 14, label: "studies" },
                            { value: 75, suffix: "%", label: "quick_reject" },
                            { value: 3, suffix: "x", label: "callbacks" },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent mb-2">
                                    <CountUp end={stat.value} suffix={stat.suffix || ""} decimals={stat.decimals || 0} />
                                </div>
                                <div className="text-xs text-white/70 font-mono">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Commands */}
            <section className="relative z-10 px-6 py-16">
                <div className="max-w-3xl mx-auto">
                    <div className="space-y-3">
                        {[
                            { cmd: "riyp verdict", desc: "Get 7-second first impression" },
                            { cmd: "riyp miss", desc: "Find your critical gap" },
                            { cmd: "riyp rewrite", desc: "Get exact replacement text" },
                        ].map((item, i) => (
                            <motion.div
                                key={item.cmd}
                                className="flex items-center gap-4 p-4 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors"
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <code className="text-orange-400">{item.cmd}</code>
                                <span className="text-white/60 font-sans text-sm">{item.desc}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="relative z-10 px-6 py-32">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-white text-3xl font-bold mb-8 font-sans">Ready to ship your career?</h2>
                    <button className="group inline-flex items-center gap-2 px-10 py-5 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 text-white font-sans font-medium text-lg hover:opacity-90 transition-opacity">
                        riyp analyze
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <p className="text-white/70 mt-6 text-sm font-sans">⌘K to quick start</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 px-6 py-8 border-t border-white/5">
                <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-white/70">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-gradient-to-br from-orange-500 to-pink-500" />
                        <span>© 2026 riyp</span>
                    </div>
                    <span>encrypted · private · auto-deleted</span>
                </div>
            </footer>
        </div>
    );
}
