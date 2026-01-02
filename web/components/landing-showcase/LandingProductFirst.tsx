"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { Lock, Trash2, Shield, ArrowRight, Check, Star, AlertCircle, ArrowDown } from "lucide-react";
import { PocketMark } from "@/components/icons";

/**
 * Landing Page Variation: Narrative Scroll
 * 
 * Design principles applied:
 * - Vertical storytelling — each scroll reveals next chapter
 * - Full-height sections with single focus
 * - Dramatic reveal animations
 * - Clean light theme with bold accents
 * - Stripe-inspired purposeful motion
 */

// Animated counter
function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true });
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!isInView) return;
        const duration = 1200;
        const start = Date.now();
        const animate = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(value * eased));
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [isInView, value]);

    return <span ref={ref} className="tabular-nums">{count}{suffix}</span>;
}

export function LandingNarrativeScroll() {
    return (
        <div className="min-h-screen bg-white text-slate-900 selection:bg-teal-500/20">
            {/* Minimal sticky nav */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <PocketMark className="w-6 h-6 text-teal-600" />
                        <span className="font-bold tracking-tight">RIYP</span>
                    </div>
                    <button className="px-5 py-2.5 rounded-full bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-colors">
                        Get Started
                    </button>
                </div>
            </nav>

            {/* CHAPTER 1: The Hook */}
            <section className="min-h-screen flex flex-col justify-center items-center px-8 pt-20 pb-32 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-4xl"
                >
                    <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] mb-8">
                        You get <span className="text-teal-600">7 seconds.</span>
                    </h1>
                    <p className="text-2xl md:text-3xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed">
                        That's how long a recruiter spends on your resume before deciding your fate.
                    </p>
                    <motion.button
                        className="group inline-flex items-center gap-3 px-10 py-5 rounded-full bg-teal-600 text-white font-bold text-xl hover:bg-teal-700 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        See What They See
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                    className="absolute bottom-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                >
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <ArrowDown className="w-6 h-6 text-slate-300" />
                    </motion.div>
                </motion.div>
            </section>

            {/* CHAPTER 2: The Problem */}
            <section className="min-h-screen flex items-center px-8 bg-slate-950 text-white">
                <div className="max-w-7xl mx-auto w-full py-32">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="text-[clamp(5rem,15vw,10rem)] font-bold leading-none text-teal-400">
                                <Counter value={75} suffix="%" />
                            </div>
                            <p className="text-3xl font-medium text-white leading-snug mt-6">
                                of resumes are rejected without ever being read properly.
                            </p>
                        </motion.div>

                        <motion.div
                            className="space-y-6"
                            initial={{ opacity: 0, x: 40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            {[
                                "Your best achievement is buried on page 2",
                                "Your impact isn't quantified",
                                "Your story doesn't come through",
                                "You look like everyone else",
                            ].map((problem, i) => (
                                <div
                                    key={problem}
                                    className="flex items-center gap-4 p-5 rounded-xl bg-white/5 border border-white/10"
                                >
                                    <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 font-bold text-sm">
                                        {i + 1}
                                    </div>
                                    <span className="text-lg text-white/80">{problem}</span>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CHAPTER 3: The Solution */}
            <section className="min-h-screen flex items-center px-8 py-32">
                <div className="max-w-6xl mx-auto w-full">
                    <motion.div
                        className="text-center mb-20"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
                            We show you the truth.
                        </h2>
                        <p className="text-xl text-slate-500 max-w-xl mx-auto">
                            Not generic advice. The actual recruiter's verdict on your resume.
                        </p>
                    </motion.div>

                    {/* The three outputs */}
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                number: "01",
                                title: "7-Second Verdict",
                                description: "The recruiter's honest first impression — what they noticed, thought, and would do next.",
                                color: "bg-rose-50 border-rose-200 text-rose-600",
                            },
                            {
                                number: "02",
                                title: "Critical Miss",
                                description: "The single most damaging gap in your resume. Not a list — the one thing that matters most.",
                                color: "bg-amber-50 border-amber-200 text-amber-600",
                            },
                            {
                                number: "03",
                                title: "Red Pen Rewrites",
                                description: "Before and after for every weak bullet. Copy, paste, and watch your score improve.",
                                color: "bg-teal-50 border-teal-200 text-teal-600",
                            },
                        ].map((item, i) => (
                            <motion.div
                                key={item.title}
                                className={`p-8 rounded-3xl border-2 ${item.color.replace('text-', 'border-').replace('-600', '-200')} bg-white`}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15 }}
                            >
                                <div className={`text-sm font-mono font-bold ${item.color.split(' ')[2]} mb-4`}>
                                    {item.number}
                                </div>
                                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{item.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CHAPTER 4: Proof — Sample Verdict */}
            <section className="py-32 px-8 bg-slate-50 border-y border-slate-200">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl font-bold tracking-tight mb-4">
                            This is what you get.
                        </h2>
                    </motion.div>

                    <motion.div
                        className="rounded-3xl border-2 border-slate-200 bg-white shadow-xl shadow-slate-200/50 overflow-hidden"
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="px-8 py-5 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-teal-500 animate-pulse" />
                            <span className="text-sm font-mono uppercase tracking-widest text-slate-500">Live Example</span>
                        </div>

                        <div className="p-10">
                            <div className="flex items-start gap-8 mb-8">
                                <div className="shrink-0">
                                    <div className="w-24 h-24 rounded-2xl bg-teal-50 flex items-center justify-center">
                                        <span className="text-4xl font-bold text-teal-600">87</span>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                                        Recruiter's First Impression
                                    </div>
                                    <p className="text-2xl font-medium text-slate-800 leading-snug">
                                        "Strong founder energy, but your biggest win is buried in paragraph three. I almost missed it."
                                    </p>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <AlertCircle className="w-5 h-5 text-amber-600" />
                                    <span className="text-sm font-bold uppercase tracking-widest text-amber-700">Critical Miss</span>
                                </div>
                                <p className="text-lg text-amber-900">
                                    You led a team of 12 to a $2M revenue increase — but it's positioned after three bullets about day-to-day operations. Move it to the top.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* CHAPTER 5: Social Proof */}
            <section className="py-32 px-8">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl font-bold tracking-tight mb-4">Real results.</h2>
                        <p className="text-xl text-slate-500">10,000+ job seekers. 3.2x more callbacks.</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { quote: "Finally understood why I wasn't getting callbacks.", name: "Sarah K.", role: "PM at Google" },
                            { quote: "The Critical Miss feature found what 3 coaches missed.", name: "James R.", role: "Eng Lead at Stripe" },
                            { quote: "Worth every penny. Landed my dream job in 3 weeks.", name: "Emily T.", role: "Designer at Figma" },
                        ].map((t, i) => (
                            <motion.div
                                key={t.name}
                                className="p-8 rounded-2xl bg-slate-50 border border-slate-200"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="flex gap-1 mb-6">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 fill-teal-500 text-teal-500" />
                                    ))}
                                </div>
                                <p className="text-lg text-slate-700 leading-relaxed mb-6">"{t.quote}"</p>
                                <div>
                                    <div className="font-semibold">{t.name}</div>
                                    <div className="text-sm text-slate-500">{t.role}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CHAPTER 6: Pricing */}
            <section className="py-32 px-8 bg-slate-950 text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-5xl font-bold tracking-tight mb-6">
                            Start free. Upgrade when ready.
                        </h2>
                        <p className="text-xl text-white/60 mb-16">
                            3 free analyses. Full reports. No credit card.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto text-left">
                        {/* Free */}
                        <motion.div
                            className="p-10 rounded-3xl border border-white/10 bg-white/5"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="text-sm font-bold uppercase tracking-widest text-white/40 mb-2">Free</div>
                            <div className="text-6xl font-bold mb-8">$0</div>
                            <ul className="space-y-4 mb-10">
                                {["3 resume analyses", "Full verdict", "Critical Miss", "Red Pen rewrites"].map((f) => (
                                    <li key={f} className="flex items-center gap-3 text-white/70">
                                        <Check className="w-5 h-5 text-teal-400 shrink-0" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <button className="w-full py-4 rounded-xl border border-white/20 font-bold text-lg hover:bg-white/5 transition-colors">
                                Start Free
                            </button>
                        </motion.div>

                        {/* Pro */}
                        <motion.div
                            className="p-10 rounded-3xl border-2 border-teal-400 bg-teal-400/5 relative"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                        >
                            <div className="absolute -top-4 left-8 px-4 py-1.5 bg-teal-400 text-slate-900 text-xs font-bold uppercase tracking-wider rounded-full">
                                Best Value
                            </div>
                            <div className="text-sm font-bold uppercase tracking-widest text-teal-400 mb-2">Pro</div>
                            <div className="text-6xl font-bold mb-8">$12<span className="text-2xl text-white/40 font-normal">/mo</span></div>
                            <ul className="space-y-4 mb-10">
                                {["Unlimited analyses", "LinkedIn reviews", "Job matching", "Chrome extension", "Priority support"].map((f) => (
                                    <li key={f} className="flex items-center gap-3 text-white/70">
                                        <Check className="w-5 h-5 text-teal-400 shrink-0" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <button className="w-full py-4 rounded-xl bg-teal-400 text-slate-900 font-bold text-lg hover:bg-teal-300 transition-colors">
                                Upgrade to Pro
                            </button>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* FINAL CTA */}
            <section className="py-32 px-8 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
                        Your move.
                    </h2>
                    <motion.button
                        className="group inline-flex items-center gap-3 px-12 py-6 rounded-full bg-slate-900 text-white font-bold text-xl hover:bg-teal-600 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Get Your Verdict
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="px-8 py-12 bg-slate-50 border-t border-slate-200">
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
