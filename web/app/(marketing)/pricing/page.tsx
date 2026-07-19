import type { Metadata } from "next";
import PricingPageClient from "@/components/marketing/PricingPageClient";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Your first complete recruiter-style report is free. The $29 Job Search Pass adds five reports for 30 days with no automatic renewal."
};

export default function PricingPage() {
  return <PricingPageClient />;
}
