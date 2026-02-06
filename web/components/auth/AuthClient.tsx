"use client";

import { useSearchParams } from "next/navigation";
import { AuthFlow, type AuthContext } from "@/components/auth/AuthFlow";

function normalizeContext(from: string | null): AuthContext {
    if (from === "report" || from === "settings" || from === "paywall") return from;
    return "default";
}

function safeRedirect(nextParam: string | null, fallback: string) {
    if (nextParam && nextParam.startsWith("/")) return nextParam;
    return fallback;
}

export default function AuthClient() {
    const searchParams = useSearchParams();
    const from = searchParams.get("from");
    const nextParam = searchParams.get("next");
    const errorParam = searchParams.get("error");

    const context = normalizeContext(from);
    const fallback = from === "settings" ? "/settings" : "/workspace";
    const redirectTo = safeRedirect(nextParam, fallback);

    return (
        <AuthFlow
            variant="page"
            context={context}
            redirectTo={redirectTo}
            initialError={errorParam}
        />
    );
}
