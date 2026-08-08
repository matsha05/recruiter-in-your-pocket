import type { Metadata } from "next";
import PricingPageClient from "@/components/marketing/PricingPageClient";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Your first complete recruiter-style report is free. The $29 Job Search Pass adds five careful reports for important revisions and applications over 30 days, with no automatic renewal.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "One Free Resume Report, Then Five Careful Reports for $29",
    description: "Start with one free report. Add five careful reports for important revisions and applications over 30 days. One payment, no renewal.",
    url: "https://www.recruiterinyourpocket.com/pricing",
    images: ["/opengraph-image?v=20260730"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "One Free Resume Report, Then Five Careful Reports for $29",
    description: "Five careful reports for important revisions and applications over 30 days. One payment, no renewal.",
    images: ["/opengraph-image?v=20260730"],
  },
};

export default function PricingPage() {
  return <PricingPageClient />;
}
