export interface ReportData {
    score?: number;
    score_label?: string;
    score_comment_short?: string;
    score_comment_long?: string;
    score_plain?: string;
    biggest_gap_example?: string;
    first_impression_takeaway?: string;
    summary?: string;
    subscores?: { impact?: number; clarity?: number; story?: number; readability?: number };
    first_impression?: string;
    recruiter_note?: string; // Single-sentence recruiter judgment for RecruiterNote
    strengths?: string[];
    gaps?: string[];
    top_fixes?: Array<{ fix?: string; text?: string; why?: string; evidence?: string; impact_level?: string; effort?: string; section_ref?: string }>;
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
    // Skim data might be added later, it's not in the main LLM response usually but we might merge it.
    skim?: any;
}
