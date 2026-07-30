"use client";

import Link from "next/link";
import { ChartBar, PencilSimpleLine, ShieldCheck, Target, WarningCircle } from "@phosphor-icons/react";
import { LEGAL_LAST_UPDATED } from "@/lib/legal/dataHandling";
import { LegalShell } from "@/components/legal/LegalShell";

const rubric = [
    {
        name: "Story",
        role: "Career context",
        detail: "Does your career path make sense when someone reads it quickly?",
    },
    {
        name: "Impact",
        role: "Results and scope",
        detail: "Do your bullets show real results, numbers, scope, and outcomes, not just responsibilities?",
    },
    {
        name: "Clarity",
        role: "Specificity",
        detail: "Can a recruiter tell what you do, how senior you are, and why you matter without re-reading?",
    },
    {
        name: "Readability",
        role: "Ease of reading",
        detail: "Is the document easy to scan quickly?",
    },
];

export default function MethodologyClient() {
    return (
        <LegalShell
            pageKey="methodology"
            eyebrow="Methodology"
            title="How the resume review works"
            description="The review looks at four parts of your resume. The clarity summary keeps the result easy to scan, while the written findings show what drove it."
            lastUpdated={LEGAL_LAST_UPDATED}
        >
            <section className="border-y border-line bg-surface-sky/35 px-6 py-7 md:px-8 md:py-9">
                <h2 className="mb-3 font-display text-2xl riyp-weight-560 tracking-[-0.025em] text-foreground">
                    What the score means
                </h2>
                <p className="text-[1.0625rem] leading-8 text-muted-foreground">
                    Recruiter in Your Pocket reviews how clearly your resume communicates when someone reads it quickly. The score helps compare the four parts of the review and shows which areas need attention. It does not estimate your chances of getting an interview or offer.
                </p>
            </section>

            {/* Rubric card */}
            <section className="border-t border-line py-7 md:py-9">
                <h2 className="mb-4 flex items-center gap-2 font-display text-2xl riyp-weight-560 tracking-[-0.025em] text-foreground">
                    <ChartBar className="size-5 text-brand" weight="bold" />
                    What the review considers
                </h2>
                <p className="mb-6 text-base leading-7 text-muted-foreground">
                    These dimensions organize the evidence in the report. The overall score is a whole-document judgment, not a mechanical average. When the resume lacks supporting detail, the report names what is missing instead of making an assumption.
                </p>
                <div className="border-y border-line">
                    {rubric.map((item, index) => (
                        <div key={item.name} className="grid gap-3 border-b border-line py-5 last:border-b-0 sm:grid-cols-[3rem_10rem_1fr] sm:items-start">
                            <span className="font-mono text-xs tabular-nums text-brand">0{index + 1}</span>
                            <div>
                                <p className="text-base font-semibold text-foreground">{item.name}</p>
                                <p className="mt-1 text-xs font-semibold uppercase riyp-track-008 text-muted-foreground">{item.role}</p>
                            </div>
                            <p className="text-base leading-7 text-muted-foreground">{item.detail}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Focus and rewrites */}
            <section className="grid border-y border-line md:grid-cols-2">
                <div className="border-b border-line p-6 md:border-b-0 md:border-r md:p-7">
                    <h3 className="mb-2 flex items-center gap-2 text-[15px] font-semibold text-foreground">
                        <Target className="size-4 text-brand" weight="bold" />
                        What the feedback focuses on
                    </h3>
                    <p className="text-[15px] leading-7 text-muted-foreground">
                        We tell you what&apos;s weakening your resume, what to rewrite first, and where your positioning could be stronger.
                    </p>
                </div>
                <div className="border-b border-line p-6 md:p-7">
                    <h3 className="mb-2 flex items-center gap-2 text-[15px] font-semibold text-foreground">
                        <PencilSimpleLine className="size-4 text-brand" weight="bold" />
                        How we write rewrites
                    </h3>
                    <p className="text-[15px] leading-7 text-muted-foreground">
                        Rewrites focus on real results and tighter language, not inflated claims or generic filler.
                    </p>
                </div>
                <div className="border-b border-line p-6 md:border-b-0 md:border-r md:border-t md:p-7">
                    <h3 className="mb-2 flex items-center gap-2 text-[15px] font-semibold text-foreground">
                        <ShieldCheck className="size-4 text-brand" weight="bold" />
                        How we handle uncertainty
                    </h3>
                    <p className="text-[15px] leading-7 text-muted-foreground">
                        The report shows when a finding is less certain because the resume lacks the context needed to support it.
                    </p>
                </div>
                <div className="p-6 md:border-t md:border-line md:p-7">
                    <h3 className="mb-2 flex items-center gap-2 text-[15px] font-semibold text-foreground">
                        <ShieldCheck className="size-4 text-brand" weight="bold" />
                        What evidence means
                    </h3>
                    <p className="text-[15px] leading-7 text-muted-foreground">
                        Evidence excerpts should quote the resume directly. If a recommendation depends on missing context, the report should ask for that detail instead of inventing it.
                    </p>
                </div>
            </section>

            {/* Limits */}
            <section className="border-y border-line bg-proof px-6 py-7">
                <h3 className="mb-3 flex items-center gap-2 text-[15px] font-semibold text-foreground">
                    <WarningCircle className="size-4 text-accent-apricot" weight="fill" />
                    Limits and responsible use
                </h3>
                <ul className="gap-y-2 text-[15px] leading-7 text-muted-foreground">
                    <li>1. The score summarizes this resume review. It does not predict interviews or offers.</li>
                    <li>2. Industry and role context can shift what matters most in any given report.</li>
                    <li>3. Always double-check the rewrites for accuracy and tone before using them.</li>
                    <li>
                        4. For deeper research references, see{" "}
                        <Link href="/research/how-we-score" className="text-foreground underline decoration-brand/45 underline-offset-4 hover:text-brand">
                            the full methodology article
                        </Link>.
                    </li>
                </ul>
            </section>
        </LegalShell>
    );
}
