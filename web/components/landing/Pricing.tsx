"use client";

import { Check, Crown } from "lucide-react";
import { InsightSparkleIcon } from "@/components/icons";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PricingProps {
    onSelectTier?: (tier: "single" | "monthly") => void;
}

export function Pricing({ onSelectTier }: PricingProps) {
    const handlePurchase = (tier: "single" | "monthly") => {
        if (onSelectTier) {
            onSelectTier(tier);
        } else {
            // Default behavior (if used on landing page)
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
                        One scan shows you what they see. The rest helps you win.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 items-stretch">

                    {/* TIER 1: QUICK FIX - $9 */}
                    <div className="p-8 rounded-md border border-border/10 bg-secondary/10 hover:bg-secondary/20 transition-colors flex flex-col">
                        <div className="mb-6">
                            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Quick Fix</div>
                            <div className="text-4xl font-display font-bold text-foreground">$9</div>
                            <p className="text-sm text-muted-foreground mt-2">One scan. See what recruiters see.</p>
                        </div>
                        <ul className="space-y-4 mb-8 text-sm text-foreground/80 font-medium flex-1">
                            <li className="flex items-start gap-3">
                                <Check className="w-4 h-4 text-foreground mt-0.5 shrink-0" />
                                <span>1 Full Audit + Rewrites</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-4 h-4 text-foreground mt-0.5 shrink-0" />
                                <span>PDF Export</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-4 h-4 text-foreground mt-0.5 shrink-0" />
                                <span>Lifetime access to report</span>
                            </li>
                        </ul>
                        <button
                            onClick={() => handlePurchase("single")}
                            className="w-full py-3 px-4 rounded-md border border-border/10 bg-background font-medium text-sm hover:bg-secondary transition-colors"
                        >
                            Get Quick Fix
                        </button>
                    </div>

                    {/* TIER 2: JOB SEARCH PASS - $29/mo - HIGHLIGHTED */}
                    <div className="relative p-8 rounded-md border-2 border-premium bg-background shadow-[0_0_40px_-10px_rgba(251,191,36,0.15)] flex flex-col">
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-premium to-transparent" />
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-premium text-white text-[10px] font-bold uppercase tracking-widest py-1 px-3 rounded-sm shadow-lg flex items-center gap-1.5">
                            <Crown className="w-3 h-3 fill-white" /> Best Value
                        </div>

                        <div className="mb-6">
                            <div className="text-xs font-bold uppercase tracking-widest text-premium mb-2">Job Search Pass</div>
                            <div className="text-4xl font-display font-bold text-foreground">$29<span className="text-sm font-sans font-medium text-muted-foreground ml-1">/mo</span></div>
                            <p className="text-sm text-muted-foreground mt-2">Unlimited audits for active job seekers.</p>
                        </div>
                        <ul className="space-y-3 mb-8 text-sm text-foreground font-medium flex-1">
                            <Feature text="Unlimited Full Audits" icon={InsightSparkleIcon} accent="gold" />
                            <Feature text="Before & After Rewrites" />
                            <Feature text="PDF Report Export" />
                            <Feature text="Saved Report History" />
                            <Feature text="Job-Specific Calibration" />
                            <Feature text="Priority Analysis Speed" />
                        </ul>
                        <button
                            onClick={() => handlePurchase("monthly")}
                            className="w-full py-3 px-4 rounded-md bg-premium text-white font-medium text-sm hover:opacity-90 transition-all shadow-lg shadow-premium/20 flex items-center justify-center gap-2"
                        >
                            Start Job Search Pass
                        </button>
                    </div>

                </div>

                <div className="mt-8 text-center">
                    <Link href="/workspace" className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 pointer-events-auto">
                        Not ready? Try 1 free scan.
                    </Link>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-xs text-muted-foreground">
                        <strong>100% Satisfaction Guarantee:</strong> If you don't feel more confident, email us within 24h for a full refund.
                    </p>
                </div>

            </div>
        </section>
    );
}

function Feature({ text, icon: Icon = Check, accent }: { text: string; icon?: any; accent?: string }) {
    return (
        <li className="flex items-start gap-3 text-foreground/90">
            <Icon className={cn("w-4 h-4 mt-0.5 shrink-0", accent === "gold" ? "text-premium" : "text-muted-foreground")} />
            <span>{text}</span>
        </li>
    );
}

