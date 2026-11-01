import type { Metadata } from "next";
import WorkspaceClient from "@/components/workspace/WorkspaceClient";
import type { ReportData } from "@/components/workspace/report/ReportTypes";
import sampleReport from "@/public/sample-report.json";

// WorkspaceClient reads URL state. Render this public sample per request so the
// complete report is present in the initial response without a CSR-only bailout.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sample report",
  description: "A complete resume report on a fictional candidate, Jordan: what works, the lines behind each note, and the one thing to fix first.",
  alternates: {
    canonical: "/sample-report",
  },
  openGraph: {
    title: "Read an Example Resume Report",
    description: "A complete resume report on a fictional candidate: the feedback, the quoted lines behind it, and what to fix first.",
    url: "https://www.recruiterinyourpocket.com/sample-report",
    images: ["/opengraph-image?v=20261101"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Read an Example Resume Report",
    description: "A complete resume report on a fictional candidate: the feedback, the quoted lines behind it, and what to fix first.",
    images: ["/opengraph-image?v=20261101"],
  },
};

export default function SampleReportPage() {
  return (
    <div className="sample-report-page-shell">
      <WorkspaceClient initialReport={sampleReport as ReportData} />
    </div>
  );
}
