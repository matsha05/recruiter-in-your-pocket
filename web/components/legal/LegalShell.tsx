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

/** Lifted Line shell for factual trust and legal surfaces. */
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
            <div data-visual-anchor={pageKey ? `legal-${pageKey}` : undefined} className="bg-paper pt-28 text-foreground selection:bg-brand/15 md:pt-36">
                {/* Hero */}
                <section className="px-5 pb-10 md:px-8 md:pb-14">
                    <div className="mx-auto max-w-[72rem]">
                        <LegalNav className="mb-8 md:mb-10" />
                        <div className="grid gap-5 border-t border-line pt-7 md:grid-cols-[14rem_minmax(0,1fr)] md:gap-12">
                            <p className="text-xs font-semibold uppercase riyp-track-010 text-brand">
                                {eyebrow}
                            </p>
                            <div>
                                <h1
                                    id={pageKey ? `legal-${pageKey}-title` : undefined}
                                    className="max-w-[18ch] text-balance font-display text-[clamp(3rem,6vw,5.4rem)] riyp-weight-520 leading-[0.94] tracking-[-0.045em] text-foreground riyp-stretch-90"
                                >
                                    {title}
                                </h1>
                                <p className="mt-5 max-w-[42rem] text-pretty text-lg leading-8 text-muted-foreground">
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
                    <div className={cn("mx-auto max-w-[48rem] space-y-2", contentClassName)}>
                        {children}
                    </div>
                </section>
            </div>
            <Footer />
        </>
    );
}
