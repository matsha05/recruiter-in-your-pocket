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
                            <WarningCircle className="size-12 text-brand" weight="regular" aria-hidden="true" />
                        </div>
                        <div className="max-w-[46rem]">
                            <h1 className="exception-page-title font-display riyp-weight-620 text-foreground riyp-stretch-91">
                                That page didn’t load.
                            </h1>
                            <p className="mt-6 max-w-[38rem] text-lg leading-8 text-muted-foreground">
                                Something broke on our end, not yours. Try again, or start over from the homepage. Saved reports aren’t affected.
                            </p>
                            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={reset}
                                    className="focus-ring inline-flex min-h-13 items-center justify-center gap-3 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
                                >
                                    <ArrowClockwise className="size-4" weight="bold" />
                                    Try again
                                </button>
                                <Link
                                    href="/"
                                    className="focus-ring inline-flex min-h-13 items-center justify-center gap-3 rounded-full border border-foreground bg-paper px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-paper-muted"
                                >
                                    Go to the homepage
                                    <ArrowRight className="size-4" weight="bold" />
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
