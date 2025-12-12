"use client";

import { useState, useEffect, useRef } from "react";

// Score color
function getScoreColor(score: number): string {
    if (score >= 90) return '#8b5cf6';
    if (score >= 85) return '#3b82f6';
    if (score >= 80) return '#22c55e';
    if (score >= 70) return '#f59e0b';
    return '#ef4444';
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
    isSample?: boolean;
}

// Tab config with subtitles
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

    // Animated score
    const [animatedScore, setAnimatedScore] = useState(0);
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

    // Score animation - once only
    useEffect(() => {
        const targetScore = report?.score || 0;
        if (targetScore <= 0 || hasAnimated.current) {
            if (!hasAnimated.current) setAnimatedScore(targetScore);
            return;
        }
        hasAnimated.current = true;
        const duration = 700;
        const startTime = Date.now();
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setAnimatedScore(Math.round(targetScore * eased));
            if (progress < 1) animationRef.current = requestAnimationFrame(animate);
            else setAnimatedScore(targetScore);
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

    const toggleFix = (index: number) => {
        setCompletedFixes(prev => {
            const next = new Set(prev);
            if (next.has(index)) next.delete(index);
            else next.add(index);
            return next;
        });
    };

    const copyToClipboard = async (text: string, index: number) => {
        await navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 1500);
    };

    // Counts for badges
    const counts = {
        fixes: report?.top_fixes?.length || report?.gaps?.length || 0,
        rewrites: report?.rewrites?.length || 0,
        wins: report?.ideas?.questions?.length || report?.next_steps?.length || 0,
    };

    return (
        <div className="flex flex-col h-full overflow-hidden" style={{ background: 'var(--bg-body)' }}>
            {/* ===== REPORT SPINE — Thin, calm frame ===== */}
            {showReport && (
                <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-subtle)' }}>
                    {/* Row A: Identity + Utilities — Minimal */}
                    <div className="flex items-center justify-between gap-4 px-6 py-1.5" style={{ fontSize: '12px' }}>
                        <div className="flex items-center gap-2">
                            {isSample && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider"
                                    style={{ background: 'var(--bg-section-muted)', color: 'var(--text-muted)' }}>
                                    Sample
                                </span>
                            )}
                            <span style={{ color: 'var(--text-muted)' }}>
                                {report.job_alignment?.role_fit?.best_fit_roles?.[0] || 'Resume Report'}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="font-bold" style={{ color: dialColor }}>{report.score}</span>
                            {onExportPdf && (
                                <button
                                    onClick={onExportPdf}
                                    disabled={isExporting}
                                    className="flex items-center gap-1 px-2 py-1 rounded transition-colors"
                                    style={{ color: 'var(--text-muted)' }}
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    <span>{isExporting ? "..." : "Export"}</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Row B: Chapter Navigation — Typographic */}
                    <nav className="flex gap-0 px-6 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                        {tabConfig.map((tab) => {
                            const isActive = activeTab === tab.id;
                            const count = tab.id === 'fixes' ? counts.fixes : tab.id === 'rewrites' ? counts.rewrites : tab.id === 'wins' ? counts.wins : null;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabChange(tab.id)}
                                    className="relative flex items-center gap-1.5 px-3.5 py-2.5 text-[13px] whitespace-nowrap transition-colors"
                                    style={{
                                        color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                                        fontWeight: isActive ? 550 : 450,
                                        marginBottom: '-1px',
                                    }}
                                >
                                    <span>{tab.label}</span>
                                    {count !== null && count > 0 && (
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                                            style={{
                                                background: isActive ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-section-muted)',
                                                color: isActive ? 'var(--brand)' : 'var(--text-muted)',
                                                lineHeight: 1.2,
                                            }}>
                                            {count}
                                        </span>
                                    )}
                                    {isActive && (
                                        <span className="absolute bottom-0 left-3.5 right-3.5 h-0.5 rounded-full" style={{ background: 'var(--brand)' }} />
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            )}

            {/* ===== CONTENT ===== */}
            <div
                className={`flex-1 overflow-y-auto transition-opacity duration-75 ${tabTransition ? 'opacity-0' : 'opacity-100'}`}
                style={{ background: 'var(--bg-section-muted)' }}
            >
                {/* Empty State */}
                {showEmptyState && (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6" style={{ color: 'var(--text-muted)' }}>
                        <svg className="w-12 h-12 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Ready when you are</div>
                        <p className="text-xs">Upload or paste your resume to get recruiter-grade feedback.</p>
                    </div>
                )}

                {/* Loading State */}
                {showLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6">
                        <div className="w-7 h-7 border-2 rounded-full animate-spin mb-3" style={{ borderColor: 'var(--brand-soft)', borderTopColor: 'var(--brand)' }} />
                        <div className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Reading like a recruiter...</div>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>10-15 seconds</p>
                    </div>
                )}

                {/* Report Content */}
                {showReport && (
                    <div className="max-w-[720px] mx-auto px-6 pb-12">
                        {/* ===== CHAPTER TITLE BLOCK — Left-aligned, same edge as cards ===== */}
                        <div className="mb-5 pt-5">
                            <h1 className="text-[17px] font-semibold m-0" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                                {activeTabData?.label}
                            </h1>
                            <p className="text-[13px] m-0 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                {activeTabData?.subtitle}
                            </p>
                        </div>

                        {/* ===== OVERVIEW ===== */}
                        {activeTab === "overview" && (
                            <div className="space-y-2.5">
                                {/* Hero: Dial reduced, read prominent */}
                                <div className="flex gap-6 p-5 rounded-[10px]" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                                    {/* Score Dial — Smaller */}
                                    <div className="flex flex-col items-center gap-1.5 flex-shrink-0" style={{ width: '88px' }}>
                                        <div className="relative w-[88px] h-[88px]">
                                            <svg viewBox="0 0 120 120" className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
                                                <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" style={{ color: 'var(--text-muted)', opacity: 0.15 }} strokeWidth="7" />
                                                <circle
                                                    cx="60" cy="60" r="54" fill="none"
                                                    stroke={dialColor} strokeWidth="7" strokeLinecap="round"
                                                    strokeDasharray="339.292"
                                                    strokeDashoffset={339.292 * (1 - animatedScore / 100)}
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center text-[28px] font-bold" style={{ color: dialColor, fontFamily: 'var(--font-display)' }}>
                                                {animatedScore}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recruiter Read — Hero */}
                                    <div className="flex-1 min-w-0" style={{ maxWidth: '520px' }}>
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <svg className="w-3.5 h-3.5" style={{ color: 'var(--brand)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                <path d="M12 5C16.478 5 20.268 7.405 22 11C20.268 14.595 16.478 17 12 17C7.522 17 3.732 14.595 2 11C3.732 7.405 7.522 5 12 5Z" />
                                                <circle cx="12" cy="11" r="3" />
                                            </svg>
                                            <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                                                Recruiter First Impression
                                            </span>
                                        </div>
                                        <p className="text-[14px] leading-[1.65] m-0" style={{ color: 'var(--text-secondary)' }}>
                                            {firstImpressionText}
                                        </p>
                                        {/* Next step */}
                                        {report.top_fixes?.[0] && (
                                            <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border-soft)' }}>
                                                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--brand)' }}>Next step</span>
                                                <p className="text-[13px] m-0 mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                                                    {report.top_fixes[0].fix || report.top_fixes[0].text}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Working vs Missing — Two-column pair */}
                                <div className="grid grid-cols-2 gap-2.5">
                                    {report.strengths && report.strengths.length > 0 && (
                                        <div className="p-4 rounded-[10px]" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                                            <h3 className="flex items-center gap-1.5 text-[13px] font-semibold m-0 mb-3" style={{ color: 'var(--text-primary)' }}>
                                                <span className="text-[11px]" style={{ color: 'var(--success)' }}>✓</span> Working
                                            </h3>
                                            <ul className="m-0 p-0 list-none space-y-1.5">
                                                {report.strengths.slice(0, 5).map((s, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-[13px] leading-snug" style={{ color: 'var(--text-secondary)' }}>
                                                        <span style={{ color: 'var(--success)', opacity: 0.6 }}>•</span>
                                                        <span>{s}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {report.gaps && report.gaps.length > 0 && (
                                        <div className="p-4 rounded-[10px]" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                                            <h3 className="flex items-center gap-1.5 text-[13px] font-semibold m-0 mb-3" style={{ color: 'var(--text-primary)' }}>
                                                <span className="text-[11px]" style={{ color: 'var(--warning)' }}>△</span> Missing
                                            </h3>
                                            <ul className="m-0 p-0 list-none space-y-1.5">
                                                {report.gaps.slice(0, 5).map((g, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-[13px] leading-snug" style={{ color: 'var(--text-secondary)' }}>
                                                        <span style={{ color: 'var(--warning)', opacity: 0.6 }}>•</span>
                                                        <span>{g}</span>
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
                            <div className="space-y-2">
                                {/* Progress — Calm, tiny */}
                                {fixesTotal > 0 && (
                                    <div className="text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>
                                        <strong style={{ color: 'var(--text-primary)' }}>{fixesDone}</strong> of {fixesTotal} complete
                                    </div>
                                )}

                                {/* Fix items */}
                                {(report.top_fixes && report.top_fixes.length > 0) ? (
                                    report.top_fixes.map((fix, i) => {
                                        const isDone = completedFixes.has(i);
                                        return (
                                            <div
                                                key={i}
                                                className="flex gap-3.5 p-4 rounded-[10px] transition-all"
                                                style={{
                                                    background: isDone ? 'var(--bg-section-muted)' : 'var(--bg-card)',
                                                    border: `1px solid ${isDone ? 'var(--border-soft)' : 'var(--border-subtle)'}`,
                                                }}
                                            >
                                                {/* Checkbox */}
                                                <button
                                                    onClick={() => toggleFix(i)}
                                                    className="w-[18px] h-[18px] mt-0.5 flex-shrink-0 rounded flex items-center justify-center transition-all"
                                                    style={{
                                                        background: isDone ? 'var(--brand)' : 'var(--bg-card)',
                                                        border: isDone ? 'none' : '1.5px solid var(--border-subtle)',
                                                        color: 'white',
                                                    }}
                                                >
                                                    {isDone && (
                                                        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </button>
                                                <div className="flex-1 min-w-0">
                                                    <p
                                                        className="text-[14px] font-medium m-0 leading-snug"
                                                        style={{ color: isDone ? 'var(--text-muted)' : 'var(--text-primary)' }}
                                                    >
                                                        {fix.fix || fix.text}
                                                    </p>
                                                    {/* Metadata */}
                                                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                                                        {fix.impact_level && <span>↑ {fix.impact_level}</span>}
                                                        {fix.effort && <span>⏱ {fix.effort}</span>}
                                                        {fix.section_ref && <span>{fix.section_ref}</span>}
                                                    </div>
                                                    {/* Why this matters */}
                                                    <p className="text-[12px] mt-2 m-0 pl-2.5 leading-relaxed" style={{ color: 'var(--text-secondary)', borderLeft: '2px solid var(--border-soft)' }}>
                                                        Recruiters can't infer scope from generic language. Add one number or concrete outcome.
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (report.gaps && report.gaps.length > 0) ? (
                                    report.gaps.map((gap, i) => {
                                        const isDone = completedFixes.has(i);
                                        return (
                                            <div key={i} className="flex gap-3.5 p-4 rounded-[10px]" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                                                <button onClick={() => toggleFix(i)} className="w-[18px] h-[18px] mt-0.5 flex-shrink-0 rounded flex items-center justify-center" style={{ background: isDone ? 'var(--brand)' : 'var(--bg-card)', border: isDone ? 'none' : '1.5px solid var(--border-subtle)', color: 'white' }}>
                                                    {isDone && <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                                </button>
                                                <p className="text-[14px] m-0" style={{ color: isDone ? 'var(--text-muted)' : 'var(--text-secondary)' }}>{gap}</p>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-[13px] text-center py-6" style={{ color: 'var(--text-muted)' }}>No fixes available</p>
                                )}
                            </div>
                        )}

                        {/* ===== BY SECTION ===== */}
                        {activeTab === "sections" && (
                            <div className="space-y-2">
                                {report.section_review ? (
                                    Object.entries(report.section_review).map(([sectionName, section], i) => (
                                        <div key={i} className="p-4 rounded-[10px]" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                                            {/* Header: name left, grade right */}
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-[14px] font-semibold m-0" style={{ color: 'var(--text-primary)' }}>{sectionName}</h4>
                                                {section.grade && (
                                                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded"
                                                        style={{
                                                            background: section.grade.includes('A') ? 'rgba(34, 197, 94, 0.12)' : section.grade.includes('B') ? 'rgba(99, 102, 241, 0.12)' : section.grade.includes('C') ? 'rgba(245, 158, 11, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                                                            color: section.grade.includes('A') ? 'var(--success)' : section.grade.includes('B') ? 'var(--brand)' : section.grade.includes('C') ? 'var(--warning)' : 'var(--danger)',
                                                        }}>
                                                        {section.grade}
                                                    </span>
                                                )}
                                            </div>
                                            {/* Rows — Aligned grid */}
                                            <div className="space-y-1.5 text-[13px]">
                                                {section.working && (
                                                    <div className="grid gap-2" style={{ gridTemplateColumns: '70px 1fr' }}>
                                                        <span className="font-medium" style={{ color: 'var(--success)' }}>Working</span>
                                                        <span style={{ color: 'var(--text-secondary)' }}>{section.working}</span>
                                                    </div>
                                                )}
                                                {section.missing && (
                                                    <div className="grid gap-2" style={{ gridTemplateColumns: '70px 1fr' }}>
                                                        <span className="font-medium" style={{ color: 'var(--warning)' }}>Missing</span>
                                                        <span style={{ color: 'var(--text-secondary)' }}>{section.missing}</span>
                                                    </div>
                                                )}
                                                {section.fix && (
                                                    <div className="grid gap-2" style={{ gridTemplateColumns: '70px 1fr' }}>
                                                        <span className="font-medium" style={{ color: 'var(--brand)' }}>Fix</span>
                                                        <span style={{ color: 'var(--text-secondary)' }}>{section.fix}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-[13px] text-center py-6" style={{ color: 'var(--text-muted)' }}>Section analysis not available</p>
                                )}
                            </div>
                        )}

                        {/* ===== BULLET UPGRADES ===== */}
                        {activeTab === "rewrites" && (
                            <div className="space-y-2">
                                {report.rewrites?.map((rw, i) => (
                                    <div key={i} className="p-4 rounded-[10px]" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                                        {/* Header: category label */}
                                        {rw.label && (
                                            <div className="text-[10px] font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
                                                {rw.label}
                                            </div>
                                        )}
                                        {/* Two-column body — No nested cards */}
                                        <div className="grid grid-cols-2 gap-5">
                                            {/* Original */}
                                            <div>
                                                <div className="text-[10px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>Original</div>
                                                <p className="text-[13px] leading-relaxed m-0" style={{ color: 'var(--text-secondary)' }}>{rw.original}</p>
                                            </div>
                                            {/* Better */}
                                            <div>
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--brand)' }}>Better</span>
                                                    <button
                                                        onClick={() => copyToClipboard(rw.better, i)}
                                                        className="text-[10px] font-medium transition-colors"
                                                        style={{ color: copiedIndex === i ? 'var(--success)' : 'var(--text-muted)' }}
                                                    >
                                                        {copiedIndex === i ? '✓ Copied' : 'Copy'}
                                                    </button>
                                                </div>
                                                <p className="text-[13px] leading-relaxed m-0" style={{ color: 'var(--text-primary)' }}>{rw.better}</p>
                                                {rw.enhancement_note && (
                                                    <p className="text-[11px] mt-2 m-0 italic" style={{ color: 'var(--text-muted)' }}>
                                                        If you have it: {rw.enhancement_note}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )) || <p className="text-[13px] text-center py-6" style={{ color: 'var(--text-muted)' }}>No rewrites available</p>}
                            </div>
                        )}

                        {/* ===== JOB ALIGNMENT ===== */}
                        {activeTab === "alignment" && (
                            <div className="space-y-2">
                                {(report.job_alignment?.strongly_aligned?.length || report.job_alignment?.underplayed?.length || report.job_alignment?.missing?.length) ? (
                                    <>
                                        {/* Three neutral cards with accent dots */}
                                        {[
                                            { key: 'aligned', title: 'Strongly Aligned', items: report.job_alignment?.strongly_aligned, color: 'var(--success)', meaning: 'Already legible on the page.' },
                                            { key: 'underplayed', title: 'Underplayed', items: report.job_alignment?.underplayed, color: 'var(--warning)', meaning: 'Signals exist, but the evidence is buried.' },
                                            { key: 'missing', title: 'Missing/Weak', items: report.job_alignment?.missing, color: 'var(--danger)', meaning: 'Add one bullet that proves this.' },
                                        ].map(({ key, title, items, color, meaning }) => (
                                            <div key={key} className="p-4 rounded-[10px]" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                                                <div className="flex items-center gap-2 mb-2.5">
                                                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                                                    <span className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</span>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5 mb-2.5">
                                                    {items?.map((item, i) => (
                                                        <span key={i} className="text-[12px] px-2 py-0.5 rounded" style={{ background: 'var(--bg-section-muted)', color: 'var(--text-secondary)' }}>
                                                            {item}
                                                        </span>
                                                    )) || <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>None found</span>}
                                                </div>
                                                <p className="text-[11px] italic m-0 pt-2.5" style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border-soft)' }}>
                                                    {meaning}
                                                </p>
                                            </div>
                                        ))}

                                        {/* Positioning */}
                                        {report.job_alignment?.positioning_suggestion && (
                                            <div className="p-4 rounded-[10px]" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                                                <h4 className="text-[13px] font-semibold m-0 mb-2" style={{ color: 'var(--text-primary)' }}>Positioning</h4>
                                                <p className="text-[13px] leading-relaxed m-0" style={{ color: 'var(--text-secondary)', maxWidth: '540px' }}>
                                                    {report.job_alignment.positioning_suggestion}
                                                </p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="p-6 rounded-[10px] text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                                        <p className="text-[13px] m-0" style={{ color: 'var(--text-muted)' }}>Add a job description to see alignment analysis</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ===== MISSING WINS ===== */}
                        {activeTab === "wins" && (
                            <div className="space-y-2">
                                {report.ideas?.questions?.map((q, i) => (
                                    <div key={i} className="flex justify-between gap-4 p-4 rounded-[10px]" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[14px] font-medium m-0 mb-1.5" style={{ color: 'var(--text-primary)' }}>{q.question}</p>
                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                {q.archetype && (
                                                    <span className="text-[10px] font-medium px-2 py-0.5 rounded" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--brand)' }}>
                                                        {q.archetype}
                                                    </span>
                                                )}
                                            </div>
                                            {q.why && <p className="text-[12px] m-0" style={{ color: 'var(--text-muted)' }}>{q.why}</p>}
                                        </div>
                                        {/* Action slot */}
                                        <button className="text-[11px] font-medium whitespace-nowrap self-start px-2.5 py-1 rounded transition-colors" style={{ color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
                                            Draft answer
                                        </button>
                                    </div>
                                )) || report.next_steps?.map((step, i) => (
                                    <div key={i} className="p-4 rounded-[10px]" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                                        <p className="text-[13px] m-0" style={{ color: 'var(--text-secondary)' }}>{step}</p>
                                    </div>
                                )) || <p className="text-[13px] text-center py-6" style={{ color: 'var(--text-muted)' }}>No questions available</p>}

                                {report.ideas?.how_to_use && (
                                    <div className="p-3 rounded" style={{ background: 'var(--bg-card-alt)' }}>
                                        <p className="text-[11px] m-0" style={{ color: 'var(--text-muted)' }}>
                                            <strong>How to use:</strong> {report.ideas.how_to_use}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
