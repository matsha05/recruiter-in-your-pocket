/**
 * Internal Landing Options Layout
 * Minimal layout for the landing page showcase - no navigation chrome
 */
export default function InternalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            {children}
        </div>
    );
}
