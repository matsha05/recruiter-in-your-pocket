import { redirect } from "next/navigation";

export default function DashboardPage() {
    // Deprecated: The "Case Files" experiment has been deprecated in favor of the Workspace flow.
    // Redirect all traffic to /workspace.
    redirect("/workspace");
}
