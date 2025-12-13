"use client";

import { useState, useEffect, useRef } from "react";

// Score color
function getScoreColor(score: number): string {
    if (score >= 90) return 'var(--color-moss-600)';
    if (score >= 85) return 'var(--color-indigo-500)';
    if (score >= 80) return 'var(--color-amber-500)';
    if (score >= 70) return 'var(--color-amber-400)';
    return 'var(--color-danger)';
}

type TabId = "overview" | "fixes" | "sections" | "rewrites" | "alignment" | "wins";

interface ReportData {
    score?: number;
    score_label?: string;
    score_comment_short?: string;
    score_comment_long?: string;
    summary?: string;
    subscores?: { impact?: number; clarity?: number; story?: number; readability?: number };
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
        role_fit?: { best_fit_roles?: string[]; stretch_roles?: string[]; seniority_read?: string; industry_signals?: string[]; company_stage_fit?: string };
        positioning_suggestion?: string;
    };
    ideas?: { questions?: Array<{ question: string; archetype?: string; why?: string }>; notes?: string[]; how_to_use?: string };
    next_steps?: string[];
}

interface ReportPanelProps {
    report: ReportData | null;
    isLoading: boolean;
    hasJobDescription: boolean;
    onExportPdf?: () => void;
    isExporting?: boolean;
    isSample?: boolean;
}

const tabConfig: { id: TabId; label: string; subtitle: string }[] = [
    { id: "overview", label: "Overview", subtitle: "How your resume reads at a glance" },
    { id: "fixes", label: "Top Fixes", subtitle: "Your highest leverage edits, in order" },
    { id: "sections", label: "By Section", subtitle: "How each part of your resume reads" },
    { id: "rewrites", label: "Bullet Upgrades", subtitle: "Stronger versions of your experience bullets" },
    { id: "alignment", label: "Job Alignment", subtitle: "How your experience maps to target roles" },
    { id: "wins", label: "Missing Wins", subtitle: "Uncover hidden impact your resume isn't telling yet" }
];

