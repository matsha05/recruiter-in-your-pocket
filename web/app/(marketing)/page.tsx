import type { Metadata } from "next";
import { LandingMineral } from "@/components/landing/LandingMineral";
import { FREE_REPORT_ENTITLEMENT } from "@/lib/billing/pricing";

const homepageDescription = "A free resume report that shows what a recruiter takes from your resume, the lines they’d stop on, and what to add to each one before you apply.";

// A shared link leads with the hero's story; search results keep the plain description.
const shareTitle = "See what a recruiter sees: free resume report";
const shareDescription = "See what a recruiter sees, line by line. Your first report is free. No account or card.";
const shareImage = {
  url: "/og/home?v=20261104",
  width: 1200,
  height: 630,
  alt: "244 people applied for the job you wanted. A pile of 244 sheets of paper, eighteen of them green: the ones who got called back.",
};

export const metadata: Metadata = {
  title: { absolute: "See what a recruiter sees: free resume report" },
  description: homepageDescription,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: shareTitle,
    description: shareDescription,
    url: "https://www.recruiterinyourpocket.com/",
    siteName: "Recruiter in Your Pocket",
    images: [shareImage],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: shareTitle,
    description: shareDescription,
    images: [shareImage],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": "https://www.recruiterinyourpocket.com/#application",
      name: "Recruiter in Your Pocket",
      url: "https://www.recruiterinyourpocket.com/",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description: homepageDescription,
      offers: [
        {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          description: `${FREE_REPORT_ENTITLEMENT.promise} ${FREE_REPORT_ENTITLEMENT.boundary} No account required.`,
        },
        {
          "@type": "Offer",
          price: "29",
          priceCurrency: "USD",
          description: "Five additional resume reports over 90 days. One payment of $29, with no automatic renewal.",
        },
      ],
    },
  ],
};

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <LandingMineral />
    </>
  );
}
