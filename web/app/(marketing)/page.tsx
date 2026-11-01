import type { Metadata } from "next";
import { LandingMineral } from "@/components/landing/LandingMineral";
import { FREE_REPORT_ENTITLEMENT } from "@/lib/billing/pricing";

const homepageDescription = "Get a free resume report with feedback on what recruiters may notice, which details need explanation, and up to three changes to make before you apply.";

export const metadata: Metadata = {
  title: "See What a Recruiter Sees: Free Resume Report",
  description: homepageDescription,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "See what a recruiter sees.",
    description: homepageDescription,
    url: "https://www.recruiterinyourpocket.com/",
    siteName: "Recruiter in Your Pocket",
    images: ["/opengraph-image?v=20261030"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "See what a recruiter sees.",
    description: homepageDescription,
    images: ["/opengraph-image?v=20261030"],
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
      creator: {
        "@id": "https://www.recruiterinyourpocket.com/#matt-shaw",
      },
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
          description: "Five additional resume reports over 30 days. One payment of $29, with no automatic renewal.",
        },
      ],
    },
    {
      "@type": "Person",
      "@id": "https://www.recruiterinyourpocket.com/#matt-shaw",
      name: "Matt Shaw",
      url: "https://www.recruiterinyourpocket.com/#about",
      sameAs: ["https://www.linkedin.com/in/mattrshaw"],
      description: "Founder of Recruiter in Your Pocket with 14 years of recruiting and hiring experience.",
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
