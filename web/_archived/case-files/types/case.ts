/**
 * Core Data Models for "The Case File" (Flagship Redesign)
 * 
 * The Case File is the single source of truth for a user's journey.
 * It replaces ad-hoc "runs" with a persistent object that tracks
 * the User, the Role, and the Artifacts (Resume, Offer, Interview).
 */

export type CaseStatus = 'active' | 'closed' | 'won' | 'lost' | 'archived';
export type CaseStage = 'applying' | 'interviewing' | 'negotiating';

// --- 1. User Profile Context ---
export interface UserProfileContext {
    id: string; // User ID
    goals?: {
        primary: 'compensation' | 'level' | 'work_life_balance' | 'mission' | 'prestige';
        target_role?: string; // e.g., "Senior Product Manager"
    };
    voice_preferences?: {
        tone: 'direct' | 'diplomatic' | 'enthusiastic' | 'formal';
    };
    risk_tolerance?: 'low' | 'medium' | 'high'; // Influences negotiation advice
}

// --- 2. Role Context ---
export interface RoleContext {
    title: string;
    company_name: string;
    level?: string; // e.g., "L5", "Senior"
    location?: string;
    job_description_text?: string;
    job_url?: string;
    // Extracted signals from JD (populated by LLM)
    signals?: {
        keywords: string[];
        priorities: string[]; // What the hiring manager cares about
    };
}

// --- 3. Artifacts ---

// Resume Artifact
export interface ResumeArtifact {
    id: string;
    file_url?: string;
    raw_text: string;
    parsed_data?: {
        sections: any; // Simplified for now, would be a strict ResumeSchema
    };
    // The "Verdict" Analysis
    analysis?: {
        verdict: 'shortlist' | 'maybe' | 'pass';
        verdict_reason: string;
        attention_map_regions: string[]; // Areas preventing fit
        signal_ladder: {
            claim: string;
            proof: string; // The text that proves it
            strength: 'weak' | 'medium' | 'strong';
        }[];
        top_fixes: {
            id: string;
            issue: string;
            why_it_matters: string;
            rewrite: string; // The "After"
        }[];
    };
    version: number;
    created_at: string;
}

// Offer Artifact
export interface OfferArtifact {
    id: string;
    status: 'received' | 'countered' | 'accepted' | 'declined';
    components: {
        base_salary: number;
        sign_on_bonus?: number;
        equity_value?: number; // Annualized or total
        equity_type?: 'rsu' | 'options';
        annual_bonus_target?: number; // percent or amount
        relocation?: number;
    };
    deadlines?: {
        decision_date?: string;
    };
    // Negotiation Strategy (LLM Output)
    strategy?: {
        strategy_summary: string;
        levers_checklist: {
            lever: string;
            status: string;
            coach_note: string;
        }[];
        ask_script: {
            email_subject?: string;
            email_body: string;
            call_script_bullets: string[];
        };
        risk_assessment: string;
        fallback_plan: string;
    };
}

// Interview Plan Artifact
export interface InterviewPlanArtifact {
    id: string;
    schedule: {
        round_name: string; // e.g. "Hiring Manager", "System Design"
        date?: string;
        interviewer_role?: string;
    }[];
    story_bank: {
        id: string;
        headline: string;
        situation: string;
        task: string;
        action: string;
        result: string;
        tags: ('conflict' | 'failure' | 'leadership' | 'execution')[];
    }[];
}

// --- 4. The Case Object (Parent) ---
export interface Case {
    id: string;
    user_id: string; // Owner
    created_at: string;
    updated_at: string;

    status: CaseStatus;
    current_stage: CaseStage; // "What mode are we in?"

    // Contexts
    user_context: UserProfileContext;
    role_context: RoleContext; // The job this case is about

    // Artifacts (Nullable until created)
    resume?: ResumeArtifact;
    offer?: OfferArtifact;
    interview_plan?: InterviewPlanArtifact;
}
