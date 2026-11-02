"use client";

import { ReactNode, useEffect } from "react";
import { LazyMotion, MotionConfig } from "motion/react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { INSTANT_TRANSITION, UI_TRANSITION } from "@/lib/animation";
import { AuthProvider } from "@/components/providers/AuthProvider";

const loadMotionFeatures = () => import("@/lib/motionFeatures").then((module) => module.default);

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  const prefersReducedMotion = useReducedMotion();

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
    <LazyMotion features={loadMotionFeatures}>
      <MotionConfig
        reducedMotion="user"
        transition={prefersReducedMotion ? INSTANT_TRANSITION : UI_TRANSITION}
      >
        <AuthProvider>{children}</AuthProvider>
      </MotionConfig>
    </LazyMotion>
  );
}
