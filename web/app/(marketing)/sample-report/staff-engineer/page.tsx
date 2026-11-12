import { SampleReportBySituation, sampleReportMetadata } from "@/components/marketing/SampleReportBySituation";
import report from "@/public/sample-reports/staff-engineer.json";

// WorkspaceClient reads URL state, so the sample renders per request, as Jordan's does.
export const dynamic = "force-dynamic";

export const metadata = sampleReportMetadata("staff-engineer");

export default function Page() {
  return <SampleReportBySituation slug="staff-engineer" report={report} />;
}
