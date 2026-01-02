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
