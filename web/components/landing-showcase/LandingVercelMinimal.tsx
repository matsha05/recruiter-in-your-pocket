"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Triangle } from "lucide-react";
import { PocketMark } from "@/components/icons";

/**
 * Landing Page: Vercel Minimal
 * Inspiration: Vercel.com
 * - Bold whitespace, near-monochrome
 * - Animated mesh/gradient subtle
 * - Sharp, modern, developer-focused
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

export function LandingVercelMinimal() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-white/20">
            {/* Subtle gradient mesh */}
            <div className="fixed inset-0 z-0 opacity-50">
                <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-gradient-to-r from-violet-600/20 to-transparent rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-gradient-to-l from-blue-600/20 to-transparent rounded-full blur-[100px]" />
            </div>

            {/* Navigation */}
            <nav className="relative z-50 border-b border-white/10">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Triangle className="w-5 h-5 fill-white" />
                        <span className="font-semibold">RIYP</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <a href="#features" className="text-sm text-white/60 hover:text-white transition-colors">Features</a>
                        <button className="text-sm px-4 py-2 rounded-md border border-white/20 text-white hover:bg-white hover:text-black transition-all">
                            Deploy
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="relative z-10 px-6 py-32">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-white text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-8">
                            Analyze.<br />
                            Fix.<br />
                            <span className="bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">Ship.</span>
                        </h1>

                        <p className="text-xl text-white/70 max-w-xl mx-auto mb-12">
                            See what recruiters see in 7.4 seconds. Get actionable fixes.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-medium rounded-md hover:bg-gray-100 transition-colors">
                                Start analyzing
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button className="px-8 py-4 text-white/60 hover:text-white transition-colors">
                                Learn more →
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Stats */}
            <section className="relative z-10 px-6 py-16 border-y border-white/10">
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { value: 7.4, suffix: "s", decimals: 1, label: "Average scan" },
                            { value: 14, label: "Studies" },
                            { value: 75, suffix: "%", label: "Rejected fast" },
                            { value: 3, suffix: "x", label: "More callbacks" },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                className="text-center"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="text-4xl font-bold mb-1">
                                    <CountUp end={stat.value} suffix={stat.suffix || ""} decimals={stat.decimals || 0} />
                                </div>
                                <div className="text-sm text-white/60">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="relative z-10 px-6 py-24">
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-px bg-white/10 rounded-lg overflow-hidden">
                        {[
                            { title: "Verdict", desc: "7-second first impression. Raw and honest." },
                            { title: "Critical Miss", desc: "The one thing killing your chances." },
                            { title: "Red Pen", desc: "Exact rewrites. Copy and paste." },
                        ].map((feature, i) => (
                            <motion.div
                                key={feature.title}
                                className="p-8 bg-black"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <h3 className="text-white text-lg font-semibold mb-2">{feature.title}</h3>
                                <p className="text-white/70 text-sm">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Code-like sample */}
            <section className="relative z-10 px-6 py-16">
                <div className="max-w-3xl mx-auto">
                    <div className="rounded-lg bg-white/5 border border-white/10 p-6 font-mono text-sm">
                        <div className="text-white/60 mb-4">// Your verdict</div>
                        <div className="text-white mb-2">
                            <span className="text-pink-400">verdict</span>: <span className="text-green-400">"Strong technical foundation, but..."</span>
                        </div>
                        <div className="text-white mb-2">
                            <span className="text-pink-400">critical_miss</span>: <span className="text-yellow-400">"No quantified impact"</span>
                        </div>
                        <div className="text-white">
                            <span className="text-pink-400">score</span>: <span className="text-blue-400">67</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="relative z-10 px-6 py-32">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-white text-4xl font-bold mb-8">Deploy your career</h2>
                    <button className="group inline-flex items-center gap-2 px-10 py-5 bg-white text-black font-medium rounded-md hover:bg-gray-100 transition-colors">
                        Get your verdict
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <p className="text-white/70 mt-6 text-sm">Free · 60 seconds · Private</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 px-6 py-8 border-t border-white/10">
                <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-white/70">
                    <div className="flex items-center gap-2">
                        <Triangle className="w-4 h-4 fill-white" />
                        <span>© 2026 RIYP</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span>Encrypted</span>
                        <span>Private</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
