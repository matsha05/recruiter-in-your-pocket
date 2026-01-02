import { Metadata } from 'next';
import SettingsClient from '@/components/workspace/SettingsClient';

export const metadata: Metadata = {
    title: 'Settings — Recruiter in Your Pocket',
    description: 'Manage your subscription and billing.',
};

export default function SettingsPage() {
    return <SettingsClient />;
}
