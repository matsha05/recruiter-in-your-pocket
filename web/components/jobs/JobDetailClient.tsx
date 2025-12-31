"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
    ArrowLeft,
    ExternalLink,
    CheckCircle2,
    AlertCircle,
    XCircle,
    FileText,
    MessageSquare,
    Sparkles,
    Building2,
    MapPin,
    Calendar,
    ChevronDown,
    Check
} from 'lucide-react';
import { toast } from 'sonner';

// =============================================================================
// TYPES
// =============================================================================

type JobStatus = 'saved' | 'interested' | 'applying' | 'interviewing' | 'archived';

interface JobDetail {
    id: string;
    external_id?: string;
    title: string;
    company: string;
    location?: string;
    url: string;
    source: 'linkedin' | 'indeed';
    status: JobStatus;
    match_score: number | null;
    captured_at: string;
    job_description_text?: string;
    // Real match insights from hybrid engine
    matchedSkills: string[];
    missingSkills: string[];
    topGaps: string[];
}

// =============================================================================
// STATUS CONFIG
// =============================================================================

const STATUS_CONFIG: Record<JobStatus, { label: string; color: string; bgColor: string }> = {
    saved: { label: 'Saved', color: 'text-muted-foreground', bgColor: 'bg-muted' },
    interested: { label: 'Interested', color: 'text-blue-600', bgColor: 'bg-blue-500/10' },
    applying: { label: 'Applying', color: 'text-amber-600', bgColor: 'bg-amber-500/10' },
    interviewing: { label: 'Interviewing', color: 'text-purple-600', bgColor: 'bg-purple-500/10' },
    archived: { label: 'Archived', color: 'text-muted-foreground', bgColor: 'bg-muted/50' },
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface JobDetailClientProps {
    jobId: string;
}

export default function JobDetailClient({ jobId }: JobDetailClientProps) {
    const router = useRouter();
    const [job, setJob] = useState<JobDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusMenuOpen, setStatusMenuOpen] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    useEffect(() => {
        async function fetchJob() {
            try {
                const res = await fetch(`/api/extension/saved-jobs/${jobId}`);
                if (!res.ok) {
                    if (res.status === 404) {
                        setError('Job not found');
                    } else {
                        setError('Failed to load job');
                    }
                    return;
                }
                const data = await res.json();
                const jobData = data.data;
                setJob({
                    id: jobData.id,
                    external_id: jobData.externalId,
                    title: jobData.title,
                    company: jobData.company,
                    location: jobData.location,
                    url: jobData.url,
                    source: jobData.source || 'linkedin',
                    status: jobData.status || 'saved',
                    match_score: jobData.score,
                    captured_at: jobData.capturedAt,
                    job_description_text: jobData.jobDescription || jobData.jdText,
                    // Real match insights from hybrid engine
                    matchedSkills: jobData.matchedSkills || [],
                    missingSkills: jobData.missingSkills || [],
                    topGaps: jobData.topGaps || [],
                });
            } catch (err) {
                console.error('Failed to fetch job:', err);
                setError('Failed to load job');
            } finally {
                setLoading(false);
            }
        }
        fetchJob();
    }, [jobId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="text-muted-foreground">Loading job details...</div>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="space-y-4">
                <Link
                    href="/jobs"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Jobs
                </Link>
                <div className="p-8 text-center border border-border rounded-lg bg-card">
                    <AlertCircle className="h-8 w-8 mx-auto text-destructive mb-3" />
                    <p className="text-muted-foreground">{error || 'Job not found'}</p>
                </div>
            </div>
        );
    }

    const score = job.match_score ?? 0;
    const statusConfig = STATUS_CONFIG[job.status];
    const capturedDate = new Date(job.captured_at);

    return (
        <div className="space-y-6">
            {/* Back Link */}
            <Link
                href="/jobs"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Jobs
            </Link>

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-display font-semibold tracking-tight text-foreground">
                            {job.title}
                        </h1>
                        {/* Interactive Status Selector */}
                        <div className="relative">
                            <button
                                onClick={() => setStatusMenuOpen(!statusMenuOpen)}
                                disabled={updatingStatus}
                                className={cn(
                                    "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full transition-colors",
                                    statusConfig.bgColor,
                                    statusConfig.color,
                                    "hover:opacity-80 cursor-pointer"
                                )}
                            >
                                {statusConfig.label}
                                <ChevronDown className="h-3 w-3" />
                            </button>
                            {statusMenuOpen && (
                                <div className="absolute top-full left-0 mt-1 w-40 bg-card border border-border rounded-md shadow-lg z-50">
                                    {(Object.keys(STATUS_CONFIG) as JobStatus[]).map((statusKey) => {
                                        const config = STATUS_CONFIG[statusKey];
                                        const isSelected = job.status === statusKey;
                                        return (
                                            <button
                                                key={statusKey}
                                                onClick={async () => {
                                                    if (statusKey === job.status) {
                                                        setStatusMenuOpen(false);
                                                        return;
                                                    }
                                                    setUpdatingStatus(true);
                                                    try {
                                                        const res = await fetch(`/api/extension/saved-jobs/${jobId}`, {
                                                            method: 'PATCH',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({ status: statusKey })
                                                        });
                                                        if (res.ok) {
                                                            setJob(prev => prev ? { ...prev, status: statusKey } : prev);
                                                            toast.success(`Status updated to ${config.label}`);
                                                        } else {
                                                            toast.error('Failed to update status');
                                                        }
                                                    } catch {
                                                        toast.error('Failed to update status');
                                                    } finally {
                                                        setUpdatingStatus(false);
                                                        setStatusMenuOpen(false);
                                                    }
                                                }}
                                                className={cn(
                                                    "w-full px-3 py-2 text-left text-sm flex items-center justify-between",
                                                    "hover:bg-muted transition-colors",
                                                    isSelected && "bg-muted/50"
                                                )}
                                            >
                                                <span className={config.color}>{config.label}</span>
                                                {isSelected && <Check className="h-4 w-4 text-success" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                            <Building2 className="h-4 w-4" />
                            {job.company}
                        </span>
                        {job.location && (
                            <span className="flex items-center gap-1.5">
                                <MapPin className="h-4 w-4" />
                                {job.location}
                            </span>
                        )}
                        <span className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            Captured {capturedDate.toLocaleDateString()}
                        </span>
                    </div>
                </div>

                {/* Open Original */}
                <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md border border-border hover:bg-muted transition-colors"
                >
                    <ExternalLink className="h-4 w-4" />
                    View Original
                </a>
            </div>

            {/* Premium Tabbed Interface */}
            <JobDetailTabs
                score={score}
                job={job}
            />
        </div>
    );
}

// =============================================================================
// PREMIUM TABBED INTERFACE
// =============================================================================

type TabId = 'overview' | 'job-description' | 'analysis';

interface JobDetailTabsProps {
    score: number;
    job: JobDetail;
}

function JobDetailTabs({ score, job }: JobDetailTabsProps) {
    const [activeTab, setActiveTab] = useState<TabId>('overview');

    const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
        { id: 'overview', label: 'Overview', icon: Sparkles },
        { id: 'job-description', label: 'Job Description', icon: FileText },
        { id: 'analysis', label: 'Full Analysis', icon: CheckCircle2 },
    ];

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="border-b border-border">
                <nav className="flex gap-6">
                    {tabs.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            className={cn(
                                "flex items-center gap-2 px-1 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
                                activeTab === id
                                    ? "border-brand text-brand"
                                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            {label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-4">
                            <RecruiterFitSummary
                                score={score}
                                matchedSkills={job.matchedSkills}
                                missingSkills={job.missingSkills}
                                topGaps={job.topGaps}
                            />
                        </div>
                        <div className="space-y-4">
                            <NextBestActions jobId={job.id} />
                        </div>
                    </div>
                )}

                {activeTab === 'job-description' && (
                    <div className="border border-border rounded-lg bg-card overflow-hidden">
                        <div className="px-6 py-4 border-b border-border bg-muted/30">
                            <h3 className="font-medium text-foreground">Full Job Description</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                {job.company} • {job.location || 'Location not specified'}
                            </p>
                        </div>
                        <div className="p-6 max-h-[600px] overflow-y-auto">
                            {job.job_description_text ? (
                                <FormattedJobDescription text={job.job_description_text} />
                            ) : (
                                <p className="text-muted-foreground text-center py-8">
                                    No job description available.
                                    <a href={job.url} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline ml-1">
                                        View original posting
                                    </a>
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'analysis' && (
                    <div className="space-y-6">
                        {/* Full Skills Breakdown */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* All Matched Skills */}
                            <div className="border border-border rounded-lg bg-card p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <CheckCircle2 className="h-5 w-5 text-success" />
                                    <h3 className="font-medium text-foreground">
                                        Matched Skills ({job.matchedSkills.length})
                                    </h3>
                                </div>
                                {job.matchedSkills.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {job.matchedSkills.map((skill, i) => (
                                            <span
                                                key={i}
                                                className="px-2 py-1 text-xs bg-success/10 text-success rounded-full"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No matched skills found</p>
                                )}
                            </div>

                            {/* All Missing Skills */}
                            <div className="border border-border rounded-lg bg-card p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <AlertCircle className="h-5 w-5 text-destructive" />
                                    <h3 className="font-medium text-foreground">
                                        Missing Skills ({job.missingSkills.length})
                                    </h3>
                                </div>
                                {job.missingSkills.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {job.missingSkills.map((skill, i) => (
                                            <span
                                                key={i}
                                                className="px-2 py-1 text-xs bg-destructive/10 text-destructive rounded-full"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No missing skills — great match!</p>
                                )}
                            </div>
                        </div>

                        {/* Gap Analysis */}
                        {job.topGaps.length > 0 && (
                            <div className="border border-border rounded-lg bg-card p-6">
                                <h3 className="font-medium text-foreground mb-4">Priority Gaps to Address</h3>
                                <ul className="space-y-3">
                                    {job.topGaps.map((gap, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/10 text-amber-600 text-xs font-medium flex items-center justify-center">
                                                {i + 1}
                                            </span>
                                            <span className="text-sm text-muted-foreground">{gap}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Next Actions in Analysis Tab */}
                        <NextBestActions jobId={job.id} />
                    </div>
                )}
            </div>
        </div>
    );
}

// =============================================================================
// RECRUITER FIT SUMMARY
// =============================================================================

interface RecruiterFitSummaryProps {
    score: number;
    matchedSkills: string[];
    missingSkills: string[];
    topGaps: string[];
}

function RecruiterFitSummary({
    score,
    matchedSkills,
    missingSkills,
    topGaps
}: RecruiterFitSummaryProps) {
    const [expanded, setExpanded] = useState(false);
    const scoreClass = getScoreClass(score);
    const scoreColors = {
        success: 'text-success border-success/20 bg-success/5',
        premium: 'text-premium border-premium/20 bg-premium/5',
        destructive: 'text-destructive border-destructive/20 bg-destructive/5',
    };

    // Calculate requirements coverage from skills
    const totalSkills = matchedSkills.length + missingSkills.length;
    const requirementsMet = matchedSkills.length;
    const coveragePercent = totalSkills > 0 ? (requirementsMet / totalSkills) * 100 : 0;

    return (
        <div className="border border-border rounded-lg p-6 bg-card space-y-6">
            {/* Score Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-medium text-foreground">Recruiter Fit Summary</h3>
                    <p className="text-sm text-muted-foreground">
                        How a recruiter would view your resume against this role
                    </p>
                </div>
                <div className={cn(
                    "w-16 h-16 rounded-full border-2 flex items-center justify-center",
                    scoreColors[scoreClass]
                )}>
                    <span className="text-xl font-bold">{score > 0 ? score : '—'}</span>
                </div>
            </div>

            {/* Requirements Progress */}
            {totalSkills > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Skills Coverage</span>
                        <span className="font-medium">{requirementsMet}/{totalSkills} matched</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-brand rounded-full transition-all"
                            style={{ width: `${coveragePercent}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Strengths & Gaps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Matched Skills */}
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        Skills recruiters will see
                    </h4>
                    {matchedSkills.length > 0 ? (
                        <ul className="space-y-2">
                            {(expanded ? matchedSkills : matchedSkills.slice(0, 5)).map((skill, i) => (
                                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <span className="text-success mt-1">•</span>
                                    {skill}
                                </li>
                            ))}
                            {matchedSkills.length > 5 && (
                                <li>
                                    <button
                                        onClick={() => setExpanded(!expanded)}
                                        className="text-xs text-brand hover:underline font-medium"
                                    >
                                        {expanded ? 'Show less' : `+${matchedSkills.length - 5} more skills matched`}
                                    </button>
                                </li>
                            )}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground/70 italic">
                            No matching skills detected
                        </p>
                    )}
                </div>

                {/* Missing Skills / Gaps */}
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-destructive" />
                        Gaps to address
                    </h4>
                    {topGaps.length > 0 || missingSkills.length > 0 ? (
                        <ul className="space-y-2">
                            {topGaps.map((gap, i) => (
                                <li key={`gap-${i}`} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <span className="text-destructive mt-1">•</span>
                                    {gap}
                                </li>
                            ))}
                            {missingSkills.slice(0, Math.max(0, 3 - topGaps.length)).map((skill, i) => (
                                <li key={`missing-${i}`} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <span className="text-destructive mt-1">•</span>
                                    Missing: {skill}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground/70 italic">
                            Great match! No major gaps detected
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

// =============================================================================
// NEXT BEST ACTIONS
// =============================================================================

function NextBestActions({ jobId }: { jobId: string }) {
    return (
        <div className="border border-border rounded-lg p-6 bg-card space-y-4">
            <h3 className="font-medium text-foreground">Next Best Actions</h3>

            <div className="space-y-2">
                <ActionButton
                    icon={FileText}
                    label="Tailor Resume"
                    description="Get bullet edits for this job"
                    href={`/workspace?job=${jobId}`}
                />
                <ActionButton
                    icon={Sparkles}
                    label="Generate Bullets"
                    description="Fill evidence gaps"
                    comingSoon
                />
                <ActionButton
                    icon={MessageSquare}
                    label="Draft Outreach"
                    description="Recruiter message template"
                    comingSoon
                />
            </div>
        </div>
    );
}

interface ActionButtonProps {
    icon: React.ElementType;
    label: string;
    description: string;
    href?: string;
    comingSoon?: boolean;
}

function ActionButton({ icon: Icon, label, description, href, comingSoon }: ActionButtonProps) {
    const content = (
        <>
            <Icon className="h-5 w-5 text-brand shrink-0" />
            <div className="flex-1 text-left">
                <div className="text-sm font-medium text-foreground">{label}</div>
                <div className="text-xs text-muted-foreground">{description}</div>
            </div>
            {comingSoon && (
                <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    Soon
                </span>
            )}
        </>
    );

    if (href && !comingSoon) {
        return (
            <Link
                href={href}
                className="flex items-center gap-3 p-3 rounded-md border border-border hover:bg-muted/50 transition-colors"
            >
                {content}
            </Link>
        );
    }

    return (
        <div className={cn(
            "flex items-center gap-3 p-3 rounded-md border border-border",
            comingSoon ? "opacity-60 cursor-not-allowed" : "hover:bg-muted/50 cursor-pointer transition-colors"
        )}>
            {content}
        </div>
    );
}

// =============================================================================
// UTILITIES
// =============================================================================

function getScoreClass(score: number): 'success' | 'premium' | 'destructive' {
    if (score >= 85) return 'success';
    if (score >= 70) return 'premium';
    return 'destructive';
}

// =============================================================================
// FORMATTED JOB DESCRIPTION
// =============================================================================

// Section header patterns for JD parsing
const SECTION_PATTERNS = [
    /^(About|About Us|About the (Company|Team|Role|Position))/i,
    /^(What You['']ll Do|Responsibilities|Key Responsibilities|Your Role)/i,
    /^(What We['']re Looking For|Requirements|Qualifications|What You Need|Minimum Qualifications)/i,
    /^(Preferred Qualifications|Nice to Have|Bonus Points|Preferred)/i,
    /^(Benefits|Perks|What We Offer|Compensation)/i,
    /^(How to Apply|Application|Next Steps)/i,
];

function FormattedJobDescription({ text }: { text: string }) {
    // Split text into lines and parse sections
    const lines = text.split('\n');
    const sections: Array<{ header: string | null; content: string[] }> = [];
    let currentSection: { header: string | null; content: string[] } = { header: null, content: [] };

    for (const line of lines) {
        const trimmed = line.trim();

        // Check if this line is a section header
        const isHeader = SECTION_PATTERNS.some(pattern => pattern.test(trimmed)) ||
            (trimmed.length < 60 && trimmed.endsWith(':')) ||
            (trimmed.length < 60 && /^[A-Z][^a-z]*$/.test(trimmed.replace(/[:\s]/g, '')));

        if (isHeader && trimmed.length > 0) {
            // Save current section if it has content
            if (currentSection.content.length > 0 || currentSection.header) {
                sections.push(currentSection);
            }
            currentSection = { header: trimmed.replace(/:$/, ''), content: [] };
        } else if (trimmed.length > 0) {
            currentSection.content.push(trimmed);
        }
    }

    // Don't forget the last section
    if (currentSection.content.length > 0 || currentSection.header) {
        sections.push(currentSection);
    }

    return (
        <div className="space-y-6">
            {sections.map((section, idx) => (
                <div key={idx} className="space-y-2">
                    {section.header && (
                        <h4 className="text-sm font-semibold text-foreground">
                            {section.header}
                        </h4>
                    )}
                    <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
                        {section.content.map((line, lineIdx) => {
                            // Check if it's a bullet point
                            const isBullet = /^[•\-*]\s/.test(line) || /^\d+[.)]\s/.test(line);
                            if (isBullet) {
                                return (
                                    <div key={lineIdx} className="flex gap-2 pl-2">
                                        <span className="text-brand">•</span>
                                        <span>{line.replace(/^[•\-*\d.)]+\s*/, '')}</span>
                                    </div>
                                );
                            }
                            return <p key={lineIdx}>{line}</p>;
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
