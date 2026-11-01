import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SystemLab from "@/components/internal/system-lab/SystemLab";

export const dynamic = "force-dynamic";

const internalPagesEnabled = () => process.env.NODE_ENV !== "production" || process.env.ALLOW_INTERNAL_PAGES === "true";

// Metadata lives here, behind the same gate as the page, so a production 404 doesn't carry the internal title.
export function generateMetadata(): Metadata {
  const robots = { index: false, follow: false };
  if (!internalPagesEnabled()) return { robots };
  return {
    title: "Lifted Line Design System",
    description: "Canonical production reference for the Recruiter in Your Pocket Lifted Line design system.",
    robots,
  };
}

export default function SystemLabPage() {
  if (!internalPagesEnabled()) {
    notFound();
  }

  return <SystemLab />;
}
