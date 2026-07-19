import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function LandingResearchSection() {
    return (
        <section id="research" aria-labelledby="research-title" className="editors-research-section border-b border-[hsl(var(--paper-line))] px-6 py-20 md:px-8 md:py-28">
            <div className="mx-auto grid max-w-[1180px] gap-12 lg:grid-cols-[0.58fr_1.42fr] lg:gap-20">
                <div>
                    <p className="text-[0.625rem] font-bold uppercase tracking-[0.17em] text-teal-800">Research</p>
                    <h2 id="research-title" className="mt-5 max-w-[10ch] font-display text-[clamp(3rem,5.5vw,5.6rem)] riyp-weight-520 leading-[0.92] tracking-[-0.043em] text-slate-950 riyp-stretch-88">
                        The research behind our advice.
                    </h2>
                    <p className="mt-6 max-w-[25rem] text-base leading-7 text-slate-600">
                        We use published studies, documented hiring practices, and recruiter experience. We show what each source supports and where the evidence is limited.
                    </p>
                    <Link href="/research" className="focus-ring group mt-7 inline-flex min-h-11 items-center gap-3 rounded-sm border-b border-teal-800 text-sm font-semibold text-teal-900 transition-colors hover:text-slate-950">
                        Explore the research
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                </div>

                <article className="border-y border-[hsl(var(--paper-line))] text-slate-950" aria-label="Research principle">
                    <header className="grid gap-4 border-b border-[hsl(var(--paper-line))] py-5 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-6">
                        <span className="font-display text-3xl text-slate-300">01</span>
                        <span className="text-[0.625rem] font-bold uppercase tracking-[0.16em] text-slate-500">First-pass attention</span>
                        <span className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-teal-800">What the research supports</span>
                    </header>

                    <div className="grid lg:grid-cols-[1.2fr_0.8fr] lg:divide-x lg:divide-[hsl(var(--paper-line))]">
                        <div className="py-8 lg:pr-10">
                            <blockquote className="relative">
                                <span className="absolute -left-4 top-1 h-20 w-[2px] -rotate-1 bg-[hsl(var(--annotation))] sm:-left-6" aria-hidden="true" />
                                <p className="font-display text-[clamp(1.8rem,3.4vw,3.1rem)] riyp-weight-540 leading-[1.08] tracking-[-0.025em] riyp-stretch-94">
                                    The studies do not show that every recruiter reads a resume the same way or for the same amount of time. They do support making the most important information easy to find.
                                </p>
                            </blockquote>

                            <div className="mt-8 border-t border-[hsl(var(--paper-line))] pt-4 text-xs leading-5 text-slate-500">
                                <p className="font-semibold text-slate-700">TheLadders eye-tracking studies, 2012 and 2018</p>
                                <p>Limited samples; useful for direction, not a universal law.</p>
                            </div>
                        </div>

                        <div className="py-8 lg:pl-10">
                            <div className="text-[0.625rem] font-bold uppercase tracking-[0.16em] text-teal-800">How we use this</div>
                            <dl className="mt-5 divide-y divide-[hsl(var(--paper-line))] border-y border-[hsl(var(--paper-line))]">
                                <div className="py-4"><dt className="text-sm font-semibold text-slate-900">Clear anchors</dt><dd className="mt-1 text-xs leading-5 text-slate-500">Role, scope, and outcomes should be easy to locate.</dd></div>
                                <div className="py-4"><dt className="text-sm font-semibold text-slate-900">Evidence before advice</dt><dd className="mt-1 text-xs leading-5 text-slate-500">The report shows the line before it recommends the fix.</dd></div>
                                <div className="py-4"><dt className="text-sm font-semibold text-slate-900">Clear limits</dt><dd className="mt-1 text-xs leading-5 text-slate-500">The score summarizes the review. It does not estimate hiring odds.</dd></div>
                            </dl>
                            <Link href="/research/how-recruiters-read" className="focus-ring group mt-6 inline-flex min-h-11 items-center gap-2 rounded-sm text-sm font-semibold text-slate-700 transition-colors hover:text-teal-900">
                                Read the evidence note
                                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                        </div>
                    </div>
                </article>
            </div>
        </section>
    );
}
