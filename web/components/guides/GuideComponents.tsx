"use client";

import { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Lightbulb, AlertTriangle, Info, Check } from "lucide-react";

/**
 * Guide Components - Candor-inspired premium layout patterns
 * 
 * Components:
 * - GuideSection: Two-column layout with marginalia
 * - GuideTip: Side tips that appear in the margin
 * - GuideAccordion: Collapsible deep-dive sections
 * - GuideChatUI: Animated conversation bubbles for scripts
 * - GuideNumberedSection: Giant numbered section anchors
 */

// ============================================================================
// GuideSection: Two-column layout with marginalia
// ============================================================================

interface GuideSectionProps {
    children: ReactNode;
    tip?: ReactNode;
    tipType?: "insight" | "warning" | "info";
}

export function GuideSection({ children, tip, tipType = "insight" }: GuideSectionProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 lg:gap-12">
            <div className="min-w-0">{children}</div>
            {tip && (
                <div className="hidden lg:block">
                    <GuideTip type={tipType}>{tip}</GuideTip>
                </div>
            )}
        </div>
    );
}

// ============================================================================
// GuideTip: Contextual side tips (marginalia) - "Recruiter's Take"
// ============================================================================

interface GuideTipProps {
    children: ReactNode;
    type?: "insight" | "warning" | "info";
}

export function GuideTip({ children, type = "insight" }: GuideTipProps) {
    const config = {
        insight: { label: "Recruiter's Take", icon: Lightbulb, color: "text-brand", bg: "bg-brand/5", border: "border-brand/20" },
        warning: { label: "Watch Out", icon: AlertTriangle, color: "text-rose-500", bg: "bg-rose-500/5", border: "border-rose-500/20" },
        info: { label: "Good to Know", icon: Info, color: "text-blue-500", bg: "bg-blue-500/5", border: "border-blue-500/20" },
    };
    const { label, icon: Icon, color, bg, border } = config[type];

    return (
        <div className={`sticky top-24 p-4 rounded-lg border ${bg} ${border}`}>
            <div className={`flex items-center gap-2 ${color} text-[10px] font-bold uppercase tracking-widest mb-2`}>
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed">
                {children}
            </div>
        </div>
    );
}

// ============================================================================
// GuideAccordion: Collapsible deep-dive sections
// ============================================================================

interface GuideAccordionProps {
    title: string;
    badge?: string;
    children: ReactNode;
    defaultOpen?: boolean;
}

