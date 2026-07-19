import type { Metadata } from "next";
import { LandingEditorsDesk } from "@/components/landing/LandingEditorsDesk";

export const metadata: Metadata = {
  title: "See What a Recruiter Sees First",
  description: "Get a clear first-pass review of what stands out, what needs more context, and what to change before you apply.",
  openGraph: {
    title: "See What a Recruiter Sees First",
    description: "Get a clear first-pass review of what stands out, what needs more context, and what to change before you apply.",
    url: "https://www.recruiterinyourpocket.com/",
    siteName: "Recruiter in Your Pocket",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "See What a Recruiter Sees First",
    description: "Get a clear first-pass review of what stands out, what needs more context, and what to change before you apply.",
  },
};

export default function LandingPage() {
  return <LandingEditorsDesk />;
}
