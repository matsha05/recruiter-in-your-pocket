"use client";

import { Megaphone, Search, Filter, BarChart3, ArrowRight } from "lucide-react";

export function AutomationPipeline() {
    const steps = [
        {
            icon: Megaphone,
            stage: "Sourcing",
            automation: "Ad Delivery",
            risk: "Old ads only shown to certain demographics",
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20"
        },
        {
            icon: Search,
            stage: "Screening",
            automation: "Resume Parsing",
            risk: "Non-standard formats parsed incorrectly",
            color: "text-indigo-500",
            bg: "bg-indigo-500/10",
            border: "border-indigo-500/20"
        },
        {
            icon: Filter,
            stage: "Selection",
            automation: "Ranking Algo",
            risk: "Bias against gaps or 'non-target' schools",
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            border: "border-purple-500/20"
        },
        {
            icon: BarChart3,
            stage: "Interview",
            automation: "Scoring",
            risk: "Standardized questions with biased grading",
            color: "text-rose-500",
            bg: "bg-rose-500/10",
            border: "border-rose-500/20"
        }
    ];

    return (
        <div className="w-full overflow-x-auto py-8 font-sans">
            <div className="min-w-[600px] flex items-stretch gap-2">
                {steps.map((s, i) => (
                    <div key={i} className="flex-1 flex items-center">
                        <div className={`flex-1 flex flex-col h-full rounded-xl border ${s.border} ${s.bg} p-4`}>
                            <div className="flex items-center gap-2 mb-3">
                                <s.icon className={`w-4 h-4 ${s.color}`} />
                                <span className={`text-xs font-bold uppercase tracking-wider ${s.color}`}>{s.stage}</span>
                            </div>
                            <div className="mb-4">
                                <span className="text-sm font-medium text-foreground block">{s.automation}</span>
                            </div>
                            <div className="mt-auto pt-3 border-t border-black/5 dark:border-white/5">
                                <p className="text-[10px] text-muted-foreground leading-snug">
                                    <strong className="block mb-0.5 text-foreground/70">Risk:</strong>
                                    {s.risk}
                                </p>
                            </div>
                        </div>
                        {i < steps.length - 1 && (
                            <ArrowRight className="w-4 h-4 text-muted-foreground/30 mx-2 shrink-0" />
                        )}
                    </div>
                ))}
            </div>
            <p className="text-center text-xs text-muted-foreground mt-4">
                Bias isn't just one step—it compounds at every handover between tools.
            </p>
        </div>
    );
}
