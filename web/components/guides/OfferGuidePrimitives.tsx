import type { ReactNode } from "react";
import { ArrowRight, CaretDown, Check, Info, PaperPlaneTilt } from "@phosphor-icons/react/dist/ssr";
import styles from "./GuidePresentation";

export function GuideEyebrow({ children }: { children: ReactNode }) {
    return <div className={`${styles.label} text-muted-foreground`}>{children}</div>;
}

export function GuideSection({ number, title, intro, children, id }: {
    number: string;
    title: string;
    intro?: string;
    children: ReactNode;
    id: string;
}) {
    return (
        <section id={id} className="scroll-mt-28 border-t border-border py-12 sm:py-16">
            <div className="grid gap-5 lg:grid-cols-[8rem_minmax(0,1fr)] lg:gap-12">
                <div className={`${styles.label} pt-2 tabular-nums text-brand`}>{number}</div>
                <div className="min-w-0">
                    <h2 className={`${styles.sectionTitle} max-w-3xl`}>{title}</h2>
                    {intro ? <p className={`${styles.readingCopy} mt-5`}>{intro}</p> : null}
                    <div className="mt-8">{children}</div>
                </div>
            </div>
        </section>
    );
}

export function Disclosure({ title, eyebrow, children, defaultOpen = false }: {
    title: string;
    eyebrow?: string;
    children: ReactNode;
    defaultOpen?: boolean;
}) {
    return (
        <details open={defaultOpen || undefined} className="group border-t border-border last:border-b">
            <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4 [&::-webkit-details-marker]:hidden">
                <div>
                    {eyebrow ? <div className={`${styles.label} mb-2 text-muted-foreground`}>{eyebrow}</div> : null}
                    <span className={styles.componentTitle}>{title}</span>
                </div>
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-card transition group-open:rotate-180 motion-reduce:transition-none">
                    <CaretDown aria-hidden className="size-4" weight="bold" />
                </span>
            </summary>
            <div className="pb-7 pr-0 sm:pr-14">{children}</div>
        </details>
    );
}

export function HandoffDiagram() {
    return (
        <div className={`${styles.sheet} relative overflow-hidden px-5 py-7 text-foreground sm:px-8 sm:py-9`}>
            <div className="relative grid gap-5 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
                <HandoffNode label="The ask" text="The exact term you want changed" />
                <ArrowRight aria-hidden className="hidden size-5 text-brand sm:block" weight="bold" />
                <HandoffNode label="The basis" text="The scope, range, or evidence behind it" />
                <ArrowRight aria-hidden className="hidden size-5 text-brand sm:block" weight="bold" />
                <HandoffNode label="The decision" text="Whether the change would help you accept" />
            </div>
        </div>
    );
}

function HandoffNode({ label, text }: { label: string; text: string }) {
    return (
        <div className="border-l-2 border-brand/40 pl-4">
            <div className={`${styles.label} text-brand`}>{label}</div>
            <p className="mt-2 text-data text-muted-foreground">{text}</p>
        </div>
    );
}

export function Script({ children, label = "What you can say" }: { children: ReactNode; label?: string }) {
    return (
        <div className="rounded-xl border border-brand/20 bg-accent px-5 py-5 sm:px-6 sm:py-6">
            <div className={`${styles.label} text-brand`}>{label}</div>
            <p className={`${styles.script} mt-3`}>“{children}”</p>
        </div>
    );
}

export function WhatItGives({ children }: { children: ReactNode }) {
    return (
        <div className={`${styles.readingCopy} mt-4 flex gap-3`}>
            <PaperPlaneTilt aria-hidden className="mt-1 size-4 shrink-0 text-brand" weight="fill" />
            <p><strong className="font-semibold text-foreground">What this makes clear:</strong> {children}</p>
        </div>
    );
}

export function Checklist({ items }: { items: ReactNode[] }) {
    return (
        <ul className="grid gap-3 sm:grid-cols-2">
            {items.map((item, index) => (
                <li key={index} className={`${styles.readingCopy} flex gap-3 border-t border-border pt-4`}>
                    <Check aria-hidden className="mt-1 size-4 shrink-0 text-brand" weight="bold" />
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    );
}

export function TechOfferStack() {
    const rows = [
        ["Base and sign-on", "Salary while employed; sign-on conditions and repayment terms"],
        ["Target cash", "Bonus target, rules, and payout history"],
        ["Equity schedule", "What actually vests in each year"],
        ["Unknowns", "Refreshers, private liquidity, future share price"],
    ];
    return (
        <div className={`${styles.sheet} p-5 text-foreground sm:p-8`}>
            <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                    <div className={`${styles.label} text-brand`}>The pay breakdown</div>
                    <div className={`${styles.componentTitle} mt-2`}>What you receive, and what depends on conditions</div>
                </div>
                <Info aria-hidden className="size-6 shrink-0 text-brand" weight="fill" />
            </div>
            <div className="divide-y divide-border border-y border-border">
                {rows.map(([label, text], index) => (
                    <div key={label} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-4 py-4">
                        <div className={`${styles.label} tabular-nums text-brand`}>0{index + 1}</div>
                        <div><strong className="text-sm font-medium text-foreground">{label}</strong><p className="mt-1 text-data text-muted-foreground">{text}</p></div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function Sources({ children }: { children: ReactNode }) {
    return (
        <aside className="mt-16 border-t border-border pt-8 text-data text-muted-foreground">
            <div className={`${styles.label} mb-4 text-foreground`}>Sources and limits</div>
            <div className="max-w-reading space-y-3 [&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:decoration-brand/40 [&_a]:underline-offset-4 hover:[&_a]:decoration-brand">{children}</div>
        </aside>
    );
}
