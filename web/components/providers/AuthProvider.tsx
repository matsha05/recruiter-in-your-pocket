"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browserClient";
import type { User } from "@supabase/supabase-js";

export interface AuthUser {
    id: string;
    email: string | null;
    firstName?: string | null;
    membership?: "pro" | "audit" | "free" | null;
    daysLeft?: number;
    freeUsesLeft?: number;
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
                        const activePasses = passesData.passes.filter((p: any) => new Date(p.expires_at) > now);

                        const proPass = activePasses.find((p: any) => p.tier === "30d");
                        const auditPass = activePasses.find((p: any) => p.tier === "single_use" || p.tier === "24h"); // Check both for legacy compat

                        if (proPass) {
                            baseUser.membership = "pro";
                            // Calculate days left
                            const diffTime = new Date(proPass.expires_at).getTime() - now.getTime();
                            baseUser.daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        } else if (auditPass) {
                            baseUser.membership = "audit";
                            baseUser.daysLeft = undefined; // It's single use, no days count needed
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
        } catch (error) {
            console.error("Error refreshing user:", error);
            setUser(null);
        }
    }, [mapUser, supabase]);

    const signOut = async () => {
        try {
            await fetch("/api/auth/sign-out", { method: "POST" });
            setUser(null);
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
