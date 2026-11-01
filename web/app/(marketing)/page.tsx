import type { Metadata } from "next";
import { LandingMineral } from "@/components/landing/LandingMineral";
import { FREE_REPORT_ENTITLEMENT } from "@/lib/billing/pricing";

const homepageDescription = "Get a free resume report with feedback on what recruiters may notice, which details need explanation, and up to three changes to make before you apply.";

// A shared link leads with the hero's story; search results keep the plain description.
const shareTitle = "See what a recruiter sees: free resume report";
const shareDescription = "Find the one thing to fix first. Your first report is free. No account or card.";
const shareImage = {
  url: "/og/home?v=20261101-2",
  width: 1200,
  height: 630,
  alt: "They called someone back. It wasn't you. A recruiter's screen marks the resume Not moving forward, with a note only the hiring team can read.",
};

export const metadata: Metadata = {
  title: "See What a Recruiter Sees: Free Resume Report",
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
      description: "Founder of Recruiter in Your Pocket. 14 years recruiting for companies including Google, Meta, and OpenAI.",
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
