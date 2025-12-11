"use client";

import Link from "next/link";

interface PricingProps {
    onSelectTier?: (tier: "24h" | "30d") => void;
}

export default function Pricing({ onSelectTier }: PricingProps) {
    const handlePurchase = (tier: "24h" | "30d") => {
        if (onSelectTier) {
            onSelectTier(tier);
        }
    };

    // Shared hover animation classes
    const cardHover = "transition-all duration-200 ease-smooth hover:-translate-y-1 hover:shadow-lg";

    return (
        <section className="section bg-surface" id="pricing">
            <div className="section-inner">
                <div className="text-center mb-10">
                    <span className="badge-brand inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded-full mb-4">
                        Simple pricing
                    </span>
                    <h2 className="font-display text-2xl md:text-3xl font-bold text-primary mb-3">
                        Stop renting resume tools you only use for a week.
                    </h2>
                    <p className="text-secondary max-w-xl mx-auto">
                        No subscriptions. Just passes that match how people really job hunt.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-10">
                    {/* Free Tier */}
                    <div className={`flex flex-col p-6 bg-muted rounded-2xl border border-subtle ${cardHover}`}>
                        <div className="mb-4">
                            <span className="text-xs font-semibold uppercase tracking-wide text-muted">Always free</span>
                        </div>
                        <div className="text-4xl font-extrabold text-primary mb-2">$0</div>
                        <h3 className="font-display font-bold text-primary mb-4">First Look</h3>
                        <ul className="space-y-3 text-sm text-secondary mb-6 flex-1">
                            <li className="flex items-start gap-2">
                                <span className="text-success">✓</span>
                                <span><strong>2 full reports</strong> with score, diagnosis, and rewrites</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-success">✓</span>
                                See how your resume actually reads to a hiring manager
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-success">✓</span>
                                No account or credit card required
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-success">✓</span>
                                Upgrade any time for unlimited access
                            </li>
                        </ul>
                        <Link href="/workspace" className="btn-secondary w-full text-center">
                            Start for free →
                        </Link>
                    </div>

                    {/* 24-Hour Fix Pass */}
                    <div className={`relative flex flex-col p-6 bg-brand-soft rounded-2xl border-2 border-brand ${cardHover}`}>
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-black bg-gold rounded-full shadow-[0_0_20px_rgba(245,178,92,0.5)]">
                            Most popular
                        </div>
                        <div className="text-4xl font-extrabold text-primary mb-2 mt-2">
                            <span className="text-brand">$9</span>
                        </div>
                        <h3 className="font-display font-bold text-primary mb-4">24-Hour Fix Pass</h3>
                        <ul className="space-y-3 text-sm text-secondary mb-6 flex-1">
                            <li className="flex items-start gap-2">
                                <span className="text-brand">✓</span>
                                Unlimited full reports for 24 hours
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-brand">✓</span>
                                Ideal when you need to send a resume today
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-brand">✓</span>
                                Use on any device with your email
                            </li>
                        </ul>
                        <button
                            className="btn-primary w-full"
                            onClick={() => handlePurchase("24h")}
                        >
                            Get 24-Hour Fix Pass
                        </button>
                    </div>

                    {/* 30-Day Campaign Pass */}
                    <div className={`flex flex-col p-6 bg-surface rounded-2xl border border-subtle ${cardHover}`}>
                        <div className="mb-4">
                            <span className="text-xs font-semibold uppercase tracking-wide text-success">Best value</span>
                        </div>
                        <div className="text-4xl font-extrabold text-primary mb-2">
                            <span className="text-success">$39</span>
                        </div>
                        <h3 className="font-display font-bold text-primary mb-4">30-Day Campaign Pass</h3>
                        <ul className="space-y-3 text-sm text-secondary mb-6 flex-1">
                            <li className="flex items-start gap-2">
                                <span className="text-success">✓</span>
                                Unlimited full reports for 30 days
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-success">✓</span>
                                Perfect when you&apos;re applying to multiple roles
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-success">✓</span>
                                Use on any device with your email
                            </li>
                        </ul>
                        <button
                            className="btn-secondary w-full"
                            onClick={() => handlePurchase("30d")}
                        >
                            Get 30-Day Campaign Pass
                        </button>
                    </div>
                </div>

                {/* Trust signals */}
                <div className="flex flex-wrap justify-center gap-6 text-sm text-muted mb-6">
                    <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                            <path d="M9.022 3.173a.75.75 0 0 1 .956 0l5.25 4.2a.75.75 0 0 1 .272.577v3.7a5.25 5.25 0 0 1-3.089 4.79l-2.837 1.264a.75.75 0 0 1-.614 0l-2.837-1.264A5.25 5.25 0 0 1 3.5 11.65v-3.7a.75.75 0 0 1 .272-.577l5.25-4.2Z" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="m7.75 10.75 1.75 1.75 3.75-3.75" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Built by a top recruiter from OpenAI, FAANG, and global startups
                    </span>
                    <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                            <path d="M12.75 9V5.25a3.75 3.75 0 10-7.5 0V9m-.75 0h9a.75.75 0 01.75.75v7.5a.75.75 0 01-.75.75h-9a.75.75 0 01-.75-.75v-7.5a.75.75 0 01.75-.75z" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Your resume never trains models
                    </span>
                    <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                            <path d="M6.75 4.5h10.5v11.25l-2.25-1.5-2.25 1.5-2.25-1.5-2.25 1.5-2.25-1.5-2.25 1.5V4.5z" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        No hidden subscriptions
                    </span>
                </div>

                <p className="text-center text-sm text-muted max-w-md mx-auto">
                    <strong>Why do we ask for email?</strong> So your pass works on any device—phone, laptop, wherever you&apos;re editing. We don&apos;t spam. Just access.
                </p>
            </div>
        </section>
    );
}
