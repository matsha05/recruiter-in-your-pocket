import WorkspaceClient from "@/components/workspace/WorkspaceClient";
import type { ReportData } from "@/components/workspace/report/ReportTypes";
import sampleReport from "@/public/sample-report.json";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "New report",
  description: "Add your resume to see what a recruiter is likely to notice first, what needs more detail, and what to change before you apply.",
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
      initialReport={sampleRequested ? sampleReport as ReportData : null}
    />
  );
}
