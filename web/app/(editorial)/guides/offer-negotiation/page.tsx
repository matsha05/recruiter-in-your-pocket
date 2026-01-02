"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
// SiteHeader removed — layout handles navigation
import {
    GuideSection,
    GuideAccordion,
    GuideChatUI,
    GuideNumberedSection,
    GuideHighlight,
    GuideQuickWin,
    EmployerMathCallout,
    ScriptLibrary,
    LeverDeepDives
} from "@/components/guides/GuideComponents";
import { NegotiationTimelineDiagram, LeverComparisonDiagram } from "@/components/guides/GuideDiagrams";
import { ArrowRight, ArrowLeft, Lock, MessageSquare, Users, Briefcase, Heart, Building2, ChevronRight } from "lucide-react";

/**
 * Universal Offer Negotiation Guide
 * 
 * Industry-agnostic principles with sections for different sectors
 * Standalone layout (same as tech guide) with marginalia, chat UI, accordions
 */

export default function OfferNegotiationGuidePage() {
    return (
        <>

            {/* Breadcrumb */}
            <div className="border-b border-border/20 bg-muted/30">
                <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-2 text-sm">
                    <Link href="/guides" className="text-muted-foreground hover:text-foreground transition-colors">
                        Resources
                    </Link>
                    <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
                    <span className="text-foreground font-medium">Offer Negotiation</span>
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-6 py-16">

                {/* Header */}
                <header className="mb-16">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <span className="inline-flex items-center rounded-sm border border-brand/20 bg-brand/10 px-3 py-1 text-[10px] uppercase tracking-widest font-semibold text-brand">
                                All Industries
                            </span>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                                12 min read
                            </span>
                        </div>

                        <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight text-foreground leading-tight">
                            Offer Negotiation:<br />
                            <span className="text-muted-foreground">The universal playbook</span>
                        </h1>

                        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                            Everyone negotiates. The psychology is the same whether you&apos;re in tech, healthcare, finance, or retail. The only thing that changes is which levers you pull.
                        </p>

                        {/* Link to tech-specific */}
                        <div className="flex items-center gap-4 pt-2">
                            <Link href="/guides/tech-offer-negotiation" className="text-sm text-brand hover:underline underline-offset-4">
                                Looking for the tech-specific equity guide? →
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Kill the stigma callout */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="mb-16 bg-gradient-to-r from-brand/10 to-violet-500/10 border border-brand/20 rounded-xl p-6"
                >
                    <h3 className="font-medium text-foreground mb-2">Let&apos;s kill the stigma</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        <GuideHighlight>Negotiating is not greedy. It&apos;s expected.</GuideHighlight> The other side has a budget. They made an offer below that budget. They expect you to negotiate. When you don&apos;t, you leave money on the table — and they know it.
                    </p>
                </motion.div>

                {/* Employer Math Callout */}
                <EmployerMathCallout />

                {/* Table of Contents */}
                <div className="mb-16 p-6 rounded-xl border border-border/30 bg-muted/10">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">In this guide</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-md bg-muted flex items-center justify-center text-sm font-medium text-foreground shrink-0">1</span>
                            <div>
                                <a href="#universal" className="text-sm font-medium text-foreground hover:text-brand">Universal principles</a>
                                <p className="text-xs text-muted-foreground mt-0.5">The psychology that works everywhere</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-md bg-muted flex items-center justify-center text-sm font-medium text-foreground shrink-0">2</span>
                            <div>
                                <a href="#timeline" className="text-sm font-medium text-foreground hover:text-brand">The timeline</a>
                                <p className="text-xs text-muted-foreground mt-0.5">Sequence wins over cleverness</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-md bg-muted flex items-center justify-center text-sm font-medium text-foreground shrink-0">3</span>
                            <div>
                                <a href="#levers" className="text-sm font-medium text-foreground hover:text-brand">Know your levers</a>
                                <p className="text-xs text-muted-foreground mt-0.5">What you can actually negotiate</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-md bg-muted flex items-center justify-center text-sm font-medium text-foreground shrink-0">4</span>
                            <div>
                                <a href="#scripts" className="text-sm font-medium text-foreground hover:text-brand">The scripts</a>
                                <p className="text-xs text-muted-foreground mt-0.5">Copy/paste conversations</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-20">

                    {/* Section 1: Universal Principles */}
                    <GuideNumberedSection number={1} title="Universal principles" id="universal">
                        <GuideSection
                            tip={
                                <>
                                    Research shows that when negotiation is explicitly allowed, everyone negotiates equally. The gap only appears when people assume they shouldn&apos;t ask.
                                </>
                            }
                        >
                            <p className="text-muted-foreground leading-relaxed mb-6">
                                These principles work whether you&apos;re negotiating $50K or $500K, in tech or teaching. Master these first.
                            </p>

                            <div className="space-y-4">
                                <div className="p-5 border border-border/30 rounded-lg">
                                    <h4 className="font-medium text-foreground mb-2">1. Never share your current salary</h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        In many states, it&apos;s illegal for employers to ask. Even where legal, deflect: <GuideHighlight>&quot;I&apos;m focused on the scope of this role—can you share the band?&quot;</GuideHighlight> Your past salary anchors you to your past. Your new salary should reflect your new role.
                                    </p>
                                </div>
                                <div className="p-5 border border-border/30 rounded-lg">
                                    <h4 className="font-medium text-foreground mb-2">2. Let them make the first offer</h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        When asked for salary expectations, defer: &quot;I&apos;m flexible within your range for this level—can you share it?&quot; This prevents you from anchoring low. Once they name a number, that becomes the floor.
                                    </p>
                                </div>
                                <div className="p-5 border border-border/30 rounded-lg">
                                    <h4 className="font-medium text-foreground mb-2">3. Always ask for time</h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        &quot;Thank you, I&apos;m excited. Can I take 48 hours to review the full package?&quot; <GuideHighlight>Never negotiate in the moment.</GuideHighlight> You need time to research, compare, and counter calmly.
                                    </p>
                                </div>
                                <div className="p-5 border border-border/30 rounded-lg">
                                    <h4 className="font-medium text-foreground mb-2">4. Negotiate total compensation</h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        If base is capped, shift the conversation: &quot;If we can get to $X total in year one through some mix of base and signing...&quot; Different levers have different flexibility.
                                    </p>
                                </div>
                                <div className="p-5 border border-border/30 rounded-lg">
                                    <h4 className="font-medium text-foreground mb-2">5. Be specific and committal</h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        <GuideHighlight>&quot;If you can get to $X, I&apos;m ready to sign.&quot;</GuideHighlight> This gives the recruiter a story to take to compensation. Vague asks get vague responses.
                                    </p>
                                </div>
                            </div>
                        </GuideSection>
                    </GuideNumberedSection>

                    <hr className="border-border/30" />

                    {/* Section 2: The Timeline */}
                    <GuideNumberedSection number={2} title="The timeline" id="timeline">
                        <GuideSection
                            tip={
                                <>
                                    Exploding offers (&quot;sign by Friday&quot;) are a pressure tactic. Push back politely. If they won&apos;t give you time, that tells you something about the company.
                                </>
                            }
                            tipType="warning"
                        >
                            <p className="text-muted-foreground leading-relaxed mb-6">
                                Most outcomes are decided by <GuideHighlight>sequence</GuideHighlight>, not cleverness. You win by moving in a calm, professional order.
                            </p>

                            <NegotiationTimelineDiagram />

                            <div className="space-y-4 mt-8">
                                <div className="flex items-start gap-4">
                                    <span className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center text-sm font-medium text-brand shrink-0">1</span>
                                    <div>
                                        <p className="font-medium text-foreground">Get the offer</p>
                                        <p className="text-sm text-muted-foreground">This is a fact-finding call. Ask questions, collect information, express excitement. Do not negotiate.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <span className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center text-sm font-medium text-brand shrink-0">2</span>
                                    <div>
                                        <p className="font-medium text-foreground">Ask for time</p>
                                        <p className="text-sm text-muted-foreground">48 hours minimum. &quot;I&apos;d love to review the full package carefully.&quot;</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <span className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center text-sm font-medium text-brand shrink-0">3</span>
                                    <div>
                                        <p className="font-medium text-foreground">Research</p>
                                        <p className="text-sm text-muted-foreground">Know the band for your level/role. Use Levels.fyi, Glassdoor, or ask your network.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <span className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center text-sm font-medium text-brand shrink-0">4</span>
                                    <div>
                                        <p className="font-medium text-foreground">Counter</p>
                                        <p className="text-sm text-muted-foreground">Target total comp, not just base. Be specific. &quot;If we can get to $X total...&quot;</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <span className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center text-sm font-medium text-brand shrink-0">5</span>
                                    <div>
                                        <p className="font-medium text-foreground">Close</p>
                                        <p className="text-sm text-muted-foreground">Be committal. &quot;If you can get to $X, I&apos;m ready to sign.&quot;</p>
                                    </div>
                                </div>
                            </div>
                        </GuideSection>
                    </GuideNumberedSection>

                    <hr className="border-border/30" />

                    {/* Section 3: Know Your Levers */}
                    <GuideNumberedSection number={3} title="Know your levers" id="levers">
                        <GuideSection
                            tip={
                                <>
                                    The recruiter wants the deal to happen. They&apos;ve spent weeks finding you. Their job is to close. Help them help you.
                                </>
                            }
                        >
                            <p className="text-muted-foreground leading-relaxed mb-6">
                                Different industries have different comp structures. The psychology is the same — <GuideHighlight>the levers change</GuideHighlight>.
                            </p>
                            <LeverComparisonDiagram />

                            <h4 className="font-medium text-foreground mt-10 mb-4">How to negotiate each lever</h4>
                            <LeverDeepDives />
                        </GuideSection>

                        {/* Industry Accordions */}
                        <div className="space-y-4 mt-8">
                            <GuideAccordion title="Finance & Consulting" badge="Bonus-Heavy">
                                <div className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        Bonus structures dominate compensation. Your leverage depends on whether you&apos;re a standard hire or experienced lateral.
                                    </p>
                                    <ul className="space-y-2">
                                        <GuideQuickWin><strong>Signing bonus:</strong> Often $10K-$100K+ for lateral moves. Highly negotiable.</GuideQuickWin>
                                        <GuideQuickWin><strong>Guaranteed year-one bonus:</strong> If joining mid-cycle, negotiate a guaranteed bonus.</GuideQuickWin>
                                        <GuideQuickWin><strong>Level/title:</strong> Your &quot;tenure credit&quot; affects starting salary and bonus targets.</GuideQuickWin>
                                    </ul>
                                </div>
                            </GuideAccordion>

                            <GuideAccordion title="Healthcare" badge="Benefits-Heavy">
                                <div className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        Healthcare has unique levers that often matter more than base salary.
                                    </p>
                                    <ul className="space-y-2">
                                        <GuideQuickWin><strong>PTO:</strong> 25-35 days common for physicians; negotiate CME days separately.</GuideQuickWin>
                                        <GuideQuickWin><strong>Loan repayment:</strong> Some employers offer $10K-$50K+/year toward student loans.</GuideQuickWin>
                                        <GuideQuickWin><strong>Malpractice (tail coverage):</strong> Get tail coverage in writing.</GuideQuickWin>
                                        <GuideQuickWin><strong>Signing bonus:</strong> Can range $10K-$100K+ depending on specialty.</GuideQuickWin>
                                    </ul>
                                </div>
                            </GuideAccordion>

                            <GuideAccordion title="Retail & Hospitality" badge="Flexibility-Heavy">
                                <div className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        Flexibility is often the most valuable lever. Schedule control and performance bonuses are negotiable.
                                    </p>
                                    <ul className="space-y-2">
                                        <GuideQuickWin><strong>Schedule flexibility:</strong> Fixed days off, no clopens, shift preferences.</GuideQuickWin>
                                        <GuideQuickWin><strong>Performance bonus:</strong> Sales targets, customer satisfaction metrics.</GuideQuickWin>
                                        <GuideQuickWin><strong>Title:</strong> Senior/Lead roles come with faster paths.</GuideQuickWin>
                                        <GuideQuickWin><strong>Trial period review:</strong> Agree to a salary review after 3-6 months.</GuideQuickWin>
                                    </ul>
                                </div>
                            </GuideAccordion>
                        </div>
                    </GuideNumberedSection>

                    <hr className="border-border/30" />

                    {/* Section 4: Scripts */}
                    <GuideNumberedSection number={4} title="The scripts" id="scripts">
                        <GuideSection
                            tip={
                                <>
                                    Good negotiation is coordination, not combat. You&apos;re a team working together to find a solution.
                                </>
                            }
                        >
                            {/* Email vs Phone callout */}
                            <div className="mb-8 p-5 rounded-xl border border-blue-500/30 bg-blue-500/5">
                                <h4 className="font-medium text-foreground mb-3">📧 Email is your friend</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                                    <GuideHighlight>You don&apos;t have to negotiate on the phone.</GuideHighlight> Email gives you time to think, craft your words, and avoid saying something you regret under pressure. Most recruiters are fine with email — they prefer written records too.
                                </p>
                                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <div className="font-medium text-foreground mb-1">When to use email:</div>
                                        <ul className="text-muted-foreground space-y-1">
                                            <li>• Making your counter-offer</li>
                                            <li>• Responding to a lowball</li>
                                            <li>• Asking for more time</li>
                                            <li>• Anything you want a paper trail for</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <div className="font-medium text-foreground mb-1">When phone is better:</div>
                                        <ul className="text-muted-foreground space-y-1">
                                            <li>• Building rapport early in the process</li>
                                            <li>• When they specifically ask to call</li>
                                            <li>• If you&apos;re very close to a deal and need to finalize</li>
                                            <li>• When you want to hear their tone/excitement</li>
                                        </ul>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-4 italic">
                                    Pro tip: If they call you, it&apos;s okay to say &quot;Thanks for calling — let me think about this and follow up by email.&quot;
                                </p>
                            </div>

                            <p className="text-muted-foreground leading-relaxed mb-8">
                                Copy these. Modify for your situation. The key is to be <GuideHighlight>warm, specific, and committal</GuideHighlight>.
                            </p>

                            {/* Counter-Script Library */}
                            <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                Counter-Scripts for Common Situations
                            </h4>
                            <p className="text-sm text-muted-foreground mb-4">
                                Click any situation to see what to say — and what the recruiter hears when you say it.
                            </p>
                            <ScriptLibrary />

                            <h4 className="font-medium text-foreground mt-10 mb-4">Example Conversations</h4>

                            <div className="space-y-8">
                                <div>
                                    <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4" />
                                        Asking for time
                                    </h4>
                                    <GuideChatUI
                                        title="After receiving the offer"
                                        messages={[
                                            { role: "recruiter", message: "We'd like to extend you an offer! Base is $95K with full benefits and 3 weeks PTO.", delay: 500 },
                                            { role: "you", message: "Thank you so much — I'm really excited about this opportunity.", delay: 2000 },
                                            { role: "you", message: "I'd love to take a couple days to review everything carefully. Could we connect Thursday?", delay: 3500 },
                                        ]}
                                    />
                                </div>

                                <div>
                                    <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4" />
                                        Countering with a package ask
                                    </h4>
                                    <GuideChatUI
                                        title="The negotiation call"
                                        messages={[
                                            { role: "you", message: "Thanks for connecting. I'm genuinely excited about the role and the team.", delay: 500 },
                                            { role: "you", message: "I've done some research and I'd love to make this work. If we can get to $105K — whether through base or a signing bonus — I'm ready to commit.", delay: 2000 },
                                            { role: "recruiter", message: "I appreciate that. Let me see what I can do on the signing bonus side.", delay: 4000 },
                                        ]}
                                    />
                                </div>

                                <div>
                                    <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
                                        <Lock className="w-4 h-4" />
                                        Deflecting salary history
                                    </h4>
                                    <GuideChatUI
                                        title="When asked about current salary"
                                        messages={[
                                            { role: "recruiter", message: "What are you currently making?", delay: 500 },
                                            { role: "you", message: "I'd prefer to focus on the scope and expectations for this role specifically.", delay: 1800 },
                                            { role: "you", message: "If you can share the range for this level, I can tell you whether we're aligned.", delay: 3200 },
                                        ]}
                                    />
                                </div>
                            </div>
                        </GuideSection>
                    </GuideNumberedSection>

                </div>

                {/* CTA */}
                <div className="mt-20 bg-secondary/10 border border-border/10 rounded-xl p-8 md:p-12 text-center">
                    <h2 className="font-display text-2xl font-medium mb-4">Ready to negotiate?</h2>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Get your resume reviewed by a recruiter&apos;s eye before your next interview.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/workspace">
                            <Button variant="brand" size="lg" className="gap-2 w-full sm:w-auto">
                                Start Your Review
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                        <Link href="/guides/tech-offer-negotiation">
                            <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto">
                                Tech Equity Guide
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                    </div>
                </div>

            </main>
        </>
    );
}
