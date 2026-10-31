import type { Metadata } from "next";
import ResearchClient from "@/components/research/ResearchClient";

export const metadata: Metadata = {
    title: "Hiring research",
    description: "Studies, recruiter experiments, and current hiring-platform documentation translated into useful resume decisions.",
};

export default function ResearchPage() {
    return <ResearchClient />;
}
