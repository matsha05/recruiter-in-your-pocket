"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Check, Shield, Lock, Trash2 } from "lucide-react";
import { PocketMark } from "@/components/icons";

/**
 * Landing Page: Teal Trust
 * - Light background with teal accents
 * - Trust-focused, professional
 * - Clean cards with subtle shadows
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

export function LandingTealTrust() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <PocketMark className="w-7 h-7 text-teal-600" />
                        <span className="font-bold text-lg">Recruiter in Your Pocket</span>
                    </div>
                    <button className="px-5 py-2.5 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors">
                        Start Free
                    </button>
                </div>
            </nav>

            {/* Hero */}
            <section className="px-6 py-24 bg-white">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 border border-teal-200 rounded-full text-sm font-medium mb-8">
                            <Check className="w-4 h-4" />
                            Based on 14 peer-reviewed studies
                        </div>

                        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 text-slate-900">
                            What do recruiters<br />
                            <span className="text-teal-600">really think?</span>
                        </h1>

                        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
                            Research shows recruiters decide in 7.4 seconds. Get the honest verdict on your resume - and actionable fixes.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                            <button className="group flex items-center gap-2 px-8 py-4 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors shadow-lg shadow-teal-600/20">
                                Get Your Verdict Free
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        <div className="flex items-center justify-center gap-6 text-sm text-slate-500">
                            <div className="flex items-center gap-2"><Lock className="w-4 h-4" /> Encrypted</div>
                            <div className="flex items-center gap-2"><Trash2 className="w-4 h-4" /> Delete anytime</div>
                            <div className="flex items-center gap-2"><Shield className="w-4 h-4" /> Never trains AI</div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Stats Cards */}
            <section className="px-6 py-24">
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-6">
                        {[
                            { value: 7.4, suffix: "s", decimals: 1, label: "First impression", color: "bg-teal-50 border-teal-200" },
                            { value: 14, label: "Research studies", color: "bg-blue-50 border-blue-200" },
                            { value: 75, suffix: "%", label: "Quick rejections", color: "bg-amber-50 border-amber-200" },
                            { value: 3, suffix: "x", label: "Callback increase", color: "bg-green-50 border-green-200" },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                className={`p-6 rounded-xl border-2 ${stat.color} text-center`}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="text-4xl font-bold text-slate-900 mb-2">
                                    <CountUp end={stat.value} suffix={stat.suffix || ""} decimals={stat.decimals || 0} />
                                </div>
                                <div className="text-sm text-slate-600">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* What You Get */}
            <section className="px-6 py-24 bg-white">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                            What you'll discover
                        </h2>
                        <p className="text-slate-600 text-lg">Three insights that change everything</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                num: "01",
                                title: "The 7-Second Verdict",
                                description: "The raw first impression. What a recruiter thinks, feels, and would do next.",
                            },
                            {
                                num: "02",
                                title: "Your Critical Miss",
                                description: "The single most impactful gap holding you back. Often invisible to you.",
                            },
                            {
                                num: "03",
                                title: "Red Pen Rewrites",
                                description: "Exact replacement text for every weak line. Copy, paste, improve.",
                            },
                        ].map((feature, i) => (
                            <motion.div
                                key={feature.title}
                                className="p-8 rounded-xl bg-slate-50 border border-slate-200"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="text-sm font-mono text-teal-600 mb-4">{feature.num}</div>
                                <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="px-6 py-24 bg-teal-600">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-4xl font-bold text-white mb-6">Ready for the truth?</h2>
                    <p className="text-teal-100 text-lg mb-10">
                        60 seconds. Free. No signup required.
                    </p>
                    <button className="group inline-flex items-center gap-2 px-10 py-5 bg-white text-teal-700 font-semibold text-lg rounded-lg hover:bg-slate-50 transition-colors shadow-lg">
                        Get Your Verdict
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="px-6 py-8 bg-white border-t border-slate-200">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <PocketMark className="w-5 h-5 text-teal-600" />
                        <span className="text-sm text-slate-400">© 2026 Recruiter in Your Pocket</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-slate-500">
                        <span>Encrypted</span>
                        <span>Private</span>
                        <span>Secure</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
