"use client";

import { ReportData } from "./ReportTypes";
import { ReportSectionHeader } from "./ReportSectionHeader";
import { Target } from "lucide-react";

interface JobAlignmentSectionProps {
    data: ReportData;
    hasJobDescription?: boolean;
}

export function JobAlignmentSection({ data, hasJobDescription = false }: JobAlignmentSectionProps) {
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
                <div className="rounded-lg border border-border bg-secondary/10 p-5 text-sm text-muted-foreground">
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
                    "Where you compete" is unclear from the current text. Add clearer role, level, and scope signals (titles, domain, team size, and outcomes).
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

            {/* The Declaration */}
            <div className="text-center py-8">
                {primaryRole && (
                    <h3 className="text-4xl md:text-5xl font-serif font-semibold text-foreground tracking-tight mb-6">
                        {primaryRole}
                    </h3>
                )}

                {positioning && (
                    <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto font-serif">
                        {positioning}
                    </p>
                )}
            </div>

            {/* Supporting Roles - De-emphasized Footer */}
            <div className="border-t border-border/40 pt-6 space-y-3 text-center">
                {otherFitRoles.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                        <span className="text-foreground/70 font-medium">Also fits:</span>{' '}
                        {otherFitRoles.join(' · ')}
                    </p>
                )}

                {stretchRoles.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                        <span className="text-foreground/70 font-medium">Stretch:</span>{' '}
                        {stretchRoles.join(' · ')}
                    </p>
                )}

                {footerMeta && (
                    <p className="text-xs text-muted-foreground/60 pt-2">
                        {footerMeta}
                    </p>
                )}
            </div>
        </section>
    );
}
