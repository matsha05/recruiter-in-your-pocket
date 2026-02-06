"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browserClient";
import type { User } from "@supabase/supabase-js";
import { identifyUser, resetAnalytics } from "@/lib/analytics";
import { isPassActive, isUnlimitedPassTier } from "@/lib/billing/entitlements";

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
            const { data: { user: supabaseUser } } = await supabase.auth.getUser();
            const baseUser = mapUser(supabaseUser);

            if (baseUser) {
                // Fetch passes and free status parallel
                try {
                    const [passesRes, freeRes] = await Promise.all([
                        fetch("/api/passes"),
                        fetch("/api/free-status")
                    ]);

                    const passesData = await passesRes.json();
                    const freeData = await freeRes.json();

                    // 1. Determine Membership from Passes
                    if (passesData.ok && Array.isArray(passesData.passes)) {
                        const now = new Date();
                        const activePasses = passesData.passes.filter((p: any) => isPassActive(p));

                        const lifetimePass = activePasses.find((p: any) => p.tier === "lifetime");
                        const monthlyPass = activePasses.find((p: any) => p.tier === "monthly");
                        const creditPasses = activePasses.filter((p: any) => !isUnlimitedPassTier(p.tier));

                        if (lifetimePass) {
                            baseUser.membership = "lifetime";
                            baseUser.daysLeft = undefined;
                        } else if (monthlyPass) {
                            baseUser.membership = "monthly";
                            const diffTime = new Date(monthlyPass.expires_at).getTime() - now.getTime();
                            baseUser.daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
                        } else if (creditPasses.length > 0) {
                            baseUser.membership = "credit";
                            baseUser.paidUsesLeft = creditPasses.reduce((sum: number, pass: any) => {
                                return sum + Math.max(0, Number(pass.uses_remaining || 0));
                            }, 0);
                        } else {
                            baseUser.membership = "free";
                        }
                    } else {
                        baseUser.membership = "free";
                    }

                    // 2. Add Free Uses Left (from cookie)
                    if (freeData.free_uses_left !== undefined) {
                        baseUser.freeUsesLeft = freeData.free_uses_left;
                    }

                } catch (err) {
                    console.error("Error fetching status:", err);
                    baseUser.membership = "free"; // Fallback safe
                }
            }

            setUser(baseUser);

            // Identify user in analytics
            if (baseUser) {
                identifyUser(baseUser.id, {
                    email: baseUser.email || undefined,
                    name: baseUser.firstName || undefined,
                    plan: baseUser.membership || "free",
                    credits_remaining: baseUser.freeUsesLeft,
                });
            }
        } catch (error) {
            console.error("Error refreshing user:", error);
            setUser(null);
        }
    }, [mapUser, supabase]);

    const signOut = async () => {
        try {
            await fetch("/api/auth/sign-out", { method: "POST" });
            setUser(null);
            resetAnalytics(); // Clear analytics state
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
                setUser(mapUser(session?.user || null));
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
