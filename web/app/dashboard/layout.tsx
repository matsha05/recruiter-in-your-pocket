import type { Metadata } from "next";
import { PRIVATE_ROUTE_ROBOTS } from "@/lib/seo/privateRouteMetadata";
import { AppHeader } from "@/components/layout/AppHeader";

export const metadata: Metadata = {
  title: "Your progress",
  description: "What keeps coming up across your reports, and what keeps working.",
  robots: PRIVATE_ROUTE_ROBOTS,
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <AppHeader />
      <main id="main-content" tabIndex={-1} className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
