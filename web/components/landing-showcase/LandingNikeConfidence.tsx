"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Check, Lock, Shield, Trash2 } from "lucide-react";
import { PocketMark } from "@/components/icons";

/**
 * Landing Page: Nike Confidence
 * Inspiration: Nike.com
 * - Black background, white product
 * - Massive bold sans-serif
 * - "Just Do It" single CTA energy
 * - Stats as competitive comparison
 */

function CountUp({ end, suffix = "" }: { end: number; suffix?: string }) {
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
                setCount(Math.floor(start));
            }
        }, 1000 / 60);
        return () => clearInterval(timer);
    }, [isInView, end]);

    return <span ref={ref}>{count}{suffix}</span>;
}

export function LandingNikeConfidence() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-orange-500/30">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-black">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <PocketMark className="w-8 h-8 text-white" />
                    <div className="flex items-center gap-6">
                        <a href="#how" className="text-sm text-white/60 hover:text-white transition-colors">How It Works</a>
                        <button className="text-sm font-bold px-6 py-3 bg-white text-black hover:bg-gray-100 transition-colors">
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero - Bold Statement */}
            <section className="min-h-screen flex items-center justify-center px-6 pt-16">
                <motion.div
                    className="text-center max-w-5xl"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="text-7xl md:text-[10rem] font-black uppercase leading-none tracking-tighter mb-8">
                        Know<br />Your<br />
                        <span className="text-orange-500">Worth</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-white/60 max-w-xl mx-auto mb-12">
                        See exactly what recruiters see. Fix what matters. Win.
                    </p>

                    <button className="group inline-flex items-center gap-3 px-10 py-5 bg-white text-black font-bold text-lg uppercase tracking-wider hover:bg-orange-500 hover:text-white transition-all">
                        Get Your Verdict
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                    </button>

                    <p className="text-white/60 mt-6 text-sm">Free. 60 seconds. No excuses.</p>
                </motion.div>
            </section>

            {/* Comparison Section */}
            <section className="px-6 py-24 bg-white text-black">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight">
                            You vs. The Average
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Without RIYP */}
                        <div className="p-10 border-2 border-black/10">
                            <div className="text-sm uppercase tracking-wider text-gray-400 mb-6">Without RIYP</div>
                            <div className="space-y-6">
                                {[
                                    { label: "Resume scan time", value: "7.4s", subtext: "and it's over" },
                                    { label: "Rejection rate", value: "75%", subtext: "in first pass" },
                                    { label: "Critical gaps", value: "???", subtext: "invisible to you" },
                                ].map((item) => (
                                    <div key={item.label} className="flex justify-between items-center py-4 border-b border-black/10">
                                        <div>
                                            <div className="font-medium">{item.label}</div>
                                            <div className="text-sm text-gray-400">{item.subtext}</div>
                                        </div>
                                        <div className="text-3xl font-black text-gray-400">{item.value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* With RIYP */}
                        <div className="p-10 bg-black text-white">
                            <div className="text-sm uppercase tracking-wider text-orange-500 mb-6">With RIYP</div>
                            <div className="space-y-6">
                                {[
                                    { label: "Know exactly what they see", check: true },
                                    { label: "Fix the Critical Miss", check: true },
                                    { label: "3x more callbacks", check: true },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-center gap-4 py-4 border-b border-white/10">
                                        <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                                            <Check className="w-5 h-5" />
                                        </div>
                                        <div className="font-bold text-lg">{item.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section id="how" className="px-6 py-24">
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        {[
                            { value: 14, label: "Research Studies" },
                            { value: 250, suffix: "+", label: "Apps per Role" },
                            { value: 94, suffix: "%", label: "Find Their Miss" },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                className="p-8"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="text-6xl font-black mb-2">
                                    <CountUp end={stat.value} suffix={stat.suffix || ""} />
                                </div>
                                <div className="text-white/70 uppercase tracking-wider text-sm">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="px-6 py-24 border-t border-white/10">
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            { title: "The Verdict", desc: "What a recruiter thinks in 7 seconds. Raw. Honest. Useful." },
                            { title: "Critical Miss", desc: "The one thing killing your chances. Now you'll know." },
                            { title: "Red Pen Fixes", desc: "Exact rewrites. Copy. Paste. Done." },
                        ].map((item, i) => (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <h3 className="text-2xl font-black uppercase mb-4">{item.title}</h3>
                                <p className="text-white/70">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="px-6 py-32 bg-orange-500 text-black">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-5xl md:text-7xl font-black uppercase mb-8">
                        Just Do It.
                    </h2>
                    <button className="group inline-flex items-center gap-3 px-10 py-5 bg-black text-white font-bold text-lg uppercase tracking-wider hover:bg-white hover:text-black transition-all">
                        Get Your Verdict Now
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="px-6 py-12 bg-black border-t border-white/10">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-8 text-xs text-white/60 uppercase tracking-wider">
                        <div className="flex items-center gap-2"><Lock className="w-4 h-4" /> Encrypted</div>
                        <div className="flex items-center gap-2"><Trash2 className="w-4 h-4" /> Auto-deleted</div>
                        <div className="flex items-center gap-2"><Shield className="w-4 h-4" /> Private</div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/60">
                        <PocketMark className="w-4 h-4" />
                        © 2026 RIYP
                    </div>
                </div>
            </footer>
        </div>
    );
}
