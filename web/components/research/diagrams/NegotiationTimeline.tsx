"use client";

import { Download, MessageSquare, Send, ArrowRight, CheckCircle2 } from "lucide-react";

export function NegotiationTimeline() {
    const steps = [
        {
            title: "Offer Delivered",
            icon: Download,
            desc: "You receive the initial numbers.",
            action: "Respond with excitement + ask for time",
        },
        {
            title: "Clarify Package",
            icon: MessageSquare,
            desc: "Understand the constraints first.",
            action: "Ask for band + level + levers",
        },
        {
            title: "Counter Once",
            icon: Send,
            desc: "Don't negotiate piecemeal.",
            action: "Package ask + one sentence why",
        },
        {
            title: "Trade Levers",
            icon: ArrowRight,
            desc: "If base is stuck, move elsewhere.",
            action: "Trade sign-on / equity / start date",
        },
        {
            title: "Close Fast",
            icon: CheckCircle2,
            desc: "Don't shop after agreement.",
            action: "Commit in writing when aligned",
        }
    ];

    return (
        <div className="w-full font-sans my-12 overflow-x-auto pb-4">
            <div className="min-w-[800px] relative">
                {/* Connecting Line */}
                {/* Connecting Line */}
                {/* Connecting Line - Precise 1px */}
                <div className="absolute top-[28px] left-[10%] right-[10%] h-[1px] bg-neutral-200 dark:bg-neutral-800 -z-10" />

                <div className="grid grid-cols-5 gap-0">
                    {steps.map((step, i) => (
                        <div key={i} className="flex flex-col items-center text-center group relative">
                            {/* Dot / Node - Swiss Minimal */}
                            <div className="w-14 h-14 bg-background border border-neutral-200 dark:border-neutral-800 rounded-full flex items-center justify-center mb-6 z-10 group-hover:border-neutral-900 dark:group-hover:border-white transition-colors shadow-sm">
                                <step.icon className="w-5 h-5 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors" strokeWidth={1.5} />
                            </div>

                            {/* Content */}
                            <h4 className="font-serif font-medium text-foreground mb-2 text-sm">{step.title}</h4>
                            <p className="text-[11px] text-muted-foreground mb-4 h-8 leading-snug px-2 max-w-[140px] mx-auto">
                                {step.desc}
                            </p>

                            {/* Action Tag - Pill */}
                            <div className="inline-flex items-center justify-center px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[10px] font-mono font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wide group-hover:border-neutral-400 dark:group-hover:border-neutral-600 transition-colors">
                                {step.action}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
