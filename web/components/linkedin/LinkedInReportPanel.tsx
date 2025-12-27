'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Eye, Sparkles, Target, CheckCircle2, AlertCircle, Search, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LinkedInReport } from '@/types/linkedin';

interface LinkedInReportPanelProps {
    report: LinkedInReport;
    profileName?: string;
    profileHeadline?: string;
}

export function LinkedInReportPanel({ report, profileName, profileHeadline }: LinkedInReportPanelProps) {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['first-impression', 'headline', 'top-fixes']));

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

    const getScoreColor = (score: number) => {
        if (score >= 85) return 'text-success';
        if (score >= 70) return 'text-brand';
        if (score >= 55) return 'text-amber-500';
        return 'text-destructive';
    };

    const getSubscoreColor = (score: number) => {
        if (score >= 80) return 'bg-success';
        if (score >= 60) return 'bg-brand';
        if (score >= 40) return 'bg-amber-500';
        return 'bg-destructive';
    };

    return (
        <div className="space-y-6">
            {/* Score Hero */}
            <div className="text-center space-y-4 py-6">
                <div className={cn("text-6xl font-serif font-bold", getScoreColor(report.score))}>
                    {report.score}
                </div>
                <div className="space-y-2">
                    <p className="text-lg font-medium text-foreground">{report.score_label}</p>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        {report.score_comment_short}
                    </p>
                </div>
            </div>

            {/* Subscores */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { key: 'visibility', label: 'Visibility', icon: Search },
                    { key: 'first_impression', label: 'First Impression', icon: Eye },
                    { key: 'content_quality', label: 'Content', icon: Sparkles },
                    { key: 'completeness', label: 'Completeness', icon: CheckCircle2 },
                ].map(({ key, label, icon: Icon }) => {
                    const score = report.subscores?.[key as keyof typeof report.subscores] || 0;
                    return (
                        <div key={key} className="p-3 bg-muted/30 rounded-lg border border-border">
                            <div className="flex items-center gap-2 mb-2">
                                <Icon className="w-4 h-4 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">{label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-semibold">{score}</span>
                                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className={cn("h-full rounded-full transition-all", getSubscoreColor(score))}
                                        style={{ width: `${score}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* First Impression Section */}
            <CollapsibleSection
                id="first-impression"
                title="01. Profile First Impression"
                icon={<Eye className="w-4 h-4" />}
                isExpanded={expandedSections.has('first-impression')}
                onToggle={() => toggleSection('first-impression')}
            >
                <div className="space-y-4">
                    <p className="text-foreground font-serif text-lg leading-relaxed">
                        {report.first_impression?.profile_card_verdict}
                    </p>

                    <div className="grid grid-cols-3 gap-4 p-4 bg-muted/20 rounded-lg">
                        <div>
                            <span className="text-xs text-muted-foreground block mb-1">Photo</span>
                            <StatusBadge status={report.first_impression?.photo_status || 'unknown'} />
                        </div>
                        <div>
                            <span className="text-xs text-muted-foreground block mb-1">Banner</span>
                            <StatusBadge status={report.first_impression?.banner_status || 'unknown'} />
                        </div>
                        <div>
                            <span className="text-xs text-muted-foreground block mb-1">Headline</span>
                            <StatusBadge status={report.first_impression?.headline_verdict || 'generic'} />
                        </div>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        <strong>Visibility:</strong> {report.first_impression?.visibility_estimate}
                    </p>
                </div>
            </CollapsibleSection>

            {/* Headline Analysis */}
            <CollapsibleSection
                id="headline"
                title="02. Headline Analysis"
                icon={<Target className="w-4 h-4" />}
                isExpanded={expandedSections.has('headline')}
                onToggle={() => toggleSection('headline')}
            >
                <div className="space-y-4">
                    <div className="p-3 bg-muted/30 rounded-lg border border-border">
                        <span className="text-xs text-muted-foreground block mb-1">Current Headline</span>
                        <p className="text-foreground font-medium">{report.headline_analysis?.current}</p>
                    </div>

                    <p className="text-sm text-foreground">{report.headline_analysis?.verdict}</p>

                    {report.headline_analysis?.issues?.length > 0 && (
                        <div className="space-y-2">
                            <span className="text-xs text-muted-foreground">Issues:</span>
                            <ul className="space-y-1">
                                {report.headline_analysis.issues.map((issue, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                        {issue}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {report.headline_analysis?.rewrite && (
                        <div className="p-3 bg-success/10 rounded-lg border border-success/30">
                            <span className="text-xs text-success block mb-1">Suggested Rewrite</span>
                            <p className="text-foreground font-medium">{report.headline_analysis.rewrite}</p>
                            <p className="text-xs text-muted-foreground mt-2">{report.headline_analysis.why_better}</p>
                        </div>
                    )}
                </div>
            </CollapsibleSection>

            {/* About Analysis */}
            <CollapsibleSection
                id="about"
                title="03. About Section"
                icon={<Sparkles className="w-4 h-4" />}
                isExpanded={expandedSections.has('about')}
                onToggle={() => toggleSection('about')}
            >
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
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
                        <div className="p-3 bg-success/10 rounded-lg border border-success/30">
                            <span className="text-xs text-success block mb-1">Suggested Opening</span>
                            <p className="text-foreground text-sm">{report.about_analysis.rewrite_suggestion}</p>
                        </div>
                    )}
                </div>
            </CollapsibleSection>

            {/* Search Visibility */}
            <CollapsibleSection
                id="visibility"
                title="04. Search Visibility"
                icon={<Search className="w-4 h-4" />}
                isExpanded={expandedSections.has('visibility')}
                onToggle={() => toggleSection('visibility')}
            >
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="text-2xl font-semibold">{report.search_visibility?.score || 0}</div>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className={cn("h-full rounded-full transition-all", getSubscoreColor(report.search_visibility?.score || 0))}
                                style={{ width: `${report.search_visibility?.score || 0}%` }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-xs text-muted-foreground mb-2 block">Keywords Present</span>
                            <div className="flex flex-wrap gap-1">
                                {report.search_visibility?.keywords_present?.map((kw, i) => (
                                    <span key={i} className="text-xs px-2 py-0.5 bg-success/10 text-success rounded">
                                        {kw}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <span className="text-xs text-muted-foreground mb-2 block">Keywords Missing</span>
                            <div className="flex flex-wrap gap-1">
                                {report.search_visibility?.keywords_missing?.map((kw, i) => (
                                    <span key={i} className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded">
                                        {kw}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <p className="text-sm text-muted-foreground">{report.search_visibility?.recommendation}</p>
                </div>
            </CollapsibleSection>

            {/* Top Fixes */}
            <CollapsibleSection
                id="top-fixes"
                title="05. Quick Wins"
                icon={<Lightbulb className="w-4 h-4" />}
                isExpanded={expandedSections.has('top-fixes')}
                onToggle={() => toggleSection('top-fixes')}
            >
                <div className="space-y-3">
                    {report.top_fixes?.map((fix, i) => (
                        <div key={i} className="p-3 bg-muted/20 rounded-lg border border-border">
                            <div className="flex items-start justify-between gap-2 mb-1">
                                <p className="text-sm font-medium text-foreground">{fix.fix}</p>
                                <EffortBadge effort={fix.effort} />
                            </div>
                            <p className="text-xs text-muted-foreground">{fix.why}</p>
                        </div>
                    ))}
                </div>
            </CollapsibleSection>

            {/* Experience Rewrites */}
            {report.experience_rewrites?.length > 0 && (
                <CollapsibleSection
                    id="rewrites"
                    title="06. Experience Red Pen"
                    icon={<Sparkles className="w-4 h-4" />}
                    isExpanded={expandedSections.has('rewrites')}
                    onToggle={() => toggleSection('rewrites')}
                >
                    <div className="space-y-4">
                        {report.experience_rewrites.map((rewrite, i) => (
                            <div key={i} className="space-y-2 border-b border-border pb-4 last:border-0 last:pb-0">
                                <span className="text-xs text-muted-foreground">{rewrite.company}</span>
                                <div className="p-2 bg-destructive/5 rounded border-l-2 border-destructive/50">
                                    <p className="text-sm text-muted-foreground line-through">{rewrite.original}</p>
                                </div>
                                <div className="p-2 bg-success/5 rounded border-l-2 border-success/50">
                                    <p className="text-sm text-foreground">{rewrite.better}</p>
                                </div>
                                <p className="text-xs text-muted-foreground italic">{rewrite.enhancement_note}</p>
                            </div>
                        ))}
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}

// --- Helper Components ---

function CollapsibleSection({
    id,
    title,
    icon,
    children,
    isExpanded,
    onToggle,
}: {
    id: string;
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    isExpanded: boolean;
    onToggle: () => void;
}) {
    return (
        <section className="border border-border rounded-lg overflow-hidden">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <span className="text-brand">{icon}</span>
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">{title}</h3>
                </div>
                {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
            </button>
            {isExpanded && (
                <div className="p-4 pt-0 border-t border-border">
                    {children}
                </div>
            )}
        </section>
    );
}

function StatusBadge({ status }: { status: string }) {
    const configs: Record<string, { bg: string; text: string; label: string }> = {
        professional: { bg: 'bg-success/10', text: 'text-success', label: 'Professional' },
        adequate: { bg: 'bg-brand/10', text: 'text-brand', label: 'Adequate' },
        needs_work: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', label: 'Needs Work' },
        missing: { bg: 'bg-destructive/10', text: 'text-destructive', label: 'Missing' },
        branded: { bg: 'bg-success/10', text: 'text-success', label: 'Branded' },
        generic: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', label: 'Generic' },
        differentiated: { bg: 'bg-success/10', text: 'text-success', label: 'Differentiated' },
        keyword_rich: { bg: 'bg-success/10', text: 'text-success', label: 'Keyword Rich' },
        unknown: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Unknown' },
    };

    const config = configs[status] || configs.unknown;

    return (
        <span className={cn("text-xs px-2 py-0.5 rounded", config.bg, config.text)}>
            {config.label}
        </span>
    );
}

function HookStrengthBadge({ strength }: { strength: string }) {
    const configs: Record<string, { bg: string; text: string; label: string }> = {
        strong: { bg: 'bg-success/10', text: 'text-success', label: 'Strong Hook' },
        adequate: { bg: 'bg-brand/10', text: 'text-brand', label: 'Adequate' },
        weak: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', label: 'Weak' },
        missing: { bg: 'bg-destructive/10', text: 'text-destructive', label: 'Missing' },
    };

    const config = configs[strength] || configs.missing;

    return (
        <span className={cn("text-xs px-2 py-0.5 rounded", config.bg, config.text)}>
            {config.label}
        </span>
    );
}

function EffortBadge({ effort }: { effort: string }) {
    const configs: Record<string, { bg: string; text: string; label: string }> = {
        quick: { bg: 'bg-success/10', text: 'text-success', label: '⚡ Quick' },
        moderate: { bg: 'bg-brand/10', text: 'text-brand', label: '🔧 Moderate' },
        involved: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', label: '📝 Involved' },
    };

    const config = configs[effort] || configs.moderate;

    return (
        <span className={cn("text-xs px-2 py-0.5 rounded shrink-0", config.bg, config.text)}>
            {config.label}
        </span>
    );
}