export default function ReportPanel({ report, isLoading, hasJobDescription, onExportPdf, isExporting, isSample = false }: ReportPanelProps) {
    const [activeTab, setActiveTab] = useState<TabId>("overview");
    const [tabTransition, setTabTransition] = useState(false);
    const [completedFixes, setCompletedFixes] = useState<Set<number>>(new Set());
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    // Animation states
    const [animatedScore, setAnimatedScore] = useState(0);
    const [dialComplete, setDialComplete] = useState(false);
    const animationRef = useRef<number | null>(null);
    const hasAnimated = useRef(false);

    const handleTabChange = (newTab: TabId) => {
        if (newTab === activeTab) return;
        setTabTransition(true);
        setTimeout(() => {
            setActiveTab(newTab);
            setTabTransition(false);
        }, 80);
    };

    // Score animation
    useEffect(() => {
        const targetScore = report?.score || 0;
        if (targetScore <= 0 || hasAnimated.current) {
            if (!hasAnimated.current) {
                setAnimatedScore(targetScore);
                setDialComplete(true);
            }
            return;
        }
        hasAnimated.current = true;
        setDialComplete(false);
        const duration = 700;
        const startTime = Date.now();
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setAnimatedScore(Math.round(targetScore * eased));
            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate);
            } else {
                setAnimatedScore(targetScore);
                setTimeout(() => setDialComplete(true), 150);
            }
        };
        animationRef.current = requestAnimationFrame(animate);
        return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
    }, [report?.score]);

    const dialColor = getScoreColor(animatedScore);
    const showEmptyState = !report && !isLoading;
    const showLoading = isLoading;
    const showReport = report && !isLoading;

    const activeTabData = tabConfig.find(t => t.id === activeTab);
    const firstImpressionText = report?.score_comment_long || report?.score_comment_short || report?.first_impression || report?.summary;
    const fixesTotal = report?.top_fixes?.length || report?.gaps?.length || 0;
    const fixesDone = completedFixes.size;

    const toggleFix = (i: number) => setCompletedFixes(prev => {
        const next = new Set(prev);
        next.has(i) ? next.delete(i) : next.add(i);
        return next;
    });

    const copyText = async (text: string, i: number) => {
        await navigator.clipboard.writeText(text);
        setCopiedIndex(i);
        setTimeout(() => setCopiedIndex(null), 1500);
    };

    const counts = {
        fixes: report?.top_fixes?.length || report?.gaps?.length || 0,
        rewrites: report?.rewrites?.length || 0,
        wins: report?.ideas?.questions?.length || report?.next_steps?.length || 0,
    };

    const gradeColor = (grade: string) => {
        if (grade.includes('A')) return 'bg-green-100 text-green-700';
        if (grade.includes('B')) return 'bg-indigo-100 text-indigo-700';
        if (grade.includes('C')) return 'bg-amber-100 text-amber-700';
        return 'bg-red-100 text-red-700';
    };

    return (
        <div className="flex flex-col h-full overflow-hidden bg-[var(--bg-body)]">

            {/* ===== REPORT SPINE ===== */}
            {showReport && (
                <div className="bg-[var(--bg-card)] border-b border-[var(--border-subtle)]">
                    {/* Row A: Identity + Utilities */}
                    <div className="flex items-center justify-between gap-4 px-6 py-1.5 text-xs">
                        <div className="flex items-center gap-2">
                            {isSample && (
                                <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-[var(--bg-section-muted)] text-[var(--text-muted)]">Sample</span>
                            )}
                            <span className="text-[var(--text-muted)]">{report.job_alignment?.role_fit?.best_fit_roles?.[0] || 'Resume Report'}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="font-bold" style={{ color: dialColor }}>{report.score}</span>
                            {onExportPdf && (
                                <button onClick={onExportPdf} disabled={isExporting} className="flex items-center gap-1 px-2 py-1 rounded text-[var(--text-muted)] hover:bg-[var(--bg-hover)] transition-colors">
                                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                    <span>{isExporting ? "..." : "Export"}</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Row B: Tabs */}
                    <nav className="flex gap-0 px-6 overflow-x-auto scrollbar-hide">
                        {tabConfig.map((tab) => {
                            const isActive = activeTab === tab.id;
                            const count = tab.id === 'fixes' ? counts.fixes : tab.id === 'rewrites' ? counts.rewrites : tab.id === 'wins' ? counts.wins : null;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabChange(tab.id)}
                                    className={`relative flex items-center gap-1.5 px-3 py-2.5 text-[13px] whitespace-nowrap transition-colors ${isActive ? 'font-semibold text-[var(--text-primary)]' : 'font-normal text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
                                >
                                    <span>{tab.label}</span>
                                    {count !== null && count > 0 && (
                                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-[var(--bg-section-muted)] text-[var(--text-muted)]'}`}>{count}</span>
                                    )}
                                    {isActive && <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[var(--brand)]" />}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            )}

            {/* ===== CONTENT ===== */}
            <div className={`flex-1 overflow-y-auto transition-opacity duration-100 ${tabTransition ? 'opacity-0' : 'opacity-100'}`}>

                {/* Empty State */}
                {showEmptyState && (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8 text-[var(--text-muted)]">
                        <svg width="48" height="48" className="mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        <div className="text-sm font-medium text-[var(--text-primary)] mb-1">Ready when you are</div>
                        <p className="text-[13px]">Upload or paste your resume to get recruiter-grade feedback.</p>
                    </div>
                )}

                {/* Loading State */}
                {showLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <div className="w-7 h-7 border-2 border-[var(--border-subtle)] border-t-[var(--brand)] rounded-full animate-spin mb-4" />
                        <div className="text-sm font-medium text-[var(--text-primary)] mb-1">Reading like a recruiter...</div>
                        <p className="text-[13px] text-[var(--text-muted)]">10-15 seconds</p>
                    </div>
                )}

                {/* Report Canvas */}
                {showReport && (
                    <div className="bg-[var(--bg-body)] min-h-full p-4 lg:p-6">
                        <div className="max-w-[900px] mx-auto bg-[var(--bg-canvas)] rounded-2xl border border-[var(--border-subtle)] shadow-[var(--shadow-soft)] p-6 lg:p-8">

                            {/* Chapter Title */}
                            <div className="mb-6">
                                <h1 className="text-lg font-semibold text-[var(--text-primary)]">{activeTabData?.label}</h1>
                                <p className="text-[13px] text-[var(--text-muted)] mt-0.5">{activeTabData?.subtitle}</p>
                            </div>

                            {/* ===== OVERVIEW ===== */}
                            {activeTab === "overview" && (
                                <div className="flex flex-col gap-3">
                                    {/* Hero Card */}
                                    <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] p-5 border-t-2 border-t-[var(--brand)]">
                                        <div className="flex gap-6">
                                            {/* Score Dial */}
                                            <div className="flex-shrink-0 w-20">
                                                <div className="relative w-20 h-20">
                                                    <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                                                        <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" className="text-[var(--border-subtle)]" strokeWidth="6" opacity="0.3" />
                                                        <circle cx="60" cy="60" r="52" fill="none" stroke={dialColor} strokeWidth="6" strokeLinecap="round" strokeDasharray="326.73" strokeDashoffset={326.73 * (1 - animatedScore / 100)} className="transition-all duration-100" />
                                                    </svg>
                                                    <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold" style={{ color: dialColor }}>{animatedScore}</div>
                                                </div>
                                            </div>

                                            {/* Recruiter Read */}
                                            <div className={`flex-1 min-w-0 max-w-[520px] transition-opacity duration-300 ${dialComplete ? 'opacity-100' : 'opacity-0'}`}>
                                                <div className="flex items-center gap-1.5 mb-2">
                                                    <svg width="14" height="14" className="text-[var(--brand)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 5C16.478 5 20.268 7.405 22 11C20.268 14.595 16.478 17 12 17C7.522 17 3.732 14.595 2 11C3.732 7.405 7.522 5 12 5Z" /><circle cx="12" cy="11" r="3" /></svg>
                                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Recruiter First Impression</span>
                                                </div>
                                                <p className="text-[14px] leading-relaxed text-[var(--text-secondary)]">{firstImpressionText}</p>
                                                {report.top_fixes?.[0] && (
                                                    <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
                                                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--brand)]">Next Step</span>
                                                        <p className="text-[13px] text-[var(--text-secondary)] mt-1">{report.top_fixes[0].fix || report.top_fixes[0].text}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Working vs Missing */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {report.strengths && report.strengths.length > 0 && (
                                            <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] p-4">
                                                <h3 className="flex items-center gap-1.5 text-sm font-semibold text-[var(--text-primary)] mb-3">
                                                    <span className="text-[var(--status-success)]">✓</span> Working
                                                </h3>
                                                <ul className="flex flex-col gap-1.5">
                                                    {report.strengths.slice(0, 5).map((s, i) => (
                                                        <li key={i} className="flex items-start gap-2 text-[13px] text-[var(--text-secondary)]">
                                                            <span className="text-[var(--status-success)] opacity-60">•</span><span>{s}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {report.gaps && report.gaps.length > 0 && (
                                            <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] p-4">
                                                <h3 className="flex items-center gap-1.5 text-sm font-semibold text-[var(--text-primary)] mb-3">
                                                    <span className="text-[var(--status-warning)]">△</span> Missing
                                                </h3>
                                                <ul className="flex flex-col gap-1.5">
                                                    {report.gaps.slice(0, 5).map((g, i) => (
                                                        <li key={i} className="flex items-start gap-2 text-[13px] text-[var(--text-secondary)]">
                                                            <span className="text-[var(--status-warning)] opacity-60">•</span><span>{g}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ===== TOP FIXES ===== */}
                            {activeTab === "fixes" && (
                                <div className="flex flex-col gap-3">
                                    {fixesTotal > 0 && (
                                        <div className="text-xs text-[var(--text-muted)]">
                                            <strong className="text-[var(--text-primary)]">{fixesDone}</strong> of {fixesTotal} complete
                                        </div>
                                    )}
                                    {(report.top_fixes && report.top_fixes.length > 0) ? report.top_fixes.map((fix, i) => {
                                        const isDone = completedFixes.has(i);
                                        return (
                                            <div key={i} className={`bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] p-4 flex gap-3 ${isDone ? 'opacity-60' : ''}`}>
                                                <button onClick={() => toggleFix(i)} className={`w-[18px] h-[18px] mt-0.5 flex-shrink-0 rounded flex items-center justify-center border ${isDone ? 'bg-[var(--brand)] border-transparent' : 'bg-[var(--bg-card)] border-[var(--border-subtle)]'}`}>
                                                    {isDone && <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                                </button>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-[14px] font-medium ${isDone ? 'text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}>{fix.fix || fix.text}</p>
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {fix.impact_level && <span className="text-[11px] px-2 py-0.5 rounded bg-[var(--bg-section-muted)] text-[var(--text-secondary)]">↑ {fix.impact_level}</span>}
                                                        {fix.effort && <span className="text-[11px] px-2 py-0.5 rounded bg-[var(--bg-section-muted)] text-[var(--text-secondary)]">⏱ {fix.effort}</span>}
                                                        {fix.section_ref && <span className="text-[11px] text-[var(--text-muted)]">{fix.section_ref}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }) : report.gaps?.map((gap, i) => (
                                        <div key={i} className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] p-4 flex gap-3">
                                            <button onClick={() => toggleFix(i)} className={`w-[18px] h-[18px] mt-0.5 flex-shrink-0 rounded flex items-center justify-center border ${completedFixes.has(i) ? 'bg-[var(--brand)] border-transparent' : 'bg-[var(--bg-card)] border-[var(--border-subtle)]'}`}>
                                                {completedFixes.has(i) && <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                            </button>
                                            <p className="text-[14px] text-[var(--text-secondary)]">{gap}</p>
                                        </div>
                                    )) || <p className="text-[13px] text-[var(--text-muted)] text-center p-8">No fixes available</p>}
                                </div>
                            )}

                            {/* ===== BY SECTION ===== */}
                            {activeTab === "sections" && (
                                <div className="flex flex-col gap-3">
                                    {report.section_review ? Object.entries(report.section_review).map(([name, section], i) => (
                                        <div key={i} className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-sm font-semibold text-[var(--text-primary)]">{name}</h4>
                                                {section.grade && <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${gradeColor(section.grade)}`}>{section.grade}</span>}
                                            </div>
                                            <div className="flex flex-col gap-1.5 text-[13px]">
                                                {section.working && (
                                                    <div className="grid grid-cols-[70px_1fr] gap-2">
                                                        <span className="font-medium text-[var(--status-success)]">Working</span>
                                                        <span className="text-[var(--text-secondary)]">{section.working}</span>
                                                    </div>
                                                )}
                                                {section.missing && (
                                                    <div className="grid grid-cols-[70px_1fr] gap-2">
                                                        <span className="font-medium text-[var(--status-warning)]">Missing</span>
                                                        <span className="text-[var(--text-secondary)]">{section.missing}</span>
                                                    </div>
                                                )}
                                                {section.fix && (
                                                    <div className="grid grid-cols-[70px_1fr] gap-2">
                                                        <span className="font-medium text-[var(--brand)]">Fix</span>
                                                        <span className="text-[var(--text-secondary)]">{section.fix}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )) : <p className="text-[13px] text-[var(--text-muted)] text-center p-8">Section analysis not available</p>}
                                </div>
                            )}

                            {/* ===== BULLET UPGRADES ===== */}
                            {activeTab === "rewrites" && (
                                <div className="flex flex-col gap-3">
                                    {report.rewrites?.map((rw, i) => (
                                        <div key={i} className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] p-4">
                                            {rw.label && <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">{rw.label}</div>}
                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Original</div>
                                                    <p className="text-[13px] leading-relaxed text-[var(--text-muted)]">{rw.original}</p>
                                                </div>
                                                <div>
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--brand)]">Better</span>
                                                        <button onClick={() => copyText(rw.better, i)} className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[var(--bg-section-muted)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">{copiedIndex === i ? '✓ Copied' : 'Copy rewrite'}</button>
                                                    </div>
                                                    <p className="text-[13px] leading-relaxed text-[var(--text-primary)]">{rw.better}</p>
                                                    {rw.enhancement_note && <p className="text-[11px] text-[var(--text-muted)] italic mt-2">If you have it: {rw.enhancement_note}</p>}
                                                </div>
                                            </div>
                                        </div>
                                    )) || <p className="text-[13px] text-[var(--text-muted)] text-center p-8">No rewrites available</p>}
                                </div>
                            )}

                            {/* ===== JOB ALIGNMENT ===== */}
                            {activeTab === "alignment" && (
                                <div className="flex flex-col gap-3">
                                    {(report.job_alignment?.strongly_aligned?.length || report.job_alignment?.underplayed?.length || report.job_alignment?.missing?.length) ? (
                                        <>
                                            {[
                                                { key: 'aligned', title: 'Strongly Aligned', items: report.job_alignment?.strongly_aligned, color: 'bg-green-500', meaning: 'Already legible on the page.' },
                                                { key: 'underplayed', title: 'Underplayed', items: report.job_alignment?.underplayed, color: 'bg-amber-400', meaning: 'Signals exist, but evidence is buried.' },
                                                { key: 'missing', title: 'Missing/Weak', items: report.job_alignment?.missing, color: 'bg-red-500', meaning: 'Add one bullet that proves this.' },
                                            ].map(({ key, title, items, color, meaning }) => (
                                                <div key={key} className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] p-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className={`w-2 h-2 rounded-full ${color}`} />
                                                        <span className="text-sm font-semibold text-[var(--text-primary)]">{title}</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1.5 mb-2">
                                                        {items?.map((item, i) => <span key={i} className="text-[12px] px-2.5 py-1 rounded-full bg-[var(--bg-section-muted)] text-[var(--text-secondary)]">{item}</span>) || <span className="text-xs text-[var(--text-muted)]">None found</span>}
                                                    </div>
                                                    <p className="text-[11px] italic text-[var(--text-muted)] pt-2 border-t border-[var(--border-subtle)]">{meaning}</p>
                                                </div>
                                            ))}
                                            {/* Role Fit Section */}
                                            {report.job_alignment?.role_fit && (
                                                <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] p-4">
                                                    <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Role Fit Analysis</h4>
                                                    <div className="flex flex-col gap-4">
                                                        {/* Best Fit Roles */}
                                                        {(report.job_alignment.role_fit.best_fit_roles?.length ?? 0) > 0 && (
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <span className="w-2 h-2 rounded-full bg-green-500" />
                                                                    <span className="text-[13px] font-medium text-[var(--text-primary)]">Best Fit Roles</span>
                                                                </div>
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {report.job_alignment.role_fit.best_fit_roles?.map((role, i) => (
                                                                        <span key={i} className="text-[12px] px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">{role}</span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {/* Stretch Roles */}
                                                        {(report.job_alignment.role_fit.stretch_roles?.length ?? 0) > 0 && (
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                                                                    <span className="text-[13px] font-medium text-[var(--text-primary)]">Stretch Roles</span>
                                                                </div>
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {report.job_alignment.role_fit.stretch_roles?.map((role, i) => (
                                                                        <span key={i} className="text-[12px] px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">{role}</span>
                                                                    ))}
                                                                </div>
                                                                <p className="text-[11px] text-[var(--text-muted)] mt-1 italic">You could grow into these, but would need to emphasize different skills.</p>
                                                            </div>
                                                        )}
                                                        {/* Seniority, Industry, and Company Stage */}
                                                        <div className="pt-3 border-t border-[var(--border-subtle)] grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                            {report.job_alignment.role_fit.seniority_read && (
                                                                <div>
                                                                    <span className="text-[11px] font-medium text-[var(--text-muted)] block mb-1">Seniority Read</span>
                                                                    <span className="text-[13px] text-[var(--text-primary)]">{report.job_alignment.role_fit.seniority_read}</span>
                                                                </div>
                                                            )}
                                                            {(report.job_alignment.role_fit.industry_signals?.length ?? 0) > 0 && (
                                                                <div>
                                                                    <span className="text-[11px] font-medium text-[var(--text-muted)] block mb-1">Industry Signals</span>
                                                                    <span className="text-[13px] text-[var(--text-primary)]">{report.job_alignment.role_fit.industry_signals?.join(", ")}</span>
                                                                </div>
                                                            )}
                                                            {report.job_alignment.role_fit.company_stage_fit && (
                                                                <div>
                                                                    <span className="text-[11px] font-medium text-[var(--text-muted)] block mb-1">Company Stage Fit</span>
                                                                    <span className="text-[13px] text-[var(--text-primary)]">{report.job_alignment.role_fit.company_stage_fit}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {report.job_alignment?.positioning_suggestion && (
                                                <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] p-4">
                                                    <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Positioning</h4>
                                                    <p className="text-[13px] leading-relaxed text-[var(--text-secondary)] max-w-[520px]">{report.job_alignment.positioning_suggestion}</p>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] p-8 text-center">
                                            <p className="text-[13px] text-[var(--text-muted)]">Add a job description to see alignment analysis</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ===== MISSING WINS ===== */}
                            {activeTab === "wins" && (
                                <div className="flex flex-col gap-3">
                                    {report.ideas?.questions?.map((q, i) => (
                                        <div key={i} className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] p-4 flex justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[14px] font-medium text-[var(--text-primary)] mb-1.5">{q.question}</p>
                                                {q.archetype && <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">{q.archetype}</span>}
                                                {q.why && <p className="text-[12px] text-[var(--text-muted)] mt-2">{q.why}</p>}
                                            </div>
                                            <button className="self-start text-[11px] font-medium px-2.5 py-1 rounded-full bg-[var(--bg-section-muted)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors whitespace-nowrap">Draft answer</button>
                                        </div>
                                    )) || report.next_steps?.map((step, i) => (
                                        <div key={i} className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] p-4">
                                            <p className="text-[13px] text-[var(--text-secondary)]">{step}</p>
                                        </div>
                                    )) || <p className="text-[13px] text-[var(--text-muted)] text-center p-8">No questions available</p>}

                                    {report.ideas?.how_to_use && (
                                        <div className="bg-[var(--bg-card-alt)] rounded-xl border border-[var(--border-subtle)] p-4">
                                            <p className="text-[11px] text-[var(--text-muted)]"><strong>How to use:</strong> {report.ideas.how_to_use}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } } .scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
        </div>
    );
}
