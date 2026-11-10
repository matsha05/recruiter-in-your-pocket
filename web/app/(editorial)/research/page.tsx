import { pageMetadata } from "@/lib/seo/metadata";
import ResearchHub from "@/components/research/ResearchHub";
import { additionalResearch, pillarHref, pillars } from "@/components/research/ResearchHubData";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbStructuredData, SECTION_NAMES } from "@/lib/seo/site";
import { itemListStructuredData } from "@/lib/seo/structured-data";

const PATH = "/research";

export const metadata = pageMetadata({
    path: PATH,
    title: "What recruiters look for, and the research behind it",
    description: "Recruiters on what we look for in a resume: your story, your impact, how we read, the ATS, referrals and the offer. Each belief with the studies behind it.",
});

export default function ResearchPage() {
    return (
        <>
            {/* The hub's order, machine-readable. */}
            <JsonLd
                data={{
                    "@context": "https://schema.org",
                    "@graph": [
                        breadcrumbStructuredData([{ name: SECTION_NAMES[PATH], path: PATH }]),
                        // Each belief, then the answers under it, then the additional research: the whole library in the
                        // hub's order, though the page itself shows only the beliefs.
                        itemListStructuredData(PATH, "What we look for", [
                            ...pillars.flatMap((pillar) => [
                                { name: pillar.belief, path: pillarHref(pillar) },
                                ...pillar.articles.map((article) => ({ name: article.title ?? article.question, path: article.href })),
                            ]),
                            ...additionalResearch.map((article) => ({ name: article.question, path: article.href })),
                        ]),
                    ],
                }}
            />
            <ResearchHub />
        </>
    );
}
