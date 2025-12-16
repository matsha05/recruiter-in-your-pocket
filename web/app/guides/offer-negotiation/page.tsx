"use client";

import Link from "next/link";
import { StudioShell } from "@/components/layout/StudioShell";
import { Button } from "@/components/ui/button";
import { NegotiationTimeline } from "@/components/research/diagrams/NegotiationTimeline";
import { CompStack } from "@/components/research/diagrams/CompStack";
import { AnchorZone } from "@/components/research/diagrams/AnchorZone";
import { SalaryHistoryTrap } from "@/components/research/diagrams/SalaryHistoryTrap";
import { LevelLadder } from "@/components/research/diagrams/LevelLadder";
// Re-using ArticleInsight for consistency in "insight" blocks
import { ArticleInsight } from "@/components/research/ResearchArticle";
import { AlertCircle, Quote, TrendingUp, Handshake, ListCheck, Lock, Anchor, MousePointer2, CheckCircle2, ArrowRight } from "lucide-react";

export default function OfferNegotiationGuidePage() {
    return (
        <StudioShell showSidebar={true}>
            <div className="max-w-3xl mx-auto space-y-12 pb-20">

                {/* 1. Header */}
                <header>
                    <Link href="/research" className="inline-block mb-6">
                        <Button variant="ghost" size="sm" className="-ml-3 gap-2 text-muted-foreground">
                            ← Back to Library
                        </Button>
                    </Link>
                    <div className="space-y-4">
                        <span className="inline-flex items-center rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                            The Recruiter's Playbook
                        </span>
                        <h1 className="font-serif text-4xl md:text-5xl font-medium tracking-tight text-foreground">
                            Offer Negotiation Strategy
                        </h1>
                        <p className="text-xl text-muted-foreground font-sans leading-relaxed">
                            Negotiation works when you treat it like coordination, not combat. Your job is to make it easy for the recruiter to say yes, while avoiding the unforced errors that shrink your leverage.
                        </p>

                        <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground pt-2">
                            <span>Reading time: 12 min</span>
                            <span className="w-1 h-1 rounded-full bg-border" />
                            <span>Last updated: Dec 2025</span>
                        </div>
                    </div>
                </header>

                {/* 2. Research Foundation (Custom Card for Guide) */}
                <div className="bg-secondary/30 border border-border rounded-xl p-8 space-y-6">
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium text-sm uppercase tracking-wider">
                        <Handshake className="w-4 h-4" />
                        <span>Research Foundation</span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-medium text-foreground mb-2">The Ambiguity Penalty</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                                When negotiability is not explicit, men negotiate more than women. When explicit, the difference disappears (Leibbrandt & List).
                            </p>
                            <div className="p-3 bg-background rounded border border-border/50">
                                <span className="block text-xs font-bold uppercase tracking-wide text-foreground/70 mb-1">Key Takeaway</span>
                                <p className="text-sm text-foreground">Treat negotiation as a professional coordination step, not a taboo conflict.</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-medium text-foreground mb-2">Anchoring & Sequence</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                                First offers anchor outcomes, but "pre-offer conversations" mitigate this. Information interventions (like knowing the band) significantly improve outcomes (NBER workers).
                            </p>
                            <ul className="text-xs text-muted-foreground space-y-1">
                                <li>• NBER Working Paper 27054</li>
                                <li>• NBER Working Paper 32154</li>
                                <li>• Management Science (2015)</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* 3. Main Content - Timeline */}
                <section>
                    <h2 className="font-serif text-2xl font-medium text-foreground mb-4">Figure 1: The negotiation timeline</h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                        Most outcomes are decided by sequence, not cleverness. You win by moving in a calm, professional order.
                    </p>
                    <NegotiationTimeline />
                </section>

                <hr className="border-border/50" />

                {/* 4. Comp Stack */}
                <section>
                    <h2 className="font-serif text-2xl font-medium text-foreground mb-4">Figure 2: The comp stack, and why levers matter</h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                        When you negotiate like it is “one number,” you miss the levers that companies actually use to close.
                    </p>
                    <CompStack />

                    <h3 className="font-medium text-lg text-foreground mt-12 mb-4">Understand the offer before you negotiate it</h3>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                        Negotiation is not “ask for more.” It is “find the lever.” Before you counter, be able to answer plain questions:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
                        <li>What is the compensation mix?</li>
                        <li>What is the company optimizing for (budget vs start date)?</li>
                        <li>What is your actual priority?</li>
                    </ul>
                    <div className="bg-indigo-500/5 border border-indigo-500/10 p-6 rounded-xl">
                        <strong className="block text-indigo-700 dark:text-indigo-400 mb-2 font-medium">A Recruiter Truth</strong>
                        <p className="text-sm text-muted-foreground">Recruiters want the deal to happen. They need a story to take to comp. Give them that story.</p>
                    </div>
                </section>

                <hr className="border-border/50" />

                {/* 5. Anchor Zone */}
                <section>
                    <h2 className="font-serif text-2xl font-medium text-foreground mb-4">The counter: anchor confidently</h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                        First offers anchor outcomes. But extremely aggressive openings can increase impasse risk.
                    </p>
                    <AnchorZone />

                    <div className="mt-8">
                        <h3 className="font-medium text-foreground mb-2">The “Package” Principle</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Don't just ask for a number. Ask for a package outcome. "If we can get to $X total..."
                        </p>
                    </div>
                </section>

                <hr className="border-border/50" />

                {/* 6. Salary History */}
                <section>
                    <h2 className="font-serif text-2xl font-medium text-foreground mb-4">Figure 4: The Salary History Trap</h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                        Why do people volunteer their past salary even when they don't have to? Social pressure.
                    </p>
                    <SalaryHistoryTrap />
                </section>

                <hr className="border-border/50" />

                {/* 7. Level Ladder */}
                <section>
                    <h2 className="font-serif text-2xl font-medium text-foreground mb-4">Figure 5: Level is the Hidden Lever</h2>
                    <LevelLadder />
                </section>

                {/* 8. Scripts */}
                <section>
                    <h2 className="font-serif text-2xl font-medium text-foreground mb-8">The Scripts (Copy/Paste)</h2>
                    <div className="space-y-8">
                        <ScriptBlock
                            title="Asking for time"
                            doText={<>Thanks again. I’m genuinely excited about the role.<br />I’d love to take 48 hours to review the full package carefully.<br />Could we schedule a quick call on Thursday?</>}
                            dontText="I need more money."
                        />
                        <ScriptBlock
                            title="Countering with a package ask"
                            doText={<>If we can get to <strong>$X total in year one</strong> through some mix of base and sign-on, I’m ready to sign quickly.<br />Does that feel workable?</>}
                            dontText="I deserve $X."
                        />
                        <ScriptBlock
                            title="Deflecting salary history"
                            doText={<>I’d prefer to focus on the scope and leveling for this role.<br />If you can share the range for this level, I can tell you where I’d need to land to sign.</>}
                            dontText="I’m not telling you my salary."
                        />
                    </div>
                </section>

                {/* 9. Product Tie In */}
                <div className="bg-surface border border-border rounded-xl p-8 md:p-12">
                    <div className="max-w-xl mx-auto text-center space-y-6">
                        <h2 className="font-serif text-3xl font-medium">How we built this into the product</h2>
                        <p className="text-muted-foreground">Every analysis tool in Recruiter In Your Pocket is built on this playbook.</p>

                        <div className="grid gap-4 text-left">
                            <div className="p-4 bg-background rounded border border-border/50">
                                <strong className="block text-foreground mb-1">Offer Intake</strong>
                                <p className="text-xs text-muted-foreground">We capture your leverage signals before you ever see a resume score.</p>
                            </div>
                            <div className="p-4 bg-background rounded border border-border/50">
                                <strong className="block text-foreground mb-1">Tone Analysis</strong>
                                <p className="text-xs text-muted-foreground">We flag "ultimatum" language that risks blowing up the deal.</p>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Link href="/workspace">
                                <Button size="lg" className="w-full md:w-auto">
                                    Start Your Analysis
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </StudioShell>
    );
}

function ScriptBlock({ title, doText, dontText }: { title: string, doText: React.ReactNode, dontText: string }) {
    return (
        <div className="group relative">
            <h3 className="font-serif text-lg font-medium text-foreground mb-4">{title}</h3>

            <div className="grid md:grid-cols-2 gap-4">
                {/* DO THIS - Luminous Emerald (Success/Growth) */}
                <div className="relative p-6 rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent shadow-[0_0_20px_-10px_rgba(16,185,129,0.1)] overflow-hidden">
                    <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Winning Approach</span>
                    </div>
                    <p className="text-base text-foreground/90 leading-relaxed font-medium font-serif border-l-2 border-emerald-500/30 pl-4">
                        "{doText}"
                    </p>
                </div>

                {/* NOT THIS - Luminous Rose (Risk/Mistake) */}
                <div className="relative p-6 rounded-xl border border-rose-500/10 bg-gradient-to-br from-rose-500/5 to-transparent opacity-80 hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-2 mb-3">
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                        <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Common Mistake</span>
                    </div>
                    <p className="text-base text-muted-foreground leading-relaxed italic font-serif border-l-2 border-rose-500/20 pl-4">
                        "{dontText}"
                    </p>
                </div>
            </div>
        </div>
    )
}
