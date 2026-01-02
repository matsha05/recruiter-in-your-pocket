"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Play, Users, Sparkles } from "lucide-react";
import { PocketMark } from "@/components/icons";

/**
 * Landing Page: Figma Collaborative
 * Inspiration: Figma.com
 * - Colorful, product-as-hero
 * - Collaborative/social feel
 * - Modern, playful
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

export function LandingFigmaCollaborative() {
    return (
        <div className="min-h-screen bg-[#1e1e1e] text-white selection:bg-green-500/30">
            {/* Colorful decorative elements */}
            <div className="fixed inset-0 z-0 overflow-hidden">
                <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-[#f24e1e] opacity-60 blur-3xl" />
                <div className="absolute top-40 right-32 w-24 h-24 rounded-full bg-[#a259ff] opacity-60 blur-3xl" />
                <div className="absolute bottom-32 left-1/3 w-40 h-40 rounded-full bg-[#0acf83] opacity-40 blur-3xl" />
                <div className="absolute bottom-20 right-20 w-28 h-28 rounded-full bg-[#1abcfe] opacity-50 blur-3xl" />
            </div>

            {/* Navigation */}
            <nav className="relative z-50 border-b border-white/5">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <PocketMark className="w-7 h-7 text-white" />
                        <span className="font-semibold text-lg">RIYP</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <a href="#features" className="text-sm text-white/60 hover:text-white transition-colors">Features</a>
                        <button className="text-sm font-medium px-5 py-2.5 rounded-full bg-[#0acf83] text-black hover:bg-[#0acf83]/90 transition-colors">
                            Get started free
                        </button>
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
                        <div className="flex items-center justify-center gap-2 mb-8">
                            <div className="flex -space-x-2">
                                {["#f24e1e", "#a259ff", "#0acf83", "#1abcfe"].map((color, i) => (
                                    <div
                                        key={color}
                                        className="w-8 h-8 rounded-full border-2 border-[#1e1e1e] flex items-center justify-center text-xs font-medium"
                                        style={{ backgroundColor: color }}
                                    >
                                        {String.fromCharCode(65 + i)}
                                    </div>
                                ))}
                            </div>
                            <span className="text-sm text-white/60 ml-2">Built by people who hire</span>
                        </div>

                        <h1 className="text-white text-5xl md:text-7xl font-bold leading-tight mb-8">
                            See your resume<br />
                            <span className="bg-gradient-to-r from-[#f24e1e] via-[#a259ff] to-[#0acf83] bg-clip-text text-transparent">
                                through their eyes
                            </span>
                        </h1>

                        <p className="text-xl text-white/60 max-w-2xl mx-auto mb-12">
                            Recruiters spend 7.4 seconds on your resume. Find out exactly what they think—and how to fix it.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#0acf83] text-black font-medium hover:bg-[#0acf83]/90 transition-colors">
                                <Play className="w-5 h-5" />
                                Get your verdict
                            </button>
                            <span className="text-sm text-white/60">Free · No signup</span>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Product Preview */}
            <section className="relative z-10 px-6 py-12">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        className="rounded-2xl bg-[#2c2c2c] border border-white/10 overflow-hidden"
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        {/* Product header */}
                        <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-[#f24e1e]" />
                                <div className="w-3 h-3 rounded-full bg-[#ffbe0b]" />
                                <div className="w-3 h-3 rounded-full bg-[#0acf83]" />
                            </div>
                            <span className="text-sm text-white/60">Resume Analysis — Draft</span>
                        </div>

                        {/* Product content */}
                        <div className="p-8 grid md:grid-cols-3 gap-6">
                            <div className="p-5 rounded-xl bg-[#f24e1e]/10 border border-[#f24e1e]/20">
                                <div className="text-sm text-[#f24e1e] mb-2 font-medium">Verdict</div>
                                <div className="text-white font-medium">"Strong skills, but…"</div>
                            </div>
                            <div className="p-5 rounded-xl bg-[#a259ff]/10 border border-[#a259ff]/20">
                                <div className="text-sm text-[#a259ff] mb-2 font-medium">Critical Miss</div>
                                <div className="text-white font-medium">"No impact metrics"</div>
                            </div>
                            <div className="p-5 rounded-xl bg-[#0acf83]/10 border border-[#0acf83]/20">
                                <div className="text-sm text-[#0acf83] mb-2 font-medium">Score</div>
                                <div className="text-4xl font-bold text-white">67</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Stats */}
            <section className="relative z-10 px-6 py-24">
                <div className="max-w-4xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8 text-center">
                        {[
                            { value: 7, suffix: "s", label: "Scan time", color: "#f24e1e" },
                            { value: 14, label: "Studies", color: "#a259ff" },
                            { value: 75, suffix: "%", label: "Quick reject", color: "#1abcfe" },
                            { value: 3, suffix: "x", label: "Callbacks", color: "#0acf83" },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="text-4xl font-bold mb-2" style={{ color: stat.color }}>
                                    <CountUp end={stat.value} suffix={stat.suffix || ""} />
                                </div>
                                <div className="text-sm text-white/60">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="relative z-10 px-6 py-16">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-white text-3xl font-bold mb-4">What you get</h2>
                        <p className="text-white/70">Three insights that matter</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { color: "#f24e1e", title: "7-Second Verdict", desc: "Raw first impression" },
                            { color: "#a259ff", title: "Critical Miss", desc: "Your biggest gap" },
                            { color: "#0acf83", title: "Red Pen Rewrites", desc: "Copy-paste fixes" },
                        ].map((feature, i) => (
                            <motion.div
                                key={feature.title}
                                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="w-3 h-3 rounded-full mb-4" style={{ backgroundColor: feature.color }} />
                                <h3 className="text-white text-lg font-semibold mb-2">{feature.title}</h3>
                                <p className="text-white/70 text-sm">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="relative z-10 px-6 py-32">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-white text-4xl font-bold mb-8">Ready to see the truth?</h2>
                    <button className="group inline-flex items-center gap-2 px-10 py-5 rounded-full bg-[#0acf83] text-black font-medium text-lg hover:bg-[#0acf83]/90 transition-colors">
                        Get your verdict
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <p className="text-white/70 mt-6">Free · 60 seconds · Private</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 px-6 py-8 border-t border-white/5">
                <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-white/70">
                    <div className="flex items-center gap-2">
                        <PocketMark className="w-5 h-5" />
                        <span>© 2026 RIYP</span>
                    </div>
                    <span>Encrypted · Private · Never trains AI</span>
                </div>
            </footer>
        </div>
    );
}
