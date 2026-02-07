"use client";

import Link from "next/link";
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
    ScriptLibrary
} from "@/components/guides/GuideComponents";
import { CompStackDiagram, EquityTruthTable } from "@/components/guides/GuideDiagrams";
import { ArrowRight, ArrowLeft, DollarSign, TrendingUp, Clock, Target, Lock, MessageSquare, Users, ChevronRight } from "lucide-react";

/**
 * Tech Offer Negotiation Guide
 * 
 * Candor-inspired layout WITHOUT sidebar:
 * - Full-width content for readability
 * - Marginalia "Recruiter's Take" tips
 * - Animated chat UI for scripts
 * - Collapsible accordions for deep-dives
 * - Giant numbered sections
 */

export default function TechOfferNegotiationGuidePage() {
    return (
        <>

            {/* Breadcrumb */}
            <div className="border-b border-border/20 bg-muted/30">
                <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-2 text-sm">
                    <Link href="/guides" className="text-muted-foreground hover:text-foreground transition-colors">
                        Resources
                    </Link>
                    <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
                    <span className="text-foreground font-medium">Tech Salary Negotiation</span>
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-6 py-16">

                {/* Hero */}
                <header className="mb-20">
                    <div className="space-y-6 max-w-3xl">
                        <div className="flex items-center gap-3">
                            <span className="inline-flex items-center rounded-sm border border-brand/20 bg-brand/10 px-3 py-1 text-[10px] uppercase tracking-widest font-semibold text-brand">
                                Tech Offers
                            </span>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                                15 min read
                            </span>
                        </div>

                        <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight text-foreground leading-tight">
                            Tech Salary Negotiation:<br />
                            <span className="text-muted-foreground">A playbook for tech offers</span>
                        </h1>

                        <p className="text-xl text-muted-foreground leading-relaxed">
                            Equity can represent a major share of total compensation, and level controls most of the range. Negotiate the full package, not just base.
                        </p>
                    </div>
                </header>

                {/* Employer Math Callout */}
                <EmployerMathCallout />

                <div className="mb-12 rounded-xl border border-border/40 bg-muted/10 p-6 max-w-3xl">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">Quick start</div>
                    <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-lg border border-border/40 bg-white/80 p-3 dark:bg-slate-900/70">
                            <div className="text-sm font-medium text-foreground">1. Confirm level and band</div>
                            <p className="mt-1 text-xs text-muted-foreground">Most upside comes from level calibration before comp tuning.</p>
                        </div>
                        <div className="rounded-lg border border-border/40 bg-white/80 p-3 dark:bg-slate-900/70">
                            <div className="text-sm font-medium text-foreground">2. Price equity clearly</div>
                            <p className="mt-1 text-xs text-muted-foreground">Separate base, bonus, grant value, and vesting reality.</p>
                        </div>
                        <div className="rounded-lg border border-border/40 bg-white/80 p-3 dark:bg-slate-900/70">
                            <div className="text-sm font-medium text-foreground">3. Counter with one number</div>
                            <p className="mt-1 text-xs text-muted-foreground">Use a commit-if target that helps the recruiter close.</p>
                        </div>
                    </div>
                </div>

                {/* Table of Contents */}
                <div className="mb-20 p-8 rounded-xl border border-border/30 bg-muted/10 max-w-3xl">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-6">In this guide</h3>
                    <div className="grid sm:grid-cols-2 gap-6">
                        <div className="flex items-start gap-4">
                            <span className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-base font-semibold text-foreground shrink-0">1</span>
                            <div>
                                <a href="#understand-comp" className="text-base font-medium text-foreground hover:text-brand">Understand tech comp</a>
                                <p className="text-sm text-muted-foreground mt-1">Base, equity, bonus, level — and why each matters</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <span className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-base font-semibold text-foreground shrink-0">2</span>
                            <div>
                                <a href="#the-call" className="text-base font-medium text-foreground hover:text-brand">The money conversation</a>
                                <p className="text-sm text-muted-foreground mt-1">What to ask, what to never say, and why</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <span className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-base font-semibold text-foreground shrink-0">3</span>
                            <div>
                                <a href="#level-lever" className="text-base font-medium text-foreground hover:text-brand">Level is the lever</a>
                                <p className="text-sm text-muted-foreground mt-1">The #1 variable controlling your comp</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <span className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-base font-semibold text-foreground shrink-0">4</span>
                            <div>
                                <a href="#the-playbook" className="text-base font-medium text-foreground hover:text-brand">The playbook</a>
                                <p className="text-sm text-muted-foreground mt-1">Step-by-step negotiation scripts</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-24">

                    {/* Section 1: Understand Tech Comp */}
                    <GuideNumberedSection number={1} title="Understand tech compensation" id="understand-comp">
                        <GuideSection
                            tip={
                                <>
                                    <strong>This complexity exists partly to help both sides feel like they got a deal.</strong> If there&apos;s only one number to argue on, nobody walks away happy. A big part of salary negotiation is using the complexity to your advantage: knowing which lever to pull.
                                </>
                            }
                        >
                            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                                There&apos;s a lot outside of salary that forms your total compensation package. Your <GuideHighlight>&quot;total comp&quot;</GuideHighlight> includes at least:
                            </p>

                            <ul className="space-y-6 mb-10">
                                <li>
                                    <strong className="text-foreground">Base salary</strong> — the money you&apos;re paid every pay period. This is the foundation. It&apos;s also the most visible line item in a budget, which means it&apos;s often the hardest to negotiate.
                                </li>
                                <li>
                                    <strong className="text-foreground">Equity</strong> — ownership stake in the company. At senior levels, this could easily be <GuideHighlight>half your total comp or more</GuideHighlight>. It vests over 4 years with a 1-year cliff (you get nothing if you leave before year 1).
                                </li>
                                <li>
                                    <strong className="text-foreground">Benefits</strong> — in the US, health insurance alone can easily cost your employer $500-1000/month. Benefit packages also include things like vacation days, free food, and other perks. This is (mostly) not taxed, so you&apos;d rather have these benefits than the equivalent in cash.
                                </li>
                                <li>
                                    <strong className="text-foreground">Annual bonus</strong> — percentage bonus on top of your salary based on performance, common only with public companies. The recruiter will likely quote you a &quot;target bonus&quot; (e.g. 15%), which is what you can expect if you meet expectations. Generally also comes with additional equity (a &quot;refresher&quot;).
                                </li>
                                <li>
                                    <strong className="text-foreground">Signing bonus</strong> — one-time bonus paid out either when you sign or the day you start. Might come with a clause that you must pay it back if you leave after X months. Quite common in large tech companies, can be anywhere from $10k–$100k. <GuideHighlight>Highly negotiable.</GuideHighlight>
                                </li>
                                <li>
                                    <strong className="text-foreground">Other perks</strong> — a whole suite of one-time or ongoing cash perks, like relocation package, phone stipend, commuter benefits, car allowance, etc.
                                </li>
                            </ul>
                        </GuideSection>

                        <GuideSection
                            tip={
                                <>
                                    <strong>Levels are completely non-standard between companies.</strong> An &quot;L5&quot; engineer at Amazon is not equivalent to an &quot;E5&quot; engineer at Facebook. This is why levels.fyi exists — and why you should use it before every negotiation.
                                </>
                            }
                        >
                            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                                The biggest input that controls comp is <GuideHighlight>&quot;level&quot;</GuideHighlight>, a number that expresses your seniority. For example, level E3 at Facebook is new grad, E4 is for hires with a few years experience and so on, up to E9 (after the first few levels, experience becomes less important).
                            </p>

                            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                                The more expensive/higher level you are, the more complex your comp mix becomes and the more it&apos;ll skew towards equity.
                            </p>

                            <CompStackDiagram />
                        </GuideSection>

                        {/* Equity Deep Dive */}
                        <div className="space-y-4 mt-12">
                            <h3 className="font-display text-xl font-medium text-foreground mb-4">Understanding & valuing equity</h3>

                            {/* RSU vs Options Comparison */}
                            <EquityTruthTable />

                            <GuideAccordion title="RSUs (Restricted Stock Units)" badge="Common at public companies">
                                <div className="space-y-4">
                                    <p className="text-muted-foreground">
                                        RSUs are shares you receive after vesting. You don&apos;t pay anything for them — they&apos;re taxed as ordinary income when they vest. Public company RSUs have clear value; private company RSUs require a liquidity event (IPO or acquisition).
                                    </p>
                                    <ul className="text-muted-foreground space-y-2">
                                        <li>• <strong>Vesting:</strong> Typically 4 years with 1-year cliff. You get nothing if you leave in year 1.</li>
                                        <li>• <strong>Tax:</strong> Taxed as ordinary income at vest. The company typically withholds shares to cover taxes.</li>
                                        <li>• <strong>Refreshers:</strong> Annual top-ups based on performance. These can add up significantly over time.</li>
                                        <li>• <strong>Risk:</strong> Stock can go down after vest. You don&apos;t control the price.</li>
                                    </ul>
                                </div>
                            </GuideAccordion>

                            <GuideAccordion title="Stock Options (ISOs/NSOs)" badge="Common at startups">
                                <div className="space-y-4">
                                    <p className="text-muted-foreground">
                                        Options give you the right to buy shares at a fixed &quot;strike price.&quot; Only valuable if company value exceeds your strike price. Common at startups.
                                    </p>
                                    <ul className="text-muted-foreground space-y-2">
                                        <li>• <strong>Strike price:</strong> What you pay to exercise (buy) the shares. This is set at the 409A valuation when the options are granted.</li>
                                        <li>• <strong>Exercise window:</strong> How long after leaving you can buy the shares. 90 days is standard, 10 years is generous.</li>
                                        <li>• <strong>ISOs vs NSOs:</strong> ISOs have tax advantages (you may owe less on capital gains) but come with complexity. NSOs are simpler but taxed as ordinary income on exercise.</li>
                                        <li>• <strong>Early exercise:</strong> Some companies let you exercise before vesting. This can have tax advantages (83(b) election) but you&apos;re paying for shares that aren&apos;t yet yours.</li>
                                    </ul>
                                </div>
                            </GuideAccordion>

                            <GuideAccordion title="Questions to ask about equity">
                                <ul className="space-y-3">
                                    <GuideQuickWin>What is the current valuation and total share count? (To calculate your ownership %)</GuideQuickWin>
                                    <GuideQuickWin>What is the strike price? (For options — determines if they&apos;re worth anything)</GuideQuickWin>
                                    <GuideQuickWin>What is the vesting schedule? Is there a cliff?</GuideQuickWin>
                                    <GuideQuickWin>How long do I have to exercise after leaving? (90 days vs 10 years is a huge difference)</GuideQuickWin>
                                    <GuideQuickWin>Is the equity quote per year or total over 4 years? (Recruiters sometimes quote the 4-year number)</GuideQuickWin>
                                    <GuideQuickWin>What are typical annual refresh grants at my level?</GuideQuickWin>
                                    <GuideQuickWin>What was the last 409A valuation? When was it?</GuideQuickWin>
                                </ul>
                            </GuideAccordion>
                        </div>
                    </GuideNumberedSection>

                    <hr className="border-border/30 max-w-3xl" />

                    {/* Section 2: The Money Conversation */}
                    <GuideNumberedSection number={2} title="The money conversation" id="the-call">
                        <GuideSection
                            tip={
                                <>
                                    <strong>Every employer will ask about expected salary and every experienced professional knows to not answer.</strong> This is a standard part of the hiring dance. Don&apos;t be afraid to stand your ground — the recruiter will not rescind the offer because you didn&apos;t answer.
                                </>
                            }
                        >
                            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                                First, delay the salary conversation until both of you are convinced this is the right job. <GuideHighlight>Never, ever share your previous salary.</GuideHighlight> In California and many other US states, it&apos;s illegal for an employer to ask about your current salary.
                            </p>

                            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                                They can still ask about your salary expectations or salary requirements (and often will early in the interview process). Respond politely but firmly that you&apos;re not comfortable sharing at this stage.
                            </p>

                            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-6 mb-10">
                                <div className="flex items-center gap-2 text-rose-600 text-[10px] font-bold uppercase tracking-widest mb-3">
                                    <Lock className="w-3.5 h-3.5" />
                                    The golden rule
                                </div>
                                <p className="text-foreground font-medium mb-2">Never share your current or previous salary.</p>
                                <p className="text-sm text-muted-foreground">
                                    It anchors you to your past, not your future value. Even if asked directly, deflect: &quot;I&apos;d prefer to focus on the scope and leveling for this role.&quot; If you share a number, that becomes the ceiling. If they share first, it becomes the floor.
                                </p>
                            </div>
                        </GuideSection>

                        <GuideSection
                            tip={
                                <>
                                    <strong>Sometimes a tight deadline is legitimate but often it&apos;s a pressure tactic.</strong> &quot;Exploding offers&quot; are a bad industry practice and unfortunately common with new grad offers. Here&apos;s a secret: if you renege on a signed offer, nothing bad will happen. Don&apos;t feel pressured.
                                </>
                            }
                            tipType="warning"
                        >
                            <h3 className="font-display text-xl font-medium text-foreground mb-4">The offer call: A fact-finding mission</h3>

                            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                                At some point, the recruiter will let you know they would like to extend an offer and schedule a call. It might not be made explicit, but this is the money conversation. For you, this is going to be a <GuideHighlight>fact-finding conversation</GuideHighlight>.
                            </p>

                            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                                Share your excitement about the new job, but control every urge to react to the numbers, share your previous salary, argue or try to make your case. If the salary offer is higher than you expected, don&apos;t act surprised or let it come across.
                            </p>

                            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                                Our goal is to collect information and retreat to a place where we analyze all the details with a cool head. Follow up with these questions:
                            </p>

                            <ol className="space-y-4 mb-10">
                                <li className="flex items-start gap-4">
                                    <span className="w-7 h-7 rounded-full bg-brand/20 flex items-center justify-center text-sm font-semibold text-brand shrink-0">1</span>
                                    <div>
                                        <p className="font-medium text-foreground">What level is the job offer?</p>
                                        <p className="text-muted-foreground">What are the requirements for this level vs. the level above it?</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="w-7 h-7 rounded-full bg-brand/20 flex items-center justify-center text-sm font-semibold text-brand shrink-0">2</span>
                                    <div>
                                        <p className="font-medium text-foreground">What is the salary band for this level?</p>
                                        <p className="text-muted-foreground">This is 100% a reasonable thing to ask. In California, an employer must legally provide this if asked.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="w-7 h-7 rounded-full bg-brand/20 flex items-center justify-center text-sm font-semibold text-brand shrink-0">3</span>
                                    <div>
                                        <p className="font-medium text-foreground">How much is the equity worth currently?</p>
                                        <p className="text-muted-foreground">You can also ask: what percentage of the company does the equity represent? What is the valuation?</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="w-7 h-7 rounded-full bg-brand/20 flex items-center justify-center text-sm font-semibold text-brand shrink-0">4</span>
                                    <div>
                                        <p className="font-medium text-foreground">What is the vesting schedule?</p>
                                        <p className="text-muted-foreground">Is there a 1 year cliff? Are there quarterly vesting deadlines I should know about? Confirm whether the equity was quoted per year or over 4 years.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="w-7 h-7 rounded-full bg-brand/20 flex items-center justify-center text-sm font-semibold text-brand shrink-0">5</span>
                                    <div>
                                        <p className="font-medium text-foreground">For options: what is the strike price?</p>
                                        <p className="text-muted-foreground">How long after leaving do I have to exercise the options?</p>
                                    </div>
                                </li>
                            </ol>

                            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                                That&apos;s it. Thank them, express excitement, and ask for 48 hours to review.
                            </p>
                        </GuideSection>

                        {/* Sample Conversation */}
                        <div className="mt-10">
                            <h3 className="font-display text-xl font-medium text-foreground mb-4 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5" />
                                Sample: Asking for time
                            </h3>
                            <GuideChatUI
                                title="After receiving the offer"
                                messages={[
                                    { role: "recruiter", message: "We're excited to extend you an offer! The base is $185K, with $200K in RSUs over 4 years, and a $25K signing bonus.", delay: 500 },
                                    { role: "you", message: "Thank you so much — I'm genuinely excited about this opportunity and the team.", delay: 2000 },
                                    { role: "you", message: "Quick question: what's the vesting schedule on the RSUs? And is that $200K over 4 years or per year?", delay: 3500 },
                                    { role: "recruiter", message: "It's $200K total over 4 years with a one-year cliff, then quarterly vesting.", delay: 5000 },
                                    { role: "you", message: "Got it, that's helpful. I'd love to take 48 hours to review the full package carefully. Could we schedule a call Thursday to discuss?", delay: 6500 },
                                    { role: "recruiter", message: "Of course! I'll send over the written offer and we can connect Thursday afternoon.", delay: 8000 },
                                ]}
                            />
                        </div>
                    </GuideNumberedSection>

                    <hr className="border-border/30 max-w-3xl" />

                    {/* Section 3: Level is the Lever */}
                    <GuideNumberedSection number={3} title="Level is the lever" id="level-lever">
                        <GuideSection
                            tip={
                                <>
                                    <strong>However, if you&apos;re speaking to a major tech company (Facebook, Google), it&apos;ll be quite difficult to move your level.</strong> Level is generally set independently by a hiring committee based on your &quot;packet.&quot; The committees tend to be very conservative and would rather you join at a lower level and promote later.
                                </>
                            }
                        >
                            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                                The biggest lever that controls compensation is <GuideHighlight>level</GuideHighlight>. Each level has a salary range and they overlap: if level 4 is $125k-$155k, level 5 might be $145k-$160k. There are separate bands for base and equity.
                            </p>

                            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                                However, a higher level isn&apos;t just a free higher salary: <GuideHighlight>it comes with higher job expectations</GuideHighlight>. It&apos;s better to be on the high end of lower level band. You should target a level you&apos;re confident you can be promoted within 1 year and target the higher end of the band.
                            </p>

                            <div className="bg-muted/20 border border-border/30 rounded-xl p-6 mb-10">
                                <h4 className="font-medium text-foreground mb-4">What you can actually negotiate — by company type</h4>
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div>
                                        <p className="font-medium text-foreground mb-2">Large tech (FAANG)</p>
                                        <p className="text-muted-foreground text-sm">Level is usually set by committee based on your interview performance. Hard to move. Focus on comp within the band — signing bonus has the most flexibility.</p>
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground mb-2">Mid-size / Startups</p>
                                        <p className="text-muted-foreground text-sm">More flexibility. Leveling is loosely based on work experience and previous seniority. You have room to push on level, especially if you have competing offers.</p>
                                    </div>
                                </div>
                            </div>
                        </GuideSection>

                        <GuideSection
                            tip={
                                <>
                                    <strong>If you want to move your level, master the art of listening carefully and repeating.</strong> Earlier you asked the recruiter about the qualifications required for the level. When you ask about a level change, clearly connect it to the requirements they laid out.
                                </>
                            }
                        >
                            <h3 className="font-display text-xl font-medium text-foreground mb-4">How to argue for a higher level</h3>

                            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                                For smaller companies and non-technical roles, you&apos;ll have more leeway. The key is to connect your experience directly to their level requirements:
                            </p>

                            <div className="space-y-4 mb-8">
                                <div className="p-4 border border-border/30 rounded-lg">
                                    <p className="font-medium text-foreground mb-1">Don&apos;t say</p>
                                    <p className="text-muted-foreground">&quot;I think I deserve a higher level based on my experience.&quot;</p>
                                </div>
                                <div className="p-4 border border-success/20 rounded-lg bg-success/5">
                                    <p className="font-medium text-foreground mb-1">Do say</p>
                                    <p className="text-muted-foreground">&quot;You mentioned the next level requires experience leading cross-functional projects. In my current role, I led the migration to our new billing system which involved eng, product, and finance teams over 8 months.&quot;</p>
                                </div>
                            </div>
                        </GuideSection>
                    </GuideNumberedSection>

                    <hr className="border-border/30 max-w-3xl" />

                    {/* Section 4: The Playbook */}
                    <GuideNumberedSection number={4} title="The playbook" id="the-playbook">
                        <GuideSection
                            tip={
                                <>
                                    <strong>Remember: the company just spent 10s of thousands finding you, vetting you, etc.</strong> They&apos;ve wasted time wading through a glut of unqualified candidates. The recruiter has quotas to fill. The hiring manager needed the job filled months ago. Everybody wants this deal to happen.
                                </>
                            }
                        >
                            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                                Good salary negotiation isn&apos;t an adversarial game of counter-offers — <GuideHighlight>make it clear you&apos;re a team working together to overcome a common hurdle</GuideHighlight>.
                            </p>

                            <h3 className="font-display text-xl font-medium text-foreground mb-4">Negotiate for the upper end of the band</h3>

                            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                                Once you&apos;re convinced level is right, you need to negotiate compensation. Target a total compensation number that&apos;s in the upper half of the band for your level.
                            </p>

                            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                                Once you have your number in mind, be firm and specific. <GuideHighlight>Only negotiate if you mean it</GuideHighlight>: you should be genuinely willing to commit if the other side can get to your number. If you still have reservations about the company, deal with that first: you&apos;re not ready to negotiate.
                            </p>

                            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                                The most reliable way to get more money is through <GuideHighlight>competing offers</GuideHighlight>. Consider interviewing with your 2nd or 3rd tier choices or getting a counter-offer from your current employer.
                            </p>
                        </GuideSection>

                        <GuideSection
                            tip={
                                <>
                                    <strong>It&apos;s sometimes even possible for recruiters to make offers above the upper bound of the band</strong>, but that generally requires additional level of approval only granted to candidates with strong competing offers.
                                </>
                            }
                        >
                            <h3 className="font-display text-xl font-medium text-foreground mb-4">The order of flexibility</h3>

                            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                                If you can&apos;t get what you want, offer to shift between compensation components but don&apos;t back down on total compensation. In order of difficulty:
                            </p>

                            <ol className="space-y-4 mb-8">
                                <li className="flex items-start gap-4">
                                    <span className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-sm font-semibold text-emerald-600 shrink-0">1</span>
                                    <div>
                                        <p className="font-medium text-foreground">Signing bonus (Easiest)</p>
                                        <p className="text-muted-foreground">One-time cost, doesn&apos;t affect ongoing budget. Most flex here.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center text-sm font-semibold text-amber-600 shrink-0">2</span>
                                    <div>
                                        <p className="font-medium text-foreground">Equity</p>
                                        <p className="text-muted-foreground">Not cash today, so easier to approve. Some companies prefer this.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="w-7 h-7 rounded-full bg-rose-500/20 flex items-center justify-center text-sm font-semibold text-rose-600 shrink-0">3</span>
                                    <div>
                                        <p className="font-medium text-foreground">Base salary (Hardest)</p>
                                        <p className="text-muted-foreground">Ongoing commitment, affects internal parity. Least flexibility.</p>
                                    </div>
                                </li>
                            </ol>
                        </GuideSection>

                        {/* Counter-Script Library */}
                        <div className="mt-10">
                            <h3 className="font-display text-xl font-medium text-foreground mb-4 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5" />
                                Counter-Scripts for Common Situations
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                Click any situation to see what to say — and what the recruiter hears when you say it.
                            </p>
                            <ScriptLibrary />
                        </div>

                        {/* Sample Negotiation Conversation */}
                        <div className="mt-10">
                            <h3 className="font-display text-xl font-medium text-foreground mb-4 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5" />
                                Example: The counter
                            </h3>
                            <GuideChatUI
                                title="Negotiation call"
                                messages={[
                                    { role: "you", message: "Thanks for connecting again. I've had time to review and I'm really excited about the role and the team.", delay: 500 },
                                    { role: "you", message: "I'd love to make this work. If we can get to $220K total comp in year one — through some mix of base and signing — I'm ready to commit.", delay: 2200 },
                                    { role: "recruiter", message: "I appreciate that. Let me see what I can do. Base is pretty set by the band, but I might have room on the signing bonus.", delay: 4000 },
                                    { role: "you", message: "That would be great. I'm flexible on the mix — $220K total is what I need to move forward quickly.", delay: 5800 },
                                    { role: "recruiter", message: "That's helpful. Let me take this back to comp and I'll get back to you by end of day tomorrow.", delay: 7500 },
                                    { role: "you", message: "Sounds good. I really appreciate you working on this — I'd love to be able to wrap this up so I can focus on ramping up.", delay: 9200 },
                                ]}
                            />
                        </div>

                        <div className="mt-12 rounded-xl border border-brand/20 bg-brand/[0.07] p-8">
                            <h4 className="font-display text-xl font-medium text-foreground mb-3">The most common mistake</h4>
                            <p className="text-lg text-muted-foreground">
                                Skipping the negotiation step. Most teams expect a clear, professional counter. <GuideHighlight>Negotiating is not a red flag; it is normal process behavior.</GuideHighlight>
                            </p>
                        </div>
                    </GuideNumberedSection>

                </div>

                {/* CTA */}
                <div className="mt-24 bg-secondary/10 border border-border/10 rounded-2xl p-10 md:p-14 text-center max-w-3xl mx-auto">
                    <h2 className="font-display text-3xl font-medium mb-4">Ready for your next offer conversation?</h2>
                    <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
                        Make sure your resume is strong before you start interviewing. Get reviewed by a recruiter&apos;s eye.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/workspace">
                            <Button variant="brand" size="lg" className="gap-2 w-full sm:w-auto">
                                Start Your Review
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                        <Link href="/guides/offer-negotiation">
                            <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto">
                                <Users className="w-4 h-4" />
                                All Industries Guide
                            </Button>
                        </Link>
                    </div>
                </div>

            </main>
        </>
    );
}
