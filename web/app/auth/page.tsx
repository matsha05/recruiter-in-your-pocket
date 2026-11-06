import { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import AuthClient from '@/components/auth/AuthClient';
import { Wordmark } from '@/components/icons/Wordmark';
import rhythm from '@/components/materials/Rhythm.module.css';
import { PRIVATE_ROUTE_ROBOTS } from '@/lib/seo/privateRouteMetadata';
import styles from './AuthPage.module.css';

export const metadata: Metadata = {
    title: { absolute: 'Sign in | Recruiter in Your Pocket' },
    description: 'Sign in to see your saved reports and the job postings you kept.',
    robots: PRIVATE_ROUTE_ROBOTS,
};

/**
 * Sign-in (Nov 4, 2026): bare, the wordmark only. The sign-in pages measured that day (Linear, Vercel, HEY,
 * Basecamp, Monzo) carry 20 to 90 words, no navigation and no decoration; Matt chose the bare page over one
 * under the site header. The form itself is unchanged.
 */
export default function AuthPage() {
    return (
        <div className={`${rhythm.page} ${styles.page}`}>
            <a href="#main-content" className="skip-link">Skip to content</a>
            <header className={styles.top}>
                <Link href="/" aria-label="Recruiter in Your Pocket home" className="focus-ring">
                    <Wordmark className={styles.mark} />
                </Link>
            </header>
            <main id="main-content" tabIndex={-1} className={styles.main}>
                <Suspense fallback={<AuthLoadingSkeleton />}>
                    <AuthClient />
                </Suspense>
            </main>
        </div>
    );
}

function AuthLoadingSkeleton() {
    return (
        <div className={styles.column} aria-hidden="true">
            <div className="h-9 w-48 animate-pulse rounded-sm bg-muted" />
            <div className="mt-6 h-12 w-full animate-pulse rounded-sm bg-muted/50" />
            <div className="mt-4 h-12 w-full animate-pulse rounded-full bg-foreground/15" />
        </div>
    );
}
