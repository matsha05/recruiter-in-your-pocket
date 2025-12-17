"use client";

import { Check, Crown } from "lucide-react";
import { InsightSparkleIcon } from "@/components/icons";
import Link from "next/link";
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
        <section className="py-24 px-6 bg-background relative overflow-hidden" id="pricing">
            <div className="max-w-3xl mx-auto relative z-10">

                <div className="text-center mb-16 max-w-2xl mx-auto">
                    <h2 className="font-display text-4xl md:text-5xl text-primary mb-4 leading-tight tracking-tight">
                        Know <span className="text-brand italic">before</span> <br /> you apply.
                    </h2>
                    <p className="text-memo text-lg text-muted-foreground">
                        Your first audit is free. Need more? Buy credits.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 items-stretch">

                    {/* TIER 1: QUICK FIX - $9 for 1 audit */}
                    <div className="p-8 rounded-md border border-border/10 bg-secondary/10 hover:bg-secondary/20 transition-colors flex flex-col">
                        <div className="mb-6">
                            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Quick Fix</div>
                            <div className="text-4xl font-display font-bold text-foreground">$9</div>
                            <p className="text-sm text-muted-foreground mt-2">1 additional audit</p>
                        </div>
                        <ul className="space-y-3 mb-8 text-sm text-muted-foreground font-medium flex-1">
                            <li className="flex items-start gap-3">
                                <Check className="w-4 h-4 mt-0.5 shrink-0" />
                                <span>Full recruiter-grade audit</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-4 h-4 mt-0.5 shrink-0" />
                                <span>Before & after rewrites</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-4 h-4 mt-0.5 shrink-0" />
                                <span>PDF export</span>
                            </li>
                        </ul>
                        <button
                            onClick={() => handlePurchase("single")}
                            className="w-full py-3 px-4 rounded-md border border-border/10 bg-background font-medium text-sm hover:bg-secondary transition-colors"
                        >
                            Buy 1 Audit
                        </button>
                    </div>

                    {/* TIER 2: JOB SEARCH PACK - $29 for 5 audits - HIGHLIGHTED */}
                    <div className="relative p-8 rounded-md border-2 border-premium bg-background shadow-[0_0_40px_-10px_rgba(251,191,36,0.15)] flex flex-col">
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-premium to-transparent" />
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-premium text-white text-[10px] font-bold uppercase tracking-widest py-1 px-3 rounded-sm shadow-lg flex items-center gap-1.5">
                            <Crown className="w-3 h-3 fill-white" /> Best Value
                        </div>

                        <div className="mb-6">
                            <div className="text-xs font-bold uppercase tracking-widest text-premium mb-2">Job Search Pack</div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-display font-bold text-foreground">$29</span>
                                <span className="text-sm text-muted-foreground line-through">$45</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">5 audits — $5.80 each</p>
                        </div>
                        <ul className="space-y-3 mb-8 text-sm text-foreground font-medium flex-1">
                            <li className="flex items-start gap-3">
                                <InsightSparkleIcon className="w-4 h-4 mt-0.5 shrink-0 text-premium" />
                                <span>5 full audits</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                                <span>Before & after rewrites</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                                <span>PDF export</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                                <span>Saved report history</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                                <span>Job description targeting</span>
                            </li>
                        </ul>
                        <button
                            onClick={() => handlePurchase("pack")}
                            className="w-full py-3 px-4 rounded-md bg-premium text-white font-medium text-sm hover:opacity-90 transition-all shadow-lg shadow-premium/20"
                        >
                            Buy 5 Audits
                        </button>
                    </div>

                </div>

                <div className="mt-8 text-center">
                    <Link href="/workspace" className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4">
                        Your first audit is free →
                    </Link>
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
