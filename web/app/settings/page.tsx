import { Metadata } from 'next';
import SettingsClient from '@/components/workspace/SettingsClient';
import { StudioShell } from '@/components/layout/StudioShell';

export const metadata: Metadata = {
    title: 'Settings — Recruiter in Your Pocket',
    description: 'Manage your subscription and billing.',
};

export default function SettingsPage() {
    return (
        <StudioShell>
            <SettingsClient />
        </StudioShell>
    );
}
