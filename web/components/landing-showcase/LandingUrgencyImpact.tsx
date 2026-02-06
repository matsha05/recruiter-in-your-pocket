"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Shield, Trash2, ArrowRight, Check, ChevronRight, AlertCircle, Zap, Target, TrendingUp, Star, Clock } from "lucide-react";
import { PocketMark } from "@/components/icons";

/**
 * Landing Page Variation: Urgency & Impact
 * 
 * Style: Bold/editorial (Arc/Notion inspired)
 * - Emphasizes the 7.4-second countdown
 * - Dramatic contrast, dark hero section
 * - Bold statements and time pressure
 * - High-contrast sections with visual punch
 */

// Countdown timer component
function CountdownDisplay() {
    const [current, setCurrent] = useState(7.4);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((prev) => {
                if (prev <= 0) return 7.4;
                return Math.max(0, prev - 0.1);
            });
        }, 100);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="font-mono text-8xl md:text-9xl font-bold tracking-tighter tabular-nums">
            {current.toFixed(1)}<span className="text-5xl md:text-6xl text-white/60">s</span>
        </div>
    );
}

// Animated stat counter
function StatCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const duration = 2000;
        const startTime = Date.now();

        const animate = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 4);
            setCount(Math.round(value * ease));
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [value]);

    return <span className="tabular-nums">{count}{suffix}</span>;
}

