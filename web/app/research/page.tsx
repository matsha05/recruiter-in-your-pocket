import type { Metadata } from "next";
import ResearchClient from "@/components/research/ResearchClient";

export const metadata: Metadata = {
    title: "Hiring Research | Recruiter in Your Pocket",
    description: "A curated library on how recruiters read resumes, make decisions, and how to respond.",
};

export default function ResearchPage() {
    return <ResearchClient />;
}
