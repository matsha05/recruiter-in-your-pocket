"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import styles from "./progress.module.css";
import { ProgressView, type ProgressAnalytics } from "./ProgressView";


function StatePage({ title, body, children }: { title: string; body: string; children?: React.ReactNode }) {
    return (
        <section className={styles.state}>
            <h1 className={styles.stateTitle}>{title}</h1>
            <p className={styles.stateBody}>{body}</p>
            {children && <div className={styles.stateActions}>{children}</div>}
        </section>
    );
}

export default function DashboardPage() {
    const { user, isLoading: authLoading } = useAuth();
    const [analytics, setAnalytics] = useState<ProgressAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchAnalytics = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            const res = await fetch("/api/analytics");
            const data = await res.json().catch(() => null);
            if (res.ok && data?.ok) setAnalytics(data.analytics);
            else setError(true);
        } catch (err) {
            console.error("Analytics fetch error:", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (authLoading) return;
        if (user) {
            void fetchAnalytics();
            return;
        }
        setAnalytics(null);
        setError(false);
        setLoading(false);
    }, [authLoading, fetchAnalytics, user]);

    if (authLoading || loading) {
        return (
            <section className={styles.state} aria-busy="true">
                <div className={styles.skeletonTitle} />
                <div className={styles.skeletonLine} />
                <p className="sr-only" role="status">Loading your progress</p>
            </section>
        );
    }

    if (!user) {
        return (
            <StatePage title="Sign in to see your progress." body="Your saved reports and how they've moved live in your account.">
                <Button asChild variant="primary"><Link href="/auth?from=dashboard&next=/dashboard">Sign in</Link></Button>
                <Link href="/workspace" className={styles.textLink}>Get your free report</Link>
            </StatePage>
        );
    }

    if (error || !analytics) {
        return (
            <StatePage title="We couldn't load your progress." body="Your reports are safe. This is on our end; try again in a moment.">
                <Button type="button" variant="primary" onClick={() => void fetchAnalytics()}>Try again</Button>
            </StatePage>
        );
    }

    if (analytics.totalReviews === 0) {
        return (
            <StatePage title="Nothing to compare yet." body="Run a report and save it. Your next version will have something honest to measure against.">
                <Button asChild variant="primary"><Link href="/workspace">New report <ArrowRight className="ml-1 size-4" weight="bold" /></Link></Button>
            </StatePage>
        );
    }

    return <ProgressView analytics={analytics} />;
}
