"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "motion/react";
import { AuthProvider } from "@/components/providers/AuthProvider";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  const pathname = usePathname();
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

  const isIsolatedSystemLab = pathname === "/internal/system-lab";

  useEffect(() => {
    const root = document.documentElement;
    root.removeAttribute("data-theme");
    root.classList.remove("dark");
    localStorage.setItem("theme", "light");
    root.setAttribute("data-app-hydrated", "true");

    return () => {
      root.removeAttribute("data-app-hydrated");
    };
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <QueryClientProvider client={queryClient}>
        {isIsolatedSystemLab ? children : <AuthProvider>{children}</AuthProvider>}
      </QueryClientProvider>
    </MotionConfig>
  );
}
