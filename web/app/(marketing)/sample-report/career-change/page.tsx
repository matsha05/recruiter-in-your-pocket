import { SampleReportBySituation, sampleReportMetadata } from "@/components/marketing/SampleReportBySituation";
import report from "@/public/sample-reports/career-change.json";

// WorkspaceClient reads URL state, so the sample renders per request, as Jordan's does.
export const dynamic = "force-dynamic";

export const metadata = sampleReportMetadata("career-change");

export default function Page() {
  return <SampleReportBySituation slug="career-change" report={report} />;
}
