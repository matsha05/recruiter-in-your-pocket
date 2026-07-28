import { SiteHeader } from "./SiteHeader";

interface HeaderLayoutProps {
    children: React.ReactNode;
}

/**
 * HeaderLayout — Unified header wrapper for marketing/editorial pages.
 *
 * Marketing and editorial routes keep one stable shell while authentication
 * hydrates. SiteHeader exposes signed-in actions without swapping the entire
 * header after the first paint; app routes own AppHeader in their route layout.
 */
export function HeaderLayout({ children }: HeaderLayoutProps) {
    return (
        <div className="min-h-screen flex flex-col">
            <a href="#main-content" className="skip-link">Skip to content</a>
            <SiteHeader />
            <main id="main-content" tabIndex={-1} className="flex-1">{children}</main>
        </div>
    );
}
