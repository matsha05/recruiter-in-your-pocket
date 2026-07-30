import WorkspaceClient from "@/components/workspace/WorkspaceClient";
import type { ReportData } from "@/components/workspace/report/ReportTypes";
import sampleReport from "@/public/sample-report.json";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Resume Workspace",
  description: "Get recruiter-grade feedback on your resume. Upload your resume and job description to see how you read to hiring managers at top companies.",
};

type WorkspacePageProps = {
  searchParams: Promise<{ sample?: string | string[] }>;
};

export default async function WorkspacePage({ searchParams }: WorkspacePageProps) {
  const params = await searchParams;
  const sampleValue = Array.isArray(params.sample) ? params.sample[0] : params.sample;
  const sampleRequested = sampleValue === "1" || sampleValue === "true";

  return (
    <WorkspaceClient
      key={sampleRequested ? "sample-workspace" : "standard-workspace"}
      initialReport={sampleRequested ? sampleReport as ReportData : null}
    />
  );
}
