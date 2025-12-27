"use client";

import { ReportData } from "./ReportTypes";
import { ReportSectionHeader } from "./ReportSectionHeader";
import { Target, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveUnlockContext } from "@/lib/unlock/unlockContext";
import { Analytics } from "@/lib/analytics";
import { InsightSparkleIcon } from "@/components/icons/InsightSparkleIcon";

interface JobAlignmentSectionProps {
    data: ReportData;
    hasJobDescription?: boolean;
    isGated?: boolean;
    onUpgrade?: () => void;
}

export function JobAlignmentSection({ data, hasJobDescription = false, isGated = false, onUpgrade }: JobAlignmentSectionProps) {
    const alignment = data.job_alignment;
    if (!alignment) {
        return (
            <section className="space-y-6">
                <ReportSectionHeader
                    icon={<Target className="w-4 h-4 text-brand" />}
                    number="05"
                    title="Where You Compete"
                    subtitle="Your primary lane and how to position."
                />
                <div className="rounded-lg border border-border/60 bg-card shadow-sm p-5 text-sm text-muted-foreground">
                    {hasJobDescription
                        ? "Alignment was not generated for this run. Try again, or verify your job description pasted correctly."
                        : "Add a job description to get role-specific alignment and positioning notes."}
                </div>
            </section>
        );
    }

    const roleFit = alignment.role_fit;
    const primaryRole = roleFit?.best_fit_roles?.[0];
    const otherFitRoles = roleFit?.best_fit_roles?.slice(1) || [];
    const stretchRoles = roleFit?.stretch_roles || [];
    const positioning = alignment.positioning_suggestion;

    // Metadata for footer
    const seniority = roleFit?.seniority_read;
    const companyStage = roleFit?.company_stage_fit;
    const industries = roleFit?.industry_signals || [];

    // Detect if JD match data exists (either from user input OR from sample data)
    const hasJdMatchData = alignment.jd_match_score !== undefined && alignment.jd_match_score > 0;
    const hasJdKeywords = alignment.jd_keywords && alignment.jd_keywords.total_count && alignment.jd_keywords.total_count > 0;
    const showJdSection = hasJobDescription || hasJdMatchData;

    // Build footer metadata string
    const footerParts: string[] = [];
    if (seniority) footerParts.push(seniority);
    if (companyStage) {
        // Shorten company stage for footer
        const shortStage = companyStage.replace(/\s*\([^)]*\)/g, '').trim();
        footerParts.push(shortStage);
    }
    if (industries.length > 0) footerParts.push(industries.join(' / '));
    const footerMeta = footerParts.join(' • ');

    if (!primaryRole && !positioning) {
        return (
            <section className="space-y-6">
                <ReportSectionHeader
                    icon={<Target className="w-4 h-4 text-brand" />}
                    number="05"
                    title="Where You Compete"
                    subtitle="Your primary lane and how to position."
                />
                <div className="rounded-lg border border-border bg-secondary/10 p-5 text-sm text-muted-foreground">
                    Where you compete is unclear from the current text. Add clearer role, level, and scope signals (titles, domain, team size, and outcomes).
                </div>
            </section>
        );
    }

    return (
        <section className="space-y-8">
            <ReportSectionHeader
                icon={<Target className="w-4 h-4 text-brand" />}
                number="05"
                title="Where You Compete"
                subtitle="Your primary lane and how to position."
            />

            {isGated ? (
                // GATED STATE: Show teaser with locked overlay
                <div className="rounded-lg border border-border bg-card p-6 space-y-4">
                    <div className="flex items-center gap-3 text-muted-foreground">
                        <Lock className="w-5 h-5" />
                        <div>
                            <p className="text-sm font-medium text-foreground">
                                Role positioning identified
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Best-fit roles, stretch opportunities, and positioning notes
                            </p>
                        </div>
                    </div>

                    {/* Teaser: Show primary role blurred */}
                    {primaryRole && (
                        <div className="text-center py-4 blur-[3px] select-none">
                            <h3 className="text-2xl font-serif font-semibold text-foreground">
                                {primaryRole}
                            </h3>
                        </div>
                    )}

                    {onUpgrade && (
                        <Button
                            variant="premium"
                            size="sm"
                            onClick={() => {
                                saveUnlockContext({ section: 'job_alignment' });
                                Analytics.paywallCtaClicked('job_alignment');
                                onUpgrade();
                            }}
                            className="w-full shadow-md"
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Unlock Role Positioning
                        </Button>
                    )}
                </div>
            ) : (
                // FULL ACCESS: Show complete role analysis
                // FULL ACCESS: Show complete role analysis
                <div className="rounded-lg border border-border/60 bg-card shadow-sm p-6 md:p-8">
                    {/* JD Match Score - The Emotional Hook */}
                    {showJdSection && hasJdMatchData && (
                        <div className="text-center mb-8 pb-6 border-b border-border/40">
                            <div className="inline-flex items-center gap-4">
                                <div className={`text-6xl md:text-7xl font-display font-bold transition-all duration-500 ${alignment.jd_match_score >= 75 ? 'text-green-500 animate-pulse-once' :
                                    alignment.jd_match_score >= 60 ? 'text-brand' :
                                        alignment.jd_match_score >= 45 ? 'text-warning' :
                                            'text-destructive'
                                    }`}>
                                    {alignment.jd_match_score}%
                                    {alignment.jd_match_score >= 75 && (
                                        <span className="inline-block ml-2 animate-bounce-subtle">
                                            ✨
                                        </span>
                                    )}
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-semibold text-foreground">
                                        {alignment.jd_match_score >= 75 ? 'Strong Match' :
                                            alignment.jd_match_score >= 60 ? 'Moderate Match' :
                                                alignment.jd_match_score >= 45 ? 'Weak Match' :
                                                    'Low Match'}
                                    </p>
                                    <p className="text-xs text-muted-foreground max-w-[200px]">
                                        {alignment.jd_match_summary || 'to this job description'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* JD Keyword Breakdown - The Jobscan-Style Checklist */}
                    {showJdSection && hasJdKeywords && (
                        <div className="mb-8 pb-6 border-b border-border/40">
                            {/* Progress Bar */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-foreground">
                                        Requirements Matched
                                    </span>
                                    <span className="text-sm font-semibold text-foreground">
                                        {alignment.jd_keywords.match_count || 0} / {alignment.jd_keywords.total_count}
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${((alignment.jd_keywords.match_count || 0) / alignment.jd_keywords.total_count) >= 0.75 ? 'bg-green-500' :
                                            ((alignment.jd_keywords.match_count || 0) / alignment.jd_keywords.total_count) >= 0.5 ? 'bg-brand' :
                                                'bg-warning'
                                            }`}
                                        style={{ width: `${Math.round(((alignment.jd_keywords.match_count || 0) / alignment.jd_keywords.total_count) * 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Keyword Lists */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Matched Keywords */}
                                {alignment.jd_keywords.matched && alignment.jd_keywords.matched.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-semibold uppercase tracking-wider text-green-600">
                                            ✓ Skills Found
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {alignment.jd_keywords.matched.map((keyword, idx) => (
                                                <span
                                                    key={idx}
                                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-green-500/10 text-green-700 border border-green-500/20"
                                                >
                                                    ✓ {keyword}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Missing Keywords */}
                                {alignment.jd_keywords.missing && alignment.jd_keywords.missing.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-semibold uppercase tracking-wider text-destructive">
                                            ✗ Missing Skills
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {alignment.jd_keywords.missing.map((keyword, idx) => (
                                                <span
                                                    key={idx}
                                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20"
                                                >
                                                    ✗ {keyword}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Actionable Hint - What to do next */}
                            {alignment.jd_keywords.missing && alignment.jd_keywords.missing.length > 0 && (
                                <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-brand/5 border border-brand/10">
                                    <InsightSparkleIcon className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-muted-foreground">
                                        <span className="font-medium text-foreground">Pro tip:</span> Look for opportunities to add these skills to your experience bullets. Section 03 (The Red Pen) has rewrite examples that can help.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* The Declaration */}
                    <div className="text-center space-y-4 mb-6">
                        {primaryRole && (
                            <h3 className="text-3xl md:text-4xl font-serif font-semibold text-foreground tracking-tight">
                                {primaryRole}
                            </h3>
                        )}

                        {positioning && (
                            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto font-serif">
                                {positioning}
                            </p>
                        )}
                    </div>

                    {/* Supporting Roles - De-emphasized Footer */}
                    <div className="border-t border-border/40 pt-6 space-y-2 text-center text-sm">
                        {otherFitRoles.length > 0 && (
                            <p className="text-muted-foreground">
                                <span className="text-foreground/70 font-medium">Also fits:</span>{' '}
                                {otherFitRoles.join(' · ')}
                            </p>
                        )}

                        {stretchRoles.length > 0 && (
                            <p className="text-muted-foreground">
                                <span className="text-foreground/70 font-medium">Stretch:</span>{' '}
                                {stretchRoles.join(' · ')}
                            </p>
                        )}

                        {footerMeta && (
                            <p className="text-xs text-muted-foreground/60 pt-2 font-mono">
                                {footerMeta}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}
