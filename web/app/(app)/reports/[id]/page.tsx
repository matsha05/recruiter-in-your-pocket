import { Metadata } from "next";
import ReportDetailClient from "@/components/reports/ReportDetailClient";

type ReportDetailPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Report — Recruiter in Your Pocket",
  description: "Detailed report view with evidence-backed recruiter feedback.",
};

export default async function ReportDetailPage({ params }: ReportDetailPageProps) {
  const { id } = await params;
  return <ReportDetailClient reportId={id} />;
}
