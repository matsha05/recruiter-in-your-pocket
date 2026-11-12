import type { Metadata } from "next";
import Footer from "@/components/landing/Footer";
import WorkspaceClient from "@/components/workspace/WorkspaceClient";
import { SamplePersonProvider } from "@/components/workspace/report/SamplePerson";
import type { ReportData } from "@/components/workspace/report/ReportTypes";
import { SAMPLE_REPORTS, sampleBySlug, samplePath } from "@/lib/reports/sample-reports";

/**
 * One sample report by situation (Nov 11, 2026; lib/reports/sample-reports.ts). Each has a page file of its own
 * under app/(marketing)/sample-report, like every public page, and renders through this.
 */
export function sampleReportMetadata(slug: string): Metadata {
  const sample = sampleBySlug(slug);
  if (!sample) return {};
  const title = `Sample report: ${sample.situation.toLowerCase()}`;
  return {
    title,
    description: sample.description,
    alternates: { canonical: samplePath(sample) },
    openGraph: { title, description: sample.description, url: `https://www.recruiterinyourpocket.com${samplePath(sample)}`, images: ["/opengraph-image?v=20261104"], type: "website" },
    twitter: { card: "summary_large_image", title, description: sample.description, images: ["/opengraph-image?v=20261104"] },
  };
}

export function SampleReportBySituation({ slug, report }: { slug: string; report: unknown }) {
  const sample = sampleBySlug(slug);
  if (!sample) throw new Error(`Unknown sample report: ${slug}`);
  return (
    <>
      <div className="sample-report-page-shell">
        <SamplePersonProvider value={{ person: sample.person, samples: SAMPLE_REPORTS.map((other) => ({ href: samplePath(other), label: other.situation, current: other.slug === slug })) }}>
          <WorkspaceClient initialReport={report as ReportData} />
        </SamplePersonProvider>
      </div>
      <Footer />
    </>
  );
}
