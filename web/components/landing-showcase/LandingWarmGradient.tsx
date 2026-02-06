"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Check, Shield, Lock, Trash2 } from "lucide-react";
import { PocketMark } from "@/components/icons";

/**
 * Landing Page: Warm Gradient
 * - Light background with warm peach/coral gradient
 * - Friendly, approachable, high contrast
 * - Modern rounded corners
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

export function LandingWarmGradient() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-rose-50 text-gray-900">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <PocketMark className="w-7 h-7 text-orange-600" />
                        <span className="font-semibold text-lg">RIYP</span>
                    </div>
                    <button className="px-5 py-2.5 bg-orange-600 text-white font-medium rounded-full hover:bg-orange-700 transition-colors">
                        Get Started Free
                    </button>
                </div>
            </nav>

            {/* Hero */}
            <section className="px-6 py-24">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium mb-8">
                            <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                            Free resume analysis in 60 seconds
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 text-gray-900">
                            See what recruiters<br />
                            <span className="text-orange-600">really think</span>
                        </h1>

                        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
                            Recruiters spend just 7.4 seconds on your resume. Find out exactly what they see, what they miss, and how to fix it.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button className="group flex items-center gap-2 px-8 py-4 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-colors">
                                Get Your Verdict
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <span className="text-sm text-gray-500">No signup required</span>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Stats */}
            <section className="px-6 py-16 bg-white">
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8 text-center">
                        {[
                            { value: 7, suffix: "s", label: "Average scan time" },
                            { value: 14, label: "Research studies" },
                            { value: 75, suffix: "%", label: "Rejected in seconds" },
                            { value: 3, suffix: "x", label: "More callbacks" },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="text-4xl font-bold text-orange-600 mb-2">
                                    <CountUp end={stat.value} suffix={stat.suffix || ""} />
                                </div>
                                <div className="text-sm text-gray-600">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="px-6 py-24">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Three things you'll get
                        </h2>
                        <p className="text-gray-600 text-lg">Insights that actually matter</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "The 7-Second Verdict",
                                description: "The exact first impression a recruiter forms. No sugarcoating.",
                                color: "bg-orange-50 border-orange-200",
                            },
                            {
                                title: "Your Critical Miss",
                                description: "The single biggest gap killing your chances. Usually invisible to you.",
                                color: "bg-rose-50 border-rose-200",
                            },
                            {
                                title: "Red Pen Rewrites",
                                description: "Word-for-word replacement text. Copy, paste, done.",
                                color: "bg-amber-50 border-amber-200",
                            },
                        ].map((feature, i) => (
                            <motion.div
                                key={feature.title}
                                className={`p-8 rounded-2xl border-2 ${feature.color}`}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="px-6 py-24 bg-gradient-to-r from-orange-500 to-rose-500">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-4xl font-bold text-white mb-6">Ready to see the truth?</h2>
                    <p className="text-white/90 text-lg mb-10">
                        60 seconds. Free. No signup.
                    </p>
                    <button className="group inline-flex items-center gap-2 px-10 py-5 bg-white text-orange-600 font-semibold text-lg rounded-full hover:bg-gray-50 transition-colors">
                        Get Your Verdict
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="px-6 py-8 bg-white border-t border-gray-100">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-2"><Lock className="w-4 h-4" /> Encrypted</div>
                        <div className="flex items-center gap-2"><Trash2 className="w-4 h-4" /> Delete anytime</div>
                        <div className="flex items-center gap-2"><Shield className="w-4 h-4" /> Not used to train public models</div>
                    </div>
                    <div className="text-sm text-gray-400">© 2026 RIYP</div>
                </div>
            </footer>
        </div>
    );
}
