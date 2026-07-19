import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import JobsClient from '@/components/jobs/JobsClient';
import { launchFlags } from '@/lib/launch/flags';

export const metadata: Metadata = {
    title: 'Jobs — Recruiter in Your Pocket',
    description: 'Track and compare jobs with recruiter-grade match insights.',
};

export default function JobsPage() {
    if (!launchFlags.extensionSync) notFound();

    return (
        <div className="flex-1 p-6 md:p-8 lg:p-12">
            <div className="mx-auto w-full max-w-6xl">
                <JobsClient />
            </div>
        </div>
    );
}
