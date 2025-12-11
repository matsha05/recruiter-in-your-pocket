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
        <section className="section bg-gradient-to-b from-white to-gray-50 pt-12 md:pt-20">
            <div className="section-inner text-center">
                <h1 className={`font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6 transition-all duration-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                    {headline}
                </h1>

                <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                    {subheadline}
                </p>

                {/* Founder intro - only show for non-logged-in users */}
                {!user && (
                    <div className="flex items-center justify-center gap-3 mb-8">
                        <Image
                            src="/assets/founder-avatar.jpg"
                            alt="Matt"
                            width={48}
                            height={48}
                            className="rounded-full border-2 border-white shadow-md object-cover"
                            quality={100}
                            priority
                        />
                        <p className="text-sm text-gray-600 text-left max-w-md">
                            Built by Matt — a recruiter who&apos;s run 10,000+ interviews and hired 1,000+ across Google, Meta, OpenAI, and high-growth startups.
                        </p>
                    </div>
                )}

                {/* CTA Stack */}
                <div className="flex flex-col items-center gap-3 mb-6">
                    <Link href="/workspace" className="btn-primary text-lg px-8 py-4">
                        {user ? "Go to Workspace →" : "See How Recruiters Read You →"}
                    </Link>
                    {!user && (
                        <button
                            type="button"
                            className="text-indigo-500 hover:text-indigo-600 text-sm font-medium transition-colors"
                            onClick={() => setShowPrivacy(true)}
                        >
                            Your resume is yours →
                        </button>
                    )}
                </div>

                {!user && (
                    <p className="text-sm text-gray-500">
                        Upload PDF/DOCX or paste text · First 2 full reports free · No signup required
                    </p>
                )}
            </div>

            {/* Privacy Modal */}
            {showPrivacy && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-5"
                    onClick={(e) => e.target === e.currentTarget && setShowPrivacy(false)}
                >
                    <div className="bg-white rounded-2xl shadow-modal w-full max-w-[400px] p-8 relative">
                        <button
                            onClick={() => setShowPrivacy(false)}
                            aria-label="Close"
                            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors rounded-full border border-gray-200 hover:border-gray-300"
                        >
                            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                                <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        </button>

                        <h2 className="font-display text-xl font-bold text-gray-900 mb-4">
                            How we handle data
                        </h2>

                        <div className="space-y-4 text-gray-600">
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
