"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Lock, Shield, Trash2, ArrowRight, Check, Zap, Target, BarChart2 } from "lucide-react";
import { PocketMark } from "@/components/icons";

/**
 * Landing Page: Porsche Precision
 * Inspiration: Porsche.com
 * - Monochrome hero with single accent
 * - Giant cinematic stat
 * - Clean grid layouts, sharp corners
 * - Performance-focused copy
 */

function CountUp({ end, suffix = "", decimals = 0 }: { end: number; suffix?: string; decimals?: number }) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (!isInView) return;
        let start = 0;
        const duration = 2;
        const increment = end / (duration * 60);
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

export function LandingPorschePrecision() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-red-500/30">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/95 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <PocketMark className="w-6 h-6 text-red-500" />
                        <span className="font-bold text-lg tracking-tight">RIYP</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <a href="#performance" className="text-sm text-white/60 hover:text-white transition-colors uppercase tracking-wider">Performance</a>
                        <a href="#specs" className="text-sm text-white/60 hover:text-white transition-colors uppercase tracking-wider">Specs</a>
                        <button className="text-sm font-bold px-5 py-2.5 bg-red-600 text-white hover:bg-red-500 transition-colors uppercase tracking-wider">
                            Configure
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero - Cinematic Stat */}
            <section className="relative min-h-[80vh] flex items-center justify-center px-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-red-950/20 via-transparent to-black" />

                <motion.div
                    className="text-center relative z-10"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                >
                    <p className="text-red-500 text-sm uppercase tracking-[0.4em] mb-8">Resume Performance Index</p>

                    {/* Giant stat */}
                    <div className="text-[12rem] md:text-[18rem] font-black leading-none tracking-tighter">
                        <CountUp end={7.4} decimals={1} />
                        <span className="text-red-500">s</span>
                    </div>

                    <p className="text-2xl text-white/60 mt-8 max-w-xl mx-auto">
                        The average time a recruiter spends on your resume before making a decision.
                    </p>

                    <motion.div
                        className="mt-12"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                    >
                        <button className="group inline-flex items-center gap-3 px-8 py-4 bg-red-600 text-white font-bold uppercase tracking-wider hover:bg-red-500 transition-all">
                            Analyze Performance
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>
                </motion.div>
            </section>

            {/* Performance Stats Grid */}
            <section id="specs" className="px-6 py-24 border-t border-white/10">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-px bg-white/10">
                        {[
                            { value: 75, suffix: "%", label: "Rejected in first scan" },
                            { value: 250, suffix: "+", label: "Applications per role" },
                            { value: 3, suffix: "x", label: "Increase with fixes" },
                            { value: 94, suffix: "%", label: "Find Critical Miss" },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                className="bg-black p-8 text-center"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="text-5xl font-black text-white mb-2">
                                    <CountUp end={stat.value} suffix={stat.suffix} />
                                </div>
                                <div className="text-xs text-white/70 uppercase tracking-wider">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Performance Features */}
            <section id="performance" className="px-6 py-24">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-white text-4xl md:text-5xl font-black uppercase tracking-tight mb-4">
                            Engineered for <span className="text-red-500">impact</span>
                        </h2>
                        <p className="text-white/70 max-w-xl mx-auto">
                            Every analysis is precision-crafted using research from 14 peer-reviewed studies.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Zap,
                                title: "7-Second Verdict",
                                description: "The raw, unfiltered first impression. What they think, what they'd do next.",
                            },
                            {
                                icon: Target,
                                title: "Critical Miss",
                                description: "The single most damaging gap. The one thing holding you back.",
                            },
                            {
                                icon: BarChart2,
                                title: "Signal Analysis",
                                description: "Quantified breakdown of how your story, impact, and clarity score.",
                            },
                        ].map((feature, i) => (
                            <motion.div
                                key={feature.title}
                                className="p-8 border border-white/10 hover:border-red-500/50 transition-colors"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <feature.icon className="w-8 h-8 text-red-500 mb-6" />
                                <h3 className="text-white text-xl font-bold uppercase tracking-tight mb-3">{feature.title}</h3>
                                <p className="text-white/70">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="px-6 py-24 bg-red-950/20 border-t border-white/10">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-white text-4xl md:text-5xl font-black uppercase tracking-tight mb-6">
                        Ready to perform?
                    </h2>
                    <p className="text-white/70 mb-10 text-lg">
                        Get your performance analysis in 60 seconds.
                    </p>
                    <button className="group inline-flex items-center gap-3 px-10 py-5 bg-red-600 text-white font-bold text-lg uppercase tracking-wider hover:bg-red-500 transition-all">
                        Start Analysis
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <p className="text-sm text-white/70 mt-6">Free · No signup required</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="px-6 py-12 border-t border-white/10">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-8 text-xs text-white/60 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            Encrypted
                        </div>
                        <div className="flex items-center gap-2">
                            <Trash2 className="w-4 h-4" />
                            Auto-deleted
                        </div>
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Private
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/60">
                        <PocketMark className="w-4 h-4 text-red-500" />
                        © 2026 RIYP
                    </div>
                </div>
            </footer>
        </div>
    );
}
