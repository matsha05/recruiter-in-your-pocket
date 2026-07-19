import type { Metadata } from "next";
import { AppHeader } from "@/components/layout/AppHeader";
import { PRIVATE_ROUTE_ROBOTS } from "@/lib/seo/privateRouteMetadata";

export const metadata: Metadata = {
    robots: PRIVATE_ROUTE_ROBOTS,
};

/**
 * App Layout — For authenticated app features (workspace, jobs, settings)
 * 
 * Provides just the AppHeader for consistent navigation.
 * Pages control their own content layout (maxWidth, padding, etc.)
 */
export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <a href="#main-content" className="skip-link">Skip to content</a>
            <AppHeader />
            <main id="main-content" tabIndex={-1} className="flex-1 flex flex-col">{children}</main>
        </div>
    );
}
