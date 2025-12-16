
import { NextRequest, NextResponse } from "next/server";
import { CaseRepository } from "@/lib/backend/cases";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, roleContext, artifactType, artifactContent } = body;

        // 1. Create Case
        const newCase = await CaseRepository.createCase(userId || 'anon_user', roleContext);

        // 2. Save Initial Artifact if provided
        if (artifactType && artifactContent) {
            await CaseRepository.saveArtifact(newCase.id, artifactType, artifactContent);
        }

        return NextResponse.json({ ok: true, caseId: newCase.id });

    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
    }
}
