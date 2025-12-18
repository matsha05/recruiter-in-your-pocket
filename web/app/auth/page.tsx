import { Suspense } from 'react';
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
            <Suspense fallback={<AuthLoadingSkeleton />}>
                <AuthClient />
            </Suspense>
        </StudioShell>
    );
}

function AuthLoadingSkeleton() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-2">
                    <div className="h-9 w-48 bg-muted animate-pulse rounded mx-auto" />
                    <div className="h-5 w-64 bg-muted/50 animate-pulse rounded mx-auto" />
                </div>
                <div className="bg-card border border-border/10 rounded-md p-8 shadow-sm space-y-4">
                    <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                    <div className="h-10 w-full bg-muted/50 animate-pulse rounded" />
                    <div className="h-10 w-full bg-muted animate-pulse rounded" />
                </div>
            </div>
        </div>
    );
}
