"use client";

import Link from "next/link";
import { AlertTriangle, BarChart3, PenSquare, Target } from "lucide-react";
import { LEGAL_LAST_UPDATED } from "@/lib/legal/dataHandling";
import { LegalShell } from "@/components/legal/LegalShell";

const rubric = [
    {
        name: "Story",
        weight: "35%",
        detail: "Does your trajectory read as a coherent candidate narrative for the target role?",
    },
    {
        name: "Impact",
        weight: "30%",
        detail: "Do bullets prove business outcomes with concrete evidence (scope, numbers, results)?",
    },
    {
        name: "Clarity",
        weight: "20%",
        detail: "Can recruiters parse role, seniority, and value without re-reading?",
    },
    {
        name: "Readability",
        weight: "15%",
        detail: "Is the document scan-friendly in first-pass review time?",
    },
];

export default function MethodologyClient() {
    return (
        <LegalShell
            eyebrow="Methodology"
            title="How the scoring model works"
            description="What each score measures, how confidence is handled, and what the output should be used for."
            lastUpdated={LEGAL_LAST_UPDATED}
        >
            <section className="landing-card landing-card-pad">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <BarChart3 className="h-4 w-4 text-brand" />
                    7.4-second signal rubric
                </h2>
                <div className="space-y-3">
                    {rubric.map((item) => (
                        <div key={item.name} className="rounded-lg border border-border/40 bg-background/60 px-4 py-3">
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-semibold text-foreground">{item.name}</p>
                                <p className="text-label-mono text-brand">{item.weight}</p>
                            </div>
                            <p className="mt-1.5 landing-copy-muted">{item.detail}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
                <div className="landing-card landing-card-pad">
                    <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Target className="h-4 w-4 text-brand" />
                        Output intent
                    </h3>
                    <p className="landing-copy-muted">
                        Feedback is action-oriented: what hurts signal, what to rewrite first, and where role-fit is weak.
                    </p>
                </div>
                <div className="landing-card landing-card-pad">
                    <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                        <PenSquare className="h-4 w-4 text-brand" />
                        Rewrite quality bar
                    </h3>
                    <p className="landing-copy-muted">
                        Rewrites prioritize verifiable outcomes and tighter language over inflated or generic claims.
                    </p>
                </div>
            </section>

            <section className="landing-card-soft landing-card-pad">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    Limits and responsible use
                </h3>
                <ul className="space-y-2 landing-copy-muted">
                    <li>1. Scores are hiring-signal estimates, not interview or offer guarantees.</li>
                    <li>2. Industry and role context shift what matters most in a given run.</li>
                    <li>3. Human review is required for final factual accuracy and tone.</li>
                    <li>
                        4. For deeper research references, see
                        {" "}
                        <Link href="/research/how-we-score" className="text-foreground underline underline-offset-4 hover:text-brand">
                            the full methodology article
                        </Link>.
                    </li>
                </ul>
            </section>
        </LegalShell>
    );
}
