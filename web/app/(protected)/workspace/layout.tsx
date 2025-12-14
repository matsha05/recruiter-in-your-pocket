import { StudioShell } from "@/components/layout/StudioShell";

export default function WorkspaceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <StudioShell disableScroll={true}>
            {children}
        </StudioShell>
    );
}
