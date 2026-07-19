"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, LockKeyhole } from "lucide-react";
import { PocketMark } from "@/components/icons";
import { cn } from "@/lib/utils";

const firstReadSteps = [
    {
        id: "resume",
        label: "Resume line",
        eyebrow: "What the resume says",
        verdict: "The work sounds relevant. The scale is still hard to see.",
        detail: "“Led” signals ownership, but it leaves the team, the work, and the result up to the reader.",
        signal: "Relevant experience",
        question: "How much did they own?",
    },
    {
        id: "read",
        label: "Likely impression",
        eyebrow: "What a recruiter may wonder",
        verdict: "I can see leadership. I can’t see the size of it.",
        detail: "The fastest improvement is not a stronger adjective. It is one concrete detail about scope or outcome.",
        signal: "Leadership",
        question: "Team, decision, or result?",
    },
    {
        id: "stronger",
        label: "Stronger version",
        eyebrow: "After one useful edit",
        verdict: "Now the ownership and the result are easy to find.",
        detail: "The rewrite adds the functions involved and the measurable change. Nothing new was invented.",
        signal: "Cross-functional ownership",
        question: "32% faster onboarding",
    },
] as const;

function FirstReadDemo() {
    const [activeStep, setActiveStep] = useState(0);

    const step = firstReadSteps[activeStep];

    return (
        <div className="riyp-first-read-shell overflow-hidden border border-slate-300 bg-paper" aria-label="Interactive example of a recruiter first read">
            <div className="flex flex-col gap-4 border-b border-slate-300 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                    <span className="flex size-8 items-center justify-center border border-slate-400 text-ink">
                        <PocketMark className="size-4" />
                    </span>
                    <div>
                        <p className="text-sm font-semibold text-slate-950">Example first read</p>
                        <p className="text-xs text-slate-500">Operations leader · one resume line</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-1" role="tablist" aria-label="First read stages">
                    {firstReadSteps.map((item, index) => (
                        <button
                            key={item.id}
                            type="button"
                            role="tab"
                            aria-selected={index === activeStep}
                            onClick={() => {
                                setActiveStep(index);
                            }}
                            className={cn(
                                "riyp-demo-tab-label focus-ring min-h-11 border-b-2 px-2 py-2 text-left font-semibold transition-colors sm:min-w-28 sm:px-3",
                                index === activeStep
                                    ? "border-teal-800 text-slate-950"
                                    : "border-transparent text-slate-500 hover:text-slate-800"
                            )}
                        >
                            <span className="mr-1 tabular-nums text-slate-400">0{index + 1}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid lg:grid-cols-[1.16fr_0.84fr]">
                <div className="min-h-[26rem] bg-paper px-5 py-7 sm:px-9 sm:py-10 lg:min-h-[31rem] lg:px-12 lg:py-12">
                    <div className="max-w-2xl">
                        <div className="flex items-start justify-between gap-6 border-b border-slate-300 pb-7">
                            <div>
                                <p className="text-lg font-[560] text-slate-950">Jordan Lee</p>
                                <p className="riyp-track-011 mt-1 text-xs font-semibold uppercase text-slate-500">Operations leader</p>
                            </div>
                            <p className="text-right text-xs leading-5 text-slate-500">Experience<br />2021—Present</p>
                        </div>

                        <p className="riyp-track-011 mt-9 text-xs font-semibold uppercase text-teal-800">LaunchCo · Director of operations</p>
                        <div className="mt-5 border-l-2 border-slate-300 pl-5 sm:pl-7">
                            <p className="riyp-demo-resume-line max-w-[28ch] font-[520] text-slate-950">
                                {activeStep === 2 ? (
                                    <>
                                        Led onboarding redesign across <span className="riyp-first-read-emphasis">product, sales, and support</span>, cutting handoff time <span className="riyp-first-read-emphasis">32%</span>.
                                    </>
                                ) : (
                                    <>
                                        <span className={cn(activeStep === 1 && "riyp-first-read-emphasis")}>Led</span> strategic initiatives across multiple cross-functional teams.
                                    </>
                                )}
                            </p>
                        </div>

                        <div className="mt-10 grid gap-3 border-t border-slate-300 pt-5 text-xs leading-5 text-slate-500 sm:grid-cols-3">
                            <span>Clear action</span>
                            <span className={cn(activeStep >= 1 ? "text-slate-950" : "text-slate-400")}>Scope named</span>
                            <span className={cn(activeStep === 2 ? "font-semibold text-teal-900" : "text-slate-400")}>Result visible</span>
                        </div>
                    </div>
                </div>

                <aside className="relative flex min-h-[24rem] flex-col justify-between overflow-hidden bg-ink-deep px-5 py-7 text-white sm:px-8 sm:py-10 lg:min-h-[31rem] lg:px-10 lg:py-12" aria-live="polite">
                    <div key={step.id} className="riyp-first-read-enter">
                        <p className="riyp-track-013 text-xs font-semibold uppercase text-teal-300">{step.eyebrow}</p>
                        <p className="riyp-demo-insight mt-6 max-w-[17ch] font-[520] text-white">
                            {step.verdict}
                        </p>
                        <p className="mt-6 max-w-md text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">{step.detail}</p>
                    </div>

                    <dl className="mt-10 grid grid-cols-2 gap-4 border-t border-slate-700 pt-5 text-xs">
                        <div>
                            <dt className="text-slate-500">What lands</dt>
                            <dd className="mt-2 font-semibold leading-5 text-teal-200">{step.signal}</dd>
                        </div>
                        <div>
                            <dt className="text-slate-500">What needs context</dt>
                            <dd className="mt-2 font-semibold leading-5 text-white">{step.question}</dd>
                        </div>
                    </dl>
                </aside>
            </div>
        </div>
    );
}

export function LandingHeroSection() {
    return (
        <section
            aria-labelledby="landing-home-title"
            className="overflow-hidden border-b border-slate-300 bg-mineral px-5 pb-16 pt-28 sm:px-6 md:px-8 md:pb-20 md:pt-32 lg:pb-24"
        >
            <div className="mx-auto max-w-[82rem]">
                <div className="grid gap-8 border-b border-slate-300 pb-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(22rem,0.56fr)] lg:items-end lg:gap-16 lg:pb-12">
                    <div>
                        <div className="riyp-track-013 flex items-center gap-3 text-xs font-semibold uppercase text-teal-800">
                            <PocketMark className="size-4" />
                            Recruiter feedback, before you apply
                        </div>
                        <h1
                            id="landing-home-title"
                            className="riyp-product-hero-title mt-6 max-w-[11ch] font-[540] text-slate-950"
                        >
                            See what a recruiter sees first.
                        </h1>
                    </div>

                    <div className="lg:pb-1">
                        <p className="max-w-xl text-lg leading-8 text-slate-700">
                            Upload your resume. We’ll show what lands, what gets lost, and the first change worth making.
                        </p>
                        <div className="mt-7 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                            <Link
                                href="/workspace"
                                className="focus-ring group inline-flex min-h-[3.25rem] items-center justify-center gap-5 rounded-sm bg-ink px-6 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                            >
                                See my first read
                                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                            </Link>
                            <Link
                                href="/workspace?sample=1"
                                className="focus-ring inline-flex min-h-11 items-center border-b border-slate-500 text-sm font-semibold text-slate-800 transition-colors hover:border-teal-800 hover:text-teal-900"
                            >
                                Open a sample report
                            </Link>
                        </div>
                        <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs leading-5 text-slate-600">
                            <LockKeyhole className="size-3.5 text-teal-800" />
                            <span>First report free</span>
                            <span aria-hidden="true">·</span>
                            <span>No account required</span>
                        </p>
                    </div>
                </div>

                <div className="mt-8 sm:mt-10">
                    <FirstReadDemo />
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs leading-5 text-slate-600">
                    <p>Based only on the resume—not guesses about you.</p>
                    <p className="flex items-center gap-2 font-semibold text-slate-800"><Check className="size-3.5 text-teal-800" /> No invented metrics. No rewritten history.</p>
                </div>
            </div>
        </section>
    );
}
