"use client";

import { useSearchParams } from "next/navigation";
import { AuthFlow } from "@/components/auth/AuthFlow";
import { normalizeAuthContext, safeAuthRedirect } from "@/lib/auth/utils";

export default function AuthClient() {
    const searchParams = useSearchParams();
    const getSearchParam = searchParams.get.bind(searchParams);
    const from = getSearchParam("from");
    const nextParam = getSearchParam("next");
    const errorParam = getSearchParam("error");
    const initialError = errorParam
        ? ({
            auth_callback_failed: "That sign-in attempt could not be verified. Request a new code.",
            access_denied: "That sign-in attempt was canceled or expired. Please try again.",
            expired: "That sign-in code has expired. Request a new one.",
        } as Record<string, string>)[errorParam] || "Sign-in could not be completed. Please try again."
        : null;

    const context = normalizeAuthContext(from);
    const fallback = from === "settings" ? "/settings" : "/workspace";
    const redirectTo = safeAuthRedirect(nextParam, fallback);

    return (
        <AuthFlow
            variant="page"
            context={context}
            redirectTo={redirectTo}
            initialError={initialError}
        />
    );
}
