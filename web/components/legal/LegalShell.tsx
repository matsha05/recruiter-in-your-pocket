"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import Footer from "@/components/landing/Footer";
import { LegalNav } from "@/components/legal/LegalNav";

type LegalShellProps = {
    pageKey?: string;
    eyebrow: string;
    title: string;
    description: string;
    lastUpdated?: string;
    children: ReactNode;
    contentClassName?: string;
};

/** Shared reading layout for factual trust and legal surfaces. */
export function LegalShell({
    pageKey,
    eyebrow,
    title,
    description,
    lastUpdated,
    children,
    contentClassName,
}: LegalShellProps) {
    return (
        <>
            <div data-visual-anchor={pageKey ? `legal-${pageKey}` : undefined} className="bg-background pt-28 text-foreground selection:bg-brand/15 md:pt-36">
                {/* Hero */}
                <section className="px-5 pb-10 md:px-8 md:pb-14">
                    <div className="mx-auto max-w-report">
                        <LegalNav className="mb-10 md:mb-14" />
                        <div className="mx-auto max-w-form">
                            <p className="mb-4 text-label uppercase tracking-wider text-muted-foreground">
                                {eyebrow}
                            </p>
                            <div>
                                <h1
                                    id={pageKey ? `legal-${pageKey}-title` : undefined}
                                    className="max-w-xl text-balance font-display text-workspace-title text-foreground md:text-page-title"
                                >
                                    {title}
                                </h1>
                                <p className="mt-5 max-w-reading text-pretty text-prose text-muted-foreground">
                                    {description}
                                </p>
                                {lastUpdated && (
                                    <p className="mt-4 text-xs font-medium text-muted-foreground">
                                        Last updated {lastUpdated}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Content */}
                <section className="px-5 pb-16 md:px-8 md:pb-24">
                    <div className={cn("mx-auto max-w-form space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm [overflow-wrap:anywhere] sm:p-6 md:rounded-3xl md:p-8", contentClassName)}>
                        {children}
                    </div>
                </section>
            </div>
            <Footer />
        </>
    );
}
