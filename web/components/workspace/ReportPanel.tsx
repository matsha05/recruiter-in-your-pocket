"use client";

import { useState, useMemo, useEffect, useRef } from "react";

// Score-based color function - returns semantic Tailwind color classes
function getScoreColorClass(score: number): string {
    if (score >= 90) return 'text-[#8b5cf6]';
    if (score >= 85) return 'text-brand';
    if (score >= 80) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-danger';
}

function getScoreColor(score: number): string {
    if (score >= 90) return '#8b5cf6';
    if (score >= 85) return '#3b82f6';
    if (score >= 80) return '#22c55e';
    if (score >= 70) return '#f59e0b';
    return '#ef4444';
}

function getScoreBgClass(score: number): string {
    if (score >= 90) return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
    if (score >= 85) return 'bg-brand-soft text-brand';
    if (score >= 80) return 'bg-success-soft text-success';
    if (score >= 70) return 'bg-warning-soft text-warning';
    return 'bg-danger-soft text-danger';
}

type TabId = "overview" | "fixes" | "sections" | "rewrites" | "alignment" | "wins";

interface ReportData {
    score?: number;
    score_label?: string;
    score_comment_short?: string;
    score_comment_long?: string;
    summary?: string;
    subscores?: {
        impact?: number;
        clarity?: number;
        story?: number;
        readability?: number;
    };
    first_impression?: string;
    strengths?: string[];
    gaps?: string[];
    top_fixes?: Array<{ fix?: string; text?: string; impact_level?: string; effort?: string; section_ref?: string }>;
    section_review?: Record<string, { working?: string | null; missing?: string | null; fix?: string | null; grade?: string; priority?: string }>;
    rewrites?: Array<{ original: string; better: string; label?: string; enhancement_note?: string }>;
    job_alignment?: {
        strongly_aligned?: string[];
        underplayed?: string[];
        missing?: string[];
        role_fit?: {
            best_fit_roles?: string[];
            stretch_roles?: string[];
            seniority_read?: string;
            industry_signals?: string[];
            company_stage_fit?: string;
        };
        positioning_suggestion?: string;
    };
    ideas?: {
        questions?: Array<{ question: string; archetype?: string; why?: string }>;
        notes?: string[];
        how_to_use?: string;
    };
    next_steps?: string[];
}

interface ReportPanelProps {
    report: ReportData | null;
    isLoading: boolean;
    hasJobDescription: boolean;
    onExportPdf?: () => void;
    isExporting?: boolean;
}

const tabs: { id: TabId; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "fixes", label: "Top Fixes" },
    { id: "sections", label: "By Section" },
    { id: "rewrites", label: "Bullet Upgrades" },
    { id: "alignment", label: "Job Alignment" },
    { id: "wins", label: "Missing Wins" }
];

