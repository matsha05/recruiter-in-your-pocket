import type { Metadata } from "next";
import ResearchClient from "@/components/research/ResearchClient";

export const metadata: Metadata = {
    title: "Hiring Research | Recruiter in Your Pocket",
    description: "Evidence-based research on how recruiters actually read resumes, make decisions, and what you can do about it.",
};

export default function ResearchPage() {
    return <ResearchClient />;
}

