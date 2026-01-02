import { HeaderLayout } from "@/components/layout/HeaderLayout";

/**
 * Editorial Layout — For content pages (research, guides)
 * 
 * Uses HeaderLayout which shows:
 * - SiteHeader for guests (marketing nav)
 * - AppHeader for logged-in users (app nav)
 */
export default function EditorialLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <HeaderLayout>{children}</HeaderLayout>;
}
