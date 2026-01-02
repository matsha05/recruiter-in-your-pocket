import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import JobDetailClient from '@/components/jobs/JobDetailClient';

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
        <div className="flex-1 p-6 md:p-8 lg:p-12">
            <div className="mx-auto w-full max-w-5xl">
                <JobDetailClient jobId={resolvedParams.id} />
            </div>
        </div>
    );
}
