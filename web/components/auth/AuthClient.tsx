"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight } from "@phosphor-icons/react";
import { AuthFlow } from "@/components/auth/AuthFlow";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { normalizeAuthContext, safeAuthRedirect } from "@/lib/auth/utils";

export default function AuthClient() {
    const { user, isLoading, signOut } = useAuth();
    // Only people who arrive signed in see this; someone finishing sign-in here keeps the flow.
    const [arrivedSignedIn, setArrivedSignedIn] = useState<boolean | null>(null);
    useEffect(() => {
        if (!isLoading && arrivedSignedIn === null) setArrivedSignedIn(Boolean(user));
    }, [arrivedSignedIn, isLoading, user]);
    const searchParams = useSearchParams();
    const getSearchParam = searchParams.get.bind(searchParams);
    const from = getSearchParam("from");
    const nextParam = getSearchParam("next");
    const errorParam = getSearchParam("error");
    const initialError = errorParam
        ? ({
            auth_callback_failed: "That sign-in attempt could not be verified. Request a new code.",
            access_denied: "That sign-in attempt was canceled or expired. Try again.",
            expired: "That sign-in code has expired. Request a new one.",
        } as Record<string, string>)[errorParam] || "Sign-in didn’t go through. Try again."
        : null;

    const context = normalizeAuthContext(from);
    const fallback = from === "settings" ? "/settings" : "/workspace";
    const redirectTo = safeAuthRedirect(nextParam, fallback);

    if (arrivedSignedIn && user) {
        return (
            <div data-visual-anchor="auth-page" className="min-h-[80vh] bg-background px-4 pb-16 pt-28 text-foreground sm:px-6 md:px-8 md:pb-24 md:pt-36">
                <div className="mx-auto grid max-w-[34rem] gap-4">
                    <p className="text-xs font-semibold text-[hsl(var(--pen))]">Signed in</p>
                    <h1 className="text-balance font-display text-title text-foreground">You&apos;re already signed in.</h1>
                    <p className="text-base text-muted-foreground">
                        You&apos;re signed in as <span className="break-all font-medium text-foreground">{user.email}</span>.
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                        <Button asChild variant="primary">
                            <Link href={nextParam ? redirectTo : "/reports"}>
                                {nextParam ? "Continue" : "Go to my reports"}
                                <ArrowRight className="size-4" weight="bold" aria-hidden="true" />
                            </Link>
                        </Button>
                        <Button type="button" variant="secondary"  onClick={() => void signOut()}>
                            Sign out
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <AuthFlow
            variant="page"
            context={context}
            redirectTo={redirectTo}
            initialError={initialError}
        />
    );
}
