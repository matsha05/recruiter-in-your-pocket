"use client";

import { motion } from "framer-motion";

/**
 * Comp Stack Diagram - Simplified visual for offer guides
 * 
 * Shows how total comp is built from different components
 * Animated stacked bar with labels
 */
export function CompStackDiagram() {
    const components = [
        { name: "Base Salary", width: 40, color: "bg-slate-600", label: "40%" },
        { name: "Equity", width: 35, color: "bg-emerald-500", label: "35%" },
        { name: "Bonus", width: 15, color: "bg-amber-500", label: "15%" },
        { name: "Sign-on", width: 10, color: "bg-violet-500", label: "10%" },
    ];

    return (
        <figure className="w-full max-w-2xl mx-auto my-10 select-none">
            <motion.div
                className="relative bg-white dark:bg-card border border-border/40 rounded-xl overflow-hidden shadow-lg shadow-slate-200/30 dark:shadow-none"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                viewport={{ once: true }}
            >
                <div className="px-6 py-4 border-b border-border/30">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">
                        Tech Total Comp Breakdown
                    </span>
                </div>

                <div className="p-6 md:p-8 space-y-6">
                    {/* Stacked bar */}
                    <div className="h-16 rounded-xl overflow-hidden flex shadow-inner">
                        {components.map((comp, i) => (
                            <motion.div
                                key={comp.name}
                                className={`${comp.color} flex items-center justify-center relative`}
                                style={{ width: `${comp.width}%` }}
                                initial={{ width: 0 }}
                                whileInView={{ width: `${comp.width}%` }}
                                transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 + i * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <span className="text-white text-sm font-bold">{comp.label}</span>
                            </motion.div>
                        ))}
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap gap-6">
                        {components.map((comp) => (
                            <div key={comp.name} className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded ${comp.color}`} />
                                <span className="text-sm text-muted-foreground">{comp.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
            <figcaption className="mt-4 text-sm text-muted-foreground text-center">
                Senior engineer total comp at a large tech company
            </figcaption>
        </figure>
    );
}

/**
 * Negotiation Timeline Diagram
 * 
 * Shows the sequence of negotiation steps - clean horizontal flow
 */
export function NegotiationTimelineDiagram() {
    const steps = [
        { step: "1", label: "Get Offer", desc: "Collect info only" },
        { step: "2", label: "Ask for Time", desc: "48 hours minimum" },
        { step: "3", label: "Research", desc: "Know the bands" },
        { step: "4", label: "Counter", desc: "Total comp focus" },
        { step: "5", label: "Close", desc: "Be committal" },
    ];

    return (
        <figure className="w-full max-w-3xl mx-auto my-10 select-none">
            <motion.div
                className="relative bg-white dark:bg-card border border-border/40 rounded-xl overflow-hidden shadow-lg shadow-slate-200/30 dark:shadow-none"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                viewport={{ once: true }}
            >
                <div className="px-6 py-4 border-b border-border/30">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">
                        The Negotiation Sequence
                    </span>
                </div>

                <div className="p-6 md:p-8">
                    {/* Desktop: Horizontal */}
                    <div className="hidden md:block">
                        <div className="flex items-start justify-between relative">
                            {/* Connection line */}
                            <div className="absolute top-7 left-10 right-10 h-0.5 bg-gradient-to-r from-brand/30 via-brand to-brand/30" />

                            {steps.map((step, i) => (
                                <motion.div
                                    key={step.step}
                                    className="relative flex flex-col items-center text-center z-10 flex-1"
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                                    viewport={{ once: true }}
                                >
                                    <div className="w-14 h-14 rounded-full bg-white dark:bg-card border-2 border-brand flex items-center justify-center mb-3 shadow-md shadow-brand/10">
                                        <span className="text-lg font-bold text-brand">{step.step}</span>
                                    </div>
                                    <span className="text-sm font-medium text-foreground mb-1">{step.label}</span>
                                    <span className="text-xs text-muted-foreground">{step.desc}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Mobile: Vertical */}
                    <div className="md:hidden space-y-6">
                        {steps.map((step, i) => (
                            <motion.div
                                key={step.step}
                                className="flex items-start gap-4"
                                initial={{ opacity: 0, x: -10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: i * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <div className="w-10 h-10 rounded-full bg-brand/20 border-2 border-brand flex items-center justify-center shrink-0">
                                    <span className="text-sm font-bold text-brand">{step.step}</span>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-foreground block">{step.label}</span>
                                    <span className="text-xs text-muted-foreground">{step.desc}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </figure>
    );
}

/**
 * Lever Comparison Diagram
 * 
 * Shows which levers are available in different industries
 */
export function LeverComparisonDiagram() {
    const industries = [
        {
            name: "Tech",
            levers: ["Base", "Equity", "Signing Bonus", "Level"],
            color: "violet"
        },
        {
            name: "Finance",
            levers: ["Base", "Performance Bonus", "Guaranteed Bonus", "Title"],
            color: "amber"
        },
        {
            name: "Healthcare",
            levers: ["Base", "PTO", "Loan Repayment", "CME Budget"],
            color: "emerald"
        },
        {
            name: "Other",
            levers: ["Base", "Signing Bonus", "Flexibility", "Title"],
            color: "slate"
        },
    ];

    const colorMap: Record<string, { bg: string; border: string; text: string }> = {
        violet: { bg: "bg-violet-500/10", border: "border-violet-500/30", text: "text-violet-600" },
        amber: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-600" },
        emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-600" },
        slate: { bg: "bg-slate-500/10", border: "border-slate-500/30", text: "text-slate-600" },
    };

    return (
        <figure className="w-full max-w-3xl mx-auto my-10 select-none">
            <motion.div
                className="relative bg-white dark:bg-card border border-border/40 rounded-xl overflow-hidden shadow-lg shadow-slate-200/30 dark:shadow-none"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                viewport={{ once: true }}
            >
                <div className="px-6 py-4 border-b border-border/30">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">
                        Negotiation Levers by Industry
                    </span>
                </div>

                <div className="p-6 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {industries.map((industry, i) => {
                        const colors = colorMap[industry.color];
                        return (
                            <motion.div
                                key={industry.name}
                                className={`p-5 rounded-xl border ${colors.bg} ${colors.border}`}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <span className={`text-base font-semibold ${colors.text} block mb-3`}>
                                    {industry.name}
                                </span>
                                <ul className="space-y-1.5">
                                    {industry.levers.map((lever) => (
                                        <li key={lever} className="text-sm text-muted-foreground">
                                            • {lever}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>
            <figcaption className="mt-4 text-sm text-muted-foreground text-center">
                Different industries have different compensation levers
            </figcaption>
        </figure>
    );
}
