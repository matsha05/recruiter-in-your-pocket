import type { Metadata } from "next";
import WorkspaceClient from "@/components/workspace/WorkspaceClient";
import type { ReportData } from "@/components/workspace/report/ReportTypes";
import sampleReport from "@/public/sample-report.json";

// WorkspaceClient reads URL state. Render this public sample per request so the
// complete report is present in the initial response without a CSR-only bailout.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Example Resume Report",
  description: "Read a complete recruiter-style resume report with an opening read, quoted evidence, factual rewrite prompts, strengths, and role direction.",
  alternates: {
    canonical: "/sample-report",
  },
  openGraph: {
    title: "See a Complete Recruiter-Style Resume Report",
    description: "A real product sample: recruiter-style judgment, quoted evidence, factual rewrite prompts, strengths, and role direction.",
    url: "https://www.recruiterinyourpocket.com/sample-report",
    images: ["/opengraph-image?v=20260730"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "See a Complete Recruiter-Style Resume Report",
    description: "A real product sample with recruiter-style judgment, quoted evidence, and factual rewrite prompts.",
    images: ["/opengraph-image?v=20260730"],
  },
};

export default function SampleReportPage() {
  return <WorkspaceClient initialReport={sampleReport as ReportData} />;
}
