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

/**
 * LegalShell — Editor's Desk style
 *
 * Warm paper background, clean typography, minimal chrome.
 */
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
            <main className="bg-[#FAFAF8] text-slate-900 selection:bg-teal-700/15 pt-28 md:pt-36">
                {/* Hero */}
                <section className="px-6 pb-8 md:px-8 md:pb-10">
                    <div className="mx-auto max-w-[800px]">
                        <LegalNav className="mb-8 md:mb-10" />
                        <div className="mx-auto max-w-[640px] text-center">
                            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-300">
                                {eyebrow}
                            </p>
                            <h1
                                className="font-display text-slate-900"
                                style={{
                                    fontSize: "clamp(2rem, 5vw, 3.2rem)",
                                    lineHeight: 1.0,
                                    letterSpacing: "-0.03em",
                                    fontWeight: 400,
                                }}
                            >
                                {title}
                            </h1>
                            <p className="mx-auto mt-4 max-w-[480px] text-[16px] leading-[1.7] text-slate-500">
                                {description}
                            </p>
                            {lastUpdated && (
                                <p className="mt-3 text-[11px] text-slate-300">
                                    Last updated {lastUpdated}
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                {/* Content */}
                <section className="px-6 pb-12 md:px-8 md:pb-16">
                    <div className={cn("mx-auto max-w-[720px] space-y-4", contentClassName)}>
                        {children}
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
