"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import Footer from "@/components/landing/Footer";
import { LegalNav } from "@/components/legal/LegalNav";

type LegalShellProps = {
    eyebrow: string;
    title: string;
    description: string;
    lastUpdated?: string;
    children: ReactNode;
    contentClassName?: string;
};

export function LegalShell({
    eyebrow,
    title,
    description,
    lastUpdated,
    children,
    contentClassName,
}: LegalShellProps) {
    return (
        <>
            <main className="landing-page">
                <section className="landing-section-pad landing-section-divider landing-section-hero">
                    <div className="landing-rail">
                        <div className="mx-auto max-w-5xl">
                            <LegalNav className="mb-8 md:mb-10" />
                            <header className="mx-auto max-w-3xl text-center">
                                <div className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-label-mono text-muted-foreground dark:border-slate-700 dark:bg-slate-900">
                                    {eyebrow}
                                </div>
                                <h1 className="mt-5 font-display text-4xl leading-[0.98] tracking-tight md:text-[52px]">
                                    {title}
                                </h1>
                                <p className="mx-auto mt-4 max-w-2xl landing-copy">{description}</p>
                                {lastUpdated ? (
                                    <p className="mt-3 text-label-mono text-muted-foreground">Last updated {lastUpdated}</p>
                                ) : null}
                            </header>
                        </div>
                    </div>
                </section>

                <section className="landing-section-pad landing-section landing-section-tight">
                    <div className={cn("landing-rail legal-shell-content legal-flow", contentClassName)}>
                        {children}
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
