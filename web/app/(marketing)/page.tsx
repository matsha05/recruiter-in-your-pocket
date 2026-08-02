import type { Metadata } from "next";
import { LandingEditorsDesk } from "@/components/landing/LandingEditorsDesk";
import { FREE_REPORT_ENTITLEMENT } from "@/lib/billing/pricing";

const homepageDescription = "Get a free recruiter-style first read of your résumé: the exact lines that raise questions and up to three prioritized changes to make before you apply.";

export const metadata: Metadata = {
  title: "AI Résumé Feedback Shaped by a Recruiter",
  description: homepageDescription,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "You Did the Work. Let's Make Sure They See It.",
    description: homepageDescription,
    url: "https://www.recruiterinyourpocket.com/",
    siteName: "Recruiter in Your Pocket",
    images: ["/opengraph-image?v=20260729"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "You Did the Work. Let's Make Sure They See It.",
    description: homepageDescription,
    images: ["/opengraph-image?v=20260729"],
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
          description: "Five additional careful recruiter-style résumé reports over 30 days with no recurring subscription.",
        },
      ],
    },
    {
      "@type": "Person",
      "@id": "https://www.recruiterinyourpocket.com/#matt-shaw",
      name: "Matt Shaw",
      url: "https://www.recruiterinyourpocket.com/#lift-credibility-title",
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
      <LandingEditorsDesk />
    </>
  );
}
