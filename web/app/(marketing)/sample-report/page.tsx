import type { Metadata } from "next";
import WorkspaceClient from "@/components/workspace/WorkspaceClient";
import type { ReportData } from "@/components/workspace/report/ReportTypes";
import sampleReport from "@/public/sample-report.json";

// WorkspaceClient reads URL state. Render this public sample per request so the
// complete report is present in the initial response without a CSR-only bailout.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Example Resume Report",
  description: "See how a resume report explains what works, quotes the details behind its feedback, and suggests what to change before applying.",
  alternates: {
    canonical: "/sample-report",
  },
  openGraph: {
    title: "Read an Example Resume Report",
    description: "See the feedback, original resume quotes, and suggested changes in a complete example report.",
    url: "https://www.recruiterinyourpocket.com/sample-report",
    images: ["/opengraph-image?v=20260730"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Read an Example Resume Report",
    description: "See the feedback, original resume quotes, and suggested changes in a complete example report.",
    images: ["/opengraph-image?v=20260730"],
  },
};

export default function SampleReportPage() {
  return (
    <div className="sample-report-page-shell">
      <WorkspaceClient initialReport={sampleReport as ReportData} />
    </div>
  );
}