export function GuideAccordion({ title, badge, children, defaultOpen = false }: GuideAccordionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border border-border/40 rounded-lg overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between gap-4 p-4 text-left bg-muted/20 hover:bg-muted/40 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <span className="font-medium text-foreground">{title}</span>
                    {badge && (
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-600 border border-violet-500/20">
                            {badge}
                        </span>
                    )}
                </div>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </motion.div>
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <div className="p-6 border-t border-border/30">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ============================================================================
// GuideChatUI: Animated conversation bubbles
// ============================================================================

interface ChatMessage {
    role: "you" | "recruiter";
    message: string;
    delay?: number;
}

interface GuideChatUIProps {
    messages: ChatMessage[];
    title?: string;
}

export function GuideChatUI({ messages, title }: GuideChatUIProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [visibleMessages, setVisibleMessages] = useState<number[]>([]);

    const playConversation = () => {
        setIsPlaying(true);
        setVisibleMessages([]);

        messages.forEach((msg, index) => {
            const delay = msg.delay ?? (index * 1200 + 500);
            setTimeout(() => {
                setVisibleMessages(prev => [...prev, index]);
                if (index === messages.length - 1) {
                    setTimeout(() => setIsPlaying(false), 500);
                }
            }, delay);
        });
    };

    const resetConversation = () => {
        setVisibleMessages([]);
        setIsPlaying(false);
    };

    return (
        <div className="rounded-xl bg-slate-900 dark:bg-slate-950 border border-slate-800 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                <span className="text-sm font-medium text-slate-300">
                    {title || "Sample Conversation"}
                </span>
                <button
                    onClick={isPlaying ? resetConversation : playConversation}
                    disabled={isPlaying}
                    className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-brand/20 text-brand hover:bg-brand/30 transition-colors disabled:opacity-50"
                >
                    {visibleMessages.length === messages.length ? "Replay" : isPlaying ? "Playing..." : "Play"}
                </button>
            </div>

            {/* Chat area */}
            <div className="p-4 space-y-3 min-h-[160px]">
                <AnimatePresence>
                    {messages.map((msg, index) => (
                        visibleMessages.includes(index) && (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className={`flex ${msg.role === "you" ? "justify-end" : "justify-start"}`}
                            >
                                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${msg.role === "you"
                                    ? "bg-brand text-white rounded-br-md"
                                    : "bg-slate-800 text-slate-200 rounded-bl-md"
                                    }`}>
                                    <div className="text-[10px] font-medium uppercase tracking-wider opacity-60 mb-1">
                                        {msg.role === "you" ? "You" : "Recruiter"}
                                    </div>
                                    <p className="text-sm leading-relaxed">{msg.message}</p>
                                </div>
                            </motion.div>
                        )
                    ))}
                </AnimatePresence>

                {visibleMessages.length === 0 && !isPlaying && (
                    <div className="flex items-center justify-center h-32 text-slate-500 text-sm">
                        Click &quot;Play&quot; to see the conversation
                    </div>
                )}
            </div>
        </div>
    );
}

// ============================================================================
// GuideNumberedSection: Giant numbered anchors
// ============================================================================

interface GuideNumberedSectionProps {
    number: number;
    title: string;
    children: ReactNode;
    id?: string;
}

export function GuideNumberedSection({ number, title, children, id }: GuideNumberedSectionProps) {
    return (
        <section id={id} className="scroll-mt-24">
            <div className="flex items-start gap-6 mb-6">
                <div className="shrink-0 w-14 h-14 rounded-xl bg-muted/50 border border-border/30 flex items-center justify-center">
                    <span className="text-2xl font-display font-bold text-foreground">{number}</span>
                </div>
                <div className="pt-2">
                    <h2 className="font-display text-2xl font-medium text-foreground">{title}</h2>
                </div>
            </div>
            <div className="pl-0 lg:pl-20">
                {children}
            </div>
        </section>
    );
}

// ============================================================================
// GuideHighlight: Inline bold emphasis for skimmability
// ============================================================================

interface GuideHighlightProps {
    children: ReactNode;
}

export function GuideHighlight({ children }: GuideHighlightProps) {
    return (
        <strong className="font-semibold text-foreground bg-brand/10 px-1 rounded">
            {children}
        </strong>
    );
}

// ============================================================================
// GuideQuickWin: Checkmark list item
// ============================================================================

interface GuideQuickWinProps {
    children: ReactNode;
}

export function GuideQuickWin({ children }: GuideQuickWinProps) {
    return (
        <li className="flex items-start gap-3">
            <div className="shrink-0 w-5 h-5 rounded-full bg-success/20 flex items-center justify-center mt-0.5">
                <Check className="w-3 h-3 text-success" />
            </div>
            <span className="text-muted-foreground">{children}</span>
        </li>
    );
}

// ============================================================================
// EmployerMathCallout: Shows the employer's cost perspective
// ============================================================================

import { Calculator } from "lucide-react";

export function EmployerMathCallout() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="my-10 p-6 rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/5"
        >
            <div className="flex items-center gap-2 text-amber-600 text-[10px] font-bold uppercase tracking-widest mb-4">
                <Calculator className="w-4 h-4" />
                <span>The Math They&apos;re Doing</span>
            </div>
            <div className="space-y-3">
                <div className="flex items-start gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-sm font-bold text-amber-600">$</span>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        <strong className="text-foreground">$24,000+</strong> just to get you to this offer (job posts, resume review, interviews, coordination)
                    </p>
                </div>
                <div className="flex items-start gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-sm font-bold text-amber-600">%</span>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        <strong className="text-foreground">150-200%</strong> of your salary = your fully-loaded annual cost to them (benefits, taxes, overhead)
                    </p>
                </div>
                <div className="flex items-start gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-sm font-bold text-amber-600">~</span>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Your extra <strong className="text-foreground">$5K</strong> = roughly 3% of your annual cost. Mouse droppings.
                    </p>
                </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground italic">
                &ldquo;They will not feel offended if you ask for it.&rdquo; — patio11
            </p>
        </motion.div>
    );
}

// ============================================================================
// ScriptLibrary: Accordion-based counter-script scenarios (ENHANCED)
// ============================================================================

interface ScriptScenario {
    situation: string;
    context: string;
    scripts: {
        label: string;
        text: string;
    }[];
    recruiterHears: string;
    whyItWorks: string;
    ifTheyPushBack?: string;
    commonMistake?: string;
}

const COUNTER_SCRIPTS: ScriptScenario[] = [
    {
        situation: "They ask for your salary expectation first",
        context: "This happens early — during screening or even the application. They want to anchor you to a number before you know enough to value yourself properly.",
        scripts: [
            {
                label: "Polite deflection",
                text: "I'm focused on finding a mutual fit first. If we're both excited about working together, I'm confident we can figure out the numbers."
            },
            {
                label: "Redirect to band",
                text: "I'd love to understand the full scope of the role first. Can you share the range budgeted for this position?"
            },
            {
                label: "Buy time",
                text: "I'd rather not anchor on a number until I understand the total compensation picture. What does the full package typically look like at this level?"
            }
        ],
        recruiterHears: "They're not desperate. They've done this before. I'll need to share our range first or lose control of the conversation.",
        whyItWorks: "Whoever says a number first sets the anchor. By deflecting, you force them to reveal their range — which becomes the floor, not the ceiling.",
        ifTheyPushBack: "If they insist, say: 'I'm flexible within the market range for this role. I'd need to see the full package before committing to a number.'",
        commonMistake: "Giving a number because you feel awkward. That one moment of discomfort can cost you $10K+ over the life of the offer."
    },
    {
        situation: "They say 'this is the best we can do'",
        context: "You've countered, and they've come back with resistance. This is often a test — or a signal to shift to other levers.",
        scripts: [
            {
                label: "Shift to other levers",
                text: "I appreciate you pushing on this. Are there other parts of the package that might have more flexibility — signing bonus, equity, or start date?"
            },
            {
                label: "Ask what's possible",
                text: "I understand base may be constrained. What would it take to get to [X] in total year-one compensation?"
            },
            {
                label: "Commit conditionally",
                text: "If there's any way to bridge the gap with a signing bonus, I'd be ready to sign today."
            }
        ],
        recruiterHears: "They're persistent but collaborative. They're not walking. They're giving me room to find a solution. Let me check what else I can do.",
        whyItWorks: "You're not fighting — you're problem-solving together. And you're implicitly signaling that you're close to yes, which motivates them to find creative solutions.",
        ifTheyPushBack: "'This is truly the max' is sometimes true. If they won't budge on anything, you can still negotiate start date, title, review timing, or remote flexibility.",
        commonMistake: "Accepting the first 'no' as final. Recruiters expect pushback. A single 'no' is often just the start of the real conversation."
    },
    {
        situation: "They lowballed you",
        context: "The offer is significantly below market or your expectations. Stay calm — this is recoverable if you handle it right.",
        scripts: [
            {
                label: "Acknowledge & pivot",
                text: "Thank you for the offer — I'm genuinely excited about this role and team. There were a couple of things I wanted to discuss before I can move forward."
            },
            {
                label: "State your target",
                text: "Based on my research and experience, I was expecting something closer to [X]. Is there room to revisit the base?"
            },
            {
                label: "Focus on total comp",
                text: "I'd love to make this work. If we can get to [X] in total year-one compensation — through some mix of base and signing — I'm ready to commit."
            }
        ],
        recruiterHears: "They're serious but not walking away. They're being professional about this. I need to go back to comp committee with a counter-proposal.",
        whyItWorks: "You've shown you're interested (so they won't lose you) but you've also established that the current offer isn't acceptable. This forces action without burning bridges.",
        ifTheyPushBack: "If they claim budget constraints, ask: 'Is this offer at the top of the band for my level, or is there room to grow?' Sometimes you can negotiate a guaranteed 6-month review.",
        commonMistake: "Reacting emotionally or expressing disappointment. Stay positive and solution-oriented. Your frustration doesn't help you — it just makes the recruiter defensive."
    },
    {
        situation: "They pressure you with a 24-48 hour deadline",
        context: "Exploding offers are a pressure tactic. Legitimate companies will give you reasonable time to make a major life decision.",
        scripts: [
            {
                label: "Request extension",
                text: "I take this decision seriously and want to make a well-considered choice. Would it be possible to extend to Friday?"
            },
            {
                label: "Explain your process",
                text: "I'm very interested, but I want to discuss this with my family and review the full package carefully. Could we connect early next week?"
            },
            {
                label: "Call the bluff (politely)",
                text: "I'd hate to rush a decision this important. If the timeline is truly fixed, can you help me understand why?"
            }
        ],
        recruiterHears: "They have options. If I don't give them time, I might lose them. Better to flex than to push them away.",
        whyItWorks: "Candidates who seem in-demand get treated better. Asking for time signals you're not desperate and may have other options.",
        ifTheyPushBack: "If they refuse any extension, that's a red flag about the company culture. Most companies will give you 3-5 business days. A week is standard for senior roles.",
        commonMistake: "Caving to pressure and accepting prematurely. You can't negotiate once you've signed. The extra 48 hours is worth it."
    },
    {
        situation: "They ask 'Is this your top choice?'",
        context: "They're trying to gauge your commitment level before investing more effort. This is their way of asking: 'If we get you the number, will you sign?'",
        scripts: [
            {
                label: "Signal without committing",
                text: "I'm very excited about this role and the team. A stronger offer would make this decision much easier for me."
            },
            {
                label: "Be honest (if true)",
                text: "You're definitely in my top two. The compensation is the main thing I'm weighing right now."
            },
            {
                label: "Redirect to value",
                text: "I can see myself here long-term. I want to make sure the offer reflects the value I'll bring."
            }
        ],
        recruiterHears: "They're interested but not locked in. If I improve the offer, I can probably close them. I need to fight for a better package.",
        whyItWorks: "You're giving them hope while maintaining leverage. They hear 'yes, if...' which motivates them to get you what you need.",
        ifTheyPushBack: "If they insist on a commitment before improving the offer, say: 'I'd love to commit, but I need to see the package that makes sense for me. Let's work together on that.'",
        commonMistake: "Saying 'yes, you're my top choice' before negotiating. Once you've committed, you've lost all leverage."
    },
    {
        situation: "You have a competing offer",
        context: "This is the strongest lever you have. Use it ethically — don't fabricate offers, but do use real offers to your advantage.",
        scripts: [
            {
                label: "Direct approach",
                text: "I've received another offer at [X]. I'd prefer to join [your company] — would you be able to revisit the compensation to make this work?"
            },
            {
                label: "Frame as helping them",
                text: "I want to be transparent: I have another offer I need to respond to. I'd rather be here, but I need the numbers to work. What can we do?"
            },
            {
                label: "Create urgency",
                text: "I have a deadline on another offer by Friday. If you can match [X], I'll sign today and withdraw from the other process."
            }
        ],
        recruiterHears: "They have real leverage. I need to engage or I'll lose them. Time to escalate to comp committee and fight for a better package.",
        whyItWorks: "Competing offers are the single most effective negotiation tool. They create urgency, prove your market value, and give the recruiter ammunition to advocate for you internally.",
        ifTheyPushBack: "If they say they can't match, ask: 'What's the best you can do? I want to make this decision based on the full picture.' Sometimes they'll find money they didn't have before.",
        commonMistake: "Lying about offers you don't have. Recruiters talk. If you're caught bluffing, you'll lose the offer entirely. Only use this if you genuinely have alternatives."
    }
];

export function ScriptLibrary() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <div className="space-y-3">
            {COUNTER_SCRIPTS.map((script, index) => (
                <div
                    key={index}
                    className="border border-border/40 rounded-lg overflow-hidden"
                >
                    <button
                        onClick={() => setOpenIndex(openIndex === index ? null : index)}
                        className="w-full flex items-center justify-between gap-4 p-4 text-left bg-muted/20 hover:bg-muted/40 transition-colors"
                    >
                        <span className="font-medium text-foreground text-sm">{script.situation}</span>
                        <motion.div
                            animate={{ rotate: openIndex === index ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                        </motion.div>
                    </button>
                    <AnimatePresence initial={false}>
                        {openIndex === index && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                            >
                                <div className="p-5 border-t border-border/30 space-y-5">
                                    {/* Context */}
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {script.context}
                                    </p>

                                    {/* Script variations */}
                                    <div>
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-brand mb-3">
                                            What you say
                                        </div>
                                        <div className="space-y-2">
                                            {script.scripts.map((s, i) => (
                                                <div key={i} className="bg-brand/5 border border-brand/20 rounded-lg p-3">
                                                    <div className="text-[10px] font-medium text-brand/70 uppercase mb-1">
                                                        {s.label}
                                                    </div>
                                                    <p className="text-sm text-foreground leading-relaxed">
                                                        &ldquo;{s.text}&rdquo;
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* What recruiter hears */}
                                    <div>
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                                            What the recruiter hears
                                        </div>
                                        <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-3 leading-relaxed italic">
                                            {script.recruiterHears}
                                        </p>
                                    </div>

                                    {/* Why it works */}
                                    <div>
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-2">
                                            Why this works
                                        </div>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {script.whyItWorks}
                                        </p>
                                    </div>

                                    {/* If they push back */}
                                    {script.ifTheyPushBack && (
                                        <div>
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-2">
                                                If they push back
                                            </div>
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                {script.ifTheyPushBack}
                                            </p>
                                        </div>
                                    )}

                                    {/* Common mistake */}
                                    {script.commonMistake && (
                                        <div className="flex items-start gap-2 text-rose-600 bg-rose-500/5 border border-rose-500/20 rounded-lg p-3">
                                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                            <div>
                                                <div className="text-[10px] font-bold uppercase tracking-widest mb-1">
                                                    Common mistake
                                                </div>
                                                <p className="text-sm leading-relaxed text-rose-700 dark:text-rose-400">
                                                    {script.commonMistake}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );
}


// ============================================================================
// LeverDeepDive: Expandable deep-dives for each negotiation lever
// ============================================================================

interface LeverInfo {
    name: string;
    whyEasier: string;
    howToAsk: string;
    typicalRange?: string;
    watchOut?: string;
}

const LEVER_DEEP_DIVES: LeverInfo[] = [
    {
        name: "Signing Bonus",
        whyEasier: "One-time cost, not recurring burn. Doesn't affect salary bands. Invisible to coworkers.",
        howToAsk: "Would there be room for a signing bonus to help bridge the gap?",
        typicalRange: "$5K-$100K depending on level and company size",
        watchOut: "May have a clawback clause if you leave within 12 months"
    },
    {
        name: "Title / Level",
        whyEasier: "Unlocks a higher salary band. Affects your future negotiating power at the next job.",
        howToAsk: "Given my experience, would I qualify for [Senior / Staff / Principal] level?",
        watchOut: "Title inflation at some companies makes titles meaningless. Check levels.fyi for equivalents."
    },
    {
        name: "Vacation / PTO",
        whyEasier: "Low cost to company. Often at manager's discretion.",
        howToAsk: "If you could do 4 weeks instead of 3, I could be more flexible on the base.",
        typicalRange: "Extra 1-2 weeks is common and easy to approve"
    },
    {
        name: "Remote / Flexibility",
        whyEasier: "Often entirely at manager's discretion. No budget impact.",
        howToAsk: "Is there flexibility on the in-office requirement? I'm productive from anywhere.",
        watchOut: "Some companies have strict hybrid policies that aren't manager-level decisions."
    },
    {
        name: "Start Date",
        whyEasier: "A strategic start date can let you collect a bonus from your current employer or negotiate signing timing.",
        howToAsk: "If I start after [date], I can collect my annual bonus. Would [later date] work?",
    },
    {
        name: "Professional Development",
        whyEasier: "Training budgets often exist and are under-used. Conferences, courses, certifications.",
        howToAsk: "Does the team have a learning budget? I'd love to continue investing in [skill].",
        typicalRange: "$2K-$10K annually at most companies"
    }
];

export function LeverDeepDives() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <div className="space-y-3">
            {LEVER_DEEP_DIVES.map((lever, index) => (
                <div
                    key={index}
                    className="border border-border/40 rounded-lg overflow-hidden"
                >
                    <button
                        onClick={() => setOpenIndex(openIndex === index ? null : index)}
                        className="w-full flex items-center justify-between gap-4 p-4 text-left bg-muted/20 hover:bg-muted/40 transition-colors"
                    >
                        <span className="font-medium text-foreground">{lever.name}</span>
                        <motion.div
                            animate={{ rotate: openIndex === index ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                        </motion.div>
                    </button>
                    <AnimatePresence initial={false}>
                        {openIndex === index && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                            >
                                <div className="p-5 border-t border-border/30 space-y-4">
                                    <div>
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                                            Why it&apos;s easier to get
                                        </div>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {lever.whyEasier}
                                        </p>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-brand mb-1">
                                            How to ask
                                        </div>
                                        <p className="text-sm text-foreground bg-brand/5 border border-brand/20 rounded-lg p-3 leading-relaxed">
                                            &ldquo;{lever.howToAsk}&rdquo;
                                        </p>
                                    </div>
                                    {lever.typicalRange && (
                                        <div>
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                                                Typical range
                                            </div>
                                            <p className="text-sm text-muted-foreground">{lever.typicalRange}</p>
                                        </div>
                                    )}
                                    {lever.watchOut && (
                                        <div className="flex items-start gap-2 text-amber-600 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                            <p className="text-sm leading-relaxed">{lever.watchOut}</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );
}

