"use client";

import { OfferArtifact } from "@/lib/types/case";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, TrendingUp, Mail, Phone, ChevronRight } from "lucide-react";

interface NegotiationStrategyProps {
    strategy: NonNullable<OfferArtifact['strategy']>;
}

export function NegotiationStrategy({ strategy }: NegotiationStrategyProps) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* 1. Executive Summary */}
            <div className="grid md:grid-cols-[2fr_1fr] gap-6">
                <Card className="bg-card border-border shadow-sm">
                    <CardHeader>
                        <CardTitle className="font-serif text-xl font-medium">Strategy Executive Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground leading-relaxed">
                            {strategy.strategy_summary}
                        </p>
                    </CardContent>
                </Card>

                <Card className={`border ${strategy.risk_assessment.toLowerCase().includes('high') ? 'bg-destructive/5 border-destructive/20' :
                    strategy.risk_assessment.toLowerCase().includes('medium') ? 'bg-premium/5 border-premium/20' :
                        'bg-success/5 border-success/20'
                    }`}>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                            <ShieldAlert className="w-4 h-4" /> Risk Assessment
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="font-medium text-foreground text-sm leading-tight">
                            {strategy.risk_assessment}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* 2. Levers Checklist */}
            <section className="space-y-4">
                <h3 className="font-serif text-lg font-medium flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-600" /> Key Levers
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {strategy.levers_checklist.map((item, i) => (
                        <div key={i} className="bg-secondary/20 border border-border/50 p-4 rounded-xl space-y-2">
                            <div className="flex justify-between items-start">
                                <span className="font-bold text-foreground">{item.lever}</span>
                                <Badge variant="outline" className="text-xs bg-background">{item.status}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                {item.coach_note}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 3. The Scripts */}
            <section className="space-y-6 pt-4">
                <h3 className="font-serif text-xl font-medium">Your Action Scripts</h3>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Email Script */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                            <Mail className="w-4 h-4" /> Email Template
                        </div>
                        <div className="bg-muted p-6 rounded-xl border border-border font-mono text-sm shadow-inner relative overflow-hidden">
                            {strategy.ask_script.email_subject && (
                                <div className="mb-4 pb-4 border-b border-border/50">
                                    <span className="text-muted-foreground select-none">Subject: </span>
                                    <span className="text-foreground">{strategy.ask_script.email_subject}</span>
                                </div>
                            )}
                            <p className="whitespace-pre-wrap text-foreground/90">
                                {strategy.ask_script.email_body}
                            </p>
                        </div>
                    </div>

                    {/* Phone Script */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                            <Phone className="w-4 h-4" /> Call Talking Points
                        </div>
                        <div className="bg-card border border-border p-6 rounded-xl space-y-4">
                            {strategy.ask_script.call_script_bullets.map((bullet, i) => (
                                <div key={i} className="flex gap-3 items-start">
                                    <ChevronRight className="w-4 h-4 mt-0.5 text-indigo-500 shrink-0" />
                                    <p className="text-sm text-foreground">{bullet}</p>
                                </div>
                            ))}
                        </div>

                        <div className="bg-premium/5 border border-premium/20 p-4 rounded-lg mt-4">
                            <h4 className="text-xs font-bold uppercase text-premium mb-1">Fallback Plan</h4>
                            <p className="text-sm text-foreground/80 leading-relaxed">
                                {strategy.fallback_plan}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}
