"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Lock, Shield, Trash2, Star, Quote } from "lucide-react";
import { PocketMark } from "@/components/icons";

/**
 * Landing Page: Cartier Immersion
 * Inspiration: Cartier Watches & Wonders (CSS Award Winner)
 * - Dark mode with gold/teal accents
 * - Floating 3D-style cards
 * - Smooth parallax scrolling
 * - Premium testimonial treatment
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

export function LandingCartierImmersion() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-amber-500/30 overflow-hidden">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent">
                <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <PocketMark className="w-6 h-6 text-amber-400" />
                        <span className="text-sm uppercase tracking-[0.3em] text-amber-200/80">RIYP</span>
                    </div>
                    <button className="text-sm px-6 py-2.5 border border-amber-400/30 text-amber-200 hover:bg-amber-400/10 transition-all">
                        Discover
                    </button>
                </div>
            </nav>

            {/* Hero - Immersive */}
            <section className="relative min-h-screen flex items-center justify-center px-6">
                {/* Background gradient orbs */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
                </div>

                <motion.div
                    className="text-center relative z-10"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                >
                    <p className="text-amber-400/80 text-xs uppercase tracking-[0.4em] mb-8">The Art of First Impressions</p>

                    <h1 className="text-white text-6xl md:text-8xl font-light tracking-tight leading-[1.1] mb-8">
                        <span className="text-white">Crafted for</span><br />
                        <span className="bg-gradient-to-r from-amber-400 to-teal-400 bg-clip-text text-transparent">excellence</span>
                    </h1>

                    <p className="text-xl text-white/70 max-w-xl mx-auto mb-12 font-light">
                        Every detail matters. Every second counts. See what recruiters see.
                    </p>

                    <button className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-medium hover:from-amber-400 hover:to-amber-500 transition-all">
                        Begin Your Analysis
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </motion.div>
            </section>

            {/* Floating Cards Section */}
            <section className="px-6 py-32">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-20">
                        <p className="text-amber-400/60 text-xs uppercase tracking-[0.3em] mb-4">The Collection</p>
                        <h2 className="text-4xl md:text-5xl font-light text-white">Three pillars of insight</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "The Verdict",
                                description: "The raw 7-second first impression. What they thought, felt, and would do next.",
                                accent: "from-amber-500/20 to-amber-600/5",
                            },
                            {
                                title: "The Critical Miss",
                                description: "The single most impactful gap holding you back. Often hidden in plain sight.",
                                accent: "from-teal-500/20 to-teal-600/5",
                            },
                            {
                                title: "The Transformation",
                                description: "Precise rewrites for every weak passage. Ready to copy, paste, and excel.",
                                accent: "from-amber-500/20 to-teal-500/5",
                            },
                        ].map((card, i) => (
                            <motion.div
                                key={card.title}
                                className={`relative p-8 rounded-2xl bg-gradient-to-b ${card.accent} border border-white/10 backdrop-blur-sm`}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15, duration: 0.8 }}
                                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                            >
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/5 to-transparent" />
                                <div className="relative z-10">
                                    <div className="text-xs uppercase tracking-[0.2em] text-amber-400/60 mb-6">0{i + 1}</div>
                                    <h3 className="text-white text-2xl font-light mb-4 text-white">{card.title}</h3>
                                    <p className="text-white/70 leading-relaxed">{card.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="px-6 py-24 border-t border-white/5">
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-12 text-center">
                        {[
                            { value: 7.4, suffix: "s", decimals: 1, label: "The Window" },
                            { value: 14, label: "Studies" },
                            { value: 75, suffix: "%", label: "Quick Rejections" },
                            { value: 3, suffix: "x", label: "Average Improvement" },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="text-5xl font-light bg-gradient-to-r from-amber-400 to-teal-400 bg-clip-text text-transparent mb-2">
                                    <CountUp end={stat.value} suffix={stat.suffix || ""} decimals={stat.decimals || 0} />
                                </div>
                                <div className="text-xs uppercase tracking-[0.2em] text-white/60">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonial */}
            <section className="px-6 py-24">
                <div className="max-w-3xl mx-auto">
                    <motion.div
                        className="p-12 rounded-3xl bg-gradient-to-b from-white/5 to-transparent border border-white/10 text-center"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <div className="flex justify-center gap-1 mb-6">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                            ))}
                        </div>
                        <Quote className="w-8 h-8 text-amber-400/30 mx-auto mb-6" />
                        <blockquote className="text-2xl font-light leading-relaxed mb-8 text-white/90">
                            "The precision and attention to detail is remarkable. This isn't generic advice—it's exactly what a hiring manager would say."
                        </blockquote>
                        <div className="text-amber-400">Marcus Williams</div>
                        <div className="text-sm text-white/60">VP Engineering · Series C Startup</div>
                    </motion.div>
                </div>
            </section>

            {/* CTA */}
            <section className="px-6 py-32">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-4xl md:text-6xl font-light mb-8 text-white">
                        Your moment awaits
                    </h2>
                    <button className="group inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-medium text-lg hover:from-amber-400 hover:to-amber-500 transition-all">
                        Get Your Verdict
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <p className="text-white/70 mt-6">Free · 60 seconds · No signup required</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="px-6 py-12 border-t border-white/5">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-8 text-xs text-white/70 uppercase tracking-wider">
                        <div className="flex items-center gap-2"><Lock className="w-4 h-4" /> Encrypted</div>
                        <div className="flex items-center gap-2"><Trash2 className="w-4 h-4" /> Auto-deleted</div>
                        <div className="flex items-center gap-2"><Shield className="w-4 h-4" /> Private</div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/70">
                        <PocketMark className="w-4 h-4 text-amber-400" />
                        © 2026 RIYP
                    </div>
                </div>
            </footer>
        </div>
    );
}
