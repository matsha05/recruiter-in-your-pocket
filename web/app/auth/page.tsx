import { Suspense } from 'react';
import { Metadata } from 'next';
import AuthClient from '@/components/auth/AuthClient';
import { HeaderLayout } from '@/components/layout/HeaderLayout';
import { PRIVATE_ROUTE_ROBOTS } from '@/lib/seo/privateRouteMetadata';

export const metadata: Metadata = {
    title: 'Login — Recruiter in Your Pocket',
    description: 'Sign in to access saved reports and role context you choose to keep.',
    robots: PRIVATE_ROUTE_ROBOTS,
};

export default function AuthPage() {
    return (
        <HeaderLayout>
            <Suspense fallback={<AuthLoadingSkeleton />}>
                <AuthClient />
            </Suspense>
        </HeaderLayout>
    );
}

function AuthLoadingSkeleton() {
    return (
        <div className="flex min-h-[80vh] flex-col items-center justify-center bg-paper px-5">
            <div className="w-full max-w-md space-y-8">
                <div className="space-y-3">
                    <div className="h-3 w-24 animate-pulse rounded-sm bg-brand/20" />
                    <div className="h-12 w-64 animate-pulse rounded-sm bg-muted" />
                    <div className="h-5 w-72 animate-pulse rounded-sm bg-muted/60" />
                </div>
                <div className="space-y-4 border border-line bg-background p-8">
                    <div className="h-4 w-24 animate-pulse rounded-sm bg-muted" />
                    <div className="h-12 w-full animate-pulse rounded-sm bg-muted/50" />
                    <div className="h-12 w-full animate-pulse rounded-sm bg-brand/20" />
                </div>
            </div>
        </div>
    );
}
