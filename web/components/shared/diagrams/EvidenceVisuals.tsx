import type { ReactNode } from "react";
import { ArrowRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { DiagramHeader } from "@/components/shared/diagrams/DiagramPrimitives";

type EvidenceHeaderProps = {
    index?: string;
    label?: string;
    title: string;
    note?: string;
    className?: string;
};

export function EvidenceHeader({ title, note, className }: EvidenceHeaderProps) {
    // The figure number and source live in the caption, so the header carries only the point.
    return (
        <DiagramHeader className={cn("items-start", className)}>
            <div>
                <h3 className="riyp-evidence-title max-w-[34ch] text-balance text-foreground">{title}</h3>
                {note ? <p className="mt-2 max-w-reading text-sm text-muted-foreground">{note}</p> : null}
            </div>
        </DiagramHeader>
    );
}

export type ProcessStep = {
    label: string;
    title: string;
    detail: string;
    tone?: "context" | "focus" | "risk" | "caution";
};

const toneClasses: Record<NonNullable<ProcessStep["tone"]>, string> = {
    context: "border-line text-muted-foreground",
    focus: "border-brand text-brand",
    risk: "border-brand text-brand",
    caution: "border-foreground/60 text-foreground",
};

export function ProcessRail({ steps, footer }: { steps: ProcessStep[]; footer?: ReactNode }) {
    return (
        <div className="px-5 py-7 md:px-7 md:py-9">
            <ol className="grid gap-0 md:grid-cols-[repeat(var(--process-count),minmax(0,1fr))]" style={{ "--process-count": steps.length } as React.CSSProperties}>
                {steps.map((step, index) => {
                    const tone = step.tone ?? "context";
                    return (
                        <li key={`${step.label}-${step.title}`} className="relative border-l border-line py-5 pl-6 first:pt-0 last:pb-0 md:border-l-0 md:border-t md:px-4 md:pb-0 md:pt-7 md:first:pl-0 md:first:pt-7 md:last:pr-0">
                            <span className={cn("absolute -left-[5px] top-6 size-[9px] border-2 bg-paper md:-top-[5px]", index === 0 ? "md:left-0" : "md:left-4", toneClasses[tone])} aria-hidden="true" />
                            <div className={cn("riyp-evidence-label", toneClasses[tone].split(" ").at(-1))}>{step.label}</div>
                            <div className="mt-2 font-display text-xl font-bold tracking-tight text-foreground">{step.title}</div>
                            <p className="mt-2 text-sm text-muted-foreground">{step.detail}</p>
                            {index < steps.length - 1 ? <ArrowRight className="absolute -right-2 -top-[9px] hidden size-4 bg-paper text-muted-foreground md:block" aria-hidden="true" /> : null}
                        </li>
                    );
                })}
            </ol>
            {footer ? <div className="mt-8 border-t border-line pt-5 text-sm text-muted-foreground">{footer}</div> : null}
        </div>
    );
}

type ComparisonSide = {
    eyebrow: string;
    title: string;
    items: string[];
    tone?: "quiet" | "insight" | "risk" | "complete";
};

const comparisonTone: Record<NonNullable<ComparisonSide["tone"]>, string> = {
    quiet: "bg-paper text-foreground",
    insight: "bg-surface-sky text-foreground",
    risk: "bg-surface-proof text-foreground",
    complete: "bg-surface-proof text-foreground",
};

export function ComparisonField({ left, right, verdict }: { left: ComparisonSide; right: ComparisonSide; verdict?: ReactNode }) {
    return (
        <div>
            <div className="grid md:grid-cols-2">
                {[left, right].map((side, index) => {
                    const tone = side.tone ?? "quiet";
                    return (
                        <section key={side.eyebrow} className={cn("min-h-full px-5 py-7 md:px-7 md:py-9", index === 0 && "border-b border-line md:border-b-0 md:border-r", comparisonTone[tone])}>
                            <div className={cn("riyp-evidence-label", tone === "insight" ? "text-brand" : "text-muted-foreground")}>{side.eyebrow}</div>
                            <h4 className="mt-3 font-display text-heading text-foreground">{side.title}</h4>
                            <ul className="mt-6 divide-y divide-line">
                                {side.items.map((item) => (
                                    <li key={item} className="flex gap-3 py-3 text-sm text-muted-foreground">
                                        <span className={cn("mt-2.5 h-0.5 w-4 shrink-0", tone === "quiet" ? "bg-muted-foreground/50" : "bg-brand")} aria-hidden="true" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    );
                })}
            </div>
            {verdict ? <div className="border-t border-line bg-proof px-5 py-4 text-sm text-muted-foreground md:px-7">{verdict}</div> : null}
        </div>
    );
}

export type TraceStep = {
    label: string;
    title: string;
    detail?: string;
    tone?: "context" | "focus" | "risk" | "caution";
};

export type FrameworkStep = {
    symbol: string;
    label: string;
    detail: string;
    focus?: boolean;
};

export function FrameworkStrip({ steps, connector = "+", example }: { steps: FrameworkStep[]; connector?: string; example?: ReactNode }) {
    return (
        <div className="px-5 py-7 md:px-7 md:py-9">
            <div className="grid gap-4 sm:grid-cols-[repeat(var(--framework-count),minmax(0,1fr))]" style={{ "--framework-count": steps.length } as React.CSSProperties}>
                {steps.map((step, index) => (
                    <div key={step.symbol} className="relative border-t border-line pt-4">
                        <div className={cn("font-display text-headline", step.focus ? "text-brand" : "text-foreground")}>{step.symbol}</div>
                        <div className={cn("riyp-evidence-label mt-4", step.focus ? "text-brand" : "text-muted-foreground")}>{step.label}</div>
                        <p className="mt-2 text-sm text-muted-foreground">{step.detail}</p>
                        {index < steps.length - 1 ? <span className="absolute -right-3 top-4 hidden font-display text-heading text-line sm:block" aria-hidden="true">{connector}</span> : null}
                    </div>
                ))}
            </div>
            {example ? <div className="mt-8 rounded-xl border border-line bg-proof px-5 py-4 text-sm text-muted-foreground">{example}</div> : null}
        </div>
    );
}

type EvidenceTableRow = { label: string; values: ReactNode[]; emphasis?: number };

export function EvidenceTable({ columns, rows }: { columns: string[]; rows: EvidenceTableRow[] }) {
    return (
        <div className="px-5 py-7 md:px-7 md:py-9">
            <table className="riyp-evidence-table w-full border-collapse text-left">
                <thead>
                    <tr className="border-b border-line">
                        {columns.map((column, index) => <th key={column} className={cn("riyp-evidence-label pb-3 pr-5", index === 0 ? "text-muted-foreground" : "text-foreground")}>{column}</th>)}
                    </tr>
                </thead>
                <tbody className="divide-y divide-line">
                    {rows.map((row) => (
                        <tr key={row.label}>
                            <th scope="row" className="py-4 pr-5 text-sm font-medium text-foreground">{row.label}</th>
                            {row.values.map((value, index) => <td key={`${row.label}-${index}`} data-label={columns[index + 1]} className={cn("py-4 pr-5 text-sm tabular-nums", row.emphasis === index ? "font-semibold text-brand" : "text-muted-foreground")}>{value}</td>)}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
