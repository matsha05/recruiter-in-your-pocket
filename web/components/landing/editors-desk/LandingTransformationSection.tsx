import { ArrowDownRight } from "lucide-react";

const missingDetails = ["What you owned", "How big it was", "What changed"] as const;

export function LandingTransformationSection() {
    return (
        <section aria-labelledby="transformation-title" className="border-b border-slate-300 bg-paper px-6 py-20 text-ink md:px-8 md:py-28">
            <div className="mx-auto max-w-[1180px]">
                <div className="mx-auto max-w-[860px] text-center">
                    <p className="font-mono text-xs font-semibold uppercase riyp-track-016 text-teal-800">The difference</p>
                    <h2 id="transformation-title" className="mt-5 font-display riyp-display-section-xl riyp-weight-520 riyp-leading-094 riyp-track-n045 text-ink riyp-stretch-88 [text-wrap:balance]">
                        The line sounds polished. It still says almost nothing.
                    </h2>
                    <p className="mx-auto mt-6 max-w-[42rem] text-lg leading-8 text-slate-600">
                        The review shows the gap between the sentence you wrote and the evidence a recruiter can actually use.
                    </p>
                </div>

                <div className="mt-14 grid border-y riyp-border-paper-line lg:grid-cols-2 lg:divide-x lg:divide-[hsl(var(--paper-line))]">
                    <div className="border-b riyp-border-paper-line px-2 py-8 sm:px-8 sm:py-10 lg:border-b-0 lg:pr-12">
                        <span className="font-mono riyp-type-11px font-semibold uppercase riyp-track-014 text-slate-500">Original</span>
                        <p className="mt-7 max-w-[30rem] font-display riyp-display-rewrite riyp-leading-108 riyp-track-n025 text-slate-900">
                            Led strategic initiatives across multiple cross-functional teams.
                        </p>
                        <div className="mt-8 border-t riyp-border-paper-line pt-5">
                            <p className="riyp-type-0625 font-bold uppercase riyp-track-015 text-slate-500">What the sentence leaves open</p>
                            <ul aria-label="Details missing from the original line" className="mt-4 space-y-2.5">
                                {missingDetails.map((detail) => (
                                    <li key={detail} className="flex items-center gap-3 text-sm text-slate-600">
                                        <span className="riyp-text-annotation">×</span>
                                        {detail}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="relative px-2 py-8 sm:px-8 sm:py-10 lg:pl-12">
                        <div className="flex items-center justify-between gap-4">
                            <span className="font-mono riyp-type-11px font-semibold uppercase riyp-track-014 text-teal-800">Stronger when verified</span>
                            <ArrowDownRight aria-hidden="true" className="size-5 text-teal-800" />
                        </div>
                        <p className="mt-7 max-w-[34rem] font-display riyp-display-rewrite riyp-leading-108 riyp-track-n025 text-slate-950">
                            Cut onboarding time <span className="riyp-text-annotation underline decoration-2 underline-offset-8">32%</span> by aligning product, sales, and support.
                        </p>
                        <dl className="mt-8 border-t riyp-border-paper-line pt-5">
                            <div className="grid grid-cols-[7.5rem_1fr] gap-4 py-2 text-sm">
                                <dt className="font-bold uppercase riyp-track-008 riyp-text-annotation">Your role</dt>
                                <dd className="text-slate-600">Aligned three teams</dd>
                            </div>
                            <div className="grid grid-cols-[7.5rem_1fr] gap-4 py-2 text-sm">
                                <dt className="font-bold uppercase riyp-track-008 riyp-text-annotation">The result</dt>
                                <dd className="text-slate-600">Onboarding took 32% less time</dd>
                            </div>
                            <div className="grid grid-cols-[7.5rem_1fr] gap-4 py-2 text-sm">
                                <dt className="font-bold uppercase riyp-track-008 riyp-text-annotation">Source</dt>
                                <dd className="text-slate-600">Facts supplied by the candidate</dd>
                            </div>
                        </dl>
                    </div>
                </div>

                <p className="mx-auto mt-9 max-w-[52rem] text-center font-display text-2xl leading-9 text-slate-800">
                    Don&apos;t add a number because a tool asked. Add the detail you can stand behind.
                </p>
            </div>
        </section>
    );
}
