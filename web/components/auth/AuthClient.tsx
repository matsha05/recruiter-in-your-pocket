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
