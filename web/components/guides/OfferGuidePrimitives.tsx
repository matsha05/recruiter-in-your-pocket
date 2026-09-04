import type { ReactNode } from "react";
import { ArrowRight, CaretDown, Check, Info, PaperPlaneTilt } from "@phosphor-icons/react/dist/ssr";

export function GuideEyebrow({ children }: { children: ReactNode }) {
    return <div className="text-xs font-semibold uppercase riyp-track-010 text-ink">{children}</div>;
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
            <div className="grid gap-8 lg:grid-cols-4 lg:gap-12">
                <div className="font-display text-5xl riyp-weight-520 text-ink">{number}</div>
                <div className="lg:col-span-3">
                    <h2 className="max-w-2xl font-display text-4xl riyp-weight-520 leading-none tracking-tight text-foreground riyp-stretch-92 sm:text-5xl">{title}</h2>
                    {intro ? <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">{intro}</p> : null}
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
                    {eyebrow ? <div className="mb-1 text-xs font-semibold uppercase riyp-track-010 text-ink">{eyebrow}</div> : null}
                    <span className="font-display text-xl riyp-weight-560 leading-tight text-foreground">{title}</span>
                </div>
                <span className="flex size-10 shrink-0 items-center justify-center border border-line bg-background transition group-open:rotate-180">
                    <CaretDown aria-hidden className="size-4" weight="bold" />
                </span>
            </summary>
            <div className="pb-7 pr-0 sm:pr-14">{children}</div>
        </details>
    );
}

export function HandoffDiagram() {
    return (
        <div className="relative overflow-hidden border border-border bg-foreground px-5 py-7 text-background sm:px-8 sm:py-9">
            <div className="absolute right-0 top-0 h-full w-24 border-l border-background/10 bg-background/5" />
            <div className="relative grid gap-5 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
                <HandoffNode label="The ask" text="The exact term you want changed" />
                <ArrowRight aria-hidden className="hidden size-5 text-cyan-bright sm:block" weight="bold" />
                <HandoffNode label="The basis" text="The scope, range, or evidence behind it" />
                <ArrowRight aria-hidden className="hidden size-5 text-cyan-bright sm:block" weight="bold" />
                <HandoffNode label="The decision" text="Whether the change would help you accept" />
            </div>
        </div>
    );
}

function HandoffNode({ label, text }: { label: string; text: string }) {
    return (
        <div className="border-l-2 border-cyan-bright pl-4">
            <div className="text-xs font-semibold uppercase riyp-track-010 text-citron">{label}</div>
            <p className="mt-2 text-sm leading-6 text-background/78">{text}</p>
        </div>
    );
}

export function Script({ children, label = "What you can say" }: { children: ReactNode; label?: string }) {
    return (
        <div className="border-l-2 border-brand bg-brand/5 px-5 py-5">
            <div className="text-xs font-semibold uppercase riyp-track-010 text-ink">{label}</div>
            <p className="mt-2 font-display text-xl riyp-weight-500 leading-7 text-foreground">“{children}”</p>
        </div>
    );
}

export function WhatItGives({ children }: { children: ReactNode }) {
    return (
        <div className="mt-4 flex gap-3 text-sm leading-6 text-muted-foreground">
            <PaperPlaneTilt aria-hidden className="mt-1 size-4 shrink-0 text-brand" weight="fill" />
            <p><strong className="font-semibold text-foreground">What this makes clear:</strong> {children}</p>
        </div>
    );
}

export function Checklist({ items }: { items: ReactNode[] }) {
    return (
        <ul className="grid gap-3 sm:grid-cols-2">
            {items.map((item, index) => (
                <li key={index} className="flex gap-3 border-t border-border pt-3 text-sm leading-6 text-muted-foreground">
                    <Check aria-hidden className="mt-1 size-4 shrink-0 text-brand" weight="bold" />
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    );
}

export function TechOfferStack() {
    const rows = [
        ["Guaranteed cash", "Base + any guaranteed sign-on"],
        ["Target cash", "Bonus target, rules, and payout history"],
        ["Equity schedule", "What actually vests in each year"],
        ["Unknowns", "Refreshers, private liquidity, future share price"],
    ];
    return (
        <div className="border border-border bg-foreground p-5 text-background sm:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                    <div className="text-xs font-semibold uppercase riyp-track-010 text-citron">The pay breakdown</div>
                    <div className="mt-2 font-display text-2xl riyp-weight-520">What is guaranteed, and what could change</div>
                </div>
                <Info aria-hidden className="size-6 text-cyan-bright" weight="fill" />
            </div>
            <div className="divide-y divide-background/15 border-y border-background/15">
                {rows.map(([label, text], index) => (
                    <div key={label} className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr] sm:gap-5">
                        <div className="font-mono text-xs text-citron">0{index + 1}</div>
                        <div><strong className="text-sm text-background">{label}</strong><p className="mt-1 text-sm leading-6 text-background/65">{text}</p></div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function Sources({ children }: { children: ReactNode }) {
    return (
        <aside className="mt-16 border-t border-border pt-8 text-sm leading-6 text-muted-foreground">
            <div className="mb-4 text-xs font-semibold uppercase riyp-track-010 text-foreground">Sources and limits</div>
            <div className="max-w-3xl space-y-3 [&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:decoration-brand/40 [&_a]:underline-offset-4 hover:[&_a]:decoration-brand">{children}</div>
        </aside>
    );
}
