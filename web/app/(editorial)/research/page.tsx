import { pageMetadata } from "@/lib/seo/metadata";
import ResearchHub from "@/components/research/ResearchHub";
import { hubAnswers } from "@/components/research/ResearchHubData";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbStructuredData, SECTION_NAMES } from "@/lib/seo/site";
import { itemListStructuredData } from "@/lib/seo/structured-data";

const PATH = "/research";

export const metadata = pageMetadata({
    path: PATH,
    title: "Resume and hiring research: the questions job seekers ask",
    description: "Does one typo sink you? Do recruiters really give it six seconds? Short answers from studies, recruiter experiments, and platform documentation, with sources.",
});

export default function ResearchPage() {
    return (
        <>
            {/* The hub's order, machine-readable: the questions in the order the page asks them. */}
            <JsonLd
                data={{
                    "@context": "https://schema.org",
                    "@graph": [
                        breadcrumbStructuredData([{ name: SECTION_NAMES[PATH], path: PATH }]),
                        itemListStructuredData(PATH, "The questions job seekers ask", hubAnswers.map((article) => ({ name: article.title ?? article.question, path: article.href }))),
                    ],
                }}
            />
            <ResearchHub />
        </>
    );
}
