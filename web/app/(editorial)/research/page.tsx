import type { Metadata } from "next";
import ResearchHub from "@/components/research/ResearchHub";

export const metadata: Metadata = {
    title: "Hiring research",
    description: "Studies, recruiter experiments, and current hiring-platform documentation translated into useful resume decisions.",
    alternates: { canonical: "/research" },
};

export default function ResearchPage() {
    return <ResearchHub />;
}
