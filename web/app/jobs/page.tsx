import { Metadata } from 'next';
import JobsClient from '@/components/jobs/JobsClient';
import { StudioShell } from '@/components/layout/StudioShell';

export const metadata: Metadata = {
    title: 'Jobs — Recruiter in Your Pocket',
    description: 'Track and compare jobs with recruiter-grade match insights.',
};

export default function JobsPage() {
    return (
        <StudioShell>
            <JobsClient />
        </StudioShell>
    );
}
