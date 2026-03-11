import type { Metadata } from "next";
import PricingPageClient from "@/components/marketing/PricingPageClient";

export const metadata: Metadata = {
  title: "Pricing — Recruiter in Your Pocket",
  description:
    "Your first recruiter report is free. Paid plans add more reports, exports, saved history, and LinkedIn iterations."
};

export default function PricingPage() {
  return <PricingPageClient />;
}
