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
    // overflow-clip, not overflow-hidden: hidden would make this a scroll container, and a report scrolls
    // with the page (plan item 2.4), so its sticky section tabs need the viewport as their scroller.
    return (
        <div className="flex-1 flex flex-col overflow-clip">
            {children}
        </div>
    );
}
