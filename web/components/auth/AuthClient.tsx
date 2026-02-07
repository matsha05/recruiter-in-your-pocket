"use client";

import { useSearchParams } from "next/navigation";
import { AuthFlow } from "@/components/auth/AuthFlow";
import { normalizeAuthContext, safeAuthRedirect } from "@/lib/auth/utils";

export default function AuthClient() {
    const searchParams = useSearchParams();
    const from = searchParams.get("from");
    const nextParam = searchParams.get("next");
    const errorParam = searchParams.get("error");

    const context = normalizeAuthContext(from);
    const fallback = from === "settings" ? "/settings" : "/workspace";
    const redirectTo = safeAuthRedirect(nextParam, fallback);

    return (
        <AuthFlow
            variant="page"
            context={context}
            redirectTo={redirectTo}
            initialError={errorParam}
        />
    );
}