export default function ReportPanel({ report, isLoading, hasJobDescription, onExportPdf, isExporting }: ReportPanelProps) {
    const [activeTab, setActiveTab] = useState<TabId>("overview");
    const [tabTransition, setTabTransition] = useState(false);

    // Fade animation when switching tabs
    const handleTabChange = (newTab: TabId) => {
        if (newTab === activeTab) return;
        setTabTransition(true);
        setTimeout(() => {
            setActiveTab(newTab);
            setTabTransition(false);
        }, 150);
    };

    const showEmptyState = !report && !isLoading;
    const showLoading = isLoading;
    const showReport = report && !isLoading;

    // First impression text fallback
    const firstImpressionText = report?.score_comment_long || report?.score_comment_short || report?.first_impression || report?.summary;

    // Animated score dial state
    const [animatedScore, setAnimatedScore] = useState(0);
    const animationRef = useRef<number | null>(null);

    useEffect(() => {
        const targetScore = report?.score || 0;
        if (targetScore <= 0) {
            setAnimatedScore(0);
            return;
        }

        const duration = 1200;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(targetScore * eased);
            setAnimatedScore(current);

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate);
            } else {
                setAnimatedScore(targetScore);
            }
        };

        setAnimatedScore(0);
        const timeoutId = setTimeout(() => {
            animationRef.current = requestAnimationFrame(animate);
        }, 100);

        return () => {
            clearTimeout(timeoutId);
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [report?.score]);

    const dialColor = getScoreColor(animatedScore);

    return (
        <div className="bg-muted flex flex-col h-full overflow-hidden">
            {/* Tabs + Export Button - Sticky */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-surface border-b border-subtle">
                <div className="flex gap-2 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200
                            ${activeTab === tab.id
                                    ? "bg-brand-soft text-brand shadow-sm"
                                    : "text-secondary hover:bg-hover hover:text-primary"
                                }`}
                            onClick={() => handleTabChange(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Export PDF Button */}
                {showReport && onExportPdf && (
                    <button
                        onClick={onExportPdf}
                        disabled={isExporting}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-secondary hover:text-primary hover:bg-hover rounded-lg transition-colors disabled:opacity-50"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        {isExporting ? "Exporting..." : "Export PDF"}
                    </button>
                )}
            </div>

            {/* Content */}
            <div className={`flex-1 overflow-y-auto p-6 transition-all duration-150 ${tabTransition ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
                {/* Empty State */}
                {showEmptyState && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted">
                        <svg className="w-16 h-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div className="text-lg font-semibold text-primary mb-2">Ready when you are</div>
                        <p>Upload or paste your resume to get recruiter-grade feedback in seconds.</p>
                    </div>
                )}

                {/* Loading State */}
                {showLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-10 h-10 border-4 border-brand/20 border-t-brand rounded-full animate-spin mb-4" />
                        <div className="text-lg font-medium text-primary mb-1">Reading your resume like a recruiter...</div>
                        <p className="text-muted">This usually takes 10-15 seconds</p>
                    </div>
                )}

                {/* Report Content */}
                {showReport && (
                    <div className="max-w-3xl mx-auto space-y-6">
                        {/* Overview */}
                        {activeTab === "overview" && (
                            <>
                                {/* Score Header */}
                                <div className="flex items-start gap-6 p-6 bg-surface rounded-xl border border-subtle shadow-card">
                                    {/* Score Dial */}
                                    <div className="flex flex-col items-center gap-2 flex-shrink-0">
                                        <div className="relative w-28 h-28">
                                            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                                                <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" className="text-muted/30" strokeWidth="8" />
                                                <circle
                                                    cx="60" cy="60" r="54" fill="none"
                                                    stroke={dialColor} strokeWidth="8" strokeLinecap="round"
                                                    strokeDasharray="339.292"
                                                    strokeDashoffset={339.292 * (1 - animatedScore / 100)}
                                                    className="transition-all duration-100"
                                                />
                                            </svg>
                                            <div
                                                className="absolute inset-0 flex items-center justify-center font-display text-4xl font-extrabold"
                                                style={{ color: dialColor }}
                                            >
                                                {animatedScore}
                                            </div>
                                        </div>
                                        <span className="text-xs font-medium text-muted uppercase tracking-wide">Score</span>
                                    </div>

                                    {/* First Impression */}
                                    <div className="flex-1">
                                        {firstImpressionText && (
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <svg className="w-5 h-5 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                        <path d="M12 5C16.478 5 20.268 7.405 22 11C20.268 14.595 16.478 17 12 17C7.522 17 3.732 14.595 2 11C3.732 7.405 7.522 5 12 5Z" />
                                                        <circle cx="12" cy="11" r="3" />
                                                    </svg>
                                                    <span className="font-semibold text-primary">Recruiter First Impression</span>
                                                </div>
                                                <p className="text-secondary leading-relaxed">{firstImpressionText}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Subscores */}
                                <div className="grid grid-cols-4 gap-3">
                                    {[
                                        { key: 'impact', label: 'Impact', score: report.subscores?.impact },
                                        { key: 'clarity', label: 'Clarity', score: report.subscores?.clarity },
                                        { key: 'story', label: 'Story', score: report.subscores?.story },
                                        { key: 'readability', label: 'Readability', score: report.subscores?.readability }
                                    ].map(({ key, label, score }) => (
                                        <div key={key} className="p-4 bg-surface rounded-lg border border-subtle text-center shadow-card">
                                            <div className={`text-2xl font-bold ${score ? getScoreColorClass(score) : 'text-muted'}`}>
                                                {score || "—"}
                                            </div>
                                            <div className="text-xs text-muted mt-1">{label}</div>
                                            {score && (
                                                <span className={`inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-medium ${getScoreBgClass(score)}`}>
                                                    {score >= 90 ? 'EXCEPTIONAL' : score >= 85 ? 'STRONG' : score >= 80 ? 'GOOD' : score >= 70 ? 'NEEDS WORK' : 'RISK'}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Strengths */}
                                {report.strengths && report.strengths.length > 0 && (
                                    <div className="p-5 bg-surface rounded-xl border border-subtle shadow-card">
                                        <h3 className="flex items-center gap-2 font-semibold text-primary mb-3">
                                            <span className="text-success">✓</span> What&apos;s Working
                                        </h3>
                                        <ul className="space-y-2">
                                            {report.strengths.map((s, i) => (
                                                <li key={i} className="flex items-start gap-2 text-secondary">
                                                    <span className="text-success/70 mt-1">•</span> {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Gaps */}
                                {report.gaps && report.gaps.length > 0 && (
                                    <div className="p-5 bg-surface rounded-xl border border-subtle shadow-card">
                                        <h3 className="flex items-center gap-2 font-semibold text-primary mb-3">
                                            <span className="text-warning">⚠</span> What&apos;s Missing
                                        </h3>
                                        <ul className="space-y-2">
                                            {report.gaps.map((g, i) => (
                                                <li key={i} className="flex items-start gap-2 text-secondary">
                                                    <span className="text-warning/70 mt-1">•</span> {g}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Top Fixes */}
                        {activeTab === "fixes" && (
                            <div className="p-5 bg-surface rounded-xl border border-subtle shadow-card">
                                <h3 className="font-semibold text-primary mb-4">Top Fixes — Prioritized</h3>
                                <div className="space-y-4">
                                    {report.top_fixes?.map((fix, i) => (
                                        <div key={i} className="flex gap-4 p-4 bg-muted rounded-lg">
                                            <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-brand-soft text-brand font-bold rounded-full">
                                                {i + 1}
                                            </span>
                                            <div className="flex-1">
                                                <p className="text-secondary">{fix.fix || fix.text}</p>
                                                {fix.section_ref && <span className="inline-block mt-2 text-xs text-muted bg-hover px-2 py-0.5 rounded">{fix.section_ref}</span>}
                                                {fix.impact_level && (
                                                    <span className={`inline-block mt-2 ml-2 text-xs px-2 py-0.5 rounded
                                                        ${fix.impact_level === 'high' ? 'bg-danger-soft text-danger' : fix.impact_level === 'medium' ? 'bg-warning-soft text-warning' : 'bg-hover text-muted'}`}>
                                                        {fix.impact_level} impact
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )) || <p className="text-muted">No fixes available</p>}
                                </div>
                            </div>
                        )}

                        {/* By Section */}
                        {activeTab === "sections" && (
                            <div className="space-y-4">
                                {report.section_review ? (
                                    Object.entries(report.section_review).map(([sectionName, section], i) => (
                                        <div key={i} className="p-5 bg-surface rounded-xl border border-subtle shadow-card">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="font-semibold text-primary">{sectionName}</h4>
                                                {section.grade && (
                                                    <span className={`px-2 py-1 text-xs font-bold rounded
                                                        ${section.grade.includes('A') ? 'bg-success-soft text-success' :
                                                            section.grade.includes('B') ? 'bg-brand-soft text-brand' :
                                                                section.grade.includes('C') ? 'bg-warning-soft text-warning' : 'bg-danger-soft text-danger'}`}>
                                                        {section.grade}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="space-y-2 text-sm">
                                                {section.working && (
                                                    <div className="flex gap-2">
                                                        <span className="text-success font-medium">✓ Working:</span>
                                                        <span className="text-secondary">{section.working}</span>
                                                    </div>
                                                )}
                                                {section.missing && (
                                                    <div className="flex gap-2">
                                                        <span className="text-warning font-medium">△ Missing:</span>
                                                        <span className="text-secondary">{section.missing}</span>
                                                    </div>
                                                )}
                                                {section.fix && (
                                                    <div className="flex gap-2">
                                                        <span className="text-brand font-medium">→ Fix:</span>
                                                        <span className="text-secondary">{section.fix}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-muted text-center py-8">Section analysis not available</p>
                                )}
                            </div>
                        )}

                        {/* Bullet Upgrades */}
                        {activeTab === "rewrites" && (
                            <div className="space-y-4">
                                {report.rewrites?.map((rw, i) => (
                                    <div key={i} className="p-5 bg-surface rounded-xl border border-subtle shadow-card">
                                        {rw.label && <div className="text-xs font-semibold text-brand uppercase mb-3">{rw.label}</div>}
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="p-4 bg-danger-soft rounded-lg">
                                                <div className="text-xs font-medium text-danger mb-2">Original</div>
                                                <p className="text-sm text-secondary">{rw.original}</p>
                                            </div>
                                            <div className="p-4 bg-success-soft rounded-lg">
                                                <div className="text-xs font-medium text-success mb-2">Better</div>
                                                <p className="text-sm text-secondary">{rw.better}</p>
                                                {rw.enhancement_note && (
                                                    <p className="text-xs text-success mt-2 italic">{rw.enhancement_note}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )) || <p className="text-muted text-center py-8">No rewrites available</p>}
                            </div>
                        )}

                        {/* Job Alignment */}
                        {activeTab === "alignment" && (
                            <>
                                {(report.job_alignment?.strongly_aligned?.length || report.job_alignment?.underplayed?.length || report.job_alignment?.missing?.length) ? (
                                    <div className="space-y-4">
                                        <div className="grid md:grid-cols-3 gap-4">
                                            <div className="p-4 bg-success-soft rounded-lg">
                                                <h4 className="font-semibold text-success mb-2">✓ Strongly Aligned</h4>
                                                <ul className="space-y-1 text-sm text-secondary">
                                                    {report.job_alignment?.strongly_aligned?.map((item, i) => <li key={i}>• {item}</li>) || <li className="text-muted">None found</li>}
                                                </ul>
                                            </div>
                                            <div className="p-4 bg-warning-soft rounded-lg">
                                                <h4 className="font-semibold text-warning mb-2">⚠ Underplayed</h4>
                                                <ul className="space-y-1 text-sm text-secondary">
                                                    {report.job_alignment?.underplayed?.map((item, i) => <li key={i}>• {item}</li>) || <li className="text-muted">None found</li>}
                                                </ul>
                                            </div>
                                            <div className="p-4 bg-danger-soft rounded-lg">
                                                <h4 className="font-semibold text-danger mb-2">✗ Missing/Weak</h4>
                                                <ul className="space-y-1 text-sm text-secondary">
                                                    {report.job_alignment?.missing?.map((item, i) => <li key={i}>• {item}</li>) || <li className="text-muted">None found</li>}
                                                </ul>
                                            </div>
                                        </div>

                                        {/* Role Fit */}
                                        {report.job_alignment?.role_fit && (
                                            <div className="p-5 bg-surface rounded-xl border border-subtle shadow-card">
                                                <h4 className="font-semibold text-primary mb-4">Where You Read Strongest</h4>
                                                <div className="grid md:grid-cols-2 gap-4 mb-4">
                                                    <div>
                                                        <div className="text-sm font-medium text-success mb-2">Best Fit Roles</div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {report.job_alignment.role_fit.best_fit_roles?.map((role, i) => (
                                                                <span key={i} className="px-3 py-1 bg-success-soft text-success text-sm rounded-full">{role}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-warning mb-2">Stretch Roles</div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {report.job_alignment.role_fit.stretch_roles?.map((role, i) => (
                                                                <span key={i} className="px-3 py-1 bg-warning-soft text-warning text-sm rounded-full">{role}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-3 gap-4 text-sm">
                                                    {report.job_alignment.role_fit.seniority_read && (
                                                        <div>
                                                            <div className="text-muted mb-1">Seniority Read</div>
                                                            <div className="font-medium text-primary">{report.job_alignment.role_fit.seniority_read}</div>
                                                        </div>
                                                    )}
                                                    {report.job_alignment.role_fit.industry_signals && (
                                                        <div>
                                                            <div className="text-muted mb-1">Industry Signals</div>
                                                            <div className="font-medium text-primary">{report.job_alignment.role_fit.industry_signals.join(", ")}</div>
                                                        </div>
                                                    )}
                                                    {report.job_alignment.role_fit.company_stage_fit && (
                                                        <div>
                                                            <div className="text-muted mb-1">Company Stage Fit</div>
                                                            <div className="font-medium text-primary">{report.job_alignment.role_fit.company_stage_fit}</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Positioning Recommendation */}
                                        {report.job_alignment?.positioning_suggestion && (
                                            <div className="p-5 bg-surface rounded-xl border border-subtle shadow-card">
                                                <h4 className="font-semibold text-primary mb-3">Positioning Recommendation</h4>
                                                <p className="text-secondary leading-relaxed">
                                                    {report.job_alignment.positioning_suggestion}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-8 bg-surface rounded-xl border border-subtle text-center shadow-card">
                                        <div className="text-3xl mb-2">📋</div>
                                        <p className="text-muted">Add a job description to see alignment analysis</p>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Missing Wins */}
                        {activeTab === "wins" && (
                            <div className="p-5 bg-surface rounded-xl border border-subtle shadow-card">
                                <h3 className="font-semibold text-primary mb-2">Surface Missing Wins</h3>
                                <p className="text-muted text-sm mb-4">
                                    Answer these questions to uncover hidden impact your resume isn&apos;t telling yet:
                                </p>
                                <div className="space-y-3">
                                    {report.ideas?.questions?.map((q, i) => (
                                        <div key={i} className="p-4 bg-brand-soft rounded-lg">
                                            <p className="font-medium text-primary mb-1">{q.question}</p>
                                            {q.archetype && <span className="inline-block text-xs bg-brand/10 text-brand px-2 py-0.5 rounded mr-2">{q.archetype}</span>}
                                            {q.why && <p className="text-sm text-secondary mt-2">{q.why}</p>}
                                        </div>
                                    )) || report.next_steps?.map((step, i) => (
                                        <div key={i} className="p-4 bg-muted rounded-lg">
                                            <p className="text-secondary">{step}</p>
                                        </div>
                                    )) || <p className="text-muted">No questions available</p>}
                                </div>
                                {report.ideas?.how_to_use && (
                                    <p className="text-sm text-secondary mt-4 p-3 bg-muted rounded">
                                        <strong>How to use:</strong> {report.ideas.how_to_use}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
