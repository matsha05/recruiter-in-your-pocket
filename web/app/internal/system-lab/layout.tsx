import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lifted Line Design System",
  description: "Canonical production reference for the Recruiter in Your Pocket Lifted Line design system.",
  robots: { index: false, follow: false },
};

export default function SystemLabLayout({ children }: { children: React.ReactNode }) {
  return children;
}
