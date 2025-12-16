"use client";

import { Check, CheckCircle2, Crown } from "lucide-react";
import { InsightSparkleIcon } from "@/components/icons";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PricingProps {
    onSelectTier?: (tier: "24h" | "30d" | "90d") => void;
}

export function Pricing({ onSelectTier }: PricingProps) {
    const handlePurchase = (tier: "24h" | "30d" | "90d") => {
        if (onSelectTier) {
            onSelectTier(tier);
        } else {
            // Default behavior (if used on landing page)
            // Redirect to workspace setting or signup with intent
            window.location.href = `/workspace?tier=${tier}`;
        }
    };

    return (
        <section className="py-24 px-6 bg-background relative overflow-hidden" id="pricing">
            <div className="max-w-5xl mx-auto relative z-10">

                <div className="text-center mb-16 max-w-2xl mx-auto">
                    <h2 className="font-display text-4xl md:text-5xl text-primary mb-4 leading-tight tracking-tight">
                        Know <span className="text-brand italic">before</span> <br /> you apply.
                    </h2>
                    <p className="text-memo text-lg text-muted-foreground">
                        One scan shows you what they see. The rest helps you win.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 items-center">

                    {/* TIER 1: SINGLE (The Quick Fix) - $19 */}
                    <div className="p-8 rounded-md border border-border/10 bg-secondary/10 hover:bg-secondary/20 transition-colors h-min">
                        <div className="mb-6">
                            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Single Scan</div>
                            <div className="text-3xl font-display font-bold text-foreground">$19</div>
                            <p className="text-sm text-muted-foreground mt-2">One-time deep dive.</p>
                        </div>
                        <ul className="space-y-4 mb-8 text-sm text-foreground/80 font-medium">
                            <li className="flex items-start gap-3">
                                <Check className="w-4 h-4 text-foreground mt-0.5 shrink-0" />
                                <span>1 Full Audit + Fixes</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-4 h-4 text-foreground mt-0.5 shrink-0" />
                                <span>PDF Export included</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-4 h-4 text-foreground mt-0.5 shrink-0" />
                                <span>Lifetime access to report</span>
                            </li>
                        </ul>
                        <button
                            onClick={() => handlePurchase("24h")}
                            className="w-full py-3 px-4 rounded-md border border-border/10 bg-background font-medium text-sm hover:bg-secondary transition-colors"
                        >
                            Get Single Pass
                        </button>
                    </div>

                    {/* TIER 2: MONTHLY (The Career Move) - $39 - HIGHLIGHTED */}
                    <div className="relative p-8 rounded-md border-2 border-premium bg-background shadow-[0_0_40px_-10px_rgba(251,191,36,0.15)] scale-105 z-10">
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-premium to-transparent" />
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-premium text-white text-[10px] font-bold uppercase tracking-widest py-1 px-3 rounded-sm shadow-lg flex items-center gap-1.5">
                            <Crown className="w-3 h-3 fill-white" /> Best Value
                        </div>

                        <div className="mb-6">
                            <div className="text-xs font-bold uppercase tracking-widest text-premium mb-2">Pro Membership</div>
                            <div className="text-4xl font-display font-bold text-foreground">$39<span className="text-sm font-sans font-medium text-muted-foreground ml-1">/mo</span></div>
                            <p className="text-sm text-muted-foreground mt-2">The complete toolkit.</p>
                        </div>
                        <ul className="space-y-4 mb-8 text-sm text-foreground font-medium">
                            <Feature text="Unlimited Full Audits" icon={InsightSparkleIcon} accent="gold" />
                            <Feature text="Offer Negotiation Guide" />
                            <Feature text="Version History" />
                            <Feature text="Smart Bullet Rewriter" />
                        </ul>
                        <button
                            onClick={() => handlePurchase("30d")}
                            className="w-full py-3 px-4 rounded-md bg-premium text-white font-medium text-sm hover:opacity-90 transition-all shadow-lg shadow-premium/20 flex items-center justify-center gap-2"
                        >
                            Start Pro Access
                        </button>
                    </div>

                    {/* TIER 3: QUARTERLY (The Executive) - $79 */}
                    <div className="p-8 rounded-md border border-border/10 bg-secondary/10 hover:bg-secondary/20 transition-colors h-min">
                        <div className="mb-6">
                            <div className="text-xs font-bold uppercase tracking-widest text-slate mb-2">Executive</div>
                            <div className="text-3xl font-display font-bold text-foreground">$79<span className="text-sm font-sans font-medium text-muted-foreground ml-1">/qtr</span></div>
                            <p className="text-sm text-muted-foreground mt-2">For high-stakes searches.</p>
                        </div>
                        <ul className="space-y-4 mb-8 text-sm text-foreground/80 font-medium">
                            <li className="flex items-start gap-3">
                                <Check className="w-4 h-4 text-slate mt-0.5 shrink-0" />
                                <span>Includes <strong>Pro Features</strong></span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-4 h-4 text-slate mt-0.5 shrink-0" />
                                <span>LinkedIn Audit Guide</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-4 h-4 text-slate mt-0.5 shrink-0" />
                                <span>Cover Letter Architect</span>
                            </li>
                        </ul>
                        <button
                            onClick={() => handlePurchase("90d")} // Maps to new tier
                            className="w-full py-3 px-4 rounded-md border border-slate/20 bg-slate/5 text-slate font-medium text-sm hover:bg-slate/10 transition-colors"
                        >
                            Get Executive
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

function Feature({ text, icon: Icon = CheckCircle2, accent }: { text: string; icon?: any; accent?: string }) {
    return (
        <li className="flex items-start gap-3 text-foreground/90">
            <Icon className={cn("w-4 h-4 mt-0.5 shrink-0", accent === "gold" ? "text-premium" : "text-foreground/40")} />
            <span>{text}</span>
        </li>
    );
}
