"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { Lock, Trash2, Shield, ArrowRight, Check, Star, AlertCircle } from "lucide-react";
import { PocketMark } from "@/components/icons";

/**
 * Landing Page Variation: Massive Impact
 * 
 * Design principles applied:
 * - OVERSIZED typography (100px+ headlines)
 * - Dramatic whitespace — content breathes
 * - Single-minded focus per section
 * - Stripe-style purposeful animations
 * - Product output as the hero moment
 */

// Animated number counter with spring physics
function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true });
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!isInView) return;
        const duration = 1500;
        const start = Date.now();
        const animate = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(value * eased));
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [isInView, value]);

    return <span ref={ref} className="tabular-nums">{count}{suffix}</span>;
}

export function LandingMassiveImpact() {
    const { scrollY } = useScroll();
    const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
    const heroScale = useTransform(scrollY, [0, 400], [1, 0.95]);

    return (
        <div className="min-h-screen bg-white text-slate-900 selection:bg-teal-500/20 overflow-x-hidden">
            {/* Minimal Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <PocketMark className="w-7 h-7 text-teal-600" />
                        <span className="font-semibold text-lg tracking-tight">RIYP</span>
                    </div>
                    <button className="px-6 py-3 rounded-full bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-colors">
                        Try Free
                    </button>
                </div>
            </nav>

            {/* HERO — Massive Typography */}
            <motion.section
                className="min-h-screen flex flex-col justify-center px-8 pt-24"
                style={{ opacity: heroOpacity, scale: heroScale }}
            >
                <div className="max-w-7xl mx-auto w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                        {/* Massive headline */}
                        <h1 className="text-[clamp(3rem,10vw,8rem)] font-bold leading-[0.95] tracking-tight mb-8">
                            <span className="block">What recruiters</span>
                            <span className="block text-teal-600">actually see.</span>
                        </h1>

                        {/* Supporting copy — minimal */}
                        <p className="text-2xl md:text-3xl text-slate-500 max-w-2xl mb-12 leading-relaxed">
                            7.4 seconds. That's the average resume scan. We show you exactly what happens in that window.
                        </p>

                        {/* Single CTA */}
                        <div className="flex flex-wrap items-center gap-6">
                            <motion.button
                                className="group inline-flex items-center gap-3 px-10 py-5 rounded-full bg-teal-600 text-white font-semibold text-xl hover:bg-teal-700 transition-colors"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Get Your Verdict
                                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                            </motion.button>
                            <span className="text-slate-400">Free · 60 seconds</span>
                        </div>
                    </motion.div>
                </div>
            </motion.section>

            {/* THE NUMBER — Dramatic Stats Section */}
            <section className="py-32 px-8 bg-slate-950 text-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Giant number */}
                        <div>
                            <div className="text-[clamp(6rem,20vw,14rem)] font-bold leading-none text-teal-400 mb-4">
                                <AnimatedNumber value={7} suffix=".4s" />
                            </div>
                            <p className="text-2xl text-slate-300">
                                The average time a recruiter spends on your resume before making a decision.
                            </p>
                        </div>

                        {/* Supporting stats */}
                        <div className="grid grid-cols-2 gap-8">
                            {[
                                { value: 75, suffix: "%", label: "Rejected in first scan" },
                                { value: 250, suffix: "+", label: "Applications per role" },
                                { value: 3, suffix: "x", label: "More callbacks with fixes" },
                                { value: 94, suffix: "%", label: "Find their Critical Miss" },
                            ].map((stat) => (
                                <div key={stat.label} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                    <div className="text-4xl font-bold text-white mb-2">
                                        <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                                    </div>
                                    <div className="text-slate-400">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* PRODUCT AS HERO — Sample Verdict */}
            <section className="py-32 px-8">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
                            This is what you get.
                        </h2>
                        <p className="text-xl text-slate-500 max-w-xl mx-auto">
                            Not vague suggestions. A recruiter's actual verdict on your resume.
                        </p>
                    </div>

                    {/* The actual product preview */}
                    <motion.div
                        className="rounded-3xl border-2 border-slate-200 bg-white shadow-2xl shadow-slate-200/50 overflow-hidden"
                        initial={{ opacity: 0, y: 60 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                        {/* Header bar */}
                        <div className="px-8 py-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-400" />
                                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                <div className="w-3 h-3 rounded-full bg-green-400" />
                            </div>
                            <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Resume Analysis</span>
                        </div>

                        {/* Content */}
                        <div className="p-10">
                            <div className="grid lg:grid-cols-5 gap-8">
                                {/* Score */}
                                <div className="lg:col-span-1 flex flex-col items-center justify-center p-6 rounded-2xl bg-teal-50">
                                    <div className="text-6xl font-bold text-teal-600">87</div>
                                    <div className="text-sm font-medium text-teal-700 mt-1">Signal Score</div>
                                </div>

                                {/* Verdict */}
                                <div className="lg:col-span-4 space-y-6">
                                    <div>
                                        <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                                            Recruiter's First Impression
                                        </div>
                                        <p className="text-2xl font-medium text-slate-800 leading-snug">
                                            "Strong founder energy, but your biggest win is buried in paragraph three. I almost missed it."
                                        </p>
                                    </div>

                                    <div className="p-5 rounded-xl bg-amber-50 border border-amber-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <AlertCircle className="w-5 h-5 text-amber-600" />
                                            <span className="text-sm font-bold uppercase tracking-widest text-amber-700">Critical Miss</span>
                                        </div>
                                        <p className="text-lg text-amber-900">
                                            You led a team of 12 to a $2M revenue increase — but it's positioned after three bullets about day-to-day operations.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* TRUST — Social Proof */}
            <section className="py-24 px-8 bg-slate-50 border-y border-slate-200">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold tracking-tight mb-4">
                            Trusted by 10,000+ job seekers
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { quote: "Finally understood why I wasn't getting callbacks. Fixed everything in an hour.", name: "Sarah K.", role: "Product Manager at Google", stars: 5 },
                            { quote: "The Critical Miss feature found what 3 career coaches missed.", name: "James R.", role: "Engineering Lead at Stripe", stars: 5 },
                            { quote: "Worth every penny. Landed my dream job in 3 weeks.", name: "Emily T.", role: "Designer at Figma", stars: 5 },
                        ].map((testimonial, i) => (
                            <motion.div
                                key={testimonial.name}
                                className="p-8 rounded-2xl bg-white border border-slate-200"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="flex gap-1 mb-6">
                                    {[...Array(testimonial.stars)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 fill-teal-500 text-teal-500" />
                                    ))}
                                </div>
                                <p className="text-lg text-slate-700 leading-relaxed mb-6">
                                    "{testimonial.quote}"
                                </p>
                                <div>
                                    <div className="font-semibold text-slate-900">{testimonial.name}</div>
                                    <div className="text-sm text-slate-500">{testimonial.role}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* PRICING — Simple */}
            <section className="py-32 px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-5xl font-bold tracking-tight mb-6">
                        Start free. Upgrade when ready.
                    </h2>
                    <p className="text-xl text-slate-500 mb-16">
                        3 free analyses. Full reports. No credit card.
                    </p>

                    <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto text-left">
                        {/* Free */}
                        <div className="p-10 rounded-3xl border-2 border-slate-200">
                            <div className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">Free</div>
                            <div className="text-6xl font-bold mb-8">$0</div>
                            <ul className="space-y-4 mb-10">
                                {["3 resume analyses", "Full recruiter verdict", "Critical Miss detection", "Red Pen rewrites"].map((f) => (
                                    <li key={f} className="flex items-center gap-3 text-slate-600">
                                        <Check className="w-5 h-5 text-teal-600 shrink-0" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <button className="w-full py-4 rounded-xl border-2 border-slate-200 font-bold text-lg hover:bg-slate-50 transition-colors">
                                Start Free
                            </button>
                        </div>

                        {/* Pro */}
                        <div className="p-10 rounded-3xl border-2 border-teal-600 relative">
                            <div className="absolute -top-4 left-8 px-4 py-1.5 bg-teal-600 text-white text-xs font-bold uppercase tracking-wider rounded-full">
                                Best Value
                            </div>
                            <div className="text-sm font-bold uppercase tracking-widest text-teal-600 mb-2">Pro</div>
                            <div className="text-6xl font-bold mb-8">$12<span className="text-2xl text-slate-400 font-normal">/mo</span></div>
                            <ul className="space-y-4 mb-10">
                                {["Unlimited analyses", "LinkedIn reviews", "Job matching", "Chrome extension", "Priority support"].map((f) => (
                                    <li key={f} className="flex items-center gap-3 text-slate-600">
                                        <Check className="w-5 h-5 text-teal-600 shrink-0" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <button className="w-full py-4 rounded-xl bg-teal-600 text-white font-bold text-lg hover:bg-teal-700 transition-colors">
                                Upgrade to Pro
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* FINAL CTA — Massive */}
            <section className="py-32 px-8 bg-slate-950 text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
                        See what they see.
                    </h2>
                    <motion.button
                        className="group inline-flex items-center gap-3 px-12 py-6 rounded-full bg-white text-slate-900 font-bold text-xl hover:bg-teal-400 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Get Your Verdict
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                </div>
            </section>

            {/* Footer */}
            <footer className="px-8 py-12 bg-white border-t border-slate-100">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-wrap items-center justify-center gap-8 mb-8 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4 text-teal-600" />
                            End-to-end encrypted
                        </div>
                        <div className="flex items-center gap-2">
                            <Trash2 className="w-4 h-4" />
                            Auto-deleted in 24h
                        </div>
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Never trains AI
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <PocketMark className="w-5 h-5 text-teal-600" />
                            <span className="text-sm text-slate-500">© 2026 Recruiter in Your Pocket</span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-slate-500">
                            <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
                            <a href="#" className="hover:text-slate-900 transition-colors">Terms</a>
                            <a href="#" className="hover:text-slate-900 transition-colors">Research</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
