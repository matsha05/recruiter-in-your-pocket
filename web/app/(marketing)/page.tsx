import type { Metadata } from "next";
import LandingClient from "@/components/landing/LandingClient";

export const metadata: Metadata = {
  title: "Recruiter in Your Pocket — Free Resume Review from a Recruiter's Perspective",
  description: "See how recruiters actually read your resume. Get recruiter-grade feedback, stronger bullets, and clear next steps in minutes.",
  openGraph: {
    title: "See How Recruiters Actually Read Your Resume",
    description: "Get recruiter-grade feedback, stronger bullets, and clear next steps in minutes. Free audit, no signup required.",
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
    description: "Get recruiter-grade feedback, stronger bullets, and clear next steps in minutes. Free audit, no signup required.",
    images: ["https://recruiterinyourpocket.com/assets/og-image.png"],
  },
};

export default function LandingPage() {
  return <LandingClient />;
}


