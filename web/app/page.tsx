import type { Metadata } from "next";
import LandingClient from "../components/landing/LandingClient";

export const metadata: Metadata = {
  title: "Recruiter in Your Pocket — Free Resume Review from a Recruiter's Perspective",
  description: "See how recruiters actually read your resume. Get recruiter-grade feedback, stronger bullets, and clear next steps in minutes. Built by a recruiter who's hired 1000+ at Google, Meta, and OpenAI.",
  openGraph: {
    title: "See How Recruiters Actually Read Your Resume",
    description: "Get recruiter-grade feedback, stronger bullets, and clear next steps in minutes. 2 free reports, no signup required.",
    url: "https://recruiterinyourpocket.com/",
    siteName: "Recruiter in Your Pocket",
    images: [{ url: "https://recruiterinyourpocket.com/assets/og-image.svg" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "See How Recruiters Actually Read Your Resume",
    description: "Get recruiter-grade feedback, stronger bullets, and clear next steps in minutes. 2 free reports, no signup required.",
    images: ["https://recruiterinyourpocket.com/assets/og-image.svg"],
  },
};

export default function LandingPage() {
  return <LandingClient />;
}


