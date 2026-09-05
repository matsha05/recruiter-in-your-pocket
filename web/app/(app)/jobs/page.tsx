import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import JobsClient from '@/components/jobs/JobsClient';
import { launchFlags } from '@/lib/launch/flags';

export function generateMetadata(): Metadata {
    if (!launchFlags.extensionSync) {
        return {
            title: 'Page Not Found',
            description: 'The requested page is not available.',
            robots: { index: false, follow: false },
        };
    }

    return {
        title: 'Jobs — Recruiter in Your Pocket',
        description: 'Save job descriptions, compare them with your resume, and track your applications.',
    };
}

export default function JobsPage() {
    if (!launchFlags.extensionSync) notFound();

    return (
        <div className="flex-1 p-4 sm:p-6 md:p-8 lg:p-12">
            <div className="mx-auto w-full max-w-6xl">
                <JobsClient />
            </div>
        </div>
    );
}
