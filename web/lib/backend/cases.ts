import { supabase } from "@/lib/supabase";
import { Case, ResumeArtifact, InterviewPlanArtifact, OfferArtifact } from "@/lib/types/case";

export class CaseRepository {

    // Create a new Case
    static async createCase(userId: string, roleContext: any) {
        // 1. Insert Case
        const { data: caseData, error: caseError } = await supabase
            .from('cases')
            .insert({
                user_id: userId, // In a real app, this comes from auth
                role_context: roleContext,
                status: 'active',
                curr_stage: 'applying' // default
            })
            .select()
            .single();

        if (caseError) throw new Error(`Failed to create case: ${caseError.message}`);
        return caseData;
    }

    // Save an Artifact (Resume, Interview, Offer)
    static async saveArtifact(caseId: string, type: 'resume' | 'interview_plan' | 'offer', content: any) {
        const { data, error } = await supabase
            .from('artifacts')
            .insert({
                case_id: caseId,
                type: type,
                content: content,
                version: 1
            })
            .select()
            .single();

        if (error) throw new Error(`Failed to save artifact: ${error.message}`);
        return data;
    }

    // Get Full Case (with Artifacts)
    static async getCase(caseId: string): Promise<Case | null> {
        // 1. Get Case
        const { data: caseData, error: caseError } = await supabase
            .from('cases')
            .select('*')
            .eq('id', caseId)
            .single();

        if (caseError || !caseData) return null;

        // 2. Get Artifacts
        const { data: artifacts, error: artError } = await supabase
            .from('artifacts')
            .select('*')
            .eq('case_id', caseId);

        if (artError) throw new Error(`Failed to fetch artifacts: ${artError.message}`);

        // 3. Assemble Domain Object
        const fullCase: Case = {
            id: caseData.id,
            user_id: caseData.user_id,
            created_at: caseData.created_at,
            updated_at: caseData.updated_at,
            status: caseData.status,
            current_stage: caseData.curr_stage,
            user_context: caseData.user_context,
            role_context: caseData.role_context,
            // Map artifacts
            resume: artifacts.find(a => a.type === 'resume')?.content as ResumeArtifact,
            interview_plan: artifacts.find(a => a.type === 'interview_plan')?.content as InterviewPlanArtifact,
            offer: artifacts.find(a => a.type === 'offer')?.content as OfferArtifact
        };

        return fullCase;
    }
}
