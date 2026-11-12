import { SampleReportBySituation, sampleReportMetadata } from "@/components/marketing/SampleReportBySituation";
import report from "@/public/sample-reports/career-break.json";

// WorkspaceClient reads URL state, so the sample renders per request, as Jordan's does.
export const dynamic = "force-dynamic";

export const metadata = sampleReportMetadata("career-break");

export default function Page() {
  return <SampleReportBySituation slug="career-break" report={report} />;
}
