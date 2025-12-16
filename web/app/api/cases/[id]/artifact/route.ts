
import { NextRequest, NextResponse } from "next/server";
import { CaseRepository } from "@/lib/backend/cases";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { type, content } = body;

        if (!type || !content) {
            return NextResponse.json({ ok: false, error: "Missing type or content" }, { status: 400 });
        }

        // Save/Update Artifact
        // Note: Our repository 'saveArtifact' inserts a new version. 
        // We might want to just update the latest, but versioning is safer.
        const updatedArtifact = await CaseRepository.saveArtifact(id, type, content);

        return NextResponse.json({ ok: true, artifact: updatedArtifact });

    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
    }
}
