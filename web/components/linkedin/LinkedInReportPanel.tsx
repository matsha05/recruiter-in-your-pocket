'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2, AlertCircle, Plus, ArrowRight, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getScoreColor, getDialStrokeColor } from '@/lib/score-utils';
import { PrincipalRecruiterIcon, SignalRadarIcon, TransformArrowIcon, HiddenGemIcon, InsightSparkleIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import type { LinkedInReport } from '@/types/linkedin';

interface LinkedInReportPanelProps {
    report: LinkedInReport;
    profileName?: string;
    profileHeadline?: string;
    isSample?: boolean;
    onNewReport?: () => void;
    freeUsesRemaining?: number;
    hasPaidAccess?: boolean;
    onUpgrade?: () => void;
}

export function LinkedInReportPanel({
    report,
    profileName,
    profileHeadline,
    isSample = false,
    onNewReport,
    freeUsesRemaining = 1,
    hasPaidAccess = false,
    onUpgrade
}: LinkedInReportPanelProps) {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['first-impression', 'headline', 'top-fixes']));
    const [animatedScore, setAnimatedScore] = useState(0);

    // Animate score on mount
    useEffect(() => {
        const duration = 1500;
        const start = 0;
        const end = report.score || 0;
        const startTime = Date.now();

        const animate = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            setAnimatedScore(Math.round(start + (end - start) * ease));
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [report.score]);

    const toggleSection = (section: string) => {
        setExpandedSections(prev => {
            const next = new Set(prev);
            if (next.has(section)) {
                next.delete(section);
            } else {
                next.add(section);
            }
            return next;
        });
    };

    const isExhausted = !isSample && freeUsesRemaining <= 0 && !hasPaidAccess;

    return (
        <div className="space-y-12">

            {/* Hero Card - Matches Resume FirstImpressionSection */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Section Header with horizontal line decoration */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-px bg-border" />
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <PrincipalRecruiterIcon className="w-4 h-4 text-brand" />
                            LinkedIn First Impression
                        </h2>
                    </div>
                    <a
                        href="/research/linkedin-visibility"
                        className="text-[10px] text-muted-foreground/60 hover:text-brand transition-colors font-medium"
                        target="_blank"
                        rel="noopener"
                    >
                        How we score →
                    </a>
                </div>

                {/* Main Card - THE Signature Moment */}
                <div className="bg-card rounded border border-border/60 overflow-hidden">
                    <div className="grid md:grid-cols-5">

                        {/* LEFT: THE VERDICT (3 cols) */}
                        <div className="md:col-span-3 p-6 md:p-8 border-r border-border/40 space-y-6">
                            <div className="space-y-3">
                                <h3 className="text-headline text-foreground">
                                    &quot;Here is what I noticed...&quot;
                                </h3>
                            </div>

                            <p className="text-base text-muted-foreground leading-relaxed">
                                {report.score_comment_long || report.score_comment_short || report.first_impression?.profile_card_verdict}
                            </p>

                            {/* Subscores Grid */}
                            <div className="grid grid-cols-2 gap-3 pt-4">
                                {[
                                    { key: 'visibility', label: 'Visibility', score: report.subscores?.visibility },
                                    { key: 'first_impression', label: 'First Impression', score: report.subscores?.first_impression },
                                    { key: 'content_quality', label: 'Content', score: report.subscores?.content_quality },
                                    { key: 'completeness', label: 'Completeness', score: report.subscores?.completeness },
                                ].map((item) => item.score !== undefined && (
                                    <div
                                        key={item.key}
                                        className="bg-secondary/20 border border-border/40 p-3 rounded flex flex-col items-center justify-center text-center gap-0.5"
                                    >
                                        <span className={cn(
                                            "font-display font-bold tabular-nums text-2xl tracking-tight",
                                            getScoreColor(item.score)
                                        )}>
                                            {item.score}
                                        </span>
                                        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                                            {item.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* RIGHT: THE SCORE DIAL (2 cols) */}
                        <div className="md:col-span-2 p-6 md:p-8 bg-secondary/20 flex flex-col items-center justify-center space-y-6">
                            {/* Score Dial */}
                            <div className="text-center space-y-4">
                                <div className="relative inline-flex items-center justify-center">
                                    <svg className="w-36 h-36 transform -rotate-90">
                                        <circle
                                            cx="72" cy="72" r="60"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                            fill="transparent"
                                            className="text-black/5 dark:text-white/5"
                                        />
                                        <circle
                                            cx="72" cy="72" r="60"
                                            stroke={getDialStrokeColor(report.score || 0)}
                                            strokeWidth="3"
                                            fill="transparent"
                                            strokeDasharray={377}
                                            strokeDashoffset={377 - (377 * animatedScore) / 100}
                                            strokeLinecap="round"
                                            className="transition-all duration-1000 ease-out"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                                        <span className="text-5xl font-display font-bold tracking-tighter tabular-nums">{animatedScore}</span>
                                        <span className="text-label text-muted-foreground">Score</span>
                                    </div>
                                </div>

                                {/* Score Band Badge */}
                                <div className="transition-all duration-300 ease-out">
                                    <span className={cn(
                                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-sm border text-[11px] font-bold uppercase tracking-wider",
                                        (report.score || 0) >= 85 ? "bg-success/10 border-success/20 text-success" :
                                            (report.score || 0) >= 70 ? "bg-premium/10 border-premium/20 text-premium" :
                                                "bg-destructive/10 border-destructive/20 text-destructive"
                                    )}>
                                        <CheckCircle2 className="w-3 h-3" /> {report.score_label || 'Needs Work'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent animate-in fade-in duration-700" />

            {/* 01. Profile First Impression */}
            <section id="linkedin-first-impression" className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
                <ReportSectionHeader
                    icon={<PrincipalRecruiterIcon className="w-4 h-4 text-brand" />}
                    number="01"
                    title="Profile First Impression"
                    subtitle="What I noticed in 3 seconds on your profile card."
                />

                <div className="mt-6 space-y-6">
                    <p className="font-display text-xl text-foreground leading-relaxed">
                        &quot;{report.first_impression?.profile_card_verdict}&quot;
                    </p>

                    <div className="grid grid-cols-3 gap-4 p-4 bg-secondary/20 rounded border border-border/40">
                        <div className="text-center">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">Photo</span>
                            <StatusBadge status={report.first_impression?.photo_status || 'unknown'} />
                        </div>
                        <div className="text-center">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">Banner</span>
                            <StatusBadge status={report.first_impression?.banner_status || 'unknown'} />
                        </div>
                        <div className="text-center">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">Headline</span>
                            <StatusBadge status={report.first_impression?.headline_verdict || 'generic'} />
                        </div>
                    </div>

                    {report.first_impression?.visibility_estimate && (
                        <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">Visibility:</span> {report.first_impression.visibility_estimate}
                        </p>
                    )}
                </div>
            </section>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            {/* 02. Headline Analysis */}
            <section id="linkedin-headline" className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                <ReportSectionHeader
                    icon={<TransformArrowIcon className="w-4 h-4 text-brand" />}
                    number="02"
                    title="Headline Analysis"
                    subtitle="The 120 characters that decide if recruiters click."
                />

                <div className="mt-6 space-y-6">
                    {/* Current Headline */}
                    <div className="p-4 bg-muted/30 rounded border border-border/40">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">Current</span>
                        <p className="text-foreground font-medium">{report.headline_analysis?.current}</p>
                    </div>

                    <p className="text-sm text-foreground">{report.headline_analysis?.verdict}</p>

                    {/* Issues */}
                    {report.headline_analysis?.issues?.length > 0 && (
                        <ul className="space-y-2">
                            {report.headline_analysis.issues.map((issue, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <AlertCircle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                                    {issue}
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Suggested Rewrite */}
                    {report.headline_analysis?.rewrite && (
                        <CopyableSuggestionCard
                            label="Suggested"
                            content={report.headline_analysis.rewrite}
                            note={report.headline_analysis.why_better}
                        />
                    )}
                </div>
            </section>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            {/* 03. About Section */}
            <section id="linkedin-about" className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
                <ReportSectionHeader
                    icon={<InsightSparkleIcon className="w-4 h-4 text-brand" />}
                    number="03"
                    title="About Section"
                    subtitle="Your opening hook — the 2 seconds that matter."
                />

                <div className="mt-6 space-y-6">
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">Hook Strength:</span>
                        <HookStrengthBadge strength={report.about_analysis?.hook_strength || 'missing'} />
                    </div>

                    {report.about_analysis?.hook_verdict && (
                        <p className="text-sm text-foreground">{report.about_analysis.hook_verdict}</p>
                    )}

                    {report.about_analysis?.full_verdict && (
                        <p className="text-sm text-muted-foreground">{report.about_analysis.full_verdict}</p>
                    )}

                    {report.about_analysis?.rewrite_suggestion && (
                        <CopyableSuggestionCard
                            label="Suggested Opening"
                            content={report.about_analysis.rewrite_suggestion}
                        />
                    )}
                </div>
            </section>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            {/* 04. Search Visibility */}
            <section id="linkedin-visibility" className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
                <ReportSectionHeader
                    icon={<SignalRadarIcon className="w-4 h-4 text-brand" />}
                    number="04"
                    title="Search Visibility"
                    subtitle="Keywords that help recruiters find you."
                />

                <div className="mt-6 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Keywords Present */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Present</h4>
                            <div className="flex flex-wrap gap-2">
                                {report.search_visibility?.keywords_present?.map((kw, i) => (
                                    <span key={i} className="text-xs px-2.5 py-1 bg-success/10 text-success rounded border border-success/20">
                                        {kw}
                                    </span>
                                ))}
                                {(!report.search_visibility?.keywords_present || report.search_visibility.keywords_present.length === 0) && (
                                    <span className="text-xs text-muted-foreground">None detected</span>
                                )}
                            </div>
                        </div>

                        {/* Keywords Missing */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-warning">Missing</h4>
                            <div className="flex flex-wrap gap-2">
                                {report.search_visibility?.keywords_missing?.map((kw, i) => (
                                    <span key={i} className="text-xs px-2.5 py-1 bg-warning/10 text-warning rounded border border-warning/20">
                                        {kw}
                                    </span>
                                ))}
                                {(!report.search_visibility?.keywords_missing || report.search_visibility.keywords_missing.length === 0) && (
                                    <span className="text-xs text-muted-foreground">None identified</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {report.search_visibility?.recommendation && (
                        <p className="text-sm text-muted-foreground">{report.search_visibility.recommendation}</p>
                    )}
                </div>
            </section>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            {/* 05. Quick Wins */}
            <section id="linkedin-quick-wins" className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
                <ReportSectionHeader
                    icon={<HiddenGemIcon className="w-4 h-4 text-brand" />}
                    number="05"
                    title="Quick Wins"
                    subtitle="High-impact changes you can make today."
                />

                <div className="mt-6 space-y-4">
                    {report.top_fixes?.map((fix, i) => (
                        <div key={i} className="p-4 bg-card border border-border/60 rounded">
                            <p className="text-sm font-medium text-foreground mb-2">{fix.fix}</p>
                            <p className="text-xs text-muted-foreground">{fix.why}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Experience Rewrites (if present) */}
            {report.experience_rewrites?.length > 0 && (
                <>
                    <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-600">
                        <ReportSectionHeader
                            icon={<TransformArrowIcon className="w-4 h-4 text-brand" />}
                            number="06"
                            title="Experience Red Pen"
                            subtitle="Copy-paste upgrades for your experience bullets."
                        />

                        <div className="mt-6 space-y-6">
                            {report.experience_rewrites.map((rewrite, i) => (
                                <div key={i} className="space-y-3 pb-6 border-b border-border/40 last:border-0 last:pb-0">
                                    <span className="text-xs font-medium text-muted-foreground">{rewrite.company}</span>
                                    <div className="p-3 bg-destructive/5 rounded border-l-2 border-destructive/40">
                                        <p className="text-sm text-muted-foreground line-through">{rewrite.original}</p>
                                    </div>
                                    <div className="p-3 bg-success/5 rounded border-l-2 border-success/40">
                                        <p className="text-sm text-foreground">{rewrite.better}</p>
                                    </div>
                                    {rewrite.enhancement_note && (
                                        <p className="text-xs text-muted-foreground italic">{rewrite.enhancement_note}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                </>
            )}

            {/* Report Footer - "What's next?" */}
            <div className="pt-8 space-y-6">
                <div className="h-px bg-gradient-to-r from-brand/20 via-brand/40 to-brand/20" />

                <div className="text-center space-y-6">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        What&apos;s next?
                    </h3>

                    {isSample ? (
                        <div className="space-y-3">
                            <p className="text-sm text-muted-foreground max-w-md mx-auto">
                                This is what a recruiter sees. Ready to see yours?
                            </p>
                            {onNewReport && (
                                <Button
                                    variant="brand"
                                    size="lg"
                                    onClick={onNewReport}
                                >
                                    Run Your Free Review
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            )}
                        </div>
                    ) : isExhausted && onUpgrade ? (
                        <div className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                That was your free review. Want to run another version?
                            </p>
                            <Button
                                variant="premium"
                                onClick={onUpgrade}
                            >
                                <InsightSparkleIcon className="w-4 h-4 mr-2" />
                                Get More Reviews
                            </Button>
                        </div>
                    ) : onNewReport ? (
                        <div className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                {hasPaidAccess
                                    ? "Paid access is active. Iterate profile versions until the score stabilizes."
                                    : freeUsesRemaining > 0
                                    ? `You have ${freeUsesRemaining} free review${freeUsesRemaining > 1 ? 's' : ''} remaining.`
                                    : 'Ready to analyze another version?'}
                            </p>
                            <Button
                                variant="brand"
                                onClick={onNewReport}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Run Another
                            </Button>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

// --- Helper Components ---

function ReportSectionHeader({
    icon,
    number,
    title,
    subtitle
}: {
    icon: React.ReactNode;
    number: string;
    title: string;
    subtitle: string;
}) {
    return (
        <div className="space-y-2">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                {icon}
                {number}. {title}
            </h2>
            <p className="font-display font-medium text-xl text-foreground tracking-tight leading-snug">{subtitle}</p>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const configs: Record<string, { bg: string; text: string; border: string; label: string }> = {
        professional: { bg: "bg-success/10", text: "text-success", border: "border-success/20", label: "Professional" },
        adequate: { bg: "bg-brand/10", text: "text-brand", border: "border-brand/20", label: "Adequate" },
        needs_work: { bg: "bg-warning/10", text: "text-warning", border: "border-warning/20", label: "Needs Work" },
        missing: { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/20", label: "Missing" },
        branded: { bg: "bg-success/10", text: "text-success", border: "border-success/20", label: "Branded" },
        generic: { bg: "bg-warning/10", text: "text-warning", border: "border-warning/20", label: "Generic" },
        differentiated: { bg: "bg-success/10", text: "text-success", border: "border-success/20", label: "Differentiated" },
        keyword_rich: { bg: "bg-success/10", text: "text-success", border: "border-success/20", label: "Keyword Rich" },
        unknown: { bg: "bg-muted", text: "text-muted-foreground", border: "border-border/40", label: "Unknown" },
    };

    const config = configs[status] || configs.unknown;

    return (
        <span className={cn("text-xs px-2.5 py-1 rounded border", config.bg, config.text, config.border)}>
            {config.label}
        </span>
    );
}

function HookStrengthBadge({ strength }: { strength: string }) {
    const configs: Record<string, { bg: string; text: string; border: string; label: string }> = {
        strong: { bg: "bg-success/10", text: "text-success", border: "border-success/20", label: "Strong Hook" },
        adequate: { bg: "bg-brand/10", text: "text-brand", border: "border-brand/20", label: "Adequate" },
        weak: { bg: "bg-warning/10", text: "text-warning", border: "border-warning/20", label: "Weak" },
        missing: { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/20", label: "Missing" },
    };

    const config = configs[strength] || configs.missing;

    return (
        <span className={cn("text-xs px-2.5 py-1 rounded border", config.bg, config.text, config.border)}>
            {config.label}
        </span>
    );
}



function CopyableSuggestionCard({ label, content, note }: { label: string; content: string; note?: string }) {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="group p-4 bg-success/5 rounded border border-success/20">
            <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-success">{label}</span>
                <button
                    onClick={handleCopy}
                    className={cn(
                        "flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all",
                        copied
                            ? "bg-success/10 text-success"
                            : "bg-muted/50 text-muted-foreground hover:bg-success/10 hover:text-success opacity-0 group-hover:opacity-100"
                    )}
                >
                    {copied ? (
                        <>
                            <Check className="h-3 w-3" />
                            Copied
                        </>
                    ) : (
                        <>
                            <Copy className="h-3 w-3" />
                            Copy
                        </>
                    )}
                </button>
            </div>
            <p className="text-foreground font-medium">{content}</p>
            {note && (
                <p className="text-xs text-muted-foreground mt-2">{note}</p>
            )}
        </div>
    );
}
