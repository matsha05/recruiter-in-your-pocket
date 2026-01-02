import { Metadata } from 'next';
import JobsClient from '@/components/jobs/JobsClient';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
    title: 'Jobs — Recruiter in Your Pocket',
    description: 'Track and compare jobs with recruiter-grade match insights.',
};

export default function JobsPage() {
    return (
        <AppShell maxWidth="6xl">
            <JobsClient />
        </AppShell>
    );
}
