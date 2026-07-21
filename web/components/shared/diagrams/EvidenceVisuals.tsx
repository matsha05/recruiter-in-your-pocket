import type { ReactNode } from "react";
import { ArrowRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { DiagramHeader } from "@/components/shared/diagrams/DiagramPrimitives";

type EvidenceHeaderProps = {
    index?: string;
    label: string;
    title: string;
    note?: string;
    className?: string;
};

export function EvidenceHeader({ index = "01", label, title, note, className }: EvidenceHeaderProps) {
    return (
        <DiagramHeader className={cn("items-start", className)}>
            <div>
                <div className="riyp-evidence-label text-brand">{label}</div>
                <h3 className="riyp-evidence-title mt-3 max-w-[22ch] text-foreground">{title}</h3>
                {note ? <p className="mt-3 max-w-[42rem] text-sm leading-6 text-muted-foreground">{note}</p> : null}
            </div>
            <span className="text-[0.625rem] font-semibold tracking-[0.14em] text-muted-foreground tabular-nums">FIG {index}</span>
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
    caution: "border-citron text-foreground",
};

export function ProcessRail({ steps, footer }: { steps: ProcessStep[]; footer?: ReactNode }) {
    return (
        <div className="px-5 py-7 md:px-7 md:py-9">
            <ol className="grid gap-0 md:grid-cols-[repeat(var(--process-count),minmax(0,1fr))]" style={{ "--process-count": steps.length } as React.CSSProperties}>
                {steps.map((step, index) => {
                    const tone = step.tone ?? "context";
                    return (
                        <li key={`${step.label}-${step.title}`} className="relative border-l border-line py-5 pl-6 first:pt-0 last:pb-0 md:border-l-0 md:border-t md:px-4 md:pb-0 md:pt-7 md:first:pl-0 md:last:pr-0">
                            <span className={cn("absolute -left-[5px] top-6 size-[9px] border-2 bg-paper md:-top-[5px] md:left-4 md:first:left-0", toneClasses[tone])} aria-hidden="true" />
                            <div className={cn("riyp-evidence-label", toneClasses[tone].split(" ").at(-1))}>{step.label}</div>
                            <div className="mt-2 font-display text-xl riyp-weight-560 leading-tight tracking-tight text-foreground riyp-stretch-98">{step.title}</div>
                            <p className="mt-2 text-xs leading-5 text-muted-foreground">{step.detail}</p>
                            {index < steps.length - 1 ? <ArrowRight className="absolute -right-2 -top-[9px] hidden size-4 bg-paper text-muted-foreground md:block" aria-hidden="true" /> : null}
                        </li>
                    );
                })}
            </ol>
            {footer ? <div className="mt-8 border-t border-line pt-5 text-sm leading-6 text-muted-foreground">{footer}</div> : null}
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
    complete: "bg-citron/20 text-foreground",
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
                            <h4 className="mt-3 font-display text-3xl riyp-weight-560 leading-[0.98] tracking-tight text-foreground riyp-stretch-96">{side.title}</h4>
                            <ul className="mt-6 divide-y divide-line">
                                {side.items.map((item) => (
                                    <li key={item} className="flex gap-3 py-3 text-sm leading-6 text-muted-foreground">
                                        <span className={cn("mt-[0.7rem] h-0.5 w-4 shrink-0", tone === "complete" ? "bg-citron" : "bg-cyan-bright")} aria-hidden="true" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    );
                })}
            </div>
            {verdict ? <div className="border-t border-line bg-proof px-5 py-4 text-sm leading-6 text-muted-foreground md:px-7">{verdict}</div> : null}
        </div>
    );
}

export type TraceStep = {
    label: string;
    title: string;
    detail?: string;
    tone?: "context" | "focus" | "risk" | "caution";
};

export function SequenceTrace({ steps, direction = "down" }: { steps: TraceStep[]; direction?: "down" | "up" }) {
    const ordered = direction === "up" ? [...steps].reverse() : steps;
    return (
        <ol className="px-5 py-7 md:px-7 md:py-9">
            {ordered.map((step, index) => {
                const tone = step.tone ?? "context";
                return (
                    <li key={`${step.label}-${step.title}`} className="grid grid-cols-[2.5rem_1fr] gap-4 md:grid-cols-[3rem_0.72fr_1.28fr] md:gap-6">
                        <div className="relative flex justify-center">
                            {index < ordered.length - 1 ? <span className="absolute bottom-0 top-8 w-px bg-line" aria-hidden="true" /> : null}
                            <span className={cn("relative z-10 flex size-8 items-center justify-center border bg-paper text-[0.65rem] font-bold tabular-nums", toneClasses[tone])}>{String(index + 1).padStart(2, "0")}</span>
                        </div>
                        <div className="pb-7 md:pb-8">
                            <div className={cn("riyp-evidence-label", toneClasses[tone].split(" ").at(-1))}>{step.label}</div>
                            <div className="mt-1 font-display text-xl riyp-weight-560 leading-tight tracking-tight text-foreground riyp-stretch-98">{step.title}</div>
                        </div>
                        {step.detail ? <p className="col-start-2 -mt-5 pb-7 text-sm leading-6 text-muted-foreground md:col-start-3 md:mt-0 md:pb-8">{step.detail}</p> : null}
                    </li>
                );
            })}
        </ol>
    );
}

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
                        <div className={cn("font-display text-5xl riyp-weight-540 leading-none tracking-tight", step.focus ? "text-brand" : "text-foreground")}>{step.symbol}</div>
                        <div className={cn("riyp-evidence-label mt-4", step.focus ? "text-brand" : "text-muted-foreground")}>{step.label}</div>
                        <p className="mt-2 text-xs leading-5 text-muted-foreground">{step.detail}</p>
                        {index < steps.length - 1 ? <span className="absolute -right-3 top-4 hidden font-display text-2xl text-line sm:block" aria-hidden="true">{connector}</span> : null}
                    </div>
                ))}
            </div>
            {example ? <div className="mt-8 border-l-2 border-cyan-bright bg-proof px-5 py-4 text-sm leading-6 text-muted-foreground">{example}</div> : null}
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
                        {columns.map((column, index) => <th key={column} className={cn("pb-3 text-[0.625rem] font-bold uppercase tracking-[0.14em]", index === 0 ? "text-muted-foreground" : "text-foreground")}>{column}</th>)}
                    </tr>
                </thead>
                <tbody className="divide-y divide-line">
                    {rows.map((row) => (
                        <tr key={row.label}>
                            <th scope="row" className="py-4 pr-5 text-sm font-medium text-foreground">{row.label}</th>
                            {row.values.map((value, index) => <td key={`${row.label}-${index}`} data-label={columns[index + 1]} className={cn("py-4 pr-5 text-sm", row.emphasis === index ? "font-semibold text-brand" : "text-muted-foreground")}>{value}</td>)}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
