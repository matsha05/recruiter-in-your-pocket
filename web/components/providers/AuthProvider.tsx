"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browserClient";
import type { User } from "@supabase/supabase-js";
import { identifyUser, resetAnalytics } from "@/lib/analytics";
import { readAuthoritativePassAccess } from "@/lib/billing/accountPassStatus";
import { readAuthoritativeFreeUses } from "@/lib/billing/freeStatusClient";

export interface AuthUser {
    id: string;
    email: string | null;
    firstName?: string | null;
    membership?: "monthly" | "lifetime" | "credit" | "free" | null;
    daysLeft?: number;
    freeUsesLeft?: number;
    paidUsesLeft?: number;
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

    // Create the browser client once (stable instance)
    const supabase = useMemo(() => createSupabaseBrowserClient(), []);

    const mapUser = useCallback((supabaseUser: User | null): AuthUser | null => {
        if (!supabaseUser) return null;
        return {
            id: supabaseUser.id,
            email: supabaseUser.email || null,
            firstName: supabaseUser.user_metadata?.first_name || null
        };
    }, []);

    const refreshUser = useCallback(async () => {
        try {
            const { data: { user: supabaseUser } } = await settleWithin(
                supabase.auth.getUser(),
                AUTH_RESOLUTION_TIMEOUT_MS,
                "Account check timed out"
            );
            const baseUser = mapUser(supabaseUser);

            if (baseUser) {
                const [passesResult, freeResult] = await Promise.allSettled([
                    settleWithin(
                        fetch("/api/passes").then(async (response) => ({
                            httpOk: response.ok,
                            payload: await response.json(),
                        })),
                        ACCOUNT_STATUS_TIMEOUT_MS,
                        "Pass details timed out"
                    ),
                    settleWithin(
                        fetch("/api/free-status").then(async (response) => ({
                            httpOk: response.ok,
                            payload: await response.json(),
                        })),
                        ACCOUNT_STATUS_TIMEOUT_MS,
                        "Free report status timed out"
                    ),
                ]);

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

            setUser(baseUser);

            // Identify user in analytics
            if (baseUser) {
                identifyUser(baseUser.id, {
                    plan: baseUser.membership || "free",
                    credits_remaining: baseUser.freeUsesLeft,
                });
            }
        } catch (error) {
            console.error("Error refreshing user:", error);
            // Keep the last known account state. Initial load already starts
            // signed out, while auth events remain authoritative for a session
            // that resolves after this bounded request.
        }
    }, [mapUser, supabase]);

    const signOut = async () => {
        try {
            const response = await fetch("/api/auth/sign-out", { method: "POST" });
            if (!response.ok) {
                throw new Error("The server could not complete sign out.");
            }
            setUser(null);
            resetAnalytics(); // Clear analytics state

            // A full replacement clears any private report data already held in
            // client component state and removes the sensitive URL from history.
            window.location.replace("/");
        } catch (error) {
            console.error("Sign out error:", error);
        }
    };

    useEffect(() => {
        // Get initial user
        refreshUser().finally(() => setIsLoading(false));

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!session?.user) {
                    setUser(null);
                    resetAnalytics();
                    return;
                }

                // Keep entitlements in sync after sign-in/refresh/user updates.
                if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
                    await refreshUser();
                    return;
                }

                setUser(mapUser(session.user));
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [mapUser, refreshUser, supabase]);

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
