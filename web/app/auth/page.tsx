import { Metadata } from 'next';
import AuthClient from '@/components/auth/AuthClient';
import { StudioShell } from '@/components/layout/StudioShell';

export const metadata: Metadata = {
    title: 'Login — Recruiter in Your Pocket',
    description: 'Sign in to access your analysis history and pro features.'
};

export default function AuthPage() {
    return (
        <StudioShell showSidebar={false}>
            <AuthClient />
        </StudioShell>
    );
}
