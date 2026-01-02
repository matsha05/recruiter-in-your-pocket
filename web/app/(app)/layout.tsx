import { AppHeader } from "@/components/layout/AppHeader";

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
            <AppHeader />
            <main className="flex-1 flex flex-col">{children}</main>
        </div>
    );
}

