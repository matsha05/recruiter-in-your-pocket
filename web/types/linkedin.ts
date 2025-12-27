// LinkedIn Profile Types

export interface LinkedInProfile {
    source: 'url' | 'pdf';

    // Identity
    name: string;
    headline: string;
    location: string | null;
    profileUrl: string;

    // Content Sections
    about: string | null;
    experience: LinkedInExperience[];
    education: LinkedInEducation[];
    skills: string[];
    certifications: string[];

    // Visual Elements (URL only - not available in PDF)
    hasPhoto: boolean | null;
    hasBanner: boolean | null;
    photoUrl: string | null;

    // Social Proof (URL only - not available in PDF)
    connectionCount: string | null;
    followerCount: string | null;

    // Metadata
    fetchedAt: string;
    isComplete: boolean;
}

export interface LinkedInExperience {
    title: string;
    company: string;
    duration: string;
    description: string | null;
    isCurrent: boolean;
}

export interface LinkedInEducation {
    school: string;
    degree: string | null;
    field: string | null;
    dates: string | null;
}

// LinkedIn Report Types (LLM response schema)

export interface LinkedInReport {
    // Core Scores
    score: number;
    score_label: string;
    score_comment_short: string;
    score_comment_long: string;

    // The 3-Second Verdict (Hero Section)
    first_impression: {
        profile_card_verdict: string;
        headline_verdict: 'generic' | 'differentiated' | 'keyword_rich';
        photo_status: 'professional' | 'adequate' | 'missing' | 'needs_work' | 'unknown';
        banner_status: 'branded' | 'generic' | 'missing' | 'unknown';
        visibility_estimate: string;
    };

    // Headline Analysis
    headline_analysis: {
        current: string;
        verdict: string;
        issues: string[];
        rewrite: string;
        why_better: string;
    };

    // About Section Analysis
    about_analysis: {
        has_about: boolean;
        hook_strength: 'strong' | 'adequate' | 'weak' | 'missing';
        hook_verdict: string;
        full_verdict: string;
        rewrite_suggestion: string | null;
    };

    // Experience Red Pen (Top 3 weakest bullets)
    experience_rewrites: {
        original: string;
        better: string;
        enhancement_note: string;
        company: string;
    }[];

    // Recruiter Search Visibility
    search_visibility: {
        score: number;
        keywords_present: string[];
        keywords_missing: string[];
        headline_keyword_density: 'strong' | 'moderate' | 'weak';
        recommendation: string;
    };

    // Quick Wins
    top_fixes: {
        fix: string;
        why: string;
        effort: 'quick' | 'moderate' | 'involved';
        section: 'headline' | 'about' | 'experience' | 'skills' | 'photo';
    }[];

    // Subscores
    subscores: {
        visibility: number;
        first_impression: number;
        content_quality: number;
        completeness: number;
    };

    // Role Alignment
    role_fit: {
        best_fit_roles: string[];
        current_positioning: string;
        positioning_suggestion: string;
    };
}

// API Request/Response types
export interface LinkedInFeedbackRequest {
    profileUrl?: string;
    pdfText?: string;
    source: 'url' | 'pdf';
}

export interface LinkedInFeedbackResponse {
    ok: true;
    report: LinkedInReport;
    profile: LinkedInProfile;
}

export interface LinkedInFeedbackError {
    ok: false;
    message: string;
    errorCode?: string;
    fallback?: 'pdf';
}
