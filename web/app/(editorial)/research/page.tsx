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
            {/* The hub's order, machine-readable: the six beliefs, then the additional research. */}
            <JsonLd
                data={{
                    "@context": "https://schema.org",
                    "@graph": [
                        breadcrumbStructuredData([{ name: SECTION_NAMES[PATH], path: PATH }]),
                        itemListStructuredData(PATH, "What we look for", [
                            ...pillars.map((pillar) => ({ name: pillar.belief, path: pillarHref(pillar) })),
                            ...additionalResearch.map((article) => ({ name: article.question, path: article.href })),
                        ]),
                    ],
                }}
            />
            <ResearchHub />
        </>
    );
}
