
import { notFound } from "next/navigation";
import { CaseRepository } from "@/lib/backend/cases";
import { CaseView } from "@/components/dashboard/CaseView";

interface CasePageProps {
    params: Promise<{ id: string }>;
}

export default async function CasePage({ params }: CasePageProps) {
    const { id } = await params;

    // Fetch Data on Server
    const caseFile = await CaseRepository.getCase(id);

    if (!caseFile) {
        notFound();
    }

    return <CaseView caseFile={caseFile} />;
}
