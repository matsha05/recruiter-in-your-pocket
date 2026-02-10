"use client";

import Link from "next/link";
import { AlertTriangle, BarChart3, PenSquare, Target } from "lucide-react";
import { LEGAL_LAST_UPDATED } from "@/lib/legal/dataHandling";
import { LegalShell } from "@/components/legal/LegalShell";

/** Paper shadow matching all Editor's Desk cards */
const paperShadow =
    "0 0 0 1px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)";

const rubric = [
    {
        name: "Story",
        weight: "35%",
        detail: "Does your career path make sense when someone reads it quickly?",
    },
    {
        name: "Impact",
        weight: "30%",
        detail: "Do your bullets show real results — numbers, scope, outcomes — not just responsibilities?",
    },
    {
        name: "Clarity",
        weight: "20%",
        detail: "Can a recruiter tell what you do, how senior you are, and why you matter — without re-reading?",
    },
    {
        name: "Readability",
        weight: "15%",
        detail: "Is the document easy to scan quickly?",
    },
];

export default function MethodologyClient() {
    return (
        <LegalShell
            eyebrow="Methodology"
            title="How we score your resume"
            description="What each score measures, how we handle uncertainty, and what the output is actually for."
            lastUpdated={LEGAL_LAST_UPDATED}
        >
            {/* Rubric card */}
            <section
                className="rounded-2xl bg-white p-6 md:p-8"
                style={{ boxShadow: paperShadow }}
            >
                <h2 className="mb-4 flex items-center gap-2 font-display text-slate-900" style={{ fontSize: "1.15rem", fontWeight: 500, letterSpacing: "-0.01em" }}>
                    <BarChart3 className="h-4 w-4 text-slate-400" />
                    7.4-second signal rubric
                </h2>
                <div className="space-y-3">
                    {rubric.map((item) => (
                        <div key={item.name} className="rounded-lg border border-slate-100 bg-slate-50/50 px-4 py-3">
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-semibold text-slate-700">{item.name}</p>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">{item.weight}</p>
                            </div>
                            <p className="mt-1.5 text-[14px] leading-[1.65] text-slate-500">{item.detail}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Focus and rewrites */}
            <section className="grid gap-4 md:grid-cols-2">
                <div
                    className="rounded-2xl bg-white p-6"
                    style={{ boxShadow: paperShadow }}
                >
                    <h3 className="mb-2 flex items-center gap-2 text-[15px] font-semibold text-slate-700">
                        <Target className="h-4 w-4 text-slate-400" />
                        What the feedback focuses on
                    </h3>
                    <p className="text-[14px] leading-[1.65] text-slate-500">
                        We tell you what&apos;s weakening your resume, what to rewrite first, and where your positioning could be stronger.
                    </p>
                </div>
                <div
                    className="rounded-2xl bg-white p-6"
                    style={{ boxShadow: paperShadow }}
                >
                    <h3 className="mb-2 flex items-center gap-2 text-[15px] font-semibold text-slate-700">
                        <PenSquare className="h-4 w-4 text-slate-400" />
                        How we write rewrites
                    </h3>
                    <p className="text-[14px] leading-[1.65] text-slate-500">
                        Rewrites focus on real results and tighter language — not inflated claims or generic filler.
                    </p>
                </div>
            </section>

            {/* Limits */}
            <section
                className="rounded-2xl border border-slate-100 p-6"
                style={{ backgroundColor: "hsl(40 20% 97%)" }}
            >
                <h3 className="mb-3 flex items-center gap-2 text-[15px] font-semibold text-slate-700">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    Limits and responsible use
                </h3>
                <ul className="space-y-2 text-[14px] leading-[1.65] text-slate-500">
                    <li>1. Scores estimate how strong your resume signal is — they don&apos;t guarantee interviews or offers.</li>
                    <li>2. Industry and role context can shift what matters most in any given review.</li>
                    <li>3. Always double-check the rewrites for accuracy and tone before using them.</li>
                    <li>
                        4. For deeper research references, see{" "}
                        <Link href="/research/how-we-score" className="text-slate-700 underline underline-offset-4 hover:text-slate-900">
                            the full methodology article
                        </Link>.
                    </li>
                </ul>
            </section>
        </LegalShell>
    );
}
