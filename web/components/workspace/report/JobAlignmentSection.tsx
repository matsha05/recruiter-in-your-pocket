"use client";

import { ReportData } from "./ReportTypes";
import { ReportSectionHeader } from "./ReportSectionHeader";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveUnlockContext } from "@/lib/unlock/unlockContext";
import { Analytics } from "@/lib/analytics";
import { InsightSparkleIcon, RoleTargetIcon } from "@/components/icons";

interface JobAlignmentSectionProps {
    data: ReportData;
    hasJobDescription?: boolean;
    isGated?: boolean;
    onUpgrade?: () => void;
}

// Score threshold constants for JD matching
const SCORE_THRESHOLDS = {
    STRONG: 75,
    MODERATE: 60,
    WEAK: 45
} as const;

export function JobAlignmentSection({ data, hasJobDescription = false, isGated = false, onUpgrade }: JobAlignmentSectionProps) {
    const alignment = data.job_alignment;
    if (!alignment) {
        return (
            <section className="space-y-6">
                <ReportSectionHeader
                    icon={<RoleTargetIcon className="w-4 h-4 text-brand" />}
                    number="05"
                    title="Where You Compete"
                    subtitle="Your primary lane and how to position."
                />
                <div className="rounded border border-border/60 bg-card p-5 text-sm text-muted-foreground">
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
    const jdMatchScore = alignment.jd_match_score ?? 0;
    const hasJdMatchData = jdMatchScore > 0;
    const jdKeywords = alignment.jd_keywords;
    const hasJdKeywords = jdKeywords && jdKeywords.total_count && jdKeywords.total_count > 0;
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
                    icon={<RoleTargetIcon className="w-4 h-4 text-brand" />}
                    number="05"
                    title="Where You Compete"
                    subtitle="Your primary lane and how to position."
                />
                <div className="rounded border border-border bg-secondary/10 p-5 text-sm text-muted-foreground">
                    Where you compete is unclear from the current text. Add clearer role, level, and scope signals (titles, domain, team size, and outcomes).
                </div>
            </section>
        );
    }

    return (
        <section className="space-y-8">
            <ReportSectionHeader
                icon={<RoleTargetIcon className="w-4 h-4 text-brand" />}
                number="05"
                title="Where You Compete"
                subtitle="Your primary lane and how to position."
            />

            {isGated ? (
                // GATED STATE: Show teaser with locked overlay
                <div className="rounded border border-border bg-card p-6 space-y-4">
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
                            <h3 className="text-2xl font-display font-semibold text-foreground">
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
                            className="w-full"
                        >
                            <InsightSparkleIcon className="w-4 h-4 mr-2" />
                            Unlock Role Positioning
                        </Button>
                    )}
                </div>
            ) : (
                // FULL ACCESS: Show complete role analysis
                <div className="rounded border border-border/60 bg-card p-6 md:p-8">
                    {/* JD Match Score - The Emotional Hook */}
                    {showJdSection && hasJdMatchData && (
                        <div className="text-center mb-8 pb-6 border-b border-border/40">
                            <div className="inline-flex items-center gap-4">
                                <div className={`text-6xl md:text-7xl font-display font-bold transition-all duration-500 ${jdMatchScore >= SCORE_THRESHOLDS.STRONG ? 'text-success' :
                                    jdMatchScore >= SCORE_THRESHOLDS.MODERATE ? 'text-brand' :
                                        jdMatchScore >= SCORE_THRESHOLDS.WEAK ? 'text-warning' :
                                            'text-destructive'
                                    }`}>
                                    {jdMatchScore}%
                                    {jdMatchScore >= SCORE_THRESHOLDS.STRONG && (
                                        <InsightSparkleIcon className="inline-block w-5 h-5 ml-2 text-success" />
                                    )}
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-semibold text-foreground">
                                        {jdMatchScore >= SCORE_THRESHOLDS.STRONG ? 'Strong Match' :
                                            jdMatchScore >= SCORE_THRESHOLDS.MODERATE ? 'Moderate Match' :
                                                jdMatchScore >= SCORE_THRESHOLDS.WEAK ? 'Weak Match' :
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
                                        {jdKeywords?.match_count || 0} / {jdKeywords?.total_count || 0}
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${((jdKeywords?.match_count || 0) / (jdKeywords?.total_count || 1)) >= 0.75 ? 'bg-success' :
                                            ((jdKeywords?.match_count || 0) / (jdKeywords?.total_count || 1)) >= 0.5 ? 'bg-brand' :
                                                'bg-warning'
                                            }`}
                                        style={{ width: `${Math.round(((jdKeywords?.match_count || 0) / (jdKeywords?.total_count || 1)) * 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Keyword Lists */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Matched Keywords */}
                                {jdKeywords?.matched && jdKeywords.matched.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-semibold uppercase tracking-wider text-success">
                                            Skills Found
                                        </h4>
                                        <ul className="space-y-1">
                                            {jdKeywords.matched.map((keyword, idx) => (
                                                <li
                                                    key={idx}
                                                    className="flex items-start gap-2 text-sm text-muted-foreground"
                                                >
                                                    <span className="mt-2 h-1 w-1 rounded-full bg-success" />
                                                    <span>{keyword}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Missing Keywords */}
                                {jdKeywords?.missing && jdKeywords.missing.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-semibold uppercase tracking-wider text-destructive">
                                            Missing Skills
                                        </h4>
                                        <ul className="space-y-1">
                                            {jdKeywords.missing.map((keyword, idx) => (
                                                <li
                                                    key={idx}
                                                    className="flex items-start gap-2 text-sm text-muted-foreground"
                                                >
                                                    <span className="mt-2 h-1 w-1 rounded-full bg-destructive" />
                                                    <span>{keyword}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Actionable Hint - What to do next */}
                            {jdKeywords?.missing && jdKeywords.missing.length > 0 && (
                                <div className="mt-4 flex items-start gap-2 p-3 rounded bg-brand/5 border border-brand/10">
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
                            <h3 className="text-3xl md:text-4xl font-display font-semibold text-foreground tracking-tight">
                                {primaryRole}
                            </h3>
                        )}

                        {positioning && (
                            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
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
