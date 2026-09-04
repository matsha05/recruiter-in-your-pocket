import type { Metadata } from "next";
import PricingPageClient from "@/components/marketing/PricingPageClient";
import { normalizeCheckoutReturnTo } from "@/lib/billing/checkoutReturn";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Your first complete resume report is free. The $29 Job Search Pass adds five reports to compare revisions or review applications over 30 days, with no automatic renewal.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "Your First Resume Report Is Free. Five More Are $29.",
    description: "Compare revisions or review your next applications with five additional reports over 30 days. One payment, no automatic renewal.",
    url: "https://www.recruiterinyourpocket.com/pricing",
    images: ["/opengraph-image?v=20260730"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Your First Resume Report Is Free. Five More Are $29.",
    description: "Five additional reports to compare revisions or review applications over 30 days. One payment, no automatic renewal.",
    images: ["/opengraph-image?v=20260730"],
  },
};

export default async function PricingPage({ searchParams }: {
  searchParams: Promise<{ returnTo?: string | string[]; payment?: string | string[] }>;
}) {
  const params = await searchParams;
  return <PricingPageClient returnTo={normalizeCheckoutReturnTo(params.returnTo)} paymentCancelled={params.payment === "cancelled"} />;
}
