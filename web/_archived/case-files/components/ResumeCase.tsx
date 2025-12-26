"use client";

import { ResumeArtifact } from "@/lib/types/case";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, XCircle, Minus, FileText, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResumeCaseProps {
    artifact: ResumeArtifact;
}

export function ResumeCase({ artifact }: ResumeCaseProps) {
    const analysis = artifact.analysis;

    if (!analysis) return null;

    return (
        <div className="max-w-[800px] mx-auto py-12 animate-in fade-in duration-700">

            {/* 1. The Header (Internal Memo Style) */}
            <header className="border-b border-border pb-8 mb-12 space-y-6">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <Badge variant="outline" className="text-[10px] font-mono tracking-widest uppercase rounded-none border-foreground text-foreground px-2 py-0.5">
                            Confidential
                        </Badge>
                        <h1 className="text-display text-4xl text-foreground">Recruiter Decision Memo</h1>
                    </div>
                    <div className="text-right space-y-1">
                        <div className="text-eyebrow">Case ID</div>
                        <div className="font-mono text-xs text-foreground uppercase tracking-wider">{artifact.id}</div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-8 py-4">
                    <div>
                        <div className="text-eyebrow mb-1">Subject</div>
                        <div className="font-serif text-lg leading-tight">Resume Suitability Assessment</div>
                    </div>
                    <div>
                        <div className="text-eyebrow mb-1">Evaluator</div>
                        <div className="font-mono text-xs text-foreground">RIYP Algorithm v2.0</div>
                    </div>
                    <div>
                        <div className="text-eyebrow mb-1">Date</div>
                        <div className="font-mono text-xs text-foreground">{new Date(artifact.created_at).toLocaleDateString()}</div>
                    </div>
                </div>
            </header>

            {/* 2. The Verdict (The "Stamp") */}
            <section className="mb-16 grid md:grid-cols-[240px_1fr] gap-12 items-start">
                <div className="bg-secondary/30 p-8 rounded-lg border border-border/50 text-center space-y-4">
                    <VerdictStamp verdict={analysis.verdict} />
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Final Recommendation</div>
                </div>

                <div className="space-y-4 pt-2">
                    <h3 className="text-eyebrow text-foreground">Executive Summary</h3>
                    <p className="font-serif text-xl leading-relaxed text-foreground/90">
                        {analysis.verdict_reason}
                    </p>
                </div>
            </section>

            {/* 3. Signal Ladder (Table Style) */}
            <section className="mb-16 space-y-6">
                <div className="flex items-end justify-between border-b border-border pb-2">
                    <h3 className="text-display text-xl">Signal Analysis</h3>
                    <span className="text-xs font-mono text-muted-foreground">CLAIM / PROOF / STRENGTH</span>
                </div>

                <div className="space-y-0 divide-y divide-border border-b border-border">
                    {analysis.signal_ladder.map((rung, i) => (
                        <div key={i} className="grid grid-cols-[1fr_100px_1fr] gap-6 py-4 items-baseline group hover:bg-secondary/10 transition-colors px-2">
                            <div className="text-right">
                                <span className="font-medium text-foreground text-sm">{rung.claim}</span>
                            </div>

                            <div className="flex justify-center">
                                <LadderStrength text={rung.strength} />
                            </div>

                            <div className="text-left">
                                <span className="font-serif text-muted-foreground text-sm italic">{"\""}{rung.proof}{"\""}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 4. Top Fixes (Before/After) */}
            <section className="space-y-8">
                <div className="flex items-center gap-4">
                    <h3 className="text-display text-xl">Required Actions</h3>
                    <div className="h-px bg-border flex-1" />
                </div>

                <div className="grid gap-12">
                    {analysis.top_fixes.map((fix, i) => (
                        <div key={fix.id} className="group">
                            <div className="flex items-baseline gap-3 mb-4">
                                <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
                                <h4 className="font-bold text-foreground text-lg">{fix.issue}</h4>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8 pl-8 border-l border-border/50 group-hover:border-indigo-500/30 transition-colors">
                                <div className="space-y-2">
                                    <div className="text-eyebrow text-premium/80">Problem</div>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {fix.why_it_matters}
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    <div className="text-eyebrow text-success/80">Rewrite</div>
                                    <div className="relative">
                                        <div className="absolute -left-4 top-1 text-success"><ArrowDown className="w-3 h-3" /></div>
                                        <div className="font-serif text-foreground text-lg leading-relaxed bg-success/5 -mx-2 px-2 py-1 rounded">
                                            {fix.rewrite}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

        </div>
    );
}

function VerdictStamp({ verdict }: { verdict: 'shortlist' | 'maybe' | 'pass' }) {
    const styles = {
        shortlist: "text-success border-success bg-success/10 rounded-lg",
        maybe: "text-premium border-premium bg-premium/10 rounded-lg",
        pass: "text-destructive border-destructive bg-destructive/10 rounded-lg"
    }

    return (
        <div className={cn("border-4 border-double px-6 py-4 inline-block transform -rotate-2 mask-stamp font-display font-black text-2xl uppercase tracking-widest shadow-sm", styles[verdict])}>
            {verdict}
        </div>
    )
}

function LadderStrength({ text }: { text: 'weak' | 'medium' | 'strong' }) {
    const colors = {
        weak: "text-destructive bg-destructive/10 border-destructive/20",
        medium: "text-premium bg-premium/10 border-premium/20",
        strong: "text-success bg-success/10 border-success/20"
    }
    return (
        <span className={cn("text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border", colors[text])}>
            {text}
        </span>
    )
}
