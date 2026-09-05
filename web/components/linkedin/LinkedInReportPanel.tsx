'use client';

import Link from "next/link";
import React from "react";
import { AlertCircle, ArrowRight, Check, Copy, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    HiddenGemIcon,
    InsightSparkleIcon,
    PrincipalRecruiterIcon,
    RoleTargetIcon,
    SignalRadarIcon,
    TransformArrowIcon,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import type { LinkedInReport } from "@/types/linkedin";

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
    onUpgrade,
}: LinkedInReportPanelProps) {
    const isExhausted = !isSample && freeUsesRemaining <= 0 && !hasPaidAccess;
    const score = Math.round(report.score || 0);
    const subscores = [
        { key: "visibility", label: "Visibility", score: report.subscores?.visibility },
        { key: "first-impression", label: "First impression", score: report.subscores?.first_impression },
        { key: "content", label: "Content", score: report.subscores?.content_quality },
        { key: "completeness", label: "Completeness", score: report.subscores?.completeness },
    ];

    return (
        <div className="space-y-12">
            <section className="border-y riyp-border-paper-line" aria-labelledby="linkedin-report-verdict">
                <div className="flex flex-col gap-4 border-b riyp-border-paper-line bg-paper-muted px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-8 shrink-0 items-center justify-center border border-ink font-display text-sm text-ink">in</span>
                        <div className="min-w-0">
                            <p className="riyp-type-10px font-semibold uppercase riyp-track-017 text-ink">LinkedIn report</p>
                            <p className="mt-1 truncate text-xs text-muted-foreground">
                                {profileName || "Profile report"}{profileHeadline ? ` · ${profileHeadline}` : ""}
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/research/linkedin-visibility"
                        className="focus-ring inline-flex min-h-11 items-center border-b border-brand/50 text-xs font-semibold text-muted-foreground transition-colors hover:text-brand"
                        target="_blank"
                        rel="noopener"
                    >
                        Method and limits
                    </Link>
                </div>

                <div className="grid md:grid-cols-[minmax(0,1fr)_12rem]">
                    <div className="px-5 py-8 sm:px-7 md:border-r md:riyp-border-paper-line md:px-9 md:py-10">
                        <p className="riyp-type-10px font-semibold uppercase riyp-track-017 text-brand">What comes through first</p>
                        <h2 id="linkedin-report-verdict" className="mt-5 max-w-[18ch] font-display riyp-display-report riyp-weight-520 riyp-leading-098 riyp-track-n04 text-ink riyp-stretch-88">
                            {report.first_impression?.profile_card_verdict || report.score_comment_short || "Your profile feedback"}
                        </h2>
                        {(report.score_comment_long || report.score_comment_short) && (
                            <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground">
                                {report.score_comment_long || report.score_comment_short}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center justify-between gap-5 border-t riyp-border-paper-line bg-paper-muted px-5 py-6 md:block md:border-t-0 md:px-6 md:py-10 md:text-center">
                        <div>
                            <p className="riyp-type-10px font-semibold uppercase riyp-track-015 text-muted-foreground">Review score</p>
                            <p className="mt-3 font-display text-4xl riyp-weight-560 leading-none tabular-nums riyp-track-n04 text-ink">{score}<span className="ml-1 text-lg text-muted-foreground">/100</span></p>
                        </div>
                        <div className="md:mt-5">
                            <p className="text-sm font-semibold text-brand">{report.score_label || "Needs work"}</p>
                            <p className="mt-2 max-w-[11rem] text-xs leading-5 text-muted-foreground">Summarizes the feedback below. It does not predict hiring outcomes.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 border-t riyp-border-paper-line md:grid-cols-4 md:divide-x md:divide-[hsl(var(--paper-line))]">
                    {subscores.map((item) => (
                        <div key={item.key} className="border-b riyp-border-paper-line px-4 py-4 odd:border-r md:border-b-0 md:border-r-0">
                            <p className="font-display text-2xl riyp-weight-560 tabular-nums text-ink">{item.score ?? "—"}</p>
                            <p className="mt-1 riyp-type-10px font-semibold uppercase riyp-track-014 text-muted-foreground">{item.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section id="linkedin-first-impression">
                <ReportSectionHeader
                    icon={<PrincipalRecruiterIcon className="size-4 text-brand" />}
                    number="01"
                    title="Likely takeaway"
                    subtitle="What a recruiter may notice first."
                />

                <div className="mt-7 space-y-7">
                    {report.first_impression?.profile_card_verdict && (
                        <p className="max-w-[34ch] font-display riyp-display-report-quote riyp-weight-520 riyp-leading-112 riyp-track-n025 text-ink riyp-stretch-96">
                            “{report.first_impression.profile_card_verdict}”
                        </p>
                    )}

                    <div className="grid border-y riyp-border-paper-line md:grid-cols-3 md:divide-x md:divide-[hsl(var(--paper-line))]">
                        <ProfileSignal label="Photo" status={report.first_impression?.photo_status || "unknown"} note={report.first_impression?.photo_note} />
                        <ProfileSignal label="Banner" status={report.first_impression?.banner_status || "unknown"} note={report.first_impression?.banner_note} />
                        <ProfileSignal label="Headline" status={report.first_impression?.headline_verdict || "generic"} />
                    </div>

                    {report.first_impression?.visibility_estimate && (
                        <div className="border-l-2 border-brand pl-5">
                            <p className="riyp-type-10px font-semibold uppercase riyp-track-015 text-brand">Visibility note</p>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">{report.first_impression.visibility_estimate}</p>
                        </div>
                    )}
                </div>
            </section>

            <section id="linkedin-headline" className="border-t riyp-border-paper-line pt-10">
                <ReportSectionHeader
                    icon={<TransformArrowIcon className="size-4 text-brand" />}
                    number="02"
                    title="Headline"
                    subtitle="Does your headline make your experience clear?"
                />

                <div className="mt-7 space-y-7">
                    <div className="border-y riyp-border-paper-line bg-paper-muted px-5 py-5">
                        <p className="riyp-type-10px font-semibold uppercase riyp-track-015 text-muted-foreground">Current</p>
                        <p className="mt-3 font-display text-2xl riyp-weight-520 leading-snug text-ink riyp-stretch-98">{report.headline_analysis?.current || "No headline was available in the upload."}</p>
                    </div>

                    {report.headline_analysis?.verdict && <p className="max-w-2xl text-sm leading-6 text-foreground">{report.headline_analysis.verdict}</p>}

                    {report.headline_analysis?.issues?.length > 0 && (
                        <ul className="divide-y divide-[hsl(var(--paper-line))] border-y riyp-border-paper-line">
                            {report.headline_analysis.issues.map((issue, index) => (
                                <li key={`${issue}-${index}`} className="grid grid-cols-[2rem_1fr] gap-3 py-3 text-sm leading-6 text-muted-foreground">
                                    <span className="font-mono riyp-type-10px font-semibold riyp-text-annotation">{String(index + 1).padStart(2, "0")}</span>
                                    <span>{issue}</span>
                                </li>
                            ))}
                        </ul>
                    )}

                    {report.headline_analysis?.rewrite && (
                        <CopyableSuggestionCard label="Suggested headline" content={report.headline_analysis.rewrite} note={report.headline_analysis.why_better} />
                    )}
                </div>
            </section>

            <section id="linkedin-about" className="border-t riyp-border-paper-line pt-10">
                <ReportSectionHeader
                    icon={<InsightSparkleIcon className="size-4 text-brand" />}
                    number="03"
                    title="About section"
                    subtitle="What does your introduction tell a recruiter?"
                />

                <div className="mt-7 space-y-6">
                    <div className="flex flex-wrap items-center gap-3 border-y riyp-border-paper-line py-4">
                        <span className="riyp-type-10px font-semibold uppercase riyp-track-015 text-muted-foreground">Opening strength</span>
                        <HookStrengthBadge strength={report.about_analysis?.hook_strength || "missing"} />
                    </div>
                    {report.about_analysis?.hook_verdict && <p className="max-w-2xl text-sm leading-6 text-foreground">{report.about_analysis.hook_verdict}</p>}
                    {report.about_analysis?.full_verdict && <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{report.about_analysis.full_verdict}</p>}
                    {report.about_analysis?.rewrite_suggestion && <CopyableSuggestionCard label="Suggested opening" content={report.about_analysis.rewrite_suggestion} />}
                </div>
            </section>

            <section id="linkedin-visibility" className="border-t riyp-border-paper-line pt-10">
                <ReportSectionHeader
                    icon={<SignalRadarIcon className="size-4 text-brand" />}
                    number="04"
                    title="Search visibility"
                    subtitle="Which relevant terms appear in your profile?"
                />

                <div className="mt-7 space-y-7">
                    <div className="grid border-y riyp-border-paper-line md:grid-cols-2 md:divide-x md:divide-[hsl(var(--paper-line))]">
                        <KeywordLedger label="Already present" keywords={report.search_visibility?.keywords_present || []} tone="present" />
                        <KeywordLedger label="Worth considering" keywords={report.search_visibility?.keywords_missing || []} tone="missing" />
                    </div>
                    {report.search_visibility?.recommendation && (
                        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{report.search_visibility.recommendation}</p>
                    )}
                    <p className="text-xs leading-5 text-muted-foreground">Add keywords only when they truthfully describe your work. Search behavior varies by recruiter, query, and platform changes.</p>
                </div>
            </section>

            <section id="linkedin-positioning" className="border-t riyp-border-paper-line pt-10">
                <ReportSectionHeader
                    icon={<RoleTargetIcon className="size-4 text-brand" />}
                    number="05"
                    title="Role fit"
                    subtitle="Which roles match the experience you describe?"
                />

                <div className="mt-7 grid gap-7 md:grid-cols-[0.75fr_1.25fr]">
                    <div>
                        <p className="riyp-type-10px font-semibold uppercase riyp-track-015 text-muted-foreground">Best-supported roles</p>
                        <ul className="mt-4 divide-y divide-[hsl(var(--paper-line))] border-y riyp-border-paper-line">
                            {(report.role_fit?.best_fit_roles || []).map((role, index) => (
                                <li key={`${role}-${index}`} className="py-3 font-display text-xl riyp-weight-520 text-ink">{role}</li>
                            ))}
                            {(!report.role_fit?.best_fit_roles || report.role_fit.best_fit_roles.length === 0) && <li className="py-3 text-sm text-muted-foreground">The report did not identify specific roles from this profile.</li>}
                        </ul>
                    </div>
                    <div className="space-y-6">
                        {report.role_fit?.current_positioning && (
                            <div><p className="riyp-type-10px font-semibold uppercase riyp-track-015 text-muted-foreground">Experience described</p><p className="mt-3 text-sm leading-6 text-foreground">{report.role_fit.current_positioning}</p></div>
                        )}
                        {report.role_fit?.positioning_suggestion && (
                            <div className="border-l-2 border-brand pl-5"><p className="riyp-type-10px font-semibold uppercase riyp-track-015 text-brand">What to clarify</p><p className="mt-2 text-sm leading-6 text-muted-foreground">{report.role_fit.positioning_suggestion}</p></div>
                        )}
                    </div>
                </div>
            </section>

            <section id="linkedin-quick-wins" className="border-t riyp-border-paper-line pt-10">
                <ReportSectionHeader
                    icon={<HiddenGemIcon className="size-4 text-brand" />}
                    number="06"
                    title="Priority edits"
                    subtitle="Start with these changes."
                />

                <div className="mt-7 border-y riyp-border-paper-line">
                    {report.top_fixes?.map((fix, index) => (
                        <div key={`${fix.fix}-${index}`} className="grid gap-3 border-b riyp-border-paper-line py-5 last:border-b-0 sm:grid-cols-[2.25rem_minmax(0,0.8fr)_minmax(0,1.2fr)_6rem] sm:items-start">
                            <span className="font-mono riyp-type-10px font-semibold riyp-text-annotation">{String(index + 1).padStart(2, "0")}</span>
                            <p className="text-sm font-semibold text-ink">{fix.fix}</p>
                            <p className="text-sm leading-6 text-muted-foreground">{fix.why}</p>
                            <p className="riyp-type-10px font-semibold uppercase riyp-track-012 text-brand">{fix.effort}</p>
                        </div>
                    ))}
                    {(!report.top_fixes || report.top_fixes.length === 0) && <p className="py-5 text-sm text-muted-foreground">No priority edits were returned for this profile.</p>}
                </div>
            </section>

            {report.experience_rewrites?.length > 0 && (
                <section className="border-t riyp-border-paper-line pt-10">
                    <ReportSectionHeader
                        icon={<TransformArrowIcon className="size-4 text-brand" />}
                        number="07"
                        title="Suggested rewrites"
                        subtitle="Review these suggestions before you use them."
                    />

                    <div className="mt-7 space-y-9">
                        {report.experience_rewrites.map((rewrite, index) => (
                            <div key={`${rewrite.company}-${rewrite.original}-${index}`} className="border-b riyp-border-paper-line pb-8 last:border-b-0 last:pb-0">
                                <p className="riyp-type-10px font-semibold uppercase riyp-track-015 text-muted-foreground">{rewrite.company}</p>
                                <p className="mt-4 text-sm leading-6 text-muted-foreground line-through decoration-[hsl(var(--annotation))] decoration-2">{rewrite.original}</p>
                                <div className="mt-5 border-l-2 border-brand pl-5">
                                    <p className="riyp-type-10px font-semibold uppercase riyp-track-015 text-brand">Suggested wording</p>
                                    <p className="mt-2 font-display text-2xl riyp-weight-520 leading-snug text-ink riyp-stretch-98">{rewrite.better}</p>
                                </div>
                                {rewrite.enhancement_note && <p className="mt-4 text-xs leading-5 text-muted-foreground">{rewrite.enhancement_note}</p>}
                            </div>
                        ))}
                        <p className="text-xs leading-5 text-muted-foreground">Use suggested language only when every detail is factually accurate.</p>
                    </div>
                </section>
            )}

            <footer className="border-t border-brand pt-8">
                <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
                    <div>
                        <p className="riyp-type-10px font-semibold uppercase riyp-track-016 text-brand">Next step</p>
                        <h3 className="mt-3 max-w-[22ch] font-display text-3xl leading-tight text-ink">
                            {isSample ? "Get feedback on your own profile." : "Update your profile, then review it again when you are ready."}
                        </h3>
                        {!isSample && !isExhausted && (
                            <p className="mt-3 text-sm text-muted-foreground">
                                {hasPaidAccess
                                    ? "Paid access is active."
                                    : freeUsesRemaining > 0
                                      ? `${freeUsesRemaining} free report${freeUsesRemaining > 1 ? "s" : ""} remaining.`
                                      : "Run another report when you are ready."}
                            </p>
                        )}
                    </div>

                    {isSample && onNewReport ? (
                        <Button variant="brand" size="lg" onClick={onNewReport}>Review my profile <ArrowRight className="ml-2 size-4" /></Button>
                    ) : isExhausted && onUpgrade ? (
                        <Button variant="premium" onClick={onUpgrade}>See the Job Search Pass <ArrowRight className="ml-2 size-4" /></Button>
                    ) : onNewReport ? (
                        <Button variant="brand" onClick={onNewReport}><Plus className="mr-2 size-4" />Review another profile</Button>
                    ) : null}
                </div>
            </footer>
        </div>
    );
}

function ReportSectionHeader({ icon, number, title, subtitle }: { icon: React.ReactNode; number: string; title: string; subtitle: string }) {
    return (
        <div className="grid gap-3 sm:grid-cols-[3rem_1fr]">
            <span className="pt-1 font-mono riyp-type-10px font-semibold riyp-text-annotation">{number}</span>
            <div>
                <p className="flex items-center gap-2 riyp-type-10px font-semibold uppercase riyp-track-016 text-brand">{icon}{title}</p>
                <h2 className="mt-3 max-w-[29ch] font-display riyp-display-report-section riyp-weight-560 riyp-leading-104 riyp-track-n03 text-ink riyp-stretch-94">{subtitle}</h2>
            </div>
        </div>
    );
}

function ProfileSignal({ label, status, note }: { label: string; status: string; note?: string }) {
    return (
        <div className="border-b riyp-border-paper-line px-4 py-5 last:border-b-0 md:border-b-0 md:px-5">
            <p className="riyp-type-10px font-semibold uppercase riyp-track-015 text-muted-foreground">{label}</p>
            <div className="mt-3"><StatusBadge status={status} /></div>
            {note && <p className="mt-3 text-xs leading-5 text-muted-foreground">{note}</p>}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const configs: Record<string, { color: string; label: string }> = {
        professional: { color: "text-success", label: "Professional" },
        adequate: { color: "text-brand", label: "Adequate" },
        needs_work: { color: "text-warning-foreground", label: "Needs work" },
        missing: { color: "text-destructive", label: "Missing" },
        branded: { color: "text-success", label: "Branded" },
        generic: { color: "text-warning-foreground", label: "Generic" },
        differentiated: { color: "text-success", label: "Differentiated" },
        keyword_rich: { color: "text-success", label: "Keyword rich" },
        unknown: { color: "text-muted-foreground", label: "Not available in PDF" },
    };
    const config = configs[status] || configs.unknown;
    return <span className={cn("text-sm font-semibold", config.color)}>{config.label}</span>;
}

function HookStrengthBadge({ strength }: { strength: string }) {
    const configs: Record<string, { color: string; label: string }> = {
        strong: { color: "text-success", label: "Strong opening" },
        adequate: { color: "text-brand", label: "Clear opening" },
        weak: { color: "text-warning-foreground", label: "Opening needs more detail" },
        missing: { color: "text-destructive", label: "Missing" },
    };
    const config = configs[strength] || configs.missing;
    return <span className={cn("text-sm font-semibold", config.color)}>{config.label}</span>;
}

function KeywordLedger({ label, keywords, tone }: { label: string; keywords: string[]; tone: "present" | "missing" }) {
    return (
        <div className="px-5 py-5">
            <p className={cn("riyp-type-10px font-semibold uppercase riyp-track-015", tone === "present" ? "text-brand" : "riyp-text-annotation")}>{label}</p>
            {keywords.length > 0 ? (
                <ul className="mt-4 divide-y divide-[hsl(var(--paper-line))]">
                    {keywords.map((keyword, index) => <li key={`${keyword}-${index}`} className="py-2 text-sm text-ink">{keyword}</li>)}
                </ul>
            ) : <p className="mt-4 text-sm text-muted-foreground">None identified.</p>}
        </div>
    );
}

function CopyableSuggestionCard({ label, content, note }: { label: string; content: string; note?: string }) {
    const [copyState, setCopyState] = React.useState<"idle" | "copied" | "error">("idle");

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(content);
            setCopyState("copied");
            window.setTimeout(() => setCopyState("idle"), 2000);
        } catch {
            setCopyState("error");
        }
    };

    return (
        <div className="border-y border-brand/40 bg-paper-muted px-5 py-5">
            <div className="flex items-center justify-between gap-4">
                <span className="riyp-type-10px font-semibold uppercase riyp-track-015 text-brand">{label}</span>
                <button
                    type="button"
                    onClick={handleCopy}
                    className="focus-ring inline-flex min-h-11 items-center gap-2 px-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-brand"
                    aria-live="polite"
                >
                    {copyState === "copied" ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                    {copyState === "copied" ? "Copied" : copyState === "error" ? "Try copying again" : "Copy"}
                </button>
            </div>
            <p className="mt-3 font-display text-2xl riyp-weight-520 leading-snug text-ink riyp-stretch-98">{content}</p>
            {note && <p className="mt-3 text-xs leading-5 text-muted-foreground">{note}</p>}
            <p className="mt-3 text-xs leading-5 text-muted-foreground">Check that every detail describes your experience before using this wording.</p>
        </div>
    );
}
