"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browserClient";
import type { User } from "@supabase/supabase-js";
import { identifyUser, resetAnalytics } from "@/lib/analytics";
import { readAuthoritativePassAccess } from "@/lib/billing/accountPassStatus";
import { readAuthoritativeFreeUses } from "@/lib/billing/freeStatusClient";
import { toast } from "sonner";

export interface AuthUser {
    id: string;
    email: string | null;
    firstName?: string | null;
    membership?: "monthly" | "lifetime" | "credit" | "free" | null;
    daysLeft?: number;
    freeUsesLeft?: number;
    paidUsesLeft?: number;
    canExportPdf?: boolean;
}

interface AuthContextType {
    user: AuthUser | null;
    isLoading: boolean;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_RESOLUTION_TIMEOUT_MS = 6_500;
const ACCOUNT_STATUS_TIMEOUT_MS = 8_000;

function settleWithin<T>(task: PromiseLike<T>, timeoutMs: number, message: string): Promise<T> {
    return new Promise((resolve, reject) => {
        const timer = window.setTimeout(() => reject(new Error(message)), timeoutMs);

        Promise.resolve(task).then(
            (value) => {
                window.clearTimeout(timer);
                resolve(value);
            },
            (error) => {
                window.clearTimeout(timer);
                reject(error);
            }
        );
    });
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const mountedRef = useRef(false);
    const revisionRef = useRef(0);
    const accountIdRef = useRef<string | null>(null);
    const refreshAbortRef = useRef<AbortController | null>(null);
    const deferredRefreshRef = useRef<number | null>(null);
    const signingOutRef = useRef(false);

    // Create the browser client once (stable instance)
    const supabase = useMemo(() => createSupabaseBrowserClient(), []);

    const invalidateRefresh = useCallback(() => {
        revisionRef.current += 1;
        refreshAbortRef.current?.abort();
        refreshAbortRef.current = null;
        if (deferredRefreshRef.current !== null) {
            window.clearTimeout(deferredRefreshRef.current);
            deferredRefreshRef.current = null;
        }
    }, []);

    const mapUser = useCallback((supabaseUser: User | null): AuthUser | null => {
        if (!supabaseUser) return null;
        return {
            id: supabaseUser.id,
            email: supabaseUser.email || null,
            firstName: supabaseUser.user_metadata?.first_name || null
        };
    }, []);

    const refreshUser = useCallback(async (expectedAccountId?: string) => {
        if (!mountedRef.current || signingOutRef.current) return;
        invalidateRefresh();
        const revision = revisionRef.current;
        const controller = new AbortController();
        refreshAbortRef.current = controller;
        const isCurrent = () => mountedRef.current
            && revisionRef.current === revision && !signingOutRef.current;
        try {
            const { data: { user: supabaseUser }, error } = await settleWithin(
                supabase.auth.getUser(),
                AUTH_RESOLUTION_TIMEOUT_MS,
                "Account check timed out"
            );
            if (!isCurrent()) return;
            if (error && error.name !== "AuthSessionMissingError") throw error;
            if (expectedAccountId && supabaseUser && supabaseUser.id !== expectedAccountId) return;
            const baseUser = mapUser(supabaseUser);
            if (accountIdRef.current !== (baseUser?.id ?? null)) {
                resetAnalytics();
                // Keep this immediate identity snapshot separate from the
                // local object populated with entitlements below.
                setUser(baseUser ? { ...baseUser } : null);
            }
            accountIdRef.current = baseUser?.id ?? null;

            if (baseUser) {
                const [passesResult, freeResult] = await Promise.allSettled([
                    settleWithin(
                        fetch("/api/passes", { signal: controller.signal }).then(async (response) => ({
                            httpOk: response.ok,
                            payload: await response.json(),
                        })),
                        ACCOUNT_STATUS_TIMEOUT_MS,
                        "Pass details timed out"
                    ),
                    settleWithin(
                        fetch("/api/free-status", { signal: controller.signal }).then(async (response) => ({
                            httpOk: response.ok,
                            payload: await response.json(),
                        })),
                        ACCOUNT_STATUS_TIMEOUT_MS,
                        "Free report status timed out"
                    ),
                ]);
                if (!isCurrent() || accountIdRef.current !== baseUser.id) return;

                // Paid pass truth is independent from the free-status endpoint.
                if (passesResult.status === "fulfilled") {
                    const { httpOk, payload: passesData } = passesResult.value;
                    try {
                        Object.assign(baseUser, readAuthoritativePassAccess(httpOk, passesData));
                    } catch (error) {
                        console.error("Error parsing paid pass status:", error);
                    }
                } else {
                    console.error("Error fetching paid pass status:", passesResult.reason);
                }

                if (freeResult.status === "fulfilled") {
                    try {
                        baseUser.freeUsesLeft = readAuthoritativeFreeUses(
                            freeResult.value.httpOk,
                            freeResult.value.payload
                        );
                    } catch (error) {
                        console.error("Error parsing free report status:", error);
                    }
                } else {
                    console.error("Error fetching free report status:", freeResult.reason);
                }
            }

            if (!isCurrent()) return;
            setUser(baseUser);

            // Identify user in analytics
            if (baseUser) {
                identifyUser(baseUser.id, {
                    plan: baseUser.membership || "free",
                    credits_remaining: baseUser.freeUsesLeft,
                });
            }
        } catch (error) {
            if (isCurrent()) console.error("Error refreshing user:", error);
            // Keep the last known account state. Initial load already starts
            // signed out, while auth events remain authoritative for a session
            // that resolves after this bounded request.
        } finally {
            controller.abort();
            if (isCurrent()) {
                refreshAbortRef.current = null;
                setIsLoading(false);
            }
        }
    }, [invalidateRefresh, mapUser, supabase]);

    const signOut = useCallback(async () => {
        if (!mountedRef.current || signingOutRef.current) return;
        signingOutRef.current = true;
        invalidateRefresh();
        const startingAccount = accountIdRef.current;
        const controller = new AbortController();
        setIsLoading(true);
        try {
            const response = await settleWithin(
                fetch("/api/auth/sign-out", { method: "POST", signal: controller.signal }),
                AUTH_RESOLUTION_TIMEOUT_MS,
                "Sign out timed out",
            );
            if (!response.ok) {
                throw new Error("The server could not complete sign out.");
            }
            if (!mountedRef.current) return;
            // An account switch while this request was pending is a newer
            // identity decision; an old sign-out result cannot clear it.
            if (accountIdRef.current !== null && accountIdRef.current !== startingAccount) return;
            invalidateRefresh();
            accountIdRef.current = null;
            setUser(null);
            resetAnalytics(); // Clear analytics state

            // A full replacement clears any private report data already held in
            // client component state and removes the sensitive URL from history.
            window.location.replace("/");
        } catch (error) {
            if (mountedRef.current) {
                console.error("Sign out error:", error);
                toast.error("We couldn't complete sign out. Please try again.");
            }
        } finally {
            controller.abort();
            signingOutRef.current = false;
            if (mountedRef.current) {
                setIsLoading(false);
                if (accountIdRef.current !== null && accountIdRef.current !== startingAccount) {
                    void refreshUser(accountIdRef.current);
                }
            }
        }
    }, [invalidateRefresh, refreshUser]);

    useEffect(() => {
        mountedRef.current = true;
        const deferRefresh = () => {
            const expectedAccountId = accountIdRef.current ?? undefined;
            deferredRefreshRef.current = window.setTimeout(() => {
                deferredRefreshRef.current = null;
                void refreshUser(expectedAccountId);
            }, 0);
        };

        // Keep the callback synchronous: Supabase awaits subscribers, and a
        // nested token refresh can wait on the event currently being delivered.
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                if (!mountedRef.current) return;
                invalidateRefresh();
                const nextUser = mapUser(session?.user ?? null);
                if (accountIdRef.current !== (nextUser?.id ?? null)) resetAnalytics();
                accountIdRef.current = nextUser?.id ?? null;
                setUser((previous) => previous?.id === nextUser?.id && nextUser
                    ? { ...previous, ...nextUser }
                    : nextUser);
                if (!session?.user) {
                    resetAnalytics();
                    setIsLoading(false);
                    return;
                }
                deferRefresh();
            }
        );
        // Subscribe before resolving the initial identity so an event can
        // invalidate even the first pending getUser or account-status request.
        if (deferredRefreshRef.current === null) deferRefresh();

        return () => {
            mountedRef.current = false;
            invalidateRefresh();
            subscription.unsubscribe();
        };
    }, [invalidateRefresh, mapUser, refreshUser, supabase]);

    return (
        <AuthContext.Provider value={{ user, isLoading, signOut, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
