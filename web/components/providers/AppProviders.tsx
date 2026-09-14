"use client";

import { ReactNode, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LazyMotion, MotionConfig, domMax } from "motion/react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { INSTANT_TRANSITION, UI_TRANSITION } from "@/lib/animation";
import { AuthProvider } from "@/components/providers/AuthProvider";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  const prefersReducedMotion = useReducedMotion();
  const [queryClient] = useState(
    () =>
      new QueryClient({
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
      })
  );

  useEffect(() => {
    const root = document.documentElement;
    root.removeAttribute("data-theme");
    root.classList.remove("dark");
    // Remembering a display preference is optional when storage is restricted.
    // The page must still hydrate in private or policy-controlled browsers.
    try { localStorage.setItem("theme", "light"); } catch { /* Keep the current light theme. */ }
    root.setAttribute("data-app-hydrated", "true");

    return () => {
      root.removeAttribute("data-app-hydrated");
    };
  }, []);

  return (
    <LazyMotion features={domMax}>
      <MotionConfig
        reducedMotion="user"
        transition={prefersReducedMotion ? INSTANT_TRANSITION : UI_TRANSITION}
      >
        <QueryClientProvider client={queryClient}>
          <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
      </MotionConfig>
    </LazyMotion>
  );
}
