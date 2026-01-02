"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Shield, Lock, Trash2, Zap } from "lucide-react";
import { PocketMark } from "@/components/icons";

/**
 * Landing Page: Blue Professional
 * - Clean white with blue accents
 * - Corporate/professional
 * - Classic, trustworthy
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

export function LandingBlueProfessional() {
    return (
        <div className="min-h-screen bg-white text-gray-900">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 bg-white shadow-sm">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <PocketMark className="w-7 h-7 text-blue-600" />
                        <span className="font-semibold text-lg">Recruiter in Your Pocket</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <a href="#how" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">How it Works</a>
                        <button className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors">
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="px-6 py-20 bg-gradient-to-b from-blue-50 to-white">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-md text-sm font-medium mb-8">
                            <Zap className="w-4 h-4" />
                            Powered by 14 peer-reviewed studies
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 text-gray-900">
                            See Your Resume Through<br />
                            <span className="text-blue-600">Recruiter Eyes</span>
                        </h1>

                        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
                            Research shows recruiters spend just 7.4 seconds on each resume.
                            Get the honest verdict on yours - and learn exactly how to improve.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                            <button className="group flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                                Get Your Free Analysis
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                            <div className="flex items-center gap-2"><Lock className="w-4 h-4" /> Encrypted</div>
                            <div className="flex items-center gap-2"><Trash2 className="w-4 h-4" /> Auto-deleted</div>
                            <div className="flex items-center gap-2"><Shield className="w-4 h-4" /> Never trains AI</div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Stats */}
            <section className="px-6 py-16 border-y border-gray-100">
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8 text-center">
                        {[
                            { value: 7, suffix: "s", label: "Average scan time" },
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
                                <div className="text-4xl font-bold text-blue-600 mb-2">
                                    <CountUp end={stat.value} suffix={stat.suffix || ""} />
                                </div>
                                <div className="text-sm text-gray-600">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section id="how" className="px-6 py-24">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            How It Works
                        </h2>
                        <p className="text-gray-600 text-lg">Three things you'll receive</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                step: "1",
                                title: "The 7-Second Verdict",
                                description: "The honest first impression - what recruiters actually think in those critical first seconds.",
                            },
                            {
                                step: "2",
                                title: "Your Critical Miss",
                                description: "The biggest gap holding you back. Usually something you never even noticed.",
                            },
                            {
                                step: "3",
                                title: "Red Pen Rewrites",
                                description: "Exact text replacements for every weak line. Just copy, paste, and improve.",
                            },
                        ].map((feature, i) => (
                            <motion.div
                                key={feature.title}
                                className="p-8 rounded-lg bg-gray-50 border border-gray-200"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold mb-4">
                                    {feature.step}
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="px-6 py-24 bg-blue-600">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-4xl font-bold text-white mb-6">Ready to see the truth?</h2>
                    <p className="text-blue-100 text-lg mb-10">
                        Free analysis. 60 seconds. No signup required.
                    </p>
                    <button className="group inline-flex items-center gap-2 px-10 py-5 bg-white text-blue-700 font-semibold text-lg rounded-md hover:bg-gray-50 transition-colors">
                        Get Your Verdict
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="px-6 py-8 bg-gray-50 border-t border-gray-200">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <PocketMark className="w-5 h-5 text-blue-600" />
                        <span className="text-sm text-gray-500">© 2026 Recruiter in Your Pocket</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span>Privacy-first</span>
                        <span>Research-backed</span>
                        <span>Forever free tier</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
