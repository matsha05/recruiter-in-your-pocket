import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import JobDetailClient from '@/components/jobs/JobDetailClient';
import { StudioShell } from '@/components/layout/StudioShell';

interface JobDetailPageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: JobDetailPageProps): Promise<Metadata> {
    const resolvedParams = await params;
    return {
        title: `Job Details — Recruiter in Your Pocket`,
        description: 'View match insights and take action on this job.',
    };
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
    const resolvedParams = await params;

    return (
        <StudioShell>
            <JobDetailClient jobId={resolvedParams.id} />
        </StudioShell>
    );
}
