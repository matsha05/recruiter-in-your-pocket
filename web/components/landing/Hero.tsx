"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../providers/AuthProvider";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

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
        <section className="relative w-full py-24 md:py-32 lg:py-40 overflow-hidden">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/5 blur-[100px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-premium-accent/5 blur-[120px] rounded-full" />
            </div>

            <div className="container relative z-10 mx-auto px-6">
                <div className="grid gap-16 lg:grid-cols-[1.1fr_1fr] items-center">
                    {/* Left Column: Copy */}
                    <div className="flex flex-col items-start max-w-2xl">
                        {!user && (
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-eyebrow mb-6 text-premium-accent"
                            >
                                Recruiter-grade insight
                            </motion.p>
                        )}

                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
                            className="text-display text-5xl md:text-7xl mb-6 text-primary tracking-tighter"
                        >
                            {headline}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-body-pro text-lg md:text-xl mb-8 max-w-lg text-muted-foreground"
                        >
                            {subheadline}
                        </motion.p>

                        {!user && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="flex items-center gap-4 mb-8 p-4 bg-card border border-border/50 rounded-xl"
                            >
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-xl font-semibold text-primary">
                                    M
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-foreground">
                                        Built by a recruiter who&apos;s reviewed 10,000+ resumes
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Ex-Meta, Ex-Google recruiting • 8 years in tech hiring
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex flex-wrap items-center gap-4"
                        >
                            <Link href="/workspace">
                                <Button size="lg" className="h-12 px-8 text-base">
                                    {user ? "Continue in Workspace →" : "See How Recruiters Read You →"}
                                </Button>
                            </Link>
                            {!user && (
                                <button
                                    onClick={() => setShowPrivacy(true)}
                                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors px-4 py-2"
                                >
                                    Private & Secure →
                                </button>
                            )}
                        </motion.div>
                    </div>

                    {/* Right Column: Visual Evidence (Sample Report Card) */}
                    <div className="relative">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, rotate: 1 }}
                            animate={{ opacity: 1, scale: 1, rotate: -1 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                            className="relative bg-card border border-border/50 shadow-2xl rounded-2xl p-6 md:p-8 max-w-md mx-auto rotate-[-2deg] hover:rotate-[0deg] transition-transform duration-500 ease-out"
                        >
                            {/* Card Header */}
                            <div className="flex items-start justify-between mb-8">
                                <div>
                                    <p className="text-eyebrow text-muted-foreground mb-1">Recruiter Signal</p>
                                    <h3 className="text-lg font-semibold tracking-tight">Tech Product Manager</h3>
                                </div>
                                <div className="text-right">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold text-lg shadow-inner">
                                        86
                                    </div>
                                </div>
                            </div>

                            {/* Quote */}
                            <div className="mb-8 relative">
                                <span className="absolute -left-2 top-0 text-4xl text-premium-accent/20 font-serif leading-none">&ldquo;</span>
                                <p className="font-serif italic text-lg leading-relaxed text-foreground/90 pl-4 border-l-2 border-premium-accent/30">
                                    You read as someone who takes messy workstreams and makes them shippable. Your edge is steady ownership.
                                </p>
                            </div>

                            {/* Metrics Grid */}
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="bg-muted/50 p-3 rounded-lg border border-border/50">
                                    <div className="text-xs text-muted-foreground font-medium mb-1">Impact</div>
                                    <div className="text-sm font-semibold text-status-success">High Signal</div>
                                </div>
                                <div className="bg-muted/50 p-3 rounded-lg border border-border/50">
                                    <div className="text-xs text-muted-foreground font-medium mb-1">Clarity</div>
                                    <div className="text-sm font-semibold text-foreground">Strong</div>
                                </div>
                            </div>

                            {/* Action */}
                            <div className="pt-4 border-t border-border/40">
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>Based on 1,000+ hires</span>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-status-success" />
                                        <span>Verified</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Glow behind card */}
                        <div className="absolute inset-0 bg-primary/5 blur-2xl -z-10 transform translate-y-4 scale-95" />
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
                            <X className="w-4 h-4" strokeWidth={2} />
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
