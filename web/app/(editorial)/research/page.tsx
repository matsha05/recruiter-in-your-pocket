import { pageMetadata } from "@/lib/seo/metadata";
import ResearchHub from "@/components/research/ResearchHub";

export const metadata = pageMetadata({
    path: "/research",
    title: "Resume and hiring research: the questions job seekers ask",
    description: "Does one typo sink you? Do recruiters really give it six seconds? Short answers from studies, recruiter experiments, and platform documentation, with sources.",
});

export default function ResearchPage() {
    return <ResearchHub />;
}
