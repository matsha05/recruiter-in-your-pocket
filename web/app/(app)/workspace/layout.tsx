/**
 * Workspace Layout — Full-height layout for the studio
 * 
 * Parent layout provides AppHeader, so we just need to handle the full-height aspect.
 */
export default function WorkspaceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {children}
        </div>
    );
}
