import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import JobDetailClient from '@/components/jobs/JobDetailClient';
import { launchFlags } from '@/lib/launch/flags';

interface JobDetailPageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: JobDetailPageProps): Promise<Metadata> {
    const resolvedParams = await params;
    return {
        title: "Job Details",
        description: 'Compare your resume with this job and update your application status.',
    };
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
    if (!launchFlags.extensionSync) notFound();

    const resolvedParams = await params;

    return (
        <div className="flex-1 bg-background px-4 py-8 sm:px-6 sm:py-12">
            <div className="mx-auto w-full max-w-workspace">
                <JobDetailClient jobId={resolvedParams.id} />
            </div>
        </div>
    );
}
