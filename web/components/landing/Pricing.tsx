"use client";

import { Check } from "lucide-react";
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
        <section className="py-24 px-6 bg-background relative overflow-hidden" id="pricing">
            <div className="max-w-3xl mx-auto relative z-10">

                <div className="text-center mb-16 max-w-2xl mx-auto">
                    <h2 className="font-display text-4xl md:text-5xl text-primary mb-4 leading-tight tracking-tight">
                        Fix it <span className="text-brand italic">before</span> <br />they see it.
                    </h2>
                    <p className="text-memo text-lg text-muted-foreground">
                        Get your free recruiter-grade audit in 60 seconds.
                    </p>
                </div>

                {/* Primary Free CTA */}
                <div className="text-center">
                    <Button variant="brand" size="lg" className="shadow-lg shadow-brand/20" asChild>
                        <Link href="/workspace">
                            Start Your Free Audit →
                        </Link>
                    </Button>
                    <p className="mt-4 text-sm text-muted-foreground">No credit card required</p>
                </div>

                {/* "Need more?" Divider */}
                <div className="mt-16 flex items-center gap-4">
                    <div className="flex-1 h-px bg-border/30" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Need more audits?</span>
                    <div className="flex-1 h-px bg-border/30" />
                </div>

                {/* Paid Tiers - shown after free CTA */}
                <div className="mt-8 grid md:grid-cols-2 gap-6 items-stretch">

                    {/* TIER 1: SINGLE AUDIT - $9 for 1 audit */}
                    <div className="p-8 rounded border border-border/20 bg-card hover:bg-card/80 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md flex flex-col">
                        <div className="mb-6">
                            <div className="text-label text-muted-foreground mb-2">Single Audit</div>
                            <div className="text-4xl font-display font-bold text-foreground">$9</div>
                            <p className="text-sm text-muted-foreground mt-2">One additional audit</p>
                        </div>
                        <ul className="space-y-3 mb-8 text-sm text-muted-foreground font-medium flex-1">
                            <li className="flex items-start gap-3">
                                <Check className="w-4 h-4 mt-0.5 shrink-0" />
                                <span>See exactly what recruiters see</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-4 h-4 mt-0.5 shrink-0" />
                                <span>Copy-paste ready upgrades</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-4 h-4 mt-0.5 shrink-0" />
                                <span>Share with your coach or mentor</span>
                            </li>
                        </ul>
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => handlePurchase("single")}
                        >
                            Buy 1 Audit
                        </Button>
                    </div>

                    {/* TIER 2: JOB SEARCH PACK - $29 for 5 audits - HIGHLIGHTED */}
                    <div className="relative p-8 rounded border-2 border-premium bg-card transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg flex flex-col">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-premium text-white text-[10px] font-bold uppercase tracking-widest py-1 px-3 rounded-sm">
                            Best Value
                        </div>

                        <div className="mb-6">
                            <div className="text-label text-premium mb-2">Job Search Pack</div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-display font-bold text-foreground">$29</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">5 audits — $5.80 each</p>
                        </div>
                        <ul className="space-y-3 mb-8 text-sm text-foreground font-medium flex-1">
                            <li className="flex items-start gap-3">
                                <InsightSparkleIcon className="w-4 h-4 mt-0.5 shrink-0 text-premium" />
                                <span>5 audits for multiple versions</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                                <span>Copy-paste ready upgrades</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                                <span>Share with your coach or mentor</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                                <span>Track improvements across versions</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                                <span>Tailor your resume to specific roles</span>
                            </li>
                        </ul>
                        <Button
                            variant="premium"
                            className="w-full"
                            onClick={() => handlePurchase("pack")}
                        >
                            Buy 5 Audits
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
