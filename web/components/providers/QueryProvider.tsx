"use client";

import { ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function createQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 30_000,
                gcTime: 5 * 60_000,
                refetchOnWindowFocus: false,
                retry: 1,
            },
            mutations: {
                retry: 1,
            },
        },
    });
}

let browserQueryClient: QueryClient | undefined;

// Only app routes use React Query, so the provider sits in their layout rather
// than on every page. The browser keeps one client for the whole visit, as it
// did when the provider was in the root layout, so leaving the app and coming
// back keeps the cache. The server renders with a fresh client per request.
function getQueryClient() {
    if (typeof window === "undefined") return createQueryClient();
    browserQueryClient ??= createQueryClient();
    return browserQueryClient;
}

export function QueryProvider({ children }: { children: ReactNode }) {
    const [queryClient] = useState(getQueryClient);
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
