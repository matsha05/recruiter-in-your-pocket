import { SampleReportBySituation, sampleReportMetadata } from "@/components/marketing/SampleReportBySituation";
import report from "@/public/sample-reports/new-graduate.json";

// WorkspaceClient reads URL state, so the sample renders per request, as Jordan's does.
export const dynamic = "force-dynamic";

export const metadata = sampleReportMetadata("new-graduate");

export default function Page() {
  return <SampleReportBySituation slug="new-graduate" report={report} />;
}
