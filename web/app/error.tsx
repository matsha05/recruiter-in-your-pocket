"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
                            <h1 className="max-w-[16ch] font-display text-headline text-foreground">
                                That page didn’t load.
                            </h1>
                            <p className="mt-6 max-w-[38rem] text-lg text-muted-foreground">
                                Something broke on our end, not yours. Saved reports aren’t affected.
                            </p>
                            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                                <Button type="button" onClick={reset}>
                                    <ArrowClockwise className="size-4" weight="bold" />
                                    Try again
                                </Button>
                                <Button asChild variant="secondary">
                                    <Link href="/">
                                    Go to the homepage
                                    <ArrowRight className="size-4" weight="bold" />
                                </Link>
                                </Button>
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
