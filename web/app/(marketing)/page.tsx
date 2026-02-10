import type { Metadata } from "next";
import { LandingEditorsDesk } from "@/components/landing-showcase/LandingEditorsDesk";

export const metadata: Metadata = {
  title: "Recruiter in Your Pocket — Free Resume Review from a Recruiter's Perspective",
  description: "See what a recruiter actually thinks of your resume. Real feedback, stronger bullets, and clear next steps — not a generic score.",
  openGraph: {
    title: "See How Recruiters Actually Read Your Resume",
    description: "See what a recruiter actually thinks of your resume. Real feedback, not a generic score. First review is free.",
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
    description: "See what a recruiter actually thinks of your resume. Real feedback, not a generic score. First review is free.",
    images: ["https://recruiterinyourpocket.com/assets/og-image.png"],
  },
};

export default function LandingPage() {
  return <LandingEditorsDesk />;
}

