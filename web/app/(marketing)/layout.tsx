import { HeaderLayout } from "@/components/layout/HeaderLayout";

/**
 * Marketing Layout — For guest-focused pages (homepage, legal, etc.)
 * 
 * Uses HeaderLayout which shows:
 * - SiteHeader for guests (marketing nav)
 * - AppHeader for logged-in users (app nav)
 */
export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <HeaderLayout>{children}</HeaderLayout>;
}
