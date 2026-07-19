import WorkspaceClient from "@/components/workspace/WorkspaceClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Resume Workspace",
  description: "Get recruiter-grade feedback on your resume. Upload your resume and job description to see how you read to hiring managers at top companies.",
};

export default function WorkspacePage() {
  return (
    <WorkspaceClient />
  );
}
