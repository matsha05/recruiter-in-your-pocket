import type { Metadata } from "next";
import PricingPageClient from "@/components/marketing/PricingPageClient";

export const metadata: Metadata = {
  title: "Pricing — Recruiter in Your Pocket",
  description:
    "Free first review, then monthly or lifetime access for repeated resume and LinkedIn iterations."
};

export default function PricingPage() {
  return <PricingPageClient />;
}
