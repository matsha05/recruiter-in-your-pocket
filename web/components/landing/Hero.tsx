"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../providers/AuthProvider";

export default function Hero() {
    const [loaded, setLoaded] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        setLoaded(true);
    }, []);

    // Personalized headline for logged-in users
    const headline = user?.firstName
        ? `Hey ${user.firstName}, ready for your next review?`
        : "See how recruiters actually read your resume.";

    const subheadline = user?.firstName
        ? "Let's see what recruiters notice first."
        : "Get a recruiter-grade read, stronger bullets, and clear next steps in minutes.";

    return (
        <section className="section bg-gradient-to-b from-[var(--bg-body)] to-[var(--bg-section-muted)]">
            <div className="section-inner">
                {/* Two-column grid: text column slightly wider on lg */}
                <div className="grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] items-center">

                    {/* Left column - Hero copy and CTA */}
                    <div className="max-w-xl">
                        {/* Optional label line */}
                        {!user && (
                            <p className="mb-3 text-xs font-semibold tracking-[0.16em] uppercase text-brand">
                                Recruiter-grade insight
                            </p>
                        )}

                        {/* Hero H1 - THE dominant line on the site */}
                        <h1
                            className={`
                                text-primary
                                max-w-[18ch]
                                mb-4
                                transition-all duration-700
                                ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
                            `}
                            style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: 'clamp(3rem, 7vw, 4.75rem)',
                                lineHeight: '1.15',
                                letterSpacing: '-0.02em',
                                fontWeight: 800
                            }}
                        >
                            {headline}
                        </h1>

                        {/* Subcopy */}
                        <p className="text-secondary text-[var(--fs-body)] leading-[var(--lh-normal)] max-w-lg mb-6">
                            {subheadline}
                        </p>

                        {/* Built by Matt row - only for non-logged-in users */}
                        {!user && (
                            <div className="flex items-center gap-3 mb-6">
                                <Image
                                    src="/assets/founder-avatar.jpg"
                                    alt="Matt"
                                    width={48}
                                    height={48}
                                    className="rounded-full border-2 border-white shadow-md object-cover flex-shrink-0"
                                    quality={100}
                                    priority
                                />
                                <p className="text-[var(--fs-small)] text-secondary leading-relaxed">
                                    Built by Matt — a recruiter who&apos;s run 10,000+ interviews and hired 1,000+ across Google, Meta, OpenAI, and high-growth startups.
                                </p>
                            </div>
                        )}

                        {/* CTA row */}
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <Link
                                href="/workspace"
                                className="btn-primary transition-transform transition-shadow duration-150"
                                style={{ transitionTimingFunction: 'var(--ease-smooth)' }}
                            >
                                {user ? "Continue in Workspace →" : "See How Recruiters Read You →"}
                            </Link>
                            {!user && (
                                <button
                                    type="button"
                                    className="btn-ghost text-brand hover:text-brand-strong text-[var(--fs-small)] font-medium"
                                    onClick={() => setShowPrivacy(true)}
                                >
                                    Your resume is yours →
                                </button>
                            )}
                        </div>

                        {/* Helper line */}
                        {!user && (
                            <p className="text-[var(--fs-small)] text-muted">
                                Upload PDF/DOCX or paste text · First 2 full reports free · No signup required
                            </p>
                        )}
                    </div>

                    {/* Right column - Sample Report Preview Card */}
                    <div className="flex justify-center lg:justify-end">
                        <div className={`card-lg max-w-md w-full ${loaded ? "animate-score-in" : "opacity-0"}`}>
                            {/* Score cluster */}
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-[var(--brand)] to-[var(--brand-strong)] rounded-full shadow-button flex-shrink-0">
                                    <span className="text-xl font-extrabold text-white">86</span>
                                </div>
                                <div>
                                    <div className="text-xs text-secondary uppercase tracking-wide">Clarity Score</div>
                                    <div className="font-display font-bold text-brand text-sm">Strong foundation</div>
                                </div>
                            </div>

                            {/* Subscores row */}
                            <div className="flex flex-wrap gap-2 mb-5">
                                <div className="subscore-impact subscore-pill">
                                    <span className="subscore-pill-label">Impact</span>
                                    <span className="subscore-pill-value">82</span>
                                </div>
                                <div className="subscore-clarity subscore-pill">
                                    <span className="subscore-pill-label">Clarity</span>
                                    <span className="subscore-pill-value">88</span>
                                </div>
                                <div className="subscore-story subscore-pill">
                                    <span className="subscore-pill-label">Story</span>
                                    <span className="subscore-pill-value">84</span>
                                </div>
                                <div className="subscore-readability subscore-pill">
                                    <span className="subscore-pill-label">Readability</span>
                                    <span className="subscore-pill-value">90</span>
                                </div>
                            </div>

                            {/* Verdict quote */}
                            <blockquote className="text-brand-strong italic border-l-4 border-brand pl-4 mb-4 bg-[var(--bg-card-alt)] py-3 pr-3 rounded-r-lg text-sm leading-relaxed">
                                &quot;You read as someone who takes messy workstreams and makes them shippable. Your edge is steady ownership.&quot;
                            </blockquote>

                            {/* Best fit roles */}
                            <div className="mb-4">
                                <h4 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Best fit roles</h4>
                                <div className="flex flex-wrap gap-2">
                                    <span className="badge-brand px-2.5 py-1 text-xs rounded-full">Program Manager</span>
                                    <span className="badge-brand px-2.5 py-1 text-xs rounded-full">Technical PM</span>
                                    <span className="badge-brand px-2.5 py-1 text-xs rounded-full">Product Ops</span>
                                </div>
                            </div>

                            {/* Top fixes */}
                            <div className="mb-5">
                                <h4 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Top fixes</h4>
                                <ul className="space-y-1.5 text-sm text-secondary">
                                    <li className="flex items-start gap-2">
                                        <span className="text-warning flex-shrink-0">→</span>
                                        <span>Add scope numbers to your top 2 bullets</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-warning flex-shrink-0">→</span>
                                        <span>State one before/after metric in your headline</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-warning flex-shrink-0">→</span>
                                        <span>Add a summary that positions your PM style</span>
                                    </li>
                                </ul>
                            </div>

                            {/* CTA */}
                            <Link href="/workspace?sample=true" className="btn-primary w-full text-center block text-sm py-3">
                                See full sample report →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Privacy Modal */}
            {showPrivacy && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-5"
                    onClick={(e) => e.target === e.currentTarget && setShowPrivacy(false)}
                >
                    <div className="bg-surface rounded-2xl shadow-modal w-full max-w-[400px] p-8 relative">
                        <button
                            onClick={() => setShowPrivacy(false)}
                            aria-label="Close"
                            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-muted hover:text-primary transition-colors rounded-full border border-subtle hover:border-[var(--border)]"
                        >
                            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                                <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        </button>

                        <h2 className="font-display text-xl font-bold text-primary mb-4">
                            How we handle data
                        </h2>

                        <div className="space-y-4 text-secondary">
                            <p>
                                Your resume stays in your browser until you run a review.
                            </p>
                            <p>
                                When you run a review, we send only your text to our servers over an encrypted connection.
                            </p>
                            <p>
                                We don&apos;t keep your resume or use it to train anything.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
