"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowClockwise, ArrowRight, WarningCircle } from "@phosphor-icons/react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import Footer from "@/components/landing/Footer";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Application error:", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-paper text-foreground">
            <SiteHeader />
            <main className="px-5 pb-16 pt-28 md:px-8 md:pb-24 md:pt-36">
                <div className="mx-auto max-w-[72rem] border-t border-line pt-7">
                    <div className="grid gap-10 md:grid-cols-[13rem_minmax(0,1fr)] md:gap-12">
                        <div>
                            <p className="text-xs font-semibold uppercase riyp-track-010 text-brand">Unexpected error</p>
                            <WarningCircle className="mt-7 size-12 text-cyan-bright" weight="regular" aria-hidden="true" />
                        </div>
                        <div className="max-w-[46rem]">
                            <h1 className="exception-page-title font-display riyp-weight-620 text-foreground riyp-stretch-91">
                                That did not go as expected.
                            </h1>
                            <p className="mt-6 max-w-[38rem] text-lg leading-8 text-muted-foreground">
                                Your work is still here. Try the page again, or return to the studio and continue from there.
                            </p>
                            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={reset}
                                    className="focus-ring inline-flex min-h-13 items-center justify-center gap-3 rounded-md bg-foreground px-6 py-3 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
                                >
                                    <ArrowClockwise className="size-4" weight="bold" />
                                    Try this page again
                                </button>
                                <Link
                                    href="/workspace"
                                    className="focus-ring inline-flex min-h-13 items-center justify-center gap-3 rounded-md border border-foreground bg-paper px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-paper-muted"
                                >
                                    Return to the studio
                                    <ArrowRight className="size-4 text-citron" weight="bold" />
                                </Link>
                            </div>
                            {error.digest ? (
                                <p className="mt-9 border-t border-line pt-4 font-mono text-xs text-muted-foreground">
                                    Error reference {error.digest}
                                </p>
                            ) : null}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
