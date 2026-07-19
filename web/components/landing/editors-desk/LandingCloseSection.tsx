import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PocketMark } from "@/components/icons";

export function LandingCloseSection() {
    return (
        <section aria-labelledby="landing-close-title" className="border-y border-slate-800 bg-ink-deep px-6 py-20 text-[hsl(var(--cream))] md:px-8 md:py-28">
            <div className="mx-auto grid max-w-[1100px] items-end gap-10 md:grid-cols-[1fr_auto] md:gap-16">
                <div>
                    <div className="mb-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-[hsl(var(--teal-bright))]">
                        <PocketMark className="size-4" />
                        Before you apply
                    </div>
                    <h2 id="landing-close-title" className="editors-close-title max-w-[780px] font-display text-[hsl(var(--cream))]">
                        Let&apos;s make the good stuff easy to spot.
                    </h2>
                    <p className="mt-7 max-w-[560px] text-lg leading-8 text-slate-300">
                        Your first report is free. No card, no account, and absolutely no made-up heroics.
                    </p>
                </div>
                <Link href="/workspace" className="focus-ring group inline-flex min-h-14 w-fit items-center gap-3 rounded-md bg-[hsl(var(--cream))] px-7 py-4 text-base font-semibold text-ink transition-colors hover:bg-white">
                    See my first read
                    <ArrowRight className="size-[18px] transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
            </div>
        </section>
    );
}
