import type { Metadata } from "next";
import { LandingEditorsDesk } from "@/components/landing-showcase/LandingEditorsDesk";

export const metadata: Metadata = {
  title: "Recruiter in Your Pocket — Free Recruiter Report on Your Resume",
  description: "Get the recruiter read on your resume. Clear feedback, stronger bullets, and the fixes worth making first.",
  openGraph: {
    title: "See How Recruiters Actually Read Your Resume",
    description: "Get the recruiter read on your resume. Real feedback, not a generic score. Your first report is free.",
    url: "https://recruiterinyourpocket.com/",
    siteName: "Recruiter in Your Pocket",
    images: [{
      url: "https://recruiterinyourpocket.com/assets/og-image.png",
      width: 1200,
      height: 630,
      alt: "Recruiter in Your Pocket - See what recruiters see"
    }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "See How Recruiters Actually Read Your Resume",
    description: "Get the recruiter read on your resume. Real feedback, not a generic score. Your first report is free.",
    images: ["https://recruiterinyourpocket.com/assets/og-image.png"],
  },
};

export default function LandingPage() {
  return <LandingEditorsDesk />;
}
