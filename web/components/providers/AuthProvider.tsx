"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browserClient";
import type { User } from "@supabase/supabase-js";

interface AuthUser {
    id: string;
    email: string | null;
    firstName?: string | null;
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
            setUser(mapUser(supabaseUser));
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
