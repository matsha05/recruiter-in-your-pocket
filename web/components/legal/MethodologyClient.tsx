"use client";

import Link from "next/link";
import Footer from "@/components/landing/Footer";
import { LegalNav } from "@/components/legal/LegalNav";
import { BarChart3, Target, PenSquare, AlertTriangle } from "lucide-react";
import { LEGAL_LAST_UPDATED } from "@/lib/legal/dataHandling";

const rubric = [
  {
    name: "Story",
    weight: "35%",
    detail: "Does your trajectory read as a coherent candidate narrative for the target role?"
  },
  {
    name: "Impact",
    weight: "30%",
    detail: "Do bullets prove business outcomes with concrete evidence (scope, numbers, results)?"
  },
  {
    name: "Clarity",
    weight: "20%",
    detail: "Can recruiters parse role, seniority, and value without re-reading?"
  },
  {
    name: "Readability",
    weight: "15%",
    detail: "Is the document scan-friendly in first-pass review time?"
  }
];

export default function MethodologyClient() {
  return (
    <>
      <main className="max-w-4xl mx-auto px-6 py-12">
        <LegalNav />

        <header className="mb-12 text-center max-w-2xl mx-auto">
          <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight text-foreground mb-4">
            Scoring Methodology
          </h1>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            How scores are produced, what they mean, and what they do not claim.
          </p>
          <p className="text-xs font-mono text-muted-foreground mt-3">Last updated: {LEGAL_LAST_UPDATED}</p>
        </header>

        <section className="rounded-xl border border-border/50 bg-card p-6 mb-8">
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-brand" />
            7.4-second signal rubric
          </h2>
          <div className="space-y-3">
            {rubric.map((item) => (
              <div key={item.name} className="rounded border border-border/40 bg-background/60 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{item.name}</p>
                  <p className="text-xs font-mono text-brand">{item.weight}</p>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 mb-8">
          <div className="rounded-xl border border-border/50 bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <Target className="w-4 h-4 text-brand" />
              Output intent
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Feedback is action-oriented: what hurt signal, what to rewrite first, and where role-fit is weak.
            </p>
          </div>
          <div className="rounded-xl border border-border/50 bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <PenSquare className="w-4 h-4 text-brand" />
              Rewrite quality bar
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Rewrites prioritize verifiable outcomes and tighter language over inflated claims or motivational fluff.
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-border/50 bg-card p-6 mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-2">Confidence bands</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Scores include uncertainty by design. Treat outcomes as directional guidance for iteration, not as absolute ranking.
            Confidence decreases when evidence is thin, scope is ambiguous, or role context is missing.
          </p>
        </section>

        <section className="rounded-xl border border-warning/30 bg-warning/10 p-6">
          <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            Limits and responsible use
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>1. Score is a hiring-signal estimate, not a guarantee of interviews or offers.</li>
            <li>2. Industry and role context can shift what matters most.</li>
            <li>3. Human review is still required for factual accuracy and final tone.</li>
            <li>
              4. For research details, see the{" "}
              <Link href="/research/how-we-score" className="text-foreground underline underline-offset-4">
                full methodology article
              </Link>
              .
            </li>
          </ul>
        </section>
      </main>
      <Footer />
    </>
  );
}
