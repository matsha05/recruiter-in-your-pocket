"use client";

import { Check, Shield } from "lucide-react";
import { InsightSparkleIcon } from "@/components/icons";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PricingProps {
    onSelectTier?: (tier: "single" | "pack") => void;
}

export function Pricing({ onSelectTier }: PricingProps) {
    const handlePurchase = (tier: "single" | "pack") => {
        if (onSelectTier) {
            onSelectTier(tier);
        } else {
            window.location.href = `/workspace?tier=${tier}`;
        }
    };

    return (
        <section className="py-16 px-6 bg-background relative overflow-hidden" id="pricing">
            <div className="max-w-3xl mx-auto relative z-10">

                <div className="text-center mb-12 max-w-2xl mx-auto">
                    <h2 className="font-display text-4xl md:text-5xl text-primary mb-4 leading-tight tracking-tight animate-in slide-in-from-bottom-4 fade-in duration-700">
                        Fix it before they see it.
                    </h2>
                    <p className="text-memo text-lg text-muted-foreground animate-in slide-in-from-bottom-5 fade-in duration-700 delay-100">
                        Get your free recruiter-grade review in 60 seconds.
                    </p>
                </div>

                {/* Primary Free CTA */}
                <div className="text-center">
                    <Button variant="brand" size="lg" className="shadow-lg shadow-brand/20" asChild>
                        <Link href="/workspace">
                            Run Your Free Review →
                        </Link>
                    </Button>
                    <p className="mt-4 text-sm text-muted-foreground">No credit card required</p>
                </div>

                {/* Social Proof Section */}
                <div className="mt-16 p-6 rounded-lg border border-border/30 bg-muted/20">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Shield className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">Built using real recruiter screening heuristics</span>
                    </div>
                    <div className="flex flex-wrap justify-center gap-6 text-xs text-muted-foreground">
                        <span>✓ Focuses on the first 10 seconds</span>
                        <span>✓ Turns vague bullets into measurable outcomes</span>
                        <span>✓ Copy-paste upgrades, not generic advice</span>
                    </div>
                </div>

                {/* Intent-Framed Divider */}
                <div className="mt-12 flex items-center gap-4">
                    <div className="flex-1 h-px bg-border/30" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">How serious is your job search?</span>
                    <div className="flex-1 h-px bg-border/30" />
                </div>

                {/* Paid Tiers - Intent-Based */}
                <div className="mt-8 grid md:grid-cols-2 gap-4 items-stretch">

                    {/* TIER 1: QUICK CHECK - $9 for 1 review */}
                    <div className="p-6 rounded border border-border/20 bg-card hover:bg-card/80 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md flex flex-col">
                        <div className="mb-6">
                            <div className="text-label text-muted-foreground mb-2">Quick Check</div>
                            <div className="text-4xl font-display font-bold text-foreground">$9</div>
                            <p className="text-sm text-muted-foreground mt-2">Best for first-time feedback</p>
                        </div>
                        <ul className="space-y-3 mb-8 text-sm text-muted-foreground font-medium flex-1">
                            <li className="flex items-start gap-3">
                                <Check className="w-4 h-4 mt-0.5 shrink-0" />
                                <span>Understand what recruiters notice in 10 seconds</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-4 h-4 mt-0.5 shrink-0" />
                                <span>One high-impact fix you can apply today</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-4 h-4 mt-0.5 shrink-0" />
                                <span>Use it to decide what to change next</span>
                            </li>
                        </ul>
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => handlePurchase("single")}
                        >
                            Unlock 1 Full Review
                        </Button>
                    </div>

                    {/* TIER 2: ACTIVE JOB SEARCH - $29 for 5 reviews - HIGHLIGHTED */}
                    <div className="relative p-6 rounded border-2 border-premium bg-card transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg flex flex-col">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-premium text-white text-[10px] font-bold uppercase tracking-widest py-1 px-3 rounded-sm">
                            Recommended
                        </div>

                        <div className="mb-6">
                            <div className="text-label text-premium mb-2">Active Job Search</div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-display font-bold text-foreground">$29</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">For an active job search</p>
                        </div>
                        <ul className="space-y-3 mb-8 text-sm text-foreground font-medium flex-1">
                            <li className="flex items-start gap-3">
                                <InsightSparkleIcon className="w-4 h-4 mt-0.5 shrink-0 text-premium" />
                                <span>Tailor versions for different roles and job postings</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                                <span>Unlock full rewrites and missing wins</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                                <span>Compare progress across versions</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                                <span>Export a clean PDF when you're ready to apply</span>
                            </li>
                        </ul>
                        <Button
                            variant="premium"
                            className="w-full"
                            onClick={() => handlePurchase("pack")}
                        >
                            Start Job Search Mode
                        </Button>
                    </div>

                </div>

                <div className="mt-12 text-center">
                    <p className="text-xs text-muted-foreground">
                        <strong>100% Satisfaction Guarantee:</strong> Not happy? Email us within 24h for a full refund.
                    </p>
                </div>

            </div>
        </section>
    );
}
