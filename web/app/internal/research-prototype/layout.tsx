import type { Metadata } from "next";
import { HeaderLayout } from "@/components/layout/HeaderLayout";

// Research prototypes (docs/research-library-strategy.md). Never indexed; each page 404s in production.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function ResearchPrototypeLayout({ children }: { children: React.ReactNode }) {
  return <HeaderLayout>{children}</HeaderLayout>;
}
