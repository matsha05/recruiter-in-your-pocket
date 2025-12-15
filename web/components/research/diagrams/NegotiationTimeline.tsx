"use client";

import { Download, MessageSquare, Send, ArrowRight, CheckCircle2 } from "lucide-react";

export function NegotiationTimeline() {
    const steps = [
        {
            title: "Offer Delivered",
            icon: Download,
            desc: "You receive the initial numbers.",
            action: "Respond with excitement + ask for time",
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20"
        },
        {
            title: "Clarify Package",
            icon: MessageSquare,
            desc: "Understand the constraints first.",
            action: "Ask for band + level + levers",
            color: "text-indigo-500",
            bg: "bg-indigo-500/10",
            border: "border-indigo-500/20"
        },
        {
            title: "Counter Once",
            icon: Send,
            desc: "Don't negotiate piecemeal.",
            action: "Package ask + one sentence why",
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            border: "border-purple-500/20"
        },
        {
            title: "Trade Levers",
            icon: ArrowRight,
            desc: "If base is stuck, move elsewhere.",
            action: "Trade sign-on / equity / start date",
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            border: "border-amber-500/20"
        },
        {
            title: "Close Fast",
            icon: CheckCircle2,
            desc: "Don't shop after agreement.",
            action: "Commit in writing when aligned",
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20"
        }
    ];

    return (
        <div className="w-full font-sans my-12 overflow-x-auto pb-4">
            <div className="min-w-[800px] relative">
                {/* Connecting Line */}
                <div className="absolute top-8 left-10 right-10 h-[2px] bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-emerald-500/20 -z-10" />

                <div className="grid grid-cols-5 gap-4">
                    {steps.map((step, i) => (
                        <div key={i} className="flex flex-col items-center text-center group">
                            {/* Icon Node */}
                            <div className={`w-16 h-16 rounded-2xl ${step.bg} border-2 ${step.border} flex items-center justify-center mb-6 shadow-sm transition-transform group-hover:scale-105 bg-background relative z-10`}>
                                <step.icon className={`w-6 h-6 ${step.color}`} strokeWidth={1.5} />
                            </div>

                            {/* Content */}
                            <h4 className="font-serif font-medium text-foreground mb-2">{step.title}</h4>
                            <p className="text-xs text-muted-foreground mb-3 h-8 leading-snug px-2">{step.desc}</p>

                            {/* Action Tag */}
                            <div className="bg-surface border border-border/50 px-3 py-2 rounded-lg text-[10px] font-medium uppercase tracking-wide text-foreground/80 w-full shadow-sm">
                                {step.action}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
