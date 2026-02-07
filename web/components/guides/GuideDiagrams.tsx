"use client";

import { motion } from "framer-motion";
import {
    DiagramBulletList,
    DiagramFigure,
    DiagramFrame,
    DiagramHeader,
} from "@/components/shared/diagrams/DiagramPrimitives";

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
        <DiagramFigure className="max-w-2xl">
            <DiagramFrame
                className="relative border border-border/40 rounded-xl overflow-hidden shadow-lg shadow-slate-200/30 dark:shadow-none"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                viewport={{ once: true }}
            >
                <DiagramHeader label="Tech Total Comp Breakdown" />

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
            </DiagramFrame>
            <figcaption className="mt-4 text-sm text-muted-foreground text-center">
                Senior engineer total comp at a large tech company
            </figcaption>
        </DiagramFigure>
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
        <DiagramFigure className="max-w-3xl">
            <DiagramFrame
                className="relative border border-border/40 rounded-xl overflow-hidden shadow-lg shadow-slate-200/30 dark:shadow-none"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                viewport={{ once: true }}
            >
                <DiagramHeader label="The Negotiation Sequence" />

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
            </DiagramFrame>
        </DiagramFigure>
    );
}

/**
 * Lever Comparison Diagram
 * 
 * Shows common negotiation levers by industry
 */
export function LeverComparisonDiagram() {
    const industries = [
        {
            name: "Tech",
            summary: "Comp is usually base, equity, and sign-on; level placement sets the pay band.",
            levers: ["Base", "Equity", "Sign-on", "Level"],
            color: "violet",
        },
        {
            name: "Finance",
            summary: "Bonus structure often drives total comp more than base alone.",
            levers: ["Base", "Performance bonus", "Guaranteed bonus", "Title"],
            color: "amber",
        },
        {
            name: "Healthcare",
            summary: "Schedule and support terms can move real value quickly.",
            levers: ["Base", "PTO", "Loan repayment", "CME budget"],
            color: "emerald",
        },
        {
            name: "Other",
            summary: "Flexibility and role scope are often the practical levers.",
            levers: ["Base", "Sign-on", "Flexibility", "Title"],
            color: "slate",
        },
    ];

    const colorMap: Record<string, { bg: string; border: string; text: string }> = {
        violet: {
            bg: "bg-violet-500/[0.09]",
            border: "border-violet-500/30",
            text: "text-violet-600 dark:text-violet-300",
        },
        amber: {
            bg: "bg-amber-500/[0.09]",
            border: "border-amber-500/35",
            text: "text-amber-700 dark:text-amber-300",
        },
        emerald: {
            bg: "bg-emerald-500/[0.09]",
            border: "border-emerald-500/30",
            text: "text-emerald-700 dark:text-emerald-300",
        },
        slate: {
            bg: "bg-slate-500/[0.1]",
            border: "border-slate-500/30",
            text: "text-slate-700 dark:text-slate-300",
        },
    };

    return (
        <DiagramFigure className="max-w-5xl">
            <DiagramFrame
                className="relative border border-border/40 rounded-xl overflow-hidden shadow-lg shadow-slate-200/30 dark:shadow-none"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                viewport={{ once: true }}
            >
                <DiagramHeader label="Negotiation Levers by Industry" />

                <div className="px-6 pt-5 text-sm text-muted-foreground md:px-8">
                    Different industries use different compensation structures, but the negotiation process is the same.
                </div>

                <div className="p-6 pt-4 md:p-8 md:pt-5 grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-4 md:gap-6">
                    {industries.map((industry, i) => {
                        const colors = colorMap[industry.color];
                        return (
                            <motion.div
                                key={industry.name}
                                className={`rounded-xl border ${colors.bg} ${colors.border} p-4 md:p-5`}
                                initial={{ opacity: 0, y: 8 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.1 + i * 0.08 }}
                                viewport={{ once: true }}
                            >
                                <p className={`text-base font-semibold ${colors.text}`}>{industry.name}</p>
                                <p className="mt-2 min-h-[3rem] text-sm leading-relaxed text-muted-foreground">{industry.summary}</p>
                                <div className="my-3 h-px bg-border/40" />
                                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/75">Common levers</p>
                                <DiagramBulletList items={industry.levers} className="mt-2" />
                            </motion.div>
                        );
                    })}
                </div>
            </DiagramFrame>
            <figcaption className="mt-4 text-sm text-muted-foreground text-center">
                Different industries emphasize different compensation levers.
            </figcaption>
        </DiagramFigure>
    );
}

/**
 * Equity Truth Table
 * 
 * RSU vs Options comparison for tech offers
 */
export function EquityTruthTable() {
    const rows = [
        {
            factor: "What you get",
            rsu: "Actual shares of stock",
            options: "Right to buy shares at a frozen price"
        },
        {
            factor: "Value on grant",
            rsu: "Known (stock price × shares)",
            options: "Unknown (depends on future price minus strike)"
        },
        {
            factor: "If you leave",
            rsu: "Keep all vested shares",
            options: "Must exercise within 90 days or lose them"
        },
        {
            factor: "Tax timing",
            rsu: "Taxed when shares vest (as income)",
            options: "Taxed when you exercise (can be complex)"
        },
        {
            factor: "Best for",
            rsu: "Public companies, lower risk",
            options: "Early startups, high risk tolerance"
        }
    ];

    const redFlags = [
        "5-year vesting (vs 4-year standard)",
        "\"We're growing 10x so your options are worth millions\" (BS — investors already priced in growth)",
        "No info on total shares outstanding (impossible to value your %)",
        "Options with a high strike price close to current valuation"
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
                        RSUs vs Stock Options
                    </span>
                </div>

                <div className="p-6 md:p-8">
                    {/* Comparison table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border/30">
                                    <th className="text-left py-3 pr-4 font-medium text-muted-foreground"></th>
                                    <th className="text-left py-3 px-4 font-semibold text-emerald-600 bg-emerald-500/5 rounded-tl-lg">RSUs</th>
                                    <th className="text-left py-3 px-4 font-semibold text-violet-600 bg-violet-500/5 rounded-tr-lg">Options</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, i) => (
                                    <motion.tr
                                        key={row.factor}
                                        className="border-b border-border/20"
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}
                                        viewport={{ once: true }}
                                    >
                                        <td className="py-3 pr-4 text-foreground font-medium">{row.factor}</td>
                                        <td className="py-3 px-4 text-muted-foreground bg-emerald-500/5">{row.rsu}</td>
                                        <td className="py-3 px-4 text-muted-foreground bg-violet-500/5">{row.options}</td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Red flags */}
                    <div className="mt-8 p-4 rounded-lg bg-rose-500/5 border border-rose-500/20">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-rose-600 mb-3">
                            🚩 Red Flags in Equity Offers
                        </div>
                        <ul className="space-y-2">
                            {redFlags.map((flag, i) => (
                                <motion.li
                                    key={i}
                                    className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground"
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }}
                                    viewport={{ once: true }}
                                >
                                    <span aria-hidden className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-rose-600/70" />
                                    <span>{flag}</span>
                                </motion.li>
                            ))}
                        </ul>
                    </div>
                </div>
            </motion.div>
            <figcaption className="mt-4 text-sm text-muted-foreground text-center">
                Public companies typically offer RSUs. Private companies offer options.
            </figcaption>
        </figure>
    );
}