export function LandingUrgencyImpact() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-teal-500/30">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <PocketMark className="w-5 h-5 text-teal-400" />
                        <span className="font-medium text-sm tracking-tight text-white/90">RIYP</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <a href="#" className="text-sm text-white/80 hover:text-white transition-colors">Research</a>
                        <button className="text-sm font-medium px-4 py-2 rounded-md bg-white text-black hover:bg-white/90 transition-colors">
                            Start Free
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section - Dark & Dramatic */}
            <section className="relative min-h-screen flex items-center justify-center px-6 pt-20 overflow-hidden">
                {/* Gradient background */}
                <div className="absolute inset-0 bg-gradient-to-b from-teal-900/20 via-transparent to-transparent pointer-events-none" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="relative max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        {/* The countdown */}
                        <div className="mb-8">
                            <CountdownDisplay />
                        </div>

                        {/* Headline */}
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight leading-tight mb-6">
                            That's how long a recruiter looks at your resume.
                            <br />
                            <span className="text-teal-400">Make it count.</span>
                        </h1>

                        {/* Subhead */}
                        <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10">
                            We show you exactly what they see in those 7 seconds — and the one thing that's costing you interviews.
                        </p>

                        {/* CTA */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                            <button className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-white text-black font-medium text-lg hover:bg-teal-400 hover:text-black transition-all">
                                Get Your 7-Second Verdict
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <span className="text-sm text-white/60">Free • No signup required</span>
                        </div>

                        {/* Trust badges */}
                        <div className="flex items-center justify-center gap-6 text-xs text-white/80">
                            <span className="flex items-center gap-1.5">
                                <Lock className="w-3.5 h-3.5" />
                                Encrypted in transit
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                Delete anytime
                            </span>
                        </div>
                    </motion.div>
                </div>

                {/* Scroll indicator */}
                <motion.div
                    className="absolute bottom-8 left-1/2 -translate-x-1/2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                >
                    <div className="w-6 h-10 rounded-full border border-white/20 flex items-start justify-center p-2">
                        <motion.div
                            className="w-1 h-2 rounded-full bg-white/40"
                            animate={{ y: [0, 12, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        />
                    </div>
                </motion.div>
            </section>

            {/* Stats Section */}
            <section className="px-6 py-20 bg-[#111] border-y border-white/5">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {[
                            { value: 7.4, suffix: "s", label: "Average resume review time" },
                            { value: 250, suffix: "+", label: "Applications per job posting" },
                            { value: 75, suffix: "%", label: "Rejected in first 10 seconds" },
                            { value: 6, suffix: "x", label: "More interviews with our fixes" },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="text-4xl md:text-5xl font-bold text-teal-400 mb-2">
                                    <StatCounter value={stat.value} suffix={stat.suffix} />
                                </div>
                                <div className="text-sm text-white/60">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* What You Get Section */}
            <section className="px-6 py-24 bg-[#0a0a0a]">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-medium tracking-tight mb-4">
                            The complete picture in seconds
                        </h2>
                        <p className="text-lg text-white/70 max-w-xl mx-auto">
                            Not another generic score. A recruiter's actual judgment.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: Target,
                                title: "The 7-Second Verdict",
                                description: "What a recruiter thinks in the first scan. Not vague — specific and actionable.",
                                color: "text-rose-400",
                                bg: "bg-rose-500/10",
                            },
                            {
                                icon: AlertCircle,
                                title: "Your Critical Miss",
                                description: "The one thing that's costing you interviews. Not a list — the priority.",
                                color: "text-amber-400",
                                bg: "bg-amber-500/10",
                            },
                            {
                                icon: Zap,
                                title: "Red Pen Rewrites",
                                description: "Before and after for every weak bullet. Copy, paste, apply.",
                                color: "text-teal-400",
                                bg: "bg-teal-500/10",
                            },
                        ].map((feature, i) => (
                            <motion.div
                                key={feature.title}
                                className="group p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-5`}>
                                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                                </div>
                                <h3 className="text-lg font-medium mb-2">{feature.title}</h3>
                                <p className="text-sm text-white/70 leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Sample Report - High Contrast */}
            <section className="px-6 py-24 bg-gradient-to-b from-[#0a0a0a] to-[#111]">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden"
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-rose-500" />
                                <span className="text-xs font-mono uppercase tracking-widest text-white/70">
                                    Live Example
                                </span>
                            </div>
                            <span className="text-xs text-white/60">Score: 87</span>
                        </div>

                        {/* Content */}
                        <div className="p-8">
                            <div className="mb-6">
                                <div className="text-xs font-mono uppercase tracking-widest text-teal-400 mb-3">
                                    Recruiter Verdict
                                </div>
                                <p className="text-2xl md:text-3xl font-medium leading-snug">
                                    "Strong founder energy, but your biggest win is hiding in paragraph three."
                                </p>
                            </div>

                            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                <div className="flex items-center gap-2 text-amber-400 mb-2">
                                    <AlertCircle className="w-4 h-4" />
                                    <span className="text-xs font-mono uppercase tracking-widest">Critical Miss</span>
                                </div>
                                <p className="text-white/80">
                                    You led a team of 12 to a $2M revenue increase — but it's buried after three bullets about day-to-day operations.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="px-6 py-24 bg-[#111]">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-medium text-center mb-16">
                        Real results from real job seekers
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            {
                                quote: "I've paid $300 for resume reviews that told me less than this free scan.",
                                name: "David R.",
                                role: "Engineering Manager",
                                result: "4 interviews in 2 weeks",
                            },
                            {
                                quote: "The Critical Miss feature is exactly what I needed. No one else told me my impact was buried.",
                                name: "Amanda S.",
                                role: "Product Lead",
                                result: "Landed at Series B startup",
                            },
                        ].map((testimonial, i) => (
                            <motion.div
                                key={testimonial.name}
                                className="p-8 rounded-2xl border border-white/5 bg-white/[0.02]"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="flex gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-teal-400 text-teal-400" />
                                    ))}
                                </div>
                                <p className="text-lg text-white/80 leading-relaxed mb-6">
                                    "{testimonial.quote}"
                                </p>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-medium">{testimonial.name}</div>
                                        <div className="text-sm text-white/60">{testimonial.role}</div>
                                    </div>
                                    <div className="px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 text-xs font-medium">
                                        {testimonial.result}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section className="px-6 py-24 bg-[#0a0a0a]">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-medium tracking-tight mb-4">
                        Start for free. Upgrade when you're ready.
                    </h2>
                    <p className="text-lg text-white/70 mb-12">
                        1 free review, full report, no credit card required.
                    </p>

                    <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                        {/* Free */}
                        <div className="p-8 rounded-2xl border border-white/10 bg-white/[0.02] text-left">
                            <div className="text-sm text-white/70 mb-2">Free</div>
                            <div className="text-4xl font-bold mb-6">$0</div>
                            <ul className="space-y-3 mb-8">
                                {["1 full resume review", "Full recruiter verdict", "Red Pen rewrites", "Critical Miss detection"].map((f) => (
                                    <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                                        <Check className="w-4 h-4 text-teal-400" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <button className="w-full py-3 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors">
                                Run Free Review
                            </button>
                        </div>

                        {/* Pro */}
                        <div className="p-8 rounded-2xl border-2 border-teal-500 bg-teal-500/5 text-left relative">
                            <div className="absolute -top-3 right-6 px-3 py-1 bg-teal-500 text-black text-xs font-bold uppercase rounded-full">
                                Best Value
                            </div>
                            <div className="text-sm text-teal-400 mb-2">Pro</div>
                            <div className="text-4xl font-bold mb-6">$12<span className="text-lg text-white/70">/mo</span></div>
                            <ul className="space-y-3 mb-8">
                                {["Unlimited scans", "LinkedIn reviews", "Job-matched analysis", "Chrome extension", "Priority support"].map((f) => (
                                    <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                                        <Check className="w-4 h-4 text-teal-400" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <button className="w-full py-3 rounded-xl bg-teal-500 text-black font-medium hover:bg-teal-400 transition-colors">
                                Get Pro Access
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="px-6 py-24 bg-gradient-to-t from-teal-900/20 to-transparent">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-6">
                        Stop guessing what recruiters think.
                    </h2>
                    <p className="text-lg text-white/70 mb-10">
                        Get your 7-second verdict in the next 60 seconds.
                    </p>
                    <button className="group inline-flex items-center gap-3 px-10 py-5 rounded-xl bg-white text-black font-medium text-lg hover:bg-teal-400 transition-all">
                        Upload Your Resume
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="px-6 py-8 border-t border-white/5">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <PocketMark className="w-4 h-4 text-teal-400" />
                        <span className="text-sm text-white/60">© 2026 Recruiter in Your Pocket</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-white/60">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Research</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
