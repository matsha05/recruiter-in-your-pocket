import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import { ArrowRight, MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { SiteHeader } from "@/components/layout/SiteHeader";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = {
    title: "Page not found",
    description: "The page you requested could not be found.",
    // Otherwise the layout's "index, follow" sits next to the noindex Next adds for a 404.
    robots: { index: false, follow: true },
};

export default function NotFound() {
    return (
        <div className="min-h-screen bg-paper text-foreground">
            <SiteHeader />
            <main className="px-[var(--marketing-gutter)] pb-16 pt-28 md:pb-24 md:pt-36">
                {/* On the site's column (Nov 11, 2026): the number is a quiet label over the headline, not a column of its own. */}
                <div className="mx-auto max-w-column border-t border-line pt-7">
                    <p className="text-label text-muted-foreground">Page not found (404)</p>
                    <h1 className="mt-4 max-w-[16ch] font-display text-headline text-foreground">
                        We can’t find that page.
                    </h1>
                    <p className="mt-6 max-w-[38rem] text-lg text-muted-foreground">
                        The link may be old, or the address has a typo.
                    </p>
                    <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                        <Button asChild>
                            <Link href="/workspace">
                                Get your free report
                                <ArrowRight className="size-4" weight="bold" />
                            </Link>
                        </Button>
                        <Button asChild variant="secondary">
                            <Link href="/research">
                                <MagnifyingGlass className="size-4" weight="bold" />
                                Read the research
                            </Link>
                        </Button>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
