import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { SiteHeader } from "@/components/layout/SiteHeader";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = {
    title: "Page Not Found",
    description: "The page you requested could not be found.",
};

export default function NotFound() {
    return (
        <div className="min-h-screen bg-paper text-foreground">
            <SiteHeader />
            <main className="px-5 pb-16 pt-28 md:px-8 md:pb-24 md:pt-36">
                <div className="mx-auto max-w-[72rem] border-t border-line pt-7">
                    <div className="grid gap-10 md:grid-cols-[13rem_minmax(0,1fr)] md:gap-12">
                        <div>
                            <p className="text-xs font-semibold uppercase riyp-track-010 text-brand">Page not found</p>
                            <p className="mt-6 font-display text-[5rem] riyp-weight-520 leading-none tracking-[-0.06em] text-cyan-bright" aria-hidden="true">404</p>
                        </div>
                        <div className="max-w-[46rem]">
                            <h1 className="exception-page-title font-display riyp-weight-620 text-foreground riyp-stretch-91">
                                This page is not here.
                            </h1>
                            <p className="mt-6 max-w-[38rem] text-lg leading-8 text-muted-foreground">
                                The address may have changed. Start a first read, or browse the research behind the report.
                            </p>
                            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                                <Link
                                    href="/workspace"
                                    className="focus-ring inline-flex min-h-13 items-center justify-center gap-3 rounded-md bg-foreground px-6 py-3 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
                                >
                                    See my first read
                                    <ArrowRight className="size-4 text-citron" weight="bold" />
                                </Link>
                                <Link
                                    href="/research"
                                    className="focus-ring inline-flex min-h-13 items-center justify-center gap-3 rounded-md border border-foreground bg-paper px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-paper-muted"
                                >
                                    <MagnifyingGlass className="size-4" weight="bold" />
                                    Browse research
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
