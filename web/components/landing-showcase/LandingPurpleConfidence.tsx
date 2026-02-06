"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Shield, Lock, Trash2, CheckCircle } from "lucide-react";
import { PocketMark } from "@/components/icons";

/**
 * Landing Page: Purple Confidence
 * - White background with purple/violet accents
 * - Bold, confident messaging
 * - Modern, premium feel
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

export function LandingPurpleConfidence() {
    return (
        <div className="min-h-screen bg-white text-gray-900">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <PocketMark className="w-7 h-7 text-violet-600" />
                        <span className="font-bold text-lg">RIYP</span>
                    </div>
                    <button className="px-5 py-2.5 bg-violet-600 text-white font-medium rounded-lg hover:bg-violet-700 transition-colors">
                        Get Started
                    </button>
                </div>
            </nav>

            {/* Hero */}
            <section className="px-6 py-24">
                <div className="max-w-5xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-100 text-violet-700 rounded-full text-sm font-medium mb-6">
                                <CheckCircle className="w-4 h-4" />
                                Based on real recruiter research
                            </div>

                            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 text-gray-900">
                                Stop guessing.<br />
                                <span className="text-violet-600">Start knowing.</span>
                            </h1>

                            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                                Recruiters spend 7.4 seconds on your resume. Get the honest verdict on what they actually see - and how to fix it.
                            </p>

                            <div className="flex flex-wrap items-center gap-4 mb-6">
                                <button className="group flex items-center gap-2 px-8 py-4 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 transition-colors">
                                    Get Your Verdict
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <span className="text-sm text-gray-500">Free · 60 seconds</span>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1"><Lock className="w-4 h-4" /> Encrypted</div>
                                <div className="flex items-center gap-1"><Trash2 className="w-4 h-4" /> Delete anytime</div>
                            </div>
                        </motion.div>

                        {/* Stats Panel */}
                        <motion.div
                            className="grid grid-cols-2 gap-4"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            {[
                                { value: 7, suffix: "s", label: "Scan time", bg: "bg-violet-50" },
                                { value: 14, label: "Studies", bg: "bg-purple-50" },
                                { value: 75, suffix: "%", label: "Quick reject", bg: "bg-fuchsia-50" },
                                { value: 3, suffix: "x", label: "Callbacks", bg: "bg-pink-50" },
                            ].map((stat, i) => (
                                <div key={stat.label} className={`p-6 rounded-2xl ${stat.bg}`}>
                                    <div className="text-4xl font-bold text-gray-900 mb-1">
                                        <CountUp end={stat.value} suffix={stat.suffix || ""} />
                                    </div>
                                    <div className="text-sm text-gray-600">{stat.label}</div>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="px-6 py-24 bg-gray-50">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            What you'll get
                        </h2>
                        <p className="text-gray-600 text-lg">Three things that actually help</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "The 7-Second Verdict",
                                description: "The unfiltered first impression. What a recruiter actually thinks in those critical seconds.",
                                gradient: "from-violet-500 to-purple-600",
                            },
                            {
                                title: "Your Critical Miss",
                                description: "The single biggest gap killing your chances. Usually something you never noticed.",
                                gradient: "from-purple-500 to-fuchsia-600",
                            },
                            {
                                title: "Red Pen Rewrites",
                                description: "Exact replacement text for weak lines. Copy, paste, and watch callbacks increase.",
                                gradient: "from-fuchsia-500 to-pink-600",
                            },
                        ].map((feature, i) => (
                            <motion.div
                                key={feature.title}
                                className="relative p-8 rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient}`} />
                                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-2">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Social Proof */}
            <section className="px-6 py-24">
                <div className="max-w-3xl mx-auto text-center">
                    <blockquote className="text-2xl md:text-3xl font-medium text-gray-900 leading-relaxed mb-8">
                        "This gave me exactly what I needed - honest feedback that helped me land interviews at three FAANG companies."
                    </blockquote>
                    <div className="text-gray-600">Alex K. · Senior Software Engineer</div>
                </div>
            </section>

            {/* CTA */}
            <section className="px-6 py-24 bg-gradient-to-r from-violet-600 to-purple-600">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-4xl font-bold text-white mb-6">Ready to see the truth?</h2>
                    <p className="text-violet-100 text-lg mb-10">
                        60 seconds. Free. No signup required.
                    </p>
                    <button className="group inline-flex items-center gap-2 px-10 py-5 bg-white text-violet-700 font-semibold text-lg rounded-lg hover:bg-gray-50 transition-colors">
                        Get Your Verdict
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="px-6 py-8 bg-white border-t border-gray-100">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <PocketMark className="w-5 h-5 text-violet-600" />
                        <span className="text-sm text-gray-400">© 2026 RIYP</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-1"><Shield className="w-4 h-4" /> Private & Secure</div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
